<?php
require_once('db-config.php');

header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $pdo->beginTransaction();

    echo "=== Corrigindo estrutura das tabelas ===\n\n";

    // 1. Remover a foreign key atual
    echo "1. Removendo foreign key antiga...\n";
    $pdo->exec("ALTER TABLE seat_history DROP FOREIGN KEY seat_history_ibfk_1");

    // 2. Adicionar índice único em seats.seatId
    echo "2. Adicionando índice único em seats.seatId...\n";
    $pdo->exec("ALTER TABLE seats ADD UNIQUE INDEX seatId_unique (seatId)");

    // 3. Recriar a foreign key corretamente
    echo "3. Recriando foreign key...\n";
    $pdo->exec("ALTER TABLE seat_history ADD CONSTRAINT fk_seat_history_seats 
                FOREIGN KEY (seatId) REFERENCES seats(seatId) 
                ON DELETE RESTRICT ON UPDATE CASCADE");

    $pdo->commit();
    echo "\nSucesso! Estrutura das tabelas corrigida.";

} catch (PDOException $e) {
    $pdo->rollBack();
    echo "ERRO: " . $e->getMessage();
}

// Verificar estrutura final
try {
    echo "\n\n=== Estrutura final das tabelas ===\n";
    
    echo "\nTabela seats:\n";
    $result = $pdo->query("SHOW CREATE TABLE seats")->fetch();
    echo $result[1] . "\n";
    
    echo "\nTabela seat_history:\n";
    $result = $pdo->query("SHOW CREATE TABLE seat_history")->fetch();
    echo $result[1] . "\n";
    
} catch (PDOException $e) {
    echo "ERRO ao verificar estrutura: " . $e->getMessage();
}
?>
