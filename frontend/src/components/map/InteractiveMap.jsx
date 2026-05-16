import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const InteractiveMap = ({ incidents = [], riskScores = {}, onMapClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Pune region bounds
    const puneBounds = L.latLngBounds(
      [18.4088, 73.7479], // Southwest corner
      [18.6298, 73.9997]  // Northeast corner
    );

    // Initialize map centered on Pune with restrictions
    const map = L.map(mapRef.current, {
      center: [18.5204, 73.8567],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: puneBounds,
      maxBoundsViscosity: 1.0, // Prevents dragging outside bounds
      zoomControl: true,
      attributionControl: true
    });

    // Use OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      bounds: puneBounds
    }).addTo(map);

    mapInstanceRef.current = map;

    // Handle map clicks
    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick(e.latlng);
      });
    }

    // Force map to render properly
    setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(puneBounds);
    }, 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update heatmap when incidents change
  useEffect(() => {
    if (!mapInstanceRef.current || !incidents.length) return;

    // Remove old heat layer
    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
    }

    // Create heat points
    const heatPoints = incidents.map(inc => [
      inc.lat,
      inc.lng,
      inc.severity === 'critical' ? 1.0 : inc.severity === 'high' ? 0.7 : 0.4
    ]);

    // Add new heat layer
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 35,
      maxZoom: 17,
      gradient: {
        0.0: 'green',
        0.5: 'yellow',
        0.7: 'orange',
        1.0: 'red'
      }
    }).addTo(mapInstanceRef.current);

    heatLayerRef.current = heatLayer;
  }, [incidents]);

  // Update markers when incidents change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    incidents.forEach(incident => {
      const color = incident.severity === 'critical' ? 'red' : 
                    incident.severity === 'high' ? 'orange' : 
                    incident.severity === 'medium' ? 'yellow' : 'green';

      const marker = L.circleMarker([incident.lat, incident.lng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div class="text-gray-900">
          <strong>${incident.type}</strong><br/>
          Severity: ${incident.severity}<br/>
          ${incident.description || ''}
        </div>
      `);

      markersRef.current.push(marker);
    });
  }, [incidents]);

  return (
    <div 
      ref={mapRef} 
      className="w-full rounded-lg shadow-lg"
      style={{ height: '500px', minHeight: '500px' }}
    />
  );
};
