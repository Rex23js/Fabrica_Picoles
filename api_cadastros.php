<?php
// api_cadastros.php - API Completa para Gerenciamento de Cadastros
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Tratar requisições OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';
session_start();

// Capturar input JSON
$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

// ====================================
// SABORES
// ====================================
if ($action === 'salvar-sabor') {
    try {
        $nome = trim($input['nome'] ?? '');
        if (empty($nome)) {
            echo json_encode(['success' => false, 'message' => 'Nome do sabor é obrigatório']);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO sabores (nome) VALUES (?)");
        $stmt->execute([$nome]);
        echo json_encode(['success' => true, 'message' => 'Sabor cadastrado com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

elseif ($action === 'listar-sabores') {
    try {
        $stmt = $pdo->query("SELECT id, nome, criado_em FROM sabores ORDER BY nome ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

elseif ($action === 'deletar-sabor') {
    try {
        $id = $_GET['id'] ?? $_POST['id'] ?? null;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
            exit;
        }
        
        // Verificar se o sabor está sendo usado
        $check = $pdo->prepare("SELECT COUNT(*) as total FROM picoles WHERE id_sabor = ?");
        $check->execute([$id]);
        $result = $check->fetch();
        
        if ($result['total'] > 0) {
            echo json_encode(['success' => false, 'message' => 'Não é possível excluir: sabor está sendo usado em picolés!']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM sabores WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Sabor excluído com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// INGREDIENTES
// ====================================
elseif ($action === 'salvar-ingrediente') {
    try {
        $nome = trim($input['nome'] ?? '');
        if (empty($nome)) {
            echo json_encode(['success' => false, 'message' => 'Nome do ingrediente é obrigatório']);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO ingredientes (nome) VALUES (?)");
        $stmt->execute([$nome]);
        echo json_encode(['success' => true, 'message' => 'Ingrediente cadastrado com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

elseif ($action === 'listar-ingredientes') {
    try {
        $stmt = $pdo->query("SELECT id, nome, criado_em FROM ingredientes ORDER BY nome ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

elseif ($action === 'deletar-ingrediente') {
    try {
        $id = $_GET['id'] ?? $_POST['id'] ?? null;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
            exit;
        }
        
        $check = $pdo->prepare("SELECT COUNT(*) as total FROM picole_ingredientes WHERE id_ingrediente = ?");
        $check->execute([$id]);
        $result = $check->fetch();
        
        if ($result['total'] > 0) {
            echo json_encode(['success' => false, 'message' => 'Não é possível excluir: ingrediente está sendo usado!']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM ingredientes WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Ingrediente excluído com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// EMBALAGENS
// ====================================
elseif ($action === 'salvar-embalagem') {
    try {
        $nome = trim($input['nome'] ?? '');
        if (empty($nome)) {
            echo json_encode(['success' => false, 'message' => 'Nome da embalagem é obrigatório']);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO tipos_embalagem (nome) VALUES (?)");
        $stmt->execute([$nome]);
        echo json_encode(['success' => true, 'message' => 'Embalagem cadastrada com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

elseif ($action === 'listar-embalagens') {
    try {
        $stmt = $pdo->query("SELECT id, nome, criado_em FROM tipos_embalagem ORDER BY nome ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

elseif ($action === 'deletar-embalagem') {
    try {
        $id = $_GET['id'] ?? $_POST['id'] ?? null;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
            exit;
        }
        
        $check = $pdo->prepare("SELECT COUNT(*) as total FROM picoles WHERE id_tipo_embalagem = ?");
        $check->execute([$id]);
        $result = $check->fetch();
        
        if ($result['total'] > 0) {
            echo json_encode(['success' => false, 'message' => 'Não é possível excluir: embalagem está sendo usada!']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM tipos_embalagem WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Embalagem excluída com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// TIPOS DE PICOLÉ
// ====================================
elseif ($action === 'salvar-tipo') {
    try {
        $nome = trim($input['nome'] ?? '');
        $descricao = trim($input['descricao'] ?? '');
        
        if (empty($nome)) {
            echo json_encode(['success' => false, 'message' => 'Nome do tipo é obrigatório']);
            exit;
        }
        
        // VALIDAÇÃO: apenas tipos permitidos
        $tiposPermitidos = ['Normal', 'Ao Leite'];
        if (!in_array($nome, $tiposPermitidos)) {
            echo json_encode([
                'success' => false, 
                'message' => '❌ Tipo inválido! Apenas "Normal" ou "Ao Leite" são permitidos.'
            ]);
            exit;
        }
        
        // Verificar se já existe
        $checkStmt = $pdo->prepare("SELECT id FROM tipos_picole WHERE nome = ?");
        $checkStmt->execute([$nome]);
        if ($checkStmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Este tipo já está cadastrado!']);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO tipos_picole (nome, descricao) VALUES (?, ?)");
        $stmt->execute([$nome, $descricao]);
        echo json_encode(['success' => true, 'message' => 'Tipo de picolé cadastrado com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}


elseif ($action === 'listar-tipos') {
    try {
        $stmt = $pdo->query("SELECT id, nome, descricao, criado_em FROM tipos_picole ORDER BY nome ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

elseif ($action === 'deletar-tipo') {
    try {
        $id = $_GET['id'] ?? $_POST['id'] ?? null;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
            exit;
        }
        
        $check = $pdo->prepare("SELECT COUNT(*) as total FROM picoles WHERE id_tipo_picole = ?");
        $check->execute([$id]);
        $result = $check->fetch();
        
        if ($result['total'] > 0) {
            echo json_encode(['success' => false, 'message' => 'Não é possível excluir: tipo está sendo usado!']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM tipos_picole WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Tipo excluído com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// ADITIVOS NUTRITIVOS
// ====================================
elseif ($action === 'salvar-aditivo') {
    try {
        $nome = trim($input['nome'] ?? '');
        $formula = trim($input['formula_quimica'] ?? '');
        
        if (empty($nome)) {
            echo json_encode(['success' => false, 'message' => 'Nome do aditivo é obrigatório']);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO aditivos (nome, formula_quimica) VALUES (?, ?)");
        $stmt->execute([$nome, $formula]);
        echo json_encode(['success' => true, 'message' => 'Aditivo cadastrado com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

elseif ($action === 'listar-aditivos') {
    try {
        $stmt = $pdo->query("SELECT id, nome, formula_quimica, criado_em FROM aditivos ORDER BY nome ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

elseif ($action === 'deletar-aditivo') {
    try {
        $id = $_GET['id'] ?? $_POST['id'] ?? null;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
            exit;
        }
        
        $check = $pdo->prepare("SELECT COUNT(*) as total FROM picole_aditivos WHERE id_aditivo = ?");
        $check->execute([$id]);
        $result = $check->fetch();
        
        if ($result['total'] > 0) {
            echo json_encode(['success' => false, 'message' => 'Não é possível excluir: aditivo está sendo usado!']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM aditivos WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Aditivo excluído com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// CONSERVANTES
// ====================================
elseif ($action === 'salvar-conservante') {
    try {
        $nome = trim($input['nome'] ?? '');
        $descricao = trim($input['descricao'] ?? '');
        
        if (empty($nome)) {
            echo json_encode(['success' => false, 'message' => 'Nome do conservante é obrigatório']);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO conservantes (nome, descricao) VALUES (?, ?)");
        $stmt->execute([$nome, $descricao]);
        echo json_encode(['success' => true, 'message' => 'Conservante cadastrado com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

elseif ($action === 'listar-conservantes') {
    try {
        $stmt = $pdo->query("SELECT id, nome, descricao, criado_em FROM conservantes ORDER BY nome ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

elseif ($action === 'deletar-conservante') {
    try {
        $id = $_GET['id'] ?? $_POST['id'] ?? null;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
            exit;
        }
        
        $check = $pdo->prepare("SELECT COUNT(*) as total FROM picole_conservantes WHERE id_conservante = ?");
        $check->execute([$id]);
        $result = $check->fetch();
        
        if ($result['total'] > 0) {
            echo json_encode(['success' => false, 'message' => 'Não é possível excluir: conservante está sendo usado!']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM conservantes WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Conservante excluído com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// REVENDEDORES
// ====================================
elseif ($action === 'salvar-revendedor') {
    try {
        $cnpj = trim($input['cnpj'] ?? '');
        $razao = trim($input['razao'] ?? '');
        $contato = trim($input['contato'] ?? '');
        $email = trim($input['email'] ?? '');
        
        if (empty($cnpj) || empty($razao) || empty($contato)) {
            echo json_encode(['success' => false, 'message' => 'Preencha todos os campos obrigatórios']);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO revendedores (cnpj, razao_social, contato, email) VALUES (?, ?, ?, ?)");
        $stmt->execute([$cnpj, $razao, $contato, $email]);
        echo json_encode(['success' => true, 'message' => 'Revendedor cadastrado com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

elseif ($action === 'listar-revendedores') {
    try {
        $stmt = $pdo->query("SELECT id, cnpj, razao_social, contato, email, criado_em FROM revendedores WHERE deleted_at IS NULL ORDER BY razao_social ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

elseif ($action === 'deletar-revendedor') {
    try {
        $id = $_GET['id'] ?? $_POST['id'] ?? null;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
            exit;
        }
        
        // Soft delete
        $stmt = $pdo->prepare("UPDATE revendedores SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Revendedor excluído com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

else {
    echo json_encode(['success' => false, 'message' => 'Ação não reconhecida']);
}
?>