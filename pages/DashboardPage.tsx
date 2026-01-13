
import React, { useState, useEffect } from 'react';
import { getDashboardData, getJogadores } from '../services/pfcApi';
import { DashboardData } from '../types';
import { DASHBOARD_YEARS } from '../constants';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import RankingTable from '../components/stats/RankingTable';
import PieChartCard from '../components/stats/PieChartCard';
import BarChartCard from '../components/stats/BarChartCard';
import StatCard from '../components/stats/StatCard';
import { 
  Filter, Users, Trophy, Award, TrendingUp, Calendar, 
  ChevronDown, Target, Zap, Star, Crown, Flame, 
  TrendingDown, Activity, Medal, BarChart3, Info
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<{ ano: number; jogador: string }>({
    ano: DASHBOARD_YEARS[DASHBOARD_YEARS.length - 1],
    jogador: 'Todos'
  });
  const [data, setData] = useState<DashboardData | null>(null);
  const [jogadores, setJogadores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJogadores().then(setJogadores);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await getDashboardData({ 
          ano: filters.ano, 
          jogador: filters.jogador === 'Todos' ? undefined : filters.jogador 
        });
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [filters]);

  const Podium = ({ title, data, colorClass }: { title: string, data: any[], colorClass: string }) => {
    if (!data || data.length < 1) return null;
    const top1 = data[0];
    const top2 = data[1];
    const top3 = data[2];

    return (
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 flex flex-col items-center">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10">{title}</h3>
        <div className="flex items-end gap-2 w-full justify-center">
          {top2 && (
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400 border-2 border-white shadow-md mb-2 group-hover:scale-110 transition-transform">
                {top2.name.charAt(0)}
              </div>
              <div className="w-16 bg-gray-200 rounded-t-xl flex flex-col items-center py-4 px-2 h-20 shadow-inner">
                <span className="text-[10px] font-black text-gray-500 uppercase">2º</span>
                <span className="text-xs font-black text-gray-900 truncate w-full text-center">{top2.value}</span>
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center group -translate-y-4">
            <div className={`w-20 h-20 ${colorClass} rounded-3xl flex items-center justify-center font-black text-white border-4 border-white shadow-2xl mb-2 relative group-hover:scale-110 transition-transform`}>
              <Crown className="absolute -top-6 w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-md animate-bounce" />
              <span className="text-2xl">{top1.name.charAt(0)}</span>
            </div>
            <div className={`${colorClass} w-24 rounded-t-2xl flex flex-col items-center py-6 px-2 h-32 shadow-xl`}>
              <span className="text-[10px] font-black text-white/50 uppercase">Vencedor</span>
              <span className="text-sm font-black text-white truncate w-full text-center">{top1.name}</span>
              <span className="text-xl font-black text-white mt-1">{top1.value}</span>
            </div>
          </div>

          {top3 && (
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400 border-2 border-white shadow-md mb-2 group-hover:scale-110 transition-transform">
                {top3.name.charAt(0)}
              </div>
              <div className="w-16 bg-gray-100 rounded-t-xl flex flex-col items-center py-4 px-2 h-16 shadow-inner">
                <span className="text-[10px] font-black text-gray-400 uppercase">3º</span>
                <span className="text-xs font-black text-gray-900 truncate w-full text-center">{top3.value}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 pb-24">
      {/* MINI EXPLICAÇÃO */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in duration-1000">
        <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <p className="text-[10px] text-orange-800 font-black uppercase leading-relaxed tracking-tight">
          Painel de estatísticas acumuladas. Acompanhe a artilharia anual, líderes de assistência e o "hall da fama" dos maiores vencedores da temporada.
        </p>
      </div>

      <section className="relative overflow-hidden bg-[#0b2340] rounded-[3rem] p-10 lg:p-16 text-white shadow-[0_50px_100px_rgba(11,35,64,0.4)]">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <img src="https://i.imgur.com/ExEJtwR.png" alt="" className="w-full h-full object-contain scale-150 rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 px-4 py-1.5 rounded-full border border-blue-400/30 backdrop-blur-md">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Analytics Pro v3.0</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
              Painel de <br /> <span className="text-blue-400">Resultados</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">Acompanhe a evolução histórica da Pelada PFC</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/10 space-y-2 min-w-[180px]">
              <label className="text-[9px] font-black uppercase text-blue-300 tracking-[0.2em] ml-2">Temporada</label>
              <div className="relative">
                <select
                  value={filters.ano}
                  onChange={(e) => setFilters(prev => ({ ...prev, ano: Number(e.target.value) }))}
                  className="w-full bg-transparent text-white font-black text-lg outline-none cursor-pointer pr-8"
                >
                  {DASHBOARD_YEARS.map(y => <option key={y} value={y} className="text-gray-900">{y}</option>)}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/10 space-y-2 min-w-[240px]">
              <label className="text-[9px] font-black uppercase text-blue-300 tracking-[0.2em] ml-2">Focar em Atleta</label>
              <div className="relative">
                <select
                  value={filters.jogador}
                  onChange={(e) => setFilters(prev => ({ ...prev, jogador: e.target.value }))}
                  className="w-full bg-transparent text-white font-black text-lg outline-none cursor-pointer pr-8"
                >
                  <option value="Todos" className="text-gray-900">Visão Geral</option>
                  {jogadores.map(j => <option key={j} value={j} className="text-gray-900">{j}</option>)}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <LoadingSpinner text="Processando Big Data PFC..." />
      ) : data ? (
        <div className="space-y-20">
          <section className="space-y-10">
            <div className="flex items-center gap-4 px-2">
              <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#0b2340] uppercase tracking-tighter">Elite da Temporada</h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Líderes absolutos do ano {filters.ano}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Podium title="Ranking de Artilharia" data={data.rankingGols} colorClass="bg-rose-500" />
              <Podium title="Ranking de Assistências" data={data.rankingAssist} colorClass="bg-blue-500" />
              <Podium title="Dominadores de Rodadas" data={data.maioresVencedores.map(m => ({ name: m.jogador, value: m.vitorias }))} colorClass="bg-emerald-500" />
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            <div className="xl:col-span-1 space-y-8">
               <div className="bg-[#0b2340] p-10 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-32 h-32" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Índice de <br /> Eficiência</h3>
                    <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">Quem mais produz por jogo</p>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-[10px] font-black uppercase text-gray-400">Média de Gols</span>
                        <Target className="w-5 h-5 text-rose-400" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black">{data.presencaGols[0]?.ratio || 0}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase">Gols/Jogo</span>
                      </div>
                      <p className="text-[10px] font-black text-rose-300 mt-2 uppercase">{data.presencaGols[0]?.jogador}</p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-[10px] font-black uppercase text-gray-400">Média de Assists</span>
                        <Zap className="w-5 h-5 text-sky-400" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black">{data.presencaAssist[0]?.ratio || 0}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase">Ast/Jogo</span>
                      </div>
                      <p className="text-[10px] font-black text-sky-300 mt-2 uppercase">{data.presencaAssist[0]?.jogador}</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="xl:col-span-2 space-y-10">
              <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black text-[#0b2340] uppercase tracking-tighter flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-blue-500" />
                    Distribuição de Desempenho
                  </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">Gols por Atleta</span>
                      <PieChartCard title="" data={data.rankingGols.slice(0, 5)} />
                   </div>
                   <div className="space-y-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">Assists por Atleta</span>
                      <PieChartCard title="" data={data.rankingAssist.slice(0, 5)} />
                   </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-10">
            <div className="flex items-center gap-4 px-2">
              <div className="w-12 h-12 bg-[#0b2340] rounded-2xl flex items-center justify-center shadow-lg">
                <Medal className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#0b2340] uppercase tracking-tighter">Classificação Geral</h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Ranking detalhado da temporada {filters.ano}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <RankingTable 
                title="Top Goleadores"
                columns={[
                  { key: 'name', header: 'Atleta' },
                  { key: 'value', header: 'Gols', align: 'center' }
                ]}
                data={data.rankingGols}
                progressKey="value"
              />
              <RankingTable 
                title="Top Assistentes"
                columns={[
                  { key: 'name', header: 'Atleta' },
                  { key: 'value', header: 'Assists', align: 'center' }
                ]}
                data={data.rankingAssist}
                progressKey="value"
              />
            </div>
          </section>

          <section className="bg-emerald-500 rounded-[3rem] p-10 lg:p-16 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform">
              <Users className="w-48 h-48" />
            </div>
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-16">
              <div className="max-w-md space-y-6">
                 <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Presença <br /> Garantida</h2>
                 <p className="text-emerald-100 font-medium font-black uppercase text-xs">Os pilares da pelada. Quem nunca falta.</p>
                 <div className="flex items-center gap-4">
                    <div className="bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-md">
                       <span className="text-3xl font-black">{data.nivelPresenca[0]?.presencas || 0}</span>
                       <span className="text-[10px] font-black block uppercase opacity-60">Recorde de Jogos</span>
                    </div>
                 </div>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.nivelPresenca.slice(0, 4).map((p, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex items-center justify-between group hover:bg-white/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-emerald-600">
                        {p.jogador.charAt(0)}
                      </div>
                      <span className="font-black uppercase text-sm">{p.jogador}</span>
                    </div>
                    <span className="text-xl font-black">{p.presencas} J</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      ) : (
        <div className="text-center py-40 bg-white rounded-[3rem] border border-gray-100 shadow-sm space-y-4">
           <img 
            src="https://i.imgur.com/ExEJtwR.png" 
            alt="Logo Pelada PFC" 
            className="w-24 h-24 object-contain mx-auto grayscale opacity-20"
          />
           <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-sm">Aguardando dados da planilha...</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
