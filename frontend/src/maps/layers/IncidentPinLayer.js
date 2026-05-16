import { useEffect, useRef } from 'react';
import incidentService from '@/services/incidentService';
import { INCIDENT_COLORS } from '@/constants/mapConfig';

/**
 * IncidentPinLayer — Custom markers for reported incidents
 * Color-coded by incident type with severity-sized markers.
 */
export default function IncidentPinLayer({ map }) {
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google) return;
    let isMounted = true;

    async function loadData() {
      try {
        const response = await incidentService.getGeoJSON();
        if (!isMounted) return;
        renderMarkers(response.data || response || []);
      } catch {
        // Demo fallback
        const demo = [
          { lat: 17.6875, lng: 74.0185, type: 'crime', title: 'Chain snatching reported', severity: 7 },
          { lat: 17.6910, lng: 74.0145, type: 'accident', title: 'Vehicle collision', severity: 6 },
          { lat: 17.6820, lng: 74.0225, type: 'infrastructure', title: 'Road cave-in', severity: 8 },
          { lat: 17.6940, lng: 74.0200, type: 'fire', title: 'Shop fire reported', severity: 9 },
          { lat: 17.6850, lng: 74.0120, type: 'medical', title: 'Person collapsed', severity: 7 },
        ];
        if (isMounted) renderMarkers(demo);
      }
    }

    function renderMarkers(data) {
      clearMarkers();
      data.forEach((p) => {
        const color = INCIDENT_COLORS[p.type] || '#6b7280';
        const marker = new window.google.maps.Marker({
          position: { lat: p.lat, lng: p.lng }, map,
          title: p.title,
          icon: { path: window.google.maps.SymbolPath.CIRCLE, fillColor: color, fillOpacity: 0.9, strokeColor: '#fff', strokeWeight: 1.5, scale: 6 + ((p.severity || 5) * 0.4) },
        });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="color:#111;padding:4px;max-width:200px"><strong>${p.title}</strong><br/><span style="color:${color}">${(p.type || '').toUpperCase()}</span> · Severity ${p.severity || '?'}/10</div>`,
        });
        marker.addListener('click', () => info.open(map, marker));
        markersRef.current.push(marker);
      });
    }

    function clearMarkers() { markersRef.current.forEach((m) => m.setMap(null)); markersRef.current = []; }
    loadData();
    return () => { isMounted = false; clearMarkers(); };
  }, [map]);

  return null;
}
