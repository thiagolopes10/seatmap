<?php
require_once('db-config.php');

header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Corrigindo tabela de histórico ===\n\n";

try {
    // 1. Remover tabela antiga
    echo "1. Removendo tabela seat_history...\n";
    $pdo->exec("DROP TABLE IF EXISTS seat_history");
    echo "OK - Tabela removida\n\n";
    
    // 2. Recriar tabela com a estrutura correta
    echo "2. Recriando tabela seat_history...\n";
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
    echo "OK - Tabela recriada\n\n";
    
    // 3. Verificar estrutura
    echo "3. Verificando estrutura da tabela:\n";
    $result = $pdo->query("SHOW CREATE TABLE seat_history")->fetch(PDO::FETCH_ASSOC);
    echo $result['Create Table'] . "\n\n";
    
    // 4. Testar inserção
    echo "4. Testando inserção...\n";
    $pdo->beginTransaction();
    
    // Primeiro verificar se existe uma cadeira específica
    $stmt = $pdo->query("SELECT seatId FROM seats ORDER BY seatId LIMIT 1");
    $seat = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($seat) {
        $seatId = $seat['seatId'];
        $historyStmt = $pdo->prepare("INSERT INTO seat_history (seatId, status, observation) VALUES (?, ?, ?)");
        $result = $historyStmt->execute([$seatId, 'good', 'Teste de inserção']);
        
        if ($result) {
            echo "✓ Inserção bem sucedida usando seatId: $seatId\n";
        } else {
            echo "✗ Falha na inserção\n";
        }
    } else {
        echo "✗ Nenhuma cadeira encontrada para teste\n";
    }
    
    $pdo->rollBack();
    echo "Teste concluído e revertido\n\n";
    
    // 5. Mostrar algumas cadeiras disponíveis
    echo "5. Cadeiras disponíveis para teste:\n";
    $stmt = $pdo->query("SELECT seatId FROM seats ORDER BY seatId LIMIT 5");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- " . $row['seatId'] . "\n";
    }
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "ERRO: " . $e->getMessage() . "\n";
    echo "Código do erro: " . $e->getCode() . "\n";
}
?>
