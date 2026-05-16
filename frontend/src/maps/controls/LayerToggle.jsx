import { useState } from 'react';
import { Layers, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useMapStore from '@/store/useMapStore';
import { MAP_LAYERS } from '@/constants/mapConfig';
import { cn } from '@/utils/cn';

const LAYER_OPTIONS = [
  { id: MAP_LAYERS.CRIME_HEATMAP, label: 'Crime Heatmap', icon: '🔥', color: 'text-red-400' },
  { id: MAP_LAYERS.ACCIDENT_ZONES, label: 'Accident Zones', icon: '🚗', color: 'text-orange-400' },
  { id: MAP_LAYERS.UNSAFE_ROADS, label: 'Unsafe Roads', icon: '⚠️', color: 'text-yellow-400' },
  { id: MAP_LAYERS.EMERGENCY_VEHICLES, label: 'Emergency Vehicles', icon: '🚔', color: 'text-blue-400' },
  { id: MAP_LAYERS.INCIDENT_PINS, label: 'Incident Pins', icon: '📍', color: 'text-pink-400' },
  { id: MAP_LAYERS.RISK_ZONES, label: 'AI Risk Zones', icon: '📊', color: 'text-purple-400' },
];

export default function LayerToggle({ exclusive = true, className }) {
  const [isOpen, setIsOpen] = useState(true);
  const { activeLayers, toggleLayer, setExclusiveLayer, clearLayers } = useMapStore();

  const handleLayerClick = (layerId) => {
    if (exclusive) {
      setExclusiveLayer(layerId);
    } else {
      toggleLayer(layerId);
    }
  };

  return (
    <div className={cn('absolute top-4 right-4 z-20 pointer-events-auto', className)}>
      <div className="bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden w-56">
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Map Layers</span>
          </div>
          <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {/* Layer List */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-white/10"
            >
              <div className="p-2 space-y-1">
                {LAYER_OPTIONS.map((layer) => {
                  const isActive = activeLayers.includes(layer.id);
                  return (
                    <button
                      key={layer.id}
                      onClick={() => handleLayerClick(layer.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm',
                        isActive
                          ? 'bg-blue-500/15 border border-blue-500/30 text-white'
                          : 'hover:bg-white/5 text-gray-400 border border-transparent'
                      )}
                    >
                      <span className="text-base">{layer.icon}</span>
                      <span className="flex-1 truncate">{layer.label}</span>
                      {isActive ? (
                        <Eye className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Clear all */}
              {activeLayers.length > 0 && (
                <div className="border-t border-white/10 p-2">
                  <button
                    onClick={clearLayers}
                    className="w-full text-xs text-gray-500 hover:text-gray-300 py-1.5 transition-colors"
                  >
                    Clear all layers
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
