import { useEffect, useRef } from 'react';
import mapService from '@/services/mapService';

/**
 * UnsafeRoadLayer — Polyline overlays for dangerous roads
 * Renders red polylines with stroke weight proportional to danger level.
 */
export default function UnsafeRoadLayer({ map }) {
  const polylinesRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google) return;

    let isMounted = true;

    async function loadData() {
      try {
        const response = await mapService.getUnsafeRoads();
        if (!isMounted) return;
        renderRoads(response.data || response || []);
      } catch (err) {
        console.error('Failed to load unsafe roads:', err);

        // Demo roads for Satara
        const demoRoads = [
          {
            name: 'NH4 Bypass - Dark stretch',
            danger_level: 8,
            reason: 'No street lights, frequent accidents',
            path: [
              { lat: 17.6900, lng: 74.0100 },
              { lat: 17.6920, lng: 74.0140 },
              { lat: 17.6940, lng: 74.0180 },
            ],
          },
          {
            name: 'Powai Naka - Sharp turn',
            danger_level: 7,
            reason: 'Blind curve, heavy traffic',
            path: [
              { lat: 17.6810, lng: 74.0220 },
              { lat: 17.6830, lng: 74.0240 },
              { lat: 17.6850, lng: 74.0250 },
            ],
          },
          {
            name: 'Godoli Industrial Road',
            danger_level: 6,
            reason: 'Heavy vehicle traffic, poor condition',
            path: [
              { lat: 17.6780, lng: 74.0280 },
              { lat: 17.6790, lng: 74.0300 },
              { lat: 17.6800, lng: 74.0320 },
              { lat: 17.6810, lng: 74.0340 },
            ],
          },
          {
            name: 'Sadar Bazar narrow lane',
            danger_level: 5,
            reason: 'Narrow road, encroachment',
            path: [
              { lat: 17.6860, lng: 74.0160 },
              { lat: 17.6870, lng: 74.0170 },
              { lat: 17.6880, lng: 74.0180 },
            ],
          },
        ];

        if (!isMounted) return;
        renderRoads(demoRoads);
      }
    }

    function renderRoads(roads) {
      clearPolylines();

      roads.forEach((road) => {
        const dangerLevel = road.danger_level || 5;

        // Color intensity based on danger level
        const opacity = 0.4 + (dangerLevel / 10) * 0.5;
        const weight = 2 + (dangerLevel * 0.6);

        const polyline = new window.google.maps.Polyline({
          path: road.path,
          map,
          strokeColor: '#ef4444',
          strokeOpacity: opacity,
          strokeWeight: weight,
          clickable: true,
        });

        // InfoWindow on click
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #111; padding: 4px; max-width: 220px;">
              <strong style="font-size: 13px;">⚠️ ${road.name}</strong>
              <p style="margin: 4px 0 0; font-size: 12px; color: #666;">
                Danger Level: <span style="color: #ef4444; font-weight: bold;">${dangerLevel}/10</span>
              </p>
              <p style="margin: 2px 0 0; font-size: 11px; color: #888;">
                ${road.reason || ''}
              </p>
            </div>
          `,
        });

        polyline.addListener('click', (e) => {
          infoWindow.setPosition(e.latLng);
          infoWindow.open(map);
        });

        polylinesRef.current.push(polyline);
      });
    }

    function clearPolylines() {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    }

    loadData();

    return () => {
      isMounted = false;
      clearPolylines();
    };
  }, [map]);

  return null;
}
