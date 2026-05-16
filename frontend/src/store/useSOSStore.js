import { create } from 'zustand';

/**
 * SOS alert state store
 * Manages emergency SOS alerts with high-priority handling
 */
const useSOSStore = create((set) => ({
  alerts: [],
  activeCount: 0,
  loading: false,

  setAlerts: (alerts) => set({
    alerts,
    activeCount: alerts.filter((a) => a.status === 'active').length,
    loading: false,
  }),

  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts],
    activeCount: state.activeCount + 1,
  })),

  acknowledgeAlert: (id, responderId) => set((state) => ({
    alerts: state.alerts.map((a) =>
      a.id === id ? { ...a, status: 'acknowledged', responderId } : a
    ),
    activeCount: Math.max(0, state.activeCount - 1),
  })),

  resolveAlert: (id) => set((state) => ({
    alerts: state.alerts.map((a) =>
      a.id === id ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() } : a
    ),
  })),

  setLoading: (loading) => set({ loading }),
}));

export default useSOSStore;
