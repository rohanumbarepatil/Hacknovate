import { useEffect, useRef } from 'react';
import mapService from '@/services/mapService';

/**
 * RiskZoneLayer — AI risk zone polygons
 * Colors zones from green (safe) to red (critical) based on score.
 */
export default function RiskZoneLayer({ map }) {
  const polygonsRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google) return;
    let isMounted = true;

    async function loadData() {
      try {
        const response = await mapService.getRiskZones();
        if (!isMounted) return;
        renderZones(response.data || response || []);
      } catch {
        // Demo fallback for Satara wards
        const demo = [
          { name: 'Shanivar Peth', score: 72, center: { lat: 17.6868, lng: 74.0183 } },
          { name: 'Sadar Bazar', score: 58, center: { lat: 17.6900, lng: 74.0140 } },
          { name: 'Godoli', score: 35, center: { lat: 17.6800, lng: 74.0260 } },
          { name: 'Powai Naka', score: 65, center: { lat: 17.6830, lng: 74.0220 } },
          { name: 'Yawateshwar', score: 22, center: { lat: 17.6950, lng: 74.0100 } },
        ];
        if (isMounted) renderDemoCircles(demo);
      }
    }

    function scoreToColor(score) {
      if (score >= 70) return '#ef4444';
      if (score >= 50) return '#f97316';
      if (score >= 30) return '#eab308';
      return '#22c55e';
    }

    function renderZones(zones) {
      clearPolygons();
      zones.forEach((zone) => {
        if (zone.boundary) {
          // Parse GeoJSON polygon
          const coords = JSON.parse(zone.boundary).coordinates[0].map(
            ([lng, lat]) => ({ lat, lng })
          );
          const polygon = new window.google.maps.Polygon({
            paths: coords, map,
            fillColor: scoreToColor(zone.score || 0),
            fillOpacity: 0.25,
            strokeColor: scoreToColor(zone.score || 0),
            strokeWeight: 2, strokeOpacity: 0.6,
            clickable: true,
          });
          const info = new window.google.maps.InfoWindow({
            content: `<div style="color:#111;padding:4px"><strong>📊 ${zone.name}</strong><br/>Risk Score: <b style="color:${scoreToColor(zone.score)}">${zone.score}%</b></div>`,
          });
          polygon.addListener('click', (e) => { info.setPosition(e.latLng); info.open(map); });
          polygonsRef.current.push(polygon);
        }
      });
    }

    function renderDemoCircles(zones) {
      clearPolygons();
      zones.forEach((zone) => {
        const circle = new window.google.maps.Circle({
          center: zone.center, map,
          radius: 500,
          fillColor: scoreToColor(zone.score),
          fillOpacity: 0.2,
          strokeColor: scoreToColor(zone.score),
          strokeWeight: 2, strokeOpacity: 0.5,
          clickable: true,
        });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="color:#111;padding:4px"><strong>📊 ${zone.name}</strong><br/>Risk: <b style="color:${scoreToColor(zone.score)}">${zone.score}%</b></div>`,
        });
        circle.addListener('click', (e) => { info.setPosition(e.latLng); info.open(map); });
        polygonsRef.current.push(circle);
      });
    }

    function clearPolygons() { polygonsRef.current.forEach((p) => p.setMap(null)); polygonsRef.current = []; }
    loadData();
    return () => { isMounted = false; clearPolygons(); };
  }, [map]);

  return null;
}
