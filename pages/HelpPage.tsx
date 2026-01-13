
import React from 'react';
import { 
  UserCheck, Users, ClipboardList, Swords, CalendarDays, BarChart3, Shield, 
  HelpCircle, CheckCircle2, Info, ChevronRight, Zap, Target, Trophy, Clock
} from 'lucide-react';

const HelpPage: React.FC = () => {
  const sections = [
    {
      icon: <UserCheck className="w-6 h-6 text-emerald-500" />,
      title: "1. Check-in (Chegada dos Atletas)",
      content: "Esta é a primeira etapa do dia. Cada jogador deve acessar o sistema e confirmar que já está na quadra. Isso evita que jogadores que não compareceram sejam escalados por engano.",
      tips: ["O check-in só lista jogadores previamente escalados.", "Se você chegou, mas seu nome não aparece, procure o organizador."]
    },
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: "2. Escalação e Times",
      content: "Aqui o organizador organiza os jogadores presentes em 4 times (T1 a T4). O sistema monitora em tempo real quem já confirmou chegada para facilitar a montagem dos quadros.",
      tips: ["Times com 3 ou mais presentes ficam destacados em verde.", "É possível remover ou trocar jogadores de time rapidamente."]
    },
    {
      icon: <ClipboardList className="w-6 h-6 text-rose-500" />,
      title: "3. Registro de Jogadas",
      content: "O coração das estatísticas. Para cada partida, o organizador lança os gols e assistências individuais de cada atleta. Também é marcado quem foi o 'Capitão' (vencedor da rodada).",
      tips: ["Gols e assistências somam pontos no ranking anual.", "O campo 'Capitão' define quem venceu a noite de jogos."]
    },
    {
      icon: <Swords className="w-6 h-6 text-sky-500" />,
      title: "4. Registro de Partidas",
      content: "Lançamento dos placares coletivos. Ex: T1 3 x 2 T2. Estes dados alimentam a tabela de classificação coletiva do dia.",
      tips: ["Vitória vale 3 pontos, empate vale 1.", "Gols marcados são o primeiro critério de desempate."]
    },
    {
      icon: <CalendarDays className="w-6 h-6 text-purple-500" />,
      title: "5. Resultados do Dia",
      content: "Resumo completo da rodada atual. Mostra quem foi o Artilheiro do Dia, o Garçom e qual time saiu como Campeão da noite.",
      tips: ["Pode ser consultado por data para ver históricos passados."]
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-orange-500" />,
      title: "6. Dashboard Anual",
      content: "A visão macro. Rankings acumulados de gols, assistências, presenças e vitórias ao longo de toda a temporada (ano selecionado).",
      tips: ["Use o filtro de atleta para ver o desempenho individual detalhado."]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <section className="text-center space-y-4">
        <div className="bg-[#0b2340] w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl mb-6">
          <HelpCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-[#0b2340] uppercase tracking-tighter">Guia do Peladeiro PFC</h1>
        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">Entenda como funciona nossa gestão de performance</p>
      </section>

      <div className="grid gap-8">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 group hover:border-[#0b2340] transition-all">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-gray-50 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                {section.icon}
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-xl font-black text-[#0b2340] uppercase tracking-tight">{section.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{section.content}</p>
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {section.tips.map((tip, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-gradient-to-r from-[#0b2340] to-blue-900 rounded-[3rem] p-10 lg:p-16 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
             <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Regras de <br /> Pontuação</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                   <Target className="w-8 h-8 text-rose-400" />
                   <div>
                     <span className="block text-2xl font-black">1.0</span>
                     <span className="text-[9px] font-black uppercase opacity-60">Ponto por Gol</span>
                   </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                   <Zap className="w-8 h-8 text-sky-400" />
                   <div>
                     <span className="block text-2xl font-black">0.5</span>
                     <span className="text-[9px] font-black uppercase opacity-60">Por Assistência</span>
                   </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                   <Trophy className="w-8 h-8 text-yellow-400" />
                   <div>
                     <span className="block text-2xl font-black">3.0</span>
                     <span className="text-[9px] font-black uppercase opacity-60">Vitória na Rodada</span>
                   </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                   <Clock className="w-8 h-8 text-emerald-400" />
                   <div>
                     <span className="block text-2xl font-black">1.0</span>
                     <span className="text-[9px] font-black uppercase opacity-60">Por Presença</span>
                   </div>
                </div>
             </div>
          </div>
          <div className="w-full md:w-1/3 bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-300">Dúvida Técnica?</h4>
            <p className="text-[11px] font-medium leading-relaxed">Este sistema sincroniza automaticamente com o Google Sheets. Se houver demora na atualização, clique no ícone de sincronizar no topo de cada página.</p>
            <div className="flex items-center gap-2 pt-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="text-[9px] font-black uppercase tracking-widest">Acesso Seguro</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;
