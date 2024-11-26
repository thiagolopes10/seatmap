<?php
require_once('db-config.php');

header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Recriando banco de dados ===\n\n";

try {
    // Começar transação
    $pdo->beginTransaction();
    
    // 1. Remover tabela de histórico
    echo "1. Removendo tabela seat_history...\n";
    $pdo->exec("DROP TABLE IF EXISTS seat_history");
    echo "OK - Tabela seat_history removida\n\n";
    
    // 2. Limpar tabela de cadeiras
    echo "2. Limpando tabela seats...\n";
    $pdo->exec("DELETE FROM seats");
    echo "OK - Tabela seats limpa\n\n";
    
    // 3. Criar array com todas as cadeiras
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
    
    // 4. Inserir cadeiras
    echo "3. Inserindo " . count($seats) . " cadeiras...\n";
    $stmt = $pdo->prepare("INSERT INTO seats (seatId, status) VALUES (?, 'good')");
    
    foreach ($seats as $seatId) {
        $stmt->execute([$seatId]);
    }
    
    // 5. Recriar tabela de histórico
    echo "\n4. Recriando tabela seat_history...\n";
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
    echo "OK - Tabela seat_history recriada\n\n";
    
    // Commit da transação
    $pdo->commit();
    
    // 6. Verificar resultado
    echo "=== Verificando resultado ===\n\n";
    
    // Total de cadeiras
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
    
    // Verificar estrutura do histórico
    echo "\nEstrutura da tabela seat_history:\n";
    $result = $pdo->query("SHOW CREATE TABLE seat_history")->fetch(PDO::FETCH_ASSOC);
    echo $result['Create Table'] . "\n";
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "ERRO: " . $e->getMessage() . "\n";
}
?>
