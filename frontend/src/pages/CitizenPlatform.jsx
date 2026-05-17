import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Map as MapIcon, Activity, AlertTriangle, ChevronDown, Bell, Navigation, Search, CheckCircle2, TrendingUp, TrendingDown, Clock, BarChart3, ShieldAlert, Cpu, Zap, Radio, Loader2 } from 'lucide-react';
import { motion, animate, AnimatePresence } from 'framer-motion';

// --- ANIMATED METRIC COMPONENTS ---
const AnimatedCounter = ({ value }) => {
  const nodeRef = useRef(null);
  const prevValueRef = useRef(0);
  
  useEffect(() => {
    const isFloat = String(value).includes('.');
    const numericValue = isFloat ? parseFloat(String(value).replace(/,/g, '')) : parseInt(String(value).replace(/,/g, ''), 10);
    if (isNaN(numericValue)) return;
    
    const controls = animate(prevValueRef.current, numericValue, {
      duration: 1.2,
      ease: [0.32, 0.72, 0, 1],
      onUpdate(val) {
        if (nodeRef.current) {
          nodeRef.current.textContent = isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString();
        }
      },
      onComplete() {
        prevValueRef.current = numericValue;
      }
    });
    return () => controls.stop();
  }, [value]);

  return <span ref={nodeRef}>0</span>;
};

const getColorHex = (colorClass) => {
  if (colorClass.includes('red')) return '#ef4444';
  if (colorClass.includes('blue') && !colorClass.includes('cyan')) return '#3b82f6';
  if (colorClass.includes('amber') || colorClass.includes('orange')) return '#f59e0b';
  if (colorClass.includes('emerald') || colorClass.includes('green')) return '#10b981';
  if (colorClass.includes('purple')) return '#a855f7';
  if (colorClass.includes('cyan')) return '#06b6d4';
  return '#94a3b8';
};

// --- REALTIME DATA SYNC MAP ---
const LAYER_ANALYTICS = {
  [MAP_LAYERS.CRIME_HEATMAP]: {
    ringPercentage: 85,
    stats: [
      { label: 'Total Crimes', value: '432', trend: '+15%', color: 'text-purple-500', icon: AlertTriangle },
      { label: 'High Risk Zones', value: '12', trend: '+2%', color: 'text-red-500', icon: Activity },
      { label: 'Arrests Made', value: '89', trend: '-4%', color: 'text-emerald-500', icon: Shield },
      { label: 'Active Patrols', value: '34', trend: '+5%', color: 'text-blue-500', icon: Navigation },
    ]
  },
  [MAP_LAYERS.ACCIDENT_ZONES]: {
    ringPercentage: 62,
    stats: [
      { label: 'Total Accidents', value: '145', trend: '-8%', color: 'text-orange-500', icon: MapIcon },
      { label: 'Severe Crashes', value: '18', trend: '-12%', color: 'text-red-500', icon: AlertTriangle },
      { label: 'Safe Routes', value: '412', trend: '+14%', color: 'text-emerald-500', icon: Navigation },
      { label: 'Units Dispatched', value: '28', trend: '+2%', color: 'text-blue-500', icon: Activity },
    ]
  },
  [MAP_LAYERS.UNSAFE_ROADS]: {
    ringPercentage: 45,
    stats: [
      { label: 'Reported Roads', value: '56', trend: '+4%', color: 'text-amber-500', icon: MapIcon },
      { label: 'Poor Lighting', value: '23', trend: '+8%', color: 'text-orange-500', icon: AlertTriangle },
      { label: 'Repairs Active', value: '14', trend: '+22%', color: 'text-emerald-500', icon: Activity },
      { label: 'Citizen Warnings', value: '89', trend: '-2%', color: 'text-red-500', icon: Bell },
    ]
  },
  [MAP_LAYERS.EMERGENCY_VEHICLES]: {
    ringPercentage: 92,
    stats: [
      { label: 'Active Units', value: '112', trend: '+18%', color: 'text-blue-500', icon: Shield },
      { label: 'Avg Response', value: '6.4', trend: '-15%', color: 'text-emerald-500', icon: Clock },
      { label: 'Critical Dispatches', value: '24', trend: '+5%', color: 'text-red-500', icon: AlertTriangle },
      { label: 'Available Units', value: '38', trend: '-4%', color: 'text-cyan-500', icon: Navigation },
    ]
  },
  [MAP_LAYERS.INCIDENT_PINS]: {
    ringPercentage: 74,
    stats: [
      { label: 'Total Complaints', value: '1,245', trend: '+12%', color: 'text-orange-500', icon: Bell },
      { label: 'Resolved Today', value: '156', trend: '+24%', color: 'text-emerald-500', icon: CheckCircle2 },
      { label: 'Pending Critical', value: '42', trend: '-8%', color: 'text-red-500', icon: AlertTriangle },
      { label: 'Citizen Feedback', value: '892', trend: '+15%', color: 'text-blue-500', icon: Activity },
    ]
  },
  [MAP_LAYERS.RISK_ZONES]: {
    ringPercentage: 88,
    stats: [
      { label: 'Detected Threats', value: '14', trend: '+5%', color: 'text-red-500', icon: AlertTriangle },
      { label: 'AI Accuracy', value: '94', trend: '+2%', color: 'text-emerald-500', icon: CheckCircle2 },
      { label: 'Predicted Incidents', value: '38', trend: '-10%', color: 'text-amber-500', icon: Activity },
      { label: 'Prevented Crimes', value: '112', trend: '+18%', color: 'text-blue-500', icon: Shield },
    ]
  }
};

const LiveMetricCard = ({ stat, index }) => {
  const colorClass = stat.color;
  const bgSoftClass = colorClass.replace('text-', 'bg-').replace('-400', '-500/10').replace('-500', '-500/10');
  const borderSoftClass = colorClass.replace('text-', 'border-').replace('-400', '-500/20').replace('-500', '-500/20');
  const borderHoverClass = colorClass.replace('text-', 'border-').replace('-400', '-500/40').replace('-500', '-500/40');
  const fromGradientClass = colorClass.replace('text-', 'from-').replace('-400', '-500/10').replace('-500', '-500/10');
  const bgPulseClass = colorClass.replace('text-', 'bg-').replace('-400', '-500').replace('-500', '-500');
  
  return (
    <div className={`bg-[#0f172a] border border-[#1e293b] rounded-md p-4 relative overflow-hidden group hover:bg-[#1e293b]/40 hover:${borderHoverClass} transition-all duration-300`}>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          {/* Left Icon Block */}
          <div className={`w-11 h-11 rounded-md ${bgSoftClass} ${borderSoftClass} flex items-center justify-center relative overflow-hidden transition-colors duration-500`}>
            <motion.div key={stat.label} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
              <stat.icon className={`h-4 w-4 ${colorClass} relative z-10`} />
            </motion.div>
            <div className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t ${fromGradientClass} to-transparent transition-colors duration-500`} />
          </div>

          {/* Center Text */}
          <div className="flex flex-col">
            <div className="flex items-end gap-1.5">
              <span className="text-2xl font-bold text-white tracking-tight leading-none">
                <AnimatedCounter value={stat.value} />
              </span>
              <span className={`h-1.5 w-1.5 rounded-full mb-1 ${bgPulseClass} animate-pulse shadow-[0_0_8px_currentColor] transition-colors duration-500`} />
            </div>
            <motion.span 
              key={stat.label} 
              initial={{ opacity: 0, x: -5 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.4 }}
              className="text-[11px] font-medium text-gray-400 mt-1"
            >
              {stat.label}
            </motion.span>
          </div>
        </div>

        {/* Right Trend */}
        <div className="flex flex-col items-end">
          <motion.div 
            key={stat.trend}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-sm bg-white/5 transition-colors duration-500 ${stat.trend.startsWith('+') ? 'text-red-400' : 'text-emerald-400'}`}
          >
            {stat.trend.startsWith('+') ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {stat.trend.substring(1)}
          </motion.div>
        </div>
      </div>

      {/* Background Animated Sparkline */}
      <div className="absolute bottom-0 left-16 right-0 h-12 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-transparent to-[#0f172a] z-10" />
        
        <motion.svg
          className={`absolute w-[200%] h-full transition-colors duration-500 ${colorClass}`}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 15 + index * 2, repeat: Infinity, ease: "linear" }}
          preserveAspectRatio="none"
          viewBox="0 0 200 20"
        >
          <path
            d="M 0 10 Q 12.5 15 25 10 T 50 10 T 75 10 T 100 10 T 125 10 T 150 10 T 175 10 T 200 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </motion.svg>
      </div>
    </div>
  );
};

// --- CITY ACTIVITY RADAR (Tactical Piece) ---
const CityActivityRadar = ({ patrols = 42 }) => {
  // Generate random patrol nodes
  const nodes = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    x: 25 + Math.random() * 50,
    y: 25 + Math.random() * 50,
    size: 2 + Math.random() * 2
  }));

  return (
    <div className="relative w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center">
      {/* Radar Background Grid */}
      <div className="absolute inset-0 rounded-full border border-blue-500/10 bg-[#0f172a]/50 shadow-[inset_0_0_30px_rgba(59,130,246,0.05)]" />
      <div className="absolute inset-[25%] rounded-full border border-blue-500/10" />
      <div className="absolute inset-[50%] rounded-full border border-blue-500/10" />
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="w-full h-[1px] bg-blue-500" />
        <div className="h-full w-[1px] bg-blue-500 absolute" />
      </div>

      {/* Sweeping Line */}
      <motion.div 
        className="absolute w-1/2 h-[2px] bg-gradient-to-r from-transparent to-blue-400 origin-left left-1/2 top-1/2 z-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
      </motion.div>

      {/* Pulsing Patrol Nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping" />
        </motion.div>
      ))}

      {/* Center Asset */}
      <div className="relative z-20 h-3 w-3 bg-[#020617] border border-blue-500/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
        <div className="h-1 w-1 bg-blue-400 rounded-full" />
      </div>
    </div>
  );
};

// Common Components
import { Button, Card, Badge } from '@/components/common';

// Maps
import MapContainer from '@/maps/MapContainer';
import CrimeHeatmapLayer from '@/maps/layers/CrimeHeatmapLayer';
import IncidentPinLayer from '@/maps/layers/IncidentPinLayer';
import UnsafeRoadLayer from '@/maps/layers/UnsafeRoadLayer';
import AccidentZoneLayer from '@/maps/layers/AccidentZoneLayer';
import EmergencyVehicleLayer from '@/maps/layers/EmergencyVehicleLayer';
import RiskZoneLayer from '@/maps/layers/RiskZoneLayer';

// Citizen Modules
import ComplaintForm from '@/components/citizen/ComplaintForm';
import SOSEmergencyConsole from '@/components/sos/SOSEmergencyConsole';

// Stores
import useMapStore from '@/store/useMapStore';
import useStore from '@/store/useStore';
import { MAP_LAYERS } from '@/constants/mapConfig';

export default function CitizenPlatform() {
  const [activeLayer, setActiveLayer] = useState(MAP_LAYERS.CRIME_HEATMAP);
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { incidents, sosEvents, vehicles } = useStore();
  const [stats, setStats] = useState(null);
  const [feed, setFeed] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, feedRes, wardsRes] = await Promise.all([
          fetch('http://localhost:3001/api/analytics/stats').then(res => res.json()),
          fetch('http://localhost:3001/api/analytics/feed').then(res => res.json()),
          fetch('http://localhost:3001/api/analytics/zones').then(res => res.json())
        ]);
        
        if (statsRes.status === 'success') setStats(statsRes.data);
        if (feedRes.status === 'success') setFeed(feedRes.data);
        if (wardsRes.status === 'success') setWards(wardsRes.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentAnalytics = LAYER_ANALYTICS[activeLayer] || LAYER_ANALYTICS[MAP_LAYERS.CRIME_HEATMAP];
  const circumference = 276.46;
  
  // Real data mapping for wards chart
  const wardChartData = wards.length > 0 ? wards.map(w => ({
    label: w.name,
    val: Math.min(100, Math.max(10, (w.incident_count / Math.max(...wards.map(x => x.incident_count))) * 100)),
    active: false
  })) : [
    { label: "Shivajinagar", val: 85, active: true },
    { label: "Kothrud", val: 45, active: false },
    { label: "Hadapsar", val: 92, active: false },
    { label: "Baner", val: 30, active: false },
    { label: "Viman Nagar", val: 65, active: false },
    { label: "Kharadi", val: 55, active: false },
    { label: "Wakad", val: 20, active: false },
  ];

  // Real-data driven card mapping
  const displayStats = stats ? [
    { id: 1, title: activeLayer === MAP_LAYERS.CRIME_HEATMAP ? "Assault Density" : "Average Response Time", val: activeLayer === MAP_LAYERS.CRIME_HEATMAP ? stats.assaultDensity : 8.4, unit: activeLayer === MAP_LAYERS.CRIME_HEATMAP ? "rep/d" : "min", trend: "↓ 12%", color: "text-emerald-400", path: "M0 20 Q 25 15, 50 25 T 100 5" },
    { id: 2, title: activeLayer === MAP_LAYERS.ACCIDENT_ZONES ? "Accident Hotspots" : "Active Complaints", val: activeLayer === MAP_LAYERS.ACCIDENT_ZONES ? stats.accidentDensity / 10 : stats.activeComplaints, unit: activeLayer === MAP_LAYERS.ACCIDENT_ZONES ? "zones" : "open", trend: "↑ 5%", color: "text-red-400", path: "M0 5 Q 25 20, 50 10 T 100 25" },
    { id: 3, title: activeLayer === MAP_LAYERS.RISK_ZONES ? "AI Risk Confidence" : "High-Risk Wards", val: activeLayer === MAP_LAYERS.RISK_ZONES ? 94 : stats.highRiskWards, unit: activeLayer === MAP_LAYERS.RISK_ZONES ? "%" : "zones", trend: "Stable", color: "text-gray-400", path: "M0 15 Q 25 15, 50 15 T 100 15" },
    { id: 4, title: activeLayer === MAP_LAYERS.EMERGENCY_VEHICLES ? "Units Deployed" : "Emergency Dispatches", val: activeLayer === MAP_LAYERS.EMERGENCY_VEHICLES ? 89 : stats.emergencyDispatches, unit: "units", trend: "↑ 18%", color: "text-amber-400", path: "M0 25 Q 25 10, 50 5 T 100 0" },
    { id: 5, title: activeLayer === MAP_LAYERS.UNSAFE_ROADS ? "Pothole Density" : "Accident Density", val: activeLayer === MAP_LAYERS.UNSAFE_ROADS ? stats.unsafeRoadReports * 2 : stats.accidentDensity, unit: activeLayer === MAP_LAYERS.UNSAFE_ROADS ? "pts/km" : "rep/d", trend: "↓ 4%", color: "text-emerald-400", path: "M0 10 Q 25 25, 50 15 T 100 20" },
    { id: 6, title: "Unsafe Road Reports", val: stats.unsafeRoadReports, unit: "tickets", trend: "↑ 8%", color: "text-red-400", path: "M0 20 Q 25 5, 50 25 T 100 10" },
    { id: 7, title: "Night Risk Index", val: stats.nightRiskIndex, unit: "/ 10", trend: "High Alert", color: "text-red-500", path: "M0 25 Q 25 25, 50 10 T 100 5" },
    { id: 8, title: "Resolution Efficiency", val: stats.resolutionEfficiency, unit: "%", trend: "↑ 3%", color: "text-emerald-400", path: "M0 20 Q 25 25, 50 10 T 100 0" },
  ] : [
    // Fallback while loading
    { id: 1, title: "Response Time", val: 8.4, unit: "min", trend: "↓ 12%", color: "text-emerald-400", path: "M0 20 Q 25 15, 50 25 T 100 5" },
    { id: 2, title: "Active Complaints", val: 215, unit: "open", trend: "↑ 5%", color: "text-red-400", path: "M0 5 Q 25 20, 50 10 T 100 25" },
    { id: 3, title: "High-Risk Wards", val: 7, unit: "zones", trend: "Stable", color: "text-gray-400", path: "M0 15 Q 25 15, 50 15 T 100 15" },
    { id: 4, title: "Emergency Dispatches", val: 124, unit: "units", trend: "↑ 18%", color: "text-amber-400", path: "M0 25 Q 25 10, 50 5 T 100 0" },
    { id: 5, title: "Accident Density", val: 34, unit: "rep/d", trend: "↓ 4%", color: "text-emerald-400", path: "M0 10 Q 25 25, 50 15 T 100 20" },
    { id: 6, title: "Unsafe Road Reports", val: 56, unit: "tickets", trend: "↑ 8%", color: "text-red-400", path: "M0 20 Q 25 5, 50 25 T 100 10" },
    { id: 7, title: "Night Risk Index", val: 8.2, unit: "/ 10", trend: "High Alert", color: "text-red-500", path: "M0 25 Q 25 25, 50 10 T 100 5" },
    { id: 8, title: "Resolution Efficiency", val: 92, unit: "%", trend: "↑ 3%", color: "text-emerald-400", path: "M0 20 Q 25 25, 50 10 T 100 0" },
  ];
  
  // Calculate segments for the ring
  let currentOffset = 0;
  const gap = 8; // pixel gap between segments
  const ringSegments = currentAnalytics.stats.map((stat) => {
    const percent = Math.abs(parseInt(stat.trend, 10)) || 0;
    const length = (percent / 100) * circumference;
    const color = getColorHex(stat.color);
    
    const segment = { length, offset: -currentOffset, color };
    if (length > 0) {
      currentOffset += length + gap;
    }
    return segment;
  });

  // Exclusive Layer Controls
  const LAYER_CONTROLS = [
    { id: MAP_LAYERS.CRIME_HEATMAP, label: 'Crime Heatmap', icon: AlertTriangle },
    { id: MAP_LAYERS.ACCIDENT_ZONES, label: 'Accident Zones', icon: Activity },
    { id: MAP_LAYERS.UNSAFE_ROADS, label: 'Unsafe Roads', icon: MapIcon },
    { id: MAP_LAYERS.EMERGENCY_VEHICLES, label: 'Emergency Vehicles', icon: Shield },
    { id: MAP_LAYERS.INCIDENT_PINS, label: 'Civic Complaints', icon: AlertTriangle },
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
        <nav className="relative z-50 w-full px-6 lg:px-10 py-4 flex items-center justify-between border-b border-white/[0.06] bg-[#020617]/75 backdrop-blur-2xl">
          {/* Left Brand */}
          <div className="flex items-center gap-3.5 group cursor-pointer">
            <div className="h-10 w-10 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl flex items-center justify-center border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.4)] group-hover:border-white/25 transition-all duration-500">
              <Shield className="h-4.5 w-4.5 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-white tracking-wide leading-tight group-hover:text-gray-100 transition-colors">SafeCity</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] leading-none">Intelligence OS</span>
              </div>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="relative group">
              <a href="#hero" className="text-[13px] font-medium text-white transition-colors pb-1.5 block">Overview</a>
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 rounded-t-sm shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            </div>
            <div className="relative group">
              <a href="#report" className="text-[13px] font-medium text-gray-400 hover:text-white transition-colors pb-1.5 block">Report Issue</a>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gray-500 group-hover:w-full transition-all duration-300 rounded-t-sm" />
            </div>
            <div className="relative group">
              <a href="#analytics" className="text-[13px] font-medium text-gray-400 hover:text-white transition-colors pb-1.5 block">Analytics</a>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gray-500 group-hover:w-full transition-all duration-300 rounded-t-sm" />
            </div>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-4">
            <Link to="/authority-login">
              <button className="px-5 py-2.5 rounded-lg bg-[#0f172a] text-gray-300 border border-[#1e293b] hover:border-blue-500/50 hover:text-white hover:bg-[#1e293b]/60 hover:shadow-[0_4px_20px_rgba(59,130,246,0.15)] text-[13px] font-semibold transition-all duration-300 flex items-center gap-2.5 group">
                <Activity className="h-3.5 w-3.5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                Authority Access
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
              
              <SOSEmergencyConsole />
            </div>

            {/* 2. Real-time Visual Intelligence Module */}
            <div className="bg-[#0b1120] border border-[#1e293b] rounded-sm p-6 flex-1 flex flex-col relative overflow-hidden group shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]">
              {/* Subtle background city map pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scale-150" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex flex-col">
                   <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">City Status</h3>
                   <div className="flex items-center gap-2">
                     <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                       <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]" />
                       <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Operational</span>
                     </div>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-[9px] font-mono text-blue-400/60 uppercase tracking-widest mb-1 flex items-center gap-1">
                     <Radio className="h-2.5 w-2.5 animate-pulse" /> Live Stream
                   </div>
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                     {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                   </span>
                </div>
              </div>
              
              {/* CENTERPIECE - Operational Radar */}
              <div className="flex-1 flex flex-col justify-center py-4 relative z-10">
                <CityActivityRadar patrols={stats?.emergencyDispatches || 42} />
                <div className="mt-4 text-center">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em] opacity-60">Scanning Sectors...</span>
                </div>
              </div>

              {/* DYNAMIC METRIC GRID */}
              <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
                <div className="bg-[#0f172a]/80 border border-[#1e293b] p-3 rounded-sm group/metric hover:border-blue-500/30 transition-colors">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Active Patrols</p>
                  <div className="flex items-end gap-2">
                    <span className="text-xl font-bold text-white leading-none">
                      <AnimatedCounter value={stats?.emergencyDispatches || 42} />
                    </span>
                    <span className="text-[9px] font-bold text-gray-600 uppercase mb-0.5 tracking-wider">Units</span>
                  </div>
                  <div className="mt-2 h-[2px] w-full bg-[#1e293b] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: "65%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="bg-[#0f172a]/80 border border-[#1e293b] p-3 rounded-sm group/metric hover:border-red-500/30 transition-colors">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Threat Level</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${stats?.avgRiskScore > 7 ? 'text-red-400' : stats?.avgRiskScore > 4 ? 'text-amber-400' : 'text-blue-400'}`}>
                      {stats?.avgRiskScore > 7 ? 'Critical' : stats?.avgRiskScore > 4 ? 'Elevated' : 'Routine'}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-1.5 w-3 rounded-full ${i <= (stats?.avgRiskScore > 7 ? 3 : stats?.avgRiskScore > 4 ? 2 : 1) ? (stats?.avgRiskScore > 7 ? 'bg-red-500' : stats?.avgRiskScore > 4 ? 'bg-amber-500' : 'bg-blue-500') : 'bg-[#1e293b]'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-600 font-bold mt-2 uppercase tracking-tighter italic">AI Security Score: {stats?.avgRiskScore?.toFixed(1) || '2.4'}/10</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Network Sync</span>
                </div>
                <span className="text-[9px] font-mono text-gray-500 uppercase">
                  Updated {stats?.lastSync ? new Date(stats.lastSync).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }) : 'Just Now'}
                </span>
              </div>
            </div>
            
          </div>

          {/* CENTER PANEL - The Core Live Map Experience */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Enterprise Map Header */}
            <div className="flex flex-col mb-5 mt-1 px-1">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3 mb-2">
                 <div className="px-2.5 py-1 rounded-sm bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]">
                   <Activity className="h-3 w-3" /> Core Module
                 </div>
                 <div className="h-px flex-1 bg-gradient-to-r from-[#1e293b] via-[#1e293b]/50 to-transparent" />
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-[32px] md:text-[38px] font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                Urban Intelligence Map
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-[14px] md:text-[15px] text-gray-400 mt-2 max-w-2xl leading-relaxed font-medium">
                Realtime situational awareness and high-precision incident tracking powered by the enterprise Google Maps GIS engine.
              </motion.p>
            </div>

            {/* INTEGRATED GIS COMMAND INTERFACE */}
            <div className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-sm relative overflow-hidden flex flex-col h-[600px] min-h-[600px]">
              
              {/* Top Command Toolbar */}
              <div className="bg-[#0b1120] border-b border-[#1e293b] p-2 flex items-center gap-3">
                <div className="relative z-50">
                  <div className={`flex items-center gap-2 px-3 py-1.5 bg-[#1e293b]/50 border rounded-sm w-[300px] transition-all duration-300 ${isSearchFocused ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-[#1e293b]' : 'border-[#1e293b]'}`}>
                    <Search className="h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search location, wards, hospitals..." 
                      className="bg-transparent border-none text-[13px] text-white w-full focus:outline-none placeholder:text-gray-500" 
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    />
                  </div>
                  <AnimatePresence>
                    {isSearchFocused && searchValue.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5, filter: 'blur(4px)' }} 
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
                        exit={{ opacity: 0, y: -5, filter: 'blur(4px)' }}
                        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                        className="absolute top-full left-0 mt-2 w-[300px] bg-[#0b1120] border border-[#1e293b] rounded-md shadow-2xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-[#1e293b]/50 flex items-center gap-3 bg-[#0f172a]/50">
                           <span className="h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                           <span className="text-[11px] font-medium text-blue-400 uppercase tracking-widest">Analyzing Urban Data...</span>
                        </div>
                        <div className="p-2 flex flex-col gap-1">
                          <div className="px-3 py-2 hover:bg-[#1e293b]/80 rounded-sm cursor-pointer transition-colors flex items-center gap-2">
                            <MapIcon className="h-3 w-3 text-gray-500" />
                            <span className="text-[12px] text-gray-300">Shivaji Nagar Junction</span>
                          </div>
                          <div className="px-3 py-2 hover:bg-[#1e293b]/80 rounded-sm cursor-pointer transition-colors flex items-center gap-2">
                            <MapIcon className="h-3 w-3 text-gray-500" />
                            <span className="text-[12px] text-gray-300">Pune Station Road</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                <div className="flex-1 relative bg-[#e2e8f0]">
                  <MapContainer mode="light">
                    {(map) => (
                      <>
                        {activeLayer === MAP_LAYERS.CRIME_HEATMAP && <CrimeHeatmapLayer map={map} />}
                        {activeLayer === MAP_LAYERS.INCIDENT_PINS && <IncidentPinLayer map={map} />}
                        {activeLayer === MAP_LAYERS.ACCIDENT_ZONES && <AccidentZoneLayer map={map} />}
                        {activeLayer === MAP_LAYERS.UNSAFE_ROADS && <UnsafeRoadLayer map={map} />}
                        {activeLayer === MAP_LAYERS.EMERGENCY_VEHICLES && <EmergencyVehicleLayer map={map} />}
                        {activeLayer === MAP_LAYERS.RISK_ZONES && <RiskZoneLayer map={map} />}
                      </>
                    )}
                  </MapContainer>
                  {/* Subtle map transition layer */}
                  <motion.div
                    key={activeLayer}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute inset-0 bg-[#e2e8f0] pointer-events-none z-10"
                  />
                  {/* Subtle inner shadow for edge blending only */}
                  <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_40px_rgba(2,6,23,0.3)]" />
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
            
            {/* Animated City Statistics Gauge */}
            <div className="bg-[#0b1120] border border-[#1e293b] rounded-sm p-6 flex flex-col items-center justify-center relative overflow-hidden group shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]">
              {/* Subtle background radar/grid effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative w-48 h-48 flex items-center justify-center z-10">
                {/* Background Track Ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="44" 
                    fill="none" 
                    stroke="#1e293b" 
                    strokeWidth="4" 
                  />
                  {/* Dynamic Segments */}
                  {ringSegments.map((seg, i) => {
                    if (seg.length === 0) return null;
                    return (
                      <motion.circle 
                        key={i}
                        cx="50" 
                        cy="50" 
                        r="44" 
                        fill="none" 
                        stroke={seg.color}
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: `0 ${circumference}`, strokeDashoffset: seg.offset }}
                        animate={{ strokeDasharray: `${seg.length} ${circumference}`, strokeDashoffset: seg.offset }}
                        transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
                        style={{ filter: `drop-shadow(0 0 6px ${seg.color}60)` }}
                      />
                    );
                  })}
                </svg>

                {/* Center Content */}
                <div className="flex flex-col items-center justify-center text-center">
                  <BarChart3 className="h-6 w-6 text-gray-300 mb-2 opacity-90 transition-colors duration-500" />
                  <h3 className="text-[11px] font-bold text-gray-300 uppercase tracking-widest leading-tight transition-colors duration-500">
                    City<br/>Statistics
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 opacity-70">
                     <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                     <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">Live Data</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stacked Analytics Cards (Minimalist Datadog/Microsoft Style) */}
            <div className="flex-1 flex flex-col gap-3">
              {currentAnalytics.stats.map((stat, i) => (
                <LiveMetricCard key={i} stat={stat} index={i} />
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

          {/* Right - Live Response & Tracking Center */}
          <div className="flex flex-col gap-6">
            <div className="mb-2">
              <h2 className="text-[28px] font-bold text-white tracking-tight mb-1.5 flex items-center gap-2.5">
                <Activity className="h-6 w-6 text-blue-500" /> Response Center
              </h2>
              <p className="text-gray-400 text-[14px]">Live complaint tracking and emergency response systems.</p>
            </div>

            {/* 1. Complaint Status Tracking System */}
            <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              {/* Subtle background radar/grid effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-[12px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                   <Clock className="h-4 w-4 text-blue-500" /> Live Tracking
                </h3>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-sm uppercase tracking-widest shadow-[inset_0_0_8px_rgba(59,130,246,0.2)]">Active</span>
              </div>

              {/* Swiggy/Uber Style Tracker */}
              <div className="relative z-10 flex flex-col gap-5">
                {/* Status Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[15px] font-bold text-white mb-0.5">Road Damage near FC Road</h4>
                    <p className="text-[12px] text-gray-400 font-mono">ID: #PMC-2026-8942</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">ETA</p>
                    <p className="text-[14px] font-bold text-emerald-400">12 Hours</p>
                  </div>
                </div>

                {/* Vertical Timeline */}
                <div className="relative pl-[18px] mt-4">
                  {/* Background Track Line */}
                  <div className="absolute left-[20px] top-2 bottom-2 w-0.5 bg-[#1e293b] rounded-full" />
                  {/* Active Track Line */}
                  <div className="absolute left-[20px] top-2 h-[55%] w-0.5 bg-blue-500 rounded-full" />
                  
                  {/* Step 1: Submitted (Done) */}
                  <div className="relative flex gap-4 mb-5">
                    <div className="absolute left-[-4.5px] h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] z-10 ring-4 ring-[#0b1120]" />
                    <div className="flex flex-col -mt-1">
                      <span className="text-[13px] font-bold text-gray-200 leading-none">Submitted</span>
                      <span className="text-[11px] text-gray-500 mt-1 font-medium">Today, 08:30 AM</span>
                    </div>
                  </div>

                  {/* Step 2: Under Review (Done) */}
                  <div className="relative flex gap-4 mb-5">
                    <div className="absolute left-[-4.5px] h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] z-10 ring-4 ring-[#0b1120]" />
                    <div className="flex flex-col -mt-1">
                      <span className="text-[13px] font-bold text-gray-200 leading-none">Under Review</span>
                      <span className="text-[11px] text-gray-500 mt-1 font-medium flex items-center gap-1">
                         <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Verified by AI
                      </span>
                    </div>
                  </div>

                  {/* Step 3: In Progress (Active) */}
                  <div className="relative flex gap-4 mb-6">
                    <div className="absolute left-[-6px] h-4 w-4 rounded-full bg-blue-500 z-10 ring-4 ring-[#0b1120] flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                       <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                    <div className="flex flex-col w-full -mt-0.5">
                      <span className="text-[14px] font-bold text-blue-400 leading-none">In Progress</span>
                      <div className="mt-3 bg-[#1e293b]/40 border border-[#1e293b] rounded-lg p-3.5">
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="h-8 w-8 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                             <ShieldAlert className="h-4 w-4 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-gray-200 tracking-wide">PMC Road Dept.</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Assigned Team</p>
                          </div>
                        </div>
                        <p className="text-[12px] text-gray-400 border-t border-[#1e293b] pt-2.5 italic">
                          "Team dispatched. Excavator arriving at location for immediate repair."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Resolved (Pending) */}
                  <div className="relative flex gap-4">
                    <div className="absolute left-[-3.5px] h-2.5 w-2.5 rounded-full bg-[#1e293b] z-10 ring-4 ring-[#0b1120]" />
                    <div className="flex flex-col -mt-1">
                      <span className="text-[13px] font-bold text-gray-500 leading-none">Resolved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Emergency Access (Redesigned) */}
            <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl p-6 shadow-xl">
              <h3 className="text-[12px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2 mb-4">
                 <AlertTriangle className="h-4 w-4 text-red-500" /> Emergency Protocols
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <a href="tel:100" className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 group relative overflow-hidden block shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]">
                  <div className="absolute top-3 right-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 block animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  </div>
                  <h4 className="text-[26px] font-extrabold text-red-500 mb-0.5 group-hover:scale-105 transition-transform origin-left drop-shadow-md">100</h4>
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Police Control</p>
                  <p className="text-[11px] text-gray-500 mt-2 font-medium flex items-center gap-1.5"><Clock className="h-3 w-3" /> Est. 4 min</p>
                </a>
                <a href="tel:108" className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all duration-300 group relative overflow-hidden block shadow-[inset_0_0_15px_rgba(245,158,11,0.05)]">
                  <div className="absolute top-3 right-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 block animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  </div>
                  <h4 className="text-[26px] font-extrabold text-amber-500 mb-0.5 group-hover:scale-105 transition-transform origin-left drop-shadow-md">108</h4>
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Medical Unit</p>
                  <p className="text-[11px] text-gray-500 mt-2 font-medium flex items-center gap-1.5"><Clock className="h-3 w-3" /> Est. 6 min</p>
                </a>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 3. SAFETY ANALYTICS SECTION */}
      <section id="analytics" className="py-20 px-6 lg:px-10 bg-[#020617] border-t border-white/[0.05] relative z-10 overflow-hidden">
        {/* Cinematic Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        
        <div className="max-w-[1920px] mx-auto flex flex-col gap-8 relative z-10">
          
          {/* Analytics Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#0f172a]/60 border border-[#1e293b] rounded-2xl p-6 lg:p-8 relative overflow-hidden group shadow-2xl">
            {/* Subtle light sweep */}
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-500/[0.03] to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-sm shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
                  <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-[0.2em]">LIVE DATA</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 px-2.5 py-1 rounded-sm shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]">
                  <Cpu className="h-3 w-3 text-blue-400 animate-pulse" />
                  <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-[0.2em]">AI FORECAST ONLINE</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-sm hidden sm:flex shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]">
                  <Radio className="h-3 w-3 text-amber-500 animate-[pulse_2s_ease-in-out_infinite]" />
                  <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-[0.2em]">NETWORK ACTIVE</span>
                </div>
              </div>
              <h2 className="text-[34px] md:text-[42px] font-extrabold text-white tracking-tight mb-2.5 drop-shadow-md">Public Safety Analytics</h2>
              <p className="text-[14px] text-gray-400 max-w-3xl font-medium leading-relaxed">
                Government-grade real-time operational intelligence powered by citizen reports, emergency telemetry, and predictive AI spatial analysis.
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">System Sync</span>
                <span className="text-[12px] font-mono font-bold text-emerald-400 bg-[#1e293b]/80 border border-[#334155] px-3 py-1.5 rounded-sm shadow-inner">0.024ms</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Layer Protocol</span>
                <span className="text-[12px] font-bold text-white uppercase tracking-widest bg-blue-500/20 border border-blue-500/40 px-3 py-1.5 rounded-sm">{activeLayer.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* 8-Card Dynamic Analytics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
             {displayStats.map((card, i) => (
               <div key={i} className="bg-[#0b1120] border border-[#1e293b] rounded-xl p-5 hover:border-blue-500/40 hover:bg-[#0f172a] transition-all duration-300 shadow-xl relative overflow-hidden group cursor-default">
                  {/* Subtle highlight glow */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                  
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 relative z-10 transition-colors group-hover:text-gray-400">{card.title}</h3>
                  <div className="flex items-baseline gap-1.5 relative z-10">
                    <span className="text-[32px] font-extrabold text-white tracking-tight drop-shadow-sm"><AnimatedCounter value={card.val} /></span>
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">{card.unit}</span>
                  </div>
                  <div className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${card.color} relative z-10 flex items-center gap-1.5 bg-[#1e293b]/40 w-max px-2 py-0.5 rounded-sm`}>
                     {card.trend}
                  </div>
                  
                  {/* Miniature Data Sparkline */}
                  <svg className="absolute bottom-0 left-0 right-0 h-10 w-full opacity-20 group-hover:opacity-40 transition-opacity" preserveAspectRatio="none" viewBox="0 0 100 30">
                    <path d={card.path} fill="none" stroke="currentColor" className={card.color.replace('text-', 'stroke-')} strokeWidth="2.5" strokeLinecap="round" />
                    <path d={`${card.path} L 100 30 L 0 30 Z`} fill="currentColor" className={card.color.replace('text-', 'fill-')} fillOpacity="0.1" />
                  </svg>
               </div>
             ))}
          </div>

          {/* Bottom Split Layout: Master Graph & Operational Feeds */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
             
             {/* 1. Master Graph Panel (2 Columns) */}
             <div className="xl:col-span-2 bg-[#0b1120] border border-[#1e293b] rounded-2xl p-6 relative overflow-hidden group shadow-2xl flex flex-col">
                 <div className="flex items-center justify-between mb-8">
                   <div>
                     <h3 className="text-[14px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                       <BarChart3 className="h-4.5 w-4.5 text-blue-500" /> Layer Density Trend (7 Days)
                     </h3>
                     <p className="text-[11px] text-gray-500 mt-1 font-medium">Comparative analysis of incidents across primary wards.</p>
                   </div>
                   <div className="flex gap-2">
                     <button className="px-3 py-1 text-[10px] font-bold text-white bg-blue-500 border border-blue-600 rounded-sm uppercase tracking-widest">Wards</button>
                     <button className="px-3 py-1 text-[10px] font-bold text-gray-400 bg-[#1e293b] border border-[#334155] rounded-sm uppercase tracking-widest hover:text-white transition-colors">Time</button>
                   </div>
                 </div>

                 {/* Operational Bar Chart Visualization */}
                 <div className="flex-1 flex items-end gap-3 h-56 min-h-[224px] relative">
                    {/* Y-Axis lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                      {[1,2,3,4,5].map(i => <div key={i} className="w-full h-px bg-[#334155]" />)}
                    </div>
                    
                    {/* Animated Bars */}
                    {wardChartData.map((col, i) => (
                       <div key={i} className="flex-1 flex flex-col justify-end h-full relative z-10 group/bar cursor-pointer">
                          <motion.div 
                            initial={{ height: 0 }} 
                            animate={{ height: `${col.val}%` }} 
                            transition={{ duration: 1.2, delay: i * 0.05, ease: [0.32, 0.72, 0, 1] }} 
                            className={`w-full rounded-t-sm relative overflow-hidden transition-all duration-300 ${col.active || activeLayer === MAP_LAYERS.CRIME_HEATMAP && col.val > 80 ? 'bg-blue-500/30 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-[#1e293b]/60 border border-[#334155] hover:bg-[#334155]/60'}`}
                          >
                             <div className={`absolute top-0 left-0 right-0 h-1.5 ${col.active || activeLayer === MAP_LAYERS.CRIME_HEATMAP && col.val > 80 ? 'bg-blue-400' : 'bg-gray-500 group-hover/bar:bg-blue-400'}`} />
                             {/* Data Tooltip (visible on hover) */}
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity">
                               <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-sm">{col.val}</span>
                             </div>
                          </motion.div>
                          <span className="mt-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center truncate px-1 group-hover/bar:text-white transition-colors">{col.label}</span>
                       </div>
                    ))}
                 </div>
             </div>
             
             {/* 2. Operational Feeds (1 Column) */}
             <div className="flex flex-col gap-6">
                
                {/* Realtime Incident Feed */}
                <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
                  <h3 className="text-[12px] font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-[#1e293b] pb-3">
                    <Activity className="h-4 w-4 text-emerald-500" /> Operational Feed
                  </h3>
                  <div className="flex flex-col gap-4 overflow-y-auto pr-2 flex-1 max-h-[220px] custom-scrollbar">
                    {feed.length > 0 ? feed.map((item, i) => (
                      <div key={i} className="flex gap-3 p-2.5 rounded-lg hover:bg-[#1e293b]/40 transition-colors border border-transparent hover:border-[#1e293b] group">
                        <div className="flex flex-col items-center">
                           <span className={`h-2.5 w-2.5 rounded-full ${item.color} ring-4 ring-[#0b1120] mt-1 shadow-sm`} />
                           {i !== feed.length - 1 && <div className="flex-1 w-px bg-[#1e293b] mt-2 group-hover:bg-[#334155] transition-colors" />}
                        </div>
                        <div className="flex-1 -mt-0.5">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[11px] font-bold text-gray-200 tracking-wide">{item.title}</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{item.time}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <Loader2 className="h-6 w-6 animate-spin mb-2" />
                        <span className="text-[11px] uppercase tracking-widest">Loading Feed...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Predictive AI Insights */}
                <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-2xl p-5 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  <h3 className="text-[12px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-3 relative z-10">
                    <Zap className="h-4 w-4" /> AI Predictive Insights
                  </h3>
                  <div className="space-y-3 relative z-10">
                    <div className="bg-[#0b1120]/50 border border-[#1e293b] p-3 rounded-lg flex items-start gap-3">
                       <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                       <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
                         Higher accident probability expected near <strong className="text-white">Navale Bridge</strong> between 7PM–9PM based on historic traffic density.
                       </p>
                    </div>
                    <div className="bg-[#0b1120]/50 border border-[#1e293b] p-3 rounded-lg flex items-start gap-3">
                       <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                       <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
                         Crime rates in <strong className="text-white">Shivajinagar</strong> have dropped by 14% since additional patrol deployment yesterday.
                       </p>
                    </div>
                  </div>
                </div>

             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 lg:px-[120px] bg-[#020617] border-t border-white/[0.05] text-center relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 mb-4 shadow-lg">
            <Shield className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-[12px] font-bold text-white uppercase tracking-[0.2em] mb-2">SafeCity Intelligent Urban Platform</p>
          <p className="text-[11px] text-gray-500 font-medium">Built for strict public safety, rapid emergency response, and tactical civic monitoring.</p>
        </div>
      </footer>
    </div>
  );
}
