import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock } from 'lucide-react';
import { signInWithGoogle, auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import useStore from '../store/useStore';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      
      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        useStore.setState({ user, userRole: role });
        
        // Navigate based on role
        if (role === 'citizen') navigate('/citizen');
        else if (role === 'police') navigate('/police');
        else if (role === 'authority') navigate('/authority');
      } else {
        // First time user - default to citizen
        useStore.setState({ user, userRole: 'citizen' });
        navigate('/citizen');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Get user role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        useStore.setState({ user, userRole: role });
        
        if (role === 'citizen') navigate('/citizen');
        else if (role === 'police') navigate('/police');
        else if (role === 'authority') navigate('/authority');
      } else {
        useStore.setState({ user, userRole: 'citizen' });
        navigate('/citizen');
      }
    } catch (error) {
      console.error('Email sign-in error:', error);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Demo login function
  const handleDemoLogin = (role) => {
    useStore.setState({ 
      user: { uid: `demo_${role}`, email: `${role}@demo.com` },
      userRole: role 
    });
    
    if (role === 'citizen') navigate('/citizen');
    else if (role === 'police') navigate('/police');
    else if (role === 'authority') navigate('/authority');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="text-blue-500" size={60} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SafeCity</h1>
          <p className="text-gray-400">Sign in to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-navy-900 p-8 rounded-lg border border-navy-700 shadow-2xl">
          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="inline mr-2" size={16} />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="inline mr-2" size={16} />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center mb-6"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          {/* Demo Logins */}
          <div className="border-t border-gray-600 pt-6">
            <p className="text-sm text-gray-400 mb-3 text-center">Quick Demo Access:</p>
            <div className="space-y-2">
              <button
                onClick={() => handleDemoLogin('citizen')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Demo as Citizen
              </button>
              <button
                onClick={() => handleDemoLogin('police')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Demo as Police Officer
              </button>
              <button
                onClick={() => handleDemoLogin('authority')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Demo as Authority
              </button>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
