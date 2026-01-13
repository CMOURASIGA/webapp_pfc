
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../constants';
import { getCurrentUser, logout } from '../../services/authService';
import { LogOut, UserCircle, Menu } from 'lucide-react';

interface TopBarProps {
  onOpenMenu: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onOpenMenu }) => {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header 
      className="sticky top-0 z-[100] flex items-center justify-between px-4 lg:px-8 py-4 text-white shadow-lg border-b border-white/10 h-20"
      style={{ backgroundColor: COLORS.primary }}
    >
      <div className="flex items-center gap-4">
        {/* Botão Menu Mobile */}
        <button 
          onClick={onOpenMenu}
          className="p-2 lg:hidden bg-white/10 rounded-xl hover:bg-white/20 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex items-center gap-4">
          <div className="bg-white p-1.5 rounded-xl shadow-inner hidden lg:block">
            <img 
              src="https://i.imgur.com/ExEJtwR.png" 
              alt="Logo Pelada PFC" 
              className="w-10 h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/53/53283.png';
              }}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Pelada PFC</h1>
            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-[0.2em] mt-0.5">Gestão de Performance</span>
          </div>
        </div>
        
        {/* Título simplificado para mobile */}
        <div className="sm:hidden">
          <h1 className="text-lg font-black tracking-tighter uppercase leading-none">PFC MANAGER</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4 lg:gap-6">
        {user && (
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-300">Logado como</span>
              <span className="text-xs font-black uppercase flex items-center gap-1.5">
                <UserCircle className="w-3.5 h-3.5" />
                {user.username}
              </span>
            </div>
            
            <div className="h-8 w-px bg-white/10 hidden md:block"></div>

            <button 
              onClick={handleLogout}
              className="p-2.5 bg-white/10 hover:bg-rose-500 rounded-xl transition-all group"
              title="Sair do sistema"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
