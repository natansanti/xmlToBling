import fs from 'fs/promises';
import path from 'path';

const inputPath = path.join(__dirname, '..', 'Input');

const ensureDirectoriesExist = async () => {
    try {
        try {
            await fs.access(inputPath);
        } catch {
            await fs.mkdir(inputPath);
        }
    } catch (error) {
        console.error('Erro ao verificar ou criar diretórios:', error);
    }
};

const listFilesToImport = async (folderPath = inputPath) => {
    try {
        await ensureDirectoriesExist();

        const files = await fs.readdir(folderPath);
        const xmlFiles = files.filter((file) => path.extname(file) === '.xml');

        if (xmlFiles.length === 0) {
            console.log('A pasta Input está vazia. Insira os arquivos XML que deseja importar!');
        }

        return xmlFiles;
    } catch (error) {
        console.error('Erro ao ler a pasta:', error);
        return [];
    }
};

export default listFilesToImport;