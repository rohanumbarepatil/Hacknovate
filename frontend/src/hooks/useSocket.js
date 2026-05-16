import { useEffect } from 'react';
import socket from '../services/socket';
import useStore from '../store/useStore';

export const useSocket = () => {
  const { addIncident, addSosEvent, updateVehicle, updateRiskScore } = useStore();

  useEffect(() => {
    socket.connect();

    socket.on('incident:new', (incident) => {
      addIncident(incident);
    });

    socket.on('sos:alert', (sosEvent) => {
      addSosEvent(sosEvent);
    });

    socket.on('vehicle:updated', ({ vehicleId, lat, lng }) => {
      updateVehicle(vehicleId, { lat, lng, lastUpdated: Date.now() });
    });

    socket.on('risk:updated', ({ wardId, score }) => {
      updateRiskScore(wardId, score);
    });

    return () => {
      socket.off('incident:new');
      socket.off('sos:alert');
      socket.off('vehicle:updated');
      socket.off('risk:updated');
      socket.disconnect();
    };
  }, [addIncident, addSosEvent, updateVehicle, updateRiskScore]);

  return socket;
};
