
import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../services/pfcApi';
import { DashboardData } from '../types';
import { DASHBOARD_YEARS } from '../constants';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import { LayoutGrid, Calendar, ChevronDown, MessageSquare, Share2, Award, Trophy, UserCheck, Star } from 'lucide-react';

const AnnualScoutPage: React.FC = () => {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScout = async () => {
      setLoading(true);
      try {
        const res = await getDashboardData({ ano });
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchScout();
  }, [ano]);

  const handleShareWhatsApp = () => {
    if (!data) return;

    const topGols = data.rankingGols[0];
    const topAssist = data.rankingAssist[0];
    const topVits = data.maioresVencedores[0];
    const topPresenca = data.nivelPresenca[0];

    const text = `*📊 SCOUT ANUAL PFC - TEMPORADA ${ano}*

🏆 *LÍDERES DO ANO:*

⚽ *ARTILHEIRO:* ${topGols?.name || 'N/A'} (${topGols?.value || 0} gols)
🅰️ *GARÇOM:* ${topAssist?.name || 'N/A'} (${topAssist?.value || 0} assistências)
🔥 *VITORIOSO:* ${topVits?.jogador || 'N/A'} (${topVits?.vitorias || 0} vitórias)
📅 *PRESENÇA:* ${topPresenca?.jogador || 'N/A'} (${topPresenca?.presencas || 0} jogos)

Confira o scout completo de todos os jogadores no link:
${window.location.origin}${window.location.pathname}#/scout/anual`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const ScoutColumn = ({ title, items, valueKey = 'value', icon: Icon }: { title: string, items: any[], valueKey?: string, icon: any }) => (
    <div className="flex flex-col bg-white border-2 border-[#3d7099]/30 rounded-2xl overflow-hidden shadow-xl h-fit transform transition-all hover:scale-[1.01]">
      <div className="bg-[#3d7099] text-white py-4 px-4 flex items-center justify-center gap-2 border-b-4 border-[#2c5270]">
        <Icon className="w-4 h-4 text-blue-200" />
        <h3 className="font-black text-[11px] uppercase tracking-widest">{title}</h3>
      </div>
      <div className="flex flex-col">
        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-300 font-black uppercase text-[10px] tracking-widest italic">Aguardando dados...</div>
        ) : (
          items.map((item, idx) => {
            const name = item.name || item.jogador;
            const value = item[valueKey] ?? item.value;
            return (
              <div 
                key={idx} 
                className={`flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-0 ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-[#e2edf7]/50'
                } hover:bg-blue-50 transition-colors`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`w-5 text-[9px] font-black shrink-0 ${idx < 3 ? 'text-[#3d7099]' : 'text-gray-300'}`}>
                    {idx + 1}º
                  </span>
                  <span className={`font-black uppercase text-[10px] truncate ${idx === 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                    {name}
                  </span>
                </div>
                <span className={`font-black text-[12px] w-10 text-right shrink-0 ${idx === 0 ? 'text-[#3d7099]' : 'text-gray-500'}`}>
                  {value}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-1000">
      {/* HEADER PREMIUM */}
      <section className="bg-[#0b2340] rounded-[3rem] p-8 lg:p-12 shadow-[0_30px_60px_rgba(11,35,64,0.3)] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full opacity-5 pointer-events-none">
           <LayoutGrid className="w-full h-full scale-150 rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 px-4 py-1.5 rounded-full border border-blue-400/30">
              <Star className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-300">Relatório de Performance Consolidado</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
              Scout Anual <br /> <span className="text-blue-400">PFC {ano}</span>
            </h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Resultados acumulados de todos os atletas</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex flex-col gap-1 min-w-[180px]">
              <label className="text-[8px] font-black uppercase text-blue-300 tracking-[0.2em] ml-1">Selecionar Temporada</label>
              <div className="relative">
                <select 
                  value={ano} 
                  onChange={(e) => setAno(Number(e.target.value))}
                  className="w-full bg-transparent font-black text-xl uppercase outline-none appearance-none pr-8 cursor-pointer"
                >
                  {DASHBOARD_YEARS.map(y => <option key={y} value={y} className="text-gray-900">{y}</option>)}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 pointer-events-none" />
              </div>
            </div>

            <button 
              onClick={handleShareWhatsApp}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 group"
            >
              <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Compartilhar no Grupo
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <LoadingSpinner text="Processando Scout..." />
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-1">
          <ScoutColumn title="Total de Gols" items={data.rankingGols} icon={Award} />
          <ScoutColumn title="Total de Assistências" items={data.rankingAssist} icon={Star} />
          <ScoutColumn title="Time da Semana" items={data.maioresVencedores} valueKey="vitorias" icon={Trophy} />
          <ScoutColumn title="Presença" items={data.nivelPresenca} valueKey="presencas" icon={UserCheck} />
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-40 text-center opacity-20 font-black uppercase text-xs tracking-widest border border-dashed border-gray-200">
          Aguardando conexão com servidor PFC Cloud...
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-[2rem] p-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-gray-400">
           <Share2 className="w-4 h-4" />
           <span className="text-[9px] font-black uppercase tracking-widest">O Scout é atualizado automaticamente a cada lançamento de rodada.</span>
        </div>
        <p className="text-[9px] font-black text-[#3d7099] uppercase tracking-[0.3em] hidden sm:block">
           Pelada PFC Pro v4.2.1
        </p>
      </div>
    </div>
  );
};

export default AnnualScoutPage;
