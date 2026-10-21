import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, CheckCircle, Clock, Users, Search,
  Plus, Trash2, Ban, Star, Lock, Unlock
} from 'lucide-react';
import {
  getAllCourses, approveCourse, updateCourseStatus, deleteCourse,
  getDashboardStats, blockCourse, unblockCourse
} from '../../services/adminService';
import DataTable from '../../components/admin/shared/DataTable';
import AnalyticsCard from '../../components/admin/shared/AnalyticsCard';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import PageHeader from '../../components/admin/shared/PageHeader';
import ConfirmModal from '../../components/admin/shared/ConfirmModal';
import toast from 'react-hot-toast';
import { formatCategory } from '../../utils/format';

const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [submittingBlock, setSubmittingBlock] = useState(false);
  const [publishCourse, setPublishCourse] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getAllCourses({
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: currentPage,
        limit: 10
      });
      setCourses(data.data);
      setTotalCourses(data.total);
    } catch { toast.error('Failed to fetch courses'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data.data);
    } catch (error) { console.error('Failed to fetch stats', error); }
  };

  useEffect(() => { fetchCourses(); }, [searchTerm, statusFilter, currentPage]);
  useEffect(() => { fetchStats(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateCourseStatus(id, status);
      toast.success(`Course ${status} successfully`);
      fetchCourses();
    } catch { toast.error('Failed to update status'); }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (publishing || !publishCourse) return;
    try {
      setPublishing(true);
      await approveCourse(publishCourse._id);
      toast.success('Course published successfully');
      setPublishCourse(null);
      fetchCourses();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish course');
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await deleteCourse(id);
      toast.success('Course deleted');
      fetchCourses();
    } catch { toast.error('Failed to delete course'); }
  };

  const handleBlockToggle = async (course) => {
    if (course.isBlocked) {
      try {
        await unblockCourse(course._id);
        toast.success('Course unblocked');
        fetchCourses();
      } catch { toast.error('Failed to unblock'); }
    } else {
      setSelectedCourse(course);
      setBlockReason('');
      setShowBlockModal(true);
    }
  };

  const handleConfirmBlock = async (e) => {
    e.preventDefault();
    if (!blockReason.trim()) return toast.error('Please enter a reason.');
    try {
      setSubmittingBlock(true);
      await blockCourse(selectedCourse._id, blockReason);
      toast.success('Course suspended');
      setShowBlockModal(false);
      setSelectedCourse(null);
      setBlockReason('');
      fetchCourses();
    } catch { toast.error('Failed to suspend'); }
    finally { setSubmittingBlock(false); }
  };

  const STATUS_FILTERS = ['all', 'published', 'pending', 'declined', 'draft'];

  const columns = [
    {
      header: 'Course',
      cell: (course) => (
        <div className="flex items-center gap-3">
          <div className="w-14 h-9 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
            <img
              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop'}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <Link
              to={`/admin/courses/${course._id}`}
              className="block text-sm font-medium text-slate-200 hover:text-indigo-400 line-clamp-1 max-w-[200px]"
            >
              {course.title}
            </Link>
            <p className="text-xs text-slate-500">{formatCategory(course.category)}</p>
            <Link
              to={`/admin/edit-course/${course._id}#referralCommissionPercent`}
              className="inline-block mt-1 text-xs font-semibold text-indigo-300 hover:text-indigo-200 underline underline-offset-2"
              aria-label={`Set referral commission for ${course.title}`}
            >
              Referral Commission: {course.referralCommissionPercent || 0}% · Edit
            </Link>
          </div>
        </div>
      )
    },
    {
      header: 'Instructor',
      cell: (course) => <span className="text-sm text-slate-400">{course.instructor?.name || 'Unknown'}</span>,
      className: 'hidden lg:table-cell'
    },
    {
      header: 'Students',
      cell: (course) => (
        <div className="flex items-center gap-1.5 text-slate-300">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-sm">{course.totalStudents || 0}</span>
        </div>
      )
    },
    {
      header: 'Revenue',
      cell: (course) => (
        <span className="text-sm text-emerald-400">
          ₹{((course.totalStudents || 0) * (course.price || 0)).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Rating',
      cell: (course) => (
        <div className="flex items-center gap-1 text-slate-300">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm">{course.rating || 0}</span>
        </div>
      ),
      className: 'hidden md:table-cell'
    },
    {
      header: 'Status',
      cell: (course) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={course.status} />
          {course.isBlocked && <StatusBadge status="suspended" />}
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (course) => (
        <div className="flex items-center justify-end gap-2">
          {['draft', 'pending', 'declined'].includes(course.status) && (
            <button
              onClick={() => setPublishCourse(course)}
              disabled={course.isBlocked}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              title={course.isBlocked ? 'Unblock this course before publishing' : 'Publish course'}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Publish
            </button>
          )}
          {course.status === 'pending' && (
              <button
                onClick={() => handleStatusUpdate(course._id, 'declined')}
                className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                title="Decline"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
          )}
          <Link
            to={`/admin/courses/${course._id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 whitespace-nowrap"
            title="Add sections, lessons, videos, and resources"
            aria-label={`Add Content to ${course.title}`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Content
          </Link>
          <button
            onClick={() => handleBlockToggle(course)}
            className={`p-1.5 hover:bg-slate-700 rounded-lg transition-colors ${course.isBlocked ? 'text-emerald-400' : 'text-red-400'}`}
            title={course.isBlocked ? 'Unblock' : 'Block'}
          >
            {course.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => handleDeleteCourse(course._id)}
            className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Courses" subtitle="Set Referral Commission below each course title. Use Add Content for lessons, then publish when ready." />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Total Courses" value={stats?.totalCourses || 0} icon={BookOpen} color="indigo" />
        <AnalyticsCard title="Published" value={courses.filter(c => c.status === 'published').length} icon={CheckCircle} color="emerald" />
        <AnalyticsCard title="Pending Review" value={stats?.pendingCoursesCount || 0} icon={Clock} color="amber" />
        <AnalyticsCard title="Enrollments" value={stats?.totalEnrollments || 0} icon={Users} color="blue" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title or instructor…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-800/50 border border-slate-700 rounded-lg overflow-x-auto">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={courses} loading={loading} emptyMessage="No courses found" />

      <ConfirmModal
        isOpen={!!publishCourse}
        onClose={() => { if (!publishing) setPublishCourse(null); }}
        onConfirm={handlePublish}
        title="Publish Course"
        description={`Publish "${publishCourse?.title}"? It will appear in the public course catalog and be available for enrollment.`}
        confirmLabel="Publish Course"
        loading={publishing}
      />

      {/* Pagination */}
      {totalCourses > 10 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-500">Showing {courses.length} of {totalCourses}</p>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded-lg text-slate-400 disabled:opacity-40 hover:bg-slate-700 transition-colors">Previous</button>
            <span className="text-sm font-medium text-slate-300 px-2">{currentPage}</span>
            <button disabled={courses.length < 10} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded-lg text-slate-400 disabled:opacity-40 hover:bg-slate-700 transition-colors">Next</button>
          </div>
        </div>
      )}

      {/* Block Modal */}
      <ConfirmModal
        isOpen={showBlockModal}
        onClose={() => { setShowBlockModal(false); setSelectedCourse(null); setBlockReason(''); }}
        onConfirm={handleConfirmBlock}
        title="Suspend Course"
        description={`Suspending "${selectedCourse?.title}". It will be hidden from search and new enrollments will be blocked.`}
        confirmLabel="Suspend Course"
        loading={submittingBlock}
      >
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Reason for suspension</label>
          <textarea
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="e.g. Inappropriate content, policy violations…"
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
            required
          />
        </div>
      </ConfirmModal>
    </div>
  );
};

export default CoursesManagement;
