<?php
// Desabilitar qualquer erro do PHP na página principal
error_reporting(0);
ini_set('display_errors', 0);

// Servir o index.html do React
$indexFile = __DIR__ . '/index.html';

if (file_exists($indexFile)) {
    readfile($indexFile);
} else {
    http_response_code(404);
    echo 'Error: index.html not found';
}
?>
