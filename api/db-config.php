<?php
// Habilitar exibição de erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configuração do CORS
header('Access-Control-Allow-Origin: https://best-onlinestore.site');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 1728000');
header('Content-Type: application/json');

// Log para debug
error_log('DB Config: Iniciando conexão com o banco de dados');

// Tratamento especial para requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 200 OK');
    exit();
}

// Configurações do banco de dados da Hostinger
$host = 'localhost';
$dbname = 'u439528868_database';
$username = 'u439528868_seats';
$password = 'T*i1@Np9=';

try {
    // Criar conexão PDO com opções adicionais
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    error_log('DB Config: Conexão com o banco de dados estabelecida com sucesso');
} catch(PDOException $e) {
    error_log('DB Config Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed',
        'message' => $e->getMessage(),
        'details' => [
            'host' => $host,
            'database' => $dbname,
            'user' => $username
        ]
    ]);
    exit();
}
?>