import { useEffect, useRef, useState, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import useMapStore from '@/store/useMapStore';
import { MAP_STYLE_DARK, MAP_STYLE_TACTICAL } from '@/constants/mapConfig';
import { cn } from '@/utils/cn';

// Environment variable handling for API Key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const libraries = ['places', 'geometry', 'drawing', 'visualization'];

/**
 * MapContainer — Core Google Maps wrapper using @react-google-maps/api
 * Initializes the Google Map instance and manages lifecycle.
 * All layers and controls are rendered as children, passing the map instance to them.
 */
export default function MapContainer({
  children,
  mode = 'tactical',
  className,
  onClick,
  onBoundsChanged,
  minZoom = 10,
  maxZoom = 20,
}) {
  const mapContainerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const { center, zoom, setCenter, setZoom } = useMapStore();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Get map style based on mode
  const getMapStyle = useCallback(() => {
    switch (mode) {
      case 'tactical': return MAP_STYLE_TACTICAL;
      case 'dark': return MAP_STYLE_DARK;
      default: return [];
    }
  }, [mode]);

  // Initialize Google Map once script is loaded
  useEffect(() => {
    if (!isLoaded || loadError || !mapContainerRef.current || mapInstance) return;

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center,
      zoom,
      minZoom,
      maxZoom,
      styles: getMapStyle(),
      disableDefaultUI: true, // Keep it clean and enterprise
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

    setMapInstance(map);

    return () => {
      // Cleanup listeners
      window.google.maps.event.clearInstanceListeners(map);
    };
  }, [isLoaded, loadError]);

  // Update map style when mode changes
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setOptions({ styles: getMapStyle() });
    }
  }, [mode, getMapStyle, mapInstance]);

  if (loadError) {
    return (
      <div className={cn("relative w-full h-full flex items-center justify-center bg-[#0f172a]", className)}>
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-2">Error loading Google Maps</p>
          <p className="text-gray-400 text-sm">Please check your API key and network connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full bg-[#0f172a]', className)}>
      {/* Map container DOM element */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Loading State - Premium Skeleton Loader */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f172a] z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-gray-400 text-sm tracking-widest uppercase font-semibold">Initializing GIS Engine...</p>
          </div>
        </div>
      )}

      {/* Render children (layers) once map is loaded and instance exists */}
      {isLoaded && mapInstance && (
        <div className="absolute inset-0 pointer-events-none z-10">
          
          {/* Custom Map Controls */}
          <div className="absolute right-4 bottom-8 flex flex-col gap-2 pointer-events-auto">
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                      mapInstance.panTo(pos);
                      mapInstance.setZoom(15);
                      setCenter(pos);
                    },
                    () => alert('Geolocation failed or permission denied.')
                  );
                }
              }}
              className="bg-[#1e293b]/90 backdrop-blur-md border border-white/10 p-2.5 rounded-lg shadow-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Locate Me"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button
              onClick={() => {
                mapInstance.panTo(center);
                mapInstance.setZoom(12);
              }}
              className="bg-[#1e293b]/90 backdrop-blur-md border border-white/10 p-2.5 rounded-lg shadow-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Reset Map"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          </div>

          <div className="pointer-events-auto">
            {typeof children === 'function' ? children(mapInstance) : children}
          </div>
        </div>
      )}
    </div>
  );
}
