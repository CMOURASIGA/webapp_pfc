
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ClipboardList, Swords, CalendarDays, BarChart3, 
  UsersRound, UserCheck, Shield, HelpCircle, X 
} from 'lucide-react';
import { getCurrentUser, hasPermission } from '../../services/authService';
import { Routine } from '../../types';
import { COLORS } from '../../constants';

interface NavMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ isOpen, onClose }) => {
  const user = getCurrentUser();

  const allTabs: { to: string; label: string; icon: any; routine: Routine }[] = [
    { to: '/checkin', label: 'Check-in Atletas', icon: UserCheck, routine: 'checkin' },
    { to: '/registro/escalacao', label: 'Escalação Times', icon: UsersRound, routine: 'escalacao' },
    { to: '/registro/jogadas', label: 'Lançar Gols', icon: ClipboardList, routine: 'jogadas' },
    { to: '/registro/partidas', label: 'Placar Jogos', icon: Swords, routine: 'partidas' },
    { to: '/resultados', label: 'Resumo Rodada', icon: CalendarDays, routine: 'resultados' },
    { to: '/dashboard', label: 'Dashboard Anual', icon: BarChart3, routine: 'dashboard' },
    { to: '/admin/usuarios', label: 'Gestão Acessos', icon: Shield, routine: 'usuarios' },
    { to: '/ajuda', label: 'Ajuda e Guia', icon: HelpCircle, routine: 'ajuda' },
  ];

  const activeTabs = allTabs.filter(tab => hasPermission(user, tab.routine));

  return (
    <>
      {/* Overlay para Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-[#0b2340] text-white z-[200] transition-all duration-300 shadow-2xl flex flex-col
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-20 xl:w-72'}
        `}
      >
        {/* Header da Sidebar */}
        <div className="p-6 flex items-center justify-between border-b border-white/10 shrink-0 h-20">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl shrink-0">
              <img src="https://i.imgur.com/ExEJtwR.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className={`font-black uppercase tracking-tighter text-lg transition-opacity duration-300 ${!isOpen && 'lg:opacity-0 xl:opacity-100'}`}>
              PFC <span className="text-blue-400">Manager</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/10 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
          {activeTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <tab.icon className={`w-6 h-6 shrink-0 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-opacity duration-300 ${!isOpen && 'lg:opacity-0 xl:opacity-100'}`}>
                    {tab.label}
                  </span>
                  
                  {/* Tooltip para versão colapsada no Desktop */}
                  {!isOpen && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity hidden lg:block whitespace-nowrap z-50">
                      {tab.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-6 border-t border-white/10 shrink-0">
           <div className={`flex flex-col gap-1 transition-opacity duration-300 ${!isOpen && 'lg:opacity-0 xl:opacity-100'}`}>
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Versão 4.0.2</span>
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">PFC Cloud Sync</span>
           </div>
        </div>
      </aside>
    </>
  );
};

export default NavMenu;
