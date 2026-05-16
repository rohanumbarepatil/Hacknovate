import useMapStore from '@/store/useMapStore';
import { MAP_LAYERS } from '@/constants/mapConfig';
import { cn } from '@/utils/cn';

const LEGEND_DATA = {
  [MAP_LAYERS.CRIME_HEATMAP]: {
    title: 'Crime Density',
    items: [
      { color: '#22c55e', label: 'Low' },
      { color: '#eab308', label: 'Medium' },
      { color: '#f97316', label: 'High' },
      { color: '#ef4444', label: 'Critical' },
    ],
  },
  [MAP_LAYERS.ACCIDENT_ZONES]: {
    title: 'Accident Severity',
    items: [
      { color: '#22c55e', label: '1-3 (Minor)' },
      { color: '#eab308', label: '4-6 (Moderate)' },
      { color: '#f97316', label: '7-8 (Severe)' },
      { color: '#ef4444', label: '9-10 (Fatal)' },
    ],
  },
  [MAP_LAYERS.UNSAFE_ROADS]: {
    title: 'Road Danger Level',
    items: [
      { color: '#ef444466', label: 'Moderate (thin)' },
      { color: '#ef4444', label: 'Dangerous (thick)' },
    ],
  },
  [MAP_LAYERS.EMERGENCY_VEHICLES]: {
    title: 'Unit Status',
    items: [
      { color: '#22c55e', label: 'Available' },
      { color: '#f59e0b', label: 'Dispatched' },
      { color: '#f97316', label: 'En Route' },
      { color: '#ef4444', label: 'On Scene' },
    ],
  },
  [MAP_LAYERS.INCIDENT_PINS]: {
    title: 'Incident Type',
    items: [
      { color: '#ef4444', label: 'Crime' },
      { color: '#f97316', label: 'Accident' },
      { color: '#f59e0b', label: 'Fire' },
      { color: '#3b82f6', label: 'Flood' },
      { color: '#8b5cf6', label: 'Infrastructure' },
    ],
  },
  [MAP_LAYERS.RISK_ZONES]: {
    title: 'AI Risk Score',
    items: [
      { color: '#22c55e', label: '0-30 (Low)' },
      { color: '#eab308', label: '30-50 (Moderate)' },
      { color: '#f97316', label: '50-70 (High)' },
      { color: '#ef4444', label: '70-100 (Critical)' },
    ],
  },
};

export default function MapLegend({ className }) {
  const { activeLayers } = useMapStore();
  const activeLayer = activeLayers[0];
  const legend = LEGEND_DATA[activeLayer];

  if (!legend) return null;

  return (
    <div className={cn('absolute bottom-6 left-4 z-20 pointer-events-auto', className)}>
      <div className="bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl min-w-[160px]">
        <p className="text-xs font-semibold text-gray-300 mb-2">{legend.title}</p>
        <div className="space-y-1.5">
          {legend.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
