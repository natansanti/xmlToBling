const fs = require('fs');
const path = require('path');
const inputPath = './Input';
const outputPath = './Output';

const listarArquivos = async (caminhoDaPasta) => {
    const list = [];

    if (!fs.existsSync(inputPath))
        fs.mkdirSync(inputPath);

    if (!fs.existsSync(outputPath))
        fs.mkdirSync(outputPath);

    try {
        const arquivos = await fs.promises.readdir(caminhoDaPasta);
        if (arquivos.length === 0) {
            console.log('A pasta Input está vazia. Insira os arquivos XML que deseja importar!')
        }
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
