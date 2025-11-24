<?php
// api_vendas.php - API para Gerenciamento de Vendas
header('Content-Type: application/json');
require 'db.php';
session_start();

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

// ====================================
// SALVAR VENDA (EMITIR NOTA FISCAL)
// ====================================
if ($action === 'salvar-venda') {
    try {
        $pdo->beginTransaction();
        
        $id_usuario = $_SESSION['user_id'] ?? 1;
        $total_nota = 0;
        
        // VALIDAÇÃO: Verificar disponibilidade ANTES de processar
        foreach($input['itens'] as $item) {
            $checkStmt = $pdo->prepare("
                SELECT quantidade_disponivel 
                FROM lotes 
                WHERE id = ? AND status = 'ATIVO'
            ");
            $checkStmt->execute([$item['id_lote']]);
            $lote = $checkStmt->fetch();
            
            if (!$lote) {
                throw new Exception("Lote #{$item['id_lote']} não encontrado ou inativo!");
            }
            
            if ($item['quantidade'] > $lote['quantidade_disponivel']) {
                throw new Exception(
                    "Lote #{$item['id_lote']}: quantidade solicitada ({$item['quantidade']}) " .
                    "maior que disponível ({$lote['quantidade_disponível']})"
                );
            }
            
            $total_nota += ($item['quantidade'] * $item['valor_unitario']);
        }

        // 1. Criar Nota Fiscal
        $stmt = $pdo->prepare("
            INSERT INTO notas_fiscais (
                numero_serie, 
                data_emissao, 
                id_revendedor, 
                id_usuario_emissor, 
                descricao, 
                valor_total
            ) VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $input['numero_serie'],
            $input['data_emissao'],
            $input['id_revendedor'],
            $id_usuario,
            $input['descricao'] ?? null,
            $total_nota
        ]);
        
        $id_nota = $pdo->lastInsertId();

        // 2. Inserir Itens e Baixar Estoque
        $stmtItem = $pdo->prepare("
            INSERT INTO nota_lotes (id_nota, id_lote, quantidade, valor_unitario, subtotal) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmtLote = $pdo->prepare("
            UPDATE lotes 
            SET quantidade_disponivel = quantidade_disponivel - ? 
            WHERE id = ?
        ");

        foreach($input['itens'] as $item) {
            $subtotal = $item['quantidade'] * $item['valor_unitario'];
            
            // Inserir item
            $stmtItem->execute([
                $id_nota,
                $item['id_lote'],
                $item['quantidade'],
                $item['valor_unitario'],
                $subtotal
            ]);

            // Atualizar estoque
            $stmtLote->execute([
                $item['quantidade'],
                $item['id_lote']
            ]);

            // Atualizar status do lote se esgotou
            $checkLote = $pdo->prepare("SELECT quantidade_disponivel FROM lotes WHERE id = ?");
            $checkLote->execute([$item['id_lote']]);
            $lote = $checkLote->fetch();
            
            if ($lote['quantidade_disponivel'] <= 0) {
                $pdo->prepare("UPDATE lotes SET status = 'ESGOTADO' WHERE id = ?")->execute([$item['id_lote']]);
            }
        }

        $pdo->commit();
        echo json_encode([
            'success' => true, 
            'message' => 'Venda registrada com sucesso! NF: ' . $input['numero_serie'],
            'id_nota' => $id_nota
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ====================================
// LISTAR NOTAS FISCAIS
// ====================================
elseif ($action === 'listar-notas') {
    try {
        $stmt = $pdo->query("
            SELECT 
                n.id,
                n.numero_serie,
                n.data_emissao,
                n.valor_total,
                n.descricao,
                r.razao_social as revendedor_nome,
                u.name as emissor_nome
            FROM notas_fiscais n
            JOIN revendedores r ON n.id_revendedor = r.id
            JOIN users u ON n.id_usuario_emissor = u.id
            ORDER BY n.data_emissao DESC, n.id DESC
        ");
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// ====================================
// DETALHES DA NOTA FISCAL
// ====================================
elseif ($action === 'detalhes-nota') {
    try {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            echo json_encode(['error' => 'ID não fornecido']);
            exit;
        }

        // Dados da nota
        $stmtNota = $pdo->prepare("
            SELECT 
                n.*,
                r.razao_social,
                r.cnpj,
                r.contato,
                r.email,
                u.name as emissor_nome
            FROM notas_fiscais n
            JOIN revendedores r ON n.id_revendedor = r.id
            JOIN users u ON n.id_usuario_emissor = u.id
            WHERE n.id = ?
        ");
        $stmtNota->execute([$id]);
        $nota = $stmtNota->fetch();

        // Itens da nota
        $stmtItens = $pdo->prepare("
            SELECT 
                nl.*,
                tp.nome as tipo_nome,
                s.nome as sabor_nome
            FROM nota_lotes nl
            JOIN lotes l ON nl.id_lote = l.id
            JOIN picoles p ON l.id_picole = p.id
            JOIN tipos_picole tp ON p.id_tipo_picole = tp.id
            JOIN sabores s ON p.id_sabor = s.id
            WHERE nl.id_nota = ?
        ");
        $stmtItens->execute([$id]);
        $itens = $stmtItens->fetchAll();

        echo json_encode([
            'nota' => $nota,
            'itens' => $itens
        ]);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

else {
    echo json_encode(['success' => false, 'message' => 'Ação não reconhecida']);
}
?>