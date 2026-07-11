import { useState, useEffect } from 'react';
import { getInstructorCourses } from '../../services/instructorService';
import { formatCurrency } from '../../utils/currencyFormatter';
import { DollarSign, TrendingUp, ArrowUpRight, CreditCard, MoreVertical, Download } from 'lucide-react';

const Earnings = () => {
  const [courses, setCourses] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getInstructorCourses();
        const list = data.courses || [];
        setCourses(list);
        setTotalEarnings(list.reduce((acc, c) => acc + ((c.totalStudents || 0) * (c.price || 0)), 0));
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, []);

  const mockTransactions = [
    { id: '#TXN-8821', course: 'Mastering React & Next.js', student: 'Sarah Jenkins', amount: 1999, date: 'Oct 24, 2024', method: 'Visa' },
    { id: '#TXN-8820', course: 'Python for Data Science', student: 'Marcus Chen', amount: 1499, date: 'Oct 23, 2024', method: 'PayPal' },
    { id: '#TXN-8819', course: 'Mastering React & Next.js', student: 'Elena Rodriguez', amount: 1999, date: 'Oct 22, 2024', method: 'Visa' },
    { id: '#TXN-8818', course: 'Python for Data Science', student: 'David Miller', amount: 1499, date: 'Oct 21, 2024', method: 'UPI' },
  ];

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payouts</h1>
          <p className="text-slate-500 text-sm">Track your revenue and transaction history.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-200 transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full"></div>
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earnings</p>
          {loading ? (
            <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse"></div>
          ) : (
            <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(totalEarnings)}</h3>
          )}
          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-emerald-600">
            <ArrowUpRight className="w-4 h-4" /> +18.2% this month
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full"></div>
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">This Month</p>
          <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(Math.round(totalEarnings * 0.35))}</h3>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-emerald-600">
            <ArrowUpRight className="w-4 h-4" /> +9.1% vs last month
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full"></div>
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
            <CreditCard className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Payout</p>
          <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(Math.round(totalEarnings * 0.12))}</h3>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Processing — 3-5 days
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Transaction ID', 'Course', 'Student', 'Amount', 'Date', 'Method', ''].map(h => (
                  <th key={h} className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockTransactions.map((tx, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono text-purple-600 font-bold">{tx.id}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-800 max-w-[160px] truncate">{tx.course}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="" className="w-7 h-7 rounded-full border border-slate-200" />
                      <span className="text-sm text-slate-700">{tx.student}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-900">{formatCurrency(tx.amount)}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{tx.date}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">{tx.method}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-slate-400 hover:text-slate-600 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {!loading && courses.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">No transactions yet. Enrolments will appear here.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
