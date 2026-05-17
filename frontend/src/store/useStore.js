import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  userRole: null,
  currentLocation: null,
  incidents: [],
  complaints: [],
  sosEvents: [],
  riskScores: {},
  vehicles: [],
  activeAlert: null,
  emergencyCount: 0,
  liveNetworkStatus: 'connected',

  setUser: (user) => set({ user }),
  setUserRole: (role) => set({ userRole: role }),
  setCurrentLocation: (location) => set({ currentLocation: location }),
  
  setActiveAlert: (activeAlert) => set({ activeAlert }),
  setEmergencyCount: (count) => set({ emergencyCount: count }),
  incrementEmergencyCount: () => set((state) => ({ emergencyCount: state.emergencyCount + 1 })),
  setLiveNetworkStatus: (status) => set({ liveNetworkStatus: status }),
  
  setIncidents: (incidents) => set({ incidents }),
  addIncident: (incident) => set((state) => ({ 
    incidents: [...state.incidents, incident] 
  })),
  
  setComplaints: (complaints) => set({ complaints }),
  addComplaint: (complaint) => set((state) => ({ 
    complaints: [...state.complaints, complaint] 
  })),
  
  setSosEvents: (events) => set({
    sosEvents: [...events].sort((a, b) => {
      const aTs = new Date(a.updatedAt || a.timestamp || a.createdAt || a.created_at || 0).getTime();
      const bTs = new Date(b.updatedAt || b.timestamp || b.createdAt || b.created_at || 0).getTime();
      return bTs - aTs;
    })
  }),
  addSosEvent: (event) => set((state) => ({
    sosEvents: [event, ...state.sosEvents]
  })),
  upsertSosEvent: (event) => set((state) => {
    const eventId = event.id || event.sosId;
    const normalized = {
      ...event,
      id: eventId || `sos_${Date.now()}`,
    };

    const existingIndex = state.sosEvents.findIndex(
      (item) => (item.id || item.sosId) === normalized.id
    );

    let updatedEvents;
    if (existingIndex === -1) {
      updatedEvents = [normalized, ...state.sosEvents];
    } else {
      updatedEvents = [...state.sosEvents];
      updatedEvents[existingIndex] = {
        ...updatedEvents[existingIndex],
        ...normalized,
      };
    }

    updatedEvents.sort((a, b) => {
      const aTs = new Date(a.updatedAt || a.timestamp || a.createdAt || a.created_at || 0).getTime();
      const bTs = new Date(b.updatedAt || b.timestamp || b.createdAt || b.created_at || 0).getTime();
      return bTs - aTs;
    });

    return { sosEvents: updatedEvents };
  }),
  
  setRiskScores: (scores) => set({ riskScores: scores }),
  updateRiskScore: (wardId, score) => set((state) => ({
    riskScores: { ...state.riskScores, [wardId]: score }
  })),
  
  setVehicles: (vehicles) => set({ vehicles }),
  updateVehicle: (vehicleId, data) => set((state) => ({
    vehicles: state.vehicles.map(v => 
      v.id === vehicleId ? { ...v, ...data } : v
    )
  })),
}));

export default useStore;
