import React from 'react';
import { Mountain, User, LogOut, LogIn, Layout } from 'lucide-react';
import { motion } from 'motion/react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavigationBarProps {
  user: FirebaseUser | null;
  onLogin: () => void;
  isLoggingIn: boolean;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ 
  user, 
  onLogin, 
  isLoggingIn,
  onLogout, 
  activeTab, 
  setActiveTab,
  isSidebarOpen,
  toggleSidebar 
}) => {
  return (
    <nav className="h-16 border-b border-[#1F2937] bg-[#0D141C]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3">
          {user && (
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-[#1F2937] rounded-lg transition-all text-[#9CA3AF] hover:text-[#2EC4B6] mr-2"
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <Layout className={`w-5 h-5 transition-transform ${!isSidebarOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
          <div className="w-9 h-9 bg-gradient-to-br from-[#2EC4B6] to-[#A855F7] rounded-xl flex items-center justify-center shadow-lg shadow-[#2EC4B6]/20">
            <Mountain className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-white">GeoMapper <span className="text-[#2EC4B6]">AI</span></span>
        </div>
        
        {user && (
          <div className="hidden md:flex items-center gap-8">
            {['Dashboard', 'Analytics', 'Weather', 'Settings'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative py-6 ${activeTab === tab ? 'text-[#2EC4B6]' : 'text-[#4B5563] hover:text-white'}`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2EC4B6] shadow-[0_0_10px_#2EC4B6]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#111827] border border-[#1F2937]">
          <div className="w-2 h-2 bg-[#2EC4B6] rounded-full animate-pulse shadow-[0_0_8px_#2EC4B6]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">User: {user ? user.displayName : 'Guest'}</span>
        </div>
        
        {user ? (
          <button onClick={onLogout} className="p-2 text-[#4B5563] hover:text-[#FF6B35] transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={onLogin} 
            disabled={isLoggingIn}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2EC4B6] text-[#0A0F14] rounded-xl text-[11px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_#2EC4B6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <div className="w-4 h-4 border-2 border-[#0A0F14] border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {isLoggingIn ? 'Connecting...' : 'Sign In'}
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
