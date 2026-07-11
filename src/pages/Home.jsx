import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowRight, Play, Star, Users, BookOpen, Award, CheckCircle2, ChevronRight, Quote,
  Code, Briefcase, Palette, TrendingUp, Cpu, DollarSign
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import Button from '../components/Button';
import { useCourses } from '../hooks/useCourses';
import Loader from '../components/Loader';
import CourseCardSkeleton from '../components/CourseCardSkeleton';

import { useLandingData } from '../hooks/useLandingData';
import { formatCategory } from '../utils/format';

const CATEGORY_ICONS = {
  development: Code,
  business: Briefcase,
  design: Palette,
  marketing: TrendingUp,
  it: Cpu,
  finance: DollarSign
};

const Home = () => {
  const location = useLocation();
  const { courses, loading: coursesLoading } = useCourses();
  const { stats, testimonials, categories, loading: landingLoading } = useLandingData();


  useEffect(() => {
    if (location.hash === '#testimonials') {
      const element = document.getElementById('testimonials');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-300/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="flex flex-col items-center text-center">
            <div className="max-w-3xl animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm text-white font-medium mb-8 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                Trusted by {stats.students || 0} learners worldwide
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold font-display text-white leading-[1.1] mb-8">
                Master New Skills.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-100 italic">Transform Your</span>
                <br />
                Career Today.
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                Access 500+ premium courses from industry experts. Learn at your own pace with interactive content, live classes, and personalized mentoring.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6">
                <Link to="/register">
                  <Button className="h-16 px-10 !text-white rounded-2xl shadow-2xl hover:shadow-[0_25px_50px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 border-none font-bold text-lg tracking-tight">
                    Start Learning Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <button className="group inline-flex items-center gap-4 h-16 px-8 text-white bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 transition-all duration-300 active:scale-95 shadow-xl">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform duration-500 group-hover:rotate-[360deg] shadow-lg">
                    <Play className="w-4 h-4 fill-primary-600 text-primary-600 ml-0.5" />
                  </div>
                  <span className="font-bold text-lg">Watch Demo</span>
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-12 mt-20 pt-12 border-t border-white/20">
                {[
                  { value: stats.students, label: 'Students' },
                  { value: stats.courses, label: 'Courses' },
                  { value: stats.instructors, label: 'Experts' },
                  { value: stats.avgRating, label: 'Average Rating' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-extrabold text-white mb-1.5">{stat.value}</p>
                    <p className="text-xs font-bold text-white/60 uppercase tracking-[0.2em]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-4">Why Zinda Learn?</span>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-surface-900 mb-4">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-surface-500 max-w-2xl mx-auto">
              Our platform provides all the tools and resources for an exceptional learning experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Expert-Led Courses', desc: 'Learn from industry professionals with years of real-world experience', color: 'from-primary-500 to-purple-600' },
              { icon: Play, title: 'Interactive Learning', desc: 'Engage with hands-on projects, quizzes, and live coding sessions', color: 'from-blue-500 to-cyan-500' },
              { icon: Users, title: 'Community Support', desc: 'Connect with thousands of learners and mentors in our vibrant community', color: 'from-pink-500 to-rose-500' },
              { icon: Award, title: 'Certificates', desc: 'Earn industry-recognized certificates upon course completion', color: 'from-amber-500 to-orange-500' },
              { icon: Star, title: 'Personalized Paths', desc: 'AI-powered learning paths tailored to your goals and skill level', color: 'from-green-500 to-emerald-500' },
              { icon: CheckCircle2, title: 'Lifetime Access', desc: 'Access your courses forever with free updates and new content', color: 'from-indigo-500 to-violet-500' },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 mb-2">{feature.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-4">Browse Categories</span>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-surface-900 mb-4">
              Explore <span className="gradient-text">Top Categories</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.length > 0 ? categories.map((cat) => {
              const IconComponent = CATEGORY_ICONS[cat.name] || BookOpen;
              return (
                <Link
                  key={cat.name}
                  to={`/courses?category=${encodeURIComponent(cat.name)}`}
                  className="group bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 text-center border border-surface-100 hover:border-primary-200"
                >
                  <div className="flex justify-center mb-4 text-primary-600 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-10 h-10" />
                  </div>
                  <h3 className="font-semibold text-surface-900 text-sm mb-1 group-hover:text-primary-600 transition-colors">{formatCategory(cat.name)}</h3>
                  <p className="text-xs text-surface-400">{cat.count} courses</p>
                </Link>
              );
            }) : (
              <div className="col-span-full py-10 text-center text-surface-400">Loading categories...</div>
            )}
          </div>
        </div>
      </section>

      {/* Trending Courses */}
      <section className="py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-4">Popular Courses</span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-surface-900">
                Trending <span className="gradient-text">Courses</span>
              </h2>
            </div>
            <Link to="/courses" className="hidden sm:flex items-center gap-1 text-primary-600 font-semibold hover:gap-2 transition-all">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {coursesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link to="/courses">
              <Button variant="secondary">View All Courses</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider mb-5">Students Success</span>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-surface-900 mb-6">
              Hear what our <span className="gradient-text">community</span> says
            </h2>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              Trusted by professionals and beginners alike. Here's how Zinda Learn has helped students transform their careers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {testimonials.length > 0 ? testimonials.map((t) => (
              <div
                key={t._id}
                className="bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-surface-100 flex flex-col h-full"
              >
                <div className="mb-6">
                  <Quote className="w-12 h-12 text-primary-100 fill-primary-50" />
                </div>

                <p className="text-surface-600 text-lg leading-relaxed mb-8 flex-1 italic">
                  "{t.comment || t.content}"
                </p>

                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-surface-200'}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-surface-50">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20">
                    {t.user?.profilePic || t.user?.avatar ? (
                      <img src={t.user.profilePic || t.user.avatar} alt={t.user.name} className="w-full h-full object-cover" />
                    ) : (
                      t.user?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-surface-900 text-base mb-0.5">{t.user?.name || 'Anonymous'}</h4>
                    <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">
                      {t.user?.role === 'student' ? 'Learner' : t.user?.role === 'instructor' ? 'Instructor' : t.user?.role || 'Learner'}
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-10 text-center text-surface-400">Join our community and share your story!</div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
