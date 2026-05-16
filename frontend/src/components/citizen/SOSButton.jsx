import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import sosService from '@/services/sosService';
import { showToast } from '@/components/common/Toast';
import { cn } from '@/utils/cn';

/**
 * SOSButton - Floating emergency trigger for citizens.
 * Requires long-press or double-tap to prevent accidental triggers.
 */
export default function SOSButton() {
  const { location } = useLocation();
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTriggered, setIsTriggered] = useState(false);

  useEffect(() => {
    let interval;
    if (isPressing && !isTriggered) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleTrigger();
            return 100;
          }
          return prev + 5;
        });
      }, 50);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPressing, isTriggered]);

  const handleTrigger = async () => {
    if (!location) {
      showToast({ type: 'error', title: 'Location Error', message: 'Unable to detect your location for SOS' });
      setIsPressing(false);
      return;
    }

    setIsTriggered(true);
    try {
      await sosService.trigger(location);
      showToast({ type: 'success', title: 'SOS Triggered', message: 'Authorities have been notified of your location.' });
    } catch (err) {
      showToast({ type: 'error', title: 'SOS Failed', message: 'Failed to send SOS. Please call emergency services directly.' });
      setIsTriggered(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {!isTriggered ? (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            className="relative"
          >
            {/* Progress Ring */}
            {isPressing && (
              <svg className="absolute inset-[-8px] h-[calc(100%+16px)] w-[calc(100%+16px)] -rotate-90">
                <circle
                  cx="50%" cy="50%" r="48%"
                  fill="none" stroke="white" strokeWidth="4"
                  strokeDasharray="100" strokeDashoffset={100 - progress}
                  className="opacity-20"
                />
              </svg>
            )}

            <button
              onMouseDown={() => setIsPressing(true)}
              onMouseUp={() => setIsPressing(false)}
              onMouseLeave={() => setIsPressing(false)}
              onTouchStart={() => setIsPressing(true)}
              onTouchEnd={() => setIsPressing(false)}
              className={cn(
                "h-20 w-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl",
                isPressing ? "bg-red-700 scale-95" : "bg-red-600 hover:bg-red-500",
                "border-4 border-white/20"
              )}
            >
              <AlertCircle className="h-8 w-8 text-white animate-pulse" />
              <span className="text-[10px] font-black text-white mt-1 uppercase tracking-tighter">
                Hold SOS
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-3 border-2 border-white/30"
          >
            <div className="h-3 w-3 rounded-full bg-white animate-ping" />
            SOS ACTIVE
            <button 
              onClick={() => setIsTriggered(false)}
              className="ml-2 text-xs opacity-70 hover:opacity-100 underline"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
