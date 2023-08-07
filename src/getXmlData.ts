import { Parser } from 'xml2js';
import fs from 'fs/promises';

interface Duplicata {
    nDup: string[];
    dVenc: string[];
    vDup: number[];
}

interface XmlData {
    cnpj: string;
    emitente: string;
    remtCnpj: string;
    dhSaiEnt: string;
    nNF: string;
    duplicatas: Duplicata[];
    historico: string;
    complement: number;
    valorTotal: number;
}

async function getXmlData(xml: string): Promise<XmlData> {
    try {
        const parser = new Parser();
        const result = await parser.parseStringPromise(xml);

        if (!result?.nfeProc) {
            console.log("Este XML não se trata de uma NFe, portanto deverá ser importado manualmente no sistema.");
            return {
                cnpj: '',
                emitente: '',
                remtCnpj: '',
                dhSaiEnt: '',
                nNF: '',
                duplicatas: [],
                historico: '',
                complement: 0,
                valorTotal: 0
            };
        }

        const destinatario = result?.nfeProc?.NFe?.[0]?.infNFe[0]?.dest[0];
        const cnpj = destinatario?.CNPJ?.[0];
        const emitente = result?.nfeProc?.NFe[0]?.infNFe[0]?.emit[0]?.xNome?.[0];
        const remtCnpj = result?.nfeProc?.NFe[0]?.infNFe[0]?.emit[0]?.CNPJ?.[0];
        const dhSaiEnt = result?.nfeProc?.NFe[0]?.infNFe[0]?.ide[0]?.dhEmi?.[0];
        const nNF = result?.nfeProc?.NFe[0]?.infNFe[0]?.ide[0]?.nNF?.[0];
        const duplicatas = result?.nfeProc?.NFe[0]?.infNFe[0]?.cobr[0]?.dup;
        const valorTotal = parseFloat(result?.nfeProc?.NFe[0]?.infNFe[0]?.total[0]?.ICMSTot[0]?.vProd?.[0] || '0');

        const postDataPath = 'C:/Postdata/Postdata.json';
        const postDataJson = await fs.readFile(postDataPath, 'utf-8');
        const postData = JSON.parse(postDataJson);
        const factoryData = postData?.factories?.[remtCnpj];
        const historico = factoryData?.historico || '';
        const complement = factoryData?.complement || 0;

        const data: XmlData = { cnpj, emitente, dhSaiEnt, duplicatas, nNF, remtCnpj, historico, complement, valorTotal };

        return data;
    } catch (error) {
        console.error('Erro ao processar o arquivo:', error);
        throw error;
    }
}

export default getXmlData;
