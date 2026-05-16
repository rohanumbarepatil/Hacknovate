import { useState } from 'react';
import { ShieldCheck, AlertTriangle, MapPin, Navigation } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MapContainer from '@/maps/MapContainer';
import IncidentPinLayer from '@/maps/layers/IncidentPinLayer';
import UnsafeRoadLayer from '@/maps/layers/UnsafeRoadLayer';
import AccidentZoneLayer from '@/maps/layers/AccidentZoneLayer';
import LayerToggle from '@/maps/controls/LayerToggle';
import SOSButton from '@/components/citizen/SOSButton';
import ComplaintForm from '@/components/citizen/ComplaintForm';
import { Card, Badge, Button, Modal } from '@/components/common';
import useMapStore from '@/store/useMapStore';

export default function CitizenView() {
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const { activeLayers } = useMapStore();

  return (
    <div className="flex h-screen overflow-hidden bg-tactical-bg text-tactical-textPrimary">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Citizen Safety Dashboard" />
        
        <main className="flex-1 flex p-4 gap-4 overflow-hidden">
          {/* Central Map - Primary Element */}
          <div className="flex-1 relative flex flex-col border border-tactical-border rounded-lg overflow-hidden bg-tactical-bgSecondary shadow-tactical">
            <LayerToggle exclusive={false} className="top-4 right-4" />
            <MapContainer mode="dark">
              {(map) => (
                <>
                  {activeLayers.includes('incident-pins') && <IncidentPinLayer map={map} />}
                  {activeLayers.includes('unsafe-roads') && <UnsafeRoadLayer map={map} />}
                  {activeLayers.includes('accident-zones') && <AccidentZoneLayer map={map} />}
                </>
              )}
            </MapContainer>
          </div>

          {/* Right Safety Insights Panel */}
          <div className="w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {/* Quick Actions */}
            <Card className="shrink-0 p-4">
              <Button 
                className="w-full mb-2" 
                onClick={() => setIsComplaintModalOpen(true)}
              >
                Report Civic Issue
              </Button>
              <Button variant="secondary" className="w-full">
                Find Safe Route
              </Button>
            </Card>

            {/* Safety Score */}
            <Card className="shrink-0">
              <Card.Header>
                <Card.Title>Current Location Risk</Card.Title>
              </Card.Header>
              <Card.Content className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full border-4 border-tactical-primary flex items-center justify-center">
                  <span className="text-xl font-bold text-white">Low</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Safe Zone</p>
                  <p className="text-xs text-tactical-textSecondary mt-1">No active alerts within 2km.</p>
                </div>
              </Card.Content>
            </Card>

            {/* Nearby Incidents */}
            <Card className="flex-1 min-h-[250px]">
              <Card.Header>
                <Card.Title>Nearby Alerts</Card.Title>
              </Card.Header>
              <div className="p-4 space-y-3">
                {[
                  { title: "Traffic Congestion", loc: "Powai Naka", type: "warning" },
                  { title: "Street Light Outage", loc: "Sadar Bazar", type: "info" }
                ].map((alert, i) => (
                  <div key={i} className="flex gap-3 p-3 border border-tactical-border rounded bg-tactical-bg">
                    {alert.type === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-tactical-amber shrink-0 mt-0.5" />
                    ) : (
                      <MapPin className="h-4 w-4 text-tactical-blue shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">{alert.title}</p>
                      <p className="text-[10px] text-tactical-textSecondary">{alert.loc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
        
        <SOSButton />
      </div>

      <Modal 
        isOpen={isComplaintModalOpen} 
        onClose={() => setIsComplaintModalOpen(false)}
        title="File Civic Complaint"
      >
        <ComplaintForm onSuccess={() => setIsComplaintModalOpen(false)} />
      </Modal>
    </div>
  );
}
