import { cn } from '@/utils/cn';

const VARIANTS = {
  CRITICAL: 'bg-tactical-red/10 text-tactical-red border border-tactical-red/20',
  HIGH: 'bg-tactical-amber/10 text-tactical-amber border border-tactical-amber/20',
  MEDIUM: 'bg-tactical-blue/10 text-tactical-blue border border-tactical-blue/20',
  LOW: 'bg-tactical-primary/10 text-tactical-primary border border-tactical-primary/20',
  NEUTRAL: 'bg-tactical-bgSecondary text-tactical-textSecondary border border-tactical-border',
};

/**
 * Tactical Badge
 * Flat, subtle border, specific colored text and background.
 */
export default function Badge({ 
  children, 
  variant = 'NEUTRAL', 
  className,
  dot = false 
}) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest',
      VARIANTS[variant] || VARIANTS.NEUTRAL,
      className
    )}>
      {dot && (
        <span className={cn(
          'mr-1.5 h-1.5 w-1.5 rounded-full',
          variant === 'CRITICAL' && 'bg-tactical-red',
          variant === 'HIGH' && 'bg-tactical-amber',
          variant === 'MEDIUM' && 'bg-tactical-blue',
          variant === 'LOW' && 'bg-tactical-primary',
          variant === 'NEUTRAL' && 'bg-tactical-textSecondary'
        )} />
      )}
      {children}
    </span>
  );
}
