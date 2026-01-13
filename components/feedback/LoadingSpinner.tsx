
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Sincronizando estatísticas...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-20 space-y-6">
      <div className="relative">
        <div className="bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 z-10 relative">
          <img 
            src="https://i.imgur.com/ExEJtwR.png" 
            alt="Logo Pelada PFC" 
            className="w-16 h-16 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/53/53283.png';
            }}
          />
        </div>
        <Loader2 className="w-24 h-24 text-[#0b2340] animate-spin absolute -top-4 -left-4 opacity-20" />
      </div>
      <div className="text-center">
        <p className="text-gray-900 font-black text-lg uppercase tracking-tight">{text}</p>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 italic">Conectando ao PFC Cloud</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
