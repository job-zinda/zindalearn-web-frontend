import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/adminService';
import {
  Users, GraduationCap, BookOpen, DollarSign,
  ArrowUpRight, Clock, BookPlus, ShieldCheck,
  TrendingUp, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingApprovals: 0,
    revenue: 0,
    userGrowth: [],
    revenueBreakdown: [],
    recentActivity: [],
    latestInsight: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getDashboardStats();
      if (data) {
        setStats({
          totalUsers: data.totalUsers || 0,
          totalCourses: data.totalCourses || 0,
          pendingApprovals: data.pendingTutors || 0,
          revenue: data.totalRevenue || 0,
          userGrowth: data.userGrowth || [],
          revenueBreakdown: data.revenueBreakdown || [],
          recentActivity: data.recentActivity || [],
          latestInsight: data.latestInsight || null
        });
      }
    } catch (error) {
      toast.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const formatCurrency = (num) => {
    if (num >= 100000) return '₹' + (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return '₹' + (num / 1000).toFixed(1) + 'K';
    return '₹' + num;
  };

  const statCards = [
    { label: 'Total Users', value: formatNumber(stats.totalUsers), icon: Users, color: 'text-indigo-400 bg-indigo-500/10' },
    { label: 'Pending Instructors', value: stats.pendingApprovals, icon: GraduationCap, color: 'text-amber-400 bg-amber-500/10', alert: stats.pendingApprovals > 0 },
    { label: 'Active Courses', value: formatNumber(stats.totalCourses), icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Total Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'text-blue-400 bg-blue-500/10' },
  ];

  const growthData = stats.userGrowth.length > 0
    ? stats.userGrowth.map(d => ({ month: (d.month || '').toUpperCase(), users: d.users }))
    : [{ month: 'JAN', users: 0 }, { month: 'FEB', users: 0 }, { month: 'MAR', users: 0 },
       { month: 'APR', users: 0 }, { month: 'MAY', users: 0 }, { month: 'JUN', users: 0 }];

  const revenueData = stats.revenueBreakdown.slice(0, 6).map(d => ({
    category: (d.category?.length > 12 ? d.category.slice(0, 12) + '…' : d.category) || '',
    amount: d.amount || 0,
  }));

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="font-semibold text-slate-100">{payload[0]?.value?.toLocaleString()}</p>
      </div>
    );
  };

  const RevenueTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="font-semibold text-slate-100">₹{payload[0]?.value?.toLocaleString()}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 bg-slate-800 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/60 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 bg-slate-800/50 rounded-xl border border-slate-700/60 animate-pulse" />
          <div className="h-64 bg-slate-800/50 rounded-xl border border-slate-700/60 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-400">Platform overview and key metrics</p>
        </div>
        {stats.pendingApprovals > 0 && (
          <Link
            to="/admin/instructor-management"
            className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/20 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {stats.pendingApprovals} pending approval{stats.pendingApprovals !== 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 hover:border-slate-600 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4" />
              </div>
              {stat.alert && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
            </div>
            <p className="text-xs font-medium text-slate-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold text-slate-100 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Growth — Area Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">User Growth</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly active registrations</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" />
              Live
            </div>
          </div>
          {growthData.every(d => d.users === 0) ? (
            <div className="h-52 flex items-center justify-center">
              <p className="text-sm text-slate-500">No growth data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={208}>
              <AreaChart data={growthData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fill="url(#userGradient)" dot={false} activeDot={{ r: 4, fill: '#6366f1', stroke: '#0f172a', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue Breakdown — Bar Chart */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-200">Revenue by Category</h3>
            <p className="text-xs text-slate-500 mt-0.5">Top earning categories</p>
          </div>
          {revenueData.length === 0 ? (
            <div className="h-52 flex items-center justify-center">
              <p className="text-sm text-slate-500">No revenue data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={208}>
              <BarChart data={revenueData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'K' : v}`} />
                <YAxis type="category" dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={72} />
                <Tooltip content={<RevenueTooltip />} />
                <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-200">Recent Activity</h3>
            <Link to="/admin/support" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all →
            </Link>
          </div>
          {stats.recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Clock className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-sm text-slate-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-0">
              {stats.recentActivity.slice(0, 6).map((activity, idx) => (
                <div key={activity.id || idx} className="flex items-start gap-3 py-3 border-b border-slate-700/40 last:border-0">
                  <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.type === 'course' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {activity.type === 'course' ? <BookPlus className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{activity.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{activity.subtitle}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${activity.status === 'published' || activity.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {activity.status}
                    </span>
                    <p className="text-[10px] text-slate-600 mt-1">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Quick Actions</h3>
          <div className="space-y-1">
            {[
              { label: 'Review Instructors', desc: `${stats.pendingApprovals} pending`, to: '/admin/instructor-management', icon: GraduationCap, color: 'text-amber-400 bg-amber-500/10' },
              { label: 'Manage Courses', desc: `${stats.totalCourses} total`, to: '/admin/courses', icon: BookOpen, color: 'text-indigo-400 bg-indigo-500/10' },
              { label: 'View Payments', desc: `${formatCurrency(stats.revenue)} total`, to: '/admin/payments', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'Platform Analytics', desc: 'Reports & insights', to: '/admin/analytics', icon: TrendingUp, color: 'text-blue-400 bg-blue-500/10' },
            ].map((action, i) => (
              <Link key={i} to={action.to} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors group">
                <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">{action.label}</p>
                  <p className="text-xs text-slate-500">{action.desc}</p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
