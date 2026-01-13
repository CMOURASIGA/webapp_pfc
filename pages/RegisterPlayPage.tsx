
import React, { useState, useEffect, useCallback } from 'react';
import { getJogadores, registerPlay, editPlay, deletePlay, getRawPlaysByDate } from '../services/pfcApi';
import { ToastType } from '../types';
import { getTodayISO, formatISOToBR } from '../utils/dateUtils';
import { User, Trophy, HandHeart, Crown, PlusCircle, ArrowLeft, Trash2, Edit3, Save, X, RefreshCw, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import InfoBanner from '../components/Layout/InfoBanner';

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

  useEffect(() => { loadPlayers(); }, [loadPlayers]);
  useEffect(() => { loadDailyPlays(); }, [loadDailyPlays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalJogador = isAddingNew ? novoJogador.trim().toUpperCase() : selectedJogador;

    if (!finalJogador) {
      onToast('Selecione o atleta.', ToastType.ERROR);
      return;
    }

    setLoading(true);
    try {
      const payload = { jogador: finalJogador, dataISO: data, gols, assist, time, capitao };

      if (editingRowIndex) {
        await editPlay(editingRowIndex, payload);
        onToast('Atualizado!', ToastType.SUCCESS);
        setEditingRowIndex(null);
      } else {
        await registerPlay(payload);
        onToast('Registrado!', ToastType.SUCCESS);
      }
      
      setGols(0); setAssist(0); setCapitao(false);
      if (isAddingNew) { setIsAddingNew(false); setNovoJogador(''); loadPlayers(); }
      
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
    setIsAddingNew(false);
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
        text="Registre gols e assistências de cada partida. Atletas marcados como 'Capitão' são os vencedores da rodada."
      />

      <section className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-[#0b2340] uppercase tracking-tighter">
            {editingRowIndex ? 'Editar Jogada' : 'Lançar Jogada'}
          </h2>
          {editingRowIndex && (
            <button onClick={() => { setEditingRowIndex(null); setSelectedJogador(''); }} className="text-rose-500 font-black text-[8px] uppercase">
              Cancelar
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Atleta</label>
            {!isAddingNew ? (
              <select
                value={selectedJogador}
                onChange={(e) => e.target.value === 'NEW' ? setIsAddingNew(true) : setSelectedJogador(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-900 font-black text-sm outline-none"
              >
                <option value="" disabled>SELECIONE...</option>
                <option value="NEW">+ NOVO JOGADOR</option>
                {jogadores.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            ) : (
              <div className="relative">
                <input
                  type="text" autoFocus
                  value={novoJogador}
                  onChange={(e) => setNovoJogador(e.target.value.toUpperCase())}
                  placeholder="NOME..."
                  className="w-full px-4 py-4 rounded-xl border border-blue-100 bg-blue-50 text-gray-900 font-black text-sm uppercase outline-none"
                />
                <button type="button" onClick={() => setIsAddingNew(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-blue-500">Voltar</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Gols</label>
              <select value={gols} onChange={(e) => setGols(Number(e.target.value))} className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-xl text-center font-black">{[...Array(11)].map((_, i) => <option key={i} value={i}>{i}</option>)}</select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Assist</label>
              <select value={assist} onChange={(e) => setAssist(Number(e.target.value))} className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-xl text-center font-black">{[...Array(11)].map((_, i) => <option key={i} value={i}>{i}</option>)}</select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl" onClick={() => setCapitao(!capitao)}>
             <div className="flex items-center gap-3">
              <Crown className={`w-5 h-5 ${capitao ? 'text-yellow-500' : 'text-gray-300'}`} />
              <span className="text-[10px] font-black text-[#0b2340] uppercase">Venceu a rodada?</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative ${capitao ? 'bg-[#0b2340]' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${capitao ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-[#0b2340] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50">
            {loading ? 'SINCRONIZANDO...' : editingRowIndex ? 'SALVAR' : 'CONFIRMAR'}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center justify-between px-2">
          Registros do Dia
          <button onClick={loadDailyPlays} className="p-2"><RefreshCw className={`w-4 h-4 ${tableLoading ? 'animate-spin' : ''}`} /></button>
        </h3>

        {tableLoading ? <LoadingSpinner text="Buscando..." /> : dailyPlays.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-black uppercase text-[10px]">Vazio</div>
        ) : (
          <div className="space-y-3">
            {dailyPlays.map((p, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm uppercase text-gray-900">{p["Jogador"]}</span>
                    {(p["Capitão"] === 'Sim' || p["Vencedor da rodada"] === 'Sim') && <Crown className="w-3 h-3 text-yellow-500" />}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[8px] font-black bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded">{p["Gols"] || 0} GOLS</span>
                    <span className="text-[8px] font-black bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded">{p["Assistência"] || 0} AST</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(p)} className="p-2 bg-gray-50 rounded-lg text-blue-500"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => { setPlayToDelete(p); setShowDeleteModal(true); }} className="p-2 bg-gray-50 rounded-lg text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-3xl p-8 text-center space-y-6">
            <h3 className="text-lg font-black text-gray-900 uppercase">Apagar?</h3>
            <p className="text-gray-500 text-xs font-bold uppercase">{playToDelete?.["Jogador"]}</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 text-gray-400 font-black uppercase text-[10px]">Não</button>
              <button onClick={executeDelete} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-black uppercase text-[10px]">Sim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPlayPage;
