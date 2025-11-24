<?php
// api_operacoes.php - VERSÃO CORRIGIDA
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';
session_start();

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

if ($action === 'criar-lote') {
    try {
        $pdo->beginTransaction();
        
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
            $input['id_picole'], 
            $input['qtd'], 
            $input['qtd'],
            $input['validade'], 
            $input['preco']
        ]);
        
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Lote criado com sucesso!']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

} elseif ($action === 'salvar-venda') {
    try {
        $pdo->beginTransaction();
        
        $id_usuario = $_SESSION['user_id'] ?? 1;
        $total_nota = 0;
        
        foreach($input['itens'] as $item) {
            $total_nota += ($item['qtd'] * $item['valor_unit']);
        }

        // Criar Nota Fiscal
        $stmt = $pdo->prepare("
            INSERT INTO notas_fiscais (
                numero_serie, 
                data_emissao, 
                id_revendedor, 
                id_usuario_emissor, 
                valor_total
            ) VALUES (?, NOW(), ?, ?, ?)
        ");
        
        $numero_serie = date('YmdHis');
        $stmt->execute([$numero_serie, $input['id_revendedor'], $id_usuario, $total_nota]);
        $id_nota = $pdo->lastInsertId();

        // Inserir Itens - CORREÇÃO: usar nota_lotes ao invés de itens_nota_fiscal
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
            $subtotal = $item['qtd'] * $item['valor_unit'];
            
            $stmtItem->execute([
                $id_nota,
                $item['id_lote'],
                $item['qtd'],
                $item['valor_unit'],
                $subtotal
            ]);

            $stmtLote->execute([
                $item['qtd'],
                $item['id_lote']
            ]);
            
            // Atualizar status se esgotou
            $checkLote = $pdo->prepare("SELECT quantidade_disponivel FROM lotes WHERE id = ?");
            $checkLote->execute([$item['id_lote']]);
            $lote = $checkLote->fetch();
            
            if ($lote && $lote['quantidade_disponivel'] <= 0) {
                $pdo->prepare("UPDATE lotes SET status = 'ESGOTADO' WHERE id = ?")->execute([$item['id_lote']]);
            }
        }

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Venda registrada! NF: ' . $numero_serie]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Erro ao processar venda: ' . $e->getMessage()]);
    }
    
} elseif ($action === 'listar-lotes-ativos') {
    try {
        $stmt = $pdo->query("
            SELECT 
                l.id, 
                CONCAT(tp.nome, ' - ', s.nome) as picole_nome, 
                l.quantidade_disponivel, 
                l.preco_unitario 
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
    
} else {
    echo json_encode(['success' => false, 'message' => 'Ação não reconhecida']);
}
?>