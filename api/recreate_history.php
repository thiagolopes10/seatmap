<?php
require_once('db-config.php');

header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Recriando tabela de histórico ===\n\n";

try {
    // 1. Remover tabela antiga
    echo "1. Removendo tabela seat_history...\n";
    $pdo->exec("DROP TABLE IF EXISTS seat_history");
    echo "OK - Tabela removida\n\n";

    // 2. Criar nova tabela
    echo "2. Criando nova tabela seat_history...\n";
    $sql = "CREATE TABLE seat_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seatId VARCHAR(10) NOT NULL,
        status ENUM('good', 'minor', 'urgent') NOT NULL,
        observation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_seatId (seatId),
        CONSTRAINT fk_seat_history_seats 
        FOREIGN KEY (seatId) REFERENCES seats(seatId) 
        ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo "OK - Tabela criada\n\n";

    // 3. Verificar estrutura
    echo "=== Estrutura das tabelas ===\n\n";
    
    echo "Tabela seats:\n";
    $result = $pdo->query("SHOW CREATE TABLE seats")->fetch(PDO::FETCH_ASSOC);
    echo $result['Create Table'] . "\n\n";
    
    echo "Tabela seat_history:\n";
    $result = $pdo->query("SHOW CREATE TABLE seat_history")->fetch(PDO::FETCH_ASSOC);
    echo $result['Create Table'] . "\n\n";

    // 4. Testar inserção
    echo "=== Testando inserção ===\n\n";
    
    // Primeiro verificar se M1-01 existe
    $check = $pdo->query("SELECT seatId FROM seats WHERE seatId = 'M1-01'")->fetch();
    if ($check) {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("INSERT INTO seat_history (seatId, status, observation) VALUES (?, ?, ?)");
        $result = $stmt->execute(['M1-01', 'good', 'Teste de inserção']);
        
        if ($result) {
            echo "Inserção de teste bem sucedida!\n";
            $lastId = $pdo->lastInsertId();
            $check = $pdo->query("SELECT * FROM seat_history WHERE id = $lastId")->fetch(PDO::FETCH_ASSOC);
            echo "Dados inseridos:\n";
            print_r($check);
        }
        
        $pdo->rollBack();
        echo "\nTeste concluído e revertido com sucesso\n";
    } else {
        echo "AVISO: Cadeira M1-01 não encontrada na tabela seats\n";
        // Mostrar algumas cadeiras que existem
        $seats = $pdo->query("SELECT seatId FROM seats LIMIT 5")->fetchAll(PDO::FETCH_COLUMN);
        echo "Algumas cadeiras que existem: " . implode(", ", $seats) . "\n";
    }

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "ERRO: " . $e->getMessage() . "\n";
    echo "Código do erro: " . $e->getCode() . "\n";
}
?>
