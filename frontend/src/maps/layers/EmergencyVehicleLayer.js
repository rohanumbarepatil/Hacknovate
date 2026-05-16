import { useEffect, useRef } from 'react';

const EMERGENCY_UNITS = [
  { id: 'PD-404', type: 'Police', lat: 18.5254, lng: 73.8567, color: '#3b82f6', status: 'Patrolling', speed: [0.0001, 0.00005] },
  { id: 'MED-108', type: 'Ambulance', lat: 18.5150, lng: 73.8500, color: '#ef4444', status: 'En Route', speed: [-0.00015, 0.0001] },
  { id: 'FD-09', type: 'Fire Station', lat: 18.5300, lng: 73.8650, color: '#f97316', status: 'Standby', speed: [0, 0] },
];

export default function EmergencyVehicleLayer({ map }) {
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google) return;

    let activeInfoWindow = null;
    let animInterval = null;

    // We store the instances in a mutable way so we can animate their positions
    const unitsData = EMERGENCY_UNITS.map(u => ({ ...u, currentLat: u.lat, currentLng: u.lng }));

    function renderMarkers() {
      unitsData.forEach((unit) => {
        const marker = new window.google.maps.Marker({
          position: { lat: unit.currentLat, lng: unit.currentLng },
          map: map,
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: unit.color,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
            scale: 5,
            rotation: Math.atan2(unit.speed[1], unit.speed[0]) * (180 / Math.PI)
          }
        });

        // Fire station has circle icon
        if (unit.speed[0] === 0 && unit.speed[1] === 0) {
           marker.setIcon({
             path: window.google.maps.SymbolPath.CIRCLE,
             fillColor: unit.color,
             fillOpacity: 1,
             strokeColor: '#ffffff',
             strokeWeight: 2,
             scale: 8
           });
        }

        const contentString = `
          <div style="min-width: 180px; font-family: 'Inter', sans-serif; padding: 12px; background: #0b1120; border: 1px solid #1e293b; border-radius: 4px;">
            <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: ${unit.color}; text-transform: uppercase; margin-bottom: 6px;">${unit.type} UNIT</div>
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #f8fafc;">Unit ${unit.id}</h3>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px;">
                <span style="color: #94a3b8;">Status</span>
                <span style="color: #10b981; font-weight: 600;">${unit.status}</span>
              </div>
              ${unit.speed[0] !== 0 ? `
              <div style="display: flex; justify-content: space-between; font-size: 11px;">
                <span style="color: #94a3b8;">ETA to Target</span>
                <span style="color: #f8fafc; font-weight: 600;">4 mins</span>
              </div>` : ''}
            </div>
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({ content: contentString });

        marker.addListener('click', () => {
          if (activeInfoWindow) activeInfoWindow.close();
          infoWindow.open(map, marker);
          activeInfoWindow = infoWindow;
        });

        markersRef.current.push({ marker, unitData: unit });
      });

      // Animate Movement
      animInterval = setInterval(() => {
        markersRef.current.forEach(({ marker, unitData }) => {
          if (unitData.speed[0] !== 0 || unitData.speed[1] !== 0) {
            unitData.currentLat += unitData.speed[0];
            unitData.currentLng += unitData.speed[1];
            marker.setPosition({ lat: unitData.currentLat, lng: unitData.currentLng });
          }
        });
      }, 100); // Super smooth 10fps update for realistic radar tracking
    }

    renderMarkers();

    return () => {
      markersRef.current.forEach(({ marker }) => marker.setMap(null));
      markersRef.current = [];
      if (animInterval) clearInterval(animInterval);
    };
  }, [map]);

  return null;
}
