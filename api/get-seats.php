<?php
// Habilitar exibição de erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Log para debug
error_log('GET-SEATS: Iniciando requisição ' . $_SERVER['REQUEST_METHOD']);
error_log('GET-SEATS: Headers - ' . json_encode(getallheaders()));

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db-config.php';

try {
    // Teste de conexão
    $pdo->query('SELECT 1');
    error_log('GET-SEATS: Conexão com banco de dados OK');
    
    // Busca os assentos
    $stmt = $pdo->query('SELECT * FROM seats ORDER BY seatId');
    $seats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log('GET-SEATS: Encontrados ' . count($seats) . ' assentos');
    error_log('GET-SEATS: Dados - ' . json_encode($seats));
    
    // Retorna os dados
    echo json_encode($seats);
    
} catch(PDOException $e) {
    error_log('GET-SEATS Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch(Exception $e) {
    error_log('GET-SEATS Unexpected Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Unexpected error: ' . $e->getMessage()]);
}
?>