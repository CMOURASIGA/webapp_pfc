
import React from 'react';

interface Column {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
}

interface RankingTableProps {
  columns: Column[];
  data: any[];
  progressKey?: string;
  maxProgress?: number;
  title?: string;
}

const RankingTable: React.FC<RankingTableProps> = ({ columns, data, progressKey, maxProgress, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] shadow-sm p-12 text-center text-gray-400 italic border border-dashed border-gray-200">
        Nenhum dado disponível para este ranking.
      </div>
    );
  }

  const effectiveMax = maxProgress || (progressKey ? Math.max(...data.map(d => d[progressKey])) : 1);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
      {title && (
        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <h3 className="font-black text-[#0b2340] uppercase tracking-[0.2em] text-[10px]">{title}</h3>
          <span className="text-[10px] bg-[#0b2340] text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">RANKING</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0b2340] text-white text-[9px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-6 py-5 w-16 text-center">#</th>
              {columns.map(col => (
                <th key={col.key} className={`px-6 py-5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} whitespace-nowrap`}>
                  {col.header}
                </th>
              ))}
              {progressKey && <th className="px-6 py-5 text-right whitespace-nowrap">Histórico</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-6 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-[10px] italic ${
                    idx === 0 ? 'bg-yellow-400 text-white' : 
                    idx === 1 ? 'bg-gray-200 text-gray-500' :
                    idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {idx + 1}º
                  </span>
                </td>
                {columns.map(col => (
                  <td key={col.key} className={`px-6 py-6 font-black text-gray-900 text-sm uppercase leading-[1.2] ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                    {row[col.key]}
                  </td>
                ))}
                {progressKey && (
                  <td className="px-6 py-6">
                    <div className="flex items-center justify-end gap-3 min-w-[120px]">
                       <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#0b2340] to-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.max(2, (row[progressKey] / (effectiveMax || 1)) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-black text-[#0b2340] w-6 text-right">{row[progressKey]}</span>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingTable;
