
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ClipboardList, Swords, CalendarDays, BarChart3, UsersRound, UserCheck, Shield, HelpCircle } from 'lucide-react';
import { getCurrentUser, hasPermission } from '../../services/authService';
import { Routine } from '../../types';

const NavMenu: React.FC = () => {
  const user = getCurrentUser();

  const allTabs: { to: string; label: string; icon: any; routine: Routine }[] = [
    { to: '/checkin', label: 'Check-in', icon: UserCheck, routine: 'checkin' },
    { to: '/registro/escalacao', label: 'Times', icon: UsersRound, routine: 'escalacao' },
    { to: '/registro/jogadas', label: 'Gols', icon: ClipboardList, routine: 'jogadas' },
    { to: '/registro/partidas', label: 'Jogos', icon: Swords, routine: 'partidas' },
    { to: '/resultados', label: 'Resumo', icon: CalendarDays, routine: 'resultados' },
    { to: '/dashboard', label: 'Dash', icon: BarChart3, routine: 'dashboard' },
    { to: '/admin/usuarios', label: 'Acessos', icon: Shield, routine: 'usuarios' },
    { to: '/ajuda', label: 'Ajuda', icon: HelpCircle, routine: 'ajuda' },
  ];

  const activeTabs = allTabs.filter(tab => hasPermission(user, tab.routine));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-[100] pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-7xl mx-auto px-2">
        {activeTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                isActive
                  ? 'text-[#0b2340]'
                  : 'text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50' : 'bg-transparent'}`}>
                  <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default NavMenu;
