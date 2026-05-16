import { useEffect, useRef } from 'react';
import useStore from '@/store/useStore';

const VEHICLE_ICONS = {
  police: { emoji: '🚔', color: '#3b82f6' },
  ambulance: { emoji: '🚑', color: '#ef4444' },
  fire: { emoji: '🚒', color: '#f97316' },
  rescue: { emoji: '🆘', color: '#a855f7' },
};

const STATUS_COLORS = {
  available: '#22c55e',
  dispatched: '#f59e0b',
  en_route: '#f97316',
  on_scene: '#ef4444',
  returning: '#3b82f6',
  offline: '#6b7280',
};

export default function EmergencyVehicleLayer({ map }) {
  const markersRef = useRef({});
  const vehicles = useStore((s) => s.vehicles);

  useEffect(() => {
    if (!map || !window.google) return;
    const vehicleData = vehicles.length > 0 ? vehicles : [
      { id: 'v1', type: 'police', call_sign: 'ALPHA-01', lat: 17.6880, lng: 74.0170, status: 'available', heading: 45 },
      { id: 'v2', type: 'ambulance', call_sign: 'MED-01', lat: 17.6840, lng: 74.0210, status: 'available', heading: 90 },
      { id: 'v3', type: 'fire', call_sign: 'FIRE-01', lat: 17.6900, lng: 74.0250, status: 'available', heading: 270 },
    ];
    vehicleData.forEach((v) => {
      if (!v.lat || !v.lng) return;
      const statusColor = STATUS_COLORS[v.status] || STATUS_COLORS.offline;
      if (markersRef.current[v.id]) {
        markersRef.current[v.id].setPosition({ lat: v.lat, lng: v.lng });
      } else {
        const marker = new window.google.maps.Marker({
          position: { lat: v.lat, lng: v.lng }, map,
          title: `${v.call_sign} (${v.type})`,
          icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, fillColor: statusColor, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 7, rotation: v.heading || 0 },
          zIndex: 1000,
        });
        marker.addListener('click', () => {
          new window.google.maps.InfoWindow({ content: `<div style="color:#111;padding:4px"><strong>${v.call_sign}</strong><br/>Status: ${v.status}</div>` }).open(map, marker);
        });
        markersRef.current[v.id] = marker;
      }
    });
  }, [map, vehicles]);

  useEffect(() => () => { Object.values(markersRef.current).forEach((m) => m.setMap(null)); markersRef.current = {}; }, []);
  return null;
}
