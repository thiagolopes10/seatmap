<?php
require_once 'db-config.php';

try {
    // Adicionar coluna seatId se não existir
    $pdo->exec("ALTER TABLE seats ADD COLUMN IF NOT EXISTS seatId VARCHAR(10) NOT NULL AFTER id");
    
    // Atualizar registros existentes para copiar id para seatId
    $pdo->exec("UPDATE seats SET seatId = id WHERE seatId IS NULL OR seatId = ''");
    
    echo json_encode(['success' => true, 'message' => 'Tabela atualizada com sucesso']);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Falha ao atualizar tabela',
        'message' => $e->getMessage()
    ]);
}
?>
