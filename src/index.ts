import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import xmlList from './xmlList';
import apiBlingImport from './api/contasAPagar/create';
import getXmlData from './getXmlData';
import { Mutex } from 'async-mutex';

dotenv.config();

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Definir portador da conta
const getPortador = (cnpj: string): string => {
    switch (cnpj) {
        case '26476477000131':
            return "REPUBLICA DOS MÓVEIS";
        case '02960401000119':
            return "NS SANTI";
        case '21692216000135':
            return "VM SANTI";
        default:
            return "Caixa";
    }
};

(async () => {
    try {
        const files = await xmlList();
        const mainQueueMutex = new Mutex();

        for (const file of files) {
            await mainQueueMutex.runExclusive(async () => {
                try {
                    const data = await fs.readFile(`Input/${file}`, 'utf-8');
                    const {
                        cnpj,
                        emitente,
                        dhSaiEnt,
                        duplicatas,
                        nNF,
                        remtCnpj,
                        historico,
                        complement,
                        valorTotal
                    } = await getXmlData(data);

                    const processDuplicata = async (dup: any, isComplement: boolean) => {
                        const nDup = dup.nDup[0];
                        const dVenc = dup.dVenc[0];
                        const vDup = isComplement
                            ? ((valorTotal / duplicatas.length) / (100 - complement)) * complement
                            : dup.vDup[0];

                        const splitDate = dVenc.split("-");
                        await apiBlingImport({
                            cnpj: remtCnpj,
                            nome: emitente,
                            dataEmissao: format(utcToZonedTime(new Date(dhSaiEnt), 'America/Sao_Paulo'), 'dd/MM/yyyy'),
                            vcto: `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`,
                            nroDocumento: `${nNF} ${duplicatas.length} / ${parseInt(nDup)}`,
                            portador: isComplement ? "Caixa" : getPortador(cnpj),
                            valor: vDup,
                            historico: isComplement ? historico : ''
                        });
                        await sleep(5000); // Aguarda 5 segundos antes da próxima requisição
                    };

                    const duplicatasQueueMutex = new Mutex();
                    const complementQueueMutex = new Mutex();

                    if (duplicatas) {
                        for (const dup of duplicatas) {
                            await duplicatasQueueMutex.runExclusive(async () => {
                                await processDuplicata(dup, false);
                            });
                        }

                        if (complement > 0) {
                            for (const dup of duplicatas) {
                                await complementQueueMutex.runExclusive(async () => {
                                    await processDuplicata(dup, true);
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.error('Erro ao processar o arquivo:', error);
                }
            });
        }
        console.log("O programa encerrará em 3 segundos")
        await sleep(3000)
    } catch (error) {
        console.error('Erro ao obter a lista de arquivos:', error);
    }
})();