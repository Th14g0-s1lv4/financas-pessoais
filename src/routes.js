const express = require('express');
const router  = express.Router();
const db      = require('./database');

// Listar todas as transações (com filtro opcional por mês)
router.get('/transacoes', (req, res) => {
  const { mes } = req.query;
  let rows;

  if (mes) {
    rows = db.prepare(`
      SELECT * FROM transacoes
      WHERE strftime('%Y-%m', data) = ?
      ORDER BY data DESC
    `).all(mes);
  } else {
    rows = db.prepare(`
      SELECT * FROM transacoes
      ORDER BY data DESC
    `).all();
  }

  res.json(rows);
});

// Criar nova transação
router.post('/transacoes', (req, res) => {
  const { descricao, valor, tipo, categoria, data } = req.body;
  const stmt = db.prepare(`
    INSERT INTO transacoes (descricao, valor, tipo, categoria, data)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(descricao, valor, tipo, categoria, data);
  res.status(201).json({ id: result.lastInsertRowid });
});

// Deletar transação
router.delete('/transacoes/:id', (req, res) => {
  db.prepare('DELETE FROM transacoes WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

// Resumo: total de receitas, despesas e saldo
router.get('/resumo', (req, res) => {
  const resumo = db.prepare(`
    SELECT
      SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) AS total_receitas,
      SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) AS total_despesas,
      SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END) AS saldo
    FROM transacoes
  `).get();
  res.json(resumo);
});

router.get('/despesas', (req, res) => {
  const despesas = db.prepare(`
    SELECT * FROM transacoes
    WHERE tipo = 'despesa'
    ORDER BY data DESC
  `).all();
  res.json(despesas);
});

module.exports = router;