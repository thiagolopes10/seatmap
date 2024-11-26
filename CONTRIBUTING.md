# Guia de Contribuição

## Processo de Desenvolvimento

### 1. Preparação do Ambiente
Certifique-se de ter o Git instalado em `C:\Program Files\Git`

### 2. Fluxo de Trabalho
Para cada alteração no código, siga estes passos:

1. **Faça suas alterações no código**
   - Modifique apenas os arquivos necessários
   - Teste localmente usando `npm run dev`

2. **Atualize a versão de produção**
   ```bash
   # Gere o build de produção
   npm run build

   # Execute o script de deploy
   npm run deploy
   ```

3. **Commit e Push**
   O script de deploy irá automaticamente:
   - Adicionar as alterações ao Git
   - Criar um commit com sua mensagem
   - Enviar para o repositório remoto

### 3. Boas Práticas
- Sempre teste suas alterações localmente antes de fazer deploy
- Escreva mensagens de commit descritivas
- Mantenha backups antes de fazer alterações significativas

### 4. Estrutura do Projeto
```
project/
├── src/
│   ├── components/    # Componentes React
│   ├── db/           # Comunicação com API
│   └── types.ts      # Definições de tipos
├── dist/            # Build de produção
└── scripts/         # Scripts de automação
```

### 5. Comandos Úteis
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run deploy` - Deploy para produção
- `npm run rollback` - Reverte última alteração

### 6. Contato
Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
