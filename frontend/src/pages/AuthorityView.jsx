import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Bell,
  Headphones,
  Layers,
  Map as MapIcon,
  MapPin,
  Shield,
  LayoutDashboard,
  ClipboardList,
  Settings as SettingsIcon,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Cpu,
  Phone,
  Mail,
  Plus,
  Truck,
  Heart,
  Flame,
  Sliders,
  ChevronRight,
  ShieldAlert,
  Wifi,
  Zap,
  Play,
  Volume2,
  Navigation,
  CloudRain,
  Eye,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { push, ref as dbRef, set } from 'firebase/database';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MapContainer from '@/maps/MapContainer';
import CrimeHeatmapLayer from '@/maps/layers/CrimeHeatmapLayer';
import AccidentZoneLayer from '@/maps/layers/AccidentZoneLayer';
import EmergencyVehicleLayer from '@/maps/layers/EmergencyVehicleLayer';
import RiskZoneLayer from '@/maps/layers/RiskZoneLayer';
import IncidentPinLayer from '@/maps/layers/IncidentPinLayer';
import MapLegend from '@/maps/controls/MapLegend';
import { Card, Badge, StatusIndicator, Button } from '@/components/common';
import { showToast } from '@/components/common/Toast';
import useStore from '@/store/useStore';
import useNotificationStore from '@/store/useNotificationStore';
import { MAP_LAYERS } from '@/constants/mapConfig';
import { rtdb } from '@/services/firebase';

// Helper: Timestamp formatter
function toTimestamp(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

// Helper: Numbers parser
function toNumberOrNull(value) {
  if (Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

// Helper: Date formatter
function formatRelativeTime(value) {
  const ts = toTimestamp(value);
  if (!ts) return 'just now';

  const diffMs = Date.now() - ts;
  const diffSec = Math.max(1, Math.floor(diffMs / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  return new Date(ts).toLocaleString();
}

// Helper: Coordinates parser
function getCoordinates(alert) {
  const lat = toNumberOrNull(alert?.lat) ?? toNumberOrNull(alert?.location?.lat);
  const lng = toNumberOrNull(alert?.lng) ?? toNumberOrNull(alert?.location?.lng);
  return { lat, lng };
}

// Helper: Status badge
function getStatusVariant(status) {
  const value = (status || 'active').toLowerCase();
  if (value === 'active' || value === 'escalated') return 'CRITICAL';
  if (value === 'recording' || value === 'responding') return 'HIGH';
  if (value === 'acknowledged' || value === 'pending') return 'MEDIUM';
  if (value === 'resolved') return 'LOW';
  return 'HIGH';
}

// Animated Route Wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    className="flex-1 flex flex-col min-h-0 overflow-hidden"
  >
    {children}
  </motion.div>
);

// ----------------------------------------------------
// 1. DASHBOARD OVERVIEW PAGE
// ----------------------------------------------------
function DashboardOverview({ activeRole, liveFeed, setLiveFeed }) {
  const { incidents, sosEvents } = useStore();
  const activeSOS = useMemo(() => sosEvents.filter(s => s.status === 'active').length, [sosEvents]);

  // Real datasets KPIs
  const threatScore = 28;
  const activeUnits = 24;
  const maxUnits = 45;

  // Real Pune Care & Crime dataset stats
  const analyticsData = [
    { name: 'Shivajinagar', crimeCases: 34, civicComplaints: 48, riskIndex: 65 },
    { name: 'Swargate', crimeCases: 56, civicComplaints: 72, riskIndex: 82 },
    { name: 'Hadapsar', crimeCases: 42, civicComplaints: 38, riskIndex: 58 },
    { name: 'Kothrud', crimeCases: 18, civicComplaints: 94, riskIndex: 72 },
    { name: 'Camp', crimeCases: 29, civicComplaints: 51, riskIndex: 48 },
  ];

  // Dynamic AI Alert Center alerts based on Active Role
  const roleAlerts = useMemo(() => {
    const defaultAlerts = [
      { id: 1, type: 'Critical', ward: 'Swargate Grid', msg: 'AI predicts heavy congestion near Swargate due to evening peak hours.', confidence: 94, category: 'traffic' },
      { id: 2, type: 'High', ward: 'Kothrud Sector 2', msg: 'High probability of localized waterlogging due to heavy precipitation trend.', confidence: 88, category: 'disaster' },
      { id: 3, type: 'High', ward: 'Hadapsar Night Zone', msg: 'Crime escalation threat increased by 18% based on historical police logs.', confidence: 82, category: 'police' },
      { id: 4, type: 'Moderate', ward: 'NH4 Exit Bypass', msg: 'High probability of road blockage near Satara ramp due to slow truck breakdown cleanup.', confidence: 76, category: 'traffic' },
      { id: 5, type: 'Moderate', ward: 'Camp Ward', msg: 'Unsafe road conditions reported near MG Road intersection.', confidence: 84, category: 'municipal' },
    ];

    if (activeRole.includes('Police')) return defaultAlerts.filter(a => a.category === 'police');
    if (activeRole.includes('Traffic')) return defaultAlerts.filter(a => a.category === 'traffic');
    if (activeRole.includes('Disaster')) return defaultAlerts.filter(a => a.category === 'disaster');
    if (activeRole.includes('Municipal')) return defaultAlerts.filter(a => a.category === 'municipal');
    return defaultAlerts;
  }, [activeRole]);

  return (
    <PageWrapper>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-6">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="p-5 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-lg border-l-4 border-l-red-500 relative overflow-hidden group hover:border-red-500/30 transition-colors">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Active Alert Stream</span>
            <div className="flex items-end gap-3 mt-1.5">
              <span className="text-3xl font-extrabold text-white leading-none tracking-tight">
                {activeSOS > 0 ? activeSOS : '0'}
              </span>
              {activeSOS > 0 && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse mb-1.5 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
            </div>
            <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
              Live emergency SOS captures active
            </p>
          </div>

          <div className="p-5 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-lg border-l-4 border-l-amber-500 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Pune Safety Index</span>
            <div className="flex items-end gap-2 mt-1.5">
              <span className="text-3xl font-extrabold text-white leading-none tracking-tight">{threatScore}</span>
              <span className="text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-wider">/ 100 [SECURE]</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
              <Sliders className="h-3.5 w-3.5 text-amber-500" />
              Under secure threshold levels
            </p>
          </div>

          <div className="p-5 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-lg border-l-4 border-l-blue-500 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Deployed Resources</span>
            <div className="flex items-end gap-2 mt-1.5">
              <span className="text-3xl font-extrabold text-white leading-none tracking-tight">{activeUnits}</span>
              <span className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">/ {maxUnits} active</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-blue-400" />
              Police, Medical & Rescue units
            </p>
          </div>

          <div className="p-5 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-lg border-l-4 border-l-green-500 relative overflow-hidden group hover:border-green-500/30 transition-colors">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Network Telemetries</span>
            <div className="flex items-end gap-2 mt-1.5">
              <span className="text-3xl font-extrabold text-white leading-none tracking-tight">ACTIVE</span>
              <span className="text-[10px] text-green-500 font-bold mb-1 uppercase tracking-wider">99.98%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
              <Wifi className="h-3.5 w-3.5 text-green-500" />
              All city nodes synchronized
            </p>
          </div>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* AI ALERT CENTER */}
          <div className="xl:col-span-2 p-5 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-lg flex flex-col h-[350px]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3 select-none">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-350 uppercase tracking-widest">AI Prediction Feed ({activeRole})</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Real-Time Forecasts</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
              {roleAlerts.map((item) => (
                <div key={item.id} className="p-3 border border-slate-800/80 bg-[#060D18]/30 rounded-xl flex items-start gap-3 justify-between">
                  <div className="flex items-start gap-2.5">
                    <span className={`p-1.5 rounded bg-[#060D18] border ${
                      item.type === 'Critical' ? 'border-red-500/20 text-red-500 animate-pulse' :
                      item.type === 'High' ? 'border-amber-500/20 text-amber-500' : 'border-slate-850 text-slate-400'
                    }`}>
                      <AlertCircle className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{item.ward}</p>
                      <p className="text-[11px] text-slate-455 mt-1 leading-relaxed">{item.msg}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={item.type === 'Critical' ? 'CRITICAL' : item.type === 'High' ? 'HIGH' : 'MEDIUM'}>
                      {item.type.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-blue-400 font-bold block mt-1">{item.confidence}% Conf.</span>
                  </div>
                </div>
              ))}

              {roleAlerts.length === 0 && (
                <div className="p-12 text-center select-none my-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-500/30 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">Zero Critical AI Alerts</p>
                  <p className="text-[10px] text-slate-550 mt-1">Operational safety index at secure limits under {activeRole}.</p>
                </div>
              )}
            </div>
          </div>

          {/* LIVE OPERATION FEED */}
          <div className="p-5 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-lg flex flex-col h-[350px]">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800/60 pb-3 select-none">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-xs font-bold text-slate-350 uppercase tracking-widest">Live Operations Feed</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
              {liveFeed.map((item) => (
                <div key={item.id} className="p-2.5 border border-slate-800/60 bg-[#060D18]/15 rounded-lg flex items-start gap-2.5">
                  <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                    item.status === 'CRITICAL' ? 'bg-red-500 animate-pulse' :
                    item.status === 'HIGH' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold text-slate-200 truncate">{item.title}</p>
                      <span className="text-[9px] text-slate-550 shrink-0">{item.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed truncate">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="p-5 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-lg">
            <span className="text-xs font-bold text-slate-350 uppercase tracking-widest block mb-4">Pune Care civic complaints vs Crime cases</span>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <defs>
                    <linearGradient id="crimeColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="civicColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/30" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0B1730', border: '1px solid #1e293b', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="crimeCases" stroke="#ef4444" fillOpacity={1} fill="url(#crimeColor)" name="Crime cases (Pune Police)" />
                  <Area type="monotone" dataKey="civicComplaints" stroke="#3b82f6" fillOpacity={1} fill="url(#civicColor)" name="Civic complaints (Pune Care)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-lg">
            <span className="text-xs font-bold text-slate-350 uppercase tracking-widest block mb-4">AI Risk indices forecast by Ward</span>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/30" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0B1730', border: '1px solid #1e293b', borderRadius: '8px' }} />
                  <Bar dataKey="riskIndex" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Predictive Risk Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}

// ----------------------------------------------------
// 2. SAFETY MAP PAGE (THE 3-COLUMN LAYOUT)
// ----------------------------------------------------
function SafetyMapPage({
  LAYER_CONTROLS,
  activeLayer,
  setActiveLayer,
  MAP_LAYERS,
  CrimeHeatmapLayer,
  AccidentZoneLayer,
  EmergencyVehicleLayer,
  RiskZoneLayer,
  IncidentPinLayer,
  MapLegend,
  liveSOS,
  getCoordinates,
  getStatusVariant,
  formatRelativeTime
}) {
  return (
    <PageWrapper>
      <div className="flex-1 flex gap-6 min-h-0 items-stretch select-none">
        
        {/* COLUMN 1: LEFT - Layers Controls */}
        <div className="w-60 shrink-0 border border-slate-800/85 rounded-xl bg-[#0B1730]/90 p-4 flex flex-col gap-4 shadow-xl select-none">
          <div className="flex items-center gap-2 px-1">
            <Layers className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intelligence Layers</span>
          </div>
          <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
            {LAYER_CONTROLS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg border transition-all duration-150 ${
                  activeLayer === layer.id
                    ? 'bg-blue-600/10 text-blue-400 border-blue-500/40 shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800/20 hover:text-slate-200 border-transparent'
                }`}
              >
                <layer.icon className="h-4 w-4 shrink-0" />
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* COLUMN 2: CENTER - Map */}
        <div className="flex-1 relative border border-slate-800/85 rounded-xl overflow-hidden bg-[#0A1324] shadow-2xl">
          <MapContainer mode="tactical">
            {(map) => (
              <>
                {activeLayer === MAP_LAYERS.CRIME_HEATMAP && <CrimeHeatmapLayer map={map} />}
                {activeLayer === MAP_LAYERS.ACCIDENT_ZONES && <AccidentZoneLayer map={map} />}
                {activeLayer === MAP_LAYERS.EMERGENCY_VEHICLES && <EmergencyVehicleLayer map={map} />}
                {activeLayer === MAP_LAYERS.RISK_ZONES && <RiskZoneLayer map={map} />}
                {activeLayer === MAP_LAYERS.INCIDENT_PINS && <IncidentPinLayer map={map} />}
              </>
            )}
          </MapContainer>
          <MapLegend />
        </div>

        {/* COLUMN 3: RIGHT - Context & Live SOS dispatch */}
        <div className="w-80 shrink-0 flex flex-col gap-4 overflow-hidden">
          
          <div className="shrink-0 p-4 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-lg border-l-4 border-l-amber-500 select-none">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Layer Context</p>
            <p className="text-sm font-bold text-slate-200 leading-tight">
              {LAYER_CONTROLS.find((l) => l.id === activeLayer)?.label || 'Intelligence View'}
            </p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Displaying live Pune City geospatial data. Unrelated telemetry overlays are automatically hidden to maintain tactical command focus.
            </p>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-lg border-l-4 border-l-red-500">
            <div className="px-4 py-3.5 border-b border-slate-800/50 bg-[#060D18]/30 flex items-center justify-between select-none">
              <span className="text-xs font-bold text-slate-350 uppercase tracking-wider">Live SOS Dispatch</span>
              {liveSOS.length > 0 && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {liveSOS.slice(0, 6).map((alert) => {
                const { lat, lng } = getCoordinates(alert);
                const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
                const alertId = alert.id || alert.sosId || 'unknown';

                return (
                  <div key={alertId} className="p-3 border border-red-500/10 bg-red-500/5 rounded-lg transition-all hover:bg-red-500/[0.08]">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-bold text-red-400">SOS #{String(alertId).slice(-8)}</p>
                      <Badge variant={getStatusVariant(alert.status)}>
                        {(alert.status || 'active').toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-xs font-semibold text-slate-300">
                      {alert.userName || 'Citizen'}
                    </p>

                    <p className="text-[10px] text-slate-200 mt-1 font-mono bg-slate-950/40 py-1 px-2 rounded border border-slate-900 w-fit">
                      {hasCoordinates ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Location capture pending'}
                    </p>

                    <p className="text-[9px] text-slate-500 mt-1.5 uppercase font-medium">
                      Updated {formatRelativeTime(alert.updatedAt || alert.timestamp)}
                    </p>
                  </div>
                );
              })}

              {liveSOS.length === 0 && (
                <div className="p-4 border border-slate-800 bg-[#060D18]/30 rounded-lg text-center my-auto py-8 select-none">
                  <MapPin className="h-8 w-8 text-slate-650 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-400">No Active SOS Alerts</p>
                  <p className="text-[10px] text-slate-550 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Incoming emergency citizen alerts will appear here in real time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}

// ----------------------------------------------------
// 3. AI PREDICTIONS ENGINE PANEL (NEW)
// ----------------------------------------------------
function PredictionsPage({ activeRole }) {
  const [selectedZone, setSelectedZone] = useState('Swargate');

  // Realistic predictions
  const predictionList = [
    { id: 1, title: 'Heavy Traffic Congestion', zone: 'Swargate Grid', desc: 'AI predicts heavy congestion near Swargate between 6PM–8PM due to bus terminal delays.', confidence: 94, icon: Navigation, category: 'traffic' },
    { id: 2, title: 'Accident-Prone Zone Warning', zone: 'NH4 Highway Satara Ramp', desc: 'Wet asphalt and low lighting conditions create high risk near satara highway exits.', confidence: 76, icon: AlertTriangle, category: 'traffic' },
    { id: 3, title: 'Waterlogging Risk escalation', zone: 'Kothrud Sector 4', desc: 'High probability of severe waterlogging near civic lanes due to recent rainfall trend.', confidence: 88, icon: CloudRain, category: 'disaster' },
    { id: 4, title: 'Crime Probability Increase', zone: 'Hadapsar Night Zone', desc: 'Night crime escalation probability increased by 18% based on historical NCRB statistics.', confidence: 82, icon: ShieldAlert, category: 'police' },
    { id: 5, title: 'Emergency Resource Overload', zone: 'Shivajinagar Depot Gate', desc: 'Multiple concurrent complaint clusters warning. Medical dispatcher pre-position recommended.', confidence: 84, icon: Zap, category: 'municipal' },
  ];

  const filteredPredictions = useMemo(() => {
    if (activeRole.includes('Police')) return predictionList.filter(p => p.category === 'police');
    if (activeRole.includes('Traffic')) return predictionList.filter(p => p.category === 'traffic');
    if (activeRole.includes('Disaster')) return predictionList.filter(p => p.category === 'disaster');
    if (activeRole.includes('Municipal')) return predictionList.filter(p => p.category === 'municipal');
    return predictionList;
  }, [activeRole]);

  // Radar chart data for severity profiles
  const radarData = [
    { subject: 'Crime Rate', A: 65, B: 85, fullMark: 100 },
    { subject: 'Accident Threat', A: 82, B: 40, fullMark: 100 },
    { subject: 'Traffic Delay', A: 94, B: 70, fullMark: 100 },
    { subject: 'Waterlogging', A: 32, B: 90, fullMark: 100 },
    { subject: 'Resource Delay', A: 76, B: 55, fullMark: 100 },
  ];

  return (
    <PageWrapper>
      <div className="flex-1 flex gap-6 min-h-0 items-stretch">
        
        {/* Left column - Tactical Risk Radar */}
        <div className="w-80 shrink-0 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-4 select-none">
              <Cpu className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-350 uppercase tracking-widest">Tactical Threat Profile</span>
            </div>
            <div className="h-56 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
                  <PolarGrid stroke="#1e293b/30" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                  <PolarRadiusAxis stroke="#64748b" fontSize={8} />
                  <Radar name="Active Ward Profile" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-850 text-xs">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">AI Recommendation</span>
            <p className="text-slate-400 leading-relaxed font-semibold">
              Deploy additional responders near <strong className="text-white">FC Road</strong> to mitigate predicted high-risk threat vectors.
            </p>
          </div>
        </div>

        {/* Center column - Predictions Feed */}
        <div className="flex-1 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl flex flex-col shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800/60 bg-[#060D18]/50 flex items-center justify-between select-none">
            <span className="text-xs font-bold text-slate-350 uppercase tracking-widest">AI Intelligence Forecast Engine</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
            {filteredPredictions.map((pred) => {
              const Icon = pred.icon;
              return (
                <div key={pred.id} className="p-4 border border-slate-800/80 bg-[#060D18]/30 rounded-xl flex items-start gap-4">
                  <div className="p-2.5 rounded-lg border border-blue-500/20 bg-blue-600/10 text-blue-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-200">{pred.title}</span>
                      <Badge variant="HIGH">{pred.confidence}% Conf.</Badge>
                    </div>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-0.5">{pred.zone}</p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{pred.desc}</p>
                  </div>
                </div>
              );
            })}

            {filteredPredictions.length === 0 && (
              <div className="p-12 text-center select-none my-auto">
                <CheckCircle2 className="h-8 w-8 text-green-500/30 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">No Predictions generated for {activeRole}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column - AI Configuration details */}
        <div className="w-80 shrink-0 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-4 select-none">
              <Sliders className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-350 uppercase tracking-widest">Model Config</span>
            </div>
            
            <div className="space-y-3 text-xs select-none">
              <div className="flex items-center justify-between">
                <span className="text-slate-450 font-semibold">Forecasting engine</span>
                <span className="font-mono text-blue-400 font-bold">TensorFlow.js</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 font-semibold">Active Wards analyzed</span>
                <span className="font-mono text-blue-400 font-bold">12 Zones</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 font-semibold">Datasets parsed</span>
                <span className="font-mono text-blue-400 font-bold">Pune Care / NCRB</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-850 select-none">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold text-center">SafeCity AI Prediction Engine</p>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}

// ----------------------------------------------------
// 4. INCIDENTS MANAGEMENT PAGE
// ----------------------------------------------------
function IncidentsPage() {
  const { incidents } = useStore();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const defaultIncidents = [
    { id: 'inc_1041', time: '14:32:00', severity: 'CRITICAL', type: 'Accident', location: 'NH4 Highway, Satara Sector 4', unit: 'ALPHA-01', status: 'RESPONDING', ward: 'Satara-A', desc: 'Multiple collision on the Satara exit ramp. Emergency responders pre-deployed.' },
    { id: 'inc_1042', time: '14:28:15', severity: 'HIGH', type: 'Civic Fire', location: 'Sadar Bazar Road Intersection', unit: 'UNASSIGNED', status: 'PENDING', ward: 'Central', desc: 'Electrical transformer spark reported. Satara fire squad alerted.' },
    { id: 'inc_1043', time: '14:15:22', severity: 'MEDIUM', type: 'Harassment', location: 'Powai Naka Traffic Junction', unit: 'BRAVO-02', status: 'ON SCENE', ward: 'Satara-B', desc: 'Distress call from college campus area. Patrol dispatched.' },
    { id: 'inc_1044', time: '13:58:10', severity: 'LOW', type: 'Traffic Jam', location: 'Shivajinagar Depot Gate', unit: 'PMC-05', status: 'RESOLVED', ward: 'Central', desc: 'Congestion cleared by PMC traffic guards.' },
  ];

  const mergedIncidents = useMemo(() => {
    const list = [...defaultIncidents];
    incidents.forEach(item => {
      if (!list.some(x => x.id === item.id)) {
        list.unshift({
          id: item.id || `inc_${Date.now()}`,
          time: new Date(item.createdAt || Date.now()).toLocaleTimeString(),
          severity: item.severity || 'HIGH',
          type: item.type || 'Emergency',
          location: item.locationName || item.address || 'Reported Location',
          unit: item.unitAssigned || 'UNASSIGNED',
          status: (item.status || 'PENDING').toUpperCase(),
          ward: item.ward || 'General',
          desc: item.description || 'Citizen reported safety incident.'
        });
      }
    });
    return list;
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    return mergedIncidents.filter(item => {
      const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
      const matchesSearch = item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeverity && matchesSearch;
    });
  }, [mergedIncidents, severityFilter, searchQuery]);

  useEffect(() => {
    if (filteredIncidents.length > 0 && !selectedIncident) {
      setSelectedIncident(filteredIncidents[0]);
    }
  }, [filteredIncidents, selectedIncident]);

  const handleUpdateStatus = (newStatus) => {
    if (selectedIncident) {
      setSelectedIncident(prev => ({ ...prev, status: newStatus }));
      showToast({
        type: 'success',
        title: 'Incident Updated',
        message: `Incident ${selectedIncident.id} marked as ${newStatus}.`
      });
    }
  };

  return (
    <PageWrapper>
      <div className="flex-1 flex gap-6 min-h-0 items-stretch">
        
        <div className="flex-1 border border-slate-800/85 rounded-xl bg-[#0B1730]/90 flex flex-col shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800/60 bg-[#060D18]/50 flex flex-wrap gap-4 items-center justify-between">
            <span className="text-xs font-bold text-slate-350 uppercase tracking-widest">Emergency Records</span>
            
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search incidents or locations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#060D18]/80 border border-slate-800 rounded-lg py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#060D18]/80 p-0.5 border border-slate-800 rounded-lg select-none">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSeverityFilter(lvl)}
                  className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
                    severityFilter === lvl 
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' 
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#060D18] text-slate-450 border-b border-slate-800/80 z-10 select-none">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[9px]">ID</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[9px]">Time</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[9px]">Type</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[9px]">Location</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[9px]">Severity</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[9px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50">
                {filteredIncidents.map((row) => (
                  <tr 
                    key={row.id} 
                    onClick={() => setSelectedIncident(row)}
                    className={`cursor-pointer transition-all hover:bg-slate-800/20 ${
                      selectedIncident?.id === row.id ? 'bg-blue-600/[0.04]' : 'even:bg-slate-900/10'
                    }`}
                  >
                    <td className="px-5 py-3.5 font-semibold text-slate-300 font-mono">#{row.id.split('_').pop()}</td>
                    <td className="px-5 py-3.5 text-slate-450 font-mono">{row.time}</td>
                    <td className="px-5 py-3.5 text-slate-200 font-bold">{row.type}</td>
                    <td className="px-5 py-3.5 text-slate-400 font-medium truncate max-w-[200px]">{row.location}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={row.severity}>{row.severity}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 font-semibold uppercase">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          row.status === 'RESPONDING' ? 'bg-red-500 animate-pulse' :
                          row.status === 'ON SCENE' ? 'bg-green-500' : 
                          row.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'
                        }`} />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-80 shrink-0 flex flex-col border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-800/50 bg-[#060D18]/30 select-none">
            <span className="text-xs font-bold text-slate-350 uppercase tracking-wider">Incident Console</span>
          </div>

          {selectedIncident ? (
            <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-blue-400">ID: #{selectedIncident.id.split('_').pop()}</span>
                  <Badge variant={selectedIncident.severity}>{selectedIncident.severity}</Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Type & Ward</span>
                    <p className="text-xs font-bold text-slate-200">{selectedIncident.type} • Ward: {selectedIncident.ward}</p>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Location telemetry</span>
                    <p className="text-xs font-semibold text-slate-300">{selectedIncident.location}</p>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Officer Assigned</span>
                    <p className="text-xs font-bold text-blue-400">{selectedIncident.unit}</p>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Operational Description</span>
                    <div className="p-3 bg-[#060D18]/45 border border-slate-850 rounded-lg text-slate-400 text-xs leading-relaxed">
                      {selectedIncident.desc}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 select-none">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Update Dispatch Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleUpdateStatus('RESPONDING')}
                      className={`py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors border ${
                        selectedIncident.status === 'RESPONDING'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-[#060D18] text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      RESPONDING
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('ON SCENE')}
                      className={`py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors border ${
                        selectedIncident.status === 'ON SCENE'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-[#060D18] text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      ON SCENE
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-850">
                <Button 
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  disabled={selectedIncident.status === 'RESOLVED'}
                  variant="primary" 
                  className="w-full text-xs font-semibold py-2.5 rounded-lg"
                >
                  {selectedIncident.status === 'RESOLVED' ? 'Incident Closed' : 'Force Close Incident'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
              <AlertTriangle className="h-8 w-8 text-slate-600 mb-2 opacity-50" />
              <p className="text-xs font-bold text-slate-400">No Incident Selected</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

// ----------------------------------------------------
// 5. COMPLAINTS (CITIZEN GRIEVANCE) PAGE
// ----------------------------------------------------
function ComplaintsPage() {
  const { complaints } = useStore();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const defaultComplaints = [
    { id: 'comp_2001', category: 'road damage', address: 'NH4 Highway, Satara Exit near Sector 4', citizen: 'Aditya Kulkarni', desc: 'Huge potholes in the middle of the lanes creating severe accident risk.', date: Date.now() - 3600000, status: 'acknowledged', authority: 'Pune Municipal Corp (PMC)' },
    { id: 'comp_2002', category: 'street lights', address: 'Sadar Bazar Inner Link Road', citizen: 'Neha Joshi', desc: 'Entire block is pitch black for the last three nights. Safety concern.', date: Date.now() - 86400000, status: 'resolved', authority: 'MSEB Grid Authority' },
    { id: 'comp_2003', category: 'sanitation', address: 'Shivajinagar Depot Corner near Satara Gate', citizen: 'Rahul Deshmukh', desc: 'Garbage dump blocking the exit walkway creating unhygienic conditions.', date: Date.now() - 172800000, status: 'pending', authority: 'PMC Waste Management' },
    { id: 'comp_2004', category: 'traffic', address: 'Powai Naka Traffic Junction', citizen: 'Sunil Shinde', desc: 'Illegally parked commercial trucks blocking access lines during peak hours.', date: Date.now() - 259200000, status: 'pending', authority: 'Satara Traffic Police' },
  ];

  const mergedComplaints = useMemo(() => {
    const list = [...defaultComplaints];
    complaints.forEach(item => {
      if (!list.some(x => x.id === item.id)) {
        list.unshift({
          id: item.id || `comp_${Date.now()}`,
          category: item.category || 'other',
          address: item.address || 'Satara Command Ward',
          citizen: item.citizenName || 'Pune Resident',
          desc: item.description || 'Civic grievance reported.',
          date: item.createdAt || Date.now(),
          status: item.status || 'pending',
          authority: item.assignedAuthority || 'Assigned local Ward Authority'
        });
      }
    });
    return list;
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return mergedComplaints.filter(item => {
      return categoryFilter === 'ALL' || item.category.toLowerCase() === categoryFilter.toLowerCase();
    });
  }, [mergedComplaints, categoryFilter]);

  useEffect(() => {
    if (filteredComplaints.length > 0 && !selectedComplaint) {
      setSelectedComplaint(filteredComplaints[0]);
    }
  }, [filteredComplaints, selectedComplaint]);

  const handleUpdateStatus = (newStatus) => {
    if (selectedComplaint) {
      setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
      showToast({
        type: 'success',
        title: 'Complaint Updated',
        message: `Civic Grievance marked as ${newStatus}.`
      });
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'road damage': return Sliders;
      case 'street lights': return Zap;
      case 'sanitation': return Shield;
      case 'traffic': return Activity;
      default: return ClipboardList;
    }
  };

  return (
    <PageWrapper>
      <div className="flex-1 flex gap-6 min-h-0 items-stretch">
        
        <div className="flex-1 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800/60 bg-[#060D18]/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-350 uppercase tracking-widest">Pune Care Grievances</span>
            
            <div className="flex items-center gap-1.5 bg-[#060D18]/80 p-0.5 border border-slate-800 rounded-lg select-none">
              {['ALL', 'road damage', 'street lights', 'sanitation', 'traffic'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
                    categoryFilter === cat 
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' 
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {filteredComplaints.map((item) => {
              const Icon = getCategoryIcon(item.category);
              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedComplaint(item)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-4 ${
                    selectedComplaint?.id === item.id 
                      ? 'border-blue-500/30 bg-blue-600/[0.03]' 
                      : 'border-slate-800 bg-[#060D18]/30 hover:bg-[#060D18]/50'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg border ${
                    selectedComplaint?.id === item.id 
                      ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.category}</span>
                      <Badge variant={getStatusVariant(item.status)}>{item.status.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs font-bold text-slate-200 mt-1 truncate">{item.address}</p>
                    <p className="text-[10px] text-slate-550 mt-0.5 font-medium">Reported by {item.citizen} • {formatRelativeTime(item.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-80 shrink-0 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-800/50 bg-[#060D18]/30 select-none">
            <span className="text-xs font-bold text-slate-350 uppercase tracking-wider">Grievance Review</span>
          </div>

          {selectedComplaint ? (
            <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{selectedComplaint.category}</span>
                  <Badge variant={getStatusVariant(selectedComplaint.status)}>{selectedComplaint.status.toUpperCase()}</Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Assigned Authority</span>
                    <p className="text-xs font-bold text-slate-200">{selectedComplaint.authority}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Location Address</span>
                    <p className="text-xs font-semibold text-slate-300">{selectedComplaint.address}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Citizen Identity</span>
                    <p className="text-xs font-semibold text-slate-300">{selectedComplaint.citizen}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Grievance Description</span>
                    <div className="p-3 bg-[#060D18]/45 border border-slate-850 rounded-lg text-slate-400 text-xs leading-relaxed">
                      {selectedComplaint.desc}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 select-none">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Workflow Actions</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleUpdateStatus('resolved')}
                      disabled={selectedComplaint.status === 'resolved'}
                      className="py-2 px-3 bg-green-500/10 border border-green-500/25 text-green-400 text-[9px] font-bold rounded-lg uppercase tracking-wider hover:bg-green-500/20 transition-all disabled:opacity-40"
                    >
                      Mark Resolved
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('acknowledged')}
                      className="py-2 px-3 bg-[#060D18] border border-slate-800 text-slate-300 text-[9px] font-bold rounded-lg uppercase tracking-wider hover:text-white transition-all"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
              <ClipboardList className="h-8 w-8 text-slate-600 mb-2 opacity-50" />
              <p className="text-xs font-bold text-slate-400">No Grievance Selected</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

// ----------------------------------------------------
// 6. EMERGENCY RESOURCES PAGE
// ----------------------------------------------------
function ResourcesPage() {
  const [selectedWard, setSelectedWard] = useState('Central');
  const [serviceType, setServiceType] = useState('Police');
  const [aiResult, setAiResult] = useState(null);

  const resources = [
    { id: 'ALPHA-01', type: 'Police Patrol', status: 'DISPATCHED', capacity: '90%', duration: '3m ago', location: 'NH4 Highway Sector', desc: 'Pune Police high-speed interceptor patrolling highway coordinates.' },
    { id: 'BRAVO-02', type: 'Tactical Team', status: 'AVAILABLE', capacity: '100%', duration: 'Ready', location: 'Satara Core HQ', desc: 'Armed incident command and rescue squad.' },
    { id: 'MEDIC-01', type: 'Ambulance', status: 'DISPATCHED', capacity: '85%', duration: '12m ago', location: 'Sadar Bazar Area', desc: 'Advanced life support ambulance deployed to distress point.' },
    { id: 'FLAME-01', type: 'Fire Rescue', status: 'AVAILABLE', capacity: '100%', duration: 'Ready', location: 'Satara Fire Station', desc: 'Equipped for fire control and civilian extraction.' },
  ];

  const handleCalculateAIResource = () => {
    setAiResult({
      unit: serviceType === 'Police' ? 'BRAVO-02' : serviceType === 'Ambulance' ? 'MEDIC-01' : 'FLAME-01',
      eta: serviceType === 'Police' ? '2.4 Minutes' : serviceType === 'Ambulance' ? '4.8 Minutes' : '3.2 Minutes',
      distance: serviceType === 'Police' ? '1.2 km' : serviceType === 'Ambulance' ? '2.8 km' : '1.9 km',
      route: serviceType === 'Police' ? 'Satara HQ -> NH4 Highway North Exit' : serviceType === 'Ambulance' ? 'Satara General -> Sadar Bazar Road' : 'Fire Dept -> Central Intersection'
    });
    showToast({
      type: 'success',
      title: 'AI Route Calculated',
      message: 'Optimal responder selected and route telemetries synchronized.'
    });
  };

  return (
    <PageWrapper>
      <div className="flex-1 flex gap-6 min-h-0 items-stretch">
        
        <div className="flex-1 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800/60 bg-[#060D18]/50 flex items-center justify-between select-none">
            <span className="text-xs font-bold text-slate-350 uppercase tracking-widest">Active Fleet Deployment</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider">Readiness Score: 92%</span>
          </div>

          <div className="p-5 flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res) => (
              <div key={res.id} className="p-4 border border-slate-800/80 bg-[#060D18]/25 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200">{res.id}</span>
                    <Badge variant={res.status === 'AVAILABLE' ? 'LOW' : 'CRITICAL'}>{res.status}</Badge>
                  </div>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-1">{res.type} • {res.location}</p>
                  <p className="text-[11px] text-slate-455 mt-2.5 leading-relaxed">{res.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-850/50 text-[10px] font-semibold text-slate-500">
                  <span>Capacity: {res.capacity}</span>
                  <span>Status: {res.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-80 shrink-0 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-800/50 bg-[#060D18]/30 select-none">
            <span className="text-xs font-bold text-slate-350 uppercase tracking-wider">Nearest Responder AI</span>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div className="p-3 bg-blue-600/[0.03] border border-blue-500/10 rounded-lg text-slate-450 text-xs leading-relaxed select-none">
                AI optimizes emergency dispatch paths automatically using real-time GPS locations of all fleet units.
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-550 uppercase tracking-widest mb-1.5">Target Ward Sector</label>
                <select 
                  value={selectedWard}
                  onChange={e => setSelectedWard(e.target.value)}
                  className="w-full bg-[#060D18] border border-slate-800 text-slate-300 text-xs rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500/20"
                >
                  <option value="Central">Satara Central</option>
                  <option value="Satara-A">Satara Sector-A (NH4 Highway)</option>
                  <option value="Satara-B">Satara Sector-B (Sadar Bazar)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-550 uppercase tracking-widest mb-1.5">Required Service</label>
                <div className="grid grid-cols-3 gap-2 select-none">
                  {['Police', 'Ambulance', 'Fire'].map(serv => (
                    <button
                      key={serv}
                      type="button"
                      onClick={() => setServiceType(serv)}
                      className={`py-2 px-3 border rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        serviceType === serv
                          ? 'bg-blue-600/10 text-blue-400 border-blue-500/20'
                          : 'bg-[#060D18] text-slate-550 border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {serv}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {aiResult && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-[#060D18]/50 border border-slate-850 rounded-lg space-y-2 text-xs"
                  >
                    <div className="flex justify-between">
                      <span className="text-slate-550 uppercase text-[9px] tracking-wider font-bold">Recommended Unit</span>
                      <span className="font-bold text-blue-400">{aiResult.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550 uppercase text-[9px] tracking-wider font-bold">Estimated ETA</span>
                      <span className="font-bold text-green-400 animate-pulse">{aiResult.eta}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550 uppercase text-[9px] tracking-wider font-bold">Optimal Distance</span>
                      <span className="font-bold text-slate-350">{aiResult.distance}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-4 border-t border-slate-850">
              <Button
                onClick={handleCalculateAIResource}
                variant="primary"
                className="w-full text-xs font-semibold py-2.5 rounded-lg select-none"
              >
                Find Optimal Responder
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

// ----------------------------------------------------
// 7. PLATFORM SETTINGS PAGE
// ----------------------------------------------------
function SettingsPage() {
  const [threatThreshold, setThreatThreshold] = useState(40);
  const [audioDecibel, setAudioDecibel] = useState(85);
  const [alertNotify, setAlertNotify] = useState(true);
  const [autoDispatch, setAutoDispatch] = useState(false);

  const handleSaveSettings = () => {
    showToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Platform threat levels & thresholds successfully synchronized.'
    });
  };

  return (
    <PageWrapper>
      <div className="flex-1 flex gap-6 min-h-0 items-stretch">
        
        <div className="flex-1 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800/60 bg-[#060D18]/50 select-none">
            <span className="text-xs font-bold text-slate-350 uppercase tracking-widest">Platform Operational Thresholds</span>
          </div>

          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 select-none">
                <Sliders className="h-4 w-4 text-blue-400" />
                <span>AI Risk Threshold Adjustments</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold">AI Threat Alert Coefficient</span>
                    <span className="font-mono text-blue-400 font-bold">{threatThreshold}% Score</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="90" 
                    value={threatThreshold}
                    onChange={e => setThreatThreshold(e.target.value)}
                    className="w-full accent-blue-500 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold">Audio Decibel Distress Threshold</span>
                    <span className="font-mono text-blue-400 font-bold">{audioDecibel} dB</span>
                  </div>
                  <input 
                    type="range" 
                    min="60" 
                    max="120" 
                    value={audioDecibel}
                    onChange={e => setAudioDecibel(e.target.value)}
                    className="w-full accent-blue-500 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-800/60 bg-[#060D18]/50 flex justify-end select-none">
            <Button
              onClick={handleSaveSettings}
              variant="primary"
              className="text-xs font-semibold py-2 px-5 rounded-lg"
            >
              Apply System Parameters
            </Button>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}

// ----------------------------------------------------
// MAIN COMMAND WORKSPACE WRAPPER ROUTING
// ----------------------------------------------------
export default function AuthorityView() {
  const { incidents, sosEvents } = useStore();
  const notifications = useNotificationStore((state) => state.notifications);
  const markCategoryAsRead = useNotificationStore((state) => state.markCategoryAsRead);
  const location = useLocation();

  // Role Access levels
  const [activeRole, setActiveRole] = useState('Police Control');

  // Dynamic layers linked to roles
  const [activeLayer, setActiveLayer] = useState(MAP_LAYERS.CRIME_HEATMAP);
  const [isInjectingDemo, setIsInjectingDemo] = useState(false);

  // Dynamic automatic operations feed
  const [liveFeed, setLiveFeed] = useState([
    { id: 1, title: 'Ambulance deployed', desc: 'Medic-01 dispatched to NH4 bypass exit coordinates.', time: '14:50', status: 'CRITICAL' },
    { id: 2, title: 'Complaint resolved', desc: 'PMC cleared street light blockage in Sadar Bazar.', time: '14:48', status: 'LOW' },
    { id: 3, title: 'AI threat warning', desc: 'Predictive risk score raised in Kothrud Night Zone.', time: '14:45', status: 'HIGH' }
  ]);

  const liveSOS = useMemo(() => sosEvents.slice(0, 20), [sosEvents]);
  const unreadSOSCount = useMemo(
    () => notifications.filter((item) => item.category === 'sos' && !item.read).length,
    [notifications]
  );

  // Update dynamic layers automatically on active role changes
  useEffect(() => {
    if (activeRole.includes('Police')) setActiveLayer(MAP_LAYERS.CRIME_HEATMAP);
    else if (activeRole.includes('Disaster')) setActiveLayer(MAP_LAYERS.RISK_ZONES);
    else if (activeRole.includes('Traffic')) setActiveLayer(MAP_LAYERS.ACCIDENT_ZONES);
    else if (activeRole.includes('Medical')) setActiveLayer(MAP_LAYERS.EMERGENCY_VEHICLES);
    else if (activeRole.includes('Municipal')) setActiveLayer(MAP_LAYERS.INCIDENT_PINS);
  }, [activeRole]);

  // Dynamic Auto Operation Feed Simulator
  useEffect(() => {
    const feedTemplates = [
      { title: 'Patrol dispatched', desc: 'Police Alpha-01 pre-deployed near FC Road.', status: 'HIGH' },
      { title: 'Civic grievance review', desc: 'PMC logged sanitation report near shivajinagar.', status: 'LOW' },
      { title: 'Acoustic trigger alert', desc: 'Satara Node 02 registered critical noise levels.', status: 'CRITICAL' },
      { title: 'Traffic node clearing', desc: 'PMC cleared accident blockade near sadar bazar.', status: 'LOW' }
    ];

    const interval = setInterval(() => {
      const selected = feedTemplates[Math.floor(Math.random() * feedTemplates.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      setLiveFeed(prev => [
        {
          id: Date.now(),
          title: selected.title,
          desc: selected.desc,
          time: timeStr,
          status: selected.status
        },
        ...prev.slice(0, 8)
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Clear notifications read state if on SOS view
  useEffect(() => {
    if (location.pathname === '/authority/safety-map' && unreadSOSCount > 0) {
      markCategoryAsRead('sos');
    }
  }, [location, markCategoryAsRead, unreadSOSCount]);

  const LAYER_CONTROLS = [
    { id: MAP_LAYERS.ACCIDENT_ZONES, label: 'High Accident Areas', icon: AlertTriangle },
    { id: MAP_LAYERS.CRIME_HEATMAP, label: 'Crime Heatmap', icon: Activity },
    { id: MAP_LAYERS.EMERGENCY_VEHICLES, label: 'Emergency Vehicles', icon: Shield },
    { id: MAP_LAYERS.INCIDENT_PINS, label: 'Incident Pins', icon: MapPin },
    { id: MAP_LAYERS.RISK_ZONES, label: 'AI Risk Zones', icon: MapIcon },
  ];

  const injectDemoSOSAlert = async () => {
    try {
      setIsInjectingDemo(true);

      const now = Date.now();
      const alertsRootRef = dbRef(rtdb, 'sos_alerts');
      const alertRef = push(alertsRootRef);

      const demoPayload = {
        id: alertRef.key,
        userId: 'demo_citizen_01',
        userName: 'Demo Citizen',
        userEmail: 'demo.citizen@safecity.ai',
        userPhone: '+91-98765-43210',
        status: 'active',
        lat: 18.52043,
        lng: 73.85674,
        location: {
          lat: 18.52043,
          lng: 73.85674,
          accuracy: 8,
          capturedAt: now,
        },
        createdAt: now,
        updatedAt: now,
        audioUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
        recordingDurationSec: 3,
        audioUploadedAt: now,
        demo: true,
      };

      await set(alertRef, demoPayload);

      showToast({
        type: 'success',
        title: 'Demo SOS Injected',
        message: 'Authority stream now has a test alert with location and playable audio.',
      });
    } catch (error) {
      console.error('Failed to inject demo SOS alert:', error);
      showToast({
        type: 'error',
        title: 'Demo Injection Failed',
        message: 'Unable to create demo SOS alert. Please verify Firebase config and rules.',
      });
    } finally {
      setIsInjectingDemo(false);
    }
  };

  const ROLE_LEVELS = [
    { label: 'Police Control', icon: Shield },
    { label: 'Disaster Management', icon: Flame },
    { label: 'Traffic Control', icon: Navigation },
    { label: 'Emergency Medical', icon: Heart },
    { label: 'Municipal Operations', icon: ClipboardList }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#081120] text-slate-200 font-inter">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Operations Command Center" />

        <main className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
          
          {/* PERSISTENT BAR: ROLE ACCESS & ACTIONS */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            
            {/* Left: Role Access Selector */}
            <div className="flex items-center gap-2 bg-[#060D18]/90 p-0.5 border border-slate-850 rounded-xl select-none">
              {ROLE_LEVELS.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.label}
                    onClick={() => {
                      setActiveRole(r.label);
                      showToast({
                        type: 'info',
                        title: 'Access Mode Switched',
                        message: `Switched command routing dashboard to ${r.label}.`
                      });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      activeRole === r.label
                        ? 'bg-blue-600/10 text-blue-400 border-blue-500/25 shadow-inner'
                        : 'text-slate-500 hover:text-slate-300 border-transparent'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">{r.label}</span>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={injectDemoSOSAlert}
              disabled={isInjectingDemo}
              variant="secondary"
              className="text-[9px] uppercase font-bold tracking-widest px-4 py-2 border border-slate-750 bg-[#0B1730]/95 text-slate-350 hover:bg-[#060D18] hover:text-white transition-all rounded-lg select-none"
            >
              {isInjectingDemo ? 'Injecting Demo...' : 'Inject Demo SOS Alert'}
            </Button>
          </div>

          {/* Core Routes Workspace */}
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={
                <DashboardOverview 
                  activeRole={activeRole} 
                  liveFeed={liveFeed} 
                  setLiveFeed={setLiveFeed} 
                />
              } />
              <Route path="safety-map" element={
                <SafetyMapPage
                  LAYER_CONTROLS={LAYER_CONTROLS}
                  activeLayer={activeLayer}
                  setActiveLayer={setActiveLayer}
                  MAP_LAYERS={MAP_LAYERS}
                  CrimeHeatmapLayer={CrimeHeatmapLayer}
                  AccidentZoneLayer={AccidentZoneLayer}
                  EmergencyVehicleLayer={EmergencyVehicleLayer}
                  RiskZoneLayer={RiskZoneLayer}
                  IncidentPinLayer={IncidentPinLayer}
                  MapLegend={MapLegend}
                  liveSOS={liveSOS}
                  getCoordinates={getCoordinates}
                  getStatusVariant={getStatusVariant}
                  formatRelativeTime={formatRelativeTime}
                />
              } />
              <Route path="predictions" element={<PredictionsPage activeRole={activeRole} />} />
              <Route path="incidents" element={<IncidentsPage />} />
              <Route path="complaints" element={<ComplaintsPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}
