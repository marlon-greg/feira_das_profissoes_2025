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
    const lectures = await db.all('SELECT * FROM lectures ORDER BY day, time, CAST(room AS INTEGER)');
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

app.get('/api/registrations', authenticateToken, async (req, res) => {
    try {
        const registrations = await db.all(`
            SELECT r.id, r.fullName, r.rm, r.email, r.studentClass, l.id as lectureId, l.title as lectureTitle, l.day, l.time
            FROM registrations r
            LEFT JOIN registration_lectures rl ON r.id = rl.registration_id
            LEFT JOIN lectures l ON rl.lecture_id = l.id
            ORDER BY r.fullName, l.day, l.time
        `);
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar inscrições.', error: err.message });
    }
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

app.put('/api/settings/registrations-status', authenticateToken, isFullAdmin, async (req, res) => {
    try {
        const { isOpen } = req.body;
        await db.run("UPDATE settings SET value = ? WHERE key = 'registrations_open'", [isOpen ? '1' : '0']);
        res.json({ message: 'Status das inscrições alterado com sucesso!', isOpen });
    } catch (err) { res.status(500).json({ message: 'Erro ao alterar status das inscrições.' }); }
});

app.post('/api/lectures', authenticateToken, isFullAdmin, async (req, res) => {
    const { day, time, room, title, speaker, capacity } = req.body;
    const id = `${day}-${time}-${room}`.replace(/[\s:]+/g, '-').toLowerCase();
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

app.put('/api/lectures/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { day, time, room, title, speaker, capacity } = req.body;
    try {
        await db.run(
            'UPDATE lectures SET day = ?, time = ?, room = ?, title = ?, speaker = ?, capacity = ? WHERE id = ?',
            [day, time, room, title, speaker, capacity, id]
        );
        res.status(200).json({ message: 'Palestra atualizada com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao atualizar palestra.', error: err.message });
    }
});

app.delete('/api/lectures/:id', authenticateToken, isFullAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.run('DELETE FROM lectures WHERE id = ?', [id]);
        res.status(200).json({ message: 'Palestra removida com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao remover palestra.', error: err.message });
    }
});

app.get('/api/export/csv', authenticateToken, async (req, res) => {
    try {
        const query = `SELECT l.day, l.time, l.room, l.title, l.speaker, r.fullName, r.rm, r.email, r.studentClass FROM lectures l JOIN registration_lectures rl ON l.id = rl.lecture_id JOIN registrations r ON r.id = rl.registration_id ORDER BY l.day, l.time, l.title, r.fullName;`;
        const data = await db.all(query);
        if (data.length === 0) return res.status(404).send('Nenhuma inscrição encontrada para exportar.');
        const header = "Dia,Horario,Sala,Palestra,Palestrante,NomeCompleto,RM,Email,Turma\n";
        const rows = data.map(r => `${r.day},${r.time},"${r.room}","${r.title}","${r.speaker}","${r.fullName}",${r.rm},"${r.email}","${r.studentClass}"`).join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=lista_de_presenca.csv');
        res.status(200).send(Buffer.from(header + rows, 'utf-8'));
    } catch (err) { res.status(500).json({ message: 'Erro ao gerar o arquivo CSV.', error: err.message }); }
});

app.get('/api/lectures/:id/registrations', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const registrations = await db.all(`SELECT r.id, r.fullName, r.rm, r.email, r.studentClass FROM registrations r JOIN registration_lectures rl ON r.id = rl.registration_id WHERE rl.lecture_id = ? ORDER BY r.fullName`, [id]);
        res.json(registrations);
    } catch (err) { res.status(500).json({ message: 'Erro ao buscar inscritos.', error: err.message }); }
});

app.delete('/api/registrations/:registrationId/lectures/:lectureId', authenticateToken, isFullAdmin, async (req, res) => {
    const { registrationId, lectureId } = req.params;
    if (!registrationId || !lectureId) {
        return res.status(400).json({ message: 'IDs inválidos.' });
    }
    try {
        await db.run('BEGIN TRANSACTION');
        await db.run('DELETE FROM registration_lectures WHERE registration_id = ? AND lecture_id = ?', [registrationId, lectureId]);
        const remaining = await db.get('SELECT COUNT(*) as count FROM registration_lectures WHERE registration_id = ?', [registrationId]);
        if (remaining.count === 0) {
            await db.run('DELETE FROM registrations WHERE id = ?', [registrationId]);
        }
        await db.run('COMMIT');
        res.status(200).json({ message: 'Inscrição na palestra removida com sucesso.' });
    } catch (err) {
        await db.run('ROLLBACK');
        res.status(500).json({ message: 'Erro ao remover inscrição.', error: err.message });
    }
});

app.get('/api/users', authenticateToken, isFullAdmin, async (req, res) => {
    const users = await db.all('SELECT id, username, is_admin FROM users');
    res.json(users);
});

app.post('/api/users', authenticateToken, isFullAdmin, async (req, res) => {
    const { username, password, isAdmin } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    try {
        await db.run('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)', [username, password_hash, isAdmin ? 1 : 0]);
        res.status(201).json({ message: 'Usuário criado com sucesso.' });
    } catch (e) {
        res.status(409).json({ message: 'Nome de usuário já existe.' });
    }
});

app.put('/api/users/:id', authenticateToken, isFullAdmin, async (req, res) => {
    const { username, isAdmin } = req.body;
    await db.run('UPDATE users SET username = ?, is_admin = ? WHERE id = ?', [username, isAdmin ? 1 : 0, req.params.id]);
    res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
});

app.delete('/api/users/:id', authenticateToken, isFullAdmin, async (req, res) => {
    if (req.user.id == req.params.id) return res.status(403).json({ message: 'Você não pode excluir seu próprio usuário.' });
    await db.run('DELETE FROM users WHERE id = ?', req.params.id);
    res.status(200).json({ message: 'Usuário excluído com sucesso.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => { console.log(`Servidor rodando na porta ${PORT}`); });
}

export default app;