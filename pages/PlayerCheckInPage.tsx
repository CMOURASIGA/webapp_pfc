
import React, { useState, useEffect, useCallback } from 'react';
import { getTeamAssignmentsByDate, confirmArrival } from '../services/pfcApi';
import { ToastType } from '../types';
import { getTodayISO } from '../utils/dateUtils';
import { UserCheck, Search, ChevronRight, CheckCircle2, ArrowLeft, Send, Users, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/feedback/LoadingSpinner';

interface PlayerCheckInPageProps {
  onToast: (text: string, type: ToastType) => void;
}

const PlayerCheckInPage: React.FC<PlayerCheckInPageProps> = ({ onToast }) => {
  const [step, setStep] = useState(1); 
  const [data, setData] = useState(getTodayISO()); // Data agora é editável
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

  // FILTRO: Apenas jogadores escalados para hoje que ainda não chegaram (chegou: false)
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
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
      {/* CABEÇALHO */}
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-[#0b2340] rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl rotate-3 mb-6">
          <UserCheck className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-[#0b2340] uppercase tracking-tighter">Chegada PFC</h1>
        <p className="text-gray-900 font-bold text-xs uppercase tracking-widest italic">Confirme que você já está na quadra</p>
      </div>

      {/* SELETOR DE DATA (Importante para testes e dias de jogo) */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <Calendar className="w-5 h-5 text-[#0b2340]" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Dia da Pelada</span>
            <input 
              type="date" 
              value={data} 
              onChange={(e) => {
                setData(e.target.value);
                setStep(1); // Reseta se mudar a data
              }}
              className="bg-transparent text-sm font-black text-black outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* PASSO 1: QUEM FOI ESCALADO? */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8">
            <h3 className="text-lg font-black text-black uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-100 text-[#0b2340] rounded-full flex items-center justify-center text-sm font-black italic">1</span>
              Selecione seu nome
            </h3>
            
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="BUSCAR ENTRE ESCALADOS..." 
                className="w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-gray-200 outline-none focus:border-[#0b2340] text-sm font-black uppercase text-black placeholder:text-gray-400 bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-[450px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {pendingPlayers.length === 0 ? (
                 <div className="py-20 text-center space-y-4 opacity-40">
                    <Users className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                      {searchTerm ? 'Nenhum jogador escalado com esse nome.' : 'Nenhum jogador pendente de check-in para esta data.'}
                    </p>
                 </div>
              ) : (
                pendingPlayers.map(a => (
                  <button 
                    key={a.rowIndex}
                    onClick={() => { setSelectedPlayer(a.nome); setStep(2); }}
                    className="w-full p-6 bg-white border-2 border-gray-100 hover:border-[#0b2340] hover:bg-gray-50 rounded-2xl flex items-center justify-between transition-all group shadow-sm active:scale-[0.98]"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-black text-base uppercase text-black">{a.nome}</span>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 uppercase">TIME: {a.time}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#0b2340] group-hover:translate-x-1 transition-all" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* PASSO 2: CONFIRMAÇÃO */}
      {step === 2 && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
           <button 
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest hover:text-blue-700 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar à lista
          </button>

          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-10 text-center">
            <div className="w-24 h-24 bg-blue-50 text-[#0b2340] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
               <UserCheck className="w-10 h-10" />
            </div>
            <h3 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Confirmar Chegada</h3>
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter mb-8 leading-tight">
              {selectedPlayer}
            </h2>
            
            <button 
              onClick={handleConfirmArrival}
              className="w-full py-6 bg-[#0b2340] text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-[0_20px_40px_rgba(11,35,64,0.3)] hover:bg-blue-900 transition-all flex items-center justify-center gap-4 active:scale-95 group"
            >
              <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              EU CHEGUEI!
            </button>
          </div>
        </div>
      )}

      {/* PASSO 3: SUCESSO */}
      {step === 3 && (
        <div className="text-center space-y-8 animate-in zoom-in duration-500">
          <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.4)] animate-pulse">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter">Check-in Realizado!</h2>
            <p className="text-gray-900 font-bold text-lg italic">Bom jogo, <span className="text-[#0b2340] underline">{selectedPlayer}</span>!</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border-2 border-emerald-100 shadow-xl inline-block max-w-sm">
             <p className="text-sm font-black text-black uppercase tracking-widest leading-relaxed">Sua presença foi confirmada. Seu time já conta com você no painel!</p>
          </div>
          <button 
            onClick={() => {
              setStep(1);
              setSelectedPlayer('');
              setSearchTerm('');
              loadDailyAssignments();
            }}
            className="block mx-auto py-4 px-8 bg-gray-100 text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 rounded-2xl transition-all active:scale-95"
          >
            Voltar ao início
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerCheckInPage;
