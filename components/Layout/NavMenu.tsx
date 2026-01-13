
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ClipboardList, Swords, CalendarDays, BarChart3, UsersRound, UserCheck, Shield, HelpCircle } from 'lucide-react';
import { getCurrentUser, hasPermission } from '../../services/authService';
import { Routine } from '../../types';

const NavMenu: React.FC = () => {
  const user = getCurrentUser();

  const allTabs: { to: string; label: string; icon: any; routine: Routine }[] = [
    { to: '/checkin', label: 'Check-in', icon: UserCheck, routine: 'checkin' },
    { to: '/registro/escalacao', label: 'Escalação', icon: UsersRound, routine: 'escalacao' },
    { to: '/registro/jogadas', label: 'Jogadas', icon: ClipboardList, routine: 'jogadas' },
    { to: '/registro/partidas', label: 'Partidas', icon: Swords, routine: 'partidas' },
    { to: '/resultados', label: 'Resultados', icon: CalendarDays, routine: 'resultados' },
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3, routine: 'dashboard' },
    { to: '/admin/usuarios', label: 'Acessos', icon: Shield, routine: 'usuarios' },
    { to: '/ajuda', label: 'Ajuda', icon: HelpCircle, routine: 'ajuda' },
  ];

  // Filtra abas baseado no usuário logado
  const activeTabs = allTabs.filter(tab => hasPermission(user, tab.routine));

  return (
    <nav className="bg-white border-b border-gray-200 overflow-x-auto shadow-sm">
      <div className="flex justify-center min-w-max">
        {activeTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-6 py-4 text-[11px] font-black uppercase tracking-tight transition-all border-b-4 ${
                isActive
                  ? 'border-[#0b2340] text-[#0b2340] bg-blue-50/40'
                  : 'border-transparent text-gray-400 hover:text-[#0b2340]'
              }`
            }
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default NavMenu;
