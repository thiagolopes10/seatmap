const { execSync } = require('child_process');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para executar comandos
function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Erro ao executar comando: ${command}`);
    console.error(error);
    return false;
  }
}

// Função principal de deploy
async function deploy() {
  console.log('\n=== Iniciando processo de deploy ===\n');

  // 1. Solicita mensagem do commit
  rl.question('Digite a mensagem do commit: ', (commitMessage) => {
    console.log('\nIniciando deploy...\n');

    // 2. Adiciona arquivos ao Git
    console.log('Adicionando arquivos...');
    if (!runCommand('git add .')) {
      process.exit(1);
    }

    // 3. Cria commit
    console.log('\nCriando commit...');
    if (!runCommand(`git commit -m "${commitMessage}"`)) {
      process.exit(1);
    }

    // 4. Push para o repositório remoto
    console.log('\nEnviando para o repositório remoto...');
    if (!runCommand('git push')) {
      process.exit(1);
    }

    console.log('\n=== Deploy concluído com sucesso! ===\n');
    rl.close();
  });
}

// Inicia o processo
deploy();
