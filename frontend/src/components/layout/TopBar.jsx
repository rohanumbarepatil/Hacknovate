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
    <header className="h-16 bg-[#081120] border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-40 select-none">
      <div className="flex items-center gap-4 shrink-0">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/40 transition-colors"
          >
            <Menu size={18} />
          </button>
        )}
        <h2 className="text-sm font-bold text-white tracking-wider uppercase">{title}</h2>
      </div>

      {/* Center Search - Authority Dashboard style */}
      <div className="hidden md:flex flex-1 max-w-md mx-12">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search records, zones, or units..."
            className="w-full bg-[#060D18]/80 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:bg-[#060D18] focus:border-slate-700 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-5 shrink-0">
        {/* Connection Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
          <StatusIndicator status="online" size="xs" />
          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Live Network</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-lg transition-colors">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 bg-red-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-[#081120]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 pl-5 border-l border-slate-800/80 group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors leading-none mb-1">
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest leading-none">Satara Command</p>
          </div>
          <div className="h-8.5 w-8.5 bg-slate-900 rounded-lg border border-slate-850 flex items-center justify-center overflow-hidden group-hover:border-blue-500/50 transition-colors shadow-inner">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User size={16} className="text-slate-400" />
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
