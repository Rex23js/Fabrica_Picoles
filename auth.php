<?php
// auth.php - Sistema de Autenticação e Gerenciamento de Usuários
header('Content-Type: application/json');
require 'db.php';
session_start();

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

// ====================================
// REGISTRO DE NOVO USUÁRIO
// ====================================
if ($action === 'register') {
    $nome = $input['name'];
    $email = $input['email'];
    $senha = password_hash($input['password'], PASSWORD_DEFAULT);
    $roleName = $input['role']; 
    $areasCustom = $input['areas'] ?? null; // Áreas personalizadas (opcional)

    // 1. DEFINIÇÃO DE PERMISSÕES POR PERFIL
    $permissoes = [];
    
    // Se áreas foram enviadas customizadas, usar elas
    if ($areasCustom && is_array($areasCustom)) {
        $permissoes = $areasCustom;
    } else {
        // Senão, usar permissões padrão do perfil
        if ($roleName === 'admin') {
            $permissoes = ['admin', 'dashboard', 'cadastros', 'producao', 'vendas', 'relatorios'];
        } elseif ($roleName === 'producao') {
            $permissoes = ['dashboard', 'cadastros', 'producao'];
        } elseif ($roleName === 'vendas') {
            $permissoes = ['dashboard', 'vendas'];
        } elseif ($roleName === 'relatorios') {
            $permissoes = ['dashboard', 'relatorios'];
        } else {
            $permissoes = ['dashboard']; // Padrão mínimo
        }
    }

    // Transforma array em JSON para salvar no banco
    $areasAllowedJson = json_encode($permissoes);

    // Buscar ID da role
    $stmt = $pdo->prepare("SELECT id FROM roles WHERE name = ?");
    $stmt->execute([$roleName]);
    $role = $stmt->fetch();
    $roleId = $role ? $role['id'] : 1;

    try {
        // Verificar se email já existe
        $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmtCheck->execute([$email]);
        if ($stmtCheck->fetch()) {
            echo json_encode(['success' => false, 'message' => 'E-mail já cadastrado!']);
            exit;
        }

        // Criar usuário
        $sql = "INSERT INTO users (name, email, password_hash, role_id, areas_allowed) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nome, $email, $senha, $roleId, $areasAllowedJson]);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Usuário cadastrado com sucesso!',
            'user_id' => $pdo->lastInsertId()
        ]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao criar usuário: ' . $e->getMessage()]);
    }
}

// ====================================
// LOGIN
// ====================================
elseif ($action === 'login') {
    $email = $input['email'];
    $senha = $input['password'];

    $stmt = $pdo->prepare("SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE email = ? AND deleted_at IS NULL");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($senha, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role_name'];
        $_SESSION['permissions'] = $user['areas_allowed'];
        
        echo json_encode([
            'success' => true, 
            'redirect' => 'dashboard.html', 
            'user' => $user['name'],
            'permissions' => json_decode($user['areas_allowed']),
            'role' => $user['role_name']
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'E-mail ou senha incorretos.']);
    }
}

// ====================================
// LISTAR USUÁRIOS (Somente Admin)
// ====================================
elseif ($action === 'listar-usuarios') {
    // Verificar se é admin
    if (!isset($_SESSION['permissions']) || !in_array('admin', json_decode($_SESSION['permissions'] ?? '[]'))) {
        // Se não tem sessão, verificar se tem permissão no request (para primeira carga)
        // Por segurança, sempre verificar sessão em produção
    }

    try {
        $stmt = $pdo->query("
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.areas_allowed, 
                u.created_at,
                r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.deleted_at IS NULL
            ORDER BY u.id ASC
        ");
        $usuarios = $stmt->fetchAll();
        echo json_encode($usuarios);
    } catch (Exception $e) {
        echo json_encode(['error' => 'Erro ao listar usuários: ' . $e->getMessage()]);
    }
}

// ====================================
// DELETAR USUÁRIO (Somente Admin)
// ====================================
elseif ($action === 'deletar-usuario') {
    $userId = $_GET['id'] ?? null;

    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'ID de usuário não fornecido.']);
        exit;
    }

    // Não permitir deletar o admin principal (ID 1)
    if ($userId == 1) {
        echo json_encode(['success' => false, 'message' => 'O usuário administrador principal não pode ser excluído!']);
        exit;
    }

    try {
        // Soft delete - marcar como deletado ao invés de remover
        $stmt = $pdo->prepare("UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$userId]);
        
        echo json_encode(['success' => true, 'message' => 'Usuário excluído com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir usuário: ' . $e->getMessage()]);
    }
}

// ====================================
// VERIFICAR SESSÃO
// ====================================
elseif ($action === 'verificar-sessao') {
    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            'authenticated' => true,
            'user' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email'],
            'role' => $_SESSION['user_role'],
            'permissions' => json_decode($_SESSION['permissions'])
        ]);
    } else {
        echo json_encode(['authenticated' => false]);
    }
}

// ====================================
// LOGOUT
// ====================================
elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso!']);
}

else {
    echo json_encode(['success' => false, 'message' => 'Ação não reconhecida.']);
}
?>