import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Download, MoreVertical, CreditCard, Wallet, TrendingUp, Loader2, ArrowUpRight, CheckCircle2, XCircle, Banknote, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';
import { getPayments, getPayouts, updatePayoutStatus, getDashboardStats } from '../../services/adminService';
import PageHeader from '../../components/admin/shared/PageHeader';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import { toast } from 'react-hot-toast';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('enrollments');
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [payoutPagination, setPayoutPagination] = useState({ page: 1, limit: 50, total: 0 });

  useEffect(() => { fetchData(); }, [activeTab, pagination.page, payoutPagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'enrollments') {
        const [paymentsRes, statsRes] = await Promise.all([
          getPayments({ page: pagination.page, limit: pagination.limit }),
          getDashboardStats()
        ]);
        setTransactions(paymentsRes.data || []);
        setPagination(prev => ({ ...prev, total: paymentsRes.total || 0 }));
        setStats(statsRes.data);
      } else {
        const payoutsRes = await getPayouts({ page: payoutPagination.page, limit: payoutPagination.limit });
        setPayouts(payoutsRes.data || []);
        setPayoutPagination(prev => ({ ...prev, total: payoutsRes.total || 0 }));
      }
    } catch { toast.error('Failed to load financial data'); }
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updatePayoutStatus(id, { status });
      toast.success(`Payout ${status} successfully`);
      fetchData();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to update status'); }
  };

  const statCards = [
    { 
      label: 'Total Revenue', 
      value: formatCurrency(stats?.totalRevenue || 0), 
      icon: Wallet, 
      color: 'text-indigo-400 bg-indigo-500/10', 
      change: '+14.2%',
      desc: 'All-time platform earnings'
    },
    { 
      label: 'Total Enrollments', 
      value: (stats?.totalEnrollments || 0).toLocaleString(), 
      icon: TrendingUp, 
      color: 'text-blue-400 bg-blue-500/10', 
      change: '+18.5%',
      desc: 'Student courses enrolled count'
    },
    { 
      label: 'Total Transactions', 
      value: (stats?.totalTransactions || 0).toLocaleString(), 
      icon: CheckCircle2, 
      color: 'text-emerald-400 bg-emerald-500/10', 
      change: '+9.8%',
      desc: 'Successful billing entries'
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Financial Ledger"
        subtitle="Oversee transactions, instructor payouts, and platform revenue."
      >
        <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </PageHeader>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 flex items-center gap-0.5 px-2 py-0.5 rounded-md">
                <ArrowUpRight className="w-3 h-3" />
                {s.change}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400 mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-slate-100 tracking-tight">{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 hover:border-slate-600 transition-colors space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Revenue & Trends</h3>
            <p className="text-xs text-slate-500">Track dynamic monthly growth and platform transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Monthly Revenue
            </span>
          </div>
        </div>
        <div className="h-72 w-full">
          {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `₹${val.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-slate-700/60 rounded-xl bg-slate-800/10">
              <p className="text-xs text-slate-500">Insufficient monthly financial data to plot chart</p>
            </div>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-800/50 border border-slate-700 rounded-lg w-fit">
        {[
          { key: 'enrollments', label: 'Enrollment Revenue' },
          { key: 'payouts', label: 'Instructor Payouts' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${activeTab === tab.key ? 'bg-slate-700 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'enrollments' ? (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-800/80">
                  {['Transaction ID', 'Student', 'Course', 'Amount', 'Payment Method', 'Date', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : transactions.length > 0 ? transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-800/60 transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">#{tx.razorpayOrderId?.split('_')[1] || tx.paymentId?.slice(-8).toUpperCase() || tx._id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={tx.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tx.user?.name || 'User')}&background=6366f1&color=fff`}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-200">{tx.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{tx.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400 max-w-[200px] truncate">{tx.course?.title || 'Unknown'}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-200">{formatCurrency(tx.amountPaid)}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      <span className="text-xs font-medium text-slate-300 bg-slate-700/40 border border-slate-700/50 px-2 py-0.5 rounded capitalize">
                        {tx.paymentStatus === 'free' ? 'Free Access' : (tx.paymentId ? 'Razorpay (Online)' : 'Online Card/UPI')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={tx.paymentStatus} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-sm text-slate-500 animate-fade-in">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-800/80">
                  {['Instructor', 'Amount', 'Method', 'Details', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : payouts.length > 0 ? payouts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/60 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.instructor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.instructor?.name || 'Instructor')}&background=6366f1&color=fff`}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-200">{p.instructor?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{p.instructor?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-200">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded capitalize">
                        {p.paymentMethod?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {p.paymentMethod === 'bank_transfer' ? (
                        <span>{p.paymentDetails?.bankName} · {p.paymentDetails?.accountNumber}</span>
                      ) : (
                        <span>{p.paymentDetails?.upiId}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => handleUpdateStatus(p._id, 'approved')} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors" title="Approve">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleUpdateStatus(p._id, 'rejected')} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Reject">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {p.status === 'approved' && (
                          <button onClick={() => handleUpdateStatus(p._id, 'paid')} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors text-[10px] font-medium">
                            <Banknote className="w-3 h-3" />
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm text-slate-500">No payout requests found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-slate-700/60 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            {activeTab === 'enrollments'
              ? `${pagination.total.toLocaleString()} transactions`
              : `${payoutPagination.total.toLocaleString()} payout requests`
            }
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={activeTab === 'enrollments' ? pagination.page === 1 : payoutPagination.page === 1}
              onClick={() => activeTab === 'enrollments' ? setPagination(p => ({ ...p, page: p.page - 1 })) : setPayoutPagination(p => ({ ...p, page: p.page - 1 }))}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-30 text-xs transition-colors"
            >‹</button>
            <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 text-slate-200 text-xs font-semibold">
              {activeTab === 'enrollments' ? pagination.page : payoutPagination.page}
            </span>
            <button
              disabled={activeTab === 'enrollments' ? pagination.page * pagination.limit >= pagination.total : payoutPagination.page * payoutPagination.limit >= payoutPagination.total}
              onClick={() => activeTab === 'enrollments' ? setPagination(p => ({ ...p, page: p.page + 1 })) : setPayoutPagination(p => ({ ...p, page: p.page + 1 }))}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-30 text-xs transition-colors"
            >›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
