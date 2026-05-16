import { Bell, Search, User, Menu } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import useNotificationStore from '@/store/useNotificationStore';
import { StatusIndicator, Badge } from '@/components/common';

/**
 * TopBar - Top navigation strip for dashboards.
 * Displays page title, search, notifications, and user profile.
 */
export default function TopBar({ title, onMenuClick }) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  return (
    <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
        )}
        <h2 className="text-lg font-bold text-white tracking-tight uppercase tracking-wider">{title}</h2>
      </div>

      {/* Center Search - Authority Dashboard style */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search records, zones, or units..."
            className="w-full bg-gray-800/50 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-gray-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <StatusIndicator status="online" size="xs" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Live Network</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge 
              variant="CRITICAL" 
              className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 border-2 border-gray-900"
            >
              {unreadCount}
            </Badge>
          )}
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 pl-4 border-l border-white/5 group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[10px] text-gray-500">Satara Command</p>
          </div>
          <div className="h-9 w-9 bg-gray-800 rounded-full border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-blue-500/50 transition-colors">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User size={18} className="text-gray-400" />
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
