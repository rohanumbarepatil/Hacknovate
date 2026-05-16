import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Usage: cn('bg-red-500', 'bg-blue-500') → 'bg-blue-500'
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
