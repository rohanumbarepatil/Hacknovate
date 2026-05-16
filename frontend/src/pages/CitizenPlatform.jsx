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
          {/* Tactical Overlay - Minimal, dark, professional */}
          <div className="absolute inset-0 bg-[#020617]/85" />
          {/* Soft gradient for cinematic blend */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]/90 opacity-90" />
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
            
            {/* 1. SOS Emergency Control (Clean Microsoft Style) */}
            <div className="bg-[#0f172a]/80 backdrop-blur-md border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center relative shadow-lg">
              <h3 className="text-xs font-medium text-gray-400 mb-6 uppercase tracking-wider w-full text-center">Emergency Access</h3>
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                {/* Clean realistic pulse */}
                <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
                <div className="absolute inset-4 rounded-full bg-red-500/20" />
                <a href="#report" className="relative w-20 h-20 bg-red-600 border border-red-500 shadow-xl rounded-full flex items-center justify-center text-2xl font-bold text-white hover:bg-red-500 transition-colors z-10 cursor-pointer">
                  SOS
                </a>
              </div>
              <p className="text-gray-300 text-sm font-medium text-center">
                Press to report an immediate emergency
              </p>
            </div>

            {/* 2. Real-time Metrics (Replacing fake line chart with operational metrics) */}
            <div className="bg-[#0f172a]/80 backdrop-blur-md border border-white/5 rounded-xl p-5 flex-1 flex flex-col">
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

            {/* ACTUAL LIVE MAP PREVIEW */}
            <div className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl relative overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
              
              {/* MapContainer renders the real Google Maps canvas */}
              <div className="absolute inset-0 z-0">
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
                {/* Very subtle vignette to blend the map into the dark theme without obscuring it */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_70%,#0f172a_100%)] opacity-30" />
              </div>

              {/* Map UI Overlay (Top) - Enterprise Style */}
              <div className="relative z-10 p-4 flex flex-col sm:flex-row justify-between items-start pointer-events-none gap-4">
                
                {/* Search Bar (Google/ArcGIS Style) */}
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2.5 w-full max-w-sm shadow-md pointer-events-auto transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <Search className="h-4 w-4 text-gray-500" />
                  <input type="text" placeholder="Search location, ward, or incident..." className="bg-transparent border-none text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none w-full" />
                </div>
                
                {/* Layer Toggle (Microsoft Fluent Style) */}
                <div className="flex bg-[#1e293b]/90 backdrop-blur-md p-1 rounded-lg border border-white/10 shadow-lg pointer-events-auto overflow-x-auto">
                   {LAYER_CONTROLS.map(layer => (
                      <button
                        key={layer.id}
                        onClick={() => setActiveLayer(layer.id)}
                        className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-medium transition-colors whitespace-nowrap ${
                          activeLayer === layer.id 
                            ? 'bg-blue-500 text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <layer.icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{layer.label}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Bottom Map Legend (Clean & Minimal) */}
              <div className="relative z-10 mt-auto p-3 px-5 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
                    <span className="font-semibold text-white mr-2 border-r border-gray-600 pr-4">{LAYER_CONTROLS.find(l => l.id === activeLayer)?.label}</span>
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500 shadow-sm" /> Critical</div>
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500 shadow-sm" /> Warning</div>
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" /> Safe</div>
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                   <Clock className="h-3 w-3" /> Live Data Sync
                 </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Enterprise Analytics */}
          <div className="w-full xl:w-80 flex flex-col gap-4 shrink-0 mt-8 xl:mt-14">
            
            {/* Datadog style summary header */}
            <div className="bg-[#0f172a]/80 backdrop-blur-md border border-white/5 rounded-xl p-5 shadow-lg">
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
                <div key={i} className="bg-[#0f172a]/80 backdrop-blur-md border border-white/5 rounded-xl p-4 flex flex-col gap-3 hover:bg-white/5 transition-colors group cursor-default shadow-sm">
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
