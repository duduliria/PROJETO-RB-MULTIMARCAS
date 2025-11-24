const express = require("express");
const pool = require("../db");
const router = express.Router();

// Listar produtos
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nome, descricao, preco, imagem, criado_em FROM produtos"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
});

// Buscar produto por id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id, nome, descricao, preco, imagem, criado_em FROM produtos WHERE id = ?",
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ erro: "Produto não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar produto" });
  }
});

// Criar produto
router.post("/", async (req, res) => {
  const { nome, descricao, preco, imagem } = req.body;
  if (!nome || preco == null)
    return res.status(400).json({ erro: "nome e preco são obrigatórios" });
  try {
    const [result] = await pool.query(
      "INSERT INTO produtos (nome, descricao, preco, imagem) VALUES (?, ?, ?, ?)",
      [nome, descricao || null, preco, imagem || null]
    );
    res.status(201).json({ mensagem: "Produto criado", id: result.insertId });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar produto" });
  }
});

// Atualizar produto
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, imagem } = req.body;
  try {
    const campos = [];
    const valores = [];
    if (nome) {
      campos.push("nome = ?");
      valores.push(nome);
    }
    if (descricao !== undefined) {
      campos.push("descricao = ?");
      valores.push(descricao);
    }
    if (preco !== undefined) {
      campos.push("preco = ?");
      valores.push(preco);
    }
    if (imagem !== undefined) {
      campos.push("imagem = ?");
      valores.push(imagem);
    }
    if (campos.length === 0)
      return res.status(400).json({ erro: "Nenhum campo para atualizar" });
    valores.push(id);
    const sql = `UPDATE produtos SET ${campos.join(", ")} WHERE id = ?`;
    await pool.query(sql, valores);
    res.json({ mensagem: "Produto atualizado" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar produto" });
  }
});

// Deletar produto
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM produtos WHERE id = ?", [id]);
    res.json({ mensagem: "Produto deletado" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar produto" });
  }
});

module.exports = router;
