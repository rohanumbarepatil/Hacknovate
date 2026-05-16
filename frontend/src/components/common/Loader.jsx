import { cn } from '@/utils/cn';

/**
 * Loading indicator component
 * Multiple variants for different contexts
 */
export default function Loader({ size = 'md', variant = 'spinner', text, className }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-1.5', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn('rounded-full bg-blue-500 animate-bounce', sizes.sm)}
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <div className={cn('rounded-full bg-blue-500/30 animate-pulse', sizes[size])} />
        {text && <p className="text-sm text-gray-400 animate-pulse">{text}</p>}
      </div>
    );
  }

  // Default: spinner
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <svg
        className={cn('animate-spin text-blue-500', sizes[size])}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor" strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );
}

/**
 * Full-page loader overlay
 */
export function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Loader size="lg" text={text} />
    </div>
  );
}
