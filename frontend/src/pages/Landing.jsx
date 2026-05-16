import { Link } from 'react-router-dom';
import { Shield, Map as MapIcon, Activity, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/common';

/**
 * Landing Page - Premium, tactical, government-tech grade.
 */
export default function Landing() {
  return (
    <div className="relative min-h-screen bg-tactical-bg overflow-hidden flex flex-col">
      {/* Fullscreen Video Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4" type="video/mp4" />
        </video>
        {/* 50% Black Overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full px-[120px] py-[20px] flex items-center justify-between transition-all duration-300">
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-tactical-primary rounded flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SafeCity</span>
        </div>

        {/* Center - Links (Hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-8">
          {['Get Started', 'Features', 'Live Risk Map', 'Resources'].map((item) => (
            <a 
              key={item} 
              href="#" 
              className="text-sm font-medium text-white hover:text-tactical-primary transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-tactical-primary transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-4">
          <Link to="/authority">
            <button className="px-5 py-2 rounded-full bg-tactical-card border border-tactical-border text-xs font-bold text-white uppercase tracking-wider hover:bg-tactical-bgSecondary transition-colors">
              Authority Login
            </button>
          </Link>
          <Link to="/citizen">
            <button className="px-5 py-2 rounded-full bg-tactical-primary text-xs font-bold text-white uppercase tracking-wider hover:bg-emerald-500 transition-colors">
              Citizen Access
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center px-[120px] gap-12 mt-12">
        {/* Left Side */}
        <div className="flex-1 max-w-2xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-tactical-primary/10 border border-tactical-primary/20">
            <span className="h-2 w-2 rounded-full bg-tactical-primary animate-pulse" />
            <span className="text-[10px] font-bold text-tactical-primary uppercase tracking-widest">Live System Operational</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            AI-Powered Urban Safety <br />
            <span className="text-tactical-primary">Intelligence Platform</span>
          </h1>
          
          <p className="text-lg text-tactical-textSecondary max-w-xl leading-relaxed">
            Real-time risk mapping, emergency coordination, civic intelligence, and predictive safety analytics for smarter cities.
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <Link to="/authority">
              <Button size="lg" icon={Activity}>Launch Dashboard</Button>
            </Link>
            <Link to="/citizen/map">
              <Button variant="secondary" size="lg" icon={MapIcon}>Explore Live Map</Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10 mt-8">
            <div>
              <p className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-wider">Active Incidents</p>
              <p className="text-2xl font-bold text-tactical-red mt-1">24</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-wider">High Risk Zones</p>
              <p className="text-2xl font-bold text-tactical-amber mt-1">08</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-wider">Emergency Units</p>
              <p className="text-2xl font-bold text-tactical-blue mt-1">12</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-wider">Open Complaints</p>
              <p className="text-2xl font-bold text-white mt-1">156</p>
            </div>
          </div>
        </div>

        {/* Right Side - Tactical Preview */}
        <div className="flex-1 w-full max-w-lg relative perspective-1000">
          <div className="bg-tactical-card/90 backdrop-blur-sm border border-tactical-border rounded-lg shadow-tactical-lg overflow-hidden transform rotate-y-[-5deg] rotate-x-[5deg]">
            {/* Fake UI Header */}
            <div className="px-4 py-3 border-b border-tactical-border flex items-center justify-between bg-tactical-bgSecondary">
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-tactical-red" />
                <div className="h-2 w-2 rounded-full bg-tactical-amber" />
                <div className="h-2 w-2 rounded-full bg-tactical-primary" />
              </div>
              <span className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-widest">Tactical Overview</span>
            </div>
            {/* Fake Map Area */}
            <div className="relative h-80 bg-[#1e293b]">
              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBWMGgtLjV2NDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
              
              {/* Elements */}
              <div className="absolute top-1/4 left-1/4 h-24 w-24 bg-tactical-red/20 rounded-full border border-tactical-red/50 animate-pulse" />
              <div className="absolute bottom-1/3 right-1/4 h-16 w-16 bg-tactical-amber/20 rounded-full border border-tactical-amber/50" />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-tactical-bg px-3 py-2 border border-tactical-border rounded shadow-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-tactical-red" />
                <div className="text-left">
                  <p className="text-[10px] font-bold text-white uppercase">Critical Alert</p>
                  <p className="text-[9px] text-tactical-textSecondary">Zone Sector 4</p>
                </div>
              </div>
            </div>
            {/* Fake Analytics Footer */}
            <div className="p-4 grid grid-cols-3 gap-2 bg-tactical-bgSecondary">
              <div className="h-10 bg-tactical-bg rounded border border-tactical-border" />
              <div className="h-10 bg-tactical-bg rounded border border-tactical-border" />
              <div className="h-10 bg-tactical-bg rounded border border-tactical-border" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
