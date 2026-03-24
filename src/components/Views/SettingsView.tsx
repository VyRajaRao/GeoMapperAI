import React from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Database, 
  Key, 
  LogOut, 
  ChevronRight, 
  Moon, 
  Sun,
  Cpu,
  Zap,
  HardDrive
} from 'lucide-react';

const SettingsView: React.FC = () => {
  const sections = [
    { 
      title: 'Account & Security', 
      icon: Shield, 
      color: '#2EC4B6',
      items: [
        { label: 'Profile Information', desc: 'Update your name, email, and avatar.', icon: User },
        { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account.', icon: Key, status: 'Enabled' },
        { label: 'Privacy Settings', desc: 'Control who can see your shared reports.', icon: Shield },
      ]
    },
    { 
      title: 'Geospatial Engine', 
      icon: Globe, 
      color: '#A855F7',
      items: [
        { label: 'Mapbox API Configuration', desc: 'Manage your Mapbox access tokens and styles.', icon: Globe },
        { label: 'Gemini AI Integration', desc: 'Configure AI model parameters and data sources.', icon: Zap, status: 'v3.1 Pro' },
        { label: 'Data Retention Policy', desc: 'Set how long your analysis data is stored.', icon: Database },
      ]
    },
    { 
      title: 'System Preferences', 
      icon: Settings, 
      color: '#FF6B35',
      items: [
        { label: 'Interface Theme', desc: 'Switch between dark, light, and system themes.', icon: Moon, status: 'Dark' },
        { label: 'Notification Center', desc: 'Manage your email and push notifications.', icon: Bell },
        { label: 'Hardware Acceleration', desc: 'Optimize performance for 3D terrain rendering.', icon: Cpu, status: 'On' },
      ]
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-[#0A0F14] custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">System Settings</h2>
          <p className="text-sm text-[#FF6B35] font-bold uppercase tracking-widest mt-1">Configure your Geological Intelligence Platform</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#111827] border border-[#FF6B35]/30 rounded-xl text-[11px] font-black uppercase tracking-widest text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-all">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Navigation */}
        <div className="lg:col-span-2 space-y-8">
          {sections.map((section, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="p-2 bg-[#111827] rounded-lg border border-[#1F2937]">
                  <section.icon className="w-5 h-5" style={{ color: section.color }} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">{section.title}</h3>
              </div>
              
              <div className="bg-[#111827] border border-[#1F2937] rounded-3xl overflow-hidden">
                {section.items.map((item, j) => (
                  <button key={j} className="w-full flex items-center justify-between p-6 hover:bg-[#0D141C] border-b border-[#1F2937] last:border-0 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#0A0F14] rounded-xl border border-[#1F2937] group-hover:border-[#2EC4B6]/30 transition-all">
                        <item.icon className="w-5 h-5 text-[#9CA3AF]" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{item.label}</p>
                        <p className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.status && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-[#0A0F14] border border-[#1F2937] rounded-full text-[#2EC4B6]">
                          {item.status}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-[#4B5563] group-hover:text-white transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - System Info */}
        <div className="space-y-8">
          <div className="p-8 bg-gradient-to-br from-[#111827] to-[#0A0F14] border border-[#1F2937] rounded-3xl space-y-8">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-[#2EC4B6]" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">System Resources</h3>
            </div>
            
            <div className="space-y-6">
              {[
                { label: 'Storage Usage', value: '12.4 GB / 50 GB', percent: 25, color: '#2EC4B6' },
                { label: 'API Quota', value: '842 / 1,000 req', percent: 84, color: '#FF6B35' },
                { label: 'Memory Usage', value: '1.2 GB / 4 GB', percent: 30, color: '#A855F7' },
              ].map((resource, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-[#9CA3AF]">{resource.label}</span>
                    <span className="text-white">{resource.value}</span>
                  </div>
                  <div className="h-1.5 bg-[#0A0F14] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${resource.percent}%`, backgroundColor: resource.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#0A0F14] border border-[#1F2937] rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-[#2EC4B6]/10 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#2EC4B6]" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white">Pro Plan Active</p>
                <p className="text-[9px] font-bold text-[#4B5563] uppercase tracking-wider">Next billing: Apr 23, 2026</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-[#111827] border border-[#1F2937] rounded-3xl space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4B5563]">About GeoMapper AI</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#9CA3AF]">Version</span>
                <span className="text-white">2.5.0-stable</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#9CA3AF]">Build Date</span>
                <span className="text-white">Mar 23, 2026</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#9CA3AF]">License</span>
                <span className="text-white">Enterprise</span>
              </div>
            </div>
            <button className="w-full py-3 mt-4 border border-[#1F2937] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] hover:bg-[#0A0F14] transition-all">
              Check for Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
