import { cn } from '@/utils/cn';

/**
 * Tactical Card Component
 * Solid dark background, subtle borders, no blur.
 */
const Card = ({ children, className, border = true }) => {
  return (
    <div className={cn(
      'bg-tactical-card rounded-lg shadow-tactical flex flex-col',
      border && 'border border-tactical-border',
      className
    )}>
      {children}
    </div>
  );
};

Card.Header = ({ children, className }) => (
  <div className={cn('px-5 py-4 border-b border-tactical-border flex items-center justify-between shrink-0', className)}>
    {children}
  </div>
);

Card.Title = ({ children, className }) => (
  <h3 className={cn('text-sm font-semibold text-tactical-textPrimary uppercase tracking-wider', className)}>
    {children}
  </h3>
);

Card.Content = ({ children, className }) => (
  <div className={cn('p-5 flex-1', className)}>
    {children}
  </div>
);

Card.Footer = ({ children, className }) => (
  <div className={cn('px-5 py-3 border-t border-tactical-border bg-tactical-bgSecondary/50 mt-auto shrink-0', className)}>
    {children}
  </div>
);

export default Card;
