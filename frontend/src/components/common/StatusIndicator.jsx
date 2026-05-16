import { cn } from '@/utils/cn';

/**
 * Live status indicator with animated pulse dot
 * Shows online/offline/warning/critical status
 */

const statusConfig = {
  online: { color: 'bg-emerald-500', label: 'Online', glow: 'shadow-emerald-500/50' },
  offline: { color: 'bg-gray-500', label: 'Offline', glow: '' },
  warning: { color: 'bg-amber-500', label: 'Warning', glow: 'shadow-amber-500/50' },
  critical: { color: 'bg-red-500', label: 'Critical', glow: 'shadow-red-500/50' },
  connecting: { color: 'bg-blue-500', label: 'Connecting', glow: 'shadow-blue-500/50' },
};

export default function StatusIndicator({
  status = 'online',
  showLabel = false,
  size = 'sm',
  pulse = true,
  className,
}) {
  const config = statusConfig[status] || statusConfig.offline;

  const sizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2.5 w-2.5',
    md: 'h-3.5 w-3.5',
    lg: 'h-5 w-5',
  };

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative flex">
        {pulse && status !== 'offline' && (
          <span
            className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-75',
              config.color
            )}
          />
        )}
        <span
          className={cn(
            'relative rounded-full shadow-sm',
            config.color,
            config.glow,
            sizes[size]
          )}
        />
      </span>
      {showLabel && (
        <span className="text-xs text-gray-400">{config.label}</span>
      )}
    </span>
  );
}
