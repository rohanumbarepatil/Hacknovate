import { useEffect, useRef } from 'react';

const UNSAFE_ROADS = [
  {
    id: 'R-101',
    name: 'FC Road Dark Alley',
    reason: 'Poor Lighting & Snatching',
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
    path: [
      { lat: 18.5304, lng: 73.8700 },
      { lat: 18.5350, lng: 73.8720 },
      { lat: 18.5400, lng: 73.8680 }
    ]
  }
];

export default function UnsafeRoadLayer({ map }) {
  const linesRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google) return;

    let activeInfoWindow = null;
    let animationPhase = 0;
    let animInterval = null;

    function renderLines() {
      UNSAFE_ROADS.forEach((road) => {
        // Red glowing path
        const line = new window.google.maps.Polyline({
          path: road.path,
          geodesic: true,
          strokeColor: '#ef4444',
          strokeOpacity: 0, // Controlled by animation
          strokeWeight: 6,
          map: map
        });

        // Clickable invisible thick line for easier interaction
        const clickLine = new window.google.maps.Polyline({
          path: road.path,
          strokeOpacity: 0.0,
          strokeWeight: 20,
          map: map,
          zIndex: 100
        });

        const contentString = `
          <div style="min-width: 200px; font-family: 'Inter', sans-serif; padding: 12px; background: #0b1120; border: 1px solid #1e293b; border-radius: 4px;">
            <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #ef4444; text-transform: uppercase; margin-bottom: 6px;">UNSAFE ROUTE</div>
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #f8fafc;">${road.name}</h3>
            <div style="font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px;">
              <span style="color: #f97316;">⚠️</span> ${road.reason}
            </div>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #1e293b; font-size: 10px; color: #3b82f6; cursor: pointer; text-transform: uppercase; font-weight: 600;">
              View Safe Alternative →
            </div>
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({ content: contentString });

        clickLine.addListener('click', (e) => {
          if (activeInfoWindow) activeInfoWindow.close();
          infoWindow.setPosition(e.latLng);
          infoWindow.open(map);
          activeInfoWindow = infoWindow;
        });

        linesRef.current.push({ visual: line, click: clickLine });
      });

      // Animated warning borders (pulsing opacity)
      animInterval = setInterval(() => {
        animationPhase = (animationPhase + 1) % 20;
        const opacity = 0.4 + (Math.sin(animationPhase * 0.314) * 0.4);
        
        linesRef.current.forEach(({ visual }) => {
          visual.setOptions({ strokeOpacity: opacity });
        });
      }, 100);
    }

    renderLines();

    return () => {
      linesRef.current.forEach(({ visual, click }) => {
        visual.setMap(null);
        click.setMap(null);
      });
      linesRef.current = [];
      if (animInterval) clearInterval(animInterval);
    };
  }, [map]);

  return null;
}
