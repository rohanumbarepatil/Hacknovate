import { Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';

/**
 * Auth Layout — wraps login and register pages
 * Centered card with branding
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <Shield className="mx-auto h-12 w-12 text-blue-500 mb-3" />
          <h1 className="text-3xl font-bold text-white">SafeCity</h1>
          <p className="text-gray-400 mt-1">Smart Urban Safety Platform</p>
        </div>

        {/* Auth Content */}
        <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
