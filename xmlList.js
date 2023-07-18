const fs = require('fs');
const path = require('path');

const caminhoDaPasta = './Input';


const listarArquivos = async (caminhoDaPasta) => {
    const list = [];

    try {
        const arquivos = await fs.promises.readdir(caminhoDaPasta);
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


module.exports = listarArquivos(caminhoDaPasta);
