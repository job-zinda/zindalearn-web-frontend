import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Trash2, Filter, Users, BookOpen, ShieldCheck, Clock } from 'lucide-react';
import {
  getStudents,
  getAllCourses,
  grantEnrollment,
  revokeEnrollment,
  getEnrollmentHistory
} from '../../services/adminService';
import DataTable from '../../components/admin/shared/DataTable';
import PageHeader from '../../components/admin/shared/PageHeader';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import ConfirmModal from '../../components/admin/shared/ConfirmModal';
import AnalyticsCard from '../../components/admin/shared/AnalyticsCard';
import toast from 'react-hot-toast';

const ManualEnrollment = () => {
  // ── Grant Form State ──────────────────────────────────────────────────────
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [granting, setGranting] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // ── History Table State ───────────────────────────────────────────────────
  const [enrollments, setEnrollments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historySearch, setHistorySearch] = useState('');
  const [accessTypeFilter, setAccessTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const LIMIT = 10;

  // ── Revoke Modal State ────────────────────────────────────────────────────
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [enrollmentToRevoke, setEnrollmentToRevoke] = useState(null);
  const [revoking, setRevoking] = useState(false);

  // ── Fetch Students for dropdown ───────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      const data = await getStudents({ search: studentSearch, limit: 50 });
      setStudents(data.data || []);
    } catch {
      console.error('Failed to fetch students');
    } finally {
      setLoadingStudents(false);
    }
  }, [studentSearch]);

  // ── Fetch Courses for dropdown ────────────────────────────────────────────
  const fetchCourses = useCallback(async () => {
    try {
      setLoadingCourses(true);
      const data = await getAllCourses({ search: courseSearch, limit: 100 });
      setCourses(data.data || []);
    } catch {
      console.error('Failed to fetch courses');
    } finally {
      setLoadingCourses(false);
    }
  }, [courseSearch]);

  // ── Fetch Enrollment History ──────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const data = await getEnrollmentHistory({
        page: currentPage,
        limit: LIMIT,
        search: historySearch,
        accessType: accessTypeFilter === 'all' ? '' : accessTypeFilter
      });
      setEnrollments(data.data || []);
      setTotalEnrollments(data.total || 0);
    } catch {
      toast.error('Failed to fetch enrollment history');
    } finally {
      setLoadingHistory(false);
    }
  }, [currentPage, historySearch, accessTypeFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── Grant Access ──────────────────────────────────────────────────────────
  const handleGrant = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCourse) {
      return toast.error('Please select both a student and a course.');
    }

    try {
      setGranting(true);
      await grantEnrollment(selectedStudent, selectedCourse);
      toast.success('Course access granted successfully!');
      setSelectedStudent('');
      setSelectedCourse('');
      fetchHistory();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to grant access';
      toast.error(msg);
    } finally {
      setGranting(false);
    }
  };

  // ── Revoke Access ─────────────────────────────────────────────────────────
  const handleRevoke = async (e) => {
    e.preventDefault();
    if (!enrollmentToRevoke) return;

    try {
      setRevoking(true);
      await revokeEnrollment(enrollmentToRevoke._id);
      toast.success('Enrollment removed successfully');
      setShowRevokeModal(false);
      setEnrollmentToRevoke(null);
      fetchHistory();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to revoke access';
      toast.error(msg);
    } finally {
      setRevoking(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const manualCount = enrollments.filter(e => e.accessType === 'manual').length;
  const purchaseCount = enrollments.filter(e => e.accessType !== 'manual').length;

  // ── Table Columns ─────────────────────────────────────────────────────────
  const FILTERS = ['all', 'purchase', 'manual'];

  const columns = [
    {
      header: 'Student',
      cell: (e) => (
        <div className="flex items-center gap-3">
          <img
            src={e.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(e.user?.name || 'U')}&background=6366f1&color=fff`}
            alt=""
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <p className="text-sm font-medium text-slate-200">{e.user?.name || 'Unknown'}</p>
            <p className="text-xs text-slate-500">{e.user?.email || '—'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Course',
      cell: (e) => (
        <span className="text-sm text-slate-300 line-clamp-1">
          {e.course?.title || 'Deleted Course'}
        </span>
      ),
      className: 'max-w-[200px]'
    },
    {
      header: 'Access Type',
      cell: (e) => {
        const type = e.accessType || 'purchase';
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide border ${
            type === 'manual'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {type}
          </span>
        );
      }
    },
    {
      header: 'Granted By',
      cell: (e) => (
        <span className="text-sm text-slate-400">
          {e.accessType === 'manual' && e.grantedBy
            ? e.grantedBy.name || e.grantedBy.email || 'Admin'
            : '—'
          }
        </span>
      ),
      className: 'hidden lg:table-cell'
    },
    {
      header: 'Date',
      cell: (e) => (
        <span className="text-sm text-slate-400">
          {new Date(e.grantedAt || e.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </span>
      ),
      className: 'hidden md:table-cell'
    },
    {
      header: 'Status',
      cell: (e) => <StatusBadge status={e.paymentStatus || 'completed'} />
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (e) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => { setEnrollmentToRevoke(e); setShowRevokeModal(true); }}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-red-400 hover:text-red-300 transition-colors"
            title="Remove Access"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  // ── Filtered students / courses for dropdowns ─────────────────────────────
  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Enrollments"
        subtitle="Manually grant or revoke course access for students."
      />

      {/* ── Stats Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Total Enrollments" value={totalEnrollments} icon={Users} color="indigo" />
        <AnalyticsCard title="Manual Enrollments" value={manualCount} icon={UserPlus} color="blue" />
        <AnalyticsCard title="Purchase Enrollments" value={purchaseCount} icon={ShieldCheck} color="emerald" />
        <AnalyticsCard title="This Page" value={enrollments.length} icon={Clock} color="amber" />
      </div>

      {/* ── Grant Access Form ─── */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/60 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Manual Enrollment</h2>
            <p className="text-xs text-slate-500">Grant course access to a student without payment</p>
          </div>
        </div>

        <form onSubmit={handleGrant} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Student Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Student</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search student…"
                value={studentSearch}
                onChange={(e) => { setStudentSearch(e.target.value); setSelectedStudent(''); }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="">Select a student…</option>
              {loadingStudents ? (
                <option disabled>Loading…</option>
              ) : (
                filteredStudents.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} — {s.email}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Course Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Course</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search course…"
                value={courseSearch}
                onChange={(e) => { setCourseSearch(e.target.value); setSelectedCourse(''); }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="">Select a course…</option>
              {loadingCourses ? (
                <option disabled>Loading…</option>
              ) : (
                filteredCourses.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={granting || !selectedStudent || !selectedCourse}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors mt-6"
            >
              <UserPlus className="w-4 h-4" />
              {granting ? 'Granting…' : 'Grant Access'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Enrollment History ─── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-200">Enrollment History</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by student or course…"
              value={historySearch}
              onChange={(e) => { setHistorySearch(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-800/50 border border-slate-700 rounded-lg">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => { setAccessTypeFilter(f); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  accessTypeFilter === f
                    ? 'bg-slate-700 text-slate-100'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={enrollments}
          loading={loadingHistory}
          emptyMessage="No enrollments found"
          emptyDescription="Try adjusting your search or filter, or grant access to a student above."
        />

        {/* Pagination */}
        {totalEnrollments > LIMIT && (
          <div className="flex items-center justify-between px-1 mt-4">
            <p className="text-xs text-slate-500">
              Showing {enrollments.length} of {totalEnrollments}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded-lg text-slate-400 disabled:opacity-40 hover:bg-slate-700 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-slate-300 px-2">{currentPage}</span>
              <button
                disabled={enrollments.length < LIMIT}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded-lg text-slate-400 disabled:opacity-40 hover:bg-slate-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Revoke Confirmation Modal ─── */}
      <ConfirmModal
        isOpen={showRevokeModal}
        onClose={() => { setShowRevokeModal(false); setEnrollmentToRevoke(null); }}
        onConfirm={handleRevoke}
        title="Remove Course Access"
        description={`You are about to revoke ${enrollmentToRevoke?.user?.name || 'this student'}'s access to "${enrollmentToRevoke?.course?.title || 'this course'}". This action cannot be undone.`}
        confirmLabel="Remove Access"
        loading={revoking}
      />
    </div>
  );
};

export default ManualEnrollment;
