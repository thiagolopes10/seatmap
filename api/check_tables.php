<?php
require_once('db-config.php');

header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    echo "=== Verificando tabelas do banco de dados ===\n\n";
    
    // Listar todas as tabelas
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tabelas encontradas:\n";
    foreach ($tables as $table) {
        echo "- $table\n";
    }
    
    echo "\n=== Estrutura da tabela seats ===\n";
    $columns = $pdo->query("DESCRIBE seats")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo "- {$col['Field']}: {$col['Type']}\n";
    }
    
    echo "\n=== Estrutura da tabela seat_history (se existir) ===\n";
    try {
        $columns = $pdo->query("DESCRIBE seat_history")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $col) {
            echo "- {$col['Field']}: {$col['Type']}\n";
        }
    } catch (PDOException $e) {
        echo "Erro: Tabela seat_history não existe\n";
    }
    
    echo "\n=== Testando inserção de histórico ===\n";
    try {
        $pdo->beginTransaction();
        
        // Tentar inserir um registro de teste
        $stmt = $pdo->prepare("INSERT INTO seat_history (seatId, status, observation, created_at) VALUES (?, ?, ?, NOW())");
        $result = $stmt->execute(['M1-01', 'good', 'Teste de inserção']);
        
        if ($result) {
            echo "Inserção de teste bem sucedida\n";
            // Verificar se foi inserido
            $lastId = $pdo->lastInsertId();
            $check = $pdo->query("SELECT * FROM seat_history WHERE id = $lastId")->fetch(PDO::FETCH_ASSOC);
            echo "Dados inseridos:\n";
            print_r($check);
        }
        
        $pdo->rollBack(); // Desfaz o teste
        
    } catch (PDOException $e) {
        echo "Erro ao testar inserção: " . $e->getMessage() . "\n";
        $pdo->rollBack();
    }
    
} catch (PDOException $e) {
    echo "ERRO: " . $e->getMessage();
}
?>
