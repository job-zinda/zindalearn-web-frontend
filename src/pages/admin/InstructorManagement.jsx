import { useState, useEffect } from 'react';
import { FileText, Lock, Unlock, MoreVertical, CheckCircle, XCircle, Eye, GraduationCap, Users } from 'lucide-react';
import { getPendingInstructors, getTutors, approveInstructor, rejectInstructor, blockUser, unblockUser } from '../../services/adminService';
import PageHeader from '../../components/admin/shared/PageHeader';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import ConfirmModal from '../../components/admin/shared/ConfirmModal';
import UserDetailsModal from '../../components/admin/shared/UserDetailsModal';
import EmptyState from '../../components/admin/shared/EmptyState';
import { toast } from 'react-hot-toast';

const InstructorManagement = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTutors, setActiveTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [submittingBlock, setSubmittingBlock] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingTutor, setViewingTutor] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, tutorsRes] = await Promise.all([getPendingInstructors(), getTutors()]);
      setPendingRequests(pendingRes.data || []);
      setActiveTutors(tutorsRes.data || []);
    } catch { toast.error('Failed to fetch data'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try {
      await approveInstructor(id);
      toast.success('Instructor approved');
      fetchData();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to approve'); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this instructor?')) return;
    try {
      await rejectInstructor(id);
      toast.success('Instructor rejected');
      fetchData();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to reject'); }
  };

  const handleViewDetails = (tutor) => {
    setViewingTutor(tutor);
    setShowDetailsModal(true);
  };

  const handleBlockToggle = async (tutor) => {
    if (tutor.isBlocked) {
      try {
        await unblockUser(tutor._id);
        toast.success('Instructor unblocked');
        if (viewingTutor && viewingTutor._id === tutor._id) {
          setViewingTutor(prev => ({ ...prev, isBlocked: false, blockedReason: '' }));
        }
        fetchData();
      } catch { toast.error('Failed to unblock'); }
    } else {
      setSelectedTutor(tutor);
      setBlockReason('');
      setShowBlockModal(true);
    }
  };

  const handleConfirmBlock = async (e) => {
    e.preventDefault();
    if (!blockReason.trim()) return toast.error('Please enter a reason.');
    try {
      setSubmittingBlock(true);
      await blockUser(selectedTutor._id, blockReason);
      toast.success('Instructor suspended');
      if (viewingTutor && viewingTutor._id === selectedTutor._id) {
        setViewingTutor(prev => ({ ...prev, isBlocked: true, blockedReason: blockReason }));
      }
      setShowBlockModal(false);
      setSelectedTutor(null);
      setBlockReason('');
      fetchData();
    } catch { toast.error('Failed to suspend'); }
    finally { setSubmittingBlock(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-800/50 rounded-xl border border-slate-700/60 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Instructors" subtitle="Review applications and manage active instructors." />

      {/* Pending Requests */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Applications
          </h2>
          {pendingRequests.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
              {pendingRequests.length}
            </span>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl">
            <EmptyState
              icon={GraduationCap}
              title="No pending applications"
              description="New instructor applications will appear here for review."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingRequests.map(req => (
              <div key={req._id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 hover:border-slate-600 transition-colors flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.name)}&background=6366f1&color=fff`}
                      alt={req.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{req.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[160px]">{req.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    NEW
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed flex-1 mb-4 line-clamp-3">
                  {req.bio || 'No bio provided.'}
                </p>

                {req.resume && (
                  <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700 mb-4">
                    <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400 truncate">Resume attached</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(req._id)}
                    className="flex-1 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(req._id)}
                    className="flex-1 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Tutors Table */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Instructors</h2>
          <span className="px-2 py-0.5 text-xs font-semibold bg-slate-700 text-slate-400 rounded-full">
            {activeTutors.length}
          </span>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden">
          {activeTutors.length === 0 ? (
            <EmptyState icon={Users} title="No active instructors" description="Approved instructors will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700/60 bg-slate-800/80">
                    {['Instructor', 'Email', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {activeTutors.map(tutor => (
                    <tr key={tutor._id} className="hover:bg-slate-800/60 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={tutor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=6366f1&color=fff`}
                            alt={tutor.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-200">{tutor.name}</p>
                            <p className="text-xs text-slate-500">Instructor</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">{tutor.email}</td>
                      <td className="px-5 py-4 text-sm text-slate-400">{new Date(tutor.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={tutor.isBlocked ? 'blocked' : 'active'} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewDetails(tutor)}
                            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleBlockToggle(tutor)}
                            className={`p-1.5 hover:bg-slate-700 rounded-lg transition-colors ${tutor.isBlocked ? 'text-emerald-400 hover:text-emerald-300' : 'text-red-400 hover:text-red-300'}`}
                            title={tutor.isBlocked ? 'Unblock' : 'Block'}
                          >
                            {tutor.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Block Modal */}
      <ConfirmModal
        isOpen={showBlockModal}
        onClose={() => { setShowBlockModal(false); setSelectedTutor(null); setBlockReason(''); }}
        onConfirm={handleConfirmBlock}
        title="Suspend Instructor Account"
        description={`Suspending ${selectedTutor?.name} (${selectedTutor?.email}). Their courses will be hidden and access revoked.`}
        confirmLabel="Suspend Instructor"
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

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setViewingTutor(null); }}
        user={viewingTutor}
        onBlockToggle={handleBlockToggle}
      />
    </div>
  );
};

export default InstructorManagement;
