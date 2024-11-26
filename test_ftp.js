import * as ftp from 'basic-ftp';

async function testFTP() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: "ftp.best-onlinestore.site",
            user: "u439528868.lopes01",
            password: "gX~@k/K=Z7*WC9D&",
            secure: false
        });
        console.log("Conexão FTP bem sucedida!");
        
        // Ver diretório atual
        const currentDir = await client.pwd();
        console.log("Diretório atual:", currentDir);
        
        const list = await client.list();
        console.log("Arquivos no diretório:", list);
    }
    catch(err) {
        console.log("Erro:", err);
    }
    client.close();
}

testFTP();
