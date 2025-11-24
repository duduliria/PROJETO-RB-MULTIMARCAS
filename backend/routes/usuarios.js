const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const router = express.Router();

// Listar todos os usuários (sem retornar a senha)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nome, email, criado_em FROM usuarios"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar usuários" });
  }
});

// Buscar usuário por id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id, nome, email, criado_em FROM usuarios WHERE id = ?",
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ erro: "Usuário não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar usuário" });
  }
});

// Criar usuário (registro)
router.post("/", async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res
      .status(400)
      .json({ erro: "nome, email e senha são obrigatórios" });
  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const [result] = await pool.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
      [nome, email, senhaHash]
    );
    res.status(201).json({ mensagem: "Usuário criado", id: result.insertId });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ erro: "Email já cadastrado" });
    res.status(500).json({ erro: "Erro ao criar usuário" });
  }
});

// Atualizar usuário
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;
  try {
    const campos = [];
    const valores = [];
    if (nome) {
      campos.push("nome = ?");
      valores.push(nome);
    }
    if (email) {
      campos.push("email = ?");
      valores.push(email);
    }
    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      campos.push("senha = ?");
      valores.push(senhaHash);
    }
    if (campos.length === 0)
      return res.status(400).json({ erro: "Nenhum campo para atualizar" });
    valores.push(id);
    const sql = `UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`;
    await pool.query(sql, valores);
    res.json({ mensagem: "Usuário atualizado" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar usuário" });
  }
});

// Deletar usuário
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
    res.json({ mensagem: "Usuário deletado" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar usuário" });
  }
});

module.exports = router;
