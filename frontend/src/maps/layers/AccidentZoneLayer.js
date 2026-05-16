import { useEffect, useRef } from 'react';

// Generates dummy accident points clustered heavily in Pune intersections
const getAccidentPoints = () => {
  const points = [];
  const baseLat = 18.5204;
  const baseLng = 73.8567;
  
  // Center cluster
  for (let i = 0; i < 40; i++) {
    points.push(new window.google.maps.LatLng(baseLat + (Math.random() - 0.5) * 0.02, baseLng + (Math.random() - 0.5) * 0.02));
  }
  // Secondary cluster
  for (let i = 0; i < 25; i++) {
    points.push(new window.google.maps.LatLng(baseLat + 0.03 + (Math.random() - 0.5) * 0.015, baseLng + 0.01 + (Math.random() - 0.5) * 0.015));
  }
  return points;
};

const HIGH_RISK_ZONES = [
  { lat: 18.5204, lng: 73.8567, title: 'Shivaji Nagar Junction', score: 87, incidents: 14 },
  { lat: 18.5504, lng: 73.8667, title: 'Pune Station Road', score: 92, incidents: 21 },
];

export default function AccidentZoneLayer({ map }) {
  const heatmapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google || !window.google.maps.visualization) return;

    let isMounted = true;
    let activeInfoWindow = null;

    // Heatmap Visualization
    heatmapRef.current = new window.google.maps.visualization.HeatmapLayer({
      data: getAccidentPoints(),
      map: map,
      radius: 40,
      opacity: 0.8,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ]
    });

    // Add Markers for specific High Risk intersections
    HIGH_RISK_ZONES.forEach(zone => {
      const marker = new window.google.maps.Marker({
        position: { lat: zone.lat, lng: zone.lng },
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 9
        }
      });

      const contentString = `
        <div style="min-width: 220px; font-family: 'Inter', sans-serif; padding: 12px; background: #0b1120; border: 1px solid #1e293b; border-radius: 4px;">
          <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #ef4444; text-transform: uppercase; margin-bottom: 6px;">ACCIDENT PRONE ZONE</div>
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #f8fafc;">${zone.title}</h3>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #94a3b8;">Risk Probability</span>
              <span style="color: #ef4444; font-weight: 600;">${zone.score}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #94a3b8;">Recent Crashes</span>
              <span style="color: #f8fafc; font-weight: 600;">${zone.incidents}</span>
            </div>
          </div>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({ content: contentString });

      marker.addListener('click', () => {
        if (activeInfoWindow) activeInfoWindow.close();
        infoWindow.open(map, marker);
        activeInfoWindow = infoWindow;
      });

      markersRef.current.push(marker);
    });

    return () => {
      isMounted = false;
      if (heatmapRef.current) heatmapRef.current.setMap(null);
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, [map]);

  return null;
}
