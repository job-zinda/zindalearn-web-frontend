import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserPlus, TrendingUp, Search, Eye, Lock, Unlock, BookOpen, AlertTriangle } from 'lucide-react';
import { getStudents, getStudentStats, blockUser, unblockUser } from '../../services/adminService';
import DataTable from '../../components/admin/shared/DataTable';
import AnalyticsCard from '../../components/admin/shared/AnalyticsCard';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import PageHeader from '../../components/admin/shared/PageHeader';
import ConfirmModal from '../../components/admin/shared/ConfirmModal';
import UserDetailsModal from '../../components/admin/shared/UserDetailsModal';
import toast from 'react-hot-toast';

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [submittingBlock, setSubmittingBlock] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents({
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: currentPage,
        limit: 10
      });
      setStudents(data.data);
      setTotalStudents(data.total);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getStudentStats();
      setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  useEffect(() => { fetchStudents(); }, [searchTerm, statusFilter, currentPage]);
  useEffect(() => { fetchStats(); }, []);

  const handleViewDetails = (student) => {
    setViewingStudent(student);
    setShowDetailsModal(true);
  };

  const handleBlockToggle = async (student) => {
    if (student.isBlocked) {
      try {
        await unblockUser(student._id);
        toast.success('Student unblocked successfully');
        if (viewingStudent && viewingStudent._id === student._id) {
          setViewingStudent(prev => ({ ...prev, isBlocked: false, blockedReason: '' }));
        }
        fetchStudents();
      } catch { toast.error('Failed to unblock student'); }
    } else {
      setSelectedStudent(student);
      setBlockReason('');
      setShowBlockModal(true);
    }
  };

  const handleConfirmBlock = async (e) => {
    e.preventDefault();
    if (!blockReason.trim()) return toast.error('Please enter a reason.');
    try {
      setSubmittingBlock(true);
      await blockUser(selectedStudent._id, blockReason);
      toast.success('Student suspended successfully');
      if (viewingStudent && viewingStudent._id === selectedStudent._id) {
        setViewingStudent(prev => ({ ...prev, isBlocked: true, blockedReason: blockReason }));
      }
      setShowBlockModal(false);
      setSelectedStudent(null);
      setBlockReason('');
      fetchStudents();
    } catch { toast.error('Failed to suspend student'); }
    finally { setSubmittingBlock(false); }
  };

  const FILTERS = ['all', 'active', 'blocked'];

  const columns = [
    {
      header: 'Student',
      cell: (s) => (
        <div className="flex items-center gap-3">
          <img
            src={s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=6366f1&color=fff`}
            alt=""
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <p className="text-sm font-medium text-slate-200">{s.name}</p>
            <p className="text-xs text-slate-500">Joined {new Date(s.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email',
      className: 'hidden md:table-cell text-slate-400'
    },
    {
      header: 'Courses',
      cell: (s) => (
        <div className="flex items-center gap-1.5 text-slate-300">
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-sm">{s.enrolledCount || 0}</span>
        </div>
      )
    },
    {
      header: 'Progress',
      cell: (s) => (
        <div className="w-28">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">{s.avgProgress || 0}%</span>
          </div>
          <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${s.avgProgress || 0}%` }} />
          </div>
        </div>
      ),
      className: 'hidden lg:table-cell'
    },
    {
      header: 'Spent',
      cell: (s) => <span className="text-sm text-slate-300">₹{(s.totalSpent || 0).toLocaleString()}</span>,
      className: 'hidden lg:table-cell'
    },
    {
      header: 'Status',
      cell: (s) => <StatusBadge status={s.isBlocked ? 'blocked' : 'active'} />
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (s) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => handleViewDetails(s)}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors" 
            title="View Profile"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleBlockToggle(s)}
            className={`p-1.5 hover:bg-slate-700 rounded-lg transition-colors ${s.isBlocked ? 'text-emerald-400 hover:text-emerald-300' : 'text-red-400 hover:text-red-300'}`}
            title={s.isBlocked ? 'Unblock' : 'Block'}
          >
            {s.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Students" subtitle="Manage enrolled students, monitor activity, and control access." />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} color="indigo" />
        <AnalyticsCard title="Active Students" value={stats?.activeStudents || 0} icon={UserCheck} color="emerald" />
        <AnalyticsCard title="New This Month" value={stats?.newStudents || 0} icon={UserPlus} color="blue" />
        <AnalyticsCard title="Avg. Completion" value={`${stats?.avgCompletion || 0}%`} icon={TrendingUp} color="amber" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-800/50 border border-slate-700 rounded-lg">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${statusFilter === f ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={students} loading={loading} emptyMessage="No students found" emptyDescription="Try adjusting your search or filter." />

      {/* Pagination */}
      {totalStudents > 10 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-500">Showing {students.length} of {totalStudents}</p>
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
              disabled={students.length < 10}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded-lg text-slate-400 disabled:opacity-40 hover:bg-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Block Modal */}
      <ConfirmModal
        isOpen={showBlockModal}
        onClose={() => { setShowBlockModal(false); setSelectedStudent(null); setBlockReason(''); }}
        onConfirm={handleConfirmBlock}
        title="Suspend Student Account"
        description={`You are about to suspend ${selectedStudent?.name} (${selectedStudent?.email}). They will lose all access until reinstated.`}
        confirmLabel="Suspend Account"
        loading={submittingBlock}
      >
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Reason for suspension</label>
          <textarea
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="e.g. Violation of platform guidelines…"
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
            required
          />
        </div>
      </ConfirmModal>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setViewingStudent(null); }}
        user={viewingStudent}
        onBlockToggle={handleBlockToggle}
      />
    </div>
  );
};

export default StudentsManagement;
