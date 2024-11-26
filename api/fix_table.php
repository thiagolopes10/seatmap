<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'db-config.php';

// Configurar timezone
date_default_timezone_set('America/Sao_Paulo');

try {
    // 1. Dropar tabelas existentes
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("DROP TABLE IF EXISTS seat_history");
    $pdo->exec("DROP TABLE IF EXISTS seats");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    // 2. Criar tabela seats
    $pdo->exec("CREATE TABLE seats (
        seatId VARCHAR(10) PRIMARY KEY,
        status VARCHAR(20) NOT NULL,
        observation TEXT,
        lastUpdate DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // 3. Criar tabela seat_history
    $pdo->exec("CREATE TABLE seat_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seatId VARCHAR(10) NOT NULL,
        status VARCHAR(20) NOT NULL,
        observation TEXT,
        created_at DATETIME NOT NULL,
        FOREIGN KEY (seatId) REFERENCES seats(seatId) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    echo json_encode(['success' => true, 'message' => 'Tabelas recriadas com sucesso']);
} catch(PDOException $e) {
    error_log('Fix Table Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao recriar tabelas', 'message' => $e->getMessage()]);
}
