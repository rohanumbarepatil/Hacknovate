import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, LayoutDashboard, Map as MapIcon, 
  AlertTriangle, ClipboardList, Settings, 
  LogOut, Users, Activity, Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/useAuthStore';
import { ROLES } from '@/constants/roles';
import { cn } from '@/utils/cn';

/**
 * Sidebar - Vertical navigation for dashboards.
 * Dynamically updates links based on user role.
 */
export default function Sidebar() {
  const location = useLocation();
  const { userRole, logout } = useAuthStore();

  const isCitizen = userRole === ROLES.CITIZEN;
  const isAuthority = userRole === ROLES.AUTHORITY || userRole === ROLES.ADMIN;

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: isCitizen ? '/citizen' : '/authority/dashboard', show: true },
    { label: 'Safety Map', icon: MapIcon, path: isCitizen ? '/citizen/map' : '/authority/safety-map', show: true },
    { label: 'AI Predictions', icon: Cpu, path: '/authority/predictions', show: isAuthority },
    { label: 'Incidents', icon: AlertTriangle, path: '/authority/incidents', show: isAuthority },
    { label: 'Complaints', icon: ClipboardList, path: isCitizen ? '/citizen/complaints' : '/authority/complaints', show: true },
    { label: 'Resources', icon: Activity, path: '/authority/resources', show: isAuthority },
    { label: 'Users', icon: Users, path: '/authority/users', show: userRole === ROLES.ADMIN },
    { label: 'Settings', icon: Settings, path: '/authority/settings', show: true },
  ];

  return (
    <div className="w-[260px] bg-[#060D19] border-r border-slate-800/60 flex flex-col h-full shrink-0 select-none">
      {/* Branding */}
      <div className="p-6 border-b border-slate-800/40">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/10 border border-blue-500/20 group-hover:scale-[1.02] transition-transform">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">SafeCity</h1>
            <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">{userRole || 'Loading...'}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.filter(item => item.show).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 group border-l-2",
                isActive 
                  ? "bg-blue-600/5 text-blue-400 border-blue-500" 
                  : "text-slate-400 hover:bg-slate-800/20 hover:text-slate-200 border-transparent"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800/60 bg-[#040810]/40">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-400 hover:bg-red-950/20 hover:text-red-400 border-l-2 border-transparent hover:border-red-500 transition-all group"
        >
          <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-400 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
