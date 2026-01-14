
export interface PlayerPlay {
  id: string;
  jogador: string;
  dataISO: string;
  gols: number;
  assist: number;
  time: string;
  capitao: boolean;
  rowIndex?: number;
}

export interface Match {
  id: string;
  dataISO: string;
  time1: string;
  gols1: number;
  time2: string;
  gols2: number;
}

export interface PlayerDailyStat {
  jogador: string;
  gols: number;
  assist: number;
  presencas: number;
  capitaoCount: number;
}

export interface TeamPoints {
  time: string;
  pontos: number;
  vitorias: number;
  golsMarcados: number;
}

export interface DailyStats {
  jogos: Match[];
  statsJogadores: PlayerDailyStat[];
  pontosTimes: TeamPoints[];
  campeaoDoDia: string;
}

export interface RankingItem {
  name: string;
  value: number;
}

export interface DashboardData {
  rankingGols: RankingItem[];
  rankingAssist: RankingItem[];
  rankingGolsAssist: RankingItem[];
  presencaGols: { jogador: string; presencas: number; gols: number; ratio: number }[];
  presencaAssist: { jogador: string; presencas: number; assistencias: number; ratio: number }[];
  nivelPresenca: { jogador: string; presencas: number }[];
  maioresVencedores: { jogador: string; vitorias: number }[];
  ultimaRodada: {
    melhorAssist: { jogador: string; value: number };
    artilheiro: { jogador: string; value: number };
    rankingAssist: RankingItem[];
    rankingGols: RankingItem[];
  };
}

// --- NOVOS TIPOS PARA CONTROLE DE ACESSO ---

export type Routine = 'checkin' | 'escalacao' | 'jogadas' | 'partidas' | 'resultados' | 'dashboard' | 'usuarios' | 'ajuda';

export interface User {
  id: string;
  username: string;
  password?: string;
  isAdmin: boolean;
  routines: Routine[];
}

export enum ToastType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}
