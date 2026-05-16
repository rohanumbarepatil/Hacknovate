import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatCompact } from '@/utils/formatters';

/**
 * StatCard — Dashboard KPI widget
 * Shows a metric value with trend indicator and icon
 * Used in both Citizen and Authority dashboards
 */
export default function StatCard({
  title,
  value,
  previousValue,
  icon: Icon,
  color = 'blue',
  suffix = '',
  className,
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'shadow-blue-500/10' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', glow: 'shadow-red-500/10' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/10' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'shadow-purple-500/10' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
  };

  const colors = colorMap[color] || colorMap.blue;

  // Calculate trend
  const trend = previousValue != null && previousValue !== 0
    ? ((value - previousValue) / previousValue * 100).toFixed(1)
    : null;

  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border p-5 backdrop-blur-sm shadow-lg',
        'bg-gray-800/50',
        colors.border,
        colors.glow,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            {title}
          </p>
          <motion.p
            key={value}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-white"
          >
            {typeof value === 'number' ? formatCompact(value) : value}
            {suffix && <span className="text-lg text-gray-400 ml-1">{suffix}</span>}
          </motion.p>
        </div>

        {Icon && (
          <div className={cn('p-3 rounded-lg', colors.bg)}>
            <Icon className={cn('h-6 w-6', colors.text)} />
          </div>
        )}
      </div>

      {/* Trend indicator */}
      {trend !== null && (
        <div className="mt-3 flex items-center gap-1.5">
          {isPositive && <TrendingUp className="h-4 w-4 text-red-400" />}
          {isNegative && <TrendingDown className="h-4 w-4 text-emerald-400" />}
          {!isPositive && !isNegative && <Minus className="h-4 w-4 text-gray-400" />}
          <span className={cn(
            'text-xs font-medium',
            isPositive ? 'text-red-400' : isNegative ? 'text-emerald-400' : 'text-gray-400'
          )}>
            {Math.abs(trend)}%
          </span>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}
