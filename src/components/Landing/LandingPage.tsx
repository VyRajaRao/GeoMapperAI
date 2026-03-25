import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { LogIn, ChevronRight, Globe as GlobeIcon, Shield, Activity, Cpu } from 'lucide-react';

const Globe = () => {
  const globeRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
    if (gridRef.current) {
      gridRef.current.rotation.y += 0.003;
      gridRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group>
      {/* Main Globe */}
      <Sphere ref={globeRef} args={[2, 64, 64]}>
        <MeshDistortMaterial
          color="#111827"
          speed={1.5}
          distort={0.2}
          radius={1}
          emissive="#2EC4B6"
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>

      {/* Geospatial Grid Lines */}
      <group ref={gridRef}>
        <Sphere args={[2.05, 32, 32]}>
          <meshBasicMaterial
            color="#2EC4B6"
            wireframe
            transparent
            opacity={0.15}
          />
        </Sphere>
        
        {/* Latitude/Longitude Arcs */}
        {[...Array(8)].map((_, i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 4, 0]}>
            <mesh>
              <torusGeometry args={[2.1, 0.005, 16, 100]} />
              <meshBasicMaterial color="#2EC4B6" transparent opacity={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Atmospheric Glow */}
      <Sphere args={[2.2, 32, 32]}>
        <meshBasicMaterial
          color="#2EC4B6"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
};

const ParticleField = () => {
  const count = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    // Subtle movement
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#2EC4B6"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

const LandingPage: React.FC<{ onLogin: () => void; isLoggingIn: boolean }> = ({ onLogin, isLoggingIn }) => {
  return (
    <div className="relative w-full h-screen bg-[#0A0F14] overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#2EC4B6" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#A855F7" />
          
          <Suspense fallback={null}>
            <Globe />
            <ParticleField />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Environment preset="night" />
          </Suspense>
        </Canvas>
      </div>

      {/* Overlay Gradients */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-b from-transparent via-[#0A0F14]/40 to-[#0A0F14]" />
      <div className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#0A0F14_100%)] opacity-60" />

      {/* Foreground UI */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6">
        
        {/* UI Frame (Responsive Container for Edge Elements) */}
        <div className="absolute inset-0 max-w-[1600px] mx-auto pointer-events-none z-20">
          {/* Logo (Top Left) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-8 left-8 pointer-events-auto"
          >
            <motion.div
              animate={{ 
                y: [0, -8, 0],
                filter: ["drop-shadow(0 0 5px rgba(46,196,182,0.1))", "drop-shadow(0 0 20px rgba(46,196,182,0.3))", "drop-shadow(0 0 5px rgba(46,196,182,0.1))"]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="p-3 bg-white/90 backdrop-blur-xl border border-[#1F2937] rounded-xl shadow-2xl"
            >
              <img 
                src="https://mlrit.ac.in/wp-content/uploads/2022/05/logo_V4.jpg" 
                alt="MLRIT Logo" 
                className="h-10 md:h-14 w-auto object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x100/FFFFFF/000000?text=MLR+Institute+of+Technology';
                }}
              />
            </motion.div>
          </motion.div>

          {/* Institutional Text (Top Right) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-8 right-8 pointer-events-auto"
          >
            <div className="flex flex-col items-end border-r border-[#1F2937] pr-4 py-1 text-right">
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-[#B0C4D6] opacity-60">An Initiative by</span>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white">MLR Institute of Technology</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#2EC4B6]" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[#2EC4B6]">Department of CSE</span>
              </div>
            </div>
          </motion.div>

          {/* Side Badge (Restructured Vertical Rail) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-12 pointer-events-auto"
          >
            <div className="flex flex-col items-center gap-8">
              <div className="h-32 w-[1px] bg-gradient-to-t from-transparent via-[#2EC4B6]/40 to-[#2EC4B6]/10" />
              <div className="p-4 bg-[#2EC4B6]/5 rounded-full border border-[#2EC4B6]/20 backdrop-blur-sm">
                <Cpu className="w-5 h-5 text-[#2EC4B6] animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl w-full text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic text-white drop-shadow-2xl">
              GeoMapper <span className="inline-block px-2 text-transparent bg-clip-text bg-gradient-to-r from-[#2EC4B6] to-[#A855F7]">AI</span>
            </h1>
            <p className="text-sm md:text-lg font-bold uppercase tracking-[0.3em] text-[#2EC4B6] opacity-80">
              Geological Intelligence Platform
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-[#B0C4D6] text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Pioneering the future of geospatial analysis. Our platform leverages advanced 
            neural networks to provide real-time terrain intelligence, risk forecasting, 
            and planetary-scale geological mapping.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <button 
              onClick={onLogin}
              disabled={isLoggingIn}
              className="group relative flex items-center gap-3 px-10 py-5 bg-[#2EC4B6] text-[#0A0F14] rounded-2xl text-sm font-black uppercase tracking-widest hover:shadow-[0_0_40px_rgba(46,196,182,0.5)] transition-all duration-500 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-[#0A0F14] border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {isLoggingIn ? 'Connecting...' : 'Enter Platform'}
              {!isLoggingIn && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
            
            <a 
              href="https://drive.google.com/file/d/1kDimAeIIzDeNPTm3cP1Ay8On-QgPDGjt/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 bg-transparent border border-[#1F2937] text-[#9CA3AF] rounded-2xl text-sm font-black uppercase tracking-widest hover:text-white hover:border-[#2EC4B6]/50 transition-all duration-300 inline-block text-center"
            >
              Research Documentation
            </a>
          </motion.div>
        </div>

        {/* Feature Highlights (Subtle) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-0 right-0 flex justify-center gap-12 px-6 overflow-hidden hidden md:flex"
        >
          {[
            { icon: GlobeIcon, text: "Global Analysis" },
            { icon: Shield, text: "Risk Mitigation" },
            { icon: Activity, text: "Real-time Metrics" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity cursor-default">
              <item.icon className="w-4 h-4 text-[#2EC4B6]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative Geometric Overlays */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] border border-[#2EC4B6]/20 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] border border-[#A855F7]/10 rounded-full animate-[spin_80s_linear_infinite_reverse]" />
      </div>
    </div>
  );
};

export default LandingPage;
