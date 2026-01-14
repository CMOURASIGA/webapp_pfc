
import React, { useState, useEffect, useCallback } from 'react';
import { getTeamAssignmentsByDate, registerPlay, editPlay, deletePlay, getRawPlaysByDate } from '../services/pfcApi';
import { ToastType } from '../types';
import { getTodayISO, formatISOToBR } from '../utils/dateUtils';
import { User, Trophy, HandHeart, Crown, Calendar, Trash2, Edit3, RefreshCw, Filter, Users } from 'lucide-react';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import InfoBanner from '../components/Layout/InfoBanner';

interface RegisterPlayPageProps {
  onToast: (text: string, type: ToastType) => void;
}

const RegisterPlayPage: React.FC<RegisterPlayPageProps> = ({ onToast }) => {
  const [data, setData] = useState(getTodayISO());
  const [scaledPlayers, setScaledPlayers] = useState<{nome: string, time: string}[]>([]);
  const [selectedJogador, setSelectedJogador] = useState('');
  const [gols, setGols] = useState(0);
  const [assist, setAssist] = useState(0);
  const [time, setTime] = useState('T1');
  const [capitao, setCapitao] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dailyPlays, setDailyPlays] = useState<any[]>([]);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playToDelete, setPlayToDelete] = useState<any>(null);

  // Carrega apenas jogadores escalados para a data selecionada
  const loadScaledPlayers = useCallback(async () => {
    setTableLoading(true);
    try {
      const assignments = await getTeamAssignmentsByDate(data);
      const players = assignments.map((a: any) => ({
        nome: a.nome,
        time: a.time
      })).sort((a: any, b: any) => a.nome.localeCompare(b.nome));
      
      setScaledPlayers(players);
    } catch (err) {
      onToast('Erro ao buscar escalados.', ToastType.ERROR);
    } finally {
      setTableLoading(false);
    }
  }, [data, onToast]);

  const loadDailyPlays = useCallback(async () => {
    setTableLoading(true);
    try {
      const plays = await getRawPlaysByDate(data);
      setDailyPlays(plays);
    } catch (err) {
      onToast('Erro ao carregar registros.', ToastType.ERROR);
    } finally {
      setTableLoading(false);
    }
  }, [data, onToast]);

  useEffect(() => { 
    loadScaledPlayers();
    loadDailyPlays();
  }, [loadScaledPlayers, loadDailyPlays]);

  const handleSelectPlayer = (playerValue: string) => {
    setSelectedJogador(playerValue);
    // Auto-seleciona o time que o jogador está escalado
    const found = scaledPlayers.find(p => p.nome === playerValue);
    if (found) setTime(found.time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJogador) {
      onToast('Selecione um atleta escalado.', ToastType.ERROR);
      return;
    }

    setLoading(true);
    try {
      const payload = { jogador: selectedJogador, dataISO: data, gols, assist, time, capitao };

      if (editingRowIndex) {
        await editPlay(editingRowIndex, payload);
        onToast('Atualizado!', ToastType.SUCCESS);
        setEditingRowIndex(null);
      } else {
        await registerPlay(payload);
        onToast('Registrado!', ToastType.SUCCESS);
      }
      
      setGols(0); 
      setAssist(0); 
      setCapitao(false);
      setSelectedJogador('');
      
      setTimeout(loadDailyPlays, 1500);
    } catch (err) {
      onToast('Erro ao salvar.', ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (play: any) => {
    const idx = play.rowIndex || play.RowIndex || play.index || play.id;
    setEditingRowIndex(Number(idx));
    setSelectedJogador(play["Jogador"] || '');
    setTime(play["Time"] || 'T1');
    setGols(Number(play["Gols"] || 0));
    setAssist(Number(play["Assistência"] || play["Assist"] || 0));
    setCapitao(play["Capitão"] === 'Sim' || play["Vencedor da rodada"] === 'Sim');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDelete = async () => {
    if (!playToDelete) return;
    const idx = playToDelete.rowIndex || playToDelete.RowIndex || playToDelete.index || playToDelete.id;
    setLoading(true);
    setShowDeleteModal(false);
    setTableLoading(true);
    try {
      await deletePlay(Number(idx));
      onToast('Excluído.', ToastType.SUCCESS);
      setTimeout(loadDailyPlays, 1000);
    } catch (err) {
      onToast('Erro ao excluir.', ToastType.ERROR);
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <InfoBanner 
        variant="purple"
        text="Selecione a data e o atleta para lançar os scouts. Apenas atletas que passaram pela escalaçao/check-in aparecem na lista."
      />

      <section className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-[#0b2340] uppercase tracking-tighter">
              {editingRowIndex ? 'Editar Scout' : 'Lançar Gols'}
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registros Individuais</p>
          </div>
          {editingRowIndex && (
            <button 
              onClick={() => { setEditingRowIndex(null); setSelectedJogador(''); }} 
              className="bg-rose-50 text-rose-500 px-4 py-2 rounded-xl font-black text-[10px] uppercase border border-rose-100"
            >
              Cancelar
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SELETOR DE DATA */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Data da Rodada
            </label>
            <input 
              type="date"
              value={data}
              onChange={(e) => {
                setData(e.target.value);
                setSelectedJogador(''); // Reseta seleção ao mudar data
              }}
              className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-900 font-black text-sm outline-none focus:border-[#0b2340] focus:bg-white transition-all"
            />
          </div>

          {/* SELETOR DE ATLETA ESCALADO */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Atleta Escalado
            </label>
            <select
              value={selectedJogador}
              onChange={(e) => handleSelectPlayer(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-900 font-black text-sm outline-none focus:border-[#0b2340] focus:bg-white transition-all disabled:opacity-50"
              disabled={tableLoading}
            >
              <option value="" disabled>{tableLoading ? 'CARREGANDO...' : 'SELECIONE O ATLETA...'}</option>
              {scaledPlayers.length === 0 && !tableLoading && (
                <option value="" disabled>NENHUM ATLETA ESCALADO NESTA DATA</option>
              )}
              {scaledPlayers.map((p) => (
                <option key={p.nome} value={p.nome}>
                  {p.nome} ({p.time})
                </option>
              ))}
            </select>
            {scaledPlayers.length === 0 && !tableLoading && (
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-tighter mt-1 ml-1 animate-pulse">
                * Vá para 'Times' e realize a escalação primeiro.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gols Marcados</label>
              <select value={gols} onChange={(e) => setGols(Number(e.target.value))} className="w-full px-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 text-2xl text-center font-black focus:border-rose-500 transition-all">
                {[...Array(11)].map((_, i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assistências</label>
              <select value={assist} onChange={(e) => setAssist(Number(e.target.value))} className="w-full px-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 text-2xl text-center font-black focus:border-blue-500 transition-all">
                {[...Array(11)].map((_, i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setCapitao(!capitao)}
            className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
              capitao ? 'bg-yellow-50 border-yellow-400 text-yellow-700 shadow-inner' : 'bg-gray-50 border-transparent text-gray-400'
            }`}
          >
             <div className="flex items-center gap-3">
              <Crown className={`w-6 h-6 ${capitao ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black uppercase tracking-widest">Destaque / Vencedor</span>
                <span className="text-[8px] font-black uppercase opacity-60">Marcar como capitão da rodada</span>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${capitao ? 'bg-yellow-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${capitao ? 'right-1' : 'left-1'}`} />
            </div>
          </button>

          <button 
            type="submit" 
            disabled={loading || !selectedJogador} 
            className="w-full py-6 bg-[#0b2340] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:shadow-blue-900/20 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
          >
            {loading ? 'SINCRONIZANDO...' : editingRowIndex ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR LANÇAMENTO'}
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <Filter className="w-4 h-4" /> Histórico do Dia
          </h3>
          <button 
            onClick={loadDailyPlays} 
            className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-[#0b2340] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${tableLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {tableLoading ? (
          <div className="bg-white rounded-[2rem] p-12 flex justify-center">
            <RefreshCw className="w-8 h-8 text-blue-200 animate-spin" />
          </div>
        ) : dailyPlays.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-gray-100">
             <Users className="w-12 h-12 text-gray-100 mx-auto mb-4" />
             <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">Nenhum scout registrado nesta data</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dailyPlays.map((p, i) => (
              <div key={i} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400 shadow-inner group-hover:bg-[#0b2340] group-hover:text-white transition-colors">
                    {p["Jogador"]?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm uppercase text-gray-900">{p["Jogador"]}</span>
                      {(p["Capitão"] === 'Sim' || p["Vencedor da rodada"] === 'Sim') && <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md text-[8px] font-black border border-rose-100 uppercase">
                        <Trophy className="w-2 h-2" /> {p["Gols"] || 0} GOLS
                      </div>
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[8px] font-black border border-blue-100 uppercase">
                        <HandHeart className="w-2 h-2" /> {p["Assistência"] || 0} AST
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(p)} className="p-3 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-xl transition-all"><Edit3 className="w-5 h-5" /></button>
                  <button onClick={() => { setPlayToDelete(p); setShowDeleteModal(true); }} className="p-3 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#0b2340]/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 text-center space-y-6 shadow-2xl border border-white/20 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
               <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Excluir Registro?</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">Essa ação não pode ser desfeita.</p>
            </div>
            <p className="bg-gray-50 py-3 rounded-xl text-gray-900 font-black uppercase text-xs border border-gray-100">{playToDelete?.["Jogador"]}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="flex-1 py-4 bg-gray-100 text-gray-400 font-black uppercase text-[10px] rounded-2xl"
              >
                Voltar
              </button>
              <button 
                onClick={executeDelete} 
                className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-rose-200"
              >
                Sim, Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPlayPage;
