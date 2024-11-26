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
date_default_timezone_set('America/Sao_Paulo');

try {
    $pdo->beginTransaction();
    
    // Configura timezone do MySQL
    $pdo->exec("SET time_zone = '-03:00'");

    // 1. Limpar histórico e cadeiras
    $pdo->exec('DELETE FROM seat_history');
    $pdo->exec('DELETE FROM seats');

    // 2. Reinicializar cadeiras
    $blocks = [
        ['rows' => 9, 'seatsPerRow' => 3, 'prefix' => 'E'],  // Bloco Esquerdo
        ['rows' => 11, 'seatsPerRow' => 6, 'prefix' => 'M'], // Bloco Meio
        ['rows' => 9, 'seatsPerRow' => 3, 'prefix' => 'D'],  // Bloco Direito
        ['rows' => 4, 'seatsPerRow' => 3, 'prefix' => 'B']   // Bloco Inferior
    ];

    $stmt = $pdo->prepare('INSERT INTO seats (seatId, status, observation, lastUpdate) VALUES (?, ?, ?, CONVERT_TZ(NOW(), @@session.time_zone, "-03:00"))');
    
    foreach ($blocks as $block) {
        for ($row = 1; $row <= $block['rows']; $row++) {
            for ($seat = 1; $seat <= $block['seatsPerRow']; $seat++) {
                $seatId = sprintf('%s%d-%02d', $block['prefix'], $row, $seat);
                $stmt->execute([$seatId, 'good', null]);
            }
        }
    }

    $pdo->commit();
    echo json_encode([
        'success' => true,
        'message' => 'Todas as cadeiras foram resetadas com sucesso'
    ]);

} catch(PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log('Reset Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro ao resetar cadeiras',
        'message' => $e->getMessage(),
        'details' => $e->getTrace()
    ]);
}
?>