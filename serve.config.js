import handler from 'serve-handler';
import { createServer } from 'http';

const server = createServer((request, response) => {
  // Adiciona headers CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Se for uma requisição OPTIONS, retorna 200 OK
  if (request.method === 'OPTIONS') {
    response.writeHead(200);
    response.end();
    return;
  }

  return handler(request, response, {
    public: 'dist',
    rewrites: [
      { source: '/api/**', destination: 'https://best-onlinestore.site/api/**' }
    ]
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
