import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, ArrowRight, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import api from '../../services/api';

const EMAIL_VERIFICATION_ENABLED = import.meta.env.VITE_EMAIL_VERIFICATION_ENABLED !== 'false';

const StudentRegister = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Weak Password Modal State
  const [showWeakPassModal, setShowWeakPassModal] = useState(false);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const levels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Medium', color: 'bg-yellow-500' },
      { label: 'Strong', color: 'bg-green-500' },
      { label: 'Very Strong', color: 'bg-emerald-500' },
    ];
    return { score, ...levels[score] };
  }, [formData.password]);

  const handleSendOTP = async () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ ...errors, email: 'Please enter a valid email first' });
      return;
    }
    
    const email = formData.email.toLowerCase().trim();
    
    setSendingOtp(true);
    try {
      await api.post('/auth/send-otp', { email });
      setOtpSent(true);
      setResendTimer(30);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }
    
    const email = formData.email.toLowerCase().trim();
    
    setVerifyingOtp(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setIsEmailVerified(true);
      setOtpSent(false);
      toast.success('Email verified successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email) errs.email = 'Email is required';
    if (EMAIL_VERIFICATION_ENABLED && !isEmailVerified) errs.email = 'Please verify your email first';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) errs.terms = 'You must accept the terms';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const executeRegistration = async () => {
    setLoading(true);
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password, role: 'student' });
      toast.success('Account created successfully!');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
      setShowWeakPassModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (passwordStrength.score < 4) {
      setShowWeakPassModal(true);
    } else {
      executeRegistration();
    }
  };

  const _handleGoogleLogin = async () => {
    if (!auth) {
      toast.error('Firebase is not configured.');
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();
      await googleLogin({ name: user.displayName, email: user.email, photo: user.photoURL, token });
      toast.success('Signed in with Google!');
      navigate('/student/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        const errorMsg = err.response?.data?.message || err.message || 'Google signup failed';
        toast.error(errorMsg);
        console.error('Student Google Signup Error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Weak Password Modal */}
      {showWeakPassModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-surface-900 mb-2">Weak Password</h3>
            <p className="text-surface-500 mb-8 leading-relaxed">
              Your password is not strong. Using a weak password makes your account vulnerable. Do you want to continue anyway?
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => executeRegistration()} fullWidth loading={loading}>
                Continue Anyway
              </Button>
              <Button variant="ghost" onClick={() => setShowWeakPassModal(false)} fullWidth>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <Link to="/" className="flex items-center mb-16">
            <img src="/zinda-learn-logo.png" alt="Zinda Learn" className="h-10 object-contain brightness-0 invert" />
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold font-display text-white leading-tight mb-6">
            Start your <br />
            <span className="text-primary-200">learning journey</span>
          </h1>
          <div className="space-y-4">
            {['Access 500+ premium courses', 'Learn from industry experts', 'Get certified & boost your career'].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-white/80 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="glass rounded-3xl p-8 lg:p-10 shadow-card">
            <h2 className="text-2xl font-bold font-display text-surface-900 mb-2">Create Account</h2>
            <p className="text-surface-500 text-sm mb-8">Join the Zinda Learn community.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                icon={User}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                error={errors.name}
              />

              <div className="relative">
                <Input
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="Enter your email"
                  value={formData.email}
                  disabled={EMAIL_VERIFICATION_ENABLED && isEmailVerified}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  error={errors.email}
                />
                {!isEmailVerified && EMAIL_VERIFICATION_ENABLED && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={sendingOtp || resendTimer > 0}
                    className="absolute right-2 top-9 text-xs font-bold text-primary-600 hover:text-primary-700 disabled:text-surface-400 px-3 py-1.5 bg-primary-50 rounded-lg transition-colors"
                  >
                    {sendingOtp ? <Loader2 className="w-3 h-3 animate-spin" /> : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Verify Email'}
                  </button>
                )}
                {isEmailVerified && EMAIL_VERIFICATION_ENABLED && (
                  <div className="absolute right-3 top-10 flex items-center gap-1 text-green-600 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </div>
                )}
              </div>

              {EMAIL_VERIFICATION_ENABLED && otpSent && !isEmailVerified && (
                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 animate-slide-up">
                  <label className="text-xs font-bold text-primary-700 mb-2 block">Enter 6-Digit OTP</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl border-2 border-primary-200 focus:border-primary-500 focus:outline-none tracking-[0.5em] font-bold text-center"
                      placeholder="000000"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={verifyingOtp}
                      className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {verifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <Input
                  label="Password"
                  type="password"
                  icon={Lock}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                  error={errors.password}
                />
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < passwordStrength.score ? passwordStrength.color : 'bg-surface-200'} transition-colors`}></div>
                      ))}
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${passwordStrength.score >= 4 ? 'text-green-600' : passwordStrength.score >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>
                      Strength: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                icon={Shield}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                }}
                error={errors.confirmPassword}
              />

              <label className="flex items-start gap-2.5 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-xs text-surface-500 leading-relaxed">
                  I agree to the <a href="#" className="text-primary-600 font-medium underline">Terms</a> and <a href="#" className="text-primary-600 font-medium underline">Privacy Policy</a>
                </span>
              </label>

              <Button type="submit" fullWidth size="lg" loading={loading} disabled={EMAIL_VERIFICATION_ENABLED && !isEmailVerified}>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="text-center text-sm text-surface-500 mt-6">
              Already have an account? <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
