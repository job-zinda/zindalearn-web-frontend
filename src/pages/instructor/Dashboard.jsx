import { useState, useEffect } from 'react';
import { getInstructorCourses, getInstructorStats } from '../../services/instructorService';
import { formatCurrency } from '../../utils/currencyFormatter';
import { BookOpen, Users, DollarSign, TrendingUp, PlusCircle, Eye, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: '0',
    totalStudents: '0',
    totalRevenue: '₹0',
    monthlyEarnings: '₹0'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isApproved) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [coursesData, statsData] = await Promise.all([
        getInstructorCourses(),
        getInstructorStats()
      ]);

      const fetchedCourses = coursesData.courses || [];
      setCourses(fetchedCourses);

      if (statsData.success) {
        setStats({
          totalCourses: statsData.data.totalCourses,
          totalStudents: statsData.data.totalStudents,
          totalRevenue: formatCurrency(statsData.data.totalRevenue),
          monthlyEarnings: formatCurrency(statsData.data.monthlyEarnings)
        });
      }
    } catch (error) {
      console.error('Dashboard data error:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (user && !user.isApproved) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Waiting for Admin Approval</h2>
        <p className="text-slate-500 max-w-md">
          Your instructor account is currently under review. You'll be able to create and manage courses once an administrator approves your profile.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
        >
          Check Status
        </button>
      </div>
    );
  }

  const statCards = [
    { label: 'TOTAL COURSES', value: stats.totalCourses, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'TOTAL STUDENTS', value: stats.totalStudents, icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'TOTAL REVENUE', value: stats.totalRevenue, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'MONTHLY EARNINGS', value: stats.monthlyEarnings, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  return (
    <div className="space-y-8 animate-fade-in relative pb-10">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user?.name}</h2>
        <p className="text-slate-500 text-sm">Here's what's happening with your courses today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Courses */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Recent Courses</h3>
              <Link to="/instructor/my-courses" className="text-sm font-bold text-purple-600 hover:text-purple-700">View all &gt;</Link>
            </div>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.slice(0, 2).map((course, i) => (
                  <Link to={`/instructor/courses/${course._id}`} key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center group cursor-pointer hover:shadow-md transition-shadow">
                    <img 
                      src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop"} 
                      alt={course.title}
                      className="w-20 h-20 rounded-xl shrink-0 object-cover" 
                    />
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded">
                        {course.status || 'DRAFT'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{course.title}</h4>
                      <p className="text-xs text-slate-500 mb-2">{course.totalStudents || 0} Students</p>
                      <span className="text-xs font-bold text-purple-600 group-hover:text-purple-800 transition-colors">Manage Course &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm text-slate-500">No courses created yet.</p>
                <Link to="/instructor/create-course" className="text-sm font-bold text-purple-600 mt-2 block">Create your first course &rarr;</Link>
              </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">QUICK ACTIONS</h3>
            <div className="space-y-3">
              <Link to="/instructor/create-course" className="w-full flex items-center justify-between p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-bold text-sm shadow-md shadow-purple-200">
                <span className="flex items-center gap-2"><PlusCircle className="w-5 h-5" /> Create Course</span>
                <span className="text-lg leading-none">&rsaquo;</span>
              </Link>
              <Link to="/instructor/my-courses" className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors font-bold text-sm">
                <span className="flex items-center gap-2"><Eye className="w-5 h-5" /> View Courses</span>
                <span className="text-lg leading-none">&rsaquo;</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
            <div className="py-10 text-center">
              <Clock className="w-10 h-10 text-slate-200 mx-auto mb-4" />
              <p className="text-sm text-slate-400">No recent activity</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
