import { useState, useEffect } from 'react';
import useStore from '../store/useStore';

export const useLocation = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentLocation, setCurrentLocation } = useStore();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setCurrentLocation]);

  return { location: currentLocation, error, loading };
};
