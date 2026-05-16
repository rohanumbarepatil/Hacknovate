import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * AlertBanner — Emergency alert banner
 * Displays at the top of the Authority dashboard when SOS alerts are active
 */
export default function AlertBanner({
  count = 0,
  latestAlert = null,
  onDismiss,
  onViewAll,
  className,
}) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className={cn(
            'relative overflow-hidden rounded-xl border border-red-500/30',
            'bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent',
            'p-4',
            className
          )}
        >
          {/* Animated pulse background */}
          <div className="absolute inset-0 bg-red-500/5 animate-pulse" />

          <div className="relative flex items-center gap-4">
            {/* Alert Icon */}
            <div className="p-2 rounded-lg bg-red-500/20 shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
            </div>

            {/* Alert Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-400">
                {count} Active Emergency Alert{count > 1 ? 's' : ''}
              </p>
              {latestAlert && (
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  Latest: {latestAlert.message || 'SOS triggered'}
                  {latestAlert.zone && ` — Zone ${latestAlert.zone}`}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {onViewAll && (
                <button
                  onClick={onViewAll}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg
                    bg-red-500/20 text-red-400 hover:bg-red-500/30
                    transition-colors"
                >
                  View All
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400
                    hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
