import { useEffect, useRef } from 'react';
import mapService from '@/services/mapService';
import { HEATMAP_GRADIENT } from '@/constants/mapConfig';

/**
 * CrimeHeatmapLayer — Google Maps HeatmapLayer
 * Renders crime density as a color gradient overlay.
 * Automatically fetches data and cleans up on unmount.
 */
export default function CrimeHeatmapLayer({ map }) {
  const heatmapRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google) return;

    let isMounted = true;

    async function loadData() {
      try {
        const response = await mapService.getCrimeHeatmap();
        if (!isMounted) return;

        const data = (response.data || response || []);

        // Convert to Google Maps LatLng + weight
        const heatmapData = data.map((point) =>
          ({
            location: new window.google.maps.LatLng(point.lat, point.lng),
            weight: point.weight || 1,
          })
        );

        // Create heatmap layer
        const heatmap = new window.google.maps.visualization.HeatmapLayer({
          data: heatmapData,
          map,
          radius: 40,
          opacity: 0.7,
          gradient: HEATMAP_GRADIENT,
        });

        heatmapRef.current = heatmap;
      } catch (err) {
        console.error('Failed to load crime heatmap:', err);

        // Fallback: Demo data for Satara
        const demoData = [
          { lat: 17.6868, lng: 74.0183, weight: 8 },
          { lat: 17.6920, lng: 74.0150, weight: 6 },
          { lat: 17.6800, lng: 74.0220, weight: 10 },
          { lat: 17.6880, lng: 74.0100, weight: 5 },
          { lat: 17.6950, lng: 74.0250, weight: 7 },
          { lat: 17.6830, lng: 74.0180, weight: 9 },
          { lat: 17.6900, lng: 74.0080, weight: 4 },
          { lat: 17.6780, lng: 74.0300, weight: 6 },
          { lat: 17.6850, lng: 74.0120, weight: 8 },
          { lat: 17.6910, lng: 74.0200, weight: 7 },
        ];

        if (!isMounted) return;

        const heatmapData = demoData.map((p) => ({
          location: new window.google.maps.LatLng(p.lat, p.lng),
          weight: p.weight,
        }));

        heatmapRef.current = new window.google.maps.visualization.HeatmapLayer({
          data: heatmapData,
          map,
          radius: 40,
          opacity: 0.7,
          gradient: HEATMAP_GRADIENT,
        });
      }
    }

    loadData();

    // Cleanup: remove heatmap from map
    return () => {
      isMounted = false;
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
        heatmapRef.current = null;
      }
    };
  }, [map]);

  return null; // This component renders directly on the Google Map
}
