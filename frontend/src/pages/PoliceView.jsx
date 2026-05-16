import { useState, useEffect } from 'react';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { AlertCircle, Radio, MapPin, Clock } from 'lucide-react';
import api from '../services/api';
import useStore from '../store/useStore';
import socket from '../services/socket';

export const PoliceView = () => {
  const { incidents, sosEvents } = useStore();
  const [activeSOS, setActiveSOS] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    loadIncidents();
    loadActiveSOS();

    // Listen for real-time SOS alerts
    socket.on('sos:alert', (sosData) => {
      setActiveSOS(prev => [sosData, ...prev]);
      // Play alert sound
      playAlertSound();
    });

    return () => {
      socket.off('sos:alert');
    };
  }, []);

  const loadIncidents = async () => {
    try {
      const response = await api.get('/incidents');
      useStore.setState({ incidents: response.data });
    } catch (error) {
      console.error('Load incidents error:', error);
    }
  };

  const loadActiveSOS = async () => {
    try {
      const response = await api.get('/sos/active');
      setActiveSOS(response.data);
    } catch (error) {
      console.error('Load SOS error:', error);
    }
  };

  const handleRespondToSOS = async (sosId) => {
    try {
      await api.patch(`/sos/${sosId}/respond`);
      alert('Response acknowledged. Dispatching to location.');
      loadActiveSOS();
    } catch (error) {
      console.error('Respond to SOS error:', error);
      alert('Failed to respond to SOS');
    }
  };

  const playAlertSound = () => {
    // In production, play actual alert sound
    console.log('🚨 SOS ALERT SOUND');
  };

  const getTimeSince = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Radio className="text-blue-500" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-white">SafeCity Police</h1>
              <p className="text-sm text-gray-400">Live Operations Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{incidents.length}</p>
              <p className="text-xs text-gray-400">Active Incidents</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{activeSOS.length}</p>
              <p className="text-xs text-gray-400">SOS Alerts</p>
            </div>
          </div>
        </div>
      </header>

      {/* SOS Alert Banner */}
      {activeSOS.length > 0 && (
        <div className="bg-red-600 px-6 py-3 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle size={24} />
              <span className="font-bold text-lg">
                {activeSOS.length} ACTIVE SOS ALERT{activeSOS.length > 1 ? 'S' : ''}
              </span>
            </div>
            <button
              onClick={() => document.getElementById('sos-panel').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100"
            >
              VIEW ALERTS
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <InteractiveMap incidents={incidents} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* SOS Panel */}
            <div id="sos-panel" className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <AlertCircle className="mr-2 text-red-500" size={20} />
                Active SOS Alerts
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeSOS.length === 0 ? (
                  <p className="text-gray-400 text-sm">No active SOS alerts</p>
                ) : (
                  activeSOS.map(sos => (
                    <div key={sos.sosId || sos.id} className="bg-red-900 bg-opacity-30 border border-red-500 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-red-400 font-bold">SOS #{sos.sosId || sos.id}</span>
                        <span className="text-xs text-gray-400">
                          <Clock size={12} className="inline mr-1" />
                          {getTimeSince(sos.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        <MapPin size={14} className="inline mr-1" />
                        {sos.lat?.toFixed(4)}, {sos.lng?.toFixed(4)}
                      </p>
                      <button
                        onClick={() => handleRespondToSOS(sos.sosId || sos.id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        RESPOND NOW
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Incidents */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Incidents</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {incidents.slice(0, 10).map(incident => (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className="bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-white capitalize">{incident.type}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        incident.severity === 'critical' ? 'bg-red-600' :
                        incident.severity === 'high' ? 'bg-orange-600' :
                        incident.severity === 'medium' ? 'bg-yellow-600' :
                        'bg-green-600'
                      }`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{incident.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceView;
