import sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { app } from 'electron';  // Importando o 'app' do Electron

// Abre o banco de dados SQLite com o sqlite
const openDatabase = async () => {
  const db = await sqlite.open({
    filename: path.join(app.getPath('userData'), 'database', 'user_data.db'),  // Usando o 'userData' para o caminho correto
    driver: sqlite3.Database
  });

  // Função para criar a tabela de usuários se não existir
  await db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');

  return db;
};

// Funções CRUD

// Criar usuário
const createUser = async (name: string) => {
  const db = await openDatabase();
  const result = await db.run('INSERT INTO users (name) VALUES (?)', [name]);
  return { id: result.lastID, name };
};

// Ler todos os usuários
const getUsers = async () => {
  const db = await openDatabase();
  const rows = await db.all('SELECT * FROM users');
  return rows;
};

// Atualizar usuário
const updateUser = async (id: number, name: string) => {
  const db = await openDatabase();
  await db.run('UPDATE users SET name = ? WHERE id = ?', [name, id]);
  return { id, name };
};

// Deletar usuário
const deleteUser = async (id: number) => {
  const db = await openDatabase();
  await db.run('DELETE FROM users WHERE id = ?', [id]);
  return { id };
};
