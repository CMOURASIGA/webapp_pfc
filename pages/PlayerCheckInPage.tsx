
import React, { useState, useEffect, useCallback } from 'react';
import { getTeamAssignmentsByDate, confirmArrival } from '../services/pfcApi';
import { ToastType } from '../types';
import { getTodayISO } from '../utils/dateUtils';
import { UserCheck, Search, ChevronRight, CheckCircle2, ArrowLeft, Send, Users, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import InfoBanner from '../components/Layout/InfoBanner';

interface PlayerCheckInPageProps {
  onToast: (text: string, type: ToastType) => void;
}

const PlayerCheckInPage: React.FC<PlayerCheckInPageProps> = ({ onToast }) => {
  const [step, setStep] = useState(1); 
  const [data, setData] = useState(getTodayISO());
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadDailyAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const assigned = await getTeamAssignmentsByDate(data);
      setAssignments(assigned);
    } catch (err) {
      onToast('Erro ao carregar lista de escalados.', ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  }, [data, onToast]);

  useEffect(() => {
    loadDailyAssignments();
  }, [loadDailyAssignments]);

  const pendingPlayers = assignments
    .filter(a => !a.chegou)
    .filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleConfirmArrival = async () => {
    setLoading(true);
    try {
      await confirmArrival(selectedPlayer, data);
      setStep(3);
      onToast('Check-in realizado!', ToastType.SUCCESS);
    } catch (err) {
      onToast('Erro ao confirmar chegada.', ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  if (loading && step !== 3) return <LoadingSpinner text="Sincronizando vestiário..." />;

  return (
    <div className="max-w-xl mx-auto px-1 space-y-6">
      <InfoBanner 
        variant="emerald"
        text="Confirme sua presença aqui para que o organizador saiba que você já está na quadra. Jogadores sem check-in não pontuam por presença."
      />

      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-[#0b2340] rounded-[1.8rem] flex items-center justify-center mx-auto shadow-xl rotate-3 mb-4">
          <UserCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-[#0b2340] uppercase tracking-tighter">Chegada PFC</h1>
        <p className="text-gray-900 font-bold text-[10px] uppercase tracking-widest italic">Confirme que você já está na quadra</p>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Calendar className="w-5 h-5 text-[#0b2340]" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Data</span>
            <input 
              type="date" 
              value={data} 
              onChange={(e) => {
                setData(e.target.value);
                setStep(1);
              }}
              className="bg-transparent text-sm font-black text-black outline-none"
            />
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6">
            <h3 className="text-sm font-black text-black uppercase mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-[#0b2340] rounded-full flex items-center justify-center text-[10px] font-black italic">1</span>
              Quem é você?
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="BUSCAR NOME..." 
                className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-gray-100 outline-none focus:border-[#0b2340] text-xs font-black uppercase text-black bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {pendingPlayers.length === 0 ? (
                 <div className="py-12 text-center space-y-3 opacity-30">
                    <Users className="w-10 h-10 mx-auto text-gray-400" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Nenhum jogador pendente.</p>
                 </div>
              ) : (
                pendingPlayers.map(a => (
                  <button 
                    key={a.rowIndex}
                    onClick={() => { setSelectedPlayer(a.nome); setStep(2); }}
                    className="w-full p-5 bg-white border border-gray-100 hover:border-[#0b2340] rounded-xl flex items-center justify-between transition-all group shadow-sm active:scale-[0.98]"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-black text-sm uppercase text-black">{a.nome}</span>
                      <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 uppercase">TIME: {a.time}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          <button 
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>

          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-blue-50 text-[#0b2340] rounded-full flex items-center justify-center mx-auto mb-4">
               <UserCheck className="w-8 h-8" />
            </div>
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Confirmar Chegada</h3>
            <h2 className="text-2xl font-black text-black uppercase tracking-tighter mb-8 leading-tight">
              {selectedPlayer}
            </h2>
            
            <button 
              onClick={handleConfirmArrival}
              className="w-full py-5 bg-[#0b2340] text-white rounded-[1.5rem] font-black text-lg uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 group"
            >
              <Send className="w-5 h-5" />
              EU CHEGUEI!
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center space-y-6 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-black uppercase tracking-tighter">Check-in Realizado!</h2>
            <p className="text-gray-900 font-bold text-sm italic">Bom jogo, <span className="text-[#0b2340] underline">{selectedPlayer}</span>!</p>
          </div>
          <button 
            onClick={() => { setStep(1); setSelectedPlayer(''); setSearchTerm(''); loadDailyAssignments(); }}
            className="block mx-auto py-4 px-8 bg-gray-100 text-black font-black text-[10px] uppercase tracking-widest rounded-xl"
          >
            Concluir
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerCheckInPage;
