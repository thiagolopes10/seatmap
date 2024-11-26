<?php
require_once('db-config.php');

try {
    // Criar tabela de histórico
    $sql = "CREATE TABLE IF NOT EXISTS seat_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seatId VARCHAR(10) NOT NULL,
        status ENUM('good', 'minor', 'urgent') NOT NULL,
        observation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seatId) REFERENCES seats(seatId)
    )";
    
    $pdo->exec($sql);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Tabela de histórico criada com sucesso'
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
