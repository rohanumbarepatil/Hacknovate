import { useEffect, useRef, useState, useCallback } from 'react';
import useMapStore from '@/store/useMapStore';
import { MAP_STYLE_DARK, MAP_STYLE_TACTICAL, GOOGLE_MAPS_LIBRARIES } from '@/constants/mapConfig';
import { cn } from '@/utils/cn';

/**
 * MapContainer — Core Google Maps wrapper
 * Initializes the Google Map instance and manages lifecycle.
 * All layers and controls are rendered as children.
 *
 * Usage:
 *   <MapContainer mode="tactical">
 *     {(map) => (
 *       <>
 *         <CrimeHeatmapLayer map={map} />
 *         <LayerToggle />
 *       </>
 *     )}
 *   </MapContainer>
 */
export default function MapContainer({
  children,
  mode = 'dark',
  className,
  onClick,
  onBoundsChanged,
  minZoom = 10,
  maxZoom = 20,
}) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { center, zoom, setCenter, setZoom } = useMapStore();

  // Get map style based on mode
  const getMapStyle = useCallback(() => {
    switch (mode) {
      case 'tactical': return MAP_STYLE_TACTICAL;
      case 'dark': return MAP_STYLE_DARK;
      default: return [];
    }
  }, [mode]);

  // Initialize Google Map
  useEffect(() => {
    if (!window.google || !mapContainerRef.current) return;
    if (mapRef.current) return; // Already initialized

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center,
      zoom,
      minZoom,
      maxZoom,
      styles: getMapStyle(),
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER,
      },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_TOP,
      },
      gestureHandling: 'greedy',
      clickableIcons: false,
    });

    mapRef.current = map;
    setMapInstance(map);
    setIsLoaded(true);

    // Listen for viewport changes
    map.addListener('center_changed', () => {
      const newCenter = map.getCenter();
      if (newCenter) {
        setCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
      }
    });

    map.addListener('zoom_changed', () => {
      setZoom(map.getZoom());
    });

    if (onClick) {
      map.addListener('click', (e) => {
        onClick({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        });
      });
    }

    if (onBoundsChanged) {
      map.addListener('bounds_changed', () => {
        const bounds = map.getBounds();
        if (bounds) {
          onBoundsChanged({
            north: bounds.getNorthEast().lat(),
            east: bounds.getNorthEast().lng(),
            south: bounds.getSouthWest().lat(),
            west: bounds.getSouthWest().lng(),
          });
        }
      });
    }

    return () => {
      // Cleanup listeners
      window.google.maps.event.clearInstanceListeners(map);
    };
  }, []);

  // Update map style when mode changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setOptions({ styles: getMapStyle() });
    }
  }, [mode, getMapStyle]);

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading map...</p>
          </div>
        </div>
      )}

      {/* Render children with map instance */}
      {isLoaded && mapInstance && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="pointer-events-auto">
            {typeof children === 'function' ? children(mapInstance) : children}
          </div>
        </div>
      )}
    </div>
  );
}
