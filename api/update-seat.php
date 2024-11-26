<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db-config.php';

// Configurar timezone
date_default_timezone_set('America/Sao_Paulo');

// Pega o corpo da requisição
$data = json_decode(file_get_contents('php://input'), true);

// Valida os dados
if (!isset($data['seatId']) || !isset($data['status']) || !isset($data['observation'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit();
}

// Extrai os dados
$seatId = $data['seatId'];
$status = $data['status'];
$observation = $data['observation'];

// Valida o status
if (!in_array($status, ['good', 'minor', 'urgent'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Status inválido']);
    exit();
}

try {
    // Inicia transação
    $pdo->beginTransaction();
    
    // Data e hora atual de São Paulo
    $currentDateTime = date('Y-m-d H:i:s');

    // Atualiza o assento
    $stmt = $pdo->prepare('UPDATE seats SET status = ?, observation = ?, lastUpdate = ? WHERE seatId = ?');
    $result = $stmt->execute([$status, $observation, $currentDateTime, $seatId]);
    
    if ($result) {
        // Insere no histórico
        $stmt = $pdo->prepare('INSERT INTO seat_history (seatId, status, observation, created_at) VALUES (?, ?, ?, ?)');
        $stmt->execute([$seatId, $status, $observation, $currentDateTime]);

        // Commit da transação
        $pdo->commit();

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
                DATE_FORMAT(created_at, "%d/%m/%Y %H:%i") as created_at
            FROM RankedHistory
            WHERE rn = 1
            ORDER BY created_at DESC
        ');
        $stmt->execute();
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Cadeira atualizada com sucesso',
            'history' => $history
        ]);
    } else {
        throw new Exception('Falha ao atualizar cadeira');
    }
} catch(Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao atualizar cadeira', 'message' => $e->getMessage()]);
}