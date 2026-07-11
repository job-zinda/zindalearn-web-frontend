import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Clock,
  Star,
  ArrowUpDown
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import Loader from "../components/Loader";
import { useCourses } from "../hooks/useCourses";
import { useAuth } from "../context/AuthContext";
import { getMyEnrollments } from "../services/courseService";
import { Link } from "react-router-dom";
import { formatCategory } from '../utils/format';

const CATEGORIES = ['All', 'development', 'business', 'design', 'marketing', 'it', 'finance'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Expert'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest', icon: Clock },
  { label: 'Popular', value: 'popular', icon: TrendingUp },
  { label: 'Rating', value: 'rating', icon: Star },
  { label: 'Price: Low to High', value: 'price-low', icon: ArrowUpDown },
  { label: 'Price: High to Low', value: 'price-high', icon: ArrowUpDown },
];

const CoursesPage = () => {
  const { isAuthenticated } = useAuth();
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch enrollments if logged in
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (isAuthenticated) {
        try {
          const data = await getMyEnrollments();
          if (data.success && data.enrollments) {
            setEnrolledCourseIds(data.enrollments.map(e => e.course._id));
          }
        } catch (err) {
          console.error("Failed to fetch enrollments", err);
        }
      }
    };
    fetchEnrollments();
  }, [isAuthenticated]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filters = {
    search: debouncedSearch,
    category: selectedCategory === "All" ? undefined : selectedCategory,
    level: selectedLevel === "All" ? undefined : selectedLevel,
    sort: selectedSort,
    page: currentPage,
    limit: 12
  };

  const { courses, loading, error, pagination } = useCourses(filters);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleLevelChange = (lvl) => {
    setSelectedLevel(lvl);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSelectedSort(sort);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar showBackground={true} />
      
      <main className="flex-grow pt-32 pb-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full animate-fade-in">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-display text-zinc-900 mb-2 tracking-tight">
            Explore Courses
          </h1>
          <p className="text-lg text-zinc-500">
            Master new skills with our professional, expert-led courses.
          </p>
        </header>

        {/* Filters Bar */}
        <div className="bg-white rounded-[32px] p-6 mb-10 shadow-sm border border-zinc-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search for courses, skills, or instructors..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all font-medium text-zinc-900"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="lg:hidden flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 text-white font-bold rounded-2xl"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>

            {/* Sort & Quick Filters */}
            <div className={`${isFilterOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-4 items-center`}>
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest hidden xl:block">Sort By:</span>
                <select 
                  value={selectedSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full lg:w-48 px-5 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-bold text-sm text-zinc-700"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest hidden xl:block">Level:</span>
                <select 
                  value={selectedLevel}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="w-full lg:w-40 px-5 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-bold text-sm text-zinc-700"
                >
                  {LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Categories Tab Bar */}
          <div className="mt-8 pt-8 border-t border-zinc-100 overflow-x-auto hide-scrollbar flex items-center gap-2">
            <div className="flex items-center gap-2 text-zinc-400 mr-4 shrink-0">
              <Filter className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Categories</span>
            </div>
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`shrink-0 px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/20'
                    : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
                }`}
              >
                {category === 'All' ? 'All' : formatCategory(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        {!loading && (
          <div className="flex items-center justify-between mb-8 px-2">
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              Showing <span className="text-zinc-900">{courses.length}</span> of <span className="text-zinc-900">{pagination.total}</span> courses
            </p>
            {debouncedSearch && (
              <p className="text-sm text-zinc-500">
                Search results for "<span className="font-bold text-zinc-900">{debouncedSearch}</span>"
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader />
            <p className="mt-4 text-zinc-400 font-bold animate-pulse">Finding the best courses for you...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-zinc-100 shadow-sm">
             <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Filter className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-bold text-zinc-900 mb-2">Something went wrong</h3>
             <p className="text-zinc-500 mb-8 max-w-xs mx-auto">{error}</p>
             <button onClick={() => window.location.reload()} className="px-8 py-3 bg-zinc-900 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95">Try Again</button>
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {courses.map((course) => (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                  enrolled={enrolledCourseIds.includes(course._id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-3">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-100 rounded-2xl text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-12 h-12 rounded-2xl text-sm font-bold transition-all ${
                        currentPage === i + 1
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-white border border-zinc-100 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-100 rounded-2xl text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-zinc-200">
            <div className="w-20 h-20 bg-zinc-50 text-zinc-200 rounded-[32px] flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">No courses found</h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-8">
              We couldn't find any courses matching your criteria. Try adjusting your filters or search term.
              <br /><br />
              <span className="text-xs italic">Are you an instructor? Your courses might be pending approval. Check your <Link to="/instructor/my-courses" className="text-purple-600 font-bold hover:underline">Dashboard</Link>.</span>
            </p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedLevel('All'); }}
              className="px-8 py-3 bg-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 transition-all active:scale-95"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;
