import { Outlet } from 'react-router-dom';

/**
 * Dashboard Layout — wraps authenticated dashboard pages
 * Provides the common shell (sidebar + topbar + content area)
 * Both Citizen and Authority views use this layout
 */
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
