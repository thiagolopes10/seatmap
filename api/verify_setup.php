<?php
require_once('db-config.php');

header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Verificando configuração do banco ===\n\n";

try {
    // 1. Verificar cadeiras
    $count = $pdo->query("SELECT COUNT(*) FROM seats")->fetchColumn();
    echo "1. Total de cadeiras: $count\n\n";
    
    echo "Primeiras 5 cadeiras:\n";
    $stmt = $pdo->query("SELECT id, seatId, status FROM seats ORDER BY seatId LIMIT 5");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("- %s (ID: %d, Status: %s)\n",
            $row['seatId'],
            $row['id'],
            $row['status']
        );
    }
    
    echo "\nÚltimas 5 cadeiras:\n";
    $stmt = $pdo->query("SELECT id, seatId, status FROM seats ORDER BY seatId DESC LIMIT 5");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("- %s (ID: %d, Status: %s)\n",
            $row['seatId'],
            $row['id'],
            $row['status']
        );
    }
    
    // 2. Verificar estrutura do histórico
    echo "\n2. Estrutura da tabela seat_history:\n";
    $result = $pdo->query("SHOW CREATE TABLE seat_history")->fetch(PDO::FETCH_ASSOC);
    echo $result['Create Table'] . "\n\n";
    
    // 3. Testar inserção no histórico
    echo "3. Testando inserção no histórico...\n";
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare("INSERT INTO seat_history (seatId, status, observation) VALUES (?, ?, ?)");
    $result = $stmt->execute(['E9-01', 'minor', 'Teste de inserção']);
    
    if ($result) {
        echo "✓ Inserção bem sucedida!\n";
        $lastId = $pdo->lastInsertId();
        $check = $pdo->query("SELECT * FROM seat_history WHERE id = $lastId")->fetch(PDO::FETCH_ASSOC);
        echo "Dados inseridos:\n";
        print_r($check);
    }
    
    $pdo->rollBack();
    echo "\nTeste concluído e revertido\n";
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "ERRO: " . $e->getMessage() . "\n";
}

// 4. Verificar cadeiras específicas
echo "\n4. Verificando cadeiras específicas:\n";
$testSeats = ['E9-01', 'M1-01', 'M5-03'];
foreach ($testSeats as $seatId) {
    $stmt = $pdo->prepare("SELECT id, seatId, status FROM seats WHERE seatId = ?");
    $stmt->execute([$seatId]);
    $seat = $stmt->fetch();
    
    if ($seat) {
        echo "✓ $seatId: EXISTE (ID: {$seat['id']}, Status: {$seat['status']})\n";
    } else {
        echo "✗ $seatId: NÃO EXISTE\n";
    }
}
?>
