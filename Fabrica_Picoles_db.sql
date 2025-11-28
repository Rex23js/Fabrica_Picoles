-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 24/11/2025 às 18:37
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `picole_factory`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `aditivos`
--

CREATE TABLE `aditivos` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL COMMENT 'Nome do aditivo',
  `formula_quimica` varchar(100) DEFAULT NULL COMMENT 'Fórmula química',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `aditivos`
--

INSERT INTO `aditivos` (`id`, `nome`, `formula_quimica`, `criado_em`) VALUES
(1, 'Vitamina C', 'C6H8O6', '2025-11-18 19:31:54'),
(2, 'Cálcio', 'Ca', '2025-11-18 19:31:54'),
(3, 'Vitamina D', 'C27H44O', '2025-11-18 19:31:54');

-- --------------------------------------------------------

--
-- Estrutura para tabela `atividades`
--

CREATE TABLE `atividades` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL COMMENT 'Usuário que executou a ação',
  `action` varchar(100) NOT NULL COMMENT 'Tipo de ação (CREATE, UPDATE, DELETE)',
  `descricao` text NOT NULL COMMENT 'Descrição detalhada da ação',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `atividades`
--

INSERT INTO `atividades` (`id`, `user_id`, `action`, `descricao`, `created_at`) VALUES
(5, 1, 'CREATE', 'Sistema reinicializado - Usuários recriados', '2025-11-24 17:33:45'),
(6, 1, 'UPDATE', 'Senha padrão definida para: Picole@2025', '2025-11-24 17:33:45');

-- --------------------------------------------------------

--
-- Estrutura para tabela `backup_users`
--

CREATE TABLE `backup_users` (
  `id` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `name` varchar(150) NOT NULL COMMENT 'Nome completo do usuário',
  `email` varchar(150) NOT NULL COMMENT 'Email único para login',
  `password_hash` varchar(255) NOT NULL COMMENT 'Hash bcrypt da senha',
  `role_id` int(10) UNSIGNED NOT NULL COMMENT 'Perfil principal do usuário',
  `areas_allowed` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array de áreas permitidas ["producao","vendas"]' CHECK (json_valid(`areas_allowed`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `backup_users`
--

INSERT INTO `backup_users` (`id`, `name`, `email`, `password_hash`, `role_id`, `areas_allowed`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Administrador', 'admin@picoles.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '[\"admin\",\"dashboard\",\"cadastros\",\"producao\",\"vendas\",\"relatorios\"]', '2025-11-18 19:31:54', '2025-11-19 20:04:15', NULL),
(5, 'João Silva', 'joao@picoles.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, '[\"dashboard\",\"cadastros\",\"producao\"]', '2025-11-19 20:04:15', '2025-11-19 20:04:15', NULL),
(6, 'Maria Santos', 'maria@picoles.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, '[\"dashboard\",\"vendas\"]', '2025-11-19 20:04:15', '2025-11-19 20:04:15', NULL),
(7, 'Roberto Silva', 'roberto@picoles.com', '$2y$10$EiXA0Hx8qKHxXxCxFx8qKHxXxCxFx8qKHxXxCxFx8qKHxXxCxFx8', 2, '[\"dashboard\",\"cadastros\",\"producao\"]', '2025-11-19 20:04:15', '2025-11-19 20:04:15', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `backup_users_old`
--

CREATE TABLE `backup_users_old` (
  `id` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `name` varchar(150) NOT NULL COMMENT 'Nome completo do usuário',
  `email` varchar(150) NOT NULL COMMENT 'Email único para login',
  `password_hash` varchar(255) NOT NULL COMMENT 'Hash bcrypt da senha',
  `role_id` int(10) UNSIGNED NOT NULL COMMENT 'Perfil principal do usuário',
  `areas_allowed` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array de áreas permitidas ["producao","vendas"]' CHECK (json_valid(`areas_allowed`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `backup_users_old`
--

INSERT INTO `backup_users_old` (`id`, `name`, `email`, `password_hash`, `role_id`, `areas_allowed`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Administrador', 'admin@picoles.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '[\"admin\",\"dashboard\",\"cadastros\",\"producao\",\"vendas\",\"relatorios\"]', '2025-11-18 19:31:54', '2025-11-19 20:04:15', NULL),
(8, 'João Silva', 'joao@picoles.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, '[\"dashboard\",\"cadastros\",\"producao\"]', '2025-11-19 20:05:35', '2025-11-19 20:05:35', NULL),
(9, 'Maria Santos', 'maria@picoles.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, '[\"dashboard\",\"vendas\"]', '2025-11-19 20:05:35', '2025-11-19 20:05:35', NULL),
(10, 'Roberto Silva', 'roberto@picoles.com', '$2y$10$EiXA0Hx8qKHxXxCxFx8qKHxXxCxFx8qKHxXxCxFx8qKHxXxCxFx8', 2, '[\"dashboard\",\"cadastros\",\"producao\"]', '2025-11-19 20:05:35', '2025-11-19 20:05:35', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `conservantes`
--

CREATE TABLE `conservantes` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL COMMENT 'Nome do conservante',
  `descricao` text DEFAULT NULL COMMENT 'Descrição e informações',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `conservantes`
--

INSERT INTO `conservantes` (`id`, `nome`, `descricao`, `criado_em`) VALUES
(1, 'Ácido Sórbico', 'Conservante antimicrobiano', '2025-11-18 19:31:54'),
(2, 'Benzoato de Sódio', 'Previne crescimento de fungos e bactérias', '2025-11-18 19:31:54');

-- --------------------------------------------------------

--
-- Estrutura para tabela `ingredientes`
--

CREATE TABLE `ingredientes` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL COMMENT 'Nome do ingrediente',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `ingredientes`
--

INSERT INTO `ingredientes` (`id`, `nome`, `criado_em`) VALUES
(1, 'Leite Condensado', '2025-11-18 19:31:54'),
(2, 'Creme de Leite', '2025-11-18 19:31:54'),
(3, 'Açúcar', '2025-11-18 19:31:54'),
(4, 'Água', '2025-11-18 19:31:54'),
(5, 'Polpa de Fruta', '2025-11-18 19:31:54'),
(6, 'Chocolate em Pó', '2025-11-18 19:31:54'),
(7, 'Leite Integral', '2025-11-18 19:31:54'),
(8, 'Essência de Baunilha', '2025-11-18 19:31:54');

-- --------------------------------------------------------

--
-- Estrutura para tabela `lotes`
--

CREATE TABLE `lotes` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_picole` int(10) UNSIGNED NOT NULL COMMENT 'Picolé produzido',
  `quantidade_total` int(10) UNSIGNED NOT NULL COMMENT 'Quantidade total produzida',
  `quantidade_disponivel` int(10) UNSIGNED NOT NULL COMMENT 'Quantidade disponível para venda',
  `data_producao` date NOT NULL COMMENT 'Data da produção',
  `data_validade` date DEFAULT NULL COMMENT 'Data de validade',
  `status` enum('ATIVO','ESGOTADO','EXPIRADO') DEFAULT 'ATIVO' COMMENT 'Status do lote',
  `preco_unitario` decimal(10,2) NOT NULL COMMENT 'Preço vigente no momento da produção',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `lotes`
--

INSERT INTO `lotes` (`id`, `id_picole`, `quantidade_total`, `quantidade_disponivel`, `data_producao`, `data_validade`, `status`, `preco_unitario`, `criado_em`) VALUES
(1, 1, 1000, 850, '2025-11-01', '2026-02-01', 'ATIVO', 3.50, '2025-11-18 19:31:54'),
(2, 2, 800, 600, '2025-11-05', '2026-02-05', 'ATIVO', 4.00, '2025-11-18 19:31:54'),
(3, 3, 1200, 1200, '2025-11-10', '2026-02-10', 'ATIVO', 3.00, '2025-11-18 19:31:54'),
(4, 4, 500, 200, '2025-11-15', '2026-02-15', 'ATIVO', 4.50, '2025-11-18 19:31:54');

-- --------------------------------------------------------

--
-- Estrutura para tabela `notas_fiscais`
--

CREATE TABLE `notas_fiscais` (
  `id` int(10) UNSIGNED NOT NULL,
  `numero_serie` varchar(50) NOT NULL COMMENT 'Número de série da nota',
  `data_emissao` date NOT NULL COMMENT 'Data de emissão',
  `id_revendedor` int(10) UNSIGNED NOT NULL COMMENT 'Revendedor comprador',
  `id_usuario_emissor` int(10) UNSIGNED NOT NULL COMMENT 'Usuário que emitiu',
  `descricao` text DEFAULT NULL COMMENT 'Observações',
  `valor_total` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Valor total da nota',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `nota_lotes`
--

CREATE TABLE `nota_lotes` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_nota` int(10) UNSIGNED NOT NULL COMMENT 'Nota fiscal',
  `id_lote` int(10) UNSIGNED NOT NULL COMMENT 'Lote vendido',
  `quantidade` int(10) UNSIGNED NOT NULL COMMENT 'Quantidade vendida',
  `valor_unitario` decimal(10,2) NOT NULL COMMENT 'Valor unitário negociado',
  `subtotal` decimal(12,2) NOT NULL COMMENT 'Subtotal do item'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `picoles`
--

CREATE TABLE `picoles` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_sabor` int(10) UNSIGNED NOT NULL COMMENT 'Sabor do picolé',
  `id_tipo_picole` int(10) UNSIGNED NOT NULL COMMENT 'Tipo (Normal, Ao Leite)',
  `id_tipo_embalagem` int(10) UNSIGNED NOT NULL COMMENT 'Tipo de embalagem',
  `preco` decimal(10,2) NOT NULL COMMENT 'Preço de venda unitário',
  `descricao` text DEFAULT NULL COMMENT 'Descrição adicional',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `picoles`
--

INSERT INTO `picoles` (`id`, `id_sabor`, `id_tipo_picole`, `id_tipo_embalagem`, `preco`, `descricao`, `criado_em`) VALUES
(1, 1, 1, 1, 3.50, 'Picolé de Morango Natural', '2025-11-18 19:31:54'),
(2, 2, 2, 1, 4.00, 'Picolé Cremoso de Chocolate', '2025-11-18 19:31:54'),
(3, 3, 1, 2, 3.00, 'Picolé de Limão Refrescante', '2025-11-18 19:31:54'),
(4, 4, 2, 1, 4.50, 'Picolé de Manga com Leite', '2025-11-18 19:31:54');

-- --------------------------------------------------------

--
-- Estrutura para tabela `picole_aditivos`
--

CREATE TABLE `picole_aditivos` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_picole` int(10) UNSIGNED NOT NULL,
  `id_aditivo` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `picole_aditivos`
--

INSERT INTO `picole_aditivos` (`id`, `id_picole`, `id_aditivo`) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 4, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `picole_conservantes`
--

CREATE TABLE `picole_conservantes` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_picole` int(10) UNSIGNED NOT NULL,
  `id_conservante` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `picole_conservantes`
--

INSERT INTO `picole_conservantes` (`id`, `id_picole`, `id_conservante`) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 1),
(4, 4, 2);

-- --------------------------------------------------------

--
-- Estrutura para tabela `picole_ingredientes`
--

CREATE TABLE `picole_ingredientes` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_picole` int(10) UNSIGNED NOT NULL,
  `id_ingrediente` int(10) UNSIGNED NOT NULL,
  `quantidade` varchar(50) DEFAULT NULL COMMENT 'Quantidade opcional (ex: 100g)',
  `observacao` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `picole_ingredientes`
--

INSERT INTO `picole_ingredientes` (`id`, `id_picole`, `id_ingrediente`, `quantidade`, `observacao`) VALUES
(1, 1, 5, '200g', NULL),
(2, 1, 3, '50g', NULL),
(3, 1, 4, '300ml', NULL),
(4, 2, 1, '150g', NULL),
(5, 2, 6, '100g', NULL),
(6, 2, 7, '200ml', NULL),
(7, 3, 5, '150g', NULL),
(8, 3, 3, '80g', NULL),
(9, 3, 4, '350ml', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `revendedores`
--

CREATE TABLE `revendedores` (
  `id` int(10) UNSIGNED NOT NULL,
  `cnpj` varchar(18) NOT NULL COMMENT 'CNPJ do revendedor',
  `razao_social` varchar(200) NOT NULL COMMENT 'Razão social',
  `contato` varchar(50) NOT NULL COMMENT 'Telefone de contato',
  `email` varchar(150) DEFAULT NULL COMMENT 'Email de contato',
  `endereco` text DEFAULT NULL COMMENT 'Endereço completo',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `revendedores`
--

INSERT INTO `revendedores` (`id`, `cnpj`, `razao_social`, `contato`, `email`, `endereco`, `criado_em`, `deleted_at`) VALUES
(1, '12.345.678/0001-90', 'Supermercado Bom Preço LTDA', '(51) 3333-4444', 'comercial@bompreco.com', 'Rua das Flores, 100 - Centro', '2025-11-18 19:31:54', NULL),
(2, '98.765.432/0001-10', 'Distribuidora Gelados Sul ME', '(51) 9999-8888', 'vendas@geladossul.com', 'Av. Industrial, 500 - Distrito', '2025-11-18 19:31:54', NULL),
(3, '11.222.333/0001-44', 'Mercearia do Zé LTDA', '(51) 2222-3333', 'ze@mercearia.com', 'Rua Principal, 25 - Vila', '2025-11-18 19:31:54', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `roles`
--

CREATE TABLE `roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL COMMENT 'Nome do perfil (admin, producao, vendas, estoque)',
  `description` text DEFAULT NULL COMMENT 'Descrição do perfil',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Administrador', 'Administrador com acesso total ao sistema', '2025-11-18 19:31:54'),
(2, 'Producao', 'Acesso ao módulo de produção e cadastros', '2025-11-18 19:31:54'),
(3, 'Vendas', 'Acesso ao módulo de vendas e emissão de notas', '2025-11-18 19:31:54'),
(4, 'Relatorios', 'Acesso ao controle de estoque e lotes', '2025-11-18 19:31:54');

-- --------------------------------------------------------

--
-- Estrutura para tabela `sabores`
--

CREATE TABLE `sabores` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL COMMENT 'Nome do sabor',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `sabores`
--

INSERT INTO `sabores` (`id`, `nome`, `criado_em`) VALUES
(1, 'Morango', '2025-11-18 19:31:54'),
(2, 'Chocolate', '2025-11-18 19:31:54'),
(3, 'Limão', '2025-11-18 19:31:54'),
(4, 'Manga', '2025-11-18 19:31:54'),
(5, 'Coco', '2025-11-18 19:31:54'),
(6, 'Baunilha', '2025-11-18 19:31:54'),
(7, 'Maracujá', '2025-11-18 19:31:54'),
(8, 'Uva', '2025-11-18 19:31:54'),
(9, 'choco', '2025-11-24 17:35:08');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tipos_embalagem`
--

CREATE TABLE `tipos_embalagem` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL COMMENT 'Nome do tipo de embalagem',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tipos_embalagem`
--

INSERT INTO `tipos_embalagem` (`id`, `nome`, `criado_em`) VALUES
(1, 'Plástico', '2025-11-18 19:31:54'),
(2, 'Papel', '2025-11-18 19:31:54'),
(3, 'Biodegradável', '2025-11-18 19:31:54');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tipos_picole`
--

CREATE TABLE `tipos_picole` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL COMMENT 'Nome do tipo',
  `descricao` text DEFAULT NULL COMMENT 'Descrição detalhada do tipo',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tipos_picole`
--

INSERT INTO `tipos_picole` (`id`, `nome`, `descricao`, `criado_em`) VALUES
(1, 'Normal', 'Picolé à base de água', '2025-11-18 19:31:54'),
(2, 'Ao Leite', 'Picolé cremoso à base de leite', '2025-11-18 19:31:54');

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL COMMENT 'Nome completo do usuário',
  `email` varchar(150) NOT NULL COMMENT 'Email único para login',
  `password_hash` varchar(255) NOT NULL COMMENT 'Hash bcrypt da senha',
  `role_id` int(10) UNSIGNED NOT NULL COMMENT 'Perfil principal do usuário',
  `areas_allowed` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array de áreas permitidas ["producao","vendas"]' CHECK (json_valid(`areas_allowed`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role_id`, `areas_allowed`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Administrador Master', 'admin@picoles.com', '$2b$10$W.d2hwKERCymIjKDtC/hhuHqArwUpRURJZ6UxERf4ZRh.MLXJf9Uq', 1, '[\"admin\",\"dashboard\",\"cadastros\",\"producao\",\"vendas\",\"relatorios\"]', '2025-11-24 17:33:45', '2025-11-24 17:33:45', NULL),
(2, 'João Silva', 'joao@picoles.com', '$2b$10$XAlgPYTbHSlsscxY9glSrOjE2Za2OwWBE6.d5ygNrubmL0GJ0ikPa', 2, '[\"dashboard\",\"cadastros\",\"producao\"]', '2025-11-24 17:33:45', '2025-11-24 17:33:45', NULL),
(3, 'Maria Santos', 'maria@picoles.com', '$2b$10$lVV31AnE/JdLQucVqXc0TOTlDLi5L8dXq2pEHGsGBoG7snpyll/2i', 3, '[\"dashboard\",\"vendas\"]', '2025-11-24 17:33:45', '2025-11-24 17:33:45', NULL),
(4, 'Carlos Souza', 'carlos@picoles.com', '$2b$10$24bkNnzExv4YWryiw/d13./Hs6WkDrMY6p6EIAcB366vKK9i1xP8i', 4, '[\"dashboard\",\"relatorios\"]', '2025-11-24 17:33:45', '2025-11-24 17:33:45', NULL);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `aditivos`
--
ALTER TABLE `aditivos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`),
  ADD KEY `idx_nome` (`nome`);

--
-- Índices de tabela `atividades`
--
ALTER TABLE `atividades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created` (`created_at`);

--
-- Índices de tabela `conservantes`
--
ALTER TABLE `conservantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`),
  ADD KEY `idx_nome` (`nome`);

--
-- Índices de tabela `ingredientes`
--
ALTER TABLE `ingredientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`),
  ADD KEY `idx_nome` (`nome`);

--
-- Índices de tabela `lotes`
--
ALTER TABLE `lotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_picole` (`id_picole`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_data_producao` (`data_producao`),
  ADD KEY `idx_disponivel` (`quantidade_disponivel`);

--
-- Índices de tabela `notas_fiscais`
--
ALTER TABLE `notas_fiscais`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_serie` (`numero_serie`),
  ADD KEY `idx_numero_serie` (`numero_serie`),
  ADD KEY `idx_data_emissao` (`data_emissao`),
  ADD KEY `idx_revendedor` (`id_revendedor`),
  ADD KEY `idx_emissor` (`id_usuario_emissor`);

--
-- Índices de tabela `nota_lotes`
--
ALTER TABLE `nota_lotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nota` (`id_nota`),
  ADD KEY `idx_lote` (`id_lote`);

--
-- Índices de tabela `picoles`
--
ALTER TABLE `picoles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sabor` (`id_sabor`),
  ADD KEY `idx_tipo` (`id_tipo_picole`),
  ADD KEY `idx_embalagem` (`id_tipo_embalagem`);

--
-- Índices de tabela `picole_aditivos`
--
ALTER TABLE `picole_aditivos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_picole_aditivo` (`id_picole`,`id_aditivo`),
  ADD KEY `idx_picole` (`id_picole`),
  ADD KEY `idx_aditivo` (`id_aditivo`);

--
-- Índices de tabela `picole_conservantes`
--
ALTER TABLE `picole_conservantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_picole_conservante` (`id_picole`,`id_conservante`),
  ADD KEY `idx_picole` (`id_picole`),
  ADD KEY `idx_conservante` (`id_conservante`);

--
-- Índices de tabela `picole_ingredientes`
--
ALTER TABLE `picole_ingredientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_picole_ingrediente` (`id_picole`,`id_ingrediente`),
  ADD KEY `idx_picole` (`id_picole`),
  ADD KEY `idx_ingrediente` (`id_ingrediente`);

--
-- Índices de tabela `revendedores`
--
ALTER TABLE `revendedores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cnpj` (`cnpj`),
  ADD KEY `idx_cnpj` (`cnpj`),
  ADD KEY `idx_razao` (`razao_social`),
  ADD KEY `idx_deleted` (`deleted_at`);

--
-- Índices de tabela `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Índices de tabela `sabores`
--
ALTER TABLE `sabores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`),
  ADD KEY `idx_nome` (`nome`);

--
-- Índices de tabela `tipos_embalagem`
--
ALTER TABLE `tipos_embalagem`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`),
  ADD KEY `idx_nome` (`nome`);

--
-- Índices de tabela `tipos_picole`
--
ALTER TABLE `tipos_picole`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`),
  ADD KEY `idx_nome` (`nome`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role_id`),
  ADD KEY `idx_deleted` (`deleted_at`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `aditivos`
--
ALTER TABLE `aditivos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `atividades`
--
ALTER TABLE `atividades`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `conservantes`
--
ALTER TABLE `conservantes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `ingredientes`
--
ALTER TABLE `ingredientes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `lotes`
--
ALTER TABLE `lotes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `notas_fiscais`
--
ALTER TABLE `notas_fiscais`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `nota_lotes`
--
ALTER TABLE `nota_lotes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `picoles`
--
ALTER TABLE `picoles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `picole_aditivos`
--
ALTER TABLE `picole_aditivos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `picole_conservantes`
--
ALTER TABLE `picole_conservantes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `picole_ingredientes`
--
ALTER TABLE `picole_ingredientes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `revendedores`
--
ALTER TABLE `revendedores`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `sabores`
--
ALTER TABLE `sabores`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `tipos_embalagem`
--
ALTER TABLE `tipos_embalagem`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `tipos_picole`
--
ALTER TABLE `tipos_picole`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `atividades`
--
ALTER TABLE `atividades`
  ADD CONSTRAINT `atividades_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `lotes`
--
ALTER TABLE `lotes`
  ADD CONSTRAINT `lotes_ibfk_1` FOREIGN KEY (`id_picole`) REFERENCES `picoles` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `notas_fiscais`
--
ALTER TABLE `notas_fiscais`
  ADD CONSTRAINT `notas_fiscais_ibfk_1` FOREIGN KEY (`id_revendedor`) REFERENCES `revendedores` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `notas_fiscais_ibfk_2` FOREIGN KEY (`id_usuario_emissor`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `nota_lotes`
--
ALTER TABLE `nota_lotes`
  ADD CONSTRAINT `nota_lotes_ibfk_1` FOREIGN KEY (`id_nota`) REFERENCES `notas_fiscais` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nota_lotes_ibfk_2` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `picoles`
--
ALTER TABLE `picoles`
  ADD CONSTRAINT `picoles_ibfk_1` FOREIGN KEY (`id_sabor`) REFERENCES `sabores` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `picoles_ibfk_2` FOREIGN KEY (`id_tipo_picole`) REFERENCES `tipos_picole` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `picoles_ibfk_3` FOREIGN KEY (`id_tipo_embalagem`) REFERENCES `tipos_embalagem` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `picole_aditivos`
--
ALTER TABLE `picole_aditivos`
  ADD CONSTRAINT `picole_aditivos_ibfk_1` FOREIGN KEY (`id_picole`) REFERENCES `picoles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `picole_aditivos_ibfk_2` FOREIGN KEY (`id_aditivo`) REFERENCES `aditivos` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `picole_conservantes`
--
ALTER TABLE `picole_conservantes`
  ADD CONSTRAINT `picole_conservantes_ibfk_1` FOREIGN KEY (`id_picole`) REFERENCES `picoles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `picole_conservantes_ibfk_2` FOREIGN KEY (`id_conservante`) REFERENCES `conservantes` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `picole_ingredientes`
--
ALTER TABLE `picole_ingredientes`
  ADD CONSTRAINT `picole_ingredientes_ibfk_1` FOREIGN KEY (`id_picole`) REFERENCES `picoles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `picole_ingredientes_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingredientes` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
