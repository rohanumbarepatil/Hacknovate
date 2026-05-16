import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, LayoutDashboard, Map as MapIcon, 
  AlertTriangle, ClipboardList, Settings, 
  LogOut, Users, Activity
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
    { label: 'Dashboard', icon: LayoutDashboard, path: isCitizen ? '/citizen' : '/authority', show: true },
    { label: 'Safety Map', icon: MapIcon, path: isCitizen ? '/citizen/map' : '/authority/map', show: true },
    { label: 'Incidents', icon: AlertTriangle, path: '/authority/incidents', show: isAuthority },
    { label: 'Complaints', icon: ClipboardList, path: isCitizen ? '/citizen/complaints' : '/authority/complaints', show: true },
    { label: 'Resources', icon: Activity, path: '/authority/resources', show: isAuthority },
    { label: 'Users', icon: Users, path: '/authority/users', show: userRole === ROLES.ADMIN },
    { label: 'Settings', icon: Settings, path: '/settings', show: true },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-white/5 flex flex-col h-full">
      {/* Branding */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">SafeCity</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{userRole || 'Loading...'}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.filter(item => item.show).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600/10 text-blue-400" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"
              )} />
              {item.label}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="ml-auto w-1 h-5 bg-blue-500 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
        >
          <LogOut className="h-5 w-5 text-gray-500 group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
