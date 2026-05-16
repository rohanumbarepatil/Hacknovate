import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Tactical Button Component
 * Solid, professional, no glassmorphism.
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  icon: Icon,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-tactical-bg disabled:opacity-50 disabled:cursor-not-allowed rounded-md';
  
  const variants = {
    primary: 'bg-tactical-primary hover:bg-emerald-500 text-white focus:ring-tactical-primary border border-tactical-primary/20',
    secondary: 'bg-tactical-bgSecondary hover:bg-tactical-border text-tactical-textPrimary border border-tactical-border focus:ring-tactical-border',
    danger: 'bg-tactical-red hover:bg-red-600 text-white focus:ring-tactical-red border border-tactical-red/20',
    ghost: 'bg-transparent hover:bg-tactical-bgSecondary text-tactical-textSecondary hover:text-tactical-textPrimary',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className={cn('mr-2', size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')} />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
