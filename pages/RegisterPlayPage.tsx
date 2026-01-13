
import React, { useState, useEffect, useCallback } from 'react';
import { getJogadores, registerPlay, editPlay, deletePlay, getRawPlaysByDate } from '../services/pfcApi';
import { ToastType } from '../types';
import { getTodayISO, formatISOToBR } from '../utils/dateUtils';
import { User, Trophy, HandHeart, Crown, PlusCircle, ArrowLeft, Trash2, Edit3, Save, X, RefreshCw, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../components/feedback/LoadingSpinner';

interface RegisterPlayPageProps {
  onToast: (text: string, type: ToastType) => void;
}

const RegisterPlayPage: React.FC<RegisterPlayPageProps> = ({ onToast }) => {
  const [jogadores, setJogadores] = useState<string[]>([]);
  const [selectedJogador, setSelectedJogador] = useState('');
  const [novoJogador, setNovoJogador] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [data, setData] = useState(getTodayISO());
  const [gols, setGols] = useState(0);
  const [assist, setAssist] = useState(0);
  const [time, setTime] = useState('T1');
  const [capitao, setCapitao] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dailyPlays, setDailyPlays] = useState<any[]>([]);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  // Estados para o Modal de Confirmação de Exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playToDelete, setPlayToDelete] = useState<any>(null);

  const loadPlayers = useCallback(async () => {
    const list = await getJogadores();
    setJogadores(list);
  }, []);

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
    loadPlayers();
  }, [loadPlayers]);

  useEffect(() => {
    loadDailyPlays();
  }, [loadDailyPlays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalJogador = isAddingNew ? novoJogador.trim().toUpperCase() : selectedJogador;

    if (!finalJogador) {
      onToast('Selecione ou digite o nome do atleta.', ToastType.ERROR);
      return;
    }

    setLoading(true);
    try {
      const payload = { jogador: finalJogador, dataISO: data, gols, assist, time, capitao };

      if (editingRowIndex) {
        await editPlay(editingRowIndex, payload);
        onToast(`Registro de ${finalJogador} atualizado!`, ToastType.SUCCESS);
        setEditingRowIndex(null);
      } else {
        await registerPlay(payload);
        onToast(`Jogada de ${finalJogador} registrada!`, ToastType.SUCCESS);
      }
      
      setGols(0); setAssist(0); setCapitao(false);
      if (isAddingNew) { setIsAddingNew(false); setNovoJogador(''); loadPlayers(); }
      
      setTimeout(loadDailyPlays, 2000);
    } catch (err) {
      onToast('Erro de conexão com o banco de dados.', ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (play: any) => {
    const idx = play.rowIndex || play.RowIndex || play.index || play.id;
    if (!idx) {
      onToast('Não foi possível identificar a linha para edição.', ToastType.ERROR);
      return;
    }
    
    setEditingRowIndex(Number(idx));
    setSelectedJogador(play["Jogador"] || '');
    setIsAddingNew(false);
    setTime(play["Time"] || 'T1');
    setGols(Number(play["Gols"] || 0));
    setAssist(Number(play["Assistência"] || play["Assist"] || 0));
    setCapitao(play["Capitão"] === 'Sim' || play["Vencedor da rodada"] === 'Sim');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Abre a "tela inicial" de exclusão (Modal)
  const openDeleteConfirmation = (play: any) => {
    setPlayToDelete(play);
    setShowDeleteModal(true);
  };

  // Executa a exclusão de fato após confirmação no modal
  const executeDelete = async () => {
    if (!playToDelete) return;
    
    const idx = playToDelete.rowIndex || playToDelete.RowIndex || playToDelete.index || playToDelete.id;
    
    setLoading(true); // Mostrar loading no botão do modal se quiser, ou usar o global
    setShowDeleteModal(false); // Fecha o modal imediatamente para UX fluida
    setTableLoading(true);

    try {
      await deletePlay(Number(idx));
      onToast(`Registro excluído com sucesso.`, ToastType.SUCCESS);
      setPlayToDelete(null);
      setTimeout(loadDailyPlays, 1500);
    } catch (err) {
      onToast('Falha ao excluir o registro.', ToastType.ERROR);
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 relative">
      
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Confirmar Exclusão?</h3>
              <p className="text-gray-500 text-sm font-medium">
                Você está prestes a apagar o registro de <strong className="text-gray-900">{playToDelete?.["Jogador"]}</strong>. 
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button 
                onClick={() => { setShowDeleteModal(false); setPlayToDelete(null); }}
                className="flex-1 py-6 font-black text-gray-400 uppercase text-xs tracking-widest hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-6 font-black text-rose-600 uppercase text-xs tracking-widest hover:bg-rose-50 transition-colors border-l border-gray-100"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMULÁRIO DE REGISTRO */}
      <section className="max-w-xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-[#0b2340] tracking-tighter uppercase leading-none">
              {editingRowIndex ? 'Editar Atleta' : 'Novo Registro'}
            </h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest italic">Painel de Lançamento</p>
          </div>
          {editingRowIndex && (
            <button onClick={() => { setEditingRowIndex(null); setSelectedJogador(''); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase hover:bg-rose-100 transition-colors">
              <X className="w-3 h-3" /> Cancelar
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-2xl p-8 space-y-8 border border-gray-100 relative">
          {editingRowIndex && <div className="absolute inset-0 bg-blue-50/10 border-2 border-blue-500 rounded-[2rem] pointer-events-none animate-pulse" />}
          
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              <User className="w-4 h-4 text-[#0b2340]" /> Atleta
            </label>
            
            {!isAddingNew ? (
              <div className="relative">
                <select
                  value={selectedJogador}
                  onChange={(e) => e.target.value === 'NEW' ? setIsAddingNew(true) : setSelectedJogador(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#0b2340] outline-none bg-gray-50 text-gray-900 font-black text-lg appearance-none cursor-pointer"
                >
                  <option value="" disabled>SELECIONE...</option>
                  <option value="NEW" className="text-blue-600 font-black">+ CADASTRAR NOVO</option>
                  {jogadores.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
                <PlusCircle className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
              </div>
            ) : (
              <div className="relative animate-in slide-in-from-top-2">
                <input
                  type="text"
                  autoFocus
                  value={novoJogador}
                  onChange={(e) => setNovoJogador(e.target.value.toUpperCase())}
                  placeholder="NOME COMPLETO..."
                  className="w-full px-5 py-4 rounded-2xl border-2 border-blue-200 outline-none bg-blue-50 text-gray-900 font-black text-lg uppercase"
                />
                <button type="button" onClick={() => setIsAddingNew(false)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-blue-500 font-black text-[10px] flex items-center gap-1 bg-white rounded-lg shadow-sm border border-blue-100 uppercase">
                  <ArrowLeft className="w-3 h-3" /> Voltar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data</label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-900 font-black text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Time</label>
              <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-900 font-black text-sm cursor-pointer">
                {['T1', 'T2', 'T3', 'T4'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"><Trophy className="w-4 h-4 text-rose-500" /> Gols</label>
              <select value={gols} onChange={(e) => setGols(Number(e.target.value))} className="w-full px-5 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-2xl text-center font-black text-gray-900">{[...Array(16)].map((_, i) => <option key={i} value={i}>{i}</option>)}</select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"><HandHeart className="w-4 h-4 text-sky-500" /> Assists</label>
              <select value={assist} onChange={(e) => setAssist(Number(e.target.value))} className="w-full px-5 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-2xl text-center font-black text-gray-900">{[...Array(11)].map((_, i) => <option key={i} value={i}>{i}</option>)}</select>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 cursor-pointer" onClick={() => setCapitao(!capitao)}>
             <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl transition-all ${capitao ? 'bg-yellow-400 text-white rotate-12' : 'bg-gray-200 text-gray-400'}`}><Crown className="w-6 h-6" /></div>
              <span className="text-sm font-black text-[#0b2340] uppercase">Capitão?</span>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${capitao ? 'bg-[#0b2340]' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${capitao ? 'right-1' : 'left-1'}`} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 rounded-[2rem] bg-[#0b2340] text-white font-black text-xl hover:bg-blue-900 shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
            {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : editingRowIndex ? <Save className="w-6 h-6" /> : null}
            {loading ? 'SINCRONIZANDO...' : editingRowIndex ? 'SALVAR ALTERAÇÃO' : 'CONFIRMAR JOGADA'}
          </button>
        </form>
      </section>

      {/* TABELA DE RESULTADOS DO DIA */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
           <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#0b2340] rounded-full"></div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Estatísticas {formatISOToBR(data)}</h3>
          </div>
          <button onClick={loadDailyPlays} className="p-2 text-[#0b2340] hover:bg-white rounded-full transition-all shadow-sm">
            <RefreshCw className={`w-5 h-5 ${tableLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {tableLoading ? (
          <div className="py-20 bg-white rounded-[2rem] shadow-sm flex justify-center"><LoadingSpinner text="Consultando Planilha..." /></div>
        ) : dailyPlays.length === 0 ? (
          <div className="py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
            <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Nenhum registro para esta data.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0b2340] text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-6">Atleta</th>
                    <th className="px-6 py-6 text-center">T</th>
                    <th className="px-6 py-6 text-center">G</th>
                    <th className="px-6 py-6 text-center">A</th>
                    <th className="px-6 py-6 text-center">C</th>
                    <th className="px-6 py-6 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium">
                  {dailyPlays.map((p, i) => (
                    <tr key={i} className={`group ${editingRowIndex === (p.rowIndex || p.RowIndex) ? 'bg-blue-50' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-6 py-5 font-black text-gray-900 text-sm uppercase">
                        {p["Jogador"]}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-[10px] font-black bg-gray-100 text-gray-900 px-2 py-1 rounded-md">
                          {p["Time"] || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center font-black text-gray-900">
                        {p["Gols"] !== undefined ? p["Gols"] : 0}
                      </td>
                      <td className="px-6 py-5 text-center font-black text-gray-900">
                        {p["Assistência"] !== undefined ? p["Assistência"] : (p["Assist"] || 0)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {(p["Capitão"] === 'Sim' || p["Vencedor da rodada"] === 'Sim') ? (
                          <Crown className="w-4 h-4 text-yellow-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            type="button"
                            onClick={() => handleEdit(p)} 
                            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Editar Registro"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => openDeleteConfirmation(p)} 
                            className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Excluir Registro"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default RegisterPlayPage;
