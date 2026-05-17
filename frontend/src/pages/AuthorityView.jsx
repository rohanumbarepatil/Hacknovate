import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  Headphones,
  Layers,
  Map as MapIcon,
  MapPin,
  Shield,
} from 'lucide-react';
import { push, ref as dbRef, set } from 'firebase/database';
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

function toTimestamp(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toNumberOrNull(value) {
  if (Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

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

function getCoordinates(alert) {
  const lat = toNumberOrNull(alert?.lat) ?? toNumberOrNull(alert?.location?.lat);
  const lng = toNumberOrNull(alert?.lng) ?? toNumberOrNull(alert?.location?.lng);
  return { lat, lng };
}

function getStatusVariant(status) {
  const value = (status || 'active').toLowerCase();
  if (value === 'active') return 'CRITICAL';
  if (value === 'recording') return 'HIGH';
  if (value === 'acknowledged') return 'MEDIUM';
  if (value === 'resolved') return 'LOW';
  return 'HIGH';
}

export default function AuthorityView() {
  const { incidents, sosEvents } = useStore();
  const notifications = useNotificationStore((state) => state.notifications);
  const markCategoryAsRead = useNotificationStore((state) => state.markCategoryAsRead);

  const [activeLayer, setActiveLayer] = useState(MAP_LAYERS.CRIME_HEATMAP);
  const [activeTab, setActiveTab] = useState('overview');
  const [isInjectingDemo, setIsInjectingDemo] = useState(false);

  const liveSOS = useMemo(() => sosEvents.slice(0, 20), [sosEvents]);
  const sosNotifications = useMemo(
    () => notifications.filter((item) => item.category === 'sos'),
    [notifications]
  );
  const unreadSOSCount = useMemo(
    () => notifications.filter((item) => item.category === 'sos' && !item.read).length,
    [notifications]
  );

  useEffect(() => {
    if (activeTab === 'sos' && unreadSOSCount > 0) {
      markCategoryAsRead('sos');
    }
  }, [activeTab, markCategoryAsRead, unreadSOSCount]);

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

      setActiveTab('sos');
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

  return (
    <div className="flex h-screen overflow-hidden bg-tactical-bg text-tactical-textPrimary">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Operations Command Center" />

        <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          <div className="shrink-0 flex items-center justify-between gap-3 border border-tactical-border rounded-lg bg-tactical-card p-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-tactical-blue/20 text-tactical-blue border border-tactical-blue/30'
                    : 'text-tactical-textSecondary hover:text-white border border-transparent'
                }`}
              >
                Operations
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sos')}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${
                  activeTab === 'sos'
                    ? 'bg-tactical-red/20 text-tactical-red border border-tactical-red/30'
                    : 'text-tactical-textSecondary hover:text-white border border-transparent'
                }`}
              >
                SOS Center
                {unreadSOSCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-tactical-red text-white text-[10px] leading-none min-w-[18px] text-center">
                    {unreadSOSCount}
                  </span>
                )}
              </button>
            </div>

            <Button
              onClick={injectDemoSOSAlert}
              disabled={isInjectingDemo}
              variant="secondary"
              className="text-xs"
            >
              {isInjectingDemo ? 'Injecting Demo...' : 'Inject Demo SOS Alert'}
            </Button>
          </div>

          {activeTab === 'overview' ? (
            <>
              <div className="flex-1 flex gap-4 min-h-0">
                <div className="flex-1 relative flex flex-col border border-tactical-border rounded-lg overflow-hidden bg-tactical-bgSecondary shadow-tactical">
                  <div className="absolute top-4 left-4 z-20 bg-tactical-card border border-tactical-border p-2 rounded shadow-tactical-lg w-64">
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <Layers className="h-4 w-4 text-tactical-textSecondary" />
                      <span className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-widest">Active Intelligence Layer</span>
                    </div>
                    <div className="space-y-1">
                      {LAYER_CONTROLS.map((layer) => (
                        <button
                          key={layer.id}
                          onClick={() => setActiveLayer(layer.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded transition-colors ${
                            activeLayer === layer.id
                              ? 'bg-tactical-blue/20 text-tactical-blue border border-tactical-blue/30'
                              : 'text-tactical-textSecondary hover:bg-tactical-bg hover:text-white border border-transparent'
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

                <div className="w-80 flex flex-col gap-4 overflow-hidden">
                  <Card className="shrink-0 p-4 border-l-4 border-l-tactical-amber">
                    <p className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-widest mb-1">Layer Context</p>
                    <p className="text-sm font-bold text-white">
                      {LAYER_CONTROLS.find((l) => l.id === activeLayer)?.label || 'Intelligence View'}
                    </p>
                    <p className="text-xs text-tactical-textSecondary mt-2">
                      Displaying live geospatial data. Unrelated overlays are hidden to maintain tactical focus.
                    </p>
                  </Card>

                  <Card className="flex-1 overflow-hidden flex flex-col border-l-4 border-l-tactical-red">
                    <Card.Header>
                      <Card.Title>Live SOS Dispatch</Card.Title>
                    </Card.Header>
                    <div className="p-4 overflow-y-auto custom-scrollbar space-y-3">
                      {liveSOS.slice(0, 6).map((alert) => {
                        const { lat, lng } = getCoordinates(alert);
                        const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
                        const alertId = alert.id || alert.sosId || 'unknown';

                        return (
                          <div key={alertId} className="p-3 border border-tactical-red/30 bg-tactical-red/5 rounded">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-xs font-bold text-tactical-red">SOS #{String(alertId).slice(-8)}</p>
                              <Badge variant={getStatusVariant(alert.status)}>
                                {(alert.status || 'active').toUpperCase()}
                              </Badge>
                            </div>

                            <p className="text-[10px] text-tactical-textSecondary">
                              {alert.userName || 'Citizen'}
                            </p>

                            <p className="text-[10px] text-white mt-1 font-mono">
                              {hasCoordinates ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Location capture pending'}
                            </p>

                            <p className="text-[10px] text-tactical-textSecondary mt-1">
                              Updated {formatRelativeTime(alert.updatedAt || alert.timestamp)}
                            </p>
                          </div>
                        );
                      })}

                      {liveSOS.length === 0 && (
                        <div className="p-3 border border-tactical-border bg-tactical-bg rounded">
                          <p className="text-xs font-bold text-white">No Active SOS Alerts</p>
                          <p className="text-[10px] text-tactical-textSecondary mt-1">
                            Incoming emergency alerts will appear here in real time.
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>

              <div className="h-48 border border-tactical-border rounded-lg bg-tactical-card flex flex-col shadow-tactical shrink-0">
                <div className="px-4 py-2 border-b border-tactical-border flex items-center justify-between bg-tactical-bgSecondary">
                  <span className="text-xs font-bold text-tactical-textSecondary uppercase tracking-widest">Live Incident Feed</span>
                  <StatusIndicator status="online" size="sm" />
                </div>
                <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-tactical-bg text-tactical-textSecondary border-b border-tactical-border">
                        <th className="p-3 font-medium">Time</th>
                        <th className="p-3 font-medium">Severity</th>
                        <th className="p-3 font-medium">Location</th>
                        <th className="p-3 font-medium">Unit</th>
                        <th className="p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { time: '14:32:00', sev: 'CRITICAL', loc: 'NH4 Highway', unit: 'ALPHA-01', stat: 'RESPONDING' },
                        { time: '14:28:15', sev: 'HIGH', loc: 'Sadar Bazar', unit: 'UNASSIGNED', stat: 'PENDING' },
                        { time: '14:15:22', sev: 'MEDIUM', loc: 'Powai Naka', unit: 'BRAVO-02', stat: 'ON SCENE' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-tactical-border/50 hover:bg-tactical-bg transition-colors">
                          <td className="p-3 text-tactical-textSecondary font-mono">{row.time}</td>
                          <td className="p-3"><Badge variant={row.sev}>{row.sev}</Badge></td>
                          <td className="p-3 text-white">{row.loc}</td>
                          <td className="p-3 text-tactical-blue">{row.unit}</td>
                          <td className="p-3 text-tactical-textSecondary">{row.stat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="xl:col-span-2 flex flex-col overflow-hidden border-l-4 border-l-tactical-red">
                <Card.Header>
                  <Card.Title>Active SOS Events</Card.Title>
                </Card.Header>
                <div className="p-4 overflow-y-auto custom-scrollbar space-y-3">
                  {liveSOS.length === 0 ? (
                    <div className="p-4 border border-tactical-border rounded bg-tactical-bg">
                      <p className="text-sm font-bold text-white">No live SOS events yet</p>
                      <p className="text-xs text-tactical-textSecondary mt-1">
                        Trigger one from the citizen SOS button or use "Inject Demo SOS Alert".
                      </p>
                    </div>
                  ) : (
                    liveSOS.map((alert) => {
                      const { lat, lng } = getCoordinates(alert);
                      const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
                      const alertId = alert.id || alert.sosId || 'unknown';

                      return (
                        <div key={alertId} className="p-4 border border-tactical-red/30 bg-tactical-red/5 rounded">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-tactical-red" />
                              <p className="text-sm font-bold text-white">SOS #{String(alertId).slice(-8)}</p>
                            </div>
                            <Badge variant={getStatusVariant(alert.status)}>
                              {(alert.status || 'active').toUpperCase()}
                            </Badge>
                          </div>

                          <p className="text-xs text-white">{alert.userName || 'Citizen'}</p>
                          <p className="text-[11px] text-tactical-textSecondary mt-1">{alert.userEmail || 'No email provided'}</p>
                          <p className="text-[11px] text-tactical-textSecondary mt-0.5">{alert.userPhone || 'No phone provided'}</p>

                          <div className="mt-2 p-2 rounded bg-tactical-bg border border-tactical-border text-[11px] font-mono text-white">
                            {hasCoordinates ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Location capture pending'}
                          </div>

                          <p className="text-[10px] text-tactical-textSecondary mt-2">
                            Updated {formatRelativeTime(alert.updatedAt || alert.timestamp || alert.createdAt || alert.created_at)}
                          </p>

                          {alert.audioUrl ? (
                            <div className="mt-2">
                              <div className="flex items-center gap-2 text-[10px] text-tactical-textSecondary mb-1 uppercase tracking-widest">
                                <Headphones className="h-3.5 w-3.5" />
                                Voice Recording
                              </div>
                              <audio controls src={alert.audioUrl} preload="none" className="w-full h-8" />
                            </div>
                          ) : (
                            <p className="text-[10px] text-amber-400 mt-2">Voice recording upload in progress...</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>

              <Card className="flex flex-col overflow-hidden">
                <Card.Header>
                  <Card.Title>Notification Stream</Card.Title>
                </Card.Header>
                <div className="p-4 overflow-y-auto custom-scrollbar space-y-3">
                  {sosNotifications.length === 0 ? (
                    <div className="p-3 border border-tactical-border bg-tactical-bg rounded">
                      <p className="text-xs font-bold text-white">No SOS notifications yet</p>
                    </div>
                  ) : (
                    sosNotifications.slice(0, 20).map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded border ${
                          item.read
                            ? 'border-tactical-border bg-tactical-bg'
                            : 'border-tactical-red/30 bg-tactical-red/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Bell className="h-3.5 w-3.5 text-tactical-red" />
                            {item.title || 'SOS Alert'}
                          </p>
                          <span className="text-[10px] text-tactical-textSecondary">{formatRelativeTime(item.timestamp)}</span>
                        </div>
                        <p className="text-[11px] text-tactical-textSecondary mt-1">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
