import React from 'react';
import { Mountain, Map, BarChart3, FileText, Settings, LogOut, Menu, X } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavigationBarProps {
  user: FirebaseUser;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const tabs = [
  { label: 'Dashboard', icon: Map },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Reports', icon: FileText },
  { label: 'Settings', icon: Settings },
];

const NavigationBar: React.FC<NavigationBarProps> = ({
  user,
  onLogout,
  activeTab,
  setActiveTab,
  isSidebarOpen,
  toggleSidebar,
}) => {
  return (
    <header className="flex items-center gap-4 px-4 h-14 bg-[#0D141C] border-b border-[#1F2937] z-40 shrink-0">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-[#1F2937] transition-colors text-[#9CA3AF] hover:text-[#2EC4B6]"
        title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div className="flex items-center gap-2 mr-4">
        <Mountain className="w-5 h-5 text-[#2EC4B6]" />
        <span className="text-sm font-black tracking-tighter uppercase italic text-white">GeoMapperAI</span>
      </div>

      <nav className="flex items-center gap-1 flex-1">
        {tabs.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setActiveTab(label)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === label
                ? 'bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/30'
                : 'text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-7 h-7 rounded-full border border-[#1F2937]"
          />
        )}
        <span className="text-xs text-[#9CA3AF] hidden sm:block">{user.displayName || user.email}</span>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] transition-all"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Sign out</span>
        </button>
      </div>
    </header>
  );
};

export default NavigationBar;
