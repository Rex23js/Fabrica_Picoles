<?php
// api_relatorios.php - API de Relatórios COMPLETA
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';

$action = $_GET['action'] ?? '';

// ====================================
// RESUMO ESTATÍSTICO
// ====================================
if ($action === 'resumo-estatistico') {
    try {
        $ano = $_GET['ano'] ?? date('Y');
        $mes = $_GET['mes'] ?? null;
        
        $whereClause = "YEAR(nf.data_emissao) = ?";
        $params = [$ano];
        
        if ($mes) {
            $whereClause .= " AND MONTH(nf.data_emissao) = ?";
            $params[] = $mes;
        }
        
        // Faturamento total
        $stmtFaturamento = $pdo->prepare("
            SELECT COALESCE(SUM(valor_total), 0) as total 
            FROM notas_fiscais nf
            WHERE $whereClause
        ");
        $stmtFaturamento->execute($params);
        $faturamento = $stmtFaturamento->fetch()['total'];
        
        // Total de lotes vendidos
        $stmtLotes = $pdo->prepare("
            SELECT COUNT(DISTINCT nl.id_lote) as total
            FROM nota_lotes nl
            JOIN notas_fiscais nf ON nl.id_nota = nf.id
            WHERE $whereClause
        ");
        $stmtLotes->execute($params);
        $totalLotes = $stmtLotes->fetch()['total'];
        
        // Notas emitidas
        $stmtNotas = $pdo->prepare("
            SELECT COUNT(*) as total 
            FROM notas_fiscais nf
            WHERE $whereClause
        ");
        $stmtNotas->execute($params);
        $totalNotas = $stmtNotas->fetch()['total'];
        
        // Melhor revendedor
        $stmtMelhor = $pdo->prepare("
            SELECT r.razao_social, SUM(nf.valor_total) as total
            FROM notas_fiscais nf
            JOIN revendedores r ON nf.id_revendedor = r.id
            WHERE $whereClause
            GROUP BY r.id
            ORDER BY total DESC
            LIMIT 1
        ");
        $stmtMelhor->execute($params);
        $melhorRevendedor = $stmtMelhor->fetch();
        
        echo json_encode([
            'faturamento' => floatval($faturamento),
            'total_lotes' => intval($totalLotes),
            'total_notas' => intval($totalNotas),
            'melhor_revendedor' => $melhorRevendedor ? $melhorRevendedor['razao_social'] : 'N/A'
        ]);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// ====================================
// VENDAS MENSAIS POR TIPO
// ====================================
elseif ($action === 'vendas-mensais-tipo') {
    try {
        $ano = $_GET['ano'] ?? date('Y');
        
        $stmt = $pdo->prepare("
            SELECT 
                MONTH(nf.data_emissao) as mes,
                tp.nome as tipo_picole,
                SUM(nl.quantidade) as quantidade,
                SUM(nl.subtotal) as valor
            FROM nota_lotes nl
            JOIN notas_fiscais nf ON nl.id_nota = nf.id
            JOIN lotes l ON nl.id_lote = l.id
            JOIN picoles p ON l.id_picole = p.id
            JOIN tipos_picole tp ON p.id_tipo_picole = tp.id
            WHERE YEAR(nf.data_emissao) = ?
            GROUP BY mes, tp.id
            ORDER BY mes, tp.nome
        ");
        $stmt->execute([$ano]);
        
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// ====================================
// TOP REVENDEDORES
// ====================================
elseif ($action === 'top-revendedores') {
    try {
        $ano = $_GET['ano'] ?? date('Y');
        $criterio = $_GET['criterio'] ?? 'valor'; // 'valor' ou 'quantidade'
        $limit = $_GET['limit'] ?? 10;
        
        $orderBy = $criterio === 'quantidade' ? 'total_quantidade' : 'total_valor';
        
        $stmt = $pdo->prepare("
            SELECT 
                r.id,
                r.cnpj,
                r.razao_social,
                COUNT(nf.id) as total_compras,
                SUM(nl.quantidade) as total_quantidade,
                SUM(nf.valor_total) as total_valor
            FROM revendedores r
            JOIN notas_fiscais nf ON r.id = nf.id_revendedor
            JOIN nota_lotes nl ON nf.id = nl.id_nota
            WHERE YEAR(nf.data_emissao) = ?
            GROUP BY r.id
            ORDER BY $orderBy DESC
            LIMIT ?
        ");
        $stmt->execute([$ano, intval($limit)]);
        
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// ====================================
// DISTRIBUIÇÃO POR TIPO
// ====================================
elseif ($action === 'distribuicao-tipos') {
    try {
        $ano = $_GET['ano'] ?? date('Y');
        $mes = $_GET['mes'] ?? null;
        
        $whereClause = "YEAR(nf.data_emissao) = ?";
        $params = [$ano];
        
        if ($mes) {
            $whereClause .= " AND MONTH(nf.data_emissao) = ?";
            $params[] = $mes;
        }
        
        $stmt = $pdo->prepare("
            SELECT 
                tp.nome as tipo,
                SUM(nl.quantidade) as quantidade,
                SUM(nl.subtotal) as valor
            FROM nota_lotes nl
            JOIN notas_fiscais nf ON nl.id_nota = nf.id
            JOIN lotes l ON nl.id_lote = l.id
            JOIN picoles p ON l.id_picole = p.id
            JOIN tipos_picole tp ON p.id_tipo_picole = tp.id
            WHERE $whereClause
            GROUP BY tp.id
        ");
        $stmt->execute($params);
        
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// ====================================
// EVOLUÇÃO DE VENDAS (12 MESES)
// ====================================
elseif ($action === 'evolucao-vendas') {
    try {
        $stmt = $pdo->query("
            SELECT 
                DATE_FORMAT(nf.data_emissao, '%Y-%m') as mes_ano,
                SUM(nf.valor_total) as valor,
                COUNT(*) as quantidade_notas
            FROM notas_fiscais nf
            WHERE nf.data_emissao >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY mes_ano
            ORDER BY mes_ano
        ");
        
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// ====================================
// DETALHAMENTO DE VENDAS
// ====================================
elseif ($action === 'detalhamento-vendas') {
    try {
        $ano = $_GET['ano'] ?? date('Y');
        $mes = $_GET['mes'] ?? null;
        $tipo = $_GET['tipo_picole'] ?? null;
        
        $whereClause = "YEAR(nf.data_emissao) = ?";
        $params = [$ano];
        
        if ($mes) {
            $whereClause .= " AND MONTH(nf.data_emissao) = ?";
            $params[] = $mes;
        }
        
        if ($tipo) {
            $whereClause .= " AND p.id_tipo_picole = ?";
            $params[] = $tipo;
        }
        
        $stmt = $pdo->prepare("
            SELECT 
                YEAR(nf.data_emissao) as ano,
                MONTH(nf.data_emissao) as mes,
                tp.nome as tipo_picole,
                COUNT(DISTINCT nf.id) as total_notas,
                COUNT(DISTINCT nl.id_lote) as lotes_vendidos,
                SUM(nf.valor_total) as valor_total
            FROM nota_lotes nl
            JOIN notas_fiscais nf ON nl.id_nota = nf.id
            JOIN lotes l ON nl.id_lote = l.id
            JOIN picoles p ON l.id_picole = p.id
            JOIN tipos_picole tp ON p.id_tipo_picole = tp.id
            WHERE $whereClause
            GROUP BY ano, mes, tp.id
            ORDER BY ano DESC, mes DESC, tp.nome
        ");
        $stmt->execute($params);
        
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

else {
    echo json_encode(['error' => 'Ação não reconhecida']);
}
?>