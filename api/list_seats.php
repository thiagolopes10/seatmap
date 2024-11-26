<?php
require_once('db-config.php');

header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Listando cadeiras existentes ===\n\n";

try {
    // Listar todas as cadeiras
    $stmt = $pdo->query("SELECT id, seatId, status, observation, lastUpdate FROM seats ORDER BY seatId");
    $seats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Total de cadeiras: " . count($seats) . "\n\n";
    
    echo "Primeiras 10 cadeiras:\n";
    $count = 0;
    foreach ($seats as $seat) {
        if ($count++ >= 10) break;
        echo sprintf("ID: %d, SeatID: %s, Status: %s, Última atualização: %s\n",
            $seat['id'],
            $seat['seatId'],
            $seat['status'],
            $seat['lastUpdate']
        );
    }
    
    // Verificar se existem cadeiras específicas
    $testSeats = ['E9-01', 'M1-01', 'M5-03'];
    echo "\nVerificando cadeiras específicas:\n";
    foreach ($testSeats as $seatId) {
        $stmt = $pdo->prepare("SELECT id, seatId, status FROM seats WHERE seatId = ?");
        $stmt->execute([$seatId]);
        $seat = $stmt->fetch();
        
        if ($seat) {
            echo "$seatId: EXISTE (ID: {$seat['id']}, Status: {$seat['status']})\n";
        } else {
            echo "$seatId: NÃO EXISTE\n";
        }
    }

} catch (PDOException $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
?>
