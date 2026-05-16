import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import socket from '../../services/socket';
import useStore from '../../store/useStore';
import { ref, set } from 'firebase/database';
import { rtdb } from '../../services/firebase';

export const SOSButton = () => {
  const [isTriggering, setIsTriggering] = useState(false);
  const { user, currentLocation } = useStore();

  const triggerSOS = async () => {
    if (!currentLocation) {
      alert('Location not available. Please enable GPS.');
      return;
    }

    setIsTriggering(true);
    const sosId = Date.now().toString();

    try {
      // Write to Firebase Realtime DB (zero-latency)
      await set(ref(rtdb, `sos/${sosId}`), {
        userId: user?.uid,
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        timestamp: Date.now(),
        status: 'active'
      });

      // Emit via Socket.io
      socket.emit('sos:trigger', {
        userId: user?.uid,
        lat: currentLocation.lat,
        lng: currentLocation.lng
      });

      alert('🚨 SOS Alert Sent! Help is on the way.');
    } catch (error) {
      console.error('SOS Error:', error);
      alert('Failed to send SOS. Please try again.');
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <button
      onClick={triggerSOS}
      disabled={isTriggering}
      className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 
                 flex items-center justify-center shadow-2xl transform transition-all 
                 hover:scale-110 active:scale-95 animate-pulse"
    >
      <div className="text-center text-white">
        <AlertCircle size={48} />
        <div className="mt-2 font-bold text-lg">SOS</div>
      </div>
    </button>
  );
};
