
import React from 'react';
import TopBar from './TopBar';
import NavMenu from './NavMenu';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fc]">
      <TopBar />
      <main className="flex-1 container mx-auto px-4 pt-6 pb-24 lg:px-8 max-w-7xl">
        {children}
      </main>
      <NavMenu />
      <footer className="hidden lg:block py-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest border-t bg-white">
        &copy; {new Date().getFullYear()} Pelada PFC - Análise de Resultados Profissional
      </footer>
    </div>
  );
};

export default MainLayout;
