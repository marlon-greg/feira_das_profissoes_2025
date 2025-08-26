import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'SEGREDO_SUPER_SECRETO_PARA_PROJETO_FEIRA_2025';

app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));

let db;
(async () => {
  try {
    db = await open({ filename: './feira.db', driver: sqlite3.Database });
    console.log('Conectado ao banco de dados SQLite.');
  } catch (err) { console.error('Erro ao conectar ao banco de dados:', err.message); }
})();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  if (token == null && req.query.token) token = req.query.token;
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const isFullAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin === 1) {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado. Permissão de administrador necessária.' });
    }
};

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.is_admin }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) { res.status(500).json({ message: 'Erro no servidor.', error: err.message }); }
});

app.get('/api/lectures', async (req, res) => {
  try {
    const lectures = await db.all('SELECT * FROM lectures ORDER BY day, time');
    res.json(lectures);
  } catch (err) { res.status(500).json({ message: 'Erro ao buscar palestras.', error: err.message }); }
});

app.get('/api/lecture-counts', async (req, res) => {
  try {
    const counts = await db.all(`SELECT lecture_id as id, COUNT(registration_id) as count FROM registration_lectures GROUP BY lecture_id`);
    const countsMap = counts.reduce((acc, item) => ({...acc, [item.id]: item.count}), {});
    res.json(countsMap);
  } catch (err) { res.status(500).json({ message: 'Erro ao buscar contagem de inscrições.', error: err.message }); }
});

app.post('/api/register', async (req, res) => {
    try {
        const setting = await db.get("SELECT value FROM settings WHERE key = 'registrations_open'");
        if (setting.value !== '1') {
            return res.status(403).json({ message: 'As inscrições estão encerradas no momento.' });
        }
        
        const { fullName, rm, email, birthDate, studentClass, selectedLectures } = req.body;
        
        const existing = await db.get('SELECT id FROM registrations WHERE email = ? OR rm = ?', [email, rm]);
        if (existing) return res.status(409).json({ message: 'Este e-mail ou RM já foi utilizado.' });

        await db.run('BEGIN TRANSACTION');

        // **NOVA VALIDAÇÃO DE CAPACIDADE**
        for (const lectureId of Object.values(selectedLectures)) {
            const lecture = await db.get('SELECT capacity FROM lectures WHERE id = ?', lectureId);
            const countResult = await db.get('SELECT COUNT(*) as count FROM registration_lectures WHERE lecture_id = ?', lectureId);
            if (countResult.count >= lecture.capacity) {
                await db.run('ROLLBACK');
                return res.status(409).json({ message: `A palestra selecionada (${lectureId}) não possui mais vagas.` });
            }
        }
        
        const result = await db.run('INSERT INTO registrations (fullName, rm, email, birthDate, studentClass, timestamp) VALUES (?, ?, ?, ?, ?, ?)', [fullName, rm, email, birthDate, studentClass, new Date().toISOString()]);
        for (const lectureId of Object.values(selectedLectures)) {
            await db.run('INSERT INTO registration_lectures (registration_id, lecture_id) VALUES (?, ?)', [result.lastID, lectureId]);
        }
        await db.run('COMMIT');
        res.status(201).json({ message: 'Inscrição realizada com sucesso!', registrationId: result.lastID });
    } catch (err) {
        await db.run('ROLLBACK');
        res.status(500).json({ message: 'Erro ao processar inscrição.', error: err.message });
    }
});

app.get('/api/settings/registrations-status', async (req, res) => {
    try {
        const setting = await db.get("SELECT value FROM settings WHERE key = 'registrations_open'");
        res.json({ isOpen: setting.value === '1' });
    } catch (err) { res.status(500).json({ message: 'Erro ao buscar status das inscrições.' }); }
});

// --- ROTAS PROTEGIDAS ---
app.put('/api/settings/registrations-status', authenticateToken, isFullAdmin, async (req, res) => {
    try {
        const { isOpen } = req.body;
        await db.run("UPDATE settings SET value = ? WHERE key = 'registrations_open'", [isOpen ? '1' : '0']);
        res.json({ message: 'Status das inscrições alterado com sucesso!', isOpen });
    } catch (err) { res.status(500).json({ message: 'Erro ao alterar status das inscrições.' }); }
});

app.post('/api/lectures', authenticateToken, isFullAdmin, async (req, res) => { /* ... seu código ... */ });
app.delete('/api/lectures/:id', authenticateToken, isFullAdmin, async (req, res) => { /* ... seu código ... */ });

app.get('/api/export/csv', authenticateToken, async (req, res) => { /* ... seu código ... */ });

// Rota de inscritos atualizada para incluir o ID da inscrição
app.get('/api/lectures/:id/registrations', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const registrations = await db.all(`
            SELECT r.id, r.fullName, r.rm, r.email, r.studentClass 
            FROM registrations r 
            JOIN registration_lectures rl ON r.id = rl.registration_id 
            WHERE rl.lecture_id = ? 
            ORDER BY r.fullName`, [id]);
        res.json(registrations);
    } catch (err) { res.status(500).json({ message: 'Erro ao buscar inscritos.', error: err.message }); }
});

// **NOVA ROTA PARA DELETAR INSCRIÇÃO**
app.delete('/api/registrations/:id', authenticateToken, isFullAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.run('BEGIN TRANSACTION');
        // Deleta a referência na tabela de junção
        await db.run('DELETE FROM registration_lectures WHERE registration_id = ?', id);
        // Deleta a inscrição principal
        await db.run('DELETE FROM registrations WHERE id = ?', id);
        await db.run('COMMIT');
        res.status(200).json({ message: 'Inscrição removida com sucesso.' });
    } catch (err) {
        await db.run('ROLLBACK');
        res.status(500).json({ message: 'Erro ao remover inscrição.', error: err.message });
    }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => { console.log(`Servidor rodando na porta ${PORT}`); });
}
export default app;