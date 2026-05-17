import { useEffect, useRef } from 'react';
import {
  get,
  limitToLast,
  onChildAdded,
  onChildChanged,
  query,
  ref as dbRef,
} from 'firebase/database';
import socket from '../services/socket';
import useStore from '../store/useStore';
import useNotificationStore from '@/store/useNotificationStore';
import { rtdb } from '@/services/firebase';
import { showToast } from '@/components/common/Toast';

function toNumberOrNull(value) {
  if (Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSOSEvent(raw) {
  const location = raw?.location || {};
  const lat = toNumberOrNull(raw?.lat) ?? toNumberOrNull(location?.lat);
  const lng = toNumberOrNull(raw?.lng) ?? toNumberOrNull(location?.lng);

  return {
    id: raw?.id || raw?.sosId || raw?.firebase_sos_id || `sos_${Date.now()}`,
    userId: raw?.userId || raw?.citizen_id || null,
    userName: raw?.userName || raw?.citizen_name || raw?.citizenName || 'Citizen',
    userEmail: raw?.userEmail || raw?.citizen_email || raw?.citizenEmail || null,
    userPhone: raw?.userPhone || raw?.citizen_phone || raw?.citizenPhone || null,
    status: raw?.status || 'active',
    lat,
    lng,
    location: {
      lat,
      lng,
      accuracy: location?.accuracy ?? raw?.accuracy ?? null,
      capturedAt: location?.capturedAt || raw?.timestamp || Date.now(),
    },
    audioUrl: raw?.audioUrl || raw?.audio_url || null,
    createdAt: raw?.createdAt || raw?.created_at || raw?.timestamp || Date.now(),
    updatedAt: raw?.updatedAt || raw?.updated_at || raw?.timestamp || Date.now(),
    timestamp: raw?.timestamp || raw?.createdAt || raw?.created_at || Date.now(),
  };
}

function formatCoordLabel(event) {
  if (!Number.isFinite(event.lat) || !Number.isFinite(event.lng)) {
    return 'Location pending';
  }

  return `${event.lat.toFixed(4)}, ${event.lng.toFixed(4)}`;
}

export const useSocket = () => {
  const { addIncident, upsertSosEvent, updateVehicle, updateRiskScore } = useStore();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const sosMetaRef = useRef(new Map());

  useEffect(() => {
    socket.connect();

    socket.on('incident:new', (incident) => {
      addIncident(incident);
    });

    const syncSOS = (sosEvent, mode = 'realtime') => {
      const normalized = normalizeSOSEvent(sosEvent);
      const eventId = normalized.id;
      const previous = sosMetaRef.current.get(eventId);

      upsertSosEvent(normalized);

      sosMetaRef.current.set(eventId, {
        status: normalized.status,
        audioUrl: normalized.audioUrl,
      });

      if (mode === 'bootstrap') {
        return;
      }

      if (!previous) {
        addNotification({
          type: 'error',
          category: 'sos',
          title: 'New SOS Alert',
          message: `${normalized.userName} at ${formatCoordLabel(normalized)}`,
        });
        return;
      }

      if (!previous.audioUrl && normalized.audioUrl) {
        addNotification({
          type: 'warning',
          category: 'sos',
          title: 'SOS Recording Ready',
          message: `Voice evidence uploaded for SOS #${String(eventId).slice(-8)}`,
        });
      }

      if (previous.status !== normalized.status) {
        addNotification({
          type: 'info',
          category: 'sos',
          title: 'SOS Status Updated',
          message: `SOS #${String(eventId).slice(-8)} is now ${normalized.status}`,
        });
      }
    };

    const handleSOSSocket = (payload) => syncSOS(payload, 'realtime');

    socket.on('sos:new', handleSOSSocket);
    socket.on('sos:alert', handleSOSSocket);

    // Authority Command Center Real-time SOS Receiver
    socket.on('authority_receive_sos', (payload) => {
      console.log("🚨 Authority socket received real-time SOS alert:", payload);
      const normalized = {
        ...normalizeSOSEvent(payload),
        area: payload.area || "Swargate",
        severity: payload.severity || "CRITICAL",
        citizenId: payload.citizenId || "CIT-204"
      };
      
      const store = useStore.getState();
      store.upsertSosEvent(normalized);
      store.setActiveAlert(normalized);
      store.incrementEmergencyCount();
      store.setLiveNetworkStatus('emergency');
      
      addNotification({
        type: 'error',
        category: 'sos',
        title: 'CRITICAL SOS ALERT',
        message: `${normalized.userName || 'Citizen'} (${normalized.citizenId}) near ${normalized.area}`,
      });
    });

    socket.on('vehicle:updated', ({ vehicleId, lat, lng }) => {
      updateVehicle(vehicleId, { lat, lng, lastUpdated: Date.now() });
    });

    socket.on('risk:updated', ({ wardId, score }) => {
      updateRiskScore(wardId, score);
    });

    // Real-time Citizen Complaints Handlers
    socket.on('authority_new_complaint', (complaint) => {
      console.log('📝 Received real-time authority complaint:', complaint);
      const store = useStore.getState();
      store.addComplaint(complaint);
      
      // Visual notification
      addNotification({
        type: 'info',
        category: 'complaint',
        title: 'New Citizen Complaint',
        message: `${(complaint.category || 'other').toUpperCase()} filed in ${complaint.area || 'Pune'}. Severity: ${complaint.severity || 'MEDIUM'}`,
      });

      // Show real-time interactive Toast on active UI
      showToast({
        type: 'warning',
        title: 'New Grievance Filed',
        message: `A new ${complaint.category?.replace('_', ' ')} issue was reported in ${complaint.area || 'Pune Ward'}.`
      });

      // Sound notification
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (err) {
        console.warn('Complaint sound notification blocked or bypassed:', err);
      }
    });

    socket.on('complaint_status_updated', ({ id, status, updated }) => {
      console.log(`📝 Complaint ${id} status updated in real-time to ${status}`);
      const store = useStore.getState();
      store.updateComplaintStatus(id, status, updated);

      // Show state update toast dynamically
      showToast({
        type: 'success',
        title: 'Grievance Transitioned',
        message: `Complaint ${id} status is now "${status}".`
      });
    });

    socket.on('complaintUpdated', (updatedComplaint) => {
      if (!updatedComplaint) return;
      console.log('📝 Received real-time complaint update:', updatedComplaint);
      const store = useStore.getState();
      const id = updatedComplaint.id || updatedComplaint.complaintId;
      store.updateComplaintStatus(id, updatedComplaint.status, updatedComplaint);
      store.addComplaint(updatedComplaint);
    });

    const sosQuery = query(dbRef(rtdb, 'sos_alerts'), limitToLast(50));

    let unsubscribeAdded = () => {};
    let unsubscribeChanged = () => {};
    let isDisposed = false;

    const bootstrapSOS = async () => {
      try {
        const snapshot = await get(sosQuery);

        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            syncSOS({ id: child.key, ...child.val() }, 'bootstrap');
          });
        }
      } catch (error) {
        console.error('Failed to bootstrap SOS events:', error);
      }

      if (isDisposed) {
        return;
      }

      unsubscribeAdded = onChildAdded(sosQuery, (snapshot) => {
        syncSOS({ id: snapshot.key, ...snapshot.val() }, 'realtime');
      });

      unsubscribeChanged = onChildChanged(sosQuery, (snapshot) => {
        syncSOS({ id: snapshot.key, ...snapshot.val() }, 'realtime');
      });
    };

    bootstrapSOS();

    return () => {
      isDisposed = true;
      socket.off('incident:new');
      socket.off('sos:new', handleSOSSocket);
      socket.off('sos:alert', handleSOSSocket);
      socket.off('authority_receive_sos');
      socket.off('vehicle:updated');
      socket.off('risk:updated');
      socket.off('authority_new_complaint');
      socket.off('complaint_status_updated');
      unsubscribeAdded();
      unsubscribeChanged();
      socket.disconnect();
    };
  }, [addIncident, addNotification, upsertSosEvent, updateVehicle, updateRiskScore]);

  return socket;
};
