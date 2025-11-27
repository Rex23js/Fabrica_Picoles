<?php
// api_producao.php - API para Gerenciamento de Produção CORRIGIDA
header('Content-Type: application/json');
require 'db.php';
session_start();

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

// ====================================
// SALVAR PICOLÉ
// ====================================
if ($action === 'salvar-picole') {
    try {
        $pdo->beginTransaction();

        // 1. Inserir picolé
        $stmt = $pdo->prepare("
            INSERT INTO picoles (id_sabor, id_tipo_picole, id_tipo_embalagem, preco) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $input['id_sabor'],
            $input['id_tipo_picole'],
            $input['id_tipo_embalagem'],
            $input['preco']
        ]);
        
        $id_picole = $pdo->lastInsertId();

        // 2. Inserir ingredientes
        if (!empty($input['ingredientes'])) {
            $stmtIng = $pdo->prepare("INSERT INTO picole_ingredientes (id_picole, id_ingrediente) VALUES (?, ?)");
            foreach ($input['ingredientes'] as $id_ingrediente) {
                $stmtIng->execute([$id_picole, $id_ingrediente]);
            }
        }

        // 3. Inserir aditivos
        if (!empty($input['aditivos'])) {
            $stmtAdit = $pdo->prepare("INSERT INTO picole_aditivos (id_picole, id_aditivo) VALUES (?, ?)");
            foreach ($input['aditivos'] as $id_aditivo) {
                $stmtAdit->execute([$id_picole, $id_aditivo]);
            }
        }

        // 4. Inserir conservantes
        if (!empty($input['conservantes'])) {
            $stmtCons = $pdo->prepare("INSERT INTO picole_conservantes (id_picole, id_conservante) VALUES (?, ?)");
            foreach ($input['conservantes'] as $id_conservante) {
                $stmtCons->execute([$id_picole, $id_conservante]);
            }
        }

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Picolé cadastrado com sucesso!', 'id' => $id_picole]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// LISTAR PICOLÉS
// ====================================
elseif ($action === 'listar-picoles') {
    try {
        $stmt = $pdo->query("
            SELECT 
                p.id,
                p.preco,
                s.nome as sabor_nome,
                tp.nome as tipo_nome,
                te.nome as embalagem_nome
            FROM picoles p
            JOIN sabores s ON p.id_sabor = s.id
            JOIN tipos_picole tp ON p.id_tipo_picole = tp.id
            JOIN tipos_embalagem te ON p.id_tipo_embalagem = te.id
            ORDER BY p.id DESC
        ");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// ====================================
// DELETAR PICOLÉ
// ====================================
elseif ($action === 'deletar-picole') {
    try {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
            exit;
        }

        // Verificar se tem lotes associados
        $check = $pdo->prepare("SELECT COUNT(*) as total FROM lotes WHERE id_picole = ?");
        $check->execute([$id]);
        $result = $check->fetch();
        
        if ($result['total'] > 0) {
            echo json_encode(['success' => false, 'message' => 'Não é possível excluir: picolé possui lotes de produção!']);
            exit;
        }

        // Excluir (cascade vai remover ingredientes, aditivos e conservantes)
        $stmt = $pdo->prepare("DELETE FROM picoles WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true, 'message' => 'Picolé excluído com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// CRIAR LOTE
// ====================================
elseif ($action === 'criar-lote') {
    try {
        if (!isset($input['id_picole']) || !isset($input['quantidade'])) {
            echo json_encode(['success' => false, 'message' => 'Picolé e quantidade são obrigatórios']);
            exit;
        }

        // Buscar picolé específico
        $stmtPicole = $pdo->prepare("
            SELECT id, preco 
            FROM picoles 
            WHERE id = ?
        ");
        $stmtPicole->execute([$input['id_picole']]);
        $picole = $stmtPicole->fetch();

        if (!$picole) {
            echo json_encode(['success' => false, 'message' => 'Picolé não encontrado!']);
            exit;
        }

        // Calcular data de validade (3 meses)
        $dataValidade = date('Y-m-d', strtotime('+3 months'));

        $stmt = $pdo->prepare("
            INSERT INTO lotes (
                id_picole, 
                quantidade_total, 
                quantidade_disponivel, 
                data_producao, 
                data_validade, 
                status, 
                preco_unitario
            ) VALUES (?, ?, ?, CURRENT_DATE, ?, 'ATIVO', ?)
        ");
        
        $stmt->execute([
            $picole['id'],
            $input['quantidade'],
            $input['quantidade'],
            $dataValidade,
            $picole['preco']
        ]);

        echo json_encode(['success' => true, 'message' => 'Lote criado com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// ====================================
// LISTAR LOTES
// ====================================
elseif ($action === 'listar-lotes') {
    try {
        $stmt = $pdo->query("
            SELECT 
                l.id,
                l.quantidade_total,
                l.quantidade_disponivel,
                l.data_producao,
                l.data_validade,
                l.status,
                l.preco_unitario,
                tp.nome as tipo_nome
            FROM lotes l
            JOIN picoles p ON l.id_picole = p.id
            JOIN tipos_picole tp ON p.id_tipo_picole = tp.id
            ORDER BY l.data_producao DESC
        ");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// ====================================
// LISTAR LOTES ATIVOS (PARA VENDAS) - CORRIGIDO
// ====================================
elseif ($action === 'listar-lotes-ativos') {
    try {
        $stmt = $pdo->query("
            SELECT 
                l.id,
                l.quantidade_disponivel,
                l.preco_unitario,
                CONCAT(tp.nome, ' - ', s.nome) as picole_nome,
                tp.nome as tipo_nome,
                s.nome as sabor_nome
            FROM lotes l
            JOIN picoles p ON l.id_picole = p.id
            JOIN tipos_picole tp ON p.id_tipo_picole = tp.id
            JOIN sabores s ON p.id_sabor = s.id
            WHERE l.status = 'ATIVO' AND l.quantidade_disponivel > 0
            ORDER BY l.data_producao DESC
        ");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

else {
    echo json_encode(['success' => false, 'message' => 'Ação não reconhecida']);
}
?>