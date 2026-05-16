import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Map as MapIcon, Activity, AlertTriangle, ChevronDown, Bell, Navigation, Search, CheckCircle2, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Common Components
import { Button, Card, Badge } from '@/components/common';

// Maps
import MapContainer from '@/maps/MapContainer';
import IncidentPinLayer from '@/maps/layers/IncidentPinLayer';
import UnsafeRoadLayer from '@/maps/layers/UnsafeRoadLayer';
import AccidentZoneLayer from '@/maps/layers/AccidentZoneLayer';
import EmergencyVehicleLayer from '@/maps/layers/EmergencyVehicleLayer';
import RiskZoneLayer from '@/maps/layers/RiskZoneLayer';

// Citizen Modules
import SOSButton from '@/components/citizen/SOSButton';
import ComplaintForm from '@/components/citizen/ComplaintForm';

// Stores
import useMapStore from '@/store/useMapStore';
import useStore from '@/store/useStore';
import { MAP_LAYERS } from '@/constants/mapConfig';

export default function CitizenPlatform() {
  const [activeLayer, setActiveLayer] = useState(MAP_LAYERS.INCIDENT_PINS);
  const { incidents, sosEvents, vehicles } = useStore();

  // Exclusive Layer Controls
  const LAYER_CONTROLS = [
    { id: MAP_LAYERS.INCIDENT_PINS, label: 'Live Incidents', icon: AlertTriangle },
    { id: MAP_LAYERS.ACCIDENT_ZONES, label: 'Accident Zones', icon: Activity },
    { id: MAP_LAYERS.UNSAFE_ROADS, label: 'Unsafe Roads', icon: MapIcon },
    { id: MAP_LAYERS.EMERGENCY_VEHICLES, label: 'Emergency Units', icon: Shield },
    { id: MAP_LAYERS.RISK_ZONES, label: 'AI Risk Zones', icon: Activity },
  ];

  return (
    <div className="relative min-h-screen bg-[#020617] overflow-x-hidden flex flex-col font-general-sans text-white scroll-smooth">
      
      {/* 1. ENTERPRISE INTELLIGENCE HERO SECTION */}
      <section id="hero" className="relative min-h-screen flex flex-col pb-10">
        {/* Fullscreen Video Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4" type="video/mp4" />
          </video>
          {/* Tactical Overlay - Transparent enough to see the video clearly */}
          <div className="absolute inset-0 bg-[#020617]/40" />
          {/* Soft gradient for cinematic blend without hiding the center */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/70 via-transparent to-[#020617]/95" />
        </div>

        {/* Enterprise Navbar */}
        <nav className="relative z-50 w-full px-6 lg:px-8 py-3 flex items-center justify-between border-b border-white/5 bg-[#020617]/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white/5 rounded-md flex items-center justify-center border border-white/10">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white tracking-wide">SafeCity Intelligence</span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#hero" className="text-xs font-medium text-white hover:text-gray-300 transition-colors">Overview</a>
            <a href="#report" className="text-xs font-medium text-gray-400 hover:text-white transition-colors">Report Issue</a>
            <a href="#analytics" className="text-xs font-medium text-gray-400 hover:text-white transition-colors">Analytics</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/authority">
              <button className="px-4 py-1.5 rounded-md bg-white text-black text-xs font-semibold hover:bg-gray-200 transition-colors shadow-sm">
                Authority Login
              </button>
            </Link>
          </div>
        </nav>

        {/* 3-Column Enterprise Intelligence Layout */}
        <div className="relative z-10 flex-1 flex flex-col xl:flex-row px-4 lg:px-8 py-6 gap-6 mt-2 max-w-[1920px] mx-auto w-full h-full">
          
          {/* LEFT PANEL - Operational Controls */}
          <div className="w-full xl:w-80 flex flex-col gap-4 shrink-0">
            
            {/* 1. SOS Emergency System (Tactical Radar Style) */}
            <div className="bg-[#0b1120] border border-[#1e293b] rounded-sm p-6 flex flex-col items-center justify-center relative overflow-hidden group shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]">
              {/* Subtle background radar grid */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <h3 className="text-[10px] font-bold text-gray-500 mb-6 uppercase tracking-[0.2em] w-full text-center z-10 flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-gray-700" />
                Emergency System
                <span className="h-px w-8 bg-gray-700" />
              </h3>
              
              <div className="relative w-44 h-44 flex items-center justify-center mb-6 z-10">
                {/* Radar Crosshairs */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-red-500 -translate-x-1/2" />
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-red-500 -translate-y-1/2" />
                </div>

                {/* Rotating Outer Tactical Rings */}
                <motion.svg 
                  className="absolute inset-0 w-full h-full text-red-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  viewBox="0 0 100 100"
                >
                  {/* Outer thin dashed ring */}
                  <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" className="opacity-40" />
                  
                  {/* Main thick segmented ring (matches image style) */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="43" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3.5" 
                    strokeDasharray="125 10" 
                    strokeLinecap="round"
                    className="opacity-90 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" 
                  />
                  
                  {/* Inner technical thin ring */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.75" className="opacity-30" />
                  
                  {/* Precision markers */}
                  <path d="M 50 2 L 50 8 M 50 92 L 50 98 M 2 50 L 8 50 M 92 50 L 98 50" stroke="currentColor" strokeWidth="1.5" className="opacity-60" />
                </motion.svg>

                {/* Middle Pulse Ring */}
                <div className="absolute inset-4 rounded-full border border-red-500/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />

                {/* Core Button Base */}
                <div className="absolute inset-6 rounded-full border border-red-500/30 bg-[#060b14] flex items-center justify-center shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]">
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl" />
                </div>

                {/* Core Interactive SOS Button */}
                <a 
                  href="#report" 
                  className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-[#991b1b] border border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.3)] rounded-full flex flex-col items-center justify-center text-white hover:scale-95 hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-all duration-300 z-20 cursor-pointer active:scale-90 group/btn"
                >
                  <span className="text-3xl font-bold tracking-widest drop-shadow-md">SOS</span>
                  <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300" />
                </a>
              </div>

              <div className="flex flex-col items-center gap-1.5 z-10">
                <p className="text-red-400 text-[12px] font-bold uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">
                  Emergency Alert
                </p>
                <div className="flex items-center gap-2 opacity-70 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-sm">
                   <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,1)]" />
                   <p className="text-[9px] font-mono text-red-300 uppercase tracking-widest">AI Network Online</p>
                </div>
              </div>
            </div>

            {/* 2. Real-time Metrics */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-sm p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">City Status</h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase">Operational</span>
                </div>
              </div>
              
              <div className="space-y-4 mt-2">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Active Patrols</p>
                  <p className="text-2xl font-semibold text-white">42 <span className="text-sm font-normal text-gray-500">units</span></p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Current Threat Level</p>
                  <p className="text-lg font-medium text-blue-400">Low (Routine)</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Last Update</p>
                  <p className="text-sm font-mono text-gray-300">Just now</p>
                </div>
              </div>
            </div>
            
          </div>

          {/* CENTER PANEL - The Core Live Map Experience */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Minimal Header */}
            <div className="flex items-end justify-between mb-4 mt-2 px-2">
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Urban Intelligence Map</h1>
                <p className="text-sm text-gray-400 mt-1">Live situational awareness and incident tracking powered by Google Maps.</p>
              </div>
            </div>

            {/* INTEGRATED GIS COMMAND INTERFACE */}
            <div className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-sm relative overflow-hidden flex flex-col h-[600px] min-h-[600px]">
              
              {/* Top Command Toolbar */}
              <div className="bg-[#0b1120] border-b border-[#1e293b] p-2 flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e293b]/50 border border-[#1e293b] rounded-sm w-[300px] focus-within:border-blue-500/50 transition-colors">
                  <Search className="h-3.5 w-3.5 text-gray-400" />
                  <input type="text" placeholder="Search location, wards, hospitals..." className="bg-transparent border-none text-[13px] text-white w-full focus:outline-none placeholder:text-gray-500" />
                </div>
                <div className="h-4 w-px bg-[#1e293b] hidden sm:block" />
                <button className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-sm text-xs font-semibold items-center gap-1.5 transition-colors">
                  <Navigation className="h-3.5 w-3.5" /> Locate
                </button>
                <div className="flex-1" />
                <div className="flex items-center gap-2 px-3">
                   <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono"><Clock className="h-3.5 w-3.5" /> LIVE SYNC</div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex overflow-hidden">
                
                {/* Left GIS Sidebar */}
                <div className="w-[220px] bg-[#0b1120] border-r border-[#1e293b] flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)] shrink-0 hidden md:flex">
                  <div className="p-3 border-b border-[#1e293b] flex items-center justify-between">
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Map Layers</p>
                     <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
                    {LAYER_CONTROLS.map(layer => {
                      const isActive = activeLayer === layer.id;
                      return (
                        <button
                          key={layer.id}
                          onClick={() => setActiveLayer(layer.id)}
                          className={`px-3 py-2.5 rounded-sm flex items-center gap-3 text-[12px] font-medium transition-colors ${
                            isActive
                              ? 'bg-[#1e293b] text-blue-400 border-l-2 border-blue-500'
                              : 'text-gray-400 hover:bg-[#1e293b]/50 border-l-2 border-transparent hover:text-gray-200'
                          }`}
                        >
                          <layer.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                          <span className="truncate">{layer.label}</span>
                          {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative bg-[#060b14]">
                  <MapContainer mode="tactical">
                    {(map) => (
                      <>
                        {activeLayer === MAP_LAYERS.INCIDENT_PINS && <IncidentPinLayer map={map} />}
                        {activeLayer === MAP_LAYERS.ACCIDENT_ZONES && <AccidentZoneLayer map={map} />}
                        {activeLayer === MAP_LAYERS.UNSAFE_ROADS && <UnsafeRoadLayer map={map} />}
                        {activeLayer === MAP_LAYERS.EMERGENCY_VEHICLES && <EmergencyVehicleLayer map={map} />}
                        {activeLayer === MAP_LAYERS.RISK_ZONES && <RiskZoneLayer map={map} />}
                      </>
                    )}
                  </MapContainer>
                  {/* Subtle inner shadow for edge blending only */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(2,6,23,0.6)]" />
                </div>
              </div>

              {/* Bottom Legend */}
              <div className="bg-[#0b1120] border-t border-[#1e293b] p-2 px-4 flex flex-wrap items-center gap-6 text-[11px] font-medium text-gray-400 z-10">
                 <span className="text-white font-semibold">{LAYER_CONTROLS.find(l => l.id === activeLayer)?.label}</span>
                 <div className="h-3 w-px bg-[#1e293b] hidden sm:block" />
                 <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-red-500" /> Critical</div>
                 <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-amber-500" /> Warning</div>
                 <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> Safe</div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Enterprise Analytics */}
          <div className="w-full xl:w-80 flex flex-col gap-4 shrink-0 mt-8 xl:mt-14">
            
            {/* Datadog style summary header */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-sm p-5">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Platform Overview</h3>
              <p className="text-sm text-gray-300">Aggregated safety metrics across all active city zones over the last 24 hours.</p>
            </div>

            {/* Stacked Analytics Cards (Minimalist Datadog/Microsoft Style) */}
            <div className="flex-1 flex flex-col gap-3">
              {[
                { label: 'Total Incidents', value: '1,245', trend: '+12%', color: 'text-red-400', icon: AlertTriangle },
                { label: 'Citizen Complaints', value: '3,456', trend: '+8%', color: 'text-blue-400', icon: Activity },
                { label: 'Accidents Logged', value: '234', trend: '-4%', color: 'text-amber-400', icon: MapIcon },
                { label: 'Active Alerts', value: '89', trend: '+5%', color: 'text-emerald-400', icon: Bell },
              ].map((stat, i) => (
                <div key={i} className="bg-[#0f172a] border border-[#1e293b] rounded-sm p-4 flex flex-col gap-3 hover:bg-[#1e293b]/30 transition-colors group cursor-default">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <stat.icon className={`h-4 w-4 ${stat.color} opacity-80`} />
                      <p className="text-xs font-medium text-gray-400">{stat.label}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/5 ${stat.trend.startsWith('+') ? 'text-red-400' : 'text-emerald-400'}`}>
                      {stat.trend.startsWith('+') ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stat.trend.substring(1)}
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-semibold text-white tracking-tight">{stat.value}</p>
                    {/* Tiny inline sparkline placeholder */}
                    <div className="w-16 h-4 opacity-30 group-hover:opacity-60 transition-opacity">
                      <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                        <path d={`M 0 15 Q 25 5 50 ${10 + i * 2} T 100 5`} fill="none" stroke="currentColor" strokeWidth="2" className={stat.color} />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. REPORTING & EMERGENCY SECTION */}
      <section id="report" className="py-24 px-6 lg:px-[120px] bg-[#020617] relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left - Report Form */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">Report Civic Issue</h2>
              <p className="text-gray-400 text-sm">Your reports update the live city map instantly.</p>
            </div>
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-xl">
              <ComplaintForm />
            </div>
          </div>

          {/* Right - Emergency Access */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-red-500 tracking-tight mb-2 flex items-center gap-3">
                <AlertTriangle className="h-7 w-7" /> Emergency Access
              </h2>
              <p className="text-gray-400 text-sm">Immediate crisis response and routing.</p>
            </div>
            
            {/* Quick Dial Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <a href="tel:100" className="block bg-red-500/10 border border-red-500/20 rounded-xl p-6 hover:bg-red-500/20 transition-colors group cursor-pointer">
                <h3 className="text-3xl font-bold text-red-500 mb-1 group-hover:scale-105 transition-transform origin-left">100</h3>
                <p className="text-xs font-semibold text-red-400 uppercase tracking-widest">Police Control</p>
              </a>
              <a href="tel:108" className="block bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 hover:bg-amber-500/20 transition-colors group cursor-pointer">
                <h3 className="text-3xl font-bold text-amber-500 mb-1 group-hover:scale-105 transition-transform origin-left">108</h3>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Medical Emergency</p>
              </a>
            </div>

            <Card className="bg-[#0f172a] border-white/10">
              <Card.Header>
                <Card.Title className="text-sm font-semibold">Nearest Help Stations (Auto-detected)</Card.Title>
              </Card.Header>
              <div className="p-4 space-y-3">
                {[
                  { name: 'City Hospital (Trauma Center)', dist: '1.2 km', time: '5 mins' },
                  { name: 'Central Police Station', dist: '2.4 km', time: '8 mins' },
                ].map((station, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-[#1e293b] border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white mb-0.5">{station.name}</p>
                      <p className="text-xs text-gray-400">{station.dist} away</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-400 mb-0.5">{station.time}</p>
                      <button className="text-[10px] text-white font-semibold uppercase tracking-widest hover:text-blue-400 transition-colors">Route</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. SAFETY ANALYTICS SECTION */}
      <section id="analytics" className="py-24 px-6 lg:px-[120px] bg-[#0f172a] border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-3">Public Safety Analytics</h2>
            <p className="text-gray-400 text-sm">Transparent, government-grade operational data updated in real-time based on citizen reports and AI analysis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#1e293b] border-white/10 hover:border-blue-500/30 transition-colors">
              <div className="p-8">
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-6">Average Response Time</h3>
                <p className="text-6xl font-bold text-white mb-3 tracking-tight">8.4<span className="text-xl text-gray-500 ml-2 font-medium">min</span></p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase">↓ 12% faster than last month</span>
                </div>
              </div>
            </Card>
            
            <Card className="bg-[#1e293b] border-white/10 md:col-span-2">
              <div className="p-8 h-full flex flex-col justify-center">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Incident Density (Last 7 Days)</h3>
                  <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Live Updates
                  </span>
                </div>
                {/* Visual Placeholder for Recharts. Implemented cleanly with pure CSS to match aesthetics */}
                <div className="flex-1 flex items-end gap-3 h-40">
                  {[40, 25, 60, 30, 80, 45, 20].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#0f172a] border border-white/5 rounded-t relative group overflow-hidden h-full transition-all">
                      <div 
                        className="absolute bottom-0 w-full bg-blue-500/40 border-t border-blue-400 transition-all duration-500 group-hover:bg-blue-500/60" 
                        style={{ height: `${h}%` }} 
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-semibold uppercase tracking-widest">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-[120px] bg-[#020617] border-t border-white/5 text-center relative z-10">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">SafeCity Intelligent Urban Platform</p>
        <p className="text-[10px] text-gray-600">Built for strict public safety and tactical monitoring.</p>
      </footer>

      {/* Global SOS Button (Floating bottom right) */}
      <SOSButton />
    </div>
  );
}
