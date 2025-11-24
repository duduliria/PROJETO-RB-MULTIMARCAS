const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
const usuariosRoutes = require("./routes/usuarios");
const produtosRoutes = require("./routes/produtos");
const pedidosRoutes = require("./routes/pedidos");
const pagamentosRoutes = require("./routes/pagamentos");

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/produtos", produtosRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/pagamentos", pagamentosRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.json({ mensagem: "API da loja de roupas funcionando" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
