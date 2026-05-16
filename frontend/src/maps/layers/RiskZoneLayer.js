import { useEffect, useRef } from 'react';

const AI_RISK_ZONES = [
  { id: 'Z-Alpha', lat: 18.5204, lng: 73.8567, radius: 800, threatLevel: 'HIGH', score: 89, reason: 'Crowd density spike & 5 complaints' },
  { id: 'Z-Beta', lat: 18.5400, lng: 73.8400, radius: 1200, threatLevel: 'ELEVATED', score: 74, reason: 'Historical night-time crime data' },
  { id: 'Z-Gamma', lat: 18.5100, lng: 73.8700, radius: 600, threatLevel: 'MODERATE', score: 55, reason: 'Traffic anomalies detected' },
];

export default function RiskZoneLayer({ map }) {
  const circlesRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google) return;

    let activeInfoWindow = null;
    let animInterval = null;

    function renderZones() {
      AI_RISK_ZONES.forEach(zone => {
        const color = zone.threatLevel === 'HIGH' ? '#ef4444' : zone.threatLevel === 'ELEVATED' ? '#f97316' : '#eab308';
        
        const circle = new window.google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: color,
          fillOpacity: 0.15,
          map,
          center: { lat: zone.lat, lng: zone.lng },
          radius: zone.radius
        });

        const contentString = `
          <div style="min-width: 220px; font-family: 'Inter', sans-serif; padding: 12px; background: #0b1120; border: 1px solid #1e293b; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: ${color}; text-transform: uppercase;">AI RISK ZONE</span>
              <span style="padding: 2px 6px; background: ${color}20; color: ${color}; font-size: 9px; font-weight: bold; border-radius: 2px;">${zone.threatLevel}</span>
            </div>
            <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #f8fafc;">Zone ${zone.id}</h3>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px; line-height: 1.4;">
              ${zone.reason}
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #1e293b; padding-top: 8px;">
               <span style="font-size: 10px; color: #64748b; text-transform: uppercase;">Threat Score</span>
               <span style="font-size: 11px; color: #f8fafc; font-weight: 600;">${zone.score}%</span>
            </div>
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({ content: contentString });

        circle.addListener('click', (e) => {
          if (activeInfoWindow) activeInfoWindow.close();
          infoWindow.setPosition(e.latLng);
          infoWindow.open(map);
          activeInfoWindow = infoWindow;
        });

        circlesRef.current.push({ circle, baseRadius: zone.radius });
      });

      // Animated pulsing risk circles
      let phase = 0;
      animInterval = setInterval(() => {
        phase += 0.05;
        circlesRef.current.forEach(({ circle, baseRadius }) => {
          const pulse = Math.sin(phase) * (baseRadius * 0.05); // +/- 5% radius pulse
          circle.setRadius(baseRadius + pulse);
        });
      }, 50);
    }

    renderZones();

    return () => {
      circlesRef.current.forEach(({ circle }) => circle.setMap(null));
      circlesRef.current = [];
      if (animInterval) clearInterval(animInterval);
    };
  }, [map]);

  return null;
}
