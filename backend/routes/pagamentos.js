const express = require("express");
const pool = require("../db");
const router = express.Router();

// Registrar pagamento para um pedido
router.post("/", async (req, res) => {
  const { pedido_id, forma_pagamento, valor } = req.body;
  if (!pedido_id || !forma_pagamento || valor == null)
    return res
      .status(400)
      .json({ erro: "pedido_id, forma_pagamento e valor são obrigatórios" });
  if (!["pix", "debito", "credito"].includes(forma_pagamento))
    return res.status(400).json({ erro: "forma_pagamento inválida" });
  try {
    const [result] = await pool.query(
      "INSERT INTO pagamentos (pedido_id, forma_pagamento, valor, confirmado) VALUES (?, ?, ?, 1)",
      [pedido_id, forma_pagamento, valor]
    );
    res
      .status(201)
      .json({ mensagem: "Pagamento registrado", id: result.insertId });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao registrar pagamento" });
  }
});

// Listar pagamentos
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, pedido_id, forma_pagamento, valor, confirmado, criado_em FROM pagamentos ORDER BY criado_em DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar pagamentos" });
  }
});

// Buscar pagamentos de um pedido
router.get("/pedido/:pedido_id", async (req, res) => {
  const { pedido_id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id, forma_pagamento, valor, confirmado, criado_em FROM pagamentos WHERE pedido_id = ?",
      [pedido_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar pagamentos do pedido" });
  }
});

module.exports = router;
