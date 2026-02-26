const SPREADSHEET_ID = '1cxTOB1EtTtXS_D_X6Heupn8c0t3DVffXNBn1UvNg1_0';

// ✅ TESTE DE URL: Cole a URL do seu script no navegador. 
// Se aparecer "CONEXÃO OK", a URL está correta.
function doGet(e) {
  if (e.parameter.action === 'checkCpf') {
    const cpf = e.parameter.cpf;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Inscrições');
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({ exists: false })).setMimeType(ContentService.MimeType.JSON);
    
    const data = sheet.getDataRange().getValues();
    // O CPF será salvo na coluna 9 (índice 8)
    const exists = data.some(row => row[8] === cpf);
    
    return ContentService.createTextOutput(JSON.stringify({ exists: exists }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("CONEXÃO OK - O SCRIPT ESTÁ ONLINE").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logSheet = ss.getSheetByName('Log') || ss.insertSheet('Log');
  const sheet = ss.getSheetByName('Inscrições') || ss.insertSheet('Inscrições');

  try {
    // Registra que algo chegou
    logSheet.appendRow([new Date(), "REQUISIÇÃO RECEBIDA", e.postData.type]);

    let data;
    const contents = e.postData.contents;
    
    // Tenta parsear o JSON que vem no corpo da mensagem
    try {
      data = JSON.parse(contents);
    } catch (err) {
      // Se falhar, tenta extrair de um parâmetro chamado 'payload' (comum em envios de formulário)
      if (e.parameter.payload) {
        data = JSON.parse(e.parameter.payload);
      } else {
        throw new Error("Não foi possível encontrar dados válidos no corpo da requisição.");
      }
    }

    logSheet.appendRow([new Date(), "DADOS PARSEADOS", JSON.stringify(data)]);

    const finalData = data.data ? data.data : data;
    const participantes = finalData.participantes || [];

    participantes.forEach((p, index) => {
      sheet.appendRow([
        new Date(),
        p.nome || '',
        "'" + (p.telefone || ''),
        p.tipo || '',
        p.valor || 0,
        finalData.pagamento || '',
        finalData.total || 0,
        finalData.clientRequestId || '',
        index === 0 ? p.cpf || '' : '' // CPF do responsável na coluna 9
      ]);
    });

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    logSheet.appendRow([new Date(), "ERRO NO PROCESSAMENTO", err.toString()]);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
