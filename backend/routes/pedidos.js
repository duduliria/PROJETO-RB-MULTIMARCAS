const express = require("express");
const pool = require("../db");
const router = express.Router();

// Criar pedido com itens (usa transação)
router.post("/", async (req, res) => {
  const { usuario_id, endereco_entrega, itens } = req.body;
  if (
    !usuario_id ||
    !endereco_entrega ||
    !Array.isArray(itens) ||
    itens.length === 0
  ) {
    return res
      .status(400)
      .json({
        erro: "usuario_id, endereco_entrega e itens (array) são obrigatórios",
      });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [resultPedido] = await conn.query(
      "INSERT INTO pedidos (usuario_id, endereco_entrega) VALUES (?, ?)",
      [usuario_id, endereco_entrega]
    );
    const pedidoId = resultPedido.insertId;

    for (const item of itens) {
      const { produto_id, quantidade, preco_unitario } = item;
      if (!produto_id || !quantidade || preco_unitario == null)
        throw new Error("Item inválido");
      await conn.query(
        "INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
        [pedidoId, produto_id, quantidade, preco_unitario]
      );
    }

    await conn.commit();
    res.status(201).json({ mensagem: "Pedido criado", pedido_id: pedidoId });
  } catch (err) {
    await conn.rollback();
    res
      .status(500)
      .json({ erro: "Erro ao criar pedido", detalhe: err.message });
  } finally {
    conn.release();
  }
});

// Listar todos os pedidos
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT p.id, p.usuario_id, p.endereco_entrega, p.status, p.criado_em, GROUP_CONCAT(CONCAT(ip.produto_id,':',ip.quantidade) SEPARATOR ',') AS itens FROM pedidos p LEFT JOIN itens_pedido ip ON p.id = ip.pedido_id GROUP BY p.id ORDER BY p.criado_em DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar pedidos" });
  }
});

// Buscar pedido por id (inclui itens)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [pedidos] = await pool.query(
      "SELECT id, usuario_id, endereco_entrega, status, criado_em FROM pedidos WHERE id = ?",
      [id]
    );
    if (pedidos.length === 0)
      return res.status(404).json({ erro: "Pedido não encontrado" });
    const pedido = pedidos[0];
    const [itens] = await pool.query(
      "SELECT id, produto_id, quantidade, preco_unitario FROM itens_pedido WHERE pedido_id = ?",
      [id]
    );
    pedido.itens = itens;
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar pedido" });
  }
});

// Listar pedidos de um usuário
router.get("/usuario/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id, endereco_entrega, status, criado_em FROM pedidos WHERE usuario_id = ? ORDER BY criado_em DESC",
      [usuario_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar pedidos do usuário" });
  }
});

// Cancelar pedido (só pode virar 'cancelado')
router.patch("/:id/cancelar", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE pedidos SET status = 'cancelado' WHERE id = ?", [
      id,
    ]);
    res.json({ mensagem: "Pedido cancelado" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao cancelar pedido" });
  }
});

module.exports = router;
