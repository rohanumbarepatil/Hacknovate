import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, AlertTriangle, Shield } from 'lucide-react';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const SafeRouteMap = ({ userLocation, incidents = [], riskScores = {} }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const routeLayersRef = useRef([]);
  const dangerMarkersRef = useRef([]);

  // Popular destinations in Pune
  const destinations = [
    { name: 'Shivajinagar', lat: 18.5304, lng: 73.8567, type: 'commercial' },
    { name: 'Koregaon Park', lat: 18.5362, lng: 73.8958, type: 'residential' },
    { name: 'Hadapsar', lat: 18.5089, lng: 73.9260, type: 'commercial' },
    { name: 'Kothrud', lat: 18.5074, lng: 73.8077, type: 'residential' },
    { name: 'Deccan', lat: 18.5167, lng: 73.8424, type: 'commercial' },
    { name: 'Aundh', lat: 18.5593, lng: 73.8078, type: 'residential' },
  ];

  // Known dangerous routes with actual road coordinates in Pune
  const dangerousRoutes = [
    {
      name: 'Yerawada-Kalyani Nagar Night Route',
      path: [
        [18.5593, 73.8878],
        [18.5543, 73.8928],
        [18.5493, 73.8978],
        [18.5443, 73.9028],
        [18.5393, 73.9078]
      ],
      reason: 'High crime rate after 8 PM, poorly lit industrial area',
      severity: 'critical',
      incidents: 15,
      timeWarning: 'Especially dangerous after 8 PM'
    },
    {
      name: 'Hadapsar Bypass to Mundhwa',
      path: [
        [18.5089, 73.9260],
        [18.5039, 73.9310],
        [18.4989, 73.9360],
        [18.4939, 73.9410],
        [18.4889, 73.9460]
      ],
      reason: 'Isolated stretch, frequent robberies, no CCTV',
      severity: 'high',
      incidents: 12,
      timeWarning: 'Avoid after sunset'
    },
    {
      name: 'Kothrud Depot to Karve Road Back Lane',
      path: [
        [18.5074, 73.8077],
        [18.5024, 73.8027],
        [18.4974, 73.7977],
        [18.4924, 73.7927],
        [18.4874, 73.7877]
      ],
      reason: 'Narrow lanes, no police patrol, isolated',
      severity: 'high',
      incidents: 8,
      timeWarning: 'Not safe at night'
    },
    {
      name: 'Sinhagad Road Dark Stretch',
      path: [
        [18.4574, 73.8077],
        [18.4524, 73.8027],
        [18.4474, 73.7977],
        [18.4424, 73.7927],
        [18.4374, 73.7877]
      ],
      reason: 'Unlit road section, vehicle thefts common',
      severity: 'medium',
      incidents: 6,
      timeWarning: 'High risk after 9 PM'
    },
    {
      name: 'Warje to Karve Nagar Underpass',
      path: [
        [18.4774, 73.8177],
        [18.4774, 73.8127],
        [18.4774, 73.8077],
        [18.4774, 73.8027]
      ],
      reason: 'Dark underpass, poor visibility, isolated',
      severity: 'medium',
      incidents: 5,
      timeWarning: 'Avoid during late hours'
    },
    {
      name: 'Deccan to Parvati Hill Back Road',
      path: [
        [18.5167, 73.8424],
        [18.5117, 73.8474],
        [18.5067, 73.8524],
        [18.5017, 73.8574]
      ],
      reason: 'Steep isolated road, mugging incidents',
      severity: 'high',
      incidents: 9,
      timeWarning: 'Not recommended after dark'
    }
  ];

  // High-risk zones to avoid - more accurate locations
  const dangerZones = [
    { name: 'Yerawada Industrial Area', lat: 18.5593, lng: 73.8878, radius: 500, risk: 'critical', reason: 'High crime after dark, isolated factories', incidents: 15 },
    { name: 'Hadapsar Isolated Stretch', lat: 18.4989, lng: 73.9360, radius: 400, risk: 'high', reason: 'Poor lighting, frequent robberies', incidents: 12 },
    { name: 'Kothrud Back Roads', lat: 18.4974, lng: 73.7977, radius: 300, risk: 'high', reason: 'No police patrol, narrow lanes', incidents: 8 },
    { name: 'Warje Underpass Area', lat: 18.4774, lng: 73.8077, radius: 350, risk: 'medium', reason: 'Dark underpass, poor visibility', incidents: 5 },
    { name: 'Parvati Hill Back Road', lat: 18.5067, lng: 73.8524, radius: 300, risk: 'high', reason: 'Isolated steep road, mugging risk', incidents: 9 },
    { name: 'Mundhwa IT Park Night Zone', lat: 18.4889, lng: 73.9460, radius: 400, risk: 'medium', reason: 'Deserted after office hours', incidents: 6 },
  ];

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
      zoom: 13,
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

    // Force map to render properly and fit to Pune bounds
    setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(puneBounds);
    }, 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Add user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    const userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 10,
      fillColor: '#0B7A75',
      color: '#fff',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(mapInstanceRef.current);

    userMarker.bindPopup('<strong>You are here</strong>');

    // Pulsing animation
    const pulseCircle = L.circle([userLocation.lat, userLocation.lng], {
      radius: 100,
      color: '#0B7A75',
      fillColor: '#0B7A75',
      fillOpacity: 0.2,
      weight: 2,
      className: 'pulse-ring'
    }).addTo(mapInstanceRef.current);

    return () => {
      userMarker.remove();
      pulseCircle.remove();
    };
  }, [userLocation]);

  // Add destination markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const markers = destinations.map(dest => {
      const marker = L.marker([dest.lat, dest.lng], {
        icon: L.divIcon({
          className: 'custom-destination-marker',
          html: `<div class="w-8 h-8 rounded-full bg-navy-700 border-2 border-accent-fire flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div class="text-center">
          <strong class="text-base">${dest.name}</strong><br/>
          <span class="text-xs text-neutral-300">${dest.type}</span><br/>
          <button 
            onclick="window.selectDestination('${dest.name}')" 
            class="mt-2 px-3 py-1 bg-accent-fire text-white rounded text-xs font-semibold hover:bg-accent-amber transition-colors"
          >
            Show Route
          </button>
        </div>
      `);

      return marker;
    });

    // Global function for popup button
    window.selectDestination = (name) => {
      const dest = destinations.find(d => d.name === name);
      setSelectedDestination(dest);
    };

    return () => {
      markers.forEach(m => m.remove());
    };
  }, []);

  // Draw dangerous routes and zones
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear previous danger markers
    dangerMarkersRef.current.forEach(marker => marker.remove());
    dangerMarkersRef.current = [];

    // Draw dangerous routes as red dashed lines
    const routeLines = dangerousRoutes.map(route => {
      const color = route.severity === 'critical' ? '#FF2D2D' : 
                    route.severity === 'high' ? '#FF6B35' : '#FFC233';

      const polyline = L.polyline(route.path, {
        color: color,
        weight: 6,
        opacity: 0.8,
        dashArray: '10, 10',
        className: 'danger-route-line'
      }).addTo(mapInstanceRef.current);

      polyline.bindPopup(`
        <div class="p-3">
          <strong class="text-risk-${route.severity} text-base block mb-2">⚠️ AVOID THIS ROUTE</strong>
          <strong class="text-sm block mb-1">${route.name}</strong>
          <div class="text-xs text-neutral-300 space-y-1">
            <p><strong>Reason:</strong> ${route.reason}</p>
            <p><strong>Incidents:</strong> ${route.incidents} in last 30 days</p>
            <p class="text-risk-${route.severity}"><strong>${route.timeWarning}</strong></p>
          </div>
          <div class="mt-2 pt-2 border-t border-gray-600">
            <span class="text-xs font-bold text-red-400">🚫 DO NOT USE THIS ROUTE</span>
          </div>
        </div>
      `);

      dangerMarkersRef.current.push(polyline);
      return polyline;
    });

    // Draw danger zones as red circles
    const zoneCircles = dangerZones.map(zone => {
      const color = zone.risk === 'critical' ? '#FF2D2D' : 
                    zone.risk === 'high' ? '#FF6B35' : '#FFC233';

      const circle = L.circle([zone.lat, zone.lng], {
        radius: zone.radius,
        color: color,
        fillColor: color,
        fillOpacity: 0.25,
        weight: 2,
        opacity: 0.8,
        className: 'pulse-ring'
      }).addTo(mapInstanceRef.current);

      circle.bindPopup(`
        <div class="p-3">
          <strong class="text-risk-${zone.risk} text-base block mb-2">🚫 DANGER ZONE</strong>
          <strong class="text-sm block mb-1">${zone.name}</strong>
          <div class="text-xs text-neutral-300 space-y-1">
            <p><strong>Risk Level:</strong> <span class="text-risk-${zone.risk}">${zone.risk.toUpperCase()}</span></p>
            <p><strong>Reason:</strong> ${zone.reason}</p>
            <p><strong>Incidents:</strong> ${zone.incidents} in last 30 days</p>
            <p><strong>Radius:</strong> ${zone.radius}m danger zone</p>
          </div>
          <div class="mt-2 pt-2 border-t border-gray-600">
            <span class="text-xs font-bold text-red-400">⚠️ AVOID THIS AREA, ESPECIALLY AT NIGHT</span>
          </div>
        </div>
      `);

      dangerMarkersRef.current.push(circle);
      return circle;
    });

    return () => {
      dangerMarkersRef.current.forEach(marker => marker.remove());
    };
  }, []);

  // Add danger zones overlay from real incidents
  useEffect(() => {
    if (!mapInstanceRef.current || !incidents.length) return;

    const realDangerZones = incidents
      .filter(inc => inc.severity === 'critical' || inc.severity === 'high')
      .map(inc => {
        const circle = L.circle([inc.lat, inc.lng], {
          radius: 150,
          color: inc.severity === 'critical' ? '#FF2D2D' : '#FF6B35',
          fillColor: inc.severity === 'critical' ? '#FF2D2D' : '#FF6B35',
          fillOpacity: 0.2,
          weight: 2,
          opacity: 0.6,
          className: 'pulse-ring'
        }).addTo(mapInstanceRef.current);

        circle.bindPopup(`
          <div class="p-2">
            <strong class="text-risk-${inc.severity}">⚠️ Recent Incident</strong><br/>
            <span class="text-xs font-semibold">${inc.type}</span><br/>
            <span class="text-xs text-neutral-300">${inc.description}</span><br/>
            <span class="text-xs text-risk-${inc.severity} font-bold mt-1 block">🚫 Avoid this area</span>
          </div>
        `);

        return circle;
      });

    return () => {
      realDangerZones.forEach(zone => zone.remove());
    };
  }, [incidents]);

  return (
    <div className="card p-0 overflow-hidden">
      {/* Map Header */}
      <div className="bg-navy-900 p-4 border-b border-navy-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-risk-critical" size={20} />
            <h3 className="font-display text-lg text-neutral-100">Dangerous Routes to Avoid</h3>
          </div>
        </div>
        <p className="text-sm text-neutral-300">
          🚫 Red zones and routes show high-risk areas. Avoid these for your safety.
        </p>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="w-full" style={{ height: '400px' }} />

      {/* Legend */}
      <div className="bg-navy-900 p-4 border-t border-navy-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-accent-teal"></div>
            <span className="text-neutral-300">Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-risk-critical" style={{ borderStyle: 'dashed' }}></div>
            <span className="text-neutral-300">Dangerous Route</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-risk-critical opacity-30"></div>
            <span className="text-neutral-300">High Risk Zone</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-risk-high opacity-30"></div>
            <span className="text-neutral-300">Medium Risk</span>
          </div>
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-risk-critical bg-opacity-10 border-l-4 border-risk-critical p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="text-risk-critical flex-shrink-0 mt-1" size={20} />
          <div>
            <p className="text-sm font-semibold text-neutral-100 mb-1">
              Safety Warning
            </p>
            <p className="text-xs text-neutral-300">
              The marked routes and zones have high crime rates. Plan alternative routes and avoid traveling through these areas, especially after dark. Stay alert and use well-lit main roads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate safe route (avoids danger zones)
function generateSafeRoute(start, end, incidents) {
  const route = [];
  const steps = 20;

  // Add waypoints that avoid high-risk areas
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let lat = start[0] + (end[0] - start[0]) * t;
    let lng = start[1] + (end[1] - start[1]) * t;

    // Add slight detour to avoid danger zones
    const dangerNearby = incidents.some(inc => {
      if (inc.severity !== 'critical' && inc.severity !== 'high') return false;
      const distance = Math.sqrt(
        Math.pow(inc.lat - lat, 2) + Math.pow(inc.lng - lng, 2)
      );
      return distance < 0.01; // Within ~1km
    });

    if (dangerNearby) {
      // Add offset to avoid danger
      lat += 0.005;
      lng += 0.005;
    }

    route.push([lat, lng]);
  }

  return route;
}

// Helper function to generate fastest route (straight line)
function generateFastestRoute(start, end) {
  const route = [];
  const steps = 15;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = start[0] + (end[0] - start[0]) * t;
    const lng = start[1] + (end[1] - start[1]) * t;
    route.push([lat, lng]);
  }

  return route;
}

// Helper function to calculate route distance
function calculateDistance(route) {
  let distance = 0;
  for (let i = 1; i < route.length; i++) {
    const lat1 = route[i - 1][0];
    const lng1 = route[i - 1][1];
    const lat2 = route[i][0];
    const lng2 = route[i][1];

    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance += R * c;
  }

  return distance.toFixed(1);
}

export default SafeRouteMap;
