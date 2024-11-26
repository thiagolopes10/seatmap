// Verifica se está em desenvolvimento
const isDevelopment = import.meta.env.DEV;

// URL da API baseada no ambiente
export const API_URL = isDevelopment
  ? 'http://localhost/seatmap/api'  // URL local para desenvolvimento
  : 'https://best-onlinestore.site/api';  // URL de produção

// Versão do app para teste de deploy
export const APP_VERSION = '1.0.1';

// Headers padrão para requisições
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
