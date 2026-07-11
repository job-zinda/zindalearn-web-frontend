import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

import { useLandingData } from '../../hooks/useLandingData';

const InstructorLogin = () => {
  const { stats } = useLandingData();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const data = await login({ ...formData, role: 'instructor' });
      toast.success('Welcome back, Instructor!');
      if (data.user.isBlocked) {
        navigate('/account-blocked');
      } else {
        navigate('/instructor/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
      toast.error('Firebase is not configured.');
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();

      setLoading(true);
      const data = await googleLogin({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        token,
        role: 'instructor'
      });
      toast.success('Signed in with Google!');
      if (data.user.isBlocked) {
        navigate('/account-blocked');
      } else {
        navigate('/instructor/dashboard');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        const errorMsg = err.response?.data?.message || err.message || 'Google login failed';
        toast.error(errorMsg);
        console.error('Instructor Google Login Error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#7c3aed] flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
        <div className="relative z-10 flex flex-col p-16 h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-16">
            <span className="text-2xl font-bold text-white tracking-wide">zindalearn</span>
          </Link>

          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Welcome Back,<br />Instructor.
          </h1>
          <p className="text-lg text-purple-100 max-w-md leading-relaxed mb-12">
            Continue your teaching journey. Manage your courses, track student growth, and analyze your impact in your dedicated digital atelier.
          </p>

          {/* Graph Card Mockup */}
          <div className="mt-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 relative shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-200 tracking-wider uppercase">Global Reach</p>
                <p className="text-white font-bold">{stats.students} active students today</p>
              </div>
            </div>
            <div className="h-40 bg-[#1c1c21] rounded-xl overflow-hidden relative border border-white/10 shadow-inner">
              {/* Simulated Chart */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-500/20 to-transparent"></div>
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,80 Q20,60 40,70 T80,40 T100,50 L100,100 L0,100 Z" fill="rgba(168, 85, 247, 0.2)" />
                <path d="M0,80 Q20,60 40,70 T80,40 T100,50" fill="none" stroke="#d8b4fe" strokeWidth="2" />
                <circle cx="80" cy="40" r="3" fill="#fff" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden mb-12">
            <span className="text-2xl font-bold text-purple-600 tracking-wide">zindalearn</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">Instructor Login</h2>
          <p className="text-slate-500 mb-8 text-sm">Enter your credentials to access your studio.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Professional Email
              </label>
              <input
                type="email"
                placeholder="name@studio.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[10px] font-bold text-purple-600 hover:text-purple-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm tracking-widest placeholder:tracking-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="remember" className="text-xs text-slate-500 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-colors shadow-lg shadow-purple-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? 'Signing in...' : 'Login to Studio →'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-400 font-bold tracking-widest uppercase">Or Continue With</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-white border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-full transition-colors flex items-center justify-center gap-3 text-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an instructor account?{' '}
            <Link to="/instructor/signup" className="font-bold text-purple-600 hover:text-purple-700">
              Join Us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstructorLogin;
