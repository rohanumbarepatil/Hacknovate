import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Map as MapIcon, Activity, AlertTriangle, ChevronDown, Bell, Navigation, Search, CheckCircle2, TrendingUp, TrendingDown, Clock, BarChart3, ShieldAlert, Cpu, Zap, Radio, Loader2 } from 'lucide-react';
import { motion, animate, AnimatePresence } from 'framer-motion';
import complaintService from '@/services/complaintService';
import socket from '@/services/socket';

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
  const [isHovered, setIsHovered] = useState(false);
  const colorClass = stat.color;
  const bgSoftClass = colorClass.replace('text-', 'bg-').replace('-400', '-500/10').replace('-500', '-500/10');
  const borderSoftClass = colorClass.replace('text-', 'border-').replace('-400', '-500/20').replace('-500', '-500/20');
  const borderHoverClass = colorClass.replace('text-', 'border-').replace('-400', '-500/40').replace('-500', '-500/40');
  const fromGradientClass = colorClass.replace('text-', 'from-').replace('-400', '-500/10').replace('-500', '-500/10');
  const bgPulseClass = colorClass.replace('text-', 'bg-').replace('-400', '-500').replace('-500', '-500');
  
  // Robust shadow color lookup
  const glowColorLookup = {
    'text-emerald-400': 'rgba(52, 211, 153, 0.15)',
    'text-emerald-500': 'rgba(16, 185, 129, 0.15)',
    'text-red-400': 'rgba(248, 113, 113, 0.15)',
    'text-red-500': 'rgba(239, 68, 68, 0.15)',
    'text-amber-400': 'rgba(251, 191, 36, 0.15)',
    'text-amber-500': 'rgba(245, 158, 11, 0.15)',
    'text-blue-400': 'rgba(96, 165, 250, 0.15)',
    'text-blue-500': 'rgba(59, 130, 246, 0.15)',
    'text-purple-400': 'rgba(192, 132, 252, 0.15)',
    'text-purple-500': 'rgba(168, 85, 247, 0.15)',
    'text-orange-400': 'rgba(251, 146, 60, 0.15)',
    'text-orange-500': 'rgba(249, 115, 22, 0.15)',
    'text-gray-400': 'rgba(156, 163, 175, 0.15)',
  };
  const shadowColor = glowColorLookup[colorClass] || 'rgba(255, 255, 255, 0.1)';

  // Real-time Dynamic Analytics Logic
  const rawValue = stat.val !== undefined ? stat.val : stat.value;
  const numValue = parseFloat(String(rawValue).replace(/,/g, '')) || 0;
  
  // Normalize value to 0-1 scale (assuming 300 as a high-activity baseline for this metric set)
  const normalizedValue = Math.min(1, numValue / 300);
  
  // Dynamic parameters based on live data
  const baseAmplitude = 1.5 + (normalizedValue * 8); 
  const currentAmplitude = isHovered ? baseAmplitude * 1.5 : baseAmplitude;
  const duration = Math.max(3, 15 - (normalizedValue * 12)); // Faster for higher values
  const glowOpacity = 0.15 + (normalizedValue * 0.6) + (isHovered ? 0.2 : 0);
  
  // Dynamic SVG Path generation for smooth flowing wave
  const wavePath = `M 0 10 Q 12.5 ${10 + currentAmplitude} 25 10 T 50 10 T 75 10 T 100 10 T 125 10 T 150 10 T 175 10 T 200 10`;

  return (
    <div 
      className={`bg-[#0f172a] border border-[#1e293b] rounded-md p-4 relative overflow-hidden group transition-all duration-300 ${isHovered ? 'bg-[#1e293b]/40 border-slate-700 -translate-y-0.5 z-10' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered ? `0 4px 20px -5px ${shadowColor}` : 'none'
      }}
    >
      
      <div className="flex items-center justify-between relative z-20">
        <div className="flex items-center gap-4">
          {/* Left Icon Block */}
          <div className={`w-11 h-11 rounded-md ${bgSoftClass} ${borderSoftClass} flex items-center justify-center relative overflow-hidden transition-all duration-500 ${isHovered ? 'scale-110 shadow-inner' : ''}`}>
            <motion.div key={stat.label} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
              <stat.icon className={`h-4 w-4 ${colorClass} relative z-10`} />
            </motion.div>
            <div className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t ${fromGradientClass} to-transparent transition-colors duration-500`} />
          </div>

          {/* Center Text */}
          <div className="flex flex-col">
            <div className="flex items-end gap-1.5">
              <motion.span 
                className="text-2xl font-bold text-white tracking-tight leading-none"
                animate={{ y: isHovered ? -2 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <AnimatedCounter value={rawValue} />
              </motion.span>
              <span 
                className={`h-1.5 w-1.5 rounded-full mb-1 ${bgPulseClass} shadow-[0_0_8px_currentColor] transition-all duration-500`} 
                style={{
                  animation: `pulse ${duration / 2}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                  opacity: glowOpacity
                }}
              />
            </div>
            <motion.span 
              key={stat.label} 
              initial={{ opacity: 0, x: -5 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.4 }}
              className="text-[11px] font-medium text-gray-400 mt-1 transition-colors duration-300 group-hover:text-gray-300"
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
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-sm bg-white/5 transition-all duration-500 ${stat.trend.startsWith('+') || stat.trend.includes('↑') || stat.trend === 'High Alert' ? 'text-red-400 group-hover:bg-red-500/10' : 'text-emerald-400 group-hover:bg-emerald-500/10'} ${stat.trend === 'Stable' ? '!text-gray-400 group-hover:!bg-gray-500/10' : ''}`}
          >
            {(stat.trend.startsWith('+') || stat.trend.includes('↑')) ? <TrendingUp className="h-3 w-3" /> : (stat.trend.startsWith('-') || stat.trend.includes('↓')) ? <TrendingDown className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
            {stat.trend.replace(/^[↑↓+-]\s*/, '')}
          </motion.div>
        </div>
      </div>

      {/* Dynamic Animated Sparkline / Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-transparent to-[#0f172a] z-20" />
        <div className={`absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t ${fromGradientClass} to-transparent z-10 transition-opacity duration-500`} style={{ opacity: glowOpacity * 0.4 }} />
        
        <motion.svg
          className={`absolute bottom-0 w-[200%] h-full transition-colors duration-500 ${colorClass}`}
          style={{ opacity: Math.min(1, glowOpacity), filter: `drop-shadow(0 -2px 6px currentColor)` }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
          preserveAspectRatio="none"
          viewBox="0 0 200 20"
        >
          <motion.path
            d={wavePath}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            initial={false}
            animate={{ d: wavePath, strokeWidth: isHovered ? 2 : 1.2 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </motion.svg>
        
        {/* Dynamic Particles based on value */}
        {normalizedValue > 0.05 && (
          <motion.div 
            className="absolute inset-0 z-15"
            animate={{ x: ["0%", "-20%"] }}
            transition={{ duration: duration * 1.5, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(Math.max(2, Math.floor(normalizedValue * 15)))].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute h-[2px] w-[2px] rounded-full ${bgPulseClass}`}
                style={{
                  left: `${Math.random() * 200}%`,
                  bottom: `${Math.random() * 60}%`,
                  opacity: Math.random() * 0.5 + 0.2
                }}
                animate={{
                  y: [0, -5 - Math.random() * 15, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2
                }}
              />
            ))}
          </motion.div>
        )}
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
  const [wards, setWards] = useState([]);

  // Live Complaint Tracking States
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [complaintSearchId, setComplaintSearchId] = useState('');
  const [trackedError, setTrackedError] = useState('');
  const [userComplaints, setUserComplaints] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // Fetch all citizen filed complaints
  const fetchUserComplaints = async () => {
    try {
      const response = await complaintService.getMine();
      const complaints = response.success ? response.data : response;
      if (Array.isArray(complaints)) {
        setUserComplaints(complaints);
        // Default to tracking the most recent if nothing active
        if (!trackedComplaint && complaints.length > 0) {
          setTrackedComplaint(complaints[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load user complaints:", err);
    }
  };

  useEffect(() => {
    fetchUserComplaints();
  }, []);

  // Set up socket listener for real-time tracking updates
  useEffect(() => {
    const handleComplaintUpdate = (updated) => {
      if (!updated) return;
      console.log("🔔 Dynamic track client got real-time update:", updated);
      
      // Update in-place if tracking matches
      setTrackedComplaint((current) => {
        if (current && (
          current.id === updated.id || 
          current.complaintId === updated.id || 
          current.id === updated.complaintId || 
          current.complaintId === updated.complaintId
        )) {
          return { ...current, ...updated };
        }
        return current;
      });

      // Refresh list
      fetchUserComplaints();
    };

    socket.on('complaintUpdated', handleComplaintUpdate);
    
    const handleStatusUpdate = ({ id, status, updated }) => {
      if (updated) {
        handleComplaintUpdate(updated);
      } else {
        // Direct status patch fallback
        setTrackedComplaint((current) => {
          if (current && (current.id === id || current.complaintId === id)) {
            return { ...current, status };
          }
          return current;
        });
      }
      fetchUserComplaints();
    };

    socket.on('complaint_status_updated', handleStatusUpdate);

    return () => {
      socket.off('complaintUpdated', handleComplaintUpdate);
      socket.off('complaint_status_updated', handleStatusUpdate);
    };
  }, []);

  const handleSearchComplaint = async (e) => {
    e.preventDefault();
    if (!complaintSearchId.trim()) return;
    setSearchLoading(true);
    setTrackedError('');
    try {
      const response = await complaintService.getById(complaintSearchId.trim());
      const complaint = response.success ? response.data : response;
      if (complaint) {
        setTrackedComplaint(complaint);
      } else {
        setTrackedError('Grievance not found. Check the ID.');
      }
    } catch (err) {
      setTrackedError('Error fetching grievance details.');
    } finally {
      setSearchLoading(false);
    }
  };

  const getSafeStatus = (item) => {
    if (!item) return 'Submitted';
    const statusVal = item.status;
    if (typeof statusVal === 'object' && statusVal !== null) {
      return statusVal.status || 'Submitted';
    }
    return statusVal || 'Submitted';
  };

  const getTimelineSteps = () => {
    if (!trackedComplaint) return [];
    
    // If we have a rich workflow history from database, use it
    if (trackedComplaint.workflowHistory && trackedComplaint.workflowHistory.length > 0) {
      return trackedComplaint.workflowHistory;
    }
    
    // Dynamic fallback timeline generation
    const steps = [];
    const status = getSafeStatus(trackedComplaint);
    
    steps.push({
      status: 'Submitted',
      note: 'Complaint registered successfully.',
      updatedBy: 'Citizen',
      timestamp: 'Just now'
    });
    
    if (status === 'Under Review' || status === 'Assigned' || status === 'In Progress' || status === 'Resolved') {
      steps.push({
        status: 'Under Review',
        note: 'AI-Triage and category routing complete.',
        updatedBy: 'SafeCity Core',
        timestamp: 'Just now'
      });
    }
    
    if (status === 'Assigned' || status === 'In Progress' || status === 'Resolved') {
      steps.push({
        status: 'Assigned',
        note: `Assigned to ${trackedComplaint.assignedDepartment || 'respective municipal wing'}.`,
        updatedBy: 'Command Center',
        timestamp: 'Just now'
      });
    }
    
    if (status === 'In Progress' || status === 'Resolved') {
      steps.push({
        status: 'In Progress',
        note: 'Operations crew dispatched to address grievance.',
        updatedBy: trackedComplaint.assignedDepartment || 'PMC Operations',
        timestamp: 'Just now'
      });
    }
    
    if (status === 'Resolved') {
      steps.push({
        status: 'Resolved',
        note: 'Problem successfully resolved. Resolution verified.',
        updatedBy: 'PMC Command Center',
        timestamp: 'Just now'
      });
    }
    
    return steps;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, wardsRes] = await Promise.all([
          fetch('http://localhost:3001/api/analytics/stats').then(res => res.json()),
          fetch('http://localhost:3001/api/analytics/zones').then(res => res.json())
        ]);
        
        if (statsRes.status === 'success') setStats(statsRes.data);
        if (wardsRes.status === 'success') setWards(wardsRes.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      }
    };
    fetchData();
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
            
            {/* Redesigned Premium City Statistics Circular Analytics System */}
            {(() => {
              const R = 40;
              const circumferenceVal = 2 * Math.PI * R; // 251.327
              const segmentMax = circumferenceVal / 4 - 5; // 57.83 pixels max active length

              const statsSegments = [
                {
                  id: 'incidents',
                  label: 'Incidents',
                  value: stats?.unsafeRoadReports || 56,
                  max: 120,
                  unit: 'Active',
                  color: '#ef4444', // Red
                  glowColor: 'rgba(239, 68, 68, 0.45)',
                  offset: 0,
                  trend: '↑ 8% vs yesterday',
                  icon: AlertTriangle,
                },
                {
                  id: 'alerts',
                  label: 'Active Alerts',
                  value: stats?.emergencyDispatches || 124,
                  max: 250,
                  unit: 'Dispatched',
                  color: '#10b981', // Green
                  glowColor: 'rgba(16, 185, 129, 0.45)',
                  offset: -62.83,
                  trend: '↑ 18% high alert',
                  icon: Shield,
                },
                {
                  id: 'complaints',
                  label: 'Complaints',
                  value: stats?.activeComplaints || 215,
                  max: 400,
                  unit: 'Open Grid',
                  color: '#3b82f6', // Blue
                  glowColor: 'rgba(59, 130, 246, 0.45)',
                  offset: -125.66,
                  trend: '↑ 5% ticket load',
                  icon: Bell,
                },
                {
                  id: 'risk',
                  label: 'Risk Wards',
                  value: stats?.highRiskWards || 7,
                  max: 20,
                  unit: 'Risk Zones',
                  color: '#a855f7', // Purple
                  glowColor: 'rgba(168, 85, 247, 0.45)',
                  offset: -188.49,
                  trend: 'Stable profile',
                  icon: Activity,
                }
              ];

              const keyframesStyles = statsSegments.map((seg, idx) => {
                const percentage = Math.min(100, (seg.value / seg.max) * 100);
                const arcLength = (percentage / 100) * segmentMax;
                return `
                  @keyframes trailMove-${idx} {
                    0% { stroke-dashoffset: ${seg.offset}; }
                    100% { stroke-dashoffset: ${seg.offset - arcLength}; }
                  }
                `;
              }).join('\n') + `
                @keyframes gridShift {
                  0% { background-position: 0px 0px; }
                  100% { background-position: 16px 16px; }
                }
              `;

              return (
                <div className="bg-[#060B18]/90 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.8)] min-h-[290px] w-full">
                  <style dangerouslySetInnerHTML={{ __html: keyframesStyles }} />
                  
                  {/* Cinematic Ambient Background Details */}
                  {/* 1. Slow moving grid texture */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:16px_16px]"
                    style={{
                      animation: 'gridShift 40s linear infinite'
                    }}
                  />
                  
                  {/* 2. Low-opacity ambient network pulse line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.path 
                      d="M -10,30 Q 30,20 60,40 T 110,35" 
                      fill="none" 
                      stroke="rgba(59, 130, 246, 0.12)" 
                      strokeWidth="0.5"
                      animate={{ d: ["M -10,30 Q 30,20 60,40 T 110,35", "M -10,32 Q 30,24 60,38 T 110,37", "M -10,30 Q 30,20 60,40 T 110,35"] }}
                      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.path 
                      d="M -10,70 Q 40,80 70,60 T 110,65" 
                      fill="none" 
                      stroke="rgba(168, 85, 247, 0.08)" 
                      strokeWidth="0.5"
                      animate={{ d: ["M -10,70 Q 40,80 70,60 T 110,65", "M -10,68 Q 40,77 70,62 T 110,63", "M -10,70 Q 40,80 70,60 T 110,65"] }}
                      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </svg>

                  {/* 3. Tiny floating data flicker particles */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-1 w-1 bg-blue-500/35 rounded-full"
                        style={{
                          left: `${15 + Math.random() * 70}%`,
                          top: `${15 + Math.random() * 70}%`,
                          filter: 'blur(0.5px)',
                        }}
                        animate={{
                          y: [0, -30, 0],
                          x: [0, 15, 0],
                          opacity: [0, 0.7, 0],
                          scale: [0.5, 1.2, 0.5]
                        }}
                        transition={{
                          duration: 6 + i * 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.8
                        }}
                      />
                    ))}
                  </div>

                  {/* Rotating outer ring glow breathing */}
                  <div className="absolute w-52 h-52 rounded-full border border-slate-850/20 bg-[#060D18]/40 pointer-events-none scale-105 shadow-[0_0_40px_rgba(30,41,59,0.15)]" />

                  {/* Dynamic Tooltip slide-in on hover */}
                  <AnimatePresence>
                    {hoveredSegment !== null && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-2.5 z-20 px-3 py-1.5 bg-[#0A1124] border border-slate-800/80 rounded-lg shadow-2xl flex items-center gap-1.5 pointer-events-none select-none"
                      >
                        <span 
                          className="h-1.5 w-1.5 rounded-full animate-ping" 
                          style={{ backgroundColor: statsSegments[hoveredSegment].color }}
                        />
                        <span className="text-[9px] font-bold text-slate-300 tracking-wider uppercase">
                          {statsSegments[hoveredSegment].trend}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Center Gauge Circular System */}
                  <div className="relative w-48 h-48 flex items-center justify-center z-10 cursor-pointer select-none">
                    
                    {/* SVG Drawing of Segmented Arcs & Radar Sweep */}
                    <svg className="absolute inset-0 w-full h-full transform rotate-0" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="radarTail" x1="1" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Micro rotating background dashboard tick rings */}
                      <motion.circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="rgba(30, 41, 59, 0.25)" 
                        strokeWidth="0.5" 
                        strokeDasharray="2 6"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 90, ease: "linear" }}
                      />

                      {/* 1. Underlying Quadrant Track Rings */}
                      {[0, 1, 2, 3].map((idx) => {
                        const seg = statsSegments[idx];
                        return (
                          <circle 
                            key={`track-${idx}`}
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="none" 
                            stroke="#111A2E" 
                            strokeWidth="3.5" 
                            strokeDasharray={`${segmentMax} ${circumferenceVal}`}
                            strokeDashoffset={seg.offset}
                            strokeLinecap="round"
                            opacity="0.8"
                            transform="rotate(-90 50 50)"
                          />
                        );
                      })}

                      {/* 2. Real-Time Active Arcs */}
                      {statsSegments.map((seg, idx) => {
                        const percentage = Math.min(100, (seg.value / seg.max) * 100);
                        const arcLength = (percentage / 100) * segmentMax;
                        const isHovered = hoveredSegment === idx;
                        
                        return (
                          <motion.circle 
                            key={`arc-${idx}`}
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="none" 
                            stroke={seg.color}
                            strokeWidth={isHovered ? 5.5 : 3.5}
                            strokeLinecap="round"
                            strokeDasharray={`${arcLength} ${circumferenceVal}`}
                            initial={{ strokeDasharray: `0 ${circumferenceVal}` }}
                            animate={{ strokeDasharray: `${arcLength} ${circumferenceVal}` }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            strokeDashoffset={seg.offset}
                            transform="rotate(-90 50 50)"
                            onMouseEnter={() => setHoveredSegment(idx)}
                            onMouseLeave={() => setHoveredSegment(null)}
                            style={{
                              filter: isHovered 
                                ? `drop-shadow(0 0 8px ${seg.color})` 
                                : `drop-shadow(0 0 3px ${seg.color}45)`,
                              cursor: 'pointer',
                              transition: 'stroke-width 0.25s ease, filter 0.25s ease',
                            }}
                          />
                        );
                      })}

                      {/* 3. Traveling particle trails for live operational look */}
                      {statsSegments.map((seg, idx) => {
                        const percentage = Math.min(100, (seg.value / seg.max) * 100);
                        const arcLength = (percentage / 100) * segmentMax;
                        if (arcLength < 5) return null;
                        
                        return (
                          <circle 
                            key={`particle-${idx}`}
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="none" 
                            stroke="#ffffff"
                            strokeWidth="0.75"
                            strokeLinecap="round"
                            strokeDasharray="1 100"
                            strokeDashoffset={seg.offset}
                            transform="rotate(-90 50 50)"
                            className="pointer-events-none opacity-60"
                            style={{
                              animation: `trailMove-${idx} 3s linear infinite`,
                            }}
                          />
                        );
                      })}

                      {/* 4. Cinematic Radar Sweep ray */}
                      <motion.line
                        x1="50"
                        y1="50"
                        x2="50"
                        y2="10"
                        stroke="rgba(59, 130, 246, 0.22)"
                        strokeWidth="0.75"
                        strokeLinecap="round"
                        style={{ originX: "50px", originY: "50px" }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      />

                      {/* 5. Trailing radar sweep fade wedge */}
                      <motion.path
                        d="M50,50 L50,10 A40,40 0 0,1 62,11.5 Z"
                        fill="url(#radarTail)"
                        style={{ originX: "50px", originY: "50px" }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      />
                    </svg>

                    {/* Inner center text layout (Reacts dynamically to hover states) */}
                    <AnimatePresence mode="wait">
                      {hoveredSegment === null ? (
                        <motion.div 
                          key="default-center"
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col items-center justify-center text-center px-4 select-none pointer-events-none"
                        >
                          <motion.div
                            animate={{ 
                              scale: [1, 1.05, 1],
                              opacity: [0.85, 1, 0.85]
                            }}
                            transition={{ 
                              duration: 4, 
                              repeat: Infinity, 
                              ease: "easeInOut" 
                            }}
                          >
                            <BarChart3 className="h-5 w-5 text-slate-400 mb-1.5" />
                          </motion.div>
                          <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] leading-tight select-none">
                            City Statistics
                          </h3>
                          <div className="flex items-center gap-1 mt-2.5 opacity-90 select-none">
                             <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                             <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.15em]">Live Data</p>
                          </div>
                        </motion.div>
                      ) : (() => {
                        const activeSeg = statsSegments[hoveredSegment];
                        return (
                          <motion.div 
                            key={`hover-${hoveredSegment}`}
                            initial={{ opacity: 0, scale: 0.96, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: -5 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center justify-center text-center px-4 select-none pointer-events-none"
                          >
                            <activeSeg.icon 
                              className="h-5 w-5 mb-1.5 animate-pulse" 
                              style={{ color: activeSeg.color }}
                            />
                            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                              {activeSeg.label}
                            </h3>
                            <span 
                              className="text-xl font-bold tracking-tight mt-0.5"
                              style={{ 
                                color: activeSeg.color,
                                textShadow: `0 0 10px ${activeSeg.glowColor}` 
                              }}
                            >
                              <AnimatedCounter value={activeSeg.value} />
                            </span>
                            <p className="text-[8px] text-slate-500 font-medium uppercase tracking-[0.1em] mt-1 leading-none">
                              {activeSeg.unit}
                            </p>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>

                  </div>
                </div>
              );
            })()}

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
              <ComplaintForm onSuccess={(newComplaint) => {
                if (newComplaint) {
                  setTrackedComplaint(newComplaint);
                  setTrackedError('');
                }
                fetchUserComplaints();
              }} />
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
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-[12px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                   <Clock className="h-4 w-4 text-blue-500" /> Live Tracking
                </h3>
                {trackedComplaint && (() => {
                  const safeStatus = getSafeStatus(trackedComplaint);
                  return (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest shadow-[inset_0_0_8px_rgba(59,130,246,0.2)] ${
                      safeStatus === 'Resolved' 
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-[inset_0_0_8px_rgba(16,185,129,0.2)]'
                        : safeStatus === 'Rejected'
                        ? 'text-red-400 bg-red-500/10 border border-red-500/20 shadow-[inset_0_0_8px_rgba(239,68,68,0.2)]'
                        : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                    }`}>
                      {safeStatus}
                    </span>
                  );
                })()}
              </div>

              {/* Dynamic Search & selector interface */}
              <div className="relative z-10 mb-5 flex flex-col gap-3">
                <form onSubmit={handleSearchComplaint} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search ID COMP-PUNE-..."
                      value={complaintSearchId}
                      onChange={(e) => setComplaintSearchId(e.target.value)}
                      className="w-full bg-[#0b1120] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searchLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
                  >
                    {searchLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Track'}
                  </button>
                </form>

                {userComplaints.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Your Submissions:</span>
                    <select
                      value={trackedComplaint ? trackedComplaint.complaintId || trackedComplaint.id : ''}
                      onChange={(e) => {
                        const selected = userComplaints.find(c => (c.complaintId === e.target.value || c.id === e.target.value));
                        if (selected) {
                          setTrackedComplaint(selected);
                          setTrackedError('');
                        }
                      }}
                      className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      {userComplaints.map((c) => (
                        <option key={c.id || c.complaintId} value={c.complaintId || c.id}>
                          {(c.complaintId || c.id).substring(0, 18)} - {(c.category || 'other').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {trackedError && (
                  <p className="text-[11px] text-red-400 font-semibold mt-0.5">{trackedError}</p>
                )}
              </div>

              {!trackedComplaint ? (
                <div className="text-center py-10 border border-dashed border-[#1e293b] rounded-xl relative z-10 flex flex-col items-center justify-center bg-[#070b14]/50">
                  <Activity className="h-8 w-8 text-gray-600 mb-2 animate-pulse" />
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">No Active Grievance Tracked</p>
                  <p className="text-gray-500 text-[10px] mt-1 max-w-[200px] leading-relaxed">Submit a complaint via the portal form or select from your list to initiate live status tracking.</p>
                </div>
              ) : (
                /* Dynamic Swiggy/Uber Style Tracker */
                <div className="relative z-10 flex flex-col gap-5">
                  {/* Status Header */}
                  <div className="flex justify-between items-start border-t border-[#1e293b] pt-4">
                    <div>
                      <h4 className="text-[14px] font-bold text-white mb-0.5 capitalize">{trackedComplaint.category?.replace('_', ' ')}</h4>
                      <p className="text-[11px] text-gray-400 font-mono select-all">ID: {trackedComplaint.complaintId || trackedComplaint.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">ETA</p>
                      <p className={`text-[13px] font-bold ${getSafeStatus(trackedComplaint) === 'Resolved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {trackedComplaint.eta || 'Calculating...'}
                      </p>
                    </div>
                  </div>

                  {trackedComplaint.imageUrl && (
                    <div className="relative rounded-lg overflow-hidden h-24 w-full border border-[#1e293b]">
                      <img 
                        src={trackedComplaint.imageUrl.startsWith('http') || trackedComplaint.imageUrl.startsWith('/') || trackedComplaint.imageUrl.startsWith('data:') 
                          ? trackedComplaint.imageUrl 
                          : `http://localhost:3001${trackedComplaint.imageUrl}`}
                        alt="Uploaded evidence verified"
                        className="object-cover h-full w-full opacity-80 hover:opacity-100 transition-opacity duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[9px] font-bold text-gray-300 px-2 py-0.5 rounded-sm uppercase tracking-widest border border-white/10">
                        Visual Verification
                      </div>
                    </div>
                  )}

                  {/* Vertical Timeline */}
                  <div className="relative pl-[18px] mt-2">
                    {/* Background Track Line */}
                    <div className="absolute left-[20px] top-2 bottom-2 w-0.5 bg-[#1e293b] rounded-full" />
                    
                    {/* Active Track Line */}
                    <div 
                      className="absolute left-[20px] top-2 w-0.5 bg-blue-500 rounded-full transition-all duration-700" 
                      style={{
                        height: 
                          getSafeStatus(trackedComplaint) === 'Submitted' ? '15%' :
                          getSafeStatus(trackedComplaint) === 'Under Review' ? '40%' :
                          getSafeStatus(trackedComplaint) === 'Assigned' ? '65%' :
                          getSafeStatus(trackedComplaint) === 'In Progress' ? '80%' :
                          getSafeStatus(trackedComplaint) === 'Resolved' || getSafeStatus(trackedComplaint) === 'Rejected' ? '100%' : '15%'
                      }}
                    />
                    
                    {getTimelineSteps().map((step, idx) => {
                      const isLast = idx === getTimelineSteps().length - 1;
                      const isResolved = step.status === 'Resolved';
                      const isRejected = step.status === 'Rejected';

                      return (
                        <div key={idx} className={`relative flex gap-4 ${isLast ? '' : 'mb-5'}`}>
                          {/* Dot indicator */}
                          {isLast ? (
                            isResolved ? (
                              <div className="absolute left-[-6px] h-4 w-4 rounded-full bg-emerald-500 z-10 ring-4 ring-[#0b1120] flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-bounce">
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              </div>
                            ) : isRejected ? (
                              <div className="absolute left-[-6px] h-4 w-4 rounded-full bg-red-500 z-10 ring-4 ring-[#0b1120] flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.8)]">
                                <AlertTriangle className="h-3 w-3 text-white" />
                              </div>
                            ) : (
                              <div className="absolute left-[-6px] h-4 w-4 rounded-full bg-blue-500 z-10 ring-4 ring-[#0b1120] flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                                 <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                              </div>
                            )
                          ) : (
                            <div className="absolute left-[-4.5px] h-3 w-3 rounded-full bg-blue-500/70 shadow-[0_0_8px_rgba(59,130,246,0.3)] z-10 ring-4 ring-[#0b1120]" />
                          )}

                          <div className="flex flex-col w-full -mt-0.5">
                            <span className={`text-[13px] font-bold leading-none ${isLast ? (isResolved ? 'text-emerald-400' : isRejected ? 'text-red-400' : 'text-blue-400') : 'text-gray-300'}`}>
                              {typeof step.status === 'object' ? (step.status.status || 'Submitted') : step.status}
                            </span>
                            <span className="text-[10px] text-gray-500 mt-1 font-semibold">
                              {step.timestamp} - Updated by {typeof step.updatedBy === 'object' ? (step.updatedBy.updatedBy || 'Authority') : step.updatedBy}
                            </span>
                            
                            {step.note && (
                              <div className={`mt-2 bg-[#1e293b]/40 border ${isLast && isResolved ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-[#1e293b]'} rounded-lg p-3`}>
                                <p className="text-[12px] text-gray-300 leading-relaxed italic">
                                  "{typeof step.note === 'object' ? (step.note.note || '') : step.note}"
                                </p>
                                
                                {isLast && isResolved && (
                                  <div className="mt-2.5 flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-wider animate-pulse">
                                    <CheckCircle2 className="h-4 w-4" /> Problem Successfully Resolved
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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

          {/* Bottom Split Layout: Master Graph & Predictive AI Insights */}
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
             
             {/* 2. Predictive AI Insights (1 Column) */}
             <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-2xl p-6 shadow-xl relative overflow-hidden group flex flex-col justify-center min-h-[224px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-[14px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-6 relative z-10">
                  <Zap className="h-4.5 w-4.5" /> AI Predictive Insights
                </h3>
                <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
                  <div className="bg-[#0b1120]/60 border border-[#1e293b] p-4 rounded-xl flex items-start gap-3 hover:bg-[#0b1120] transition-colors">
                     <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                     <p className="text-[12px] text-gray-300 font-medium leading-relaxed">
                       Higher accident probability expected near <strong className="text-white">Navale Bridge</strong> between 7PM–9PM based on historic traffic density.
                     </p>
                  </div>
                  <div className="bg-[#0b1120]/60 border border-[#1e293b] p-4 rounded-xl flex items-start gap-3 hover:bg-[#0b1120] transition-colors">
                     <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                     <p className="text-[12px] text-gray-300 font-medium leading-relaxed">
                       Crime rates in <strong className="text-white">Shivajinagar</strong> have dropped by 14% since additional patrol deployment yesterday.
                     </p>
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
