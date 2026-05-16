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

  setUser: (user) => set({ user }),
  setUserRole: (role) => set({ userRole: role }),
  setCurrentLocation: (location) => set({ currentLocation: location }),
  
  setIncidents: (incidents) => set({ incidents }),
  addIncident: (incident) => set((state) => ({ 
    incidents: [...state.incidents, incident] 
  })),
  
  setComplaints: (complaints) => set({ complaints }),
  addComplaint: (complaint) => set((state) => ({ 
    complaints: [...state.complaints, complaint] 
  })),
  
  setSosEvents: (events) => set({ sosEvents: events }),
  addSosEvent: (event) => set((state) => ({ 
    sosEvents: [...state.sosEvents, event] 
  })),
  
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
