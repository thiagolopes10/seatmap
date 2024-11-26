<?php
require_once('db-config.php');

header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Criando cadeiras ===\n\n";

try {
    // Começar transação
    $pdo->beginTransaction();
    
    // Limpar tabela atual
    echo "1. Limpando tabela seats...\n";
    $pdo->exec("TRUNCATE TABLE seats");
    echo "OK - Tabela limpa\n\n";
    
    // Criar array com todas as cadeiras
    $seats = [];
    
    // Cadeiras M1 a M6 (01 a 22)
    for ($m = 1; $m <= 6; $m++) {
        for ($n = 1; $n <= 22; $n++) {
            $seats[] = sprintf("M%d-%02d", $m, $n);
        }
    }
    
    // Cadeiras E7 a E9 (01 a 22)
    for ($e = 7; $e <= 9; $e++) {
        for ($n = 1; $n <= 22; $n++) {
            $seats[] = sprintf("E%d-%02d", $e, $n);
        }
    }
    
    // Inserir cadeiras
    echo "2. Inserindo " . count($seats) . " cadeiras...\n";
    $stmt = $pdo->prepare("INSERT INTO seats (seatId, status) VALUES (?, 'good')");
    
    foreach ($seats as $seatId) {
        $stmt->execute([$seatId]);
    }
    
    // Commit da transação
    $pdo->commit();
    echo "OK - Cadeiras inseridas\n\n";
    
    // Verificar total
    $count = $pdo->query("SELECT COUNT(*) FROM seats")->fetchColumn();
    echo "Total de cadeiras na tabela: $count\n\n";
    
    // Mostrar algumas cadeiras
    echo "Primeiras 5 cadeiras:\n";
    $stmt = $pdo->query("SELECT id, seatId, status FROM seats ORDER BY seatId LIMIT 5");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("ID: %d, SeatID: %s, Status: %s\n",
            $row['id'],
            $row['seatId'],
            $row['status']
        );
    }
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "ERRO: " . $e->getMessage() . "\n";
}
?>
