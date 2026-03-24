import React from 'react';
import { Mountain, Globe, LogIn, Zap, Shield, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onLogin: () => void;
}

const features = [
  { icon: Globe, label: 'Interactive Mapping', desc: 'Explore terrain with satellite imagery and custom overlays.' },
  { icon: Zap, label: 'AI Intelligence', desc: 'Gemini-powered geological analysis at any coordinate.' },
  { icon: Shield, label: 'Risk Assessment', desc: 'Identify seismic, erosion, and terrain risk levels instantly.' },
  { icon: BarChart3, label: 'Advanced Analytics', desc: 'Elevation profiles, slope correlations, and terrain distribution.' },
];

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-[#0A0F14] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#2EC4B6 1px, transparent 1px), linear-gradient(90deg, #2EC4B6 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-10 max-w-3xl w-full text-center"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#2EC4B6]/10 border border-[#2EC4B6]/30 rounded-2xl">
            <Mountain className="w-10 h-10 text-[#2EC4B6]" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
              GeoMapper<span className="text-[#2EC4B6]">AI</span>
            </h1>
            <p className="text-xs text-[#9CA3AF] font-semibold uppercase tracking-widest mt-1">
              Geological Intelligence Platform
            </p>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-lg text-[#9CA3AF] max-w-xl leading-relaxed">
          Explore, analyse, and understand Earth's terrain with AI-driven geological insights powered by Google Gemini and Mapbox.
        </p>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-start gap-3 p-4 bg-[#0D141C] border border-[#1F2937] rounded-xl text-left hover:border-[#2EC4B6]/30 transition-colors"
            >
              <div className="p-2 bg-[#2EC4B6]/10 rounded-lg shrink-0">
                <Icon className="w-4 h-4 text-[#2EC4B6]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sign in button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onLogin}
          className="flex items-center gap-3 px-8 py-4 bg-[#2EC4B6] hover:bg-[#25a99d] text-[#0A0F14] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-[#2EC4B6]/20 transition-colors text-sm"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </motion.button>

        <p className="text-xs text-[#4B5563]">
          Secure authentication via Google. No password required.
        </p>
      </motion.div>
    </div>
  );
};

export default LandingPage;
