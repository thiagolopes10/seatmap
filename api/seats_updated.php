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
                $formattedSeats[$seat['seatId']] = [
                    'id' => $seat['seatId'],
                    'status' => $seat['status'],
                    'observation' => $seat['observation'],
                    'lastUpdate' => $seat['lastUpdate']
                ];
            }
            
            $response = $formattedSeats;
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id']) || !isset($data['status'])) {
                http_response_code(400);
                $response = ['error' => 'ID e status são obrigatórios'];
                break;
            }

            if (!isValidStatus($data['status'])) {
                http_response_code(400);
                $response = ['error' => 'Status inválido. Use: good, minor ou urgent'];
                break;
            }

            // Inserir na tabela de histórico
            $historyStmt = $pdo->prepare("INSERT INTO seat_history (seatId, status, observation, created_at) VALUES (?, ?, ?, NOW())");
            $historyStmt->execute([
                $data['id'],
                $data['status'],
                $data['observation'] ?? ''
            ]);

            // Atualizar a cadeira
            $stmt = $pdo->prepare("UPDATE seats SET status = ?, observation = ?, lastUpdate = NOW() WHERE seatId = ?");
            $result = $stmt->execute([
                $data['status'],
                $data['observation'] ?? '',
                $data['id']
            ]);
            
            if ($result) {
                // Buscar os dados atualizados
                $updatedStmt = $pdo->prepare("SELECT * FROM seats WHERE seatId = ?");
                $updatedStmt->execute([$data['id']]);
                $updatedSeat = $updatedStmt->fetch(PDO::FETCH_ASSOC);
                
                $response = [
                    'message' => 'Cadeira atualizada com sucesso',
                    'seat' => [
                        'id' => $updatedSeat['seatId'],
                        'status' => $updatedSeat['status'],
                        'observation' => $updatedSeat['observation'],
                        'lastUpdate' => $updatedSeat['lastUpdate']
                    ]
                ];
            } else {
                http_response_code(500);
                $response = ['error' => 'Erro ao atualizar cadeira'];
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
?>
