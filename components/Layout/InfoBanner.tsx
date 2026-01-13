
import React from 'react';
import { Info } from 'lucide-react';

interface InfoBannerProps {
  text: string;
  variant?: 'blue' | 'emerald' | 'purple' | 'orange' | 'slate';
}

const InfoBanner: React.FC<InfoBannerProps> = ({ text, variant = 'blue' }) => {
  const variants = {
    blue: 'bg-blue-50 border-blue-100 text-blue-800',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    purple: 'bg-purple-50 border-purple-100 text-purple-800',
    orange: 'bg-orange-50 border-orange-100 text-orange-800',
    slate: 'bg-slate-50 border-slate-200 text-slate-800',
  };

  const iconColors = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    slate: 'text-slate-600',
  };

  return (
    <div className={`${variants[variant]} border rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500 mb-6`}>
      <Info className={`w-5 h-5 ${iconColors[variant]} shrink-0 mt-0.5`} />
      <p className="text-[10px] font-black uppercase leading-relaxed tracking-tight">
        {text}
      </p>
    </div>
  );
};

export default InfoBanner;
