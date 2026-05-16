import { useEffect, useRef } from 'react';
import mapService from '@/services/mapService';
import { SEVERITY_COLORS } from '@/constants/mapConfig';

/**
 * AccidentZoneLayer — Marker clusters for accident locations
 * Shows accident points with severity-coded markers.
 */
export default function AccidentZoneLayer({ map }) {
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google) return;

    let isMounted = true;

    async function loadData() {
      try {
        const response = await mapService.getAccidentZones();
        if (!isMounted) return;
        renderMarkers(response.data || response || []);
      } catch (err) {
        console.error('Failed to load accident zones:', err);

        // Demo fallback data for Satara
        const demoData = [
          { lat: 17.6870, lng: 74.0190, severity: 8, title: 'Major collision - NH4 Junction' },
          { lat: 17.6920, lng: 74.0140, severity: 6, title: 'Two-wheeler accident - Market Road' },
          { lat: 17.6810, lng: 74.0230, severity: 9, title: 'Bus accident - Powai Naka' },
          { lat: 17.6890, lng: 74.0090, severity: 5, title: 'Minor collision - Sadar Bazar' },
          { lat: 17.6950, lng: 74.0260, severity: 7, title: 'Pedestrian hit - Godoli Circle' },
          { lat: 17.6830, lng: 74.0170, severity: 4, title: 'Fender bender - Shanivar Peth' },
        ];

        if (!isMounted) return;
        renderMarkers(demoData);
      }
    }

    function renderMarkers(data) {
      // Clear existing markers
      clearMarkers();

      data.forEach((point) => {
        const severity = point.severity || 5;
        const color = SEVERITY_COLORS[severity] || '#f97316';

        const marker = new window.google.maps.Marker({
          position: { lat: point.lat, lng: point.lng },
          map,
          title: point.title || 'Accident Zone',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 8 + (severity * 0.5),
          },
        });

        // InfoWindow on click
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #111; padding: 4px; max-width: 200px;">
              <strong style="font-size: 13px;">🚗 ${point.title || 'Accident'}</strong>
              <p style="margin: 4px 0 0; font-size: 12px; color: #666;">
                Severity: <span style="color: ${color}; font-weight: bold;">${severity}/10</span>
              </p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
      });
    }

    function clearMarkers() {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    }

    loadData();

    return () => {
      isMounted = false;
      clearMarkers();
    };
  }, [map]);

  return null;
}
