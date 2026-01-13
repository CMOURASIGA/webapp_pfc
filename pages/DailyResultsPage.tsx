
import React, { useState, useEffect } from 'react';
import { getDailyStats } from '../services/pfcApi';
import { DailyStats } from '../types';
import { getTodayISO, formatISOToBR } from '../utils/dateUtils';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import StatCard from '../components/stats/StatCard';
import RankingTable from '../components/stats/RankingTable';
import { Search, Trophy, Medal, Goal, Zap, Calendar, Swords, ChevronRight, LayoutGrid } from 'lucide-react';

const DailyResultsPage: React.FC = () => {
  const [date, setDate] = useState(getTodayISO());
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDailyStats(date);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-[#0b2340]" />
            RESULTADOS DA RODADA
          </h2>
          <p className="text-gray-500 font-medium">Análise detalhada da pelada de {formatISOToBR(date)}.</p>
        </div>
        
        {/* Seletor de Data Refinado */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#0b2340] transition-all">
            <Calendar className="w-5 h-5 text-[#0b2340]" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Data do Jogo</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-gray-900 font-black text-sm outline-none cursor-pointer"
                style={{ colorScheme: 'light' }}
              />
            </div>
          </div>
          <button
            onClick={fetchData}
            className="h-full px-8 py-3 bg-[#0b2340] text-white rounded-xl hover:bg-[#15345a] transition-all flex items-center gap-2 font-bold shadow-lg active:scale-95 text-sm uppercase tracking-widest"
          >
            <Search className="w-4 h-4" /> Buscar
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !stats || (stats.jogos.length === 0 && stats.statsJogadores.length === 0) ? (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative overflow-hidden">
             <img 
              src="https://i.imgur.com/ExEJtwR.png" 
              alt="Logo Pelada PFC" 
              className="w-12 h-12 object-contain grayscale opacity-30"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/53/53283.png';
              }}
            />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Sem registros nesta data</h3>
          <p className="text-gray-400 font-medium mt-2 max-w-xs mx-auto">Não encontramos partidas ou estatísticas registradas para o dia {formatISOToBR(date)}.</p>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in duration-500">
          {/* Dashboard Superior */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Time Campeão" 
              value={stats.campeaoDoDia} 
              variant="success"
              icon={<Trophy className="w-5 h-5" />}
            />
            <StatCard 
              title="Artilheiro do Dia" 
              value={stats.statsJogadores[0]?.jogador || '-'} 
              subtitle={`${stats.statsJogadores[0]?.gols || 0} gols marcados`}
              variant="danger"
              icon={<Goal className="w-5 h-5" />}
            />
            <StatCard 
              title="Garçom do Dia" 
              value={[...stats.statsJogadores].sort((a,b) => b.assist - a.assist)[0]?.jogador || '-'} 
              subtitle={`${[...stats.statsJogadores].sort((a,b) => b.assist - a.assist)[0]?.assist || 0} assistências`}
              variant="accent"
              icon={<Zap className="w-5 h-5" />}
            />
             <StatCard 
              title="Total de Jogos" 
              value={stats.jogos.length} 
              subtitle="Partidas realizadas"
              variant="primary"
              icon={<Medal className="w-5 h-5" />}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
            {/* Coluna de Jogos e Tabela de Pontos */}
            <div className="xl:col-span-5 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-[#0b2340] rounded-full"></div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Confrontos do Dia</h3>
                </div>
                <div className="grid gap-4">
                  {stats.jogos.map((jogo, i) => (
                    <div key={jogo.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all border-l-8 border-l-[#0b2340]">
                      <div className="flex flex-col">
                        <span className="text-gray-300 font-black text-[9px] uppercase tracking-widest mb-2">PARTIDA {i + 1}</span>
                        <div className="flex items-center gap-6">
                           <div className="text-center w-12">
                             <span className="font-black text-gray-900 text-xl block">{jogo.time1}</span>
                           </div>
                           <div className="flex items-center bg-gray-50 rounded-2xl px-6 py-3 font-black text-3xl text-[#0b2340] shadow-inner border border-gray-100">
                             {jogo.gols1} <span className="mx-3 opacity-20 text-sm">X</span> {jogo.gols2}
                           </div>
                           <div className="text-center w-12">
                             <span className="font-black text-gray-900 text-xl block">{jogo.time2}</span>
                           </div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-[#0b2340] transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                   <Medal className="w-5 h-5 text-yellow-500" />
                   Tabela de Classificação
                </h3>
                <div className="overflow-hidden rounded-2xl border border-gray-100">
                  <table className="w-full text-left">
                    <thead className="bg-[#0b2340] text-white text-[10px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4 text-center">Pts</th>
                        <th className="px-6 py-4 text-center">V</th>
                        <th className="px-6 py-4 text-center">GM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stats.pontosTimes.sort((a,b) => b.pontos - a.pontos || b.golsMarcados - a.golsMarcados).map((t, idx) => (
                        <tr key={t.time} className={idx === 0 ? 'bg-emerald-50/40' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-5 font-black text-gray-900 flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></span>
                            {t.time}
                          </td>
                          <td className="px-6 py-5 text-center font-black text-[#0b2340]">{t.pontos}</td>
                          <td className="px-6 py-5 text-center text-gray-600 font-bold">{t.vitorias}</td>
                          <td className="px-6 py-5 text-center text-gray-600 font-bold">{t.golsMarcados}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Coluna de Estatísticas dos Jogadores */}
            <div className="xl:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-rose-500 rounded-full"></div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Estatísticas Individuais</h3>
              </div>
              <RankingTable 
                columns={[
                  { key: 'jogador', header: 'Atleta' },
                  { key: 'gols', header: 'Gols', align: 'center' },
                  { key: 'assist', header: 'Assists', align: 'center' },
                  { key: 'capitaoCount', header: 'Venc. Rodada', align: 'center' },
                ]}
                data={stats.statsJogadores}
                progressKey="gols"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyResultsPage;
