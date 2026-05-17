import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, User, Activity, AlertTriangle, Building, CheckCircle2, ChevronRight, Server, ShieldCheck, Cpu } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

// Local helper for fluctuating ping
const FluctuatingPing = () => {
  const [ping, setPing] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setPing(prev => {
        const fluctuate = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
        let newPing = prev + fluctuate;
        if (newPing < 10) newPing = 10;
        if (newPing > 16) newPing = 16;
        return newPing;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-[10px] font-mono text-slate-300 tracking-wider">SYSTEM: ACTIVE [PING: {ping}ms]</span>;
};

export default function AuthorityLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Required fields are missing.');
      return;
    }

    setIsLoggingIn(true);

    setTimeout(() => {
      if (email === 'admin@safecity.gov.in' && password === 'SafeCity@2026') {
        setSuccess(true);
        setTimeout(() => {
          login({ uid: 'admin_001', email, name: 'Command Center Admin' }, 'authority', 'mock-jwt-token');
          localStorage.setItem('safecity_user', JSON.stringify({ uid: 'admin_001', email, name: 'Command Center Admin' }));
          localStorage.setItem('safecity_role', 'authority');
          navigate('/authority');
        }, 1200);
      } else {
        setError('Authentication failed. Invalid credentials.');
        setIsLoggingIn(false);
      }
    }, 1200);
  };

  useEffect(() => {
    const role = useAuthStore.getState().userRole;
    if (role === 'authority') {
      navigate('/authority');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#081120] flex font-inter text-slate-200 selection:bg-green-500/30 overflow-hidden relative">
      
      {/* GLOBAL BACKGROUND - Cinematic & Premium */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#020617]">
        {/* Slow Zooming Cinematic Video */}
        <motion.video 
          autoPlay 
          muted 
          loop 
          playsInline 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1.15 }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(1.1) contrast(1.08) saturate(1.05)' }}
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4" type="video/mp4" />
        </motion.video>
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/90 via-[#020617]/45 to-[#020617]/90" />
        
        {/* Subtle Edge Blur for Depth */}
        <div className="absolute inset-0 backdrop-blur-[1px] bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(2,6,23,0.4)_100%)]" />
        
        {/* Slow Atmospheric Fog Movement */}
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.05),_transparent_50%)]"
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Enterprise Grid Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* LEFT SIDE: Real Urban Operations Visualization */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 z-10 border-r border-slate-800/40 bg-gradient-to-r from-[#020617]/80 to-transparent">
        
        {/* Top Header - Official Branding */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-900 border border-slate-700 rounded-md flex items-center justify-center shadow-sm">
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white leading-none">SafeCity</h1>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Operations Command</p>
            </div>
          </div>
          
          <div className="mt-12 max-w-md">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-3xl font-semibold text-white leading-snug mb-4"
            >
              Urban Intelligence &<br/>Emergency Response
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="text-sm text-slate-400 leading-relaxed"
            >
              Authorized access portal for municipal administration and law enforcement. This system actively monitors civic infrastructure and emergency dispatch telemetry.
            </motion.p>
          </div>
        </div>

        {/* Center - Immersive Operational Map Simulation */}
        <div className="flex-1 mt-10 relative flex flex-col items-center justify-center overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="w-full h-full border border-slate-800/60 rounded-xl bg-[#0A1324]/60 backdrop-blur-md relative overflow-hidden shadow-2xl"
          >
            
            {/* Live Radar Sweep */}
            <motion.div 
              className="absolute inset-0 opacity-10 mix-blend-screen origin-center"
              style={{ background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(59,130,246,0.4) 360deg)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            {/* Faint Horizontal Scanlines */}
            <motion.div 
              className="absolute inset-0 w-full h-[150%] bg-[linear-gradient(transparent_0%,_rgba(59,130,246,0.03)_50%,_transparent_100%)]"
              animate={{ y: ["-50%", "0%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:30px_30px]" />

            {/* Subtle Parallax Layer */}
            <motion.div 
              className="absolute inset-0 w-full h-full"
              animate={{ x: [-5, 5, -5], y: [-2, 2, -2] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                {/* Static Roads / City Paths */}
                <path d="M-100 50 Q 150 -50, 400 150 T 800 100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                <path d="M100 0 L 250 300 L 550 500" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                <path d="M600 -50 L 500 250 L 800 450" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                
                {/* Animated Telemetry Path 1 - Data transfer */}
                <motion.path 
                  d="M-100 50 Q 150 -50, 400 150 T 800 100" 
                  fill="none" 
                  stroke="rgba(59,130,246,0.5)" 
                  strokeWidth="2"
                  initial={{ strokeDasharray: "0 1500", strokeDashoffset: 0 }}
                  animate={{ strokeDasharray: "150 1500", strokeDashoffset: -1200 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Animated Telemetry Path 2 - Patrol routing */}
                <motion.path 
                  d="M100 0 L 250 300 L 550 500" 
                  fill="none" 
                  stroke="rgba(34,197,94,0.4)" 
                  strokeWidth="1.5"
                  initial={{ strokeDasharray: "0 1000", strokeDashoffset: 0 }}
                  animate={{ strokeDasharray: "80 1000", strokeDashoffset: -800 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 2 }}
                />

                {/* Animated Telemetry Path 3 - Secondary Data */}
                <motion.path 
                  d="M600 -50 L 500 250 L 800 450" 
                  fill="none" 
                  stroke="rgba(245,158,11,0.3)" 
                  strokeWidth="1"
                  initial={{ strokeDasharray: "0 800", strokeDashoffset: 0 }}
                  animate={{ strokeDasharray: "40 800", strokeDashoffset: -600 }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 1 }}
                />
              </svg>

              {/* Central Primary Hub Incident Pulse */}
              <div className="absolute top-[40%] left-[55%] flex items-center justify-center">
                <motion.div 
                  className="absolute w-24 h-24 rounded-full border border-red-500/10"
                  animate={{ scale: [0.2, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div 
                  className="absolute w-16 h-16 rounded-full border border-red-500/20"
                  animate={{ scale: [0.2, 1.2], opacity: [0.7, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
                />
                <div className="w-8 h-8 rounded-full bg-red-500/5 flex items-center justify-center backdrop-blur-[1px]">
                   <motion.div 
                     className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]"
                     animate={{ opacity: [0.3, 1, 0.3] }}
                     transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   />
                </div>
              </div>
              
              {/* Secondary Unit Pulse */}
              <div className="absolute top-[65%] left-[30%] flex items-center justify-center">
                <motion.div 
                  className="absolute w-16 h-16 rounded-full border border-amber-500/10"
                  animate={{ scale: [0.4, 1.4], opacity: [0.4, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeOut", delay: 1.5 }}
                />
                <div className="w-6 h-6 rounded-full bg-amber-500/5 flex items-center justify-center backdrop-blur-[1px]">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                </div>
              </div>

              {/* Secure Node Indicator */}
              <div className="absolute top-[20%] left-[20%] flex items-center justify-center">
                <motion.div 
                  className="absolute w-12 h-12 rounded-full border border-blue-500/10"
                  animate={{ scale: [0.5, 1.2], opacity: [0.3, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeOut", delay: 3 }}
                />
                <div className="w-1 h-1 rounded-full bg-blue-500/60" />
              </div>
            </motion.div>

            {/* Bottom Terminal Status Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
              <div className="bg-[#060D18]/90 border border-slate-800/80 px-4 py-2.5 rounded-md flex items-center gap-3 backdrop-blur-xl shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent" />
                <motion.div 
                  className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Secure Link Established</span>
                  <FluctuatingPing />
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-500 tracking-wider">LAT: 18.5204° N</div>
                <div className="text-[10px] font-mono text-slate-500 tracking-wider">LNG: 73.8567° E</div>
              </div>
            </div>
            
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Enterprise Secure Login Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px]"
        >
          {/* Security Banner */}
          <div className="flex items-center justify-center gap-2 mb-8 text-green-500">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest">Government Authorized Access</span>
          </div>

          <div className="bg-[#0B1730] border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-800/60 bg-[#060D18]/50">
              <div className="flex items-center gap-3 mb-2">
                <Building className="h-6 w-6 text-slate-400" />
                <h2 className="text-xl font-semibold text-white">Authority Login</h2>
              </div>
              <p className="text-sm text-slate-500">Enter your official credentials to proceed.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="p-8 space-y-5 bg-[#0B1730]">
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Official Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoggingIn || success}
                    className="w-full bg-[#060D18] border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5 transition-colors placeholder-slate-600 disabled:opacity-50"
                    placeholder="name@safecity.gov.in"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Password</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoggingIn || success}
                    className="w-full bg-[#060D18] border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block pl-10 pr-10 p-2.5 transition-colors placeholder-slate-600 disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoggingIn || success}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Status/Error Messages */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-start gap-2"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300 leading-relaxed">{error}</p>
                  </motion.div>
                )}
                
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-green-500/10 border border-green-500/20 rounded-md p-3 flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                    <p className="text-xs text-green-300 font-medium">Identity verified. Initiating secure session...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn || success}
                className={`w-full flex items-center justify-center gap-2 text-sm font-semibold rounded-lg p-2.5 transition-all duration-200 ${
                  success 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-slate-900 hover:bg-slate-200 shadow-sm disabled:opacity-70 disabled:hover:bg-white'
                }`}
              >
                {isLoggingIn && !success ? (
                   <span className="flex items-center gap-2"><Cpu className="h-4 w-4 animate-spin text-slate-500" /> Authenticating</span>
                ) : success ? (
                   "Access Granted"
                ) : (
                   <span className="flex items-center justify-center w-full">Sign In <ChevronRight className="h-4 w-4 ml-1 opacity-50" /></span>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-6 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Server className="h-3.5 w-3.5" /> Node: PUNE-01</span>
              <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> 256-Bit TLS</span>
            </div>
            <p className="text-[10px] text-slate-600">Unauthorized access is strictly prohibited and logged.</p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

