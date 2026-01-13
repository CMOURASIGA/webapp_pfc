
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'primary' | 'success' | 'danger' | 'accent';
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, variant = 'primary', icon }) => {
  const borderVariants = {
    primary: 'border-l-[#0b2340]',
    success: 'border-l-emerald-500',
    danger: 'border-l-rose-500',
    accent: 'border-l-sky-500',
  };

  const textColors = {
    primary: 'text-gray-900', // Texto preto para visibilidade total
    success: 'text-emerald-700',
    danger: 'text-rose-700',
    accent: 'text-sky-700',
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${borderVariants[variant]} flex flex-col justify-between min-h-[140px] transition-all hover:shadow-md border border-gray-100`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{title}</h3>
        {icon && <div className="text-gray-300">{icon}</div>}
      </div>
      <div>
        <p className={`text-2xl font-black truncate ${textColors[variant]}`}>{value}</p>
        {subtitle && <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tight">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
