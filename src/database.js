const Database = require('better-sqlite3');
const db = new Database('financas.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS transacoes (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT    NOT NULL,
    valor     REAL    NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('receita', 'despesa')),
    categoria TEXT    NOT NULL,
    data      TEXT    NOT NULL
  )
`);

module.exports = db;