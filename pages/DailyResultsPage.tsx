
import React, { useState, useEffect } from 'react';
import { getDailyStats } from '../services/pfcApi';
import { DailyStats } from '../types';
import { getTodayISO, formatISOToBR } from '../utils/dateUtils';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import StatCard from '../components/stats/StatCard';
import RankingTable from '../components/stats/RankingTable';
import InfoBanner from '../components/Layout/InfoBanner';
import { Search, Trophy, Medal, Goal, Zap, Calendar, LayoutGrid } from 'lucide-react';

const DailyResultsPage: React.FC = () => {
  const [date, setDate] = useState(getTodayISO());
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDailyStats(date);
      setStats(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 pb-8">
      <InfoBanner 
        variant="purple"
        text="Resumo da rodada. Verifique os destaques individuais e a classificação coletiva dos times do dia."
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Calendar className="w-5 h-5 text-[#0b2340]" />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 bg-transparent text-gray-900 font-black text-xs outline-none"
        />
        <button onClick={fetchData} className="bg-[#0b2340] text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase">Buscar</button>
      </div>

      {loading ? <LoadingSpinner /> : !stats || stats.jogos.length === 0 ? (
        <div className="text-center py-20 opacity-30 font-black uppercase text-xs">Sem dados</div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Campeão" value={stats.campeaoDoDia} variant="success" icon={<Trophy className="w-4 h-4" />} />
            <StatCard title="Gols" value={stats.statsJogadores[0]?.gols || 0} subtitle={stats.statsJogadores[0]?.jogador} variant="danger" icon={<Goal className="w-4 h-4" />} />
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest px-2">Jogos da Noite</h3>
            <div className="space-y-3">
              {stats.jogos.map((jogo, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-around font-black uppercase italic">
                  <span className="text-gray-900">{jogo.time1}</span>
                  <div className="bg-gray-50 px-4 py-2 rounded-xl text-lg text-[#0b2340] border border-gray-100 shadow-inner">
                    {jogo.gols1} <span className="text-[10px] opacity-20 mx-2">X</span> {jogo.gols2}
                  </div>
                  <span className="text-gray-900">{jogo.time2}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest px-2">Tabela do Dia</h3>
             <RankingTable 
                columns={[
                  { key: 'jogador', header: 'Atleta' },
                  { key: 'gols', header: 'Gols', align: 'center' },
                  { key: 'assist', header: 'Ast', align: 'center' },
                ]}
                data={stats.statsJogadores.slice(0, 10)}
                progressKey="gols"
              />
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyResultsPage;
