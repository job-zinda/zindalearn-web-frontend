import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Send, 
  LifeBuoy, 
  LogOut, 
  MessageSquare,
  Clock, 
  CheckCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createTicket, getMyTickets } from '../services/supportService';
import { getUserProfile } from '../services/userService';
import { toast } from 'react-hot-toast';

const AccountBlocked = () => {
  const { user: authUser, logout, updateUser } = useAuth();
  const user = authUser || JSON.parse(localStorage.getItem('zinda_user') || 'null');
  const navigate = useNavigate();
  const [subject, setSubject] = useState('Account Suspension Appeal');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Redirect away if user is not blocked or not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.isBlocked) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'instructor') navigate('/instructor/dashboard');
      else navigate('/student/dashboard');
    }
  }, [user?.isBlocked, user?.role, navigate]);

  // Load existing appeals/tickets and fetch latest reason if logged in
  useEffect(() => {
    if (user) {
      fetchAppeals();
      fetchFreshestReason();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?._id]);

  const fetchFreshestReason = async () => {
    try {
      const data = await getUserProfile();
      // If it returns 200 success, the user is NOT blocked!
      if (data?.user) {
        updateUser(data.user);
        toast.success("Your account access has been restored.");
        if (data.user.role === 'admin') navigate('/admin/dashboard');
        else if (data.user.role === 'instructor') navigate('/instructor/dashboard');
        else navigate('/student/dashboard');
      }
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.blocked) {
        const backendReason = error.response.data.blockedReason || error.response.data.reason;
        if (backendReason && backendReason !== user?.blockedReason) {
          const updatedUser = {
            ...user,
            isBlocked: true,
            blockedReason: backendReason
          };
          updateUser(updatedUser);
        }
      }
    }
  };

  const fetchAppeals = async () => {
    try {
      setLoadingTickets(true);
      const res = await getMyTickets();
      if (res.success) {
        setMyTickets(res.tickets);
      }
    } catch (error) {
      console.error('Error fetching appeals:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  const handleHelpCenter = () => {
    // Redirect to public FAQs page or about page
    navigate('/about');
  };

  const handleSubmitAppeal = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      return toast.error('Please enter a message for support.');
    }

    try {
      setSubmitting(true);
      const res = await createTicket({
        subject,
        category: 'Other',
        message: `[ACCOUNT SUSPENSION APPEAL]\n\nUser Name: ${user?.name}\nEmail: ${user?.email}\nAppeal Message:\n${message}`,
        priority: 'high'
      });

      if (res.success) {
        toast.success('Your support ticket/appeal has been submitted.');
        setMessage('');
        fetchAppeals();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit appeal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-zinc-300 font-sans selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Blocked Status Box */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 bg-[#121215] border border-rose-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.05)] relative overflow-hidden">
        
        {/* Decorative Crimson Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32"></div>
        
        {/* Left suspension details column */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-white">Access Suspended</h1>
              <p className="text-zinc-500 text-sm">
                Your Zinda Learn account has been suspended due to moderation guidelines.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 space-y-2">
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block">Reason for Suspension</span>
              <p className="text-rose-200 text-sm font-medium">
                "{user?.blockedReason || 'Violation of platform policies. Please review terms of service.'}"
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <button 
              onClick={handleHelpCenter}
              className="flex items-center gap-2 px-5 py-3 bg-[#1c1c21] hover:bg-[#27272a] text-zinc-200 hover:text-white rounded-xl text-sm font-bold border border-[#2d2d34] transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              Help Center
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 rounded-xl text-sm font-bold border border-rose-900/40 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout / Switch Account
            </button>
          </div>
        </div>

        {/* Right Appeal / Ticket thread column */}
        <div className="md:col-span-6 border-t md:border-t-0 md:border-l border-[#27272a] pt-6 md:pt-0 md:pl-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-400" />
              Submit Appeal Request
            </h3>
            
            <form onSubmit={handleSubmitAppeal} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Appeal Topic</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Detailed Appeal Message</label>
                <textarea 
                  rows={4}
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Explain why you believe this is a mistake, or ask for clarifications..."
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Appeal
              </button>
            </form>
          </div>

          {/* List of active appeals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Existing Ticket & Reply History
            </h4>
            
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1 custom-scrollbar transition-all duration-300">
              {loadingTickets && myTickets.length === 0 ? (
                <div className="space-y-2 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-3 bg-[#18181b]/50 border border-[#27272a]/50 rounded-xl flex items-center justify-between">
                      <div className="space-y-2 flex-1 mr-3">
                        <div className="h-3.5 bg-zinc-800 rounded w-1/3 animate-pulse"></div>
                        <div className="h-3 bg-zinc-800 rounded w-2/3 animate-pulse"></div>
                      </div>
                      <div className="h-5 bg-zinc-800 rounded w-12 shrink-0 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : myTickets.length > 0 ? (
                <div className={`space-y-2 transition-opacity duration-300 ${loadingTickets ? 'opacity-50' : 'opacity-100'}`}>
                  {myTickets.map(t => (
                    <div key={t._id} className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl flex items-center justify-between text-xs">
                      <div className="space-y-0.5 flex-1 min-w-0 mr-3">
                        <span className="font-bold text-white block truncate">{t.subject}</span>
                        <span className="text-[10px] text-zinc-500 block truncate">{t.message.replace('[ACCOUNT SUSPENSION APPEAL]\n\n', '')}</span>
                        {t.replies && t.replies.length > 0 && (
                          <div className="mt-1.5 p-2 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1">
                            <span className="text-[9px] font-bold text-rose-400 block">Support Agent:</span>
                            <p className="text-[10px] text-zinc-300 italic">"{t.replies[t.replies.length - 1].message}"</p>
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded shrink-0 ${
                        t.status === 'open' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                        t.status === 'pending' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                        t.status === 'resolved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                        'bg-zinc-800 text-zinc-500'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-zinc-600 block text-center py-2">No appeal history yet.</span>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AccountBlocked;
