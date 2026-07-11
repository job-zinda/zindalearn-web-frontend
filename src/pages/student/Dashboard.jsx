import { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, TrendingUp, ChevronRight, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyEnrollments } from '../../services/courseService';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await getMyEnrollments();
        setEnrollments(data.enrollments || []);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        setEnrollments([]); // Fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const stats = [
    { label: 'Courses Enrolled', value: enrollments?.length || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Hours Learned', value: `${user?.hoursLearned || 0}h`, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Certificates', value: user?.certificates?.length || 0, icon: Award, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Skill Points', value: user?.points?.toLocaleString() || 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  if (loading) return <Loader fullScreen text="Loading your dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-10">
      {/* 1. HERO SECTION (NETFLIX STYLE) */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 shadow-xl border border-zinc-800 group">
        {/* Abstract Gradient Overlay - Fade Left to Right */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-transparent z-10 w-full lg:w-3/4"></div>
        
        {(enrollments && enrollments.length > 0 && enrollments[0].course) && (
          <img 
            src={enrollments[0].course?.thumbnail} 
            alt={enrollments[0].course?.title}
            className="absolute inset-0 w-full h-full object-cover object-right opacity-40 group-hover:opacity-50 transition-opacity duration-1000"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10"></div>
        
        <div className="relative z-20 p-8 lg:p-12 flex flex-col justify-end min-h-[380px] lg:min-h-[460px]">
          <h1 className="text-lg lg:text-xl font-medium text-zinc-400 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Learner'}
          </h1>
          
          {enrollments.length > 0 ? (
            <div className="max-w-2xl mt-2">
              <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
                Continue Learning
              </span>
              <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 leading-tight drop-shadow-lg">
                {enrollments[0].course?.title}
              </h2>
              <p className="text-zinc-300 mb-8 max-w-xl text-lg font-light tracking-wide">
                Module {(enrollments[0].currentLesson?.moduleIndex || 0) + 1} — Lesson {(enrollments[0].currentLesson?.lessonIndex || 0) + 1}
              </p>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 max-w-sm bg-zinc-800 h-1.5 rounded-full overflow-hidden border border-zinc-700/50">
                  <div 
                    className="bg-primary-500 h-full rounded-full relative shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                    style={{ width: `${enrollments[0].progress}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/40 rounded-full"></div>
                  </div>
                </div>
                <span className="text-white font-bold text-sm tracking-wider">{enrollments[0].progress}%</span>
              </div>
              
              <div className="flex items-center gap-4 flex-wrap">
                <Button 
                  className="!px-8 !py-3.5 !bg-white !text-zinc-900 hover:!bg-zinc-200 transition-colors font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-3"
                  onClick={() => navigate(`/student/my-learning?course=${enrollments[0].course?._id}&play=true`)}
                >
                  <Play className="w-5 h-5 fill-zinc-900 text-zinc-900" />
                  Resume
                </Button>
                <button 
                  onClick={() => navigate('/student/browse-courses')}
                  className="px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 border border-zinc-700"
                >
                  Browse Courses
                </button>
                <button 
                  onClick={() => navigate(`/courses/${enrollments[0].course?._id}`)}
                  className="text-zinc-400 hover:text-white font-semibold text-sm transition-colors flex items-center gap-1.5 ml-2"
                >
                  Course Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mt-2">
               <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
                Ready to level up?
              </h2>
              <p className="text-zinc-400 text-lg mb-8 max-w-xl">
                Explore our catalog of premium courses and start building your future today.
              </p>
              <Button 
                className="!px-8 !py-3.5 !bg-white !text-zinc-900 hover:!bg-zinc-200 transition-colors font-bold text-lg rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                onClick={() => navigate('/student/browse-courses')}
              >
                Browse Courses
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 3. STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm hover:shadow-md border border-zinc-100 transition-all duration-300 group">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-zinc-500 text-sm font-semibold tracking-wide mb-1 uppercase">{stat.label}</p>
            <p className="text-3xl font-extrabold text-zinc-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 2. CONTINUE LEARNING LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xl font-bold text-zinc-900">Up Next for you</h2>
            {enrollments.length > 3 && (
              <button className="text-primary-600 text-sm font-bold hover:text-primary-700 flex items-center gap-1 transition-colors">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {(enrollments && enrollments.length > 0) ? (
              enrollments.map((enrollment) => (
                <div 
                  key={enrollment._id} 
                  className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md border border-zinc-100 flex items-center gap-5 group cursor-pointer transition-all duration-300"
                  onClick={() => navigate(`/student/my-learning?course=${enrollment.course?._id}&play=true`)}
                >
                  <div className="relative overflow-hidden rounded-xl w-32 h-20 shrink-0 border border-zinc-100">
                    <img 
                      src={enrollment.course?.thumbnail} 
                      alt={enrollment.course?.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg overflow-hidden">
                        <Play className="w-3.5 h-3.5 text-zinc-900 fill-zinc-900 ml-0.5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-zinc-900 truncate group-hover:text-primary-600 transition-colors mb-1.5 text-lg">
                      {enrollment.course?.title}
                    </h3>
                    <p className="text-zinc-500 text-sm mb-3 font-medium">Module {(enrollment.currentLesson?.moduleIndex || 0) + 1} — Lesson {(enrollment.currentLesson?.lessonIndex || 0) + 1}</p>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden flex items-center">
                      <div 
                        className="bg-primary-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-right hidden sm:block w-16">
                    <p className="font-bold text-zinc-900 mb-0.5 text-lg">{enrollment.progress}%</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-zinc-200 text-center shadow-sm">
                <p className="text-zinc-500 mb-5 font-medium">No active courses yet.</p>
                <Button variant="secondary" onClick={() => navigate('/student/browse-courses')} className="shadow-sm">
                  Browse Courses
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* LEARNING ACTIVITY SIDEBAR */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 px-1">Learning Activity</h2>
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-zinc-100 h-auto min-h-[380px] flex flex-col items-center justify-center text-center">
            <div className="relative w-48 h-48 rounded-full flex items-center justify-center mb-6">
              <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                <circle cx="96" cy="96" r="88" fill="none" className="stroke-zinc-100" strokeWidth="12" />
                <circle cx="96" cy="96" r="88" fill="none" className="stroke-primary-500" strokeWidth="12" strokeDasharray="552.92" strokeDashoffset="552.92" strokeLinecap="round" />
              </svg>
              <div>
                <p className="text-4xl font-extrabold text-zinc-900">0%</p>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Goal Reached</p>
              </div>
            </div>
            <p className="text-zinc-900 font-bold mb-2 text-lg">Start your journey today!</p>
            <p className="text-zinc-500 text-sm px-4 leading-relaxed">Consistency is the key to mastering new skills. Set your weekly learning goal now.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
