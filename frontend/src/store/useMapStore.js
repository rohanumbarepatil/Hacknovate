import { create } from 'zustand';
import { MAP_CENTER, ZOOM_LEVELS } from '@/constants/mapConfig';

/**
 * Map state store
 * Manages map viewport, active layers, and selected features
 */
const useMapStore = create((set) => ({
  // Viewport
  center: MAP_CENTER,
  zoom: ZOOM_LEVELS.CITY,

  // Layers — array of active layer IDs
  activeLayers: [],

  // Selected feature (when user clicks a marker/zone)
  selectedFeature: null,

  // Map style mode
  mapStyle: 'dark', // 'dark' | 'light' | 'tactical'

  // Actions
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),

  /**
   * Toggle a single layer on/off
   * Allows multiple layers to be active simultaneously
   */
  toggleLayer: (layerName) => set((state) => ({
    activeLayers: state.activeLayers.includes(layerName)
      ? state.activeLayers.filter((l) => l !== layerName)
      : [...state.activeLayers, layerName],
  })),

  /**
   * Set EXCLUSIVE layer — show ONLY this layer, hide all others
   * Used when clicking layer buttons in the Authority dashboard
   */
  setExclusiveLayer: (layerName) => set((state) => ({
    activeLayers: state.activeLayers.includes(layerName) && state.activeLayers.length === 1
      ? [] // If it's already the only active one, turn it off
      : [layerName],
  })),

  /**
   * Clear all active layers
   */
  clearLayers: () => set({ activeLayers: [] }),

  /**
   * Check if a specific layer is active
   */
  isLayerActive: (layerName) => {
    return useMapStore.getState().activeLayers.includes(layerName);
  },

  setSelectedFeature: (feature) => set({ selectedFeature: feature }),
  clearSelectedFeature: () => set({ selectedFeature: null }),

  setMapStyle: (style) => set({ mapStyle: style }),
}));

export default useMapStore;
