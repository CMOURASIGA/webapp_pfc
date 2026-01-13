
import React, { useState } from 'react';
import { registerMatch } from '../services/pfcApi';
import { ToastType } from '../types';
import { getTodayISO } from '../utils/dateUtils';
import { Swords, Calendar, Info } from 'lucide-react';

interface RegisterMatchPageProps {
  onToast: (text: string, type: ToastType) => void;
}

const RegisterMatchPage: React.FC<RegisterMatchPageProps> = ({ onToast }) => {
  const [time1, setTime1] = useState('T1');
  const [gols1, setGols1] = useState(0);
  const [time2, setTime2] = useState('T2');
  const [gols2, setGols2] = useState(0);
  const [data, setData] = useState(getTodayISO());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (time1 === time2) {
      onToast('Os times devem ser diferentes.', ToastType.ERROR);
      return;
    }

    setLoading(true);
    try {
      await registerMatch({
        dataISO: data,
        time1,
        gols1,
        time2,
        gols2
      });
      onToast(`Placar ${time1} ${gols1} x ${gols2} ${time2} registrado!`, ToastType.SUCCESS);
      setGols1(0);
      setGols2(0);
    } catch (err) {
      onToast('Erro ao registrar partida.', ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Registrar Partida</h2>
        <p className="text-gray-500 font-medium">Registre o placar final do jogo entre dois times.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-8 border border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full space-y-3">
            <div className="bg-[#0b2340] text-white text-center py-2 rounded-t-xl font-black text-xs uppercase tracking-widest">TIME A</div>
            <select
              value={time1}
              onChange={(e) => setTime1(e.target.value)}
              className="w-full px-4 py-3 rounded-none border-x border-gray-200 outline-none text-center text-xl font-black text-gray-900 bg-white"
            >
              {['T1', 'T2', 'T3', 'T4'].map((t) => (
                <option key={t} value={t} className="text-gray-900">{t}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              value={gols1}
              onChange={(e) => setGols1(Number(e.target.value))}
              className="w-full px-4 py-6 rounded-b-xl border border-gray-200 text-center text-5xl font-black focus:ring-2 focus:ring-[#0b2340] outline-none text-gray-900 bg-gray-50"
            />
          </div>

          <div className="text-gray-200 font-black text-4xl hidden md:block">VS</div>
          
          <div className="flex-1 w-full space-y-3">
            <div className="bg-[#0b2340] text-white text-center py-2 rounded-t-xl font-black text-xs uppercase tracking-widest">TIME B</div>
            <select
              value={time2}
              onChange={(e) => setTime2(e.target.value)}
              className="w-full px-4 py-3 rounded-none border-x border-gray-200 outline-none text-center text-xl font-black text-gray-900 bg-white"
            >
              {['T1', 'T2', 'T3', 'T4'].map((t) => (
                <option key={t} value={t} className="text-gray-900">{t}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              value={gols2}
              onChange={(e) => setGols2(Number(e.target.value))}
              className="w-full px-4 py-6 rounded-b-xl border border-gray-200 text-center text-5xl font-black focus:ring-2 focus:ring-[#0b2340] outline-none text-gray-900 bg-gray-50"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-[#0b2340]" /> Data da Partida
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-gray-50 focus:ring-2 focus:ring-[#0b2340] text-gray-900 font-bold"
            style={{ colorScheme: 'light' }}
          />
        </div>

        <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 font-medium">
            Dica: Registre todos os jogos da rodada para que o ranking de times seja calculado corretamente na página de resultados.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-[#0b2340] text-white font-black text-lg hover:bg-blue-900 transition-all shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
        >
          <Swords className="w-5 h-5" />
          {loading ? 'Salvando...' : 'Registrar Jogo'}
        </button>
      </form>
    </div>
  );
};

export default RegisterMatchPage;
