import React, { useState, useEffect } from 'react';
import { 
  User, 
  Globe, 
  Database, 
  LogOut, 
  Moon, 
  Sun,
  Cpu,
  Check,
  Mail,
  ShieldCheck,
  Camera,
  Save,
  Loader2,
  Settings
} from 'lucide-react';
import { User as FirebaseUser, updateProfile } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsViewProps {
  user: FirebaseUser | null;
  onLogout: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  hardwareAcceleration: boolean;
  setHardwareAcceleration: (on: boolean) => void;
  dataRetention: string;
  setDataRetention: (policy: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onLogout,
  theme,
  setTheme,
  hardwareAcceleration,
  setHardwareAcceleration,
  dataRetention,
  setDataRetention
}) => {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [mapboxTokenStatus, setMapboxTokenStatus] = useState<'loading' | 'active' | 'error'>('loading');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await fetch('/api/mapbox-token');
        if (response.ok) setMapboxTokenStatus('active');
        else setMapboxTokenStatus('error');
      } catch {
        setMapboxTokenStatus('error');
      }
    };
    checkToken();
  }, []);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      await updateProfile(user, {
        displayName,
        photoURL
      });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-[#0A0F14] custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">System Settings</h2>
          <p className="text-sm text-[#FF6B35] font-bold uppercase tracking-widest mt-1">Configure your Geological Intelligence Platform</p>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-6 py-3 bg-[#111827] border border-[#FF6B35]/30 rounded-xl text-[11px] font-black uppercase tracking-widest text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Settings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Account Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-[#111827] rounded-lg border border-[#1F2937]">
                <User className="w-5 h-5 text-[#2EC4B6]" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Account Profile</h3>
            </div>

            <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-8 space-y-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-[#0A0F14] border-2 border-[#1F2937] overflow-hidden flex items-center justify-center">
                    {photoURL ? (
                      <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-10 h-10 text-[#4B5563]" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-[#2EC4B6] rounded-lg shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4 text-[#0A0F14]" />
                  </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Display Name</label>
                      <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-[#0A0F14] border border-[#1F2937] rounded-xl px-4 py-3 text-sm text-white focus:border-[#2EC4B6] outline-none transition-all"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Email Address</label>
                      <div className="w-full bg-[#0A0F14]/50 border border-[#1F2937] rounded-xl px-4 py-3 text-sm text-[#4B5563] flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Avatar URL</label>
                    <input 
                      type="text" 
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="w-full bg-[#0A0F14] border border-[#1F2937] rounded-xl px-4 py-3 text-sm text-white focus:border-[#2EC4B6] outline-none transition-all"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#2EC4B6] uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      Verified Account
                    </div>
                    <button 
                      onClick={handleUpdateProfile}
                      disabled={isUpdatingProfile}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#2EC4B6] text-[#0A0F14] rounded-xl text-[11px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_#2EC4B6] transition-all disabled:opacity-50"
                    >
                      {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {updateSuccess ? 'Updated!' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Map & Engine Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-[#111827] rounded-lg border border-[#1F2937]">
                <Globe className="w-5 h-5 text-[#A855F7]" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Map & Engine</h3>
            </div>

            <div className="bg-[#111827] border border-[#1F2937] rounded-3xl divide-y divide-[#1F2937]">
              {/* Mapbox Token */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0A0F14] rounded-xl border border-[#1F2937]">
                    <Globe className="w-5 h-5 text-[#9CA3AF]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Mapbox API Configuration</p>
                    <p className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Status of your Mapbox access token</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-[#0A0F14] border border-[#1F2937] rounded-full ${mapboxTokenStatus === 'active' ? 'text-[#2EC4B6]' : 'text-[#FF6B35]'}`}>
                    {mapboxTokenStatus === 'active' ? 'Token Active' : mapboxTokenStatus === 'loading' ? 'Checking...' : 'Token Error'}
                  </span>
                </div>
              </div>

              {/* Hardware Acceleration */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0A0F14] rounded-xl border border-[#1F2937]">
                    <Cpu className="w-5 h-5 text-[#9CA3AF]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Hardware Acceleration</p>
                    <p className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Optimize performance for 3D terrain rendering</p>
                  </div>
                </div>
                <button 
                  onClick={() => setHardwareAcceleration(!hardwareAcceleration)}
                  className={`w-12 h-6 rounded-full transition-all relative ${hardwareAcceleration ? 'bg-[#2EC4B6]' : 'bg-[#1F2937]'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${hardwareAcceleration ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Data Retention */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0A0F14] rounded-xl border border-[#1F2937]">
                    <Database className="w-5 h-5 text-[#9CA3AF]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Data Retention Policy</p>
                    <p className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Set how long your analysis data is stored locally</p>
                  </div>
                </div>
                <select 
                  value={dataRetention}
                  onChange={(e) => setDataRetention(e.target.value)}
                  className="bg-[#0A0F14] border border-[#1F2937] rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#2EC4B6] outline-none"
                >
                  <option value="7 days">7 Days</option>
                  <option value="30 days">30 Days</option>
                  <option value="90 days">90 Days</option>
                  <option value="Indefinite">Indefinite</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Preferences & Info */}
        <div className="space-y-8">
          {/* Preferences Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-[#111827] rounded-lg border border-[#1F2937]">
                <Settings className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Preferences</h3>
            </div>

            <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Interface Theme</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${theme === 'dark' ? 'bg-[#2EC4B6]/10 border-[#2EC4B6] text-[#2EC4B6]' : 'bg-[#0A0F14] border-[#1F2937] text-[#4B5563] hover:border-[#4B5563]'}`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Dark</span>
                  </button>
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${theme === 'light' ? 'bg-[#2EC4B6]/10 border-[#2EC4B6] text-[#2EC4B6]' : 'bg-[#0A0F14] border-[#1F2937] text-[#4B5563] hover:border-[#4B5563]'}`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Light</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* System Info Section */}
          <div className="p-8 bg-[#111827] border border-[#1F2937] rounded-3xl space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4B5563]">About GeoMapper AI</h3>
            <div className="space-y-4">
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
            
            <div className="pt-4 border-t border-[#1F2937]">
              <div className="flex items-center gap-3 text-[#2EC4B6]">
                <Check className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">System Up to Date</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
