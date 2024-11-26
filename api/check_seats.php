<?php
require_once('db-config.php');

header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Verificando estrutura das tabelas ===\n\n";

try {
    // 1. Verificar estrutura da tabela seats
    echo "1. Estrutura da tabela seats:\n";
    $result = $pdo->query("SHOW CREATE TABLE seats")->fetch(PDO::FETCH_ASSOC);
    echo $result['Create Table'] . "\n\n";
    
    // 2. Verificar alguns registros da tabela seats
    echo "2. Primeiros registros da tabela seats:\n";
    $stmt = $pdo->query("SELECT * FROM seats ORDER BY seatId LIMIT 5");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        print_r($row);
    }
    
    // 3. Verificar estrutura da tabela seat_history
    echo "\n3. Estrutura da tabela seat_history:\n";
    $result = $pdo->query("SHOW CREATE TABLE seat_history")->fetch(PDO::FETCH_ASSOC);
    echo $result['Create Table'] . "\n\n";
    
    // 4. Verificar alguns registros do histórico
    echo "4. Últimos registros do histórico:\n";
    $stmt = $pdo->query("SELECT * FROM seat_history ORDER BY created_at DESC LIMIT 5");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        print_r($row);
    }
    
} catch (PDOException $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
?>
