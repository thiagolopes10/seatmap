<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db-config.php';

try {
    // Busca apenas a manutenção mais recente de cada cadeira que está em manutenção
    $stmt = $pdo->prepare('
        WITH RankedHistory AS (
            SELECT 
                sh.*,
                ROW_NUMBER() OVER (PARTITION BY sh.seatId ORDER BY sh.created_at DESC) as rn
            FROM seat_history sh
            INNER JOIN seats s ON sh.seatId = s.seatId
            WHERE s.status IN ("minor", "urgent")
        )
        SELECT 
            id,
            seatId,
            status,
            observation,
            DATE_FORMAT(created_at, "%d/%m/%Y %H:%i") as created_at,
            created_at as raw_date
        FROM RankedHistory
        WHERE rn = 1
        ORDER BY raw_date ASC
    ');
    $stmt->execute();
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Remove o campo raw_date antes de enviar
    foreach ($history as &$record) {
        unset($record['raw_date']);
    }
    
    echo json_encode([
        'success' => true,
        'history' => $history
    ]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao buscar histórico', 'message' => $e->getMessage()]);
}
