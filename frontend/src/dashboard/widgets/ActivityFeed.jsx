import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { timeAgo } from '@/utils/formatters';
import Badge from '@/components/common/Badge';

/**
 * ActivityFeed — Live event stream widget
 * Shows real-time incidents, complaints, and SOS alerts
 * Used in Authority dashboard overview
 */

const typeIcons = {
  incident: '🚨',
  complaint: '📋',
  sos: '🆘',
  vehicle: '🚔',
  risk: '📊',
  resolved: '✅',
};

const typeColors = {
  incident: 'border-l-red-500',
  complaint: 'border-l-blue-500',
  sos: 'border-l-red-600',
  vehicle: 'border-l-cyan-500',
  risk: 'border-l-amber-500',
  resolved: 'border-l-emerald-500',
};

export default function ActivityFeed({ activities = [], maxItems = 10, className }) {
  const visibleActivities = activities.slice(0, maxItems);

  return (
    <div className={cn('space-y-2', className)}>
      <AnimatePresence initial={false}>
        {visibleActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          visibleActivities.map((activity, index) => (
            <motion.div
              key={activity.id || index}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.25 }}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border-l-2',
                'hover:bg-gray-800/50 transition-colors cursor-pointer',
                typeColors[activity.type] || 'border-l-gray-600'
              )}
            >
              <span className="text-lg shrink-0 mt-0.5">
                {typeIcons[activity.type] || '📌'}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate">
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {timeAgo(activity.timestamp)}
                  </span>
                  {activity.zone && (
                    <Badge variant="default" className="text-[10px]">
                      {activity.zone}
                    </Badge>
                  )}
                </div>
              </div>

              {activity.urgency && (
                <Badge variant={activity.urgency} className="shrink-0">
                  {activity.urgency}
                </Badge>
              )}
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
