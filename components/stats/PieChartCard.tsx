
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DataItem {
  name: string;
  value: number;
}

interface PieChartCardProps {
  title: string;
  data: DataItem[];
}

const COLORS_CHART = ['#0b2340', '#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

const PieChartCard: React.FC<PieChartCardProps> = ({ title, data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-transparent h-[250px] w-full">
      {title && <h3 className="font-black text-[#0b2340] uppercase tracking-widest text-[10px] mb-4 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} className="outline-none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px' }} 
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            formatter={(value) => <span className="text-[10px] font-black uppercase text-gray-500 ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartCard;
