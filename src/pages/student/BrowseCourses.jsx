import { useState } from 'react';
import { Search, Filter, BookOpen, Clock, Star } from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import CourseCard from '../../components/CourseCard';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useLandingData } from '../../hooks/useLandingData';

import Skeleton, { CourseCardSkeleton } from '../../components/Skeleton';
import { formatCategory } from '../../utils/format';

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

const BrowseCourses = () => {
  const { courses, loading, error } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const { stats, categories, loading: landingLoading } = useLandingData();
  const navigate = useNavigate();

  const CATEGORIES = ['All', ...categories.map(c => c.name)];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-10 pb-10">
        <div className="space-y-2">
          <Skeleton width="250px" height="32px" />
          <Skeleton width="450px" height="20px" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">Failed to load courses</h3>
        <p className="text-zinc-500 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-10 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Browse Courses</h1>
        <p className="text-zinc-500 text-lg">Discover new skills from our growing catalog of expert-led courses.</p>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search for courses, topics, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-zinc-800 placeholder-zinc-400"
          />
        </div>

        {/* Category Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest shrink-0">
              <Filter className="w-3.5 h-3.5" /> Category
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${selectedCategory === cat
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
              >
                {cat === 'All' ? 'All' : formatCategory(cat)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest shrink-0">
              <BookOpen className="w-3.5 h-3.5" /> Level
            </span>
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${selectedLevel === lvl
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-zinc-500 font-medium -mt-4">
        Showing <span className="text-zinc-900 font-bold">{filteredCourses.length}</span> courses
        {searchTerm && <> for "<span className="text-primary-600">{searchTerm}</span>"</>}
      </p>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-zinc-200 py-24 text-center shadow-sm">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">No courses found</h3>
          <p className="text-zinc-500 max-w-sm mx-auto mb-6">
            Try adjusting your search or clearing the filters.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedLevel('All'); }}
            className="px-6 py-2.5 bg-primary-50 text-primary-600 font-bold rounded-xl hover:bg-primary-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowseCourses;
