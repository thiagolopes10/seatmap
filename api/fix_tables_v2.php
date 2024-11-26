<?php
require_once('db-config.php');

header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Corrigindo estrutura das tabelas ===\n\n";

// 1. Remover a foreign key atual
try {
    echo "1. Removendo foreign key antiga...\n";
    $pdo->exec("ALTER TABLE seat_history DROP FOREIGN KEY seat_history_ibfk_1");
    echo "OK - Foreign key removida\n\n";
} catch (PDOException $e) {
    echo "Erro (pode ser ignorado se a foreign key não existir): " . $e->getMessage() . "\n\n";
}

// 2. Adicionar índice único em seats.seatId
try {
    echo "2. Adicionando índice único em seats.seatId...\n";
    $pdo->exec("ALTER TABLE seats ADD UNIQUE INDEX seatId_unique (seatId)");
    echo "OK - Índice único adicionado\n\n";
} catch (PDOException $e) {
    echo "Erro (pode ser ignorado se o índice já existir): " . $e->getMessage() . "\n\n";
}

// 3. Recriar a foreign key corretamente
try {
    echo "3. Recriando foreign key...\n";
    $pdo->exec("ALTER TABLE seat_history ADD CONSTRAINT fk_seat_history_seats 
                FOREIGN KEY (seatId) REFERENCES seats(seatId) 
                ON DELETE RESTRICT ON UPDATE CASCADE");
    echo "OK - Foreign key recriada\n\n";
} catch (PDOException $e) {
    echo "Erro: " . $e->getMessage() . "\n\n";
}

// Verificar estrutura final
echo "=== Verificando estrutura final ===\n\n";

try {
    echo "Tabela seats:\n";
    $result = $pdo->query("SHOW CREATE TABLE seats")->fetch();
    echo $result[1] . "\n\n";
    
    echo "Tabela seat_history:\n";
    $result = $pdo->query("SHOW CREATE TABLE seat_history")->fetch();
    echo $result[1] . "\n\n";
    
} catch (PDOException $e) {
    echo "Erro ao verificar estrutura: " . $e->getMessage() . "\n";
}

// Testar inserção
echo "=== Testando inserção no histórico ===\n\n";
try {
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare("INSERT INTO seat_history (seatId, status, observation, created_at) VALUES (?, ?, ?, NOW())");
    $result = $stmt->execute(['M1-01', 'good', 'Teste de inserção']);
    
    if ($result) {
        echo "Inserção de teste bem sucedida!\n";
        $lastId = $pdo->lastInsertId();
        $check = $pdo->query("SELECT * FROM seat_history WHERE id = $lastId")->fetch(PDO::FETCH_ASSOC);
        echo "Dados inseridos:\n";
        print_r($check);
    }
    
    $pdo->rollBack(); // Desfaz o teste
    echo "\nTeste concluído e revertido com sucesso\n";
    
} catch (PDOException $e) {
    $pdo->rollBack();
    echo "Erro no teste: " . $e->getMessage() . "\n";
}
?>
