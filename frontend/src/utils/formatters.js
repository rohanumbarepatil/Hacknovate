/**
 * Date, number, and text formatting utilities
 * Used across all dashboards for consistent display
 */

/**
 * Format a date to a human-readable relative time (e.g., "2 hours ago")
 */
export function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return past.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Format a date to locale string
 */
export function formatDate(date, options = {}) {
  const defaults = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(date).toLocaleDateString('en-IN', { ...defaults, ...options });
}

/**
 * Format a date with time
 */
export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a number with Indian numbering system (e.g., 1,23,456)
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format a number as compact (e.g., 1.2K, 3.4M)
 */
export function formatCompact(num) {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Format risk score as percentage with color hint
 */
export function formatRiskScore(score) {
  const rounded = Math.round(score * 10) / 10;
  return `${rounded}%`;
}

/**
 * Get risk level label from score
 */
export function getRiskLevel(score) {
  if (score >= 70) return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20' };
  if (score >= 50) return { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20' };
  if (score >= 30) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  return { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
}

/**
 * Format response time in minutes to human-readable
 */
export function formatResponseTime(minutes) {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 80) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format status for display (e.g., "in_progress" → "In Progress")
 */
export function formatStatus(status) {
  if (!status) return '';
  return status
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}
