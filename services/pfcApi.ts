
import { DailyStats, DashboardData, Match, PlayerPlay, User } from '../types';

// Tenta obter a URL da variável de ambiente, senão usa o fallback
const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://script.google.com/macros/s/AKfycbyREKLkLQLFA871c24j-N_gYd0XgVo7kW2J6CbPYWEMHQcwQOQQteg9Vw4DCxJHd25f/exec'; 

let cachedInitialData: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 1500; 

const parseToIso = (dateVal: any): string => {
  if (!dateVal) return "";
  let dateStr = dateVal.toString().trim();
  
  // Trata objetos Date vindos do Google Sheets via JSON
  if (dateStr.length > 15 && dateStr.includes(' ') && !dateStr.includes('/')) {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch(e) {}
  }

  // Trata formato ISO (YYYY-MM-DD)
  if (dateStr.includes('-') && dateStr.indexOf('-') === 4) {
    return dateStr.split('T')[0];
  }
  
  // Trata formato brasileiro (DD/MM/YYYY) vindo da Coluna C
  if (dateStr.includes('/')) {
    const parts = dateStr.split(' ')[0].split('/');
    if (parts.length === 3) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      return `${y}-${m}-${d}`;
    }
  }
  return dateStr;
};

const sendPost = async (action: string, payload: any) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, ...payload })
    });
    cachedInitialData = null; 
    return { success: true };
  } catch (e) {
    console.error(`[API] Erro no POST (${action}):`, e);
    throw e;
  }
};

const fetchFullData = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedInitialData && (now - lastFetchTime < CACHE_TTL)) return cachedInitialData;
  
  try {
    const res = await fetch(`${API_URL}?t=${now}`, { 
      method: 'GET', 
      redirect: 'follow' 
    });
    const data = await res.json();
    
    if (data.error) {
      return { players: [], plays: [], matches: [], teamAssignments: [], users: [] };
    }

    cachedInitialData = data;
    lastFetchTime = Date.now();
    return data;
  } catch (e) {
    console.error("[API] Erro ao buscar dados:", e);
    return cachedInitialData || { players: [], plays: [], matches: [], teamAssignments: [], users: [] };
  }
};

// --- USUÁRIOS ---
export const getUsuariosPlanilha = async (): Promise<User[]> => {
  const data = await fetchFullData();
  return data.users || [];
};

export const saveUsuarioPlanilha = async (user: User) => sendPost('saveUser', user);

export const deleteUsuarioPlanilha = async (userId: string) => sendPost('deleteUser', { id: userId });

// --- OUTROS ---
export const getJogadores = async (): Promise<string[]> => {
  const data = await fetchFullData();
  return (data.players || []).filter(Boolean).sort();
};

export const assignToTeam = async (jogador: string, time: string, dataISO: string) => 
  sendPost('assignToTeam', { jogador, time, dataISO });

export const removeAssignment = async (rowIndex: number) => 
  sendPost('removeAssignment', { rowIndex });

export const confirmArrival = async (jogador: string, dataISO: string) =>
  sendPost('confirmArrival', { jogador, dataISO });

export const getTeamAssignmentsByDate = async (dataISO: string) => {
  const data = await fetchFullData(true);
  const assignments = data.teamAssignments || [];
  return assignments.filter((a: any) => parseToIso(a.data) === dataISO);
};

export const registerPlay = async (payload: Omit<PlayerPlay, 'id'>) => sendPost('registerPlay', payload);
export const editPlay = async (rowIndex: number, payload: Omit<PlayerPlay, 'id'>) => sendPost('editPlay', { rowIndex, ...payload });
export const deletePlay = async (rowIndex: number) => sendPost('deletePlay', { rowIndex });
export const registerMatch = async (payload: Omit<Match, 'id'>) => sendPost('registerMatch', payload);

export const getDailyStats = async (dataISO: string): Promise<DailyStats> => {
  const json = await fetchFullData();
  const plays = json.plays || [];
  const matchesData = json.matches || [];

  const dailyMatches = matchesData.map((m: any, i: number) => ({
    id: `m-${i}`,
    dataISO: parseToIso(m.data),
    time1: m.time1,
    gols1: Number(m.gols1) || 0,
    time2: m.time2,
    gols2: Number(m.gols2) || 0
  })).filter((m: any) => m.dataISO === dataISO);

  // CRÍTICO: Filtra usando estritamente a chave "Data do Jogo" (Coluna C da Planilha)
  const dailyPlays = plays.filter((p: any) => parseToIso(p["Data do Jogo"]) === dataISO);
  
  const statsJogadores = Array.from(new Set(dailyPlays.map((p: any) => p["Jogador"]))).map(nome => {
    const pPlays = dailyPlays.filter((p: any) => p["Jogador"] === nome);
    return {
      jogador: nome as string,
      gols: pPlays.reduce((sum: number, p: any) => sum + (Number(p["Gols"]) || 0), 0),
      assist: pPlays.reduce((sum: number, p: any) => sum + (Number(p["Assistência"] || p["Assist"]) || 0), 0),
      presencas: 1,
      capitaoCount: pPlays.filter((p: any) => (p["Vencedor da rodada"] || p["Capitão"]) === 'Sim').length
    };
  }).sort((a, b) => b.gols - a.gols || b.assist - a.assist);

  const points = ['T1', 'T2', 'T3', 'T4'].map(t => {
    const relevant = dailyMatches.filter((m: any) => m.time1 === t || m.time2 === t);
    let pts = 0; let vits = 0; let gm = 0;
    relevant.forEach((m: any) => {
      const isT1 = m.time1 === t;
      const myG = isT1 ? m.gols1 : m.gols2;
      const otG = isT1 ? m.gols2 : m.gols1;
      gm += myG;
      if (myG > otG) { pts += 3; vits += 1; }
      else if (myG === otG) pts += 1;
    });
    return { time: t, pontos: pts, vitorias: vits, golsMarcados: gm };
  });

  return { 
    jogos: dailyMatches, 
    statsJogadores, 
    pontosTimes: points, 
    campeaoDoDia: [...points].sort((a: any, b: any) => b.pontos - a.pontos || b.golsMarcados - a.golsMarcados)[0]?.time || 'N/A' 
  };
};

export const getRawPlaysByDate = async (dataISO: string): Promise<any[]> => {
  const json = await fetchFullData(true);
  // CRÍTICO: Filtra usando estritamente a chave "Data do Jogo" (Coluna C da Planilha)
  return (json.plays || []).filter((p: any) => parseToIso(p["Data do Jogo"]) === dataISO);
};

export const getDashboardData = async (filters: { ano?: number; jogador?: string }): Promise<DashboardData> => {
  const json = await fetchFullData();
  const plays = json.plays || [];
  const filtered = plays.filter((p: any) => {
    // CRÍTICO: Busca data da Coluna C
    const date = parseToIso(p["Data do Jogo"]);
    return filters.ano ? new Date(date).getUTCFullYear() === filters.ano : true;
  });
  
  const names = Array.from(new Set(filtered.map((p: any) => p["Jogador"]))).filter(Boolean);
  const stats = names.map(nome => {
    const pPlays = filtered.filter((p: any) => p["Jogador"] === nome);
    const presencas = pPlays.length;
    const gols = pPlays.reduce((sum: number, p: any) => sum + (Number(p["Gols"]) || 0), 0);
    const assist = pPlays.reduce((sum: number, p: any) => sum + (Number(p["Assistência"] || p["Assist"]) || 0), 0);
    return { 
      jogador: nome as string, 
      gols, 
      assist, 
      presencas, 
      vitorias: pPlays.filter((p: any) => p["Capitão"] === 'Sim' || p["Vencedor da rodada"] === 'Sim').length, 
      gRatio: presencas > 0 ? (gols/presencas) : 0, 
      aRatio: presencas > 0 ? (assist/presencas) : 0 
    };
  });

  return {
    rankingGols: [...stats].sort((a,b) => b.gols - a.gols).slice(0, 10).map(s => ({ name: s.jogador, value: s.gols })),
    rankingAssist: [...stats].sort((a,b) => b.assist - a.assist).slice(0, 10).map(s => ({ name: s.jogador, value: s.assist })),
    presencaGols: [...stats].sort((a,b) => b.gRatio - a.gRatio).slice(0, 5).map(s => ({ jogador: s.jogador, presencas: s.presencas, gols: s.gols, ratio: Number(s.gRatio.toFixed(2)) })),
    presencaAssist: [...stats].sort((a,b) => b.aRatio - a.aRatio).slice(0, 5).map(s => ({ jogador: s.jogador, presencas: s.presencas, assistencias: s.assist, ratio: Number(s.aRatio.toFixed(2)) })),
    nivelPresenca: [...stats].sort((a,b) => b.presencas - a.presencas).slice(0, 5).map(s => ({ jogador: s.jogador, presencas: s.presencas })),
    maioresVencedores: [...stats].sort((a,b) => b.vitorias - a.vitorias).slice(0, 10).map(s => ({ jogador: s.jogador, vitorias: s.vitorias })),
    ultimaRodada: { melhorAssist: { jogador: "N/A", value: 0 }, artilheiro: { jogador: "N/A", value: 0 }, rankingAssist: [], rankingGols: [] }
  };
};
