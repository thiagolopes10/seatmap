<?php
require_once('db-config.php');

try {
    // Primeiro, limpar a tabela existente e recriar
    $pdo->exec("DROP TABLE IF EXISTS seats");
    
    $createTable = "CREATE TABLE seats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seatId VARCHAR(10) NOT NULL UNIQUE,
        status ENUM('good', 'minor', 'urgent') DEFAULT 'good',
        observation TEXT,
        lastUpdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($createTable);
    
    // Preparar a declaração de inserção
    $stmt = $pdo->prepare("INSERT INTO seats (seatId, status) VALUES (?, 'good')");
    
    // Função para gerar ID da cadeira
    function generateSeatId($prefix, $row, $seat) {
        return sprintf("%s%d-%02d", $prefix, $row, $seat);
    }
    
    // Bloco Esquerdo (E)
    for ($row = 1; $row <= 9; $row++) {
        for ($seat = 1; $seat <= 3; $seat++) {
            $stmt->execute([generateSeatId('E', $row, $seat)]);
        }
    }
    
    // Bloco Meio (M)
    for ($row = 1; $row <= 11; $row++) {
        for ($seat = 1; $seat <= 6; $seat++) {
            $stmt->execute([generateSeatId('M', $row, $seat)]);
        }
    }
    
    // Bloco Direita (D)
    for ($row = 1; $row <= 9; $row++) {
        for ($seat = 1; $seat <= 3; $seat++) {
            $stmt->execute([generateSeatId('D', $row, $seat)]);
        }
    }
    
    // Sala B
    for ($row = 1; $row <= 4; $row++) {
        for ($seat = 1; $seat <= 3; $seat++) {
            $stmt->execute([generateSeatId('B', $row, $seat)]);
        }
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Banco de dados inicializado com sucesso',
        'total_seats' => [
            'left_block' => 27,  // 9×3
            'middle_block' => 66, // 11×6
            'right_block' => 27,  // 9×3
            'room_b' => 12,       // 4×3
            'total' => 132
        ]
    ], JSON_PRETTY_PRINT);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
