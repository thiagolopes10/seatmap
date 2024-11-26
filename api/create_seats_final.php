<?php
require_once('db-config.php');

header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Recriando banco de dados ===\n\n";

try {
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
    
    // Bloco da Esquerda (E)
    // 9 fileiras x 3 cadeiras = 27 cadeiras
    for ($f = 1; $f <= 9; $f++) {
        for ($c = 1; $c <= 3; $c++) {
            $seats[] = sprintf("E%d-%02d", $f, $c);
        }
    }
    
    // Bloco do Meio (M)
    // 11 fileiras x 6 cadeiras = 66 cadeiras
    for ($f = 1; $f <= 11; $f++) {
        for ($c = 1; $c <= 6; $c++) {
            $seats[] = sprintf("M%d-%02d", $f, $c);
        }
    }
    
    // Bloco da Direita (D)
    // 9 fileiras x 3 cadeiras = 27 cadeiras
    for ($f = 1; $f <= 9; $f++) {
        for ($c = 1; $c <= 3; $c++) {
            $seats[] = sprintf("D%d-%02d", $f, $c);
        }
    }
    
    // Sala B (B)
    // 3 fileiras x 4 cadeiras = 12 cadeiras
    for ($f = 1; $f <= 3; $f++) {
        for ($c = 1; $c <= 4; $c++) {
            $seats[] = sprintf("B%d-%02d", $f, $c);
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
    
    // 6. Verificar resultado
    echo "=== Verificando resultado ===\n\n";
    
    // Total de cadeiras
    $count = $pdo->query("SELECT COUNT(*) FROM seats")->fetchColumn();
    echo "Total de cadeiras na tabela: $count\n\n";
    
    // Mostrar totais por bloco
    echo "Total por bloco:\n";
    $stmt = $pdo->query("SELECT LEFT(seatId, 1) as bloco, COUNT(*) as total FROM seats GROUP BY LEFT(seatId, 1)");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("Bloco %s: %d cadeiras\n", 
            $row['bloco'], 
            $row['total']
        );
    }
    
    echo "\nPrimeiras cadeiras de cada bloco:\n";
    foreach (['E', 'M', 'D', 'B'] as $bloco) {
        $stmt = $pdo->prepare("SELECT seatId, status FROM seats WHERE seatId LIKE ? ORDER BY seatId LIMIT 3");
        $stmt->execute([$bloco . '%']);
        $cadeiras = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Bloco $bloco: " . implode(", ", array_column($cadeiras, 'seatId')) . "\n";
    }
    
} catch (PDOException $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}

// Testar inserção no histórico
echo "\n=== Testando histórico ===\n";
try {
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare("INSERT INTO seat_history (seatId, status, observation) VALUES (?, ?, ?)");
    $result = $stmt->execute(['E1-01', 'minor', 'Teste de inserção']);
    
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
    echo "ERRO no teste: " . $e->getMessage() . "\n";
}
?>
