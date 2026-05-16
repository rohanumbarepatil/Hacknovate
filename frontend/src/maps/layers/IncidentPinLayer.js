import { useEffect, useRef } from 'react';

const DEMO_PUNE_INCIDENTS = [
  { id: 'PMC-741', lat: 18.5204, lng: 73.8567, type: 'Pothole', title: 'Severe Road Damage', severity: 9, time: '2 mins ago', color: '#ef4444' },
  { id: 'PMC-742', lat: 18.5240, lng: 73.8600, type: 'Waterlogging', title: 'Drainage Overflow', severity: 8, time: '5 mins ago', color: '#ef4444' },
  { id: 'PMC-743', lat: 18.5180, lng: 73.8510, type: 'Streetlight', title: 'Broken Streetlights', severity: 6, time: '14 mins ago', color: '#f97316' },
  { id: 'PMC-744', lat: 18.5280, lng: 73.8550, type: 'Garbage', title: 'Uncollected Waste', severity: 3, time: '32 mins ago', color: '#eab308' },
  { id: 'PMC-745', lat: 18.5150, lng: 73.8620, type: 'Water', title: 'Pipeline Leak', severity: 5, time: '18 mins ago', color: '#f97316' },
  { id: 'PMC-746', lat: 18.5320, lng: 73.8450, type: 'Infrastructure', title: 'Fallen Tree', severity: 7, time: '1 min ago', color: '#ef4444' }
];

export default function IncidentPinLayer({ map }) {
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google) return;
    
    let isMounted = true;
    let activeInfoWindow = null;
    let pulseInterval = null;

    function renderMarkers() {
      clearMarkers();
      
      DEMO_PUNE_INCIDENTS.forEach((p) => {
        const marker = new window.google.maps.Marker({
          position: { lat: p.lat, lng: p.lng }, 
          map,
          title: p.title,
          icon: { 
            path: window.google.maps.SymbolPath.CIRCLE, 
            fillColor: p.color, 
            fillOpacity: 0.9, 
            strokeColor: p.color, 
            strokeOpacity: 0.4,
            strokeWeight: 4, 
            scale: 7 
          },
        });
        
        const contentString = `
          <div style="min-width: 240px; font-family: 'Inter', sans-serif; padding: 14px; background: #0b1120; border: 1px solid #1e293b; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: ${p.color}; text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${p.color}; box-shadow: 0 0 5px ${p.color};"></span>
                ${p.type} ALERT
              </span>
              <span style="font-size: 9px; color: #64748b; font-family: monospace;">${p.id}</span>
            </div>
            <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600; color: #f8fafc; line-height: 1.3;">${p.title}</h3>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px; border-top: 1px solid #1e293b; padding-top: 10px;">
              <div style="padding: 2px 6px; border-radius: 2px; background: ${p.color}20; border: 1px solid ${p.color}40; color: ${p.color}; font-size: 10px; font-weight: 600; text-transform: uppercase;">
                Severity: ${p.severity}/10
              </div>
              <div style="font-size: 10px; color: #94a3b8; font-weight: 500;">
                ${p.time}
              </div>
            </div>
          </div>
        `;

        const info = new window.google.maps.InfoWindow({ content: contentString });
        
        marker.addListener('click', () => {
          if(activeInfoWindow) activeInfoWindow.close();
          info.open(map, marker);
          activeInfoWindow = info;
        });
        
        markersRef.current.push({ marker, color: p.color });
      });

      // Pulse Animation Logic
      let pulsePhase = 0;
      pulseInterval = setInterval(() => {
        pulsePhase = (pulsePhase + 1) % 20;
        const scaleBase = 7;
        const scaleWave = Math.sin(pulsePhase * 0.314) * 2; 
        
        markersRef.current.forEach(({ marker, color }) => {
           marker.setIcon({
             path: window.google.maps.SymbolPath.CIRCLE, 
             fillColor: color, 
             fillOpacity: 1, 
             strokeColor: color, 
             strokeOpacity: 0.3 + (Math.sin(pulsePhase * 0.314) * 0.2), // Fades out
             strokeWeight: 6 + scaleWave, 
             scale: scaleBase
           });
        });
      }, 100);
    }

    function clearMarkers() { 
      markersRef.current.forEach(({marker}) => marker.setMap(null)); 
      markersRef.current = []; 
      if (pulseInterval) clearInterval(pulseInterval);
    }
    
    renderMarkers();
    
    return () => { isMounted = false; clearMarkers(); };
  }, [map]);

  return null;
}
