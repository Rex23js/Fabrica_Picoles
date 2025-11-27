<?php
// api_cadastros.php - API Completa para Cadastros
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

// ====================================
// SABORES
// ====================================
if ($action === 'listar-sabores') {
    try {
        $stmt = $pdo->query("SELECT * FROM sabores ORDER BY nome ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
elseif ($action === 'salvar-sabor') {
    try {
        $stmt = $pdo->prepare("INSERT INTO sabores (nome) VALUES (?)");
        $stmt->execute([$input['nome']]);
        echo json_encode(['success' => true, 'message' => 'Sabor cadastrado com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}
elseif ($action === 'deletar-sabor') {
    try {
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM sabores WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Sabor excluído!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// INGREDIENTES
// ====================================
elseif ($action === 'listar-ingredientes') {
    try {
        $stmt = $pdo->query("SELECT * FROM ingredientes ORDER BY nome ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
elseif ($action === 'salvar-ingrediente') {
    try {
        $stmt = $pdo->prepare("INSERT INTO ingredientes (nome) VALUES (?)");
        $stmt->execute([$input['nome']]);
        echo json_encode(['success' => true, 'message' => 'Ingrediente cadastrado!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}
elseif ($action === 'deletar-ingrediente') {
    try {
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM ingredientes WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Ingrediente excluído!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// EMBALAGENS
// ====================================
elseif ($action === 'listar-embalagens') {
    try {
        $stmt = $pdo->query("SELECT * FROM tipos_embalagem ORDER BY nome ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
elseif ($action === 'salvar-embalagem') {
    try {
        $stmt = $pdo->prepare("INSERT INTO tipos_embalagem (nome) VALUES (?)");
        $stmt->execute([$input['nome']]);
        echo json_encode(['success' => true, 'message' => 'Embalagem cadastrada!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}
elseif ($action === 'deletar-embalagem') {
    try {
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM tipos_embalagem WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Embalagem excluída!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// TIPOS DE PICOLÉ
// ====================================
elseif ($action === 'listar-tipos') {
    try {
        $stmt = $pdo->query("SELECT * FROM tipos_picole ORDER BY nome ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
elseif ($action === 'salvar-tipo') {
    try {
        $stmt = $pdo->prepare("INSERT INTO tipos_picole (nome, descricao) VALUES (?, ?)");
        $stmt->execute([$input['nome'], $input['descricao'] ?? null]);
        echo json_encode(['success' => true, 'message' => 'Tipo cadastrado!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}
elseif ($action === 'deletar-tipo') {
    try {
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM tipos_picole WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Tipo excluído!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// ADITIVOS
// ====================================
elseif ($action === 'listar-aditivos') {
    try {
        $stmt = $pdo->query("SELECT * FROM aditivos ORDER BY nome ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
elseif ($action === 'salvar-aditivo') {
    try {
        $stmt = $pdo->prepare("INSERT INTO aditivos (nome, formula_quimica) VALUES (?, ?)");
        $stmt->execute([$input['nome'], $input['formula_quimica'] ?? null]);
        echo json_encode(['success' => true, 'message' => 'Aditivo cadastrado!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}
elseif ($action === 'deletar-aditivo') {
    try {
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM aditivos WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Aditivo excluído!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// CONSERVANTES
// ====================================
elseif ($action === 'listar-conservantes') {
    try {
        $stmt = $pdo->query("SELECT * FROM conservantes ORDER BY nome ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
elseif ($action === 'salvar-conservante') {
    try {
        $stmt = $pdo->prepare("INSERT INTO conservantes (nome, descricao) VALUES (?, ?)");
        $stmt->execute([$input['nome'], $input['descricao'] ?? null]);
        echo json_encode(['success' => true, 'message' => 'Conservante cadastrado!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}
elseif ($action === 'deletar-conservante') {
    try {
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM conservantes WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Conservante excluído!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// REVENDEDORES
// ====================================
elseif ($action === 'listar-revendedores') {
    try {
        $stmt = $pdo->query("SELECT * FROM revendedores WHERE deleted_at IS NULL ORDER BY razao_social ASC");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
elseif ($action === 'salvar-revendedor') {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO revendedores (cnpj, razao_social, contato, email, endereco) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $input['cnpj'],
            $input['razao_social'],
            $input['contato'],
            $input['email'] ?? null,
            $input['endereco'] ?? null
        ]);
        echo json_encode(['success' => true, 'message' => 'Revendedor cadastrado!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}
elseif ($action === 'deletar-revendedor') {
    try {
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("UPDATE revendedores SET deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Revendedor excluído!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

else {
    echo json_encode(['error' => 'Ação não reconhecida: ' . $action]);
}
?>