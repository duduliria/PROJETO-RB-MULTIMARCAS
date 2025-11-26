-- ===========================================
-- CRIAR BANCO DE DADOS
-- ===========================================
CREATE DATABASE loja_roupas;
USE loja_roupas;

-- ===========================================
-- TABELA DE USUÁRIOS
-- ===========================================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- TABELA DE PRODUTOS
-- ===========================================
-- Agora inclui uma coluna 'imagem'
CREATE TABLE produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  imagem VARCHAR(255), -- URL da imagem
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- TABELA DE PEDIDOS
-- ===========================================
-- Pedido nasce como 'pago', podendo virar apenas 'cancelado'
CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  endereco_entrega VARCHAR(255) NOT NULL,
  status ENUM('pago', 'cancelado') DEFAULT 'pago',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ===========================================
-- TABELA DE ITENS DO PEDIDO
-- ===========================================
CREATE TABLE itens_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- ===========================================
-- TABELA DE PAGAMENTOS
-- ===========================================
-- Formas: pix, debito, credito
-- Pagamento sempre confirmado
CREATE TABLE pagamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  forma_pagamento ENUM('pix', 'debito', 'credito') NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  confirmado TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);
