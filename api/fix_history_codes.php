<?php
require_once('db-config.php');

header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Corrigindo códigos no histórico ===\n\n";

try {
    // 1. Primeiro vamos dropar a foreign key
    echo "1. Removendo foreign key...\n";
    $pdo->exec("ALTER TABLE seat_history DROP FOREIGN KEY fk_seat_history_seats");
    echo "OK - Foreign key removida\n\n";
    
    // 2. Remover índice
    echo "2. Removendo índice...\n";
    $pdo->exec("ALTER TABLE seat_history DROP INDEX idx_seatId");
    echo "OK - Índice removido\n\n";
    
    // 3. Recriar a tabela de histórico com a estrutura correta
    echo "3. Recriando tabela seat_history...\n";
    $sql = "CREATE TABLE seat_history_new (
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
    
    $pdo->exec("DROP TABLE IF EXISTS seat_history_new");
    $pdo->exec($sql);
    echo "OK - Nova tabela criada\n\n";
    
    // 4. Copiar dados corrigidos
    echo "4. Copiando dados com códigos corretos...\n";
    $stmt = $pdo->query("SELECT * FROM seat_history ORDER BY created_at");
    $historico = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $insert = $pdo->prepare("INSERT INTO seat_history_new (seatId, status, observation, created_at) VALUES (?, ?, ?, ?)");
    
    foreach ($historico as $registro) {
        // Buscar o código da cadeira
        $seatStmt = $pdo->prepare("SELECT seatId FROM seats WHERE seatId = ?");
        $seatStmt->execute([$registro['seatId']]);
        $seat = $seatStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($seat) {
            echo "Atualizando registro {$registro['id']}: {$registro['seatId']} -> {$seat['seatId']}\n";
            $insert->execute([
                $seat['seatId'],
                $registro['status'],
                $registro['observation'],
                $registro['created_at']
            ]);
        }
    }
    echo "OK - Dados copiados\n\n";
    
    // 5. Substituir tabela antiga pela nova
    echo "5. Substituindo tabela antiga...\n";
    $pdo->exec("DROP TABLE seat_history");
    $pdo->exec("RENAME TABLE seat_history_new TO seat_history");
    echo "OK - Tabela substituída\n\n";
    
    // 6. Verificar resultado
    echo "=== Verificando resultado ===\n\n";
    $stmt = $pdo->query("
        SELECT h.*, s.seatId as seat_code
        FROM seat_history h
        JOIN seats s ON h.seatId = s.seatId
        ORDER BY h.created_at DESC
        LIMIT 5
    ");
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "\nRegistro:\n";
        echo "- ID: " . $row['id'] . "\n";
        echo "- Código da Cadeira: " . $row['seatId'] . "\n";
        echo "- Status: " . $row['status'] . "\n";
        echo "- Observação: " . $row['observation'] . "\n";
        echo "- Data: " . $row['created_at'] . "\n";
    }
    
} catch (PDOException $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
?>
