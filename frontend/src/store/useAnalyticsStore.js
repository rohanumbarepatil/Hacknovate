import { create } from 'zustand';

/**
 * Analytics state store
 * Manages dashboard KPI metrics, trend data, and cached analytics
 */
const useAnalyticsStore = create((set) => ({
  // Dashboard KPIs
  metrics: {
    totalIncidents: 0,
    activeAlerts: 0,
    avgResponseTime: 0,
    avgRiskScore: 0,
    resolvedToday: 0,
    pendingComplaints: 0,
  },

  // Trend data (7-day)
  trends: [],

  // Category breakdown
  categories: [],

  // Zone comparison data
  zoneStats: [],

  loading: false,
  lastUpdated: null,

  setMetrics: (metrics) => set({
    metrics,
    lastUpdated: new Date().toISOString(),
  }),

  updateMetric: (key, value) => set((state) => ({
    metrics: { ...state.metrics, [key]: value },
    lastUpdated: new Date().toISOString(),
  })),

  setTrends: (trends) => set({ trends }),
  setCategories: (categories) => set({ categories }),
  setZoneStats: (zoneStats) => set({ zoneStats }),
  setLoading: (loading) => set({ loading }),
}));

export default useAnalyticsStore;
