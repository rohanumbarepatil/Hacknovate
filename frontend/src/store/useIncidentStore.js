import { create } from 'zustand';

/**
 * Incident state store
 * Manages the list of incidents for both dashboards
 */
const useIncidentStore = create((set) => ({
  incidents: [],
  loading: false,
  error: null,

  setIncidents: (incidents) => set({ incidents, loading: false }),

  addIncident: (incident) => set((state) => ({
    incidents: [incident, ...state.incidents],
  })),

  updateIncident: (id, updates) => set((state) => ({
    incidents: state.incidents.map((inc) =>
      inc.id === id ? { ...inc, ...updates } : inc
    ),
  })),

  removeIncident: (id) => set((state) => ({
    incidents: state.incidents.filter((inc) => inc.id !== id),
  })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));

export default useIncidentStore;
