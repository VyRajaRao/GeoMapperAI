import React from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  Clock, 
  Filter, 
  Plus, 
  Search,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  FileSearch
} from 'lucide-react';

const ReportsView: React.FC = () => {
  const reports = [
    { id: 'REP-2026-001', title: 'Terrain Stability Analysis - North Quadrant', date: 'Mar 22, 2026', type: 'Geological', status: 'Completed', size: '4.2 MB' },
    { id: 'REP-2026-002', title: 'Mineral Density Mapping - Site B', date: 'Mar 20, 2026', type: 'Resource', status: 'Processing', size: '12.8 MB' },
    { id: 'REP-2026-003', title: 'Seismic Risk Assessment - Coastal Region', date: 'Mar 18, 2026', type: 'Risk', status: 'Completed', size: '2.5 MB' },
    { id: 'REP-2026-004', title: 'Topographical Survey - Central Valley', date: 'Mar 15, 2026', type: 'Survey', status: 'Draft', size: '8.1 MB' },
    { id: 'REP-2026-005', title: 'Erosion Impact Study - River Delta', date: 'Mar 12, 2026', type: 'Environmental', status: 'Completed', size: '5.4 MB' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#0A0F14] custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">Intelligence Reports</h2>
          <p className="text-sm text-[#A855F7] font-bold uppercase tracking-widest mt-1">Comprehensive Geological Documentation</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2EC4B6] to-[#A855F7] rounded-xl text-[11px] font-black uppercase tracking-widest text-white hover:shadow-[0_0_20px_rgba(46,196,182,0.4)] transition-all">
          <Plus className="w-4 h-4" />
          Create New Report
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-[#111827] border border-[#1F2937] rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
          <input 
            type="text" 
            placeholder="Search reports by ID or title..." 
            className="w-full pl-12 pr-4 py-3 bg-[#0A0F14] border border-[#1F2937] rounded-xl text-sm text-white placeholder-[#4B5563] outline-none focus:border-[#2EC4B6]/50 transition-all"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-[#0A0F14] border border-[#1F2937] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] hover:border-[#2EC4B6]/50 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-[#0A0F14] border border-[#1F2937] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] hover:border-[#2EC4B6]/50 transition-all">
            <Clock className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0D141C] border-b border-[#1F2937]">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Report ID</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Title & Type</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Status</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Date Created</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#4B5563]">File Size</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#4B5563] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, i) => (
              <tr key={i} className="border-b border-[#1F2937] hover:bg-[#0D141C] transition-colors group">
                <td className="p-6">
                  <span className="text-[11px] font-black text-[#2EC4B6] tabular-nums">{report.id}</span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#0A0F14] rounded-lg border border-[#1F2937] group-hover:border-[#2EC4B6]/30 transition-all">
                      <FileText className="w-5 h-5 text-[#9CA3AF]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{report.title}</p>
                      <p className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">{report.type}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    {report.status === 'Completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#2EC4B6]" />
                    ) : report.status === 'Processing' ? (
                      <div className="w-4 h-4 border-2 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#FFD166]" />
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      report.status === 'Completed' ? 'text-[#2EC4B6]' : 
                      report.status === 'Processing' ? 'text-[#A855F7]' : 'text-[#FFD166]'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="text-xs font-bold text-[#9CA3AF]">{report.date}</span>
                </td>
                <td className="p-6">
                  <span className="text-xs font-bold text-[#4B5563] tabular-nums">{report.size}</span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-[#1F2937] rounded-lg text-[#9CA3AF] hover:text-[#2EC4B6] transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-[#1F2937] rounded-lg text-[#9CA3AF] hover:text-[#2EC4B6] transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-[#1F2937] rounded-lg text-[#9CA3AF] hover:text-[#2EC4B6] transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-[#1F2937] rounded-lg text-[#9CA3AF] hover:text-[#FF6B35] transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State / AI Search */}
      <div className="p-12 bg-gradient-to-br from-[#111827] to-[#0A0F14] border border-[#1F2937] rounded-3xl flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-[#2EC4B6]/10 rounded-full flex items-center justify-center">
          <FileSearch className="w-10 h-10 text-[#2EC4B6]" />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">AI Global Search</h3>
          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            Can't find what you're looking for? Use our AI-powered global search to scan through millions of geological records and generate a custom report in seconds.
          </p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Ask AI about a location..." 
            className="w-80 px-6 py-3 bg-[#0A0F14] border border-[#1F2937] rounded-xl text-sm text-white outline-none focus:border-[#2EC4B6]/50 transition-all"
          />
          <button className="px-8 py-3 bg-[#2EC4B6] rounded-xl text-[11px] font-black uppercase tracking-widest text-[#0A0F14] hover:shadow-[0_0_15px_#2EC4B6] transition-all">
            Query AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
