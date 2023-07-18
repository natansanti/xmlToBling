const fs = require('fs');
const xml2js = require('xml2js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { format } = require('date-fns');
const xmlList = require('./xmlList');

// Função para buscar o CNPJ do destinatário no XML
function getDestinatarioCNPJ(xml) {
    return new Promise((resolve, reject) => {
        const parser = new xml2js.Parser();
        parser.parseString(xml, (err, result) => {
            if (err) {
                reject(err);
            } else {
                const destinatario = result?.nfeProc?.NFe?.[0]?.infNFe[0]?.dest[0];
                const cnpj = destinatario?.CNPJ[0];
                const emitente = result?.nfeProc?.NFe[0]?.infNFe[0]?.emit[0]?.xNome[0];
                const dhSaiEnt = result?.nfeProc?.NFe[0]?.infNFe[0]?.ide[0]?.dhEmi[0];
                const nNF = result?.nfeProc?.NFe[0]?.infNFe[0]?.ide[0]?.nNF[0];
                const duplicatas = result?.nfeProc?.NFe[0]?.infNFe[0]?.cobr[0]?.dup;

                const data = { cnpj, emitente, dhSaiEnt, duplicatas, nNF };
                resolve(data);
            }
        });
    });
}

// Função para formatar a data no formato DD/MM/YYYY
function formatDate(date) {
    return format(date, 'dd/MM/yyyy', { timeZone: 'America/Sao_Paulo' });
}


xmlList.then((arquivos) => {
    arquivos.forEach((arquivo) => {
        fs.readFile(`Input/${arquivo}`, 'utf-8', async (err, data) => {
            if (err) {
                console.error('Erro ao ler o arquivo XML:', err);
            } else {
                try {
                    const {
                        cnpj, emitente, dhSaiEnt, duplicatas, nNF
                    } = await getDestinatarioCNPJ(data);
                    // Chamar a função para buscar o CNPJ do destinatário
                    const portador = () => {
                        let portador;

                        switch (cnpj) {
                            case '26476477000131':
                                portador = "REPUBLICA DOS MÓVEIS";
                                break;
                            case '02960401000119':
                                portador = "NS SANTI";
                                break;
                            case '21692216000135':
                                portador = "VM SANTI";
                                break;
                            default:
                                portador = "Caixa";
                        }
                        return portador;
                    };

                    // Definir o nome do arquivo CSV
                    const csvFilePath = `Output/${nNF} duplicatas.csv`

                    // Criar o escritor CSV
                    const csvWriter = createCsvWriter({
                        path: csvFilePath,
                        header: [
                            { id: 'ID', title: 'ID' },
                            { id: 'Cliente', title: 'Cliente' },
                            { id: 'Data de emissão', title: 'Data de emissão' },
                            { id: 'Data de vencimento', title: 'Data de vencimento' },
                            { id: 'Data de liquidação', title: 'Data de liquidação' },
                            { id: 'Valor do documento', title: 'Valor do documento' },
                            { id: 'Valor pago', title: 'Valor pago' },
                            { id: 'Situação', title: 'Situação' },
                            { id: 'Nº Documento', title: 'Nº Documento' },
                            { id: 'Nº no Banco', title: 'Nº no Banco' },
                            { id: 'Categoria', title: 'Categoria' },
                            { id: 'Histórico', title: 'Histórico' },
                            { id: 'Portador', title: 'Portador' },
                            { id: 'Vencimento original', title: 'Vencimento original' },
                            { id: 'Forma de pagamento', title: 'Forma de pagamento' },
                            { id: 'Competência', title: 'Competência' }
                        ],
                        fieldDelimiter: ';' // Definir o delimitador de campo como ';'
                    });

                    // Formatar os dados das duplicatas

                    const quantDupl = duplicatas.length

                    const formattedDuplicatas = duplicatas.map((dup, index) => {
                        const nDup = dup.nDup[0];
                        const dVenc = dup.dVenc[0];
                        const vDup = dup.vDup[0];

                        const splitDate = dVenc.split("-")
                        const formattedDate = `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`


                        return {
                            ID: '',
                            Cliente: emitente,
                            'Data de emissão': formatDate(new Date(dhSaiEnt)),
                            'Data de vencimento': formattedDate,
                            'Data de liquidação': '',
                            'Valor do documento': vDup.replace(".", ","),
                            'Valor pago': '0',
                            Situação: 'Aberto',
                            'Nº Documento': `${nNF} ${quantDupl} / ${parseInt(nDup)}`,
                            'Nº no Banco': '',
                            Categoria: 'Compras de Fornecedores',
                            Histórico: '',
                            Portador: portador(),
                            'Vencimento original': formattedDate,
                            'Forma de pagamento': '',
                            Competência: ''
                        };
                    });

                    // Escrever os dados no arquivo CSV
                    csvWriter.writeRecords(formattedDuplicatas)
                        .then(() => console.log(`Arquivo CSV gerado com sucesso: ${csvFilePath}`))
                        .catch(err => console.error('Erro ao gerar arquivo CSV:', err));
                } catch (err) {
                    console.error('Erro ao buscar o CNPJ do destinatário:', err);
                }
            }
        });
    });
}).catch((err) => {
    console.error('Erro ao listar arquivos:', err);
});

