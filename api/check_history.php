<?php
require_once('db-config.php');

header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Verificando histórico ===\n\n";

try {
    // 1. Verificar últimas atualizações
    echo "1. Últimas atualizações:\n";
    $stmt = $pdo->query("
        SELECT 
            h.*,
            s.id as seat_numeric_id
        FROM seat_history h
        JOIN seats s ON h.seatId = s.seatId
        ORDER BY h.created_at DESC 
        LIMIT 5
    ");
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "\nAtualização:\n";
        echo "- ID do Histórico: " . $row['id'] . "\n";
        echo "- ID Numérico da Cadeira: " . $row['seat_numeric_id'] . "\n";
        echo "- Código da Cadeira (seatId): " . $row['seatId'] . "\n";
        echo "- Status: " . $row['status'] . "\n";
        echo "- Observação: " . $row['observation'] . "\n";
        echo "- Data: " . $row['created_at'] . "\n";
    }
    
    // 2. Verificar se há registros com problemas
    echo "\n2. Verificando registros com problemas:\n";
    $stmt = $pdo->query("
        SELECT 
            h.*,
            s.id as seat_numeric_id,
            s.seatId as seat_code
        FROM seat_history h
        JOIN seats s ON h.seatId = s.seatId
        WHERE h.seatId != s.seatId
        LIMIT 5
    ");
    
    $problemas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($problemas) > 0) {
        echo "Encontrados " . count($problemas) . " registros com problemas:\n";
        foreach ($problemas as $row) {
            echo "- Histórico ID " . $row['id'] . ": ";
            echo "seatId no histórico = " . $row['seatId'] . ", ";
            echo "seatId na tabela seats = " . $row['seat_code'] . "\n";
        }
    } else {
        echo "Nenhum registro com problema encontrado.\n";
    }
    
    // 3. Verificar se há cadeiras sem histórico
    echo "\n3. Cadeiras sem histórico:\n";
    $stmt = $pdo->query("
        SELECT s.*
        FROM seats s
        LEFT JOIN seat_history h ON s.seatId = h.seatId
        WHERE h.id IS NULL
        LIMIT 5
    ");
    
    $sem_historico = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($sem_historico) > 0) {
        echo "Encontradas " . count($sem_historico) . " cadeiras sem histórico:\n";
        foreach ($sem_historico as $row) {
            echo "- " . $row['seatId'] . " (ID: " . $row['id'] . ")\n";
        }
    } else {
        echo "Todas as cadeiras têm histórico.\n";
    }
    
} catch (PDOException $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
?>
