import express from "express";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

const db = new sqlite3.Database("./feira.db");

// Middleware de autenticação JWT para admin
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token ausente" });
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, "sesi2025");
    if (!decoded.is_admin)
      return res.status(403).json({ error: "Acesso negado" });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// Login admin
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Tentativa de login:", { username, password }); // log recebido
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      console.log("Erro no banco:", err);
      return res.status(500).json({ error: "Erro no banco" });
    }
    console.log("Usuário encontrado:", user); // log do usuário do banco
    if (!user) {
      console.log("Usuário não encontrado.");
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }
    const senhaCorreta = bcrypt.compareSync(password, user.password_hash);
    console.log("Senha correta?", senhaCorreta); // log do resultado do bcrypt
    if (!senhaCorreta) {
      console.log("Senha incorreta.");
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin },
      "sesi2025",
      { expiresIn: "8h" }
    );
    console.log("Login bem-sucedido, token gerado.");
    res.json({ token });
  });
});

// Listar palestras
app.get("/api/lectures", (req, res) => {
  db.all("SELECT * FROM lectures", (err, rows) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar palestras" });
    res.json(rows);
  });
});

// Criar palestra (admin)
app.post("/api/lectures", auth, (req, res) => {
  const { day, time, room, title, speaker, capacity } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  db.run(
    "INSERT INTO lectures (id, day, time, room, title, speaker, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, day, time, room, title, speaker, capacity || 25],
    function (err) {
      if (err) return res.status(500).json({ error: "Erro ao criar palestra" });
      res.json({ id });
    }
  );
});

// Editar palestra (admin)
app.put("/api/lectures/:id", auth, (req, res) => {
  const { day, time, room, title, speaker, capacity } = req.body;
  db.run(
    "UPDATE lectures SET day=?, time=?, room=?, title=?, speaker=?, capacity=? WHERE id=?",
    [day, time, room, title, speaker, capacity, req.params.id],
    function (err) {
      if (err)
        return res.status(500).json({ error: "Erro ao editar palestra" });
      res.json({ success: true });
    }
  );
});

// Remover palestra (admin)
app.delete("/api/lectures/:id", auth, (req, res) => {
  db.run("DELETE FROM lectures WHERE id=?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Erro ao remover palestra" });
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
