
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
      users: getUsers(ss)
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

    // --- AÇÕES DE USUÁRIO E ESCALAÇÃO ---
    if (action === 'saveUser') {
      if (!sheetUsers) throw new Error("Aba 'usuario' não encontrada.");
      const values = sheetUsers.getDataRange().getValues();
      const username = data.username.toLowerCase().trim();
      let rowIndex = -1;
      for (let i = 1; i < values.length; i++) {
        if (values[i][1].toString().toLowerCase().trim() === username) { rowIndex = i + 1; break; }
      }
      const rowData = [data.id || Utilities.getUuid(), username, data.password, data.isAdmin ? 'Sim' : 'Não', data.routines.join(',')];
      if (rowIndex > 0) { sheetUsers.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]); }
      else { sheetUsers.appendRow(rowData); }
      return createJsonResponse({ success: true });
    }

    if (action === 'deleteUser') {
      if (!sheetUsers) throw new Error("Aba 'usuario' não encontrada.");
      const values = sheetUsers.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (values[i][0].toString() === data.id.toString()) { sheetUsers.deleteRow(i + 1); break; }
      }
      return createJsonResponse({ success: true });
    }

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
        if (values[i][1].toString().trim().toUpperCase() === nomeJogador && cellDateStr === dataFormatada) { rowIndex = i + 1; break; }
      }
      if (rowIndex > 0) { sheetTimes.getRange(rowIndex, 1).setValue(data.time); }
      else { sheetTimes.appendRow([data.time, nomeJogador, dataFormatada, 'Não']); }
      return createJsonResponse({ success: true });
    }

    if (action === 'confirmArrival') {
      if (!sheetTimes) throw new Error("Aba 'times' não encontrada.");
      const nomeJogador = data.jogador.toString().trim().toUpperCase();
      const dataFormatada = data.dataISO.split('-').reverse().join('/');
      const values = sheetTimes.getDataRange().getValues();
      let foundIndex = -1;
      for (let i = 1; i < values.length; i++) {
        let cellDate = values[i][2];
        let cellDateStr = cellDate instanceof Date ? Utilities.formatDate(cellDate, tz, "dd/MM/yyyy") : cellDate.toString().trim();
        if (values[i][1].toString().trim().toUpperCase() === nomeJogador && cellDateStr === dataFormatada) { foundIndex = i + 1; break; }
      }
      if (foundIndex > 0) { sheetTimes.getRange(foundIndex, 4).setValue('Sim'); }
      else { sheetTimes.appendRow(['A definir', nomeJogador, dataFormatada, 'Sim']); }
      return createJsonResponse({ success: true });
    }

    // --- LANÇAMENTO DE SCOUTS (RESPOSTAS AO FORMULÁRIO 1) ---
    if (action === 'registerPlay' || action === 'editPlay') {
      const sheetPlays = ss.getSheetByName('Respostas ao formulário 1');
      const rowData = [
        new Date(),                                  // A: Carimbo
        data.jogador,                                // B: Jogador
        data.dataISO.split('-').reverse().join('/'), // C: Data do Jogo (A QUE VOCÊ PEDIU)
        'Presente',                                  // D: Presença
        data.assist || 0,                            // E: Assistência
        data.gols || 0,                              // F: Gols
        'Última',                                    // G: Última Datas
        '', '', '', '', '', '', '',                  // H a N
        data.capitao ? 'Sim' : 'Não',                // O: Capitão
        data.time                                    // P: Time
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

    // --- LANÇAMENTO DE PLACAR (JOGOS_2025) ---
    if (action === 'registerMatch') {
      const sheetMatches = ss.getSheetByName('Jogos_2025');
      if (sheetMatches) {
        // GARANTIA: Coluna A recebe a data convertida de YYYY-MM-DD para DD/MM/YYYY
        const dataFormatada = data.dataISO.split('-').reverse().join('/');
        const rowData = [
          dataFormatada, // A: Data
          data.time1,    // B: Time 1
          data.gols1,    // C: Gols T1
          data.time2,    // D: Time 2
          data.gols2     // E: Gols T2
        ];
        sheetMatches.appendRow(rowData);
      }
      return createJsonResponse({ success: true });
    }

    return createJsonResponse({ error: 'Ação inválida' });
  } catch (err) {
    return createJsonResponse({ error: true, message: err.toString() });
  }
}

// --- FUNÇÕES DE LEITURA OTIMIZADAS ---

function getMatches(ss) {
  const sheet = ss.getSheetByName('Jogos_2025');
  if (!sheet) return [];
  const tz = ss.getSpreadsheetTimeZone();
  const vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return [];
  
  return vals.slice(1)
    .filter(row => row[0]) // Filtra se tiver data na Coluna A
    .map(row => {
      let d = row[0];
      // Garante que o frontend receba a data como string formatada da Coluna A
      let dStr = d instanceof Date ? Utilities.formatDate(d, tz, "dd/MM/yyyy") : d.toString().trim();
      return { 
        data: dStr,     // Coluna A
        time1: row[1],  // Coluna B
        gols1: row[2],  // Coluna C
        time2: row[3],  // Coluna D
        gols2: row[4]   // Coluna E
      };
    });
}

function getPlays(ss) {
  const sheet = ss.getSheetByName('Respostas ao formulário 1');
  if (!sheet) return [];
  const tz = ss.getSpreadsheetTimeZone();
  const vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return [];
  const headers = vals[0].map(h => h.toString().trim());
  return vals.slice(1)
    .filter(row => row[1]) 
    .map((row, idx) => {
      let play = { rowIndex: idx + 2 };
      headers.forEach((h, i) => {
        let val = row[i];
        if (val instanceof Date) { play[h] = Utilities.formatDate(val, tz, "dd/MM/yyyy"); } 
        else { play[h] = val; }
      });
      return play;
    });
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
    .filter(row => row[1] && row[2])
    .map((row, i) => {
      let d = row[2];
      let dStr = d instanceof Date ? Utilities.formatDate(d, tz, "dd/MM/yyyy") : d.toString().trim();
      return { rowIndex: i + 2, time: row[0], nome: row[1], data: dStr, chegou: row[3] === 'Sim' };
    });
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
