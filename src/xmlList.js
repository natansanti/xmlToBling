const fs = require('fs');
const path = require('path');
const inputPath = path.join(__dirname, '..', 'Input')

//Mapear a pasta Input para descobrir se há arquivos a serem importados

const listarArquivos = async (caminhoDaPasta) => {
    //Array onde estarão os nomes dos arquivos que serão importados
    const list = [];

    //Verifica a existencia das pastas Input e Output, criando-as caso não existam
    if (!fs.existsSync(inputPath))
        fs.mkdirSync(inputPath);

    try {
        //Cria um array onde lista os nomes dos arquivos contidos na pasta Input
        const arquivos = await fs.promises.readdir(caminhoDaPasta);

        //Se a pasta Input estiver vazia, não fazer nada
        if (arquivos.length === 0) {
            console.log('A pasta Input está vazia. Insira os arquivos XML que deseja importar!')
        }

        //Para cada arquivo, será feita uma analise em sua extensão, caso seja XML, será adicionado ao array "list" que será exportado
        for (const arquivo of arquivos) {
            const extensao = path.extname(arquivo);
            if (extensao === '.xml') {
                list.push(arquivo);
            }
        }
    } catch (err) {
        console.error('Erro ao ler a pasta:', err);
    }

    return list;
};


module.exports = listarArquivos(inputPath);
