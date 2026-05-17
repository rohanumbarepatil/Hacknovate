import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { push, ref as dbRef, set, update } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { auth, rtdb, storage } from '@/services/firebase';
import sosService from '@/services/sosService';
import useAuthStore from '@/store/useAuthStore';
import useStore from '@/store/useStore';
import { showToast } from '@/components/common/Toast';

const RECORDING_SECONDS = 10;
const GEOLOCATION_TIMEOUT_MS = 7000;
const LIVE_LOCATION_STREAM_MS = 120000;
const AUDIO_UPLOAD_MODE = (import.meta.env.VITE_SOS_AUDIO_UPLOAD_MODE || 'auto').toLowerCase();

function hasValidCoordinate(location) {
  return Number.isFinite(location?.lat) && Number.isFinite(location?.lng);
}

export default function SOSEmergencyConsole() {
  const { user } = useAuthStore();
  const { currentLocation } = useStore();

  const [phase, setPhase] = useState('idle');
  const [secondsLeft, setSecondsLeft] = useState(RECORDING_SECONDS);
  const [lastAlertId, setLastAlertId] = useState(null);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const autoStopTimerRef = useRef(null);
  const stopLiveLocationRef = useRef(null);

  const clearRecordingTimers = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
  };

  const cleanupMediaResources = () => {
    clearRecordingTimers();

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
  };

  const stopLiveLocationStream = () => {
    if (stopLiveLocationRef.current) {
      stopLiveLocationRef.current();
      stopLiveLocationRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopLiveLocationStream();
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      cleanupMediaResources();
    };
  }, []);

  const getCurrentPosition = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported in this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: Date.now(),
        });
      },
      () => {
        reject(new Error('Unable to fetch live location.'));
      },
      {
        enableHighAccuracy: true,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: 0,
      }
    );
  });

  const resolveLiveLocation = async () => {
    try {
      return await getCurrentPosition();
    } catch {
      if (hasValidCoordinate(currentLocation)) {
        return {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          accuracy: currentLocation.accuracy ?? null,
          capturedAt: Date.now(),
        };
      }

      return {
        lat: null,
        lng: null,
        accuracy: null,
        capturedAt: Date.now(),
      };
    }
  };

  const startLiveLocationStream = (alertId) => {
    if (!navigator.geolocation || !alertId) {
      return () => {};
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        update(dbRef(rtdb, `sos_alerts/${alertId}`), {
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            capturedAt: Date.now(),
          },
          updatedAt: Date.now(),
        }).catch((err) => {
          console.error('Live location update failed:', err);
        });
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    const autoStop = setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
    }, LIVE_LOCATION_STREAM_MS);

    return () => {
      clearTimeout(autoStop);
      navigator.geolocation.clearWatch(watchId);
    };
  };

  const beginRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone capture is not supported in this browser.');
    }
    if (typeof MediaRecorder === 'undefined') {
      throw new Error('Audio recording is not supported in this browser.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    return await new Promise((resolve, reject) => {
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onerror = () => {
        cleanupMediaResources();
        reject(new Error('Microphone recording failed.'));
      };

      recorder.onstop = () => {
        clearRecordingTimers();

        if (!chunks.length) {
          cleanupMediaResources();
          reject(new Error('No audio was captured.'));
          return;
        }

        const mimeType = chunks[0].type || 'audio/webm';
        const recordingBlob = new Blob(chunks, { type: mimeType });
        cleanupMediaResources();
        resolve(recordingBlob);
      };

      setSecondsLeft(RECORDING_SECONDS);
      countdownTimerRef.current = setInterval(() => {
        setSecondsLeft((prev) => Math.max(prev - 1, 0));
      }, 1000);

      autoStopTimerRef.current = setTimeout(() => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, RECORDING_SECONDS * 1000);

      recorder.start();
    });
  };

  const stopRecordingNow = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const uploadRecordingToFirebase = async (blob, alertId, uid) => {
    const storagePath = `sos-recordings/${uid || 'anonymous'}/${alertId}-${Date.now()}.webm`;
    const recordingRef = storageRef(storage, storagePath);
    await uploadBytes(recordingRef, blob, { contentType: blob.type || 'audio/webm' });
    const audioUrl = await getDownloadURL(recordingRef);
    return { audioUrl, storagePath, provider: 'firebase' };
  };

  const uploadRecordingToBackend = async (blob, alertId) => {
    const result = await sosService.uploadAudio(blob, alertId);
    return {
      audioUrl: result.audioUrl,
      storagePath: result.audioPath || null,
      provider: 'backend',
    };
  };

  const uploadRecording = async (blob, alertId, uid) => {
    const failures = [];

    if (AUDIO_UPLOAD_MODE === 'backend') {
      return await uploadRecordingToBackend(blob, alertId);
    }

    // Attempt Firebase Storage first (fast path when rules are configured).
    try {
      return await uploadRecordingToFirebase(blob, alertId, uid);
    } catch (err) {
      failures.push(`Firebase upload failed: ${err.message}`);
      console.warn('Firebase audio upload failed, falling back to backend upload:', err);
    }

    try {
      return await uploadRecordingToBackend(blob, alertId);
    } catch (err) {
      failures.push(`Backend upload failed: ${err.message}`);
      throw new Error(failures.join(' | '));
    }
  };

  const triggerSOSFlow = async () => {
    if (phase === 'preparing' || phase === 'uploading') return;

    if (phase === 'recording') {
      stopRecordingNow();
      return;
    }

    setPhase('preparing');

    const authUser = auth.currentUser || user || {};
    const userId = authUser.uid || 'anonymous';
    const userName =
      authUser.displayName ||
      authUser.email?.split('@')[0] ||
      user?.displayName ||
      user?.email?.split('@')[0] ||
      'Citizen';
    const userEmail = authUser.email || user?.email || null;
    const userPhone = authUser.phoneNumber || user?.phoneNumber || null;

    let alertId = null;

    try {
      // Start recording first so emergency evidence capture begins instantly.
      const recordingPromise = beginRecording();
      setPhase('recording');

      // Resolve latest location and dispatch alert while recording is in progress.
      const location = await resolveLiveLocation();
      const timestamp = Date.now();
      const alertsRootRef = dbRef(rtdb, 'sos_alerts');
      const alertRef = push(alertsRootRef);
      alertId = alertRef.key;
      setLastAlertId(alertId);

      const basePayload = {
        id: alertId,
        userId,
        userName,
        userEmail,
        userPhone,
        status: 'recording',
        location,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await set(alertRef, basePayload);

      stopLiveLocationRef.current = startLiveLocationStream(alertId);

      if (hasValidCoordinate(location)) {
        sosService.trigger(
          { lat: location.lat, lng: location.lng },
          {
            clientTimestamp: timestamp,
            userName,
            userEmail,
            userPhone,
            firebaseSosId: alertId,
          }
        ).catch((err) => {
          console.error('Backend SOS dispatch failed:', err);
        });
      }

      const recordingBlob = await recordingPromise;
      setPhase('uploading');

      const { audioUrl, storagePath, provider } = await uploadRecording(recordingBlob, alertId, userId);

      await update(dbRef(rtdb, `sos_alerts/${alertId}`), {
        status: 'active',
        audioUrl,
        audioPath: storagePath,
        audioProvider: provider,
        recordingDurationSec: RECORDING_SECONDS,
        audioUploadedAt: Date.now(),
        updatedAt: Date.now(),
      });

      setPhase('sent');
      showToast({
        type: 'success',
        title: 'SOS Sent',
        message: 'Emergency alert, location, and voice recording were shared with authorities.',
      });
    } catch (err) {
      console.error('SOS workflow failed:', err);

      if (alertId) {
        await update(dbRef(rtdb, `sos_alerts/${alertId}`), {
          status: 'active_no_audio',
          audioUploadError: err.message,
          updatedAt: Date.now(),
        }).catch(() => {});
      }

      setPhase('error');
      showToast({
        type: 'error',
        title: 'SOS Failed',
        message: err.message || 'Unable to complete SOS workflow. Please call emergency services immediately.',
      });
    } finally {
      stopLiveLocationStream();
    }
  };

  const status = useMemo(() => {
    if (phase === 'preparing') {
      return {
        title: 'Initializing Alert',
        subtitle: 'Preparing microphone and location sensors',
      };
    }

    if (phase === 'recording') {
      return {
        title: 'Recording Voice Evidence',
        subtitle: `Live capture in progress (${secondsLeft}s left)`,
      };
    }

    if (phase === 'uploading') {
      return {
        title: 'Uploading Recording',
        subtitle: 'Securely syncing voice clip to cloud storage',
      };
    }

    if (phase === 'sent') {
      return {
        title: 'Emergency Alert Sent',
        subtitle: 'Authorities received your location and recording',
      };
    }

    if (phase === 'error') {
      return {
        title: 'Emergency Sync Failed',
        subtitle: 'Retry SOS or call emergency services directly',
      };
    }

    return {
      title: 'Emergency Alert',
      subtitle: 'Tap to start recording and alert dispatch',
    };
  }, [phase, secondsLeft]);

  return (
    <>
      <div className="relative w-44 h-44 flex items-center justify-center mb-6 z-10">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-red-500 -translate-x-1/2" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-red-500 -translate-y-1/2" />
        </div>

        <motion.svg
          className="absolute inset-0 w-full h-full text-red-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" className="opacity-40" />
          <circle
            cx="50"
            cy="50"
            r="43"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeDasharray="125 10"
            strokeLinecap="round"
            className="opacity-90 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
          />
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.75" className="opacity-30" />
          <path d="M 50 2 L 50 8 M 50 92 L 50 98 M 2 50 L 8 50 M 92 50 L 98 50" stroke="currentColor" strokeWidth="1.5" className="opacity-60" />
        </motion.svg>

        <div className="absolute inset-4 rounded-full border border-red-500/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />

        <div className="absolute inset-6 rounded-full border border-red-500/30 bg-[#060b14] flex items-center justify-center shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]">
          <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl" />
        </div>

        <button
          type="button"
          onClick={triggerSOSFlow}
          disabled={phase === 'preparing' || phase === 'uploading'}
          className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-[#991b1b] border border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.3)] rounded-full flex flex-col items-center justify-center text-white hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-all duration-300 z-20 cursor-pointer active:scale-90 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span className="text-3xl font-bold tracking-widest drop-shadow-md">
            {phase === 'recording' ? secondsLeft : 'SOS'}
          </span>
          <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-1.5 z-10">
        <p className="text-red-400 text-[12px] font-bold uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">
          {status.title}
        </p>
        <div className="flex items-center gap-2 opacity-80 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,1)]" />
          <p className="text-[9px] font-mono text-red-300 uppercase tracking-widest">
            {status.subtitle}
          </p>
        </div>
        {lastAlertId && (
          <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mt-1">
            Alert ID: {lastAlertId.slice(-8)}
          </p>
        )}
      </div>
    </>
  );
}
