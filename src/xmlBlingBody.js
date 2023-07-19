const xmlBody = (data) => {
  const { emitente, dhSaiEnt, vcto, documento, portador, valor, cnpj } = data;
  const body = `
  <?xml version="1.0" encoding="UTF-8"?>
<contapagar>
    <dataEmissao>${dhSaiEnt}</dataEmissao>
    <vencimentoOriginal>${vcto}</vencimentoOriginal>
    <competencia>${vcto}</competencia>
    <nroDocumento>${documento}</nroDocumento> 
    <valor>${valor}</valor>
    <historico></historico>
    <categoria>Compras de Fornecedores</categoria>
    <portador>${portador}</portador> 
    <ocorrencia>
    <ocorrenciaTipo>U</ocorrenciaTipo>
    </ocorrencia>
    <fornecedor>
    <nome>${emitente}</nome>
    <cpf_cnpj>${cnpj}</cpf_cnpj>
    </fornecedor> 
</contapagar>
  `

  return body
}

module.exports = xmlBody