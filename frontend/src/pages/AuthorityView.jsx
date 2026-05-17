import { useEffect, useMemo, useState, useRef } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { playTacticalBuzzer, stopTacticalBuzzer } from '@/utils/sound';
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
import useMapStore from '@/store/useMapStore';
import useNotificationStore from '@/store/useNotificationStore';
import { MAP_LAYERS } from '@/constants/mapConfig';
import { rtdb } from '@/services/firebase';
import complaintService from '@/services/complaintService';

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
// REAL-TIME CITIZEN EMERGENCY OVERLAY FOR MAP
// ----------------------------------------------------
function EmergencySOSOverlay({ map }) {
  const { activeAlert } = useStore();
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const rippleRef = useRef(null);
  const rippleIntervalRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google) return;

    if (!activeAlert) {
      if (markerRef.current) markerRef.current.setMap(null);
      if (circleRef.current) circleRef.current.setMap(null);
      if (rippleRef.current) rippleRef.current.setMap(null);
      if (rippleIntervalRef.current) clearInterval(rippleIntervalRef.current);
      return;
    }

    const pos = { lat: activeAlert.lat, lng: activeAlert.lng };

    // Pulse Red Marker
    markerRef.current = new window.google.maps.Marker({
      position: pos,
      map,
      title: `🚨 CRITICAL SOS: ${activeAlert.userName || 'Citizen'}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ef4444',
        strokeOpacity: 0.4,
        strokeWeight: 8,
        scale: 12,
      },
    });

    // Temporary Red Radius Zone (250 meters)
    circleRef.current = new window.google.maps.Circle({
      map,
      center: pos,
      radius: 250,
      fillColor: '#ef4444',
      fillOpacity: 0.12,
      strokeColor: '#ef4444',
      strokeOpacity: 0.4,
      strokeWeight: 1.5,
    });

    // Expanding Sonar Sonar Radar Ripple Beacon Animation
    let rippleRadius = 20;
    rippleRef.current = new window.google.maps.Circle({
      map,
      center: pos,
      radius: rippleRadius,
      fillColor: '#ef4444',
      fillOpacity: 0.25,
      strokeColor: '#ef4444',
      strokeOpacity: 0.6,
      strokeWeight: 2,
    });

    rippleIntervalRef.current = setInterval(() => {
      rippleRadius += 10;
      if (rippleRadius > 350) {
        rippleRadius = 20;
      }
      if (rippleRef.current) {
        rippleRef.current.setRadius(rippleRadius);
        rippleRef.current.setOptions({
          fillOpacity: 0.25 * (1 - rippleRadius / 350),
          strokeOpacity: 0.6 * (1 - rippleRadius / 350),
        });
      }
    }, 45);

    // Dynamic marker pulsing w/ scale
    let pulseToggle = true;
    const pulseTimer = setInterval(() => {
      if (markerRef.current) {
        markerRef.current.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ef4444',
          strokeOpacity: pulseToggle ? 0.6 : 0.2,
          strokeWeight: pulseToggle ? 14 : 6,
          scale: 12,
        });
        pulseToggle = !pulseToggle;
      }
    }, 400);

    return () => {
      if (markerRef.current) markerRef.current.setMap(null);
      if (circleRef.current) circleRef.current.setMap(null);
      if (rippleRef.current) rippleRef.current.setMap(null);
      if (rippleIntervalRef.current) clearInterval(rippleIntervalRef.current);
      clearInterval(pulseTimer);
    };
  }, [map, activeAlert]);

  return null;
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
                
                {/* Real-time pulsing alert overlay */}
                <EmergencySOSOverlay map={map} />
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
  const { complaints, setComplaints } = useStore();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dispatcher action inputs
  const [actionNote, setActionNote] = useState('');
  const [actionDept, setActionDept] = useState('PMC Road Wing');
  const [actionETA, setActionETA] = useState('12 Hours');

  useEffect(() => {
    if (selectedComplaint) {
      setActionNote('');
      const cat = String(selectedComplaint.category).toLowerCase();
      if (cat.includes('road')) {
        setActionDept('PMC Road Wing');
        setActionETA('12 Hours');
      } else if (cat.includes('light')) {
        setActionDept('MSEB Grid Team');
        setActionETA('6 Hours');
      } else if (cat.includes('sanit') || cat.includes('waste') || cat.includes('garbage')) {
        setActionDept('PMC Sanitation Dept.');
        setActionETA('24 Hours');
      } else if (cat.includes('traffic')) {
        setActionDept('Pune Traffic Police');
        setActionETA('2 Hours');
      } else {
        setActionDept('Municipal Core Wing');
        setActionETA('12 Hours');
      }
    }
  }, [selectedComplaint]);

  // Dynamic fetch of complaints on mount
  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await complaintService.getAll();
        if (active) {
          const list = res.success ? res.data : res;
          if (Array.isArray(list)) {
            setComplaints(list);
          }
        }
      } catch (err) {
        console.error('Failed to fetch complaints in dashboard:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [setComplaints]);

  const mergedComplaints = useMemo(() => {
    const list = [];
    
    // Process backend complaints
    complaints.forEach(item => {
      list.push({
        id: item.complaintId || item.id || `COMP-${Date.now()}`,
        category: item.category || 'other',
        address: item.address || item.area || 'Pune Command Ward',
        citizen: item.citizenName || item.citizen || item.filed_by || 'Pune Citizen',
        desc: item.description || 'Civic grievance reported via citizen dashboard.',
        date: item.createdAt || Date.now(),
        status: item.status || 'Submitted',
        authority: item.assignedDepartment || 'PMC Command Center',
        imageUrl: item.imageUrl || '',
        severity: item.severity || 'MEDIUM',
        eta: item.eta || '',
        workflowHistory: item.workflowHistory || [],
        rawItem: item // Keep the raw item reference for actions
      });
    });

    // Sort by Date (newest first)
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return mergedComplaints.filter(item => {
      const matchesCategory = categoryFilter === 'ALL' || item.category.toLowerCase().includes(categoryFilter.toLowerCase());
      const matchesSearch = searchQuery === '' || 
        item.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [mergedComplaints, categoryFilter, searchQuery]);

  useEffect(() => {
    if (filteredComplaints.length > 0 && (!selectedComplaint || !filteredComplaints.some(x => x.id === selectedComplaint.id))) {
      setSelectedComplaint(filteredComplaints[0]);
    }
  }, [filteredComplaints, selectedComplaint]);

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedComplaint) return;
    try {
      // Map display labels to backend database standard values
      let apiStatus = newStatus;
      if (newStatus === 'resolved') apiStatus = 'Resolved';
      if (newStatus === 'in_progress') apiStatus = 'In Progress';
      if (newStatus === 'pending') apiStatus = 'Pending Review';

      const finalNote = actionNote.trim() || `${apiStatus} transition processed.`;
      
      const payload = {
        status: apiStatus,
        note: finalNote,
        assignedDepartment: actionDept,
        eta: apiStatus === 'Resolved' ? 'Completed' : actionETA,
        updatedBy: 'Pune Command Center'
      };

      const res = await complaintService.updateStatus(selectedComplaint.id, payload);
      const updatedItem = res.success ? res.data : res;

      // Snappy optimistically updated local page UI state
      setSelectedComplaint(prev => ({ 
        ...prev, 
        status: apiStatus,
        authority: payload.assignedDepartment,
        eta: payload.eta,
        workflowHistory: updatedItem?.workflowHistory || prev.workflowHistory
      }));
      
      // Update global store directly too as double backup
      const store = useStore.getState();
      store.updateComplaintStatus(selectedComplaint.id, apiStatus);

      // Force refresh of backend complaints list
      const freshList = await complaintService.getAll();
      const list = freshList.success ? freshList.data : freshList;
      if (Array.isArray(list)) {
        setComplaints(list);
      }

      showToast({
        type: 'success',
        title: 'Status Transitioned',
        message: `Civic Grievance ${selectedComplaint.id} marked as ${apiStatus}.`
      });
      
      // Clear action note
      setActionNote('');
    } catch (err) {
      console.error('Failed to transition status:', err);
      showToast({
        type: 'error',
        title: 'Transition Failed',
        message: 'Database connection failed or permission denied.'
      });
    }
  };

  const getCategoryIcon = (category) => {
    const cat = String(category).toLowerCase();
    if (cat.includes('road')) return Sliders;
    if (cat.includes('light')) return Zap;
    if (cat.includes('sanit') || cat.includes('waste') || cat.includes('garbage')) return Shield;
    if (cat.includes('traffic')) return Activity;
    if (cat.includes('water')) return Sliders;
    return ClipboardList;
  };

  const getSeverityColor = (sev) => {
    const s = String(sev).toUpperCase();
    if (s === 'CRITICAL') return 'text-rose-400 border-rose-500/25 bg-rose-500/10 animate-pulse';
    if (s === 'HIGH') return 'text-amber-400 border-amber-500/25 bg-amber-500/10';
    return 'text-sky-400 border-sky-500/25 bg-sky-500/10';
  };

  const getStatusLabelColor = (status) => {
    const s = String(status).toLowerCase();
    if (s.includes('pending')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (s.includes('progress') || s.includes('assign')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (s.includes('resolve')) return 'text-green-400 bg-green-500/10 border-green-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  return (
    <PageWrapper>
      <div className="flex-1 flex gap-6 min-h-0 items-stretch">
        
        {/* Left Side: Complaints Feed */}
        <div className="flex-1 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800/60 bg-[#060D18]/50 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-350 uppercase tracking-widest">Pune Care Grievances</span>
              {isLoading && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />}
            </div>
            
            {/* Real-time Category Selector */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#060D18]/80 p-0.5 border border-slate-800 rounded-lg select-none">
              {['ALL', 'road_damage', 'street_light', 'sanitation', 'traffic'].map(cat => {
                const count = cat === 'ALL' 
                  ? mergedComplaints.length 
                  : mergedComplaints.filter(item => item.category.toLowerCase().includes(cat.toLowerCase())).length;
                const label = cat === 'road_damage' ? 'Road' : cat === 'street_light' ? 'Light' : cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                      categoryFilter === cat 
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`px-1 py-0.2 rounded-full text-[8px] ${
                      categoryFilter === cat 
                        ? 'bg-blue-500/20 text-blue-400 font-extrabold' 
                        : 'bg-slate-800 text-slate-400 font-bold'
                    }`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search bar helper */}
          <div className="px-4 py-2 border-b border-slate-850 bg-[#060D18]/20 flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-550 shrink-0" />
            <input 
              type="text"
              placeholder="Search grievances by area, ID, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-[9px] text-slate-500 hover:text-white uppercase font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {filteredComplaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                <ClipboardList className="h-10 w-10 text-slate-700 mb-2 opacity-40" />
                <p className="text-xs font-bold text-slate-500">No matching grievances found</p>
              </div>
            ) : (
              filteredComplaints.map((item) => {
                const Icon = getCategoryIcon(item.category);
                return (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedComplaint(item)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-4 ${
                      selectedComplaint?.id === item.id 
                        ? 'border-blue-500/30 bg-blue-600/[0.03] shadow-[0_0_15px_rgba(59,130,246,0.05)]' 
                        : 'border-slate-800 bg-[#060D18]/30 hover:bg-[#060D18]/50'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg border shrink-0 ${
                      selectedComplaint?.id === item.id 
                        ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.category.replace('_', ' ')}</span>
                          <span className={`px-1.5 py-0.2 rounded border text-[8px] font-bold tracking-wider ${getSeverityColor(item.severity)}`}>
                            {item.severity}
                          </span>
                        </div>
                        <Badge className={`px-2 py-0.5 text-[8px] border font-bold ${getStatusLabelColor(item.status)}`}>
                          {String(item.status || 'Submitted').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-200 mt-1 truncate">{item.address}</p>
                      <p className="text-[10px] text-slate-550 mt-0.5 font-medium">
                        ID: {item.id} • Reported by {item.citizen} • {formatRelativeTime(item.date)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Grievance Details & Workflow Panel */}
        <div className="w-96 shrink-0 border border-slate-800/85 bg-[#0B1730]/90 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-800/50 bg-[#060D18]/30 select-none flex items-center justify-between">
            <span className="text-xs font-bold text-slate-350 uppercase tracking-wider">Grievance Command Panel</span>
          </div>

          {selectedComplaint ? (
            <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-5">
              <div className="space-y-4">
                
                {/* 1. Header category and status */}
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{selectedComplaint.category.replace('_', ' ')}</span>
                  <Badge className={`px-2 py-0.5 text-[8px] border font-bold ${getStatusLabelColor(selectedComplaint.status)}`}>
                    {String(selectedComplaint.status || 'Submitted').toUpperCase()}
                  </Badge>
                </div>

                {/* 2. Uploaded image container (Fidelity boost) */}
                {selectedComplaint.imageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-slate-850 bg-slate-950 aspect-video group shadow-inner">
                    <img 
                      src={selectedComplaint.imageUrl.startsWith('http') 
                        ? selectedComplaint.imageUrl 
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedComplaint.imageUrl}`
                      } 
                      alt="Civic Grievance Evidence"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/uploads/complaints/placeholder.jpg';
                      }}
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/75 border border-slate-800/60 backdrop-blur-md">
                      <span className="text-[8px] font-bold text-slate-350 tracking-wider uppercase">Live Attachment</span>
                    </div>
                  </div>
                )}

                {/* 3. Operational telemetry detail grid */}
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Report ID</span>
                    <p className="text-xs font-mono font-bold text-slate-200">{selectedComplaint.id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Severity Level</span>
                      <span className={`inline-block px-1.5 py-0.2 rounded border text-[9px] font-bold mt-0.5 tracking-wider ${getSeverityColor(selectedComplaint.severity)}`}>
                        {selectedComplaint.severity}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Department Assignment</span>
                      <p className="text-xs font-bold text-slate-200 mt-0.5">{selectedComplaint.authority || 'Pending Routing'}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Location Address</span>
                    <p className="text-xs font-semibold text-slate-300">{selectedComplaint.address}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Filer Identity</span>
                    <p className="text-xs font-semibold text-slate-300">{selectedComplaint.citizen}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Grievance Description</span>
                    <div className="p-3 bg-[#060D18]/45 border border-slate-850 rounded-lg text-slate-400 text-xs leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
                      {selectedComplaint.desc}
                    </div>
                  </div>
                </div>
              </div>

              {/* dispatcher dispatch tools */}
              <div className="space-y-3 border-t border-slate-850 pt-4">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Operational Dispatch Logs</span>
                
                {/* Note */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Action note & instructions</label>
                  <textarea
                    placeholder="Enter dispatch notes, worker updates, or resolution remarks..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    className="w-full bg-[#060D18]/80 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 min-h-[50px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Department Assignment */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Assigned Team Wing</label>
                    <select
                      value={actionDept}
                      onChange={(e) => setActionDept(e.target.value)}
                      className="w-full bg-[#060D18] border border-slate-800 rounded-lg p-2 text-[11px] font-bold text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="PMC Road Wing">PMC Road Wing</option>
                      <option value="MSEB Grid Team">MSEB Grid Team</option>
                      <option value="PMC Sanitation Dept.">PMC Sanitation Dept.</option>
                      <option value="Pune Traffic Police">Pune Traffic Police</option>
                      <option value="Municipal Core Wing">Municipal Core Wing</option>
                    </select>
                  </div>

                  {/* Operational ETA */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Resolution ETA</label>
                    <select
                      value={actionETA}
                      onChange={(e) => setActionETA(e.target.value)}
                      className="w-full bg-[#060D18] border border-slate-800 rounded-lg p-2 text-[11px] font-bold text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="2 Hours">2 Hours</option>
                      <option value="6 Hours">6 Hours</option>
                      <option value="12 Hours">12 Hours</option>
                      <option value="24 Hours">24 Hours</option>
                      <option value="3 Days">3 Days</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Action buttons section */}
              <div className="space-y-2.5 border-t border-slate-850 pt-4 select-none">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Workflow Status Transitions</span>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleUpdateStatus('pending')}
                    disabled={String(selectedComplaint.status || '').toLowerCase().includes('pending')}
                    className="py-2 px-2.5 bg-slate-900 border border-slate-800 text-slate-300 text-[9px] font-bold rounded-lg uppercase tracking-wider hover:text-white transition-all disabled:opacity-40"
                  >
                    Hold
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('in_progress')}
                    disabled={String(selectedComplaint.status || '').toLowerCase().includes('progress')}
                    className="py-2 px-2.5 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[9px] font-bold rounded-lg uppercase tracking-wider hover:bg-blue-500/20 transition-all disabled:opacity-40"
                  >
                    Progress
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('resolved')}
                    disabled={String(selectedComplaint.status || '').toLowerCase().includes('resolve')}
                    className="py-2 px-2.5 bg-green-500/10 border border-green-500/25 text-green-400 text-[9px] font-bold rounded-lg uppercase tracking-wider hover:bg-green-500/20 transition-all disabled:opacity-40"
                  >
                    Resolve
                  </button>
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
  const navigate = useNavigate();

  const { activeAlert, setActiveAlert, setLiveNetworkStatus, setEmergencyCount, emergencyCount } = useStore();

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

  // Sound buzzer cleanup on unmount
  useEffect(() => {
    return () => {
      stopTacticalBuzzer();
    };
  }, []);

  // Monitor for incoming critical real-time citizen alerts
  useEffect(() => {
    if (activeAlert) {
      // 1. Play wailing emergency siren dual-tone signal
      playTacticalBuzzer();

      // 2. Prepend critical SOS log to operational feed with highlight
      const now = new Date(activeAlert.timestamp || Date.now());
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      setLiveFeed((prev) => [
        {
          id: activeAlert.id || Date.now(),
          title: `⚠️ CRITICAL CITIZEN DISTRESS`,
          desc: `SOS signal triggered near ${activeAlert.area || 'Swargate'} ward (${activeAlert.lat.toFixed(4)}, ${activeAlert.lng.toFixed(4)}).`,
          time: timeStr,
          status: 'CRITICAL',
          highlight: true
        },
        ...prev.slice(0, 7)
      ]);

      // 3. Auto center view and zoom maps focus to targets
      const mapStore = useMapStore.getState();
      mapStore.setCenter({ lat: activeAlert.lat, lng: activeAlert.lng });
      mapStore.setZoom(16);
      
      showToast({
        type: 'error',
        title: '🚨 CRITICAL DISTRESS ALERT',
        message: `Distress beacon active from citizen ${activeAlert.citizenId} near ${activeAlert.area}!`,
      });
    }
  }, [activeAlert]);

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
      const demoId = `CIT-204`;
      const demoPayload = {
        type: "SOS_ALERT",
        severity: "CRITICAL",
        citizenId: demoId,
        area: ["Swargate", "Kothrud", "Hadapsar", "Viman Nagar", "Shivajinagar"][Math.floor(Math.random() * 5)],
        lat: 18.5204 + (Math.random() - 0.5) * 0.015,
        lng: 73.8567 + (Math.random() - 0.5) * 0.015,
        timestamp: now,
        userName: "Rohan Patil",
        userPhone: "+91-90281-22904"
      };

      // Connect socket and emit if socket is present
      try {
        const socketModule = await import('@/services/socket');
        const socket = socketModule.default;
        if (socket && typeof socket.emit === 'function') {
          if (!socket.connected) socket.connect();
          socket.emit("citizen_sos", demoPayload);
        }
      } catch (err) {
        console.warn("Socket connection bypassed, triggering state manually:", err);
      }

      // Update state locally to ensure 100% reactive trigger even offline
      setActiveAlert(demoPayload);
      setLiveNetworkStatus('emergency');
      setEmergencyCount(emergencyCount + 1);

      showToast({
        type: 'success',
        title: 'Demo SOS Injected',
        message: `Distress signal simulation loaded near Swargate / Pune sectors.`,
      });
    } catch (error) {
      console.error('Failed to inject demo SOS alert:', error);
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

          {/* Real-time Emergency SOS Alert Overlay Modal */}
          <AnimatePresence>
            {activeAlert && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95, x: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute top-6 right-6 z-[9999] w-96 bg-[#160606]/95 border-2 border-red-500/85 rounded-xl shadow-[0_10px_50px_rgba(239,68,68,0.4)] backdrop-blur-md overflow-hidden text-slate-200"
              >
                {/* Flashing top warning strip */}
                <div className="bg-red-600 px-4 py-2 flex items-center justify-between animate-pulse">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 animate-bounce" />
                    Critical Distress Beacon
                  </span>
                  <span className="text-[9px] font-bold text-white/90 bg-black/35 px-2 py-0.5 rounded uppercase">
                    Active SOS
                  </span>
                </div>

                <div className="p-5 space-y-4 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        {activeAlert.userName || 'Distressed Citizen'}
                      </h4>
                      <p className="text-[10px] font-semibold text-red-400 mt-0.5 uppercase tracking-wide">
                        ID: {activeAlert.citizenId}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {activeAlert.lat.toFixed(5)}, {activeAlert.lng.toFixed(5)}
                      </span>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">
                        {activeAlert.area || 'Pune Ward'}
                      </p>
                    </div>
                  </div>

                  {activeAlert.userPhone && (
                    <div className="bg-black/30 border border-red-500/10 rounded-lg p-2.5 flex items-center justify-between text-xs text-slate-350">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-red-400" />
                        Hotline Contact:
                      </span>
                      <span className="font-mono text-white font-bold">{activeAlert.userPhone}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    Citizen initiated emergency SOS wailing distress trigger. Live camera telemetries & nearest emergency responder coordinates focused.
                  </p>

                  {/* Action buttons */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        const pos = { lat: activeAlert.lat, lng: activeAlert.lng };
                        const mapStore = useMapStore.getState();
                        mapStore.setCenter(pos);
                        mapStore.setZoom(16);
                        navigate('/authority/safety-map');
                        showToast({
                          type: 'info',
                          title: 'Live Map Focused',
                          message: `Centered authority viewport on Swargate coordinate sector.`
                        });
                      }}
                      className="bg-[#2d0e0e] border border-red-500/30 hover:bg-[#431414] hover:border-red-500/50 text-[10px] font-bold text-red-300 uppercase py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 select-none"
                    >
                      <MapPin className="h-4 w-4" />
                      Open Map
                    </button>
                    
                    <button
                      onClick={() => {
                        setActiveAlert(null);
                        setLiveNetworkStatus('connected');
                        stopTacticalBuzzer();
                        showToast({
                          type: 'success',
                          title: 'Emergency Dispatched',
                          message: `Emergency response unit successfully deployed to Swargate distress sector.`
                        });
                      }}
                      className="bg-red-600 hover:bg-red-700 text-[10px] font-bold text-white uppercase py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-red-600/20 select-none"
                    >
                      <Truck className="h-4 w-4" />
                      Dispatch Unit
                    </button>

                    <button
                      onClick={() => {
                        setActiveAlert(null);
                        setLiveNetworkStatus('connected');
                        stopTacticalBuzzer();
                        showToast({
                          type: 'success',
                          title: 'Alert Cleared',
                          message: 'SOS emergency status reset. Command console cleared.'
                        });
                      }}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-750 text-[10px] font-bold text-slate-350 uppercase py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 select-none"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Acknowledge
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}
