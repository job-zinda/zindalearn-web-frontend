import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter,
  Download,
  Plus,
  Building2,
  Phone,
  Banknote,
  X,
  Loader2
} from 'lucide-react';
import { getPayoutData, requestWithdrawal } from '../../services/instructorDashboardService';
import { formatCurrency } from '../../utils/currencyFormatter';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Payouts = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const fetchPayoutData = async () => {
    try {
      setLoading(true);
      const res = await getPayoutData();
      if (res.success) {
        setData(res);
      }
    } catch (error) {
      toast.error('Failed to load payouts data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || withdrawAmount < 500) {
      toast.error('Minimum withdrawal amount is ₹500');
      return;
    }
    if (withdrawAmount > (data?.stats?.availableBalance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setWithdrawing(true);
      const res = await requestWithdrawal(withdrawAmount, paymentMethod);
      if (res.success) {
        toast.success(res.message);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        fetchPayoutData(); // Refresh data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal request failed');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {
    totalRevenue: 0,
    instructorEarnings: 0,
    totalWithdrawn: 0,
    pendingWithdrawn: 0,
    availableBalance: 0
  };

  const filteredEarnings = data?.earnings?.filter(e => 
    e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Payouts & Earnings</h2>
          <p className="text-slate-500 text-sm">Manage your revenue and withdrawal requests</p>
        </div>
        <button 
          onClick={() => setShowWithdrawModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Request Withdrawal
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          label="Available Balance" 
          value={formatCurrency(stats.availableBalance)} 
          icon={Wallet} 
          color="text-primary-600" 
          bg="bg-primary-50"
          trend="Ready to withdraw"
        />
        <StatCard 
          label="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={DollarSign} 
          color="text-emerald-600" 
          bg="bg-emerald-50"
          trend={`Earnings: ${formatCurrency(stats.instructorEarnings)}`}
        />
        <StatCard 
          label="Withdrawn" 
          value={formatCurrency(stats.totalWithdrawn)} 
          icon={ArrowUpRight} 
          color="text-blue-600" 
          bg="bg-blue-50"
          trend={`Pending: ${formatCurrency(stats.pendingWithdrawn)}`}
        />
      </div>

      {/* Earnings Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900">Earnings History</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 w-full md:w-64"
              />
            </div>
            <button className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEarnings.length > 0 ? filteredEarnings.map((earning, i) => (
                <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 text-sm">{earning.studentName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">{earning.courseTitle}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">{formatCurrency(earning.amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-emerald-600 text-sm">{formatCurrency(earning.netEarnings)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-400">{new Date(earning.date).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-lg">
                      {earning.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm">
                    No earnings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="font-bold text-slate-900">Withdrawal Requests</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {data?.payouts?.length > 0 ? data.payouts.map((payout, i) => (
            <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  payout.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                  payout.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                  payout.status === 'rejected' ? 'bg-red-50 text-red-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{formatCurrency(payout.amount)}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                      payout.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      payout.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      payout.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {payout.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Requested on {new Date(payout.createdAt).toLocaleDateString()} • {payout.paymentMethod.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {payout.status === 'paid' ? (
                  <span className="text-xs font-bold text-slate-400 flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Transaction ID: {payout.transactionId || 'N/A'}
                  </span>
                ) : payout.status === 'rejected' ? (
                  <span className="text-xs font-bold text-red-400 flex items-center justify-end gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Reason: {payout.rejectionReason || 'Contact support'}
                  </span>
                ) : payout.status === 'approved' ? (
                  <span className="text-xs font-bold text-blue-400 flex items-center justify-end gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Approved - Awaiting Payment
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Processing...</span>
                )}
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-slate-400 text-sm">
              No withdrawal history found
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900">Withdraw Funds</h3>
                  <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="bg-primary-50 p-6 rounded-3xl mb-8 border border-primary-100">
                  <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">Available Balance</p>
                  <p className="text-3xl font-black text-primary-700">{formatCurrency(stats.availableBalance)}</p>
                </div>

                <form onSubmit={handleWithdrawRequest} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Withdrawal Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">₹</span>
                      <input 
                        type="number" 
                        placeholder="Min. 500"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-lg focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Minimum ₹500 required</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Payment Method</label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'bank' ? 'border-primary-600 bg-primary-50' : 'border-slate-100 hover:border-slate-200'
                      }`}>
                        <input type="radio" name="method" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="sr-only" />
                        <Building2 className={`w-6 h-6 ${paymentMethod === 'bank' ? 'text-primary-600' : 'text-slate-400'}`} />
                        <span className={`text-xs font-bold ${paymentMethod === 'bank' ? 'text-primary-700' : 'text-slate-500'}`}>Bank Transfer</span>
                      </label>
                      <label className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'upi' ? 'border-primary-600 bg-primary-50' : 'border-slate-100 hover:border-slate-200'
                      }`}>
                        <input type="radio" name="method" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="sr-only" />
                        <Phone className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-primary-600' : 'text-slate-400'}`} />
                        <span className={`text-xs font-bold ${paymentMethod === 'upi' ? 'text-primary-700' : 'text-slate-500'}`}>UPI ID</span>
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={withdrawing || !withdrawAmount || withdrawAmount < 500}
                    className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 active:scale-95"
                  >
                    {withdrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Withdrawal'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, bg, trend }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-48">
    <div className="flex justify-between items-start mb-6">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-3xl font-black text-slate-900 leading-none`}>{value}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
      <Clock className="w-4 h-4 text-slate-400" />
      {trend}
    </div>
  </div>
);

export default Payouts;
