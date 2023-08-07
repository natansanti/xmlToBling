import * as https from 'https'
import * as dotenv from 'dotenv';
import { Parser } from 'xml2js';
import { Bling } from 'bling-erp-api'

dotenv.config();


interface ContaPagar {
  cnpj: string,
  nome: string,
  vcto: string,
  nroDocumento: string,
  historico: string,
  portador: string,
  dataEmissao: string,
  valor: number
}

async function apiBlingImport(data: ContaPagar) {
  const { cnpj, nome, vcto, nroDocumento, historico, portador, dataEmissao, valor } = data

  try {
    const apiKey: string | undefined = process.env.BLING_API_KEY;
    if (apiKey) {
      const blingConnection = new Bling(apiKey)
      await blingConnection.contasAPagar().create({
        dataEmissao,
        fornecedor: {
          cpf_cnpj: cnpj,
          nome
        },
        ocorrencia: {
          ocorrenciaTipo: "U",
        },
        valor,
        categoria: 'Compras de fornecedores',
        competencia: vcto,
        vencimentoOriginal: vcto,
        nroDocumento,
        historico,
        portador,

      })
        .then(res => console.log(`Duplicata de ${nome} ${nroDocumento} importada com sucesso!`))
        .catch(err => console.log(`Erro: ${err.data.errors[0].code}, ${err.data.errors[0].detail}. NF / Duplicata ${nroDocumento} ${nome}`))
    }

    if (!apiKey) {
      console.error('Api key inválida ou inexistente')
    }

  } catch (error) {
    console.error(`Erro na importação: ${error}`);
  }
}

export default apiBlingImport;