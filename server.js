import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuração Inicial ---
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'SEGREDO_SUPER_SECRETO_PARA_PROJETO_FEIRA_2025'; // Troque por uma chave segura

// Middlewares
app.use(express.json());

// Configuração para servir arquivos estáticos (o frontend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));

// --- Conexão com o Banco de Dados ---
let db;
(async () => {
  try {
    db = await open({
      filename: './feira.db',
      driver: sqlite3.Database
    });
    console.log('Conectado ao banco de dados SQLite.');
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  }
})();

// --- Middleware de Autenticação JWT ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // Não autorizado

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token inválido/expirado
    req.user = user;
    next();
  });
};


// --- Rotas da API ---

// Rota de Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    }

    // Compara a senha enviada com o hash salvo no banco
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    }

    // Gera o Token JWT
    const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.is_admin }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });

  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.', error: err.message });
  }
});

// Rota para buscar todas as palestras (pública)
app.get('/api/lectures', async (req, res) => {
  try {
    const lectures = await db.all('SELECT * FROM lectures ORDER BY day, time');
    res.json(lectures);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar palestras.', error: err.message });
  }
});

// Rota para registrar um aluno em palestras
app.post('/api/register', async (req, res) => {
    const { fullName, rm, email, birthDate, studentClass, selectedLectures } = req.body;

    if (!fullName || !rm || !email || !birthDate || !studentClass || !selectedLectures) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Verifica se o email ou RM já foi cadastrado
        const existing = await db.get('SELECT id FROM registrations WHERE email = ? OR rm = ?', [email, rm]);
        if (existing) {
            return res.status(409).json({ message: 'Este e-mail ou RM já foi utilizado para uma inscrição.' });
        }

        // Inicia uma transação para garantir a integridade dos dados
        await db.run('BEGIN TRANSACTION');

        const result = await db.run(
            'INSERT INTO registrations (fullName, rm, email, birthDate, studentClass, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
            [fullName, rm, email, birthDate, studentClass, new Date().toISOString()]
        );
        const registrationId = result.lastID;

        for (const lectureId of Object.values(selectedLectures)) {
            await db.run(
                'INSERT INTO registration_lectures (registration_id, lecture_id) VALUES (?, ?)',
                [registrationId, lectureId]
            );
        }

        await db.run('COMMIT');
        res.status(201).json({ message: 'Inscrição realizada com sucesso!', registrationId });

    } catch (err) {
        await db.run('ROLLBACK');
        res.status(500).json({ message: 'Erro ao processar inscrição.', error: err.message });
    }
});

// Rota para obter a contagem de inscritos por palestra
app.get('/api/lecture-counts', async (req, res) => {
    try {
        const counts = await db.all(`
            SELECT lecture_id as id, COUNT(registration_id) as count
            FROM registration_lectures
            GROUP BY lecture_id
        `);
        // Converte o array de objetos para um objeto chave-valor para fácil acesso no frontend
        const countsMap = counts.reduce((acc, item) => {
            acc[item.id] = item.count;
            return acc;
        }, {});
        res.json(countsMap);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar contagem de inscrições.', error: err.message });
    }
});


// --- Rotas de Admin (Protegidas) ---

// Adicionar palestra
app.post('/api/lectures', authenticateToken, async (req, res) => {
    const { day, time, room, title, speaker, capacity } = req.body;
    const id = `${day}-${time}-${room}`.replace(/\s+/g, '-').toLowerCase(); // Gera um ID único
    try {
        await db.run(
            'INSERT INTO lectures (id, day, time, room, title, speaker, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, day, time, room, title, speaker, capacity || 25]
        );
        res.status(201).json({ message: 'Palestra adicionada com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao adicionar palestra.', error: err.message });
    }
});

// Atualizar palestra
app.put('/api/lectures/:id', authenticateToken, async (req, res) => {
    const { day, time, room, title, speaker, capacity } = req.body;
    try {
        await db.run(
            'UPDATE lectures SET day = ?, time = ?, room = ?, title = ?, speaker = ?, capacity = ? WHERE id = ?',
            [day, time, room, title, speaker, capacity, req.params.id]
        );
        res.status(200).json({ message: 'Palestra atualizada com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao atualizar palestra.', error: err.message });
    }
});

// Deletar palestra
app.delete('/api/lectures/:id', authenticateToken, async (req, res) => {
    try {
        await db.run('DELETE FROM lectures WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Palestra removida com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao remover palestra.', error: err.message });
    }
});

// --- Rota "Catch-all" para o Frontend ---
// Isso garante que o app React (index.html) seja servido para qualquer rota que não seja da API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


// --- Iniciar o Servidor ---
// Para desenvolvimento local, não para Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

// Exporta o app para ser usado pela Vercel como Serverless Function
export default app;