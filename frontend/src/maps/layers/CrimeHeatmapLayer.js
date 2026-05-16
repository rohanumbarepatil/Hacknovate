import { useEffect, useRef } from 'react';

// Generates dummy crime points clustered heavily in Pune to simulate NCRB Data
const getCrimePoints = () => {
  const points = [];
  const baseLat = 18.5204;
  const baseLng = 73.8567;
  
  // High-density crime cluster (e.g., crowded market areas)
  for (let i = 0; i < 60; i++) {
    points.push(new window.google.maps.LatLng(baseLat + (Math.random() - 0.5) * 0.03, baseLng + (Math.random() - 0.5) * 0.03));
  }
  // Secondary cluster (e.g., specific troubled neighborhoods)
  for (let i = 0; i < 40; i++) {
    points.push(new window.google.maps.LatLng(baseLat - 0.02 + (Math.random() - 0.5) * 0.02, baseLng - 0.02 + (Math.random() - 0.5) * 0.02));
  }
  return points;
};

const CRIME_HOTSPOTS = [
  { lat: 18.5204, lng: 73.8567, title: 'Central Market District', score: 94, incidents: '142 reported this month' },
  { lat: 18.5004, lng: 73.8367, title: 'South Industrial Zone', score: 88, incidents: '89 reported this month' },
];

export default function CrimeHeatmapLayer({ map }) {
  const heatmapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google || !window.google.maps.visualization) return;

    let isMounted = true;
    let activeInfoWindow = null;

    // Crime Heatmap Visualization (Purple/Red intense gradient)
    heatmapRef.current = new window.google.maps.visualization.HeatmapLayer({
      data: getCrimePoints(),
      map: map,
      radius: 45,
      opacity: 0.85,
      gradient: [
        'rgba(0, 0, 0, 0)',
        'rgba(75, 0, 130, 1)',   // Indigo
        'rgba(138, 43, 226, 1)', // BlueViolet
        'rgba(199, 21, 133, 1)', // MediumVioletRed
        'rgba(220, 20, 60, 1)',  // Crimson
        'rgba(255, 0, 0, 1)'     // Red
      ]
    });

    // Add Markers for specific High Crime Clusters
    CRIME_HOTSPOTS.forEach(zone => {
      const marker = new window.google.maps.Marker({
        position: { lat: zone.lat, lng: zone.lng },
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#9333ea', // Purple-600
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 9
        }
      });

      const contentString = `
        <div style="min-width: 220px; font-family: 'Inter', sans-serif; padding: 12px; background: #0b1120; border: 1px solid #1e293b; border-radius: 4px;">
          <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #a855f7; text-transform: uppercase; margin-bottom: 6px;">NCRB CRIME HOTSPOT</div>
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #f8fafc;">${zone.title}</h3>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #94a3b8;">Danger Index</span>
              <span style="color: #a855f7; font-weight: 600;">${zone.score}/100</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #94a3b8;">Recent Activity</span>
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
