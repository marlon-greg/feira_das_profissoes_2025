-- Tabela de palestras
CREATE TABLE lectures (
    id TEXT PRIMARY KEY,
    day INTEGER NOT NULL,
    time TEXT NOT NULL,
    room TEXT NOT NULL,
    title TEXT NOT NULL,
    speaker TEXT NOT NULL,
    capacity INTEGER DEFAULT 25
);

-- Tabela de inscrições
CREATE TABLE registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    rm TEXT NOT NULL,
    email TEXT NOT NULL,
    birthDate TEXT NOT NULL,
    studentClass TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

-- Tabela de junção entre inscrições e palestras
CREATE TABLE registration_lectures (
    registration_id INTEGER NOT NULL,
    lecture_id TEXT NOT NULL,
    FOREIGN KEY (registration_id) REFERENCES registrations(id),
    FOREIGN KEY (lecture_id) REFERENCES lectures(id),
    PRIMARY KEY (registration_id, lecture_id)
);

-- Tabela de usuários/admins
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, 
    is_admin INTEGER DEFAULT 1 
);

-- Tabela de configurações
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Dados iniciais
INSERT INTO users (username, password_hash, is_admin) VALUES 
('admin', '$2a$10$nd0vLr5YQ8QUZQibDryeZO9wpUzZvgQsxXXL5isbtjnaObSAh4vhO', 1), -- senha: admin
('visitante', '$2a$10$w8nC.OUv3TXq0TTg22C8NuXt2u4GvT/aFXYtX08AvALe1DS6k6nOC', 0); -- senha: visitante

INSERT INTO settings (key, value) VALUES ('registrations_open', '1');