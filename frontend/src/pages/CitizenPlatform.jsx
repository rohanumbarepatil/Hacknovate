import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Map as MapIcon, Activity, AlertTriangle, ChevronDown, Bell, Navigation } from 'lucide-react';
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
    <div className="relative min-h-screen bg-tactical-bg overflow-x-hidden flex flex-col font-general-sans text-tactical-textPrimary scroll-smooth">
      
      {/* 1. HERO SECTION (Main Hook) */}
      <section id="hero" className="relative min-h-screen flex flex-col">
        {/* Fullscreen Video Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4" type="video/mp4" />
          </video>
          {/* Tactical Overlay */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Navbar - Sticky & ScrollSpy-ready */}
        <nav className="relative z-50 w-full px-6 lg:px-[120px] py-[20px] flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent fixed top-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-tactical-primary rounded flex items-center justify-center shadow-lg shadow-tactical-primary/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SafeCity</span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#hero" className="text-sm font-bold text-white hover:text-tactical-primary transition-colors">Home</a>
            <a href="#map" className="text-sm font-bold text-tactical-textSecondary hover:text-white transition-colors">Live Map</a>
            <a href="#report" className="text-sm font-bold text-tactical-textSecondary hover:text-white transition-colors">Report Issue</a>
            <a href="#analytics" className="text-sm font-bold text-tactical-textSecondary hover:text-white transition-colors">Analytics</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/authority">
              <button className="px-5 py-2 rounded-full bg-tactical-card border border-tactical-border text-xs font-bold text-white uppercase tracking-wider hover:bg-tactical-bgSecondary transition-colors">
                Authority Login
              </button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center px-6 lg:px-[120px] gap-12 mt-12 pb-24">
          {/* Left Side */}
          <div className="flex-1 max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-tactical-primary/10 border border-tactical-primary/20 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-tactical-primary animate-pulse" />
              <span className="text-[10px] font-bold text-tactical-primary uppercase tracking-widest">Public Safety System Online</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              City Intelligence <br />
              <span className="text-tactical-primary">For Everyone.</span>
            </h1>
            
            <p className="text-lg text-tactical-textSecondary max-w-xl leading-relaxed font-medium">
              Real-time risk mapping, emergency coordination, and civic intelligence. Your direct connection to Satara's safety network.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a href="#report" className="block">
                <Button size="lg" className="bg-tactical-red hover:bg-red-600 text-white border-transparent" icon={AlertTriangle}>
                  Report Emergency (SOS)
                </Button>
              </a>
              <a href="#map" className="block">
                <Button variant="secondary" size="lg" icon={MapIcon}>
                  Explore Live Map
                </Button>
              </a>
            </div>

            {/* Live Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10 mt-8">
              <div>
                <p className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-wider">Active Alerts</p>
                <p className="text-3xl font-bold text-tactical-amber mt-1 flex items-baseline gap-2">
                  12 <span className="text-xs text-tactical-textSecondary font-normal">Live</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-wider">Patrol Units</p>
                <p className="text-3xl font-bold text-tactical-blue mt-1 flex items-baseline gap-2">
                  8 <span className="text-xs text-tactical-textSecondary font-normal">Active</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-wider">Resolved Today</p>
                <p className="text-3xl font-bold text-white mt-1">145</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-wider">City Status</p>
                <p className="text-xl font-bold text-tactical-primary mt-2 uppercase tracking-widest">Secure</p>
              </div>
            </div>
          </div>

          {/* Right Side - Realtime Alerts Ticker */}
          <div className="flex-1 w-full max-w-lg lg:ml-auto">
            <div className="bg-tactical-card/70 backdrop-blur-xl border border-tactical-border rounded-2xl shadow-tactical-lg p-6 relative overflow-hidden">
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Bell className="h-4 w-4 text-tactical-primary" /> Live Dispatches
                  </h3>
                  <span className="flex items-center gap-2 text-[10px] text-tactical-primary font-bold uppercase tracking-widest">
                    <span className="h-1.5 w-1.5 rounded-full bg-tactical-primary animate-pulse" /> Syncing
                  </span>
                </div>
                
                <div className="space-y-4">
                  {[
                    { time: 'Just now', msg: 'Traffic cleared at Powai Naka.', type: 'info' },
                    { time: '2m ago', msg: 'Ambulance dispatched to NH4 Highway.', type: 'alert' },
                    { time: '15m ago', msg: 'Waterlogging reported in Sector 7.', type: 'warn' },
                  ].map((alert, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-tactical-bg border border-white/5 hover:bg-tactical-bgSecondary transition-colors">
                      <div className="mt-1">
                        {alert.type === 'alert' && <div className="h-2 w-2 rounded-full bg-tactical-red" />}
                        {alert.type === 'warn' && <div className="h-2 w-2 rounded-full bg-tactical-amber" />}
                        {alert.type === 'info' && <div className="h-2 w-2 rounded-full bg-tactical-blue" />}
                      </div>
                      <div>
                        <p className="text-xs text-tactical-textSecondary font-mono mb-1">{alert.time}</p>
                        <p className="text-sm font-medium text-white">{alert.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <a href="#map" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity animate-bounce cursor-pointer">
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Scroll to Map</span>
          <ChevronDown className="h-4 w-4 text-white" />
        </a>
      </section>

      {/* 2. LIVE SAFETY MAP SECTION (Exclusive Layers) */}
      <section id="map" className="py-24 px-6 lg:px-[120px] bg-tactical-bgSecondary border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Live Urban Safety Map</h2>
            <p className="text-tactical-textSecondary text-lg">Real-time geospatial intelligence. Select a layer to isolate data.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 h-[650px]">
            {/* Map Container */}
            <div className="flex-1 relative rounded-2xl overflow-hidden border border-tactical-border shadow-2xl bg-tactical-bg">
              
              {/* Tactical Exclusive Layer Menu (Floating inside map) */}
              <div className="absolute top-4 left-4 z-20 bg-tactical-card/95 backdrop-blur-md border border-tactical-border p-2 rounded-xl shadow-tactical-lg w-64">
                <div className="px-2 pb-2 mb-2 border-b border-white/10">
                  <span className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-widest">Intelligence Layer</span>
                </div>
                <div className="space-y-1">
                  {LAYER_CONTROLS.map(layer => (
                    <button
                      key={layer.id}
                      onClick={() => setActiveLayer(layer.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-lg transition-all ${
                        activeLayer === layer.id 
                          ? 'bg-tactical-primary/20 text-tactical-primary border border-tactical-primary/30 shadow-inner' 
                          : 'text-tactical-textSecondary hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      <layer.icon className="h-4 w-4 shrink-0" />
                      {layer.label}
                    </button>
                  ))}
                </div>
              </div>

              <MapContainer mode="tactical">
                {(map) => (
                  <>
                    {/* STRICT EXCLUSIVE OVERLAYS */}
                    {activeLayer === MAP_LAYERS.INCIDENT_PINS && <IncidentPinLayer map={map} />}
                    {activeLayer === MAP_LAYERS.ACCIDENT_ZONES && <AccidentZoneLayer map={map} />}
                    {activeLayer === MAP_LAYERS.UNSAFE_ROADS && <UnsafeRoadLayer map={map} />}
                    {activeLayer === MAP_LAYERS.EMERGENCY_VEHICLES && <EmergencyVehicleLayer map={map} />}
                    {activeLayer === MAP_LAYERS.RISK_ZONES && <RiskZoneLayer map={map} />}
                  </>
                )}
              </MapContainer>
            </div>

            {/* Right Map Insights */}
            <div className="w-full lg:w-[340px] flex flex-col gap-4">
              <Card className="flex-1 border-t-4 border-t-tactical-primary bg-tactical-card">
                <Card.Header>
                  <Card.Title>Layer Intelligence</Card.Title>
                </Card.Header>
                <div className="p-5 pt-0">
                  <p className="text-xl font-bold text-white mb-3">
                    {LAYER_CONTROLS.find(l => l.id === activeLayer)?.label || 'View'}
                  </p>
                  <p className="text-sm text-tactical-textSecondary leading-relaxed">
                    Showing isolated data for the selected tactical layer. Unrelated markers are automatically hidden to maintain operational focus. Data syncs continuously.
                  </p>
                </div>
              </Card>

              {/* Safe Route Hook */}
              <Card className="shrink-0 bg-tactical-card border border-tactical-border hover:border-tactical-primary/50 transition-colors">
                <div className="p-5">
                  <h4 className="text-xs font-bold text-tactical-textSecondary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-tactical-primary" /> Safe Navigation
                  </h4>
                  <p className="text-xs text-tactical-textSecondary mb-4">
                    AI computes routes avoiding high-risk zones and unsafe roads automatically.
                  </p>
                  <Button variant="secondary" className="w-full justify-center text-xs">
                    Plan Safe Route
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 3. REPORTING & EMERGENCY SECTION */}
      <section id="report" className="py-24 px-6 lg:px-[120px] bg-tactical-bg border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left - Report Form */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Report Civic Issue</h2>
              <p className="text-tactical-textSecondary text-lg">Your reports update the live city map instantly.</p>
            </div>
            <div className="bg-tactical-card border border-tactical-border rounded-2xl p-6 shadow-tactical-lg">
              <ComplaintForm />
            </div>
          </div>

          {/* Right - Emergency Access */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-tactical-red tracking-tight mb-2 flex items-center gap-3">
                <AlertTriangle className="h-8 w-8" /> Emergency Access
              </h2>
              <p className="text-tactical-textSecondary text-lg">Immediate crisis response and routing.</p>
            </div>
            
            {/* Quick Dial Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <a href="tel:100" className="block bg-tactical-red/10 border border-tactical-red/30 rounded-2xl p-6 hover:bg-tactical-red/20 transition-colors group cursor-pointer">
                <h3 className="text-3xl font-bold text-tactical-red mb-1 group-hover:scale-105 transition-transform origin-left">100</h3>
                <p className="text-xs font-bold text-tactical-red uppercase tracking-widest">Police Control</p>
              </a>
              <a href="tel:108" className="block bg-tactical-amber/10 border border-tactical-amber/30 rounded-2xl p-6 hover:bg-tactical-amber/20 transition-colors group cursor-pointer">
                <h3 className="text-3xl font-bold text-tactical-amber mb-1 group-hover:scale-105 transition-transform origin-left">108</h3>
                <p className="text-xs font-bold text-tactical-amber uppercase tracking-widest">Medical Emergency</p>
              </a>
            </div>

            <Card className="bg-tactical-card border-tactical-border">
              <Card.Header>
                <Card.Title>Nearest Help Stations (Auto-detected)</Card.Title>
              </Card.Header>
              <div className="p-4 space-y-3">
                {[
                  { name: 'City Hospital (Trauma Center)', dist: '1.2 km', time: '5 mins' },
                  { name: 'Central Police Station', dist: '2.4 km', time: '8 mins' },
                ].map((station, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-tactical-bg border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-white mb-1">{station.name}</p>
                      <p className="text-xs font-medium text-tactical-textSecondary">{station.dist} away</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-tactical-primary mb-1">{station.time}</p>
                      <button className="text-[10px] text-white font-bold uppercase tracking-widest hover:text-tactical-primary transition-colors">Route</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. SAFETY ANALYTICS SECTION */}
      <section id="analytics" className="py-24 px-6 lg:px-[120px] bg-tactical-bgSecondary border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Public Safety Analytics</h2>
            <p className="text-tactical-textSecondary text-lg">Transparent, government-grade operational data updated in real-time based on citizen reports and AI analysis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-tactical-card border-tactical-border hover:border-tactical-primary/30 transition-colors">
              <div className="p-8">
                <h3 className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-widest mb-6">Average Response Time</h3>
                <p className="text-6xl font-bold text-white mb-3">8.4<span className="text-xl text-tactical-textSecondary ml-2">min</span></p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">↓ 12% faster than last month</span>
                </div>
              </div>
            </Card>
            
            <Card className="bg-tactical-card border-tactical-border md:col-span-2">
              <div className="p-8 h-full flex flex-col justify-center">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-widest">Incident Density (Last 7 Days)</h3>
                  <span className="text-[10px] font-bold text-tactical-primary uppercase tracking-widest">Live Updates</span>
                </div>
                {/* Visual Placeholder for Recharts. Implemented cleanly with pure CSS to match aesthetics */}
                <div className="flex-1 flex items-end gap-3 h-40">
                  {[40, 25, 60, 30, 80, 45, 20].map((h, i) => (
                    <div key={i} className="flex-1 bg-tactical-bg border border-white/5 rounded-t-md relative group overflow-hidden h-full">
                      <div 
                        className="absolute bottom-0 w-full bg-tactical-primary/30 border-t border-tactical-primary transition-all duration-1000 group-hover:bg-tactical-primary/50" 
                        style={{ height: `${h}%` }} 
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] text-tactical-textSecondary font-bold uppercase tracking-widest">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-[120px] bg-tactical-bg border-t border-white/5 text-center">
        <p className="text-xs font-bold text-tactical-textSecondary uppercase tracking-widest mb-2">SafeCity Intelligent Urban Platform</p>
        <p className="text-[10px] text-tactical-textSecondary/50">Built for strict public safety and tactical monitoring.</p>
      </footer>

      {/* Global SOS Button (Floating bottom right) */}
      <SOSButton />
    </div>
  );
}
