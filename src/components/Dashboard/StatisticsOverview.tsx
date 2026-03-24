import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Maximize2, Minimize2 } from 'lucide-react';

const PIE_DATA = [
  { name: 'Low Risk', value: 45, color: '#2EC4B6' },
  { name: 'Moderate Risk', value: 35, color: '#F5F7FA' },
  { name: 'High Risk', value: 20, color: '#FF6B35' },
];

interface StatisticsOverviewProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({ isExpanded, onToggleExpand }) => {
  return (
    <div className={`glass-panel p-5 flex flex-col gap-4 h-full ${isExpanded ? 'overflow-y-auto' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#B0C4D6]">Statistics Overview</h3>
        <button 
          onClick={onToggleExpand}
          className="p-1 hover:bg-[#2C4257] rounded transition-colors"
        >
          {isExpanded ? <Minimize2 className="w-4 h-4 text-[#2EC4B6]" /> : <Maximize2 className="w-4 h-4 text-[#B0C4D6]" />}
        </button>
      </div>

      <div className={`${isExpanded ? 'h-[400px]' : 'h-[180px]'} flex items-center justify-center relative transition-all duration-500`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={PIE_DATA}
              cx="50%"
              cy="50%"
              innerRadius={isExpanded ? 80 : 50}
              outerRadius={isExpanded ? 120 : 70}
              paddingAngle={8}
              dataKey="value"
            >
              {PIE_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-[#B0C4D6] uppercase font-bold">Total</span>
          <span className={`${isExpanded ? 'text-3xl' : 'text-xl'} font-bold transition-all`}>100%</span>
        </div>
      </div>
      
      <div className={`space-y-3 mt-4 ${isExpanded ? 'grid grid-cols-3 gap-6 space-y-0' : ''}`}>
        {PIE_DATA.map(item => (
          <div key={item.name} className={`flex items-center justify-between ${isExpanded ? 'flex-col items-start p-4 bg-[#14222E]/50 rounded border border-[#2C4257]' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-[#B0C4D6]">{item.name}:</span>
            </div>
            <span className={`${isExpanded ? 'text-2xl mt-2' : 'text-sm'} font-bold`}>{item.value}%</span>
          </div>
        ))}
      </div>

      {isExpanded && (
        <div className="mt-8 p-6 bg-[#14222E]/50 rounded-lg border border-[#2C4257]">
          <h4 className="text-lg font-bold mb-4">Risk Distribution Analysis</h4>
          <p className="text-sm text-[#B0C4D6] leading-relaxed">
            The statistical model shows a significant concentration of high-risk zones in the northern quadrant. 
            Moderate risk areas are primarily located in transition zones between peaks and valleys. 
            Low-risk zones are concentrated in the southern plateau areas.
          </p>
        </div>
      )}
    </div>
  );
};

export default StatisticsOverview;
