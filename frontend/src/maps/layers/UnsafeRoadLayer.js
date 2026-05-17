import { useEffect, useRef } from 'react';

const UNSAFE_ROADS = [
  {
    id: 'R-101',
    name: 'FC Road Dark Alley',
    reason: 'Poor Lighting & Snatching',
    level: 'CRITICAL',
    complaints: 142,
    accidents: 12,
    aiScore: 94,
    path: [
      { lat: 18.5204, lng: 73.8400 },
      { lat: 18.5180, lng: 73.8420 },
      { lat: 18.5150, lng: 73.8410 }
    ]
  },
  {
    id: 'R-102',
    name: 'Camp East Sector',
    reason: 'Repeated Complaints',
    level: 'HIGH',
    complaints: 84,
    accidents: 5,
    aiScore: 82,
    path: [
      { lat: 18.5304, lng: 73.8700 },
      { lat: 18.5350, lng: 73.8720 },
      { lat: 18.5400, lng: 73.8680 }
    ]
  },
  {
    id: 'R-103',
    name: 'Kothrud Pothole Zone',
    reason: 'Severe Road Damage',
    level: 'MEDIUM',
    complaints: 45,
    accidents: 1,
    aiScore: 65,
    path: [
      { lat: 18.5074, lng: 73.8190 },
      { lat: 18.5085, lng: 73.8160 }
    ]
  }
];

const getStyleForLevel = (level) => {
  switch (level) {
    case 'LOW': return { color: '#f59e0b', weight: 4, glowWeight: 8, pulseOpacity: [0.6, 0.8] }; // thin amber
    case 'MEDIUM': return { color: '#ea580c', weight: 6, glowWeight: 12, pulseOpacity: [0.6, 0.9] }; // orange-red
    case 'HIGH': return { color: '#ef4444', weight: 8, glowWeight: 16, pulseOpacity: [0.7, 1.0] }; // bright red glowing
    case 'CRITICAL': return { color: '#be123c', weight: 10, glowWeight: 20, pulseOpacity: [0.5, 1.0] }; // pulsing crimson
    default: return { color: '#ef4444', weight: 6, glowWeight: 12, pulseOpacity: [0.4, 0.8] };
  }
};

export default function UnsafeRoadLayer({ map }) {
  const linesRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google) return;

    let activeInfoWindow = null;
    let animationPhase = 0;
    let arrowOffset = 0;
    let animInterval = null;
    const directionsService = new window.google.maps.DirectionsService();

    const getSnappedPath = async (path) => {
      if (path.length < 2) return path;
      const origin = path[0];
      const destination = path[path.length - 1];
      const waypoints = path.slice(1, -1).map(p => ({ location: p, stopover: false }));

      try {
        const result = await directionsService.route({
          origin,
          destination,
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING
        });
        return result.routes[0].overview_path;
      } catch (err) {
        console.warn("Directions routing failed, using fallback straight lines:", err);
        return path;
      }
    };

    const renderLines = async () => {
      for (const road of UNSAFE_ROADS) {
        // Snap the road points exactly to Google Maps geometry
        const snappedPath = await getSnappedPath(road.path);
        const style = getStyleForLevel(road.level);

        // 1. Subtle Glow Background Layer
        const glowLine = new window.google.maps.Polyline({
          path: snappedPath,
          geodesic: true,
          strokeColor: style.color,
          strokeOpacity: 0.3,
          strokeWeight: style.glowWeight,
          map: map,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        });

        // 2. Core Operational Layer with Animation Icons
        const coreLine = new window.google.maps.Polyline({
          path: snappedPath,
          geodesic: true,
          strokeColor: style.color,
          strokeOpacity: style.pulseOpacity[0],
          strokeWeight: style.weight,
          map: map,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          icons: [{
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 2.5,
              strokeColor: '#ffffff',
              fillColor: '#ffffff',
              fillOpacity: 0.9,
              strokeWeight: 1
            },
            offset: '0%'
          }]
        });

        // 3. Invisible Interaction Layer (for precise clicking)
        const clickLine = new window.google.maps.Polyline({
          path: snappedPath,
          strokeOpacity: 0.0,
          strokeWeight: Math.max(25, style.glowWeight * 1.5),
          map: map,
          zIndex: 100,
          cursor: 'pointer'
        });

        const contentString = `
          <div style="min-width: 240px; font-family: 'Inter', sans-serif; padding: 16px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: ${style.color}; text-transform: uppercase;">
                ${road.level} RISK ROUTE
              </div>
              <div style="background: rgba(239,68,68,0.1); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.2); font-size: 10px; color: #ef4444; font-weight: 700;">
                AI SCORE: ${road.aiScore}/100
              </div>
            </div>
            
            <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em;">${road.name}</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
               <div style="background: #1e293b; padding: 8px; border-radius: 6px;">
                 <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px;">Complaints</div>
                 <div style="font-size: 14px; font-weight: 600; color: #f8fafc;">${road.complaints}</div>
               </div>
               <div style="background: #1e293b; padding: 8px; border-radius: 6px;">
                 <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px;">Accidents</div>
                 <div style="font-size: 14px; font-weight: 600; color: #f8fafc;">${road.accidents}</div>
               </div>
            </div>

            <div style="font-size: 12px; color: #cbd5e1; display: flex; align-items: flex-start; gap: 6px; margin-bottom: 12px;">
              <span style="color: #f59e0b; font-size: 14px; line-height: 1.2;">⚠️</span> 
              <span><strong style="color: #f8fafc;">Primary Hazard:</strong> ${road.reason}</span>
            </div>
            
            <button style="width: 100%; margin-top: 8px; padding: 10px; background: #3b82f6; border: none; border-radius: 6px; font-size: 11px; color: #ffffff; cursor: pointer; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
              Calculate Safer Route
            </button>
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({ 
          content: contentString,
          pixelOffset: new window.google.maps.Size(0, -10)
        });

        // Hover effects for tactile interaction
        clickLine.addListener('mouseover', () => {
          glowLine.setOptions({ strokeOpacity: 0.6, strokeWeight: style.glowWeight * 1.2 });
        });
        clickLine.addListener('mouseout', () => {
          glowLine.setOptions({ strokeOpacity: 0.3, strokeWeight: style.glowWeight });
        });

        clickLine.addListener('click', (e) => {
          if (activeInfoWindow) activeInfoWindow.close();
          infoWindow.setPosition(e.latLng);
          infoWindow.open(map);
          activeInfoWindow = infoWindow;
        });

        linesRef.current.push({ coreLine, glowLine, clickLine, styleOptions: style });
      }

      // Smooth 60fps RequestAnimationFrame Animation Loop
      const animate = () => {
        animationPhase += 1;
        arrowOffset = (arrowOffset + 0.3) % 100;
        
        linesRef.current.forEach(({ coreLine, styleOptions }) => {
          // 1. Dynamic opacity pulsing
          const range = styleOptions.pulseOpacity[1] - styleOptions.pulseOpacity[0];
          // Use sine wave for smooth pulsing, adjust frequency based on phase
          const opacity = styleOptions.pulseOpacity[0] + (Math.sin(animationPhase * 0.05) * 0.5 + 0.5) * range;
          
          coreLine.setOptions({ strokeOpacity: opacity });
          
          // 2. Animated flow marker
          const icons = coreLine.get('icons');
          if (icons && icons.length > 0) {
            icons[0].offset = `${arrowOffset}%`;
            coreLine.set('icons', icons);
          }
        });
        
        animInterval = requestAnimationFrame(animate);
      };
      
      animate();
    };

    renderLines();

    return () => {
      linesRef.current.forEach(({ coreLine, glowLine, clickLine }) => {
        coreLine.setMap(null);
        glowLine.setMap(null);
        clickLine.setMap(null);
      });
      linesRef.current = [];
      if (animInterval) cancelAnimationFrame(animInterval);
    };
  }, [map]);

  return null;
}
