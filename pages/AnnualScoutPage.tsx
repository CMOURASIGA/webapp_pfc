
import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../services/pfcApi';
import { DashboardData } from '../types';
import { DASHBOARD_YEARS } from '../constants';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import { LayoutGrid, Calendar, ChevronDown, MessageSquare } from 'lucide-react';

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

  const handleShare = () => {
    if (!data) return;
    const text = `*📊 SCOUT ANUAL PFC - TEMPORADA ${ano}*\n\nConfira o ranking consolidado de performance no nosso Dashboard Oficial!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const ScoutColumn = ({ title, items, valueKey = 'value' }: { title: string, items: any[], valueKey?: string }) => (
    <div className="flex flex-col bg-white border-2 border-[#3d7099]/30 rounded-lg overflow-hidden shadow-sm h-fit">
      <div className="bg-[#3d7099] text-white py-3 px-4 text-center font-black text-[11px] uppercase tracking-widest">
        {title}
      </div>
      <div className="divide-y divide-gray-100">
        {items.length === 0 ? (
          <div className="p-10 text-center text-gray-300 font-black uppercase text-[9px] tracking-widest italic">Sem dados</div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className={`flex items-center justify-between px-4 py-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#e2edf7]/40'}`}>
              <span className="font-black text-gray-700 text-[10px] uppercase truncate max-w-[140px]">
                {item.name || item.jogador}
              </span>
              <span className="font-black text-[#3d7099] text-[11px] w-8 text-right shrink-0">
                {item[valueKey] ?? item.value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <section className="bg-white rounded-[2rem] p-6 lg:p-10 shadow-xl border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-[#3d7099] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <LayoutGrid className="w-7 h-7 text-white" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-[#0b2340] uppercase tracking-tighter leading-none">Scout Anual de Resultados</h1>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Consolidado histórico da temporada</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3 min-w-[160px]">
              <Calendar className="w-4 h-4 text-[#3d7099]" />
              <div className="relative flex-1">
                <select 
                  value={ano} 
                  onChange={(e) => setAno(Number(e.target.value))}
                  className="w-full bg-transparent font-black text-xs uppercase outline-none appearance-none pr-6"
                >
                  {DASHBOARD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-[#3d7099] pointer-events-none" />
              </div>
           </div>
           <button 
            onClick={handleShare}
            className="p-3 bg-[#25D366] text-white rounded-2xl shadow-lg shadow-green-100 hover:scale-105 active:scale-95 transition-all"
           >
             <MessageSquare className="w-5 h-5" />
           </button>
        </div>
      </section>

      {loading ? (
        <LoadingSpinner text="Consolidando SCOUT..." />
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <ScoutColumn title="Total de Gols" items={data.rankingGols} />
          <ScoutColumn title="Total de Assistências" items={data.rankingAssist} />
          <ScoutColumn title="Time da Semana" items={data.maioresVencedores} valueKey="vitorias" />
          <ScoutColumn title="Presença" items={data.nivelPresenca} valueKey="presencas" />
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-40 text-center opacity-20 font-black uppercase text-xs tracking-widest">
          Aguardando conexão com servidor...
        </div>
      )}

      <footer className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
         <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">
           Pelada PFC - Relatório de Performance v4.2
         </p>
      </footer>
    </div>
  );
};

export default AnnualScoutPage;
