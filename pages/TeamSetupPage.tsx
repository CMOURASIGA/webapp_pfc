
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getJogadores, assignToTeam, getTeamAssignmentsByDate, removeAssignment } from '../services/pfcApi';
import { ToastType } from '../types';
import { getTodayISO, formatISOToBR } from '../utils/dateUtils';
import { Users, UserPlus, RefreshCw, Trash2, Calendar, Search, ShieldCheck, CheckCircle2, User, Plus, SignalHigh, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/feedback/LoadingSpinner';

interface TeamSetupPageProps {
  onToast: (text: string, type: ToastType) => void;
}

const TeamSetupPage: React.FC<TeamSetupPageProps> = ({ onToast }) => {
  const [data, setData] = useState(getTodayISO());
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [activeSelectTeam, setActiveSelectTeam] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    setSyncing(true);
    try {
      const [players, assigned] = await Promise.all([
        getJogadores(),
        getTeamAssignmentsByDate(data)
      ]);
      setAllPlayers(players);
      setAssignments(assigned);
    } catch (err) {
      onToast('Erro ao carregar dados em tempo real.', ToastType.ERROR);
    } finally {
      setSyncing(false);
    }
  }, [data, onToast]);

  useEffect(() => {
    loadData();
    // Auto-refresh a cada 30 segundos no painel de escalação
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setActiveSelectTeam(null);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEscalar = async (player: string, team: string) => {
    setLoading(true);
    setActiveSelectTeam(null);
    setSearchTerm('');
    try {
      await assignToTeam(player, team, data);
      onToast(`${player} escalado no ${team}!`, ToastType.SUCCESS);
      loadData();
    } catch (err) {
      onToast('Falha na sincronização.', ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (rowIdx: number) => {
    setLoading(true);
    try {
      await removeAssignment(rowIdx);
      onToast('Escalação removida.', ToastType.SUCCESS);
      loadData();
    } catch (err) {
      onToast('Erro ao remover.', ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const teams = ['T1', 'T2', 'T3', 'T4'];
  const playersAssignedNames = assignments.map(a => a.nome.toUpperCase());
  
  const availablePlayers = allPlayers
    .filter(p => !playersAssignedNames.includes(p.toUpperCase()))
    .filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

  const getTeamPlayers = (team: string) => assignments.filter(a => a.time === team);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-[#0b2340] uppercase tracking-tighter flex items-center gap-3">
            <ShieldCheck className="w-10 h-10" />
            Painel de Escalação
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-black font-bold text-xs uppercase tracking-[0.3em] italic">Monitoramento de Chegada</p>
            <div className="flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded text-[8px] text-emerald-700 font-black animate-pulse border border-emerald-200">
               <SignalHigh className="w-2 h-2" /> LIVE
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-3xl shadow-xl border border-gray-100">
           <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-2xl border-2 border-gray-100 focus-within:border-[#0b2340] transition-colors">
            <Calendar className="w-5 h-5 text-[#0b2340]" />
            <input 
              type="date" 
              value={data} 
              onChange={(e) => setData(e.target.value)} 
              className="bg-transparent text-sm font-black text-black outline-none"
            />
          </div>
          <button onClick={loadData} className="p-4 bg-[#0b2340] text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg">
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {syncing && assignments.length === 0 ? (
        <LoadingSpinner text="Atualizando vestiário..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {teams.map(teamName => {
            const teamPlayers = getTeamPlayers(teamName);
            const arrivedCount = teamPlayers.filter(p => p.chegou).length;
            const isReady = arrivedCount >= 3;
            const isSelecting = activeSelectTeam === teamName;

            return (
              <div 
                key={teamName} 
                className={`group relative bg-white rounded-[3rem] shadow-2xl border-2 transition-all duration-500 flex flex-col min-h-[500px] overflow-hidden ${
                  isReady ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-transparent'
                }`}
              >
                <div className={`p-8 ${isReady ? 'bg-emerald-500' : 'bg-[#0b2340]'} transition-colors duration-500`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="text-white font-black text-4xl leading-none flex items-baseline gap-2">
                        {teamName} 
                        <span className="text-sm font-black opacity-50 uppercase tracking-widest italic">({arrivedCount}/{teamPlayers.length})</span>
                      </h4>
                      <p className="text-white/80 text-[10px] font-black uppercase tracking-widest italic">Jogadores Confirmados</p>
                    </div>
                    {isReady && <CheckCircle2 className="w-8 h-8 text-white animate-in zoom-in" />}
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Escalados</span>
                    <span className="text-2xl font-black text-white">{teamPlayers.length}</span>
                  </div>
                </div>

                <div className="flex-1 p-6 space-y-3 bg-gradient-to-b from-gray-50/50 to-white">
                  {teamPlayers.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center opacity-20 py-8">
                      <Users className="w-12 h-12 mb-2 text-gray-400" />
                      <p className="text-[10px] font-black text-black uppercase tracking-widest">Time em Aberto</p>
                    </div>
                  ) : (
                    teamPlayers.map((p: any, idx: number) => (
                      <div key={idx} className={`flex items-center justify-between p-5 rounded-2xl shadow-sm border animate-in slide-in-from-bottom-2 transition-all ${
                        p.chegou ? 'bg-emerald-50 border-emerald-100 ring-1 ring-emerald-50' : 'bg-white border-gray-100'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                             <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black italic border ${
                               p.chegou ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-gray-100 text-[#0b2340] border-gray-200'
                             }`}>
                               {p.chegou ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                             </span>
                             {p.chegou && (
                               <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                               </div>
                             )}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-black text-sm uppercase ${p.chegou ? 'text-emerald-900' : 'text-black'}`}>{p.nome}</span>
                            {p.chegou && <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none mt-0.5">PRESENTE</span>}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemove(p.rowIndex)}
                          disabled={loading}
                          className={`p-2 rounded-lg transition-all ${
                            p.chegou ? 'text-emerald-200 hover:text-emerald-600' : 'text-gray-300 hover:text-rose-600'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 pt-0 mt-auto" ref={isSelecting ? selectRef : null}>
                  {!isSelecting ? (
                    <button 
                      onClick={() => setActiveSelectTeam(teamName)}
                      className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                        isReady 
                          ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-[#0b2340] text-white hover:bg-blue-900'
                      }`}
                    >
                      <Plus className="w-4 h-4" /> Escalar Novo Atleta
                    </button>
                  ) : (
                    <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-[#0b2340] overflow-hidden animate-in zoom-in-95 duration-200">
                      <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                        <Search className="w-4 h-4 text-black" />
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="BUSCAR ATLETA..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-transparent outline-none text-[10px] font-black uppercase text-black placeholder:text-gray-400"
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                        {searchTerm.length > 0 && !allPlayers.some(p => p.toUpperCase() === searchTerm.toUpperCase()) && (
                          <button 
                            onClick={() => handleEscalar(searchTerm, teamName)}
                            className="w-full px-5 py-5 text-left flex items-center gap-3 bg-blue-50 text-blue-700 border-b border-blue-100 group transition-colors"
                          >
                            <UserPlus className="w-5 h-5" />
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black uppercase text-blue-600">NOVO CADASTRO</span>
                              <span className="text-sm font-black uppercase tracking-tight text-black truncate max-w-[150px]">{searchTerm}</span>
                            </div>
                          </button>
                        )}
                        {availablePlayers.length === 0 && searchTerm === '' ? (
                           <div className="p-10 text-center text-black opacity-30 italic text-[10px] font-black uppercase tracking-widest">Sem atletas disponíveis</div>
                        ) : (
                          availablePlayers.map(player => (
                            <button 
                              key={player}
                              onClick={() => handleEscalar(player, teamName)}
                              className="w-full px-6 py-5 text-left text-sm font-black text-black hover:bg-gray-50 flex items-center justify-between group border-b border-gray-100 last:border-0 transition-colors"
                            >
                              <span className="uppercase tracking-tight">{player}</span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0b2340] group-hover:translate-x-1 transition-all" />
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {isReady && (
                   <div className="absolute top-5 left-1/2 -translate-x-1/2 -rotate-3">
                      <div className="bg-white text-emerald-700 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl border-2 border-emerald-200">
                        TIME PRONTO ({arrivedCount} PRESENTES)
                      </div>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamSetupPage;
