
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BarChartCardProps {
  title: string;
  data: any[];
  dataKey: string;
  nameKey: string;
  color?: string;
}

const BarChartCard: React.FC<BarChartCardProps> = ({ title, data, dataKey, nameKey, color = '#0b2340' }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-bold text-gray-800 uppercase tracking-wide text-sm mb-4">{title}</h3>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey={nameKey} 
              type="category" 
              tick={{ fontSize: 12, fontWeight: 600 }}
              width={80}
            />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey={dataKey} radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartCard;
