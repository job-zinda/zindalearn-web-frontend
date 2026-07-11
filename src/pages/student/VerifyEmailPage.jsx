import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { verifyEmailToken } from '../../services/settingsService';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const data = await verifyEmailToken(token);
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification link is invalid or has expired.');
      }
    };

    if (token) {
      verify();
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-500 px-8 py-8 text-center">
            <h1 className="text-white text-2xl font-black">Zinda Learn</h1>
            <p className="text-white/80 text-sm mt-1">Email Verification</p>
          </div>

          {/* Content */}
          <div className="px-8 py-10 text-center">
            {status === 'verifying' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">Verifying your email...</h2>
                <p className="text-zinc-500 text-sm">Please wait while we confirm your email address.</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">Email Verified!</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">{message}</p>
                <button
                  onClick={() => navigate('/student/settings')}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-bold text-sm rounded-full hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 mt-4"
                >
                  Go to Settings
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-rose-600" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">Verification Failed</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">{message}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => navigate('/student/settings')}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-bold text-sm rounded-full hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
                  >
                    Go to Settings
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-zinc-50 border-t border-zinc-100 text-center">
            <p className="text-zinc-400 text-xs">
              © {new Date().getFullYear()} Zinda Learn. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
