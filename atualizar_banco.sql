-- Script para ATUALIZAR seu banco de dados sem perder dados existentes

-- Cria a tabela de configurações APENAS SE ELA NÃO EXISTIR
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Insere a configuração inicial APENAS SE ELA NÃO EXISTIR (ignora se a chave já existe)
INSERT OR IGNORE INTO settings (key, value) VALUES ('registrations_open', '1');

-- Garante que o usuário 'visitante' exista (ignora se o username já existe)
INSERT OR IGNORE INTO users (username, password_hash, is_admin) VALUES 
('visitante', '$2a$10$w8nC.OUv3TXq0TTg22C8NuXt2u4GvT/aFXYtX08AvALe1DS6k6nOC', 0);