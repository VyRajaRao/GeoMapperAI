import React from 'react';
import { ChevronRight, Maximize2, Minimize2, FileText, Download, Share2 } from 'lucide-react';

const RECENT_REPORTS = [
  { id: 1, name: 'Site A - Landslide Risk', color: '#2EC4B6', date: '2026-03-20', status: 'Completed' },
  { id: 2, name: 'Site B - Ridge Analysis', color: '#B0C4D6', date: '2026-03-18', status: 'In Review' },
  { id: 3, name: 'Site C - Mountain Survey', color: '#FF6B35', date: '2026-03-15', status: 'Pending' },
  { id: 4, name: 'Site D - Terrain Mapping', color: '#2EC4B6', date: '2026-03-12', status: 'Completed' },
  { id: 5, name: 'Site E - Slope Stability', color: '#B0C4D6', date: '2026-03-10', status: 'Completed' },
];

interface ReportsPanelProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ReportsPanel: React.FC<ReportsPanelProps> = ({ isExpanded, onToggleExpand }) => {
  return (
    <div className={`glass-panel p-5 flex flex-col gap-4 h-full ${isExpanded ? 'overflow-y-auto' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#B0C4D6]">Recent Reports</h3>
        <button 
          onClick={onToggleExpand}
          className="p-1 hover:bg-[#2C4257] rounded transition-colors"
        >
          {isExpanded ? <Minimize2 className="w-4 h-4 text-[#2EC4B6]" /> : <Maximize2 className="w-4 h-4 text-[#B0C4D6]" />}
        </button>
      </div>

      <div className={`space-y-3 ${isExpanded ? 'grid grid-cols-2 gap-6 space-y-0' : ''}`}>
        {(isExpanded ? RECENT_REPORTS : RECENT_REPORTS.slice(0, 3)).map(report => (
          <button 
            key={report.id} 
            className={`w-full flex items-center justify-between p-3 rounded bg-[#14222E]/50 border border-[#2C4257] hover:border-[#2EC4B6] transition-all group ${isExpanded ? 'p-6' : 'p-3'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: report.color }} />
              <div className="flex flex-col items-start">
                <span className="text-sm text-[#B0C4D6] group-hover:text-[#F5F7FA] transition-colors">{report.name}</span>
                {isExpanded && <span className="text-xs text-[#2C4257] mt-1">{report.date} | {report.status}</span>}
              </div>
            </div>
            {isExpanded ? (
              <div className="flex gap-2">
                <button className="p-2 hover:bg-[#2C4257] rounded transition-colors"><Download className="w-4 h-4 text-[#B0C4D6]" /></button>
                <button className="p-2 hover:bg-[#2C4257] rounded transition-colors"><Share2 className="w-4 h-4 text-[#B0C4D6]" /></button>
              </div>
            ) : (
              <ChevronRight className="w-4 h-4 text-[#2C4257] group-hover:text-[#2EC4B6] transition-colors" />
            )}
          </button>
        ))}
      </div>

      {isExpanded && (
        <div className="mt-8 p-6 bg-[#14222E]/50 rounded-lg border border-[#2C4257]">
          <h4 className="text-lg font-bold mb-4">Report Generation System</h4>
          <p className="text-sm text-[#B0C4D6] leading-relaxed mb-4">
            All reports are automatically generated using multi-modal AI analysis of satellite imagery and terrain data. 
            Reports include detailed slope analysis, landmark identification, and risk assessment metrics.
          </p>
          <button className="flex items-center gap-2 px-6 py-2 bg-[#2EC4B6] text-[#14222E] rounded-md text-sm font-bold hover:bg-[#2EC4B6]/90 transition-all">
            <FileText className="w-4 h-4" />
            Generate New Report
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsPanel;
