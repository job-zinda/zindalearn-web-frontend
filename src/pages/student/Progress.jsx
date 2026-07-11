import { useState, useEffect } from 'react';
import { 
  Trophy, Target, Zap, Clock, BookOpen, CheckCircle, 
  TrendingUp, Calendar, ChevronRight, Play, Award, BarChart3,
  Activity, Star, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  getProgressOverview, 
  getCoursesProgress, 
  getProgressAnalytics, 
  getProgressActivity 
} from '../../services/progressService';
import Loader from '../../components/Loader';
import { useNavigate } from 'react-router-dom';

const ProgressPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovData, cData, aData, actData] = await Promise.all([
          getProgressOverview(),
          getCoursesProgress(),
          getProgressAnalytics(),
          getProgressActivity()
        ]);
        setOverview(ovData.data);
        setCourses(cData.data);
        setAnalytics(aData.data);
        setActivity(actData.data);
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader fullScreen text="Analyzing your progress..." />;

  const stats = [
    { label: 'Completed', value: overview?.completedCourses || 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'In Progress', value: overview?.inProgressCourses || 0, icon: Play, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Learning Hours', value: overview?.totalWatchTime ? Math.round(overview.totalWatchTime / 60) : 0, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Skill Points', value: overview?.points?.toLocaleString() || 0, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 pb-20"
    >
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Your Learning Progress</h1>
          <p className="text-zinc-500 font-medium mt-1">Keep track of your growth and achievements across all courses.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-3 pr-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Rank</p>
              <p className="text-lg font-black text-zinc-900">#42</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-zinc-200/50 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-zinc-500 text-sm font-bold tracking-tight mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-zinc-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 3. PERFORMANCE ANALYTICS (Charts) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Weekly Activity Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/30">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">Learning Activity</h3>
                  <p className="text-sm text-zinc-400 font-medium">Minutes spent learning per day</p>
                </div>
              </div>
              <select className="bg-zinc-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-zinc-600 focus:ring-2 focus:ring-primary-500/20">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.weeklyActivity || []}>
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontWeight: 800, color: '#8b5cf6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="minutes" 
                    stroke="#8b5cf6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorMinutes)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Course Progress Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-zinc-900">Enrolled Courses</h2>
              <button className="text-primary-600 text-sm font-bold hover:underline">View All</button>
            </div>
            
            <div className="grid gap-4">
              {courses.length > 0 ? courses.map((course, i) => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate(`/student/my-learning?course=${course.id}`)}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-20 rounded-2xl overflow-hidden shrink-0 border border-zinc-100 relative">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                         <h3 className="text-lg font-bold text-zinc-900 truncate group-hover:text-primary-600 transition-colors">{course.title}</h3>
                         <span className="text-sm font-black text-zinc-900">{course.progress}%</span>
                      </div>
                      <p className="text-sm text-zinc-400 font-medium mb-3">Next: {course.lastWatched || 'Start learning'}</p>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="bg-primary-500 h-full rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" 
                        />
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-2 pr-2">
                       <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                          <BookOpen className="w-3.5 h-3.5" />
                          {course.completedLessons}/{course.totalLessons} Lessons
                       </div>
                       <button className="p-2 bg-zinc-50 rounded-xl group-hover:bg-primary-500 group-hover:text-white transition-all">
                          <ChevronRight className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2.5rem] p-12 text-center">
                   <p className="text-zinc-400 font-bold mb-4">No courses enrolled yet.</p>
                   <button 
                    onClick={() => navigate('/student/browse-courses')}
                    className="px-8 py-3 bg-white text-zinc-900 font-bold rounded-2xl shadow-sm border border-zinc-200 hover:bg-zinc-50 transition-colors"
                   >
                     Explore Courses
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. SIDEBAR (Performance & Insights) */}
        <div className="space-y-8">
           {/* Radar Chart: Skill Balance */}
           <div className="bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-400" />
                Skill Balance
              </h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analytics?.courseCompletion || []}>
                    <PolarGrid stroke="#3f3f46" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: '#a1a1aa', fontSize: 10}} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Progress"
                      dataKey="A"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-800 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm font-medium">Top Skill</span>
                    <span className="font-bold text-primary-400">Web Development</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm font-medium">Live Class Participation</span>
                    <span className="font-bold text-amber-400">{overview?.liveAttendanceCount || 0} Sessions</span>
                 </div>
              </div>
           </div>

           {/* Achievements / Badges */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/30">
              <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Achievements
              </h3>
              <div className="grid grid-cols-3 gap-4">
                 {[1, 2, 3, 4, 5, 6].map((b) => (
                    <div key={b} className={`aspect-square rounded-2xl flex items-center justify-center ${b <= 3 ? 'bg-amber-50 text-amber-600' : 'bg-zinc-50 text-zinc-300'} border border-zinc-100 transition-transform hover:scale-110 cursor-help`}>
                       <Star className={`w-8 h-8 ${b <= 3 ? 'fill-amber-500' : 'fill-transparent'}`} />
                    </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-3 bg-zinc-50 text-zinc-500 font-bold rounded-2xl text-sm hover:bg-zinc-100 transition-colors">
                View All Badges
              </button>
           </div>

           {/* Recent Activity Timeline */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/30">
              <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                Recent Activity
              </h3>
              <div className="space-y-6">
                {activity.length > 0 ? activity.map((act, i) => (
                  <div key={act.id} className="flex gap-4 relative group">
                    {i !== activity.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-zinc-100" />
                    )}
                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center shrink-0 z-10">
                      <Zap className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-zinc-900 leading-tight">{act.title}</p>
                      <p className="text-xs text-zinc-400 font-bold mt-1 uppercase tracking-wider">{new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {act.description}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-zinc-400 text-sm text-center py-4">No recent activity.</p>
                )}
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressPage;
