import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/adminService';
import { BarChart3, TrendingUp, Users, DollarSign, BookOpen, Target } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import PageHeader from '../../components/admin/shared/PageHeader';
import { toast } from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setData(res.data);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };


  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-semibold" style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 bg-slate-800 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-slate-800/50 rounded-xl border border-slate-700/60 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const userGrowth = data?.userGrowth || [];
  const revenueByCategory = data?.revenueBreakdown || [];
  const enrollmentByMonth = data?.enrollmentByMonth || [];
  const retentionRate = data?.retentionRate || 0;
  const topCourses = data?.topCourses || [];

  const pieData = revenueByCategory.slice(0, 5).map((item, i) => ({
    name: item.category,
    value: item.amount || 0,
    fill: COLORS[i % COLORS.length]
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Analytics" subtitle="Platform performance metrics and growth insights." />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg. Session', value: data?.avgSessionTime || '8m 32s', icon: Target, color: 'text-indigo-400 bg-indigo-500/10' },
          { label: 'Completion Rate', value: `${data?.completionRate || 0}%`, icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'User Retention', value: `${retentionRate}%`, icon: Users, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'MoM Growth', value: data?.momGrowth ? `+${data.momGrowth}%` : '—', icon: TrendingUp, color: 'text-amber-400 bg-amber-500/10' },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 hover:border-slate-600 transition-colors">
            <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center mb-3`}>
              <kpi.icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
            <p className="text-xl font-semibold text-slate-100">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* User Growth Line Chart */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">User Growth</h3>
          <p className="text-xs text-slate-500 mb-4">Monthly new registrations</p>
          {userGrowth.length === 0 ? (
            <div className="h-48 flex items-center justify-center"><p className="text-sm text-slate-500">No data available</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={userGrowth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="users" name="Users" stroke="#6366f1" strokeWidth={2} fill="url(#analyticsGradient)" dot={false} activeDot={{ r: 4, fill: '#6366f1', stroke: '#0f172a', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue by Category Bar Chart */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Revenue by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Top-earning course categories</p>
          {revenueByCategory.length === 0 ? (
            <div className="h-48 flex items-center justify-center"><p className="text-sm text-slate-500">No data available</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueByCategory.slice(0, 6)} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v.length > 8 ? v.slice(0, 8) + '…' : v} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'K' : v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="amount" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Enrollments */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Enrollments per Month</h3>
          <p className="text-xs text-slate-500 mb-4">Course enrollment activity over time</p>
          {enrollmentByMonth.length === 0 ? (
            <div className="h-48 flex items-center justify-center"><p className="text-sm text-slate-500">No data available</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={enrollmentByMonth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="count" name="Enrollments" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#10b981', stroke: '#0f172a', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue Distribution Donut */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Revenue Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Share by category</p>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center"><p className="text-sm text-slate-500">No data available</p></div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.fill }} />
                    <span className="text-xs text-slate-400 truncate">{entry.name}</span>
                    <span className="ml-auto text-xs font-medium text-slate-300">
                      ₹{entry.value >= 1000 ? (entry.value / 1000).toFixed(0) + 'K' : entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Courses Table */}
      {topCourses.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/60">
            <h3 className="text-sm font-semibold text-slate-200">Top Performing Courses</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ranked by enrollment and revenue</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/40">
                  {['#', 'Course', 'Students', 'Revenue', 'Rating'].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {topCourses.slice(0, 10).map((course, idx) => (
                  <tr key={course._id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-500">#{idx + 1}</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-200 line-clamp-1 max-w-[280px]">{course.title}</p>
                        <p className="text-xs text-slate-500">{course.instructor?.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">{(course.totalStudents || 0).toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm font-medium text-emerald-400">
                      ₹{((course.totalStudents || 0) * (course.price || 0)).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-amber-400">{course.rating || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
