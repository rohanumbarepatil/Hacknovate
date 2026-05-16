import { useState } from 'react';
import { Activity, AlertTriangle, Shield, Map as MapIcon, Layers, MapPin } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MapContainer from '@/maps/MapContainer';
import CrimeHeatmapLayer from '@/maps/layers/CrimeHeatmapLayer';
import AccidentZoneLayer from '@/maps/layers/AccidentZoneLayer';
import EmergencyVehicleLayer from '@/maps/layers/EmergencyVehicleLayer';
import RiskZoneLayer from '@/maps/layers/RiskZoneLayer';
import IncidentPinLayer from '@/maps/layers/IncidentPinLayer';
import MapLegend from '@/maps/controls/MapLegend';
import { Card, Badge, StatusIndicator } from '@/components/common';
import useStore from '@/store/useStore';
import { MAP_LAYERS } from '@/constants/mapConfig';

export default function AuthorityView() {
  const { incidents, sosEvents, vehicles } = useStore();
  
  // Strict exclusive overlay mode state
  const [activeLayer, setActiveLayer] = useState(MAP_LAYERS.CRIME_HEATMAP);

  const LAYER_CONTROLS = [
    { id: MAP_LAYERS.ACCIDENT_ZONES, label: 'High Accident Areas', icon: AlertTriangle },
    { id: MAP_LAYERS.CRIME_HEATMAP, label: 'Crime Heatmap', icon: Activity },
    { id: MAP_LAYERS.EMERGENCY_VEHICLES, label: 'Emergency Vehicles', icon: Shield },
    { id: MAP_LAYERS.INCIDENT_PINS, label: 'Incident Pins', icon: MapPin },
    { id: MAP_LAYERS.RISK_ZONES, label: 'AI Risk Zones', icon: MapIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-tactical-bg text-tactical-textPrimary">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Operations Command Center" />
        
        <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Central Map */}
            <div className="flex-1 relative flex flex-col border border-tactical-border rounded-lg overflow-hidden bg-tactical-bgSecondary shadow-tactical">
              
              {/* Tactical Overlay Selection Menu */}
              <div className="absolute top-4 left-4 z-20 bg-tactical-card border border-tactical-border p-2 rounded shadow-tactical-lg w-64">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Layers className="h-4 w-4 text-tactical-textSecondary" />
                  <span className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-widest">Active Intelligence Layer</span>
                </div>
                <div className="space-y-1">
                  {LAYER_CONTROLS.map(layer => (
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
                    {/* ONLY render the active layer based on strict requirements */}
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

            {/* Right Live Intelligence Panel */}
            <div className="w-80 flex flex-col gap-4 overflow-hidden">
              <Card className="shrink-0 p-4 border-l-4 border-l-tactical-amber">
                <p className="text-[10px] font-bold text-tactical-textSecondary uppercase tracking-widest mb-1">Layer Context</p>
                <p className="text-sm font-bold text-white">
                  {LAYER_CONTROLS.find(l => l.id === activeLayer)?.label || 'Intelligence View'}
                </p>
                <p className="text-xs text-tactical-textSecondary mt-2">
                  Displaying live geospatial data. Unrelated overlays are hidden to maintain tactical focus.
                </p>
              </Card>

              <Card className="flex-1 overflow-hidden flex flex-col">
                <Card.Header>
                  <Card.Title>Risk Escalations</Card.Title>
                </Card.Header>
                <div className="p-4 overflow-y-auto custom-scrollbar space-y-3">
                  <div className="p-3 border border-tactical-red/30 bg-tactical-red/5 rounded">
                    <p className="text-xs font-bold text-tactical-red">High Priority Alert</p>
                    <p className="text-[10px] text-tactical-textSecondary mt-1">Multi-vehicle collision reported on NH4. 2 Units responding.</p>
                  </div>
                  <div className="p-3 border border-tactical-border bg-tactical-bg rounded">
                    <p className="text-xs font-bold text-white">AI Prediction</p>
                    <p className="text-[10px] text-tactical-textSecondary mt-1">Crowd density increasing in Sector 7. Suggesting patrol dispatch.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Bottom Incident Feed */}
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
        </main>
      </div>
    </div>
  );
}
