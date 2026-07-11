import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Fingerprint, KeyRound, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Credentials required for authentication');
      return;
    }

    setLoading(true);
    try {
      const data = await login({ ...formData, role: 'admin' });
      // If the user's role isn't admin, the backend might handle it or we could check here.
      if (data.user.role === 'admin') {
        toast.success('Authentication successful');
        navigate('/admin/dashboard');
      } else {
        toast.error('Unauthorized clearance level');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0b] font-sans">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#121212] flex-col border-r border-[#1c1c21]">
        {/* Subtle background noise/gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col p-16 h-full justify-center">
          
          <div className="mb-16">
            <div className="w-12 h-12 bg-gradient-to-br from-[#c084fc] to-[#a855f7] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)] mb-8">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            
            <div className="flex items-center gap-1 mb-6">
              <span className="text-4xl font-bold text-white tracking-wide">zinda</span>
              <span className="text-4xl font-light text-zinc-500 tracking-wide">learn</span>
            </div>
            
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#1c1c21] border border-[#27272a] mb-12">
              <span className="text-[10px] font-bold text-purple-400 tracking-[0.2em] uppercase">System Admin</span>
            </div>

            <h1 className="text-4xl font-bold text-[#e9d5ff] mb-4 tracking-tight">
              Secure Access
            </h1>
            <p className="text-lg text-zinc-400 max-w-sm leading-relaxed font-light">
              Administrator authentication portal for Zinda Learn Engine v2.4.0
            </p>
          </div>

          <div className="mt-auto flex gap-12">
            <div>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Encrypted</p>
              <p className="text-sm text-zinc-400">AES-256 Protocol</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Status</p>
              <p className="text-sm text-zinc-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                All Systems Nominal
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col relative bg-[#0a0a0b]">
        {/* Top Right Link */}
        <div className="absolute top-8 right-12 z-20">
          <Link to="/" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Back to Public Site
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-32 relative z-10">
          <div className="w-full max-w-md mx-auto">
            
            <div className="lg:hidden mb-12 flex flex-col items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-[#c084fc] to-[#a855f7] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] mb-6">
                <ShieldCheck className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">zindalearn <span className="text-[10px] font-bold text-purple-400 tracking-[0.2em] uppercase ml-2 bg-[#1c1c21] px-2 py-1 rounded">ADMIN</span></h2>
            </div>

            <div className="bg-[#121212] rounded-2xl p-8 border border-[#1c1c21] shadow-2xl relative overflow-hidden">
              {/* Subtle top glow */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

              <h2 className="text-2xl font-bold text-white mb-2">Admin Login</h2>
              <p className="text-zinc-400 mb-8 text-sm">Enter your credentials to manage the platform core.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                    Admin ID / Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="admin@zindalearn.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-4 pr-12 py-3.5 bg-[#0a0a0b] border border-[#27272a] rounded-xl focus:outline-none focus:border-purple-500 transition-all text-sm text-zinc-300 placeholder:text-zinc-600"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">
                      <Mail className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                    Security Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-4 pr-12 py-3.5 bg-[#0a0a0b] border border-[#27272a] rounded-xl focus:outline-none focus:border-purple-500 transition-all text-sm text-zinc-300 tracking-widest placeholder:tracking-normal placeholder:text-zinc-600"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">
                      <KeyRound className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#27272a] bg-[#0a0a0b] text-purple-600 focus:ring-purple-500/20 focus:ring-offset-0"
                    />
                    <label htmlFor="remember" className="text-xs text-zinc-400 cursor-pointer">
                      Remember for 24h
                    </label>
                  </div>
                  <button type="button" className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                    Forgot Access?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#d8b4fe] to-[#a855f7] hover:from-[#e9d5ff] hover:to-[#c084fc] text-[#2d1b36] font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:opacity-50 flex items-center justify-center gap-3 text-sm tracking-widest uppercase"
                >
                  {loading ? 'Authenticating...' : 'Authenticate'}
                  <Fingerprint className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Bottom Footer */}
            <div className="mt-16 flex flex-col items-center">
              <div className="flex items-center gap-6 mb-6">
                <a href="#" className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors">Security Policy</a>
                <a href="#" className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors">System Status</a>
                <a href="#" className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors">Terms</a>
              </div>
              <p className="text-[10px] font-bold text-zinc-700 tracking-widest uppercase">
                © 2024 Zinda Learn. Internal Administrative Portal.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
