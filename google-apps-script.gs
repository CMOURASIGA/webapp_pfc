
/**
 * PELADA PFC - BACKEND (Google Apps Script)
 */

const SPREADSHEET_ID = '1SCSIAF0lPHH9UShJF7x6k8w-CmHWiGyaxAeaVIvHxg4';

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = {
      players: getPlayers(ss),
      plays: getPlays(ss),
      matches: getMatches(ss),
      teamAssignments: getTeamAssignments(ss),
      users: getUsers(ss) // Nova função para carregar usuários
    };
    return createJsonResponse(data);
  } catch (err) {
    return createJsonResponse({ error: true, message: err.toString() });
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const postData = e.postData.contents;
    const data = JSON.parse(postData);
    const action = data.action;

    const sheetTimes = ss.getSheetByName('times');
    const sheetUsers = ss.getSheetByName('usuario');
    const tz = ss.getSpreadsheetTimeZone();

    // --- AÇÃO: SALVAR USUÁRIO ---
    if (action === 'saveUser') {
      if (!sheetUsers) throw new Error("Aba 'usuario' não encontrada.");
      const values = sheetUsers.getDataRange().getValues();
      const username = data.username.toLowerCase().trim();
      let rowIndex = -1;

      // Busca se o usuário já existe para atualizar
      for (let i = 1; i < values.length; i++) {
        if (values[i][1].toString().toLowerCase().trim() === username) {
          rowIndex = i + 1;
          break;
        }
      }

      const rowData = [
        data.id || Utilities.getUuid(),
        username,
        data.password,
        data.isAdmin ? 'Sim' : 'Não',
        data.routines.join(',')
      ];

      if (rowIndex > 0) {
        sheetUsers.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheetUsers.appendRow(rowData);
      }
      return createJsonResponse({ success: true });
    }

    // --- AÇÃO: DELETAR USUÁRIO ---
    if (action === 'deleteUser') {
      if (!sheetUsers) throw new Error("Aba 'usuario' não encontrada.");
      const values = sheetUsers.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (values[i][0].toString() === data.id.toString()) {
          sheetUsers.deleteRow(i + 1);
          break;
        }
      }
      return createJsonResponse({ success: true });
    }

    // --- AÇÃO: ESCALAR JOGADOR ---
    if (action === 'assignToTeam') {
      if (!sheetTimes) throw new Error("Aba 'times' não encontrada.");
      const nomeJogador = data.jogador.toString().trim().toUpperCase();
      const dataFormatada = data.dataISO.split('-').reverse().join('/');
      checkAndAddPlayer(ss, nomeJogador);

      const values = sheetTimes.getDataRange().getValues();
      let rowIndex = -1;
      for (let i = 1; i < values.length; i++) {
        let cellDate = values[i][2];
        let cellDateStr = cellDate instanceof Date ? Utilities.formatDate(cellDate, tz, "dd/MM/yyyy") : cellDate.toString().trim();
        if (values[i][1].toString().trim().toUpperCase() === nomeJogador && cellDateStr === dataFormatada) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex > 0) {
        sheetTimes.getRange(rowIndex, 1).setValue(data.time); 
      } else {
        sheetTimes.appendRow([data.time, nomeJogador, dataFormatada, 'Não']); 
      }
      return createJsonResponse({ success: true });
    }

    // --- AÇÃO: CONFIRMAR CHEGADA (CHECK-IN) ---
    if (action === 'confirmArrival') {
      if (!sheetTimes) throw new Error("Aba 'times' não encontrada.");
      const nomeJogador = data.jogador.toString().trim().toUpperCase();
      const dataFormatada = data.dataISO.split('-').reverse().join('/');
      
      const values = sheetTimes.getDataRange().getValues();
      let foundIndex = -1;
      
      for (let i = 1; i < values.length; i++) {
        let cellDate = values[i][2];
        let cellDateStr = cellDate instanceof Date ? Utilities.formatDate(cellDate, tz, "dd/MM/yyyy") : cellDate.toString().trim();
        
        if (values[i][1].toString().trim().toUpperCase() === nomeJogador && cellDateStr === dataFormatada) {
          foundIndex = i + 1;
          break;
        }
      }
      
      if (foundIndex > 0) {
        sheetTimes.getRange(foundIndex, 4).setValue('Sim');
      } else {
        sheetTimes.appendRow(['A definir', nomeJogador, dataFormatada, 'Sim']);
      }
      return createJsonResponse({ success: true });
    }

    // --- AÇÃO: REMOVER ESCALAÇÃO ---
    if (action === 'removeAssignment' && data.rowIndex) {
      if (sheetTimes) {
        sheetTimes.deleteRow(data.rowIndex);
        return createJsonResponse({ success: true });
      }
    }

    // --- AÇÕES DE JOGADAS ---
    if (action === 'registerPlay' || action === 'editPlay') {
      const sheetPlays = ss.getSheetByName('Respostas ao formulário 1');
      const rowData = [
        new Date(), data.jogador, data.dataISO.split('-').reverse().join('/'),
        'Presente', data.assist || 0, data.gols || 0, 'Última', 
        '', '', '', '', '', '', '', 
        data.capitao ? 'Sim' : 'Não', data.time
      ];
      if (action === 'editPlay' && data.rowIndex) {
        sheetPlays.getRange(data.rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheetPlays.appendRow(rowData);
      }
      return createJsonResponse({ success: true });
    }

    if (action === 'deletePlay' && data.rowIndex) {
      const sheet = ss.getSheetByName('Respostas ao formulário 1');
      if (sheet) sheet.deleteRow(data.rowIndex);
      return createJsonResponse({ success: true });
    }

    if (action === 'registerMatch') {
      const sheet = ss.getSheetByName('Jogos_2025');
      sheet.appendRow([data.dataISO.split('-').reverse().join('/'), data.time1, data.gols1, data.time2, data.gols2]);
      return createJsonResponse({ success: true });
    }

    return createJsonResponse({ error: 'Ação inválida' });
  } catch (err) {
    return createJsonResponse({ error: true, message: err.toString() });
  }
}

function getUsers(ss) {
  const sheet = ss.getSheetByName('usuario');
  if (!sheet) return [];
  const vals = sheet.getDataRange().getValues();
  return vals.slice(1).map(row => ({
    id: row[0],
    username: row[1],
    password: row[2],
    isAdmin: row[3] === 'Sim',
    routines: row[4] ? row[4].toString().split(',') : []
  }));
}

function getPlayers(ss) {
  const sheet = ss.getSheetByName('JOGADORES');
  return sheet ? sheet.getDataRange().getValues().slice(1).map(row => row[0]).filter(Boolean) : [];
}

function getTeamAssignments(ss) {
  const sheet = ss.getSheetByName('times');
  if (!sheet) return [];
  const tz = ss.getSpreadsheetTimeZone();
  const vals = sheet.getDataRange().getValues();
  return vals.slice(1)
    .filter(row => row[1] && row[2]) // Filtra linhas vazias
    .map((row, i) => {
      let d = row[2];
      let dStr = d instanceof Date ? Utilities.formatDate(d, tz, "dd/MM/yyyy") : d.toString().trim();
      return { rowIndex: i + 2, time: row[0], nome: row[1], data: dStr, chegou: row[3] === 'Sim' };
    });
}

function getPlays(ss) {
  const sheet = ss.getSheetByName('Respostas ao formulário 1');
  if (!sheet) return [];
  const vals = sheet.getDataRange().getValues();
  const headers = vals[0].map(h => h.toString().trim());
  return vals.slice(1)
    .filter(row => row[1]) // Filtra linhas sem jogador
    .map((row, idx) => {
      let play = { rowIndex: idx + 2 };
      headers.forEach((h, i) => play[h] = row[i]);
      return play;
    });
}

function getMatches(ss) {
  const sheet = ss.getSheetByName('Jogos_2025');
  if (!sheet) return [];
  const vals = sheet.getDataRange().getValues();
  return vals.slice(1)
    .filter(row => row[0])
    .map(row => ({ data: row[0], time1: row[1], gols1: row[2], time2: row[3], gols2: row[4] }));
}

function checkAndAddPlayer(ss, name) {
  const sheet = ss.getSheetByName('JOGADORES');
  if (!sheet) return;
  const vals = sheet.getDataRange().getValues();
  if (!vals.some(r => r[0].toString().toUpperCase().trim() === name.toUpperCase().trim())) {
    sheet.appendRow([name]);
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
