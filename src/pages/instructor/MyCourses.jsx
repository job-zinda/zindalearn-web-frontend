import { useState, useEffect } from 'react';
import { getInstructorCourses, deleteCourse } from '../../services/instructorService';
import {
  Users,
  Search,
  ChevronDown,
  Plus,
  ArrowRight,
  BookOpen,
  Trash2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/currencyFormatter';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    limit: 6
  });

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, courseId: null, courseTitle: '' });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Fetch courses when page, tab, search or sort changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses(1); // Reset to page 1 when search/filter changes
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, searchTerm, sortBy]);

  useEffect(() => {
    fetchCourses(pagination.currentPage);
  }, [pagination.currentPage]);

  const fetchCourses = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getInstructorCourses({
        page,
        limit: 6,
        search: searchTerm,
        sort: sortBy,
        status: activeTab
      });
      setCourses(data.courses);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalCourses: data.totalCourses,
        limit: 6
      });
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteClick = (course) => {
    setDeleteModal({ isOpen: true, courseId: course._id, courseTitle: course.title });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteCourse(deleteModal.courseId);
      toast.success('Course deleted successfully');
      setDeleteModal({ isOpen: false, courseId: null, courseTitle: '' });
      fetchCourses(pagination.currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Courses</h1>
          <p className="text-slate-500 mt-1">Manage and track all your courses</p>
        </div>
        <button
          onClick={() => navigate('/instructor/create-course')}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Course
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>

        <div className="flex bg-slate-50 p-1 rounded-2xl w-full lg:w-auto overflow-x-auto scrollbar-hide">
          {['All', 'Published', 'Draft'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-auto group">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full lg:w-auto appearance-none flex items-center justify-between gap-8 px-5 py-2.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors border-none focus:ring-0 cursor-pointer pr-10"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="title">Title (A-Z)</option>
            <option value="-price">Price (High to Low)</option>
            <option value="price">Price (Low to High)</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-[32px] p-4 border border-slate-100 animate-pulse h-[400px]">
              <div className="bg-slate-100 rounded-2xl h-48 mb-4"></div>
              <div className="h-6 bg-slate-100 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))
        ) : (
          <>
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course._id} className="group bg-white rounded-[32px] p-4 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
                  <div className="relative mb-5">
                    <img
                      src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop"}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-2xl"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border ${course.status === 'published' ? 'bg-emerald-500 text-white border-emerald-400/30' :
                          course.status === 'pending' ? 'bg-amber-500 text-white border-amber-400/30' :
                            course.status === 'declined' ? 'bg-rose-500 text-white border-rose-400/30' :
                              'bg-slate-900 text-white border-slate-700/30'
                        }`}>
                        {course.status || 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div className="px-1 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-slate-900 leading-tight group-hover:text-purple-600 transition-colors line-clamp-2 min-h-[44px]">
                        {course.title}
                      </h3>
                      <div className="flex flex-col items-end">
                        {course.discountPrice > 0 && course.discountPrice < course.price ? (
                          <>
                            <span className="text-[10px] text-slate-400 line-through font-bold">
                              {formatCurrency(course.price)}
                            </span>
                            <span className="text-xl font-bold text-purple-600">
                              {formatCurrency(course.discountPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-purple-600">
                            {course.price === 0 ? 'Free' : formatCurrency(course.price || 0)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-bold">{course.totalStudents || 0} Students</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-xs font-bold">{course.totalLessons || 0} Lessons</span>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                      <Link
                        to={`/instructor/courses/${course._id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
                      >
                        Manage Course
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(course)}
                        className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl transition-all hover:scale-110 active:scale-95 group/del"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4 transition-transform group-hover/del:rotate-12" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                  <BookOpen className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  {searchTerm ? `We couldn't find any courses matching "${searchTerm}"` : "You haven't created any courses yet."}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/instructor/create-course')}
                    className="mt-8 flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Course
                  </button>
                )}
              </div>
            )}


          </>
        )}
      </div>

      {/* Pagination UI */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 sm:gap-4 pt-12">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            {[...Array(pagination.totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Simple pagination - could be improved with ellipsis for many pages
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-11 h-11 flex items-center justify-center rounded-2xl text-sm font-bold transition-all ${
                    pagination.currentPage === pageNum
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-110'
                      : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl shadow-slate-200/50 animate-scale-in overflow-hidden relative">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Course?</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-700">"{deleteModal.courseTitle}"</span>? This action cannot be undone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, courseId: null, courseTitle: '' })}
                  className="flex-1 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => setDeleteModal({ isOpen: false, courseId: null, courseTitle: '' })}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
