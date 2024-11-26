<?php
require_once('db-config.php');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Configurar fuso horário para São Paulo
date_default_timezone_set('America/Sao_Paulo');

// Tratar requisições OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Função para validar o status
function isValidStatus($status) {
    return in_array($status, ['good', 'minor', 'urgent']);
}

// Função para formatar o histórico
function formatHistory($history) {
    $formatted = [];
    foreach ($history as $record) {
        $formatted[] = [
            'id' => $record['id'],
            'seatId' => $record['seatId'],
            'status' => $record['status'],
            'observation' => $record['observation'],
            'created_at' => $record['created_at']
        ];
    }
    return $formatted;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $response = [];

    switch ($method) {
        case 'GET':
            // Buscar todas as cadeiras
            $stmt = $pdo->query("SELECT * FROM seats ORDER BY seatId");
            $seats = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Converter para o formato esperado pelo frontend
            $formattedSeats = [];
            foreach ($seats as $seat) {
                // Buscar histórico recente desta cadeira
                $historyStmt = $pdo->prepare("
                    SELECT h.* 
                    FROM seat_history h
                    WHERE h.seatId = ?
                    ORDER BY h.created_at DESC 
                    LIMIT 5
                ");
                $historyStmt->execute([$seat['seatId']]);
                $history = $historyStmt->fetchAll(PDO::FETCH_ASSOC);

                $formattedSeats[$seat['seatId']] = [
                    'seatId' => $seat['seatId'],
                    'status' => $seat['status'],
                    'observation' => $seat['observation'],
                    'lastUpdate' => $seat['lastUpdate'],
                    'history' => formatHistory($history)
                ];
            }
            
            $response = $formattedSeats;
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['seatId']) || !isset($data['status'])) {
                http_response_code(400);
                $response = ['error' => 'seatId e status são obrigatórios'];
                break;
            }

            if (!isValidStatus($data['status'])) {
                http_response_code(400);
                $response = ['error' => 'Status inválido. Use: good, minor ou urgent'];
                break;
            }

            // Começar uma transação
            $pdo->beginTransaction();

            try {
                // Atualizar a cadeira
                $stmt = $pdo->prepare("UPDATE seats SET status = ?, observation = ?, lastUpdate = NOW() WHERE seatId = ?");
                $result = $stmt->execute([
                    $data['status'],
                    $data['observation'] ?? '',
                    $data['seatId']
                ]);

                // Inserir no histórico
                $historyStmt = $pdo->prepare("INSERT INTO seat_history (seatId, status, observation) VALUES (?, ?, ?)");
                $historyStmt->execute([
                    $data['seatId'],
                    $data['status'],
                    $data['observation'] ?? ''
                ]);

                // Se chegou até aqui, commit na transação
                $pdo->commit();
                
                if ($result) {
                    // Buscar os dados atualizados
                    $updatedStmt = $pdo->prepare("SELECT * FROM seats WHERE seatId = ?");
                    $updatedStmt->execute([$data['seatId']]);
                    $updatedSeat = $updatedStmt->fetch(PDO::FETCH_ASSOC);
                    
                    // Buscar histórico recente desta cadeira
                    $historyStmt = $pdo->prepare("
                        SELECT h.* 
                        FROM seat_history h
                        WHERE h.seatId = ?
                        ORDER BY h.created_at DESC 
                        LIMIT 5
                    ");
                    $historyStmt->execute([$data['seatId']]);
                    $history = $historyStmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    $response = [
                        'message' => 'Cadeira atualizada com sucesso',
                        'seat' => [
                            'seatId' => $updatedSeat['seatId'],
                            'status' => $updatedSeat['status'],
                            'observation' => $updatedSeat['observation'],
                            'lastUpdate' => $updatedSeat['lastUpdate']
                        ],
                        'history' => formatHistory($history)
                    ];
                } else {
                    throw new Exception('Erro ao atualizar cadeira');
                }
            } catch (Exception $e) {
                // Se algo deu errado, rollback na transação
                $pdo->rollBack();
                throw $e;
            }
            break;

        default:
            http_response_code(405);
            $response = ['error' => 'Método não permitido'];
    }

} catch(Exception $e) {
    error_log("Erro na API de cadeiras: " . $e->getMessage());
    http_response_code(500);
    $response = [
        'error' => 'Erro interno',
        'message' => $e->getMessage()
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT);
