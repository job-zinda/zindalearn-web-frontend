import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap, ArrowRight, Star, Quote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useLandingData } from '../hooks/useLandingData';

const StudentLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, googleLogin } = useAuth();
  const { stats, testimonials, loading: landingLoading } = useLandingData();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await login(formData);
      toast.success('Welcome back!');
      
      // Dynamic redirect based on role and block status
      if (data.user.isBlocked) {
        navigate('/account-blocked');
      } else if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
      toast.error('Firebase is not configured. Please add your API keys to the .env file.');
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();

      const payload = {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        token: token
      };

      setLoading(true);
      const data = await googleLogin(payload);
      toast.success('Signed in with Google!');
      
      // Dynamic redirect based on role and block status
      if (data.user.isBlocked) {
        navigate('/account-blocked');
      } else if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelled');
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Google login failed';
        toast.error(errorMsg);
        console.error('Google Login Error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Purple Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          {/* Logo */}
          <Link to="/" className="flex items-center mb-16">
            <img src="/zinda-learn-logo.png" alt="Zinda Learn" className="h-10 object-contain brightness-0 invert" />
          </Link>

          <h1 className="text-4xl lg:text-5xl font-bold font-display text-white leading-tight mb-6">
            Welcome back,
            <br />
            <span className="text-primary-200">continue learning</span>
          </h1>
          <p className="text-lg text-white/60 mb-12 max-w-md leading-relaxed">
            Pick up right where you left off. Your courses, progress, and certificates are waiting for you.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-8 mb-12">
            {[
              { value: stats.students, label: 'Active Students' },
              { value: stats.avgRating, label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          {testimonials.length > 0 && (
            <div className="glass rounded-2xl p-6 max-w-md border border-white/10">
              <Quote className="w-8 h-8 text-primary-300 mb-3" />
              <p className="text-black/80 text-sm leading-relaxed mb-4">
                "{testimonials[0].comment || testimonials[0].content}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center text-purple font-bold text-sm overflow-hidden">
                  {testimonials[0].user?.profilePic ? (
                    <img src={testimonials[0].user.profilePic} alt={testimonials[0].user.name} className="w-full h-full object-cover" />
                  ) : (
                    testimonials[0].user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <p className="text-purple font-semibold text-sm">{testimonials[0].user?.name || 'Anonymous'}</p>
                  <p className="text-purple/50 text-xs">{testimonials[0].user?.role || 'Learner'}</p>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < testimonials[0].rating ? 'fill-amber-400 text-amber-400' : 'text-purple/20'}`} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center mb-8">
            <img src="/zinda-learn-logo.png" alt="Zinda Learn" className="h-8 object-contain" />
          </div>

          <div className="glass rounded-3xl p-8 lg:p-10 shadow-card">
            <h2 className="text-2xl font-bold font-display text-surface-900 mb-2">Sign In</h2>
            <p className="text-surface-500 text-sm mb-8">Welcome back! Enter your credentials to continue.</p>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-medium text-surface-700">Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-surface-200"></div>
              <span className="text-xs text-surface-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-surface-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                error={errors.email}
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                error={errors.password}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-surface-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" fullWidth size="lg" loading={loading}>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="text-center text-sm text-surface-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
