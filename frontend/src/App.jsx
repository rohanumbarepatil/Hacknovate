import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import ToastContainer from '@/components/common/Toast';
import useAuthStore from '@/store/useAuthStore';
import { useSocket } from '@/hooks/useSocket';

// Pages
import Landing from '@/pages/Landing';
import CitizenView from '@/pages/CitizenView';
import AuthorityView from '@/pages/AuthorityView';

function App() {
  useSocket(); // Initialize real-time listeners
  const { login } = useAuthStore();
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // Simulate quick system boot
    setTimeout(() => setAppLoading(false), 800);

    const storedUser = localStorage.getItem('safecity_user');
    const storedRole = localStorage.getItem('safecity_role');
    
    if (storedUser && storedRole) {
      login(JSON.parse(storedUser), storedRole);
    } else {
      login({ uid: 'demo_user', email: 'user@demo.com' }, 'citizen');
    }
  }, [login]);

  if (appLoading) {
    return (
      <div className="min-h-screen bg-tactical-bg flex flex-col items-center justify-center">
        <Shield className="text-tactical-primary h-12 w-12 animate-pulse mb-4" />
        <h1 className="text-2xl font-bold text-white tracking-tight">SafeCity</h1>
        <p className="text-[10px] text-tactical-textSecondary font-bold uppercase tracking-widest mt-2">Initializing Systems...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-tactical-bg text-tactical-textPrimary selection:bg-tactical-primary/30 selection:text-white">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/citizen/*" element={<CitizenView />} />
          <Route path="/authority/*" element={<AuthorityView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}

export default App;
