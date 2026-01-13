
import React, { useState } from 'react';
import TopBar from './TopBar';
import NavMenu from './NavMenu';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f4f7fc]">
      {/* Menu Lateral */}
      <NavMenu 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col transition-all duration-300 lg:pl-20 xl:pl-72">
        <TopBar onOpenMenu={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 container mx-auto px-4 py-8 lg:px-8 max-w-7xl animate-in fade-in duration-500">
          {children}
        </main>

        <footer className="py-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest border-t bg-white">
          &copy; {new Date().getFullYear()} Pelada PFC - Dashboard Profissional
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
