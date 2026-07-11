import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Loader2, 
  Send, 
  Ticket, 
  Clock, 
  CheckCircle, 
  XCircle, 
  LifeBuoy, 
  ArrowLeft,
  AlertTriangle,
  ChevronDown,
  User,
  GraduationCap
} from 'lucide-react';
import { adminGetAllTickets, adminUpdateTicket, replyToTicket } from '../../services/supportService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [createdByRole, setCreatedByRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail View state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, [status, priority, createdByRole, currentPage]);

  useEffect(() => {
    if (selectedTicket) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.replies]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await adminGetAllTickets({
        page: currentPage,
        limit: 10,
        status,
        priority,
        createdByRole,
        search
      });
      if (res.success) {
        setTickets(res.tickets);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTickets();
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      setSendingReply(true);
      const res = await replyToTicket(selectedTicket._id, replyMessage);
      if (res.success) {
        setSelectedTicket(res.ticket);
        setReplyMessage('');
        fetchTickets(); // refresh list in background
      }
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await adminUpdateTicket(ticketId, { status: newStatus });
      if (res.success) {
        toast.success(`Ticket status updated to ${newStatus}`);
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket(res.ticket);
        }
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to update ticket status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePriority = async (ticketId, newPriority) => {
    try {
      const res = await adminUpdateTicket(ticketId, { priority: newPriority });
      if (res.success) {
        toast.success(`Ticket priority updated to ${newPriority}`);
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket(res.ticket);
        }
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to update ticket priority');
    }
  };

  return (
    <div className="space-y-6 text-slate-300 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 tracking-tight">Support Tickets</h1>
        <p className="mt-0.5 text-sm text-slate-400">Manage and resolve tickets from students and instructors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <form onSubmit={handleSearchSubmit} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by subject, user…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors">
                Search
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Status', value: status, setter: setStatus, options: [['', 'All'], ['open', 'Open'], ['pending', 'Pending'], ['resolved', 'Resolved'], ['closed', 'Closed']] },
                { label: 'Priority', value: priority, setter: setPriority, options: [['', 'All'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High']] },
                { label: 'Role', value: createdByRole, setter: setCreatedByRole, options: [['', 'All Roles'], ['student', 'Student'], ['instructor', 'Instructor']] },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{f.label}</label>
                  <select
                    value={f.value}
                    onChange={e => { f.setter(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {f.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </form>

          {/* Tickets List */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden min-h-[400px] flex flex-col">
            <div className="flex-1 divide-y divide-slate-700/40">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : tickets.length > 0 ? tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => handleSelectTicket(t)}
                  className={`px-4 py-3.5 hover:bg-slate-800/80 transition-colors cursor-pointer ${
                    selectedTicket?._id === t._id ? 'bg-slate-800/80 border-l-2 border-indigo-500' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md border ${
                      t.status === 'open' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      t.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-slate-700 text-slate-400 border-slate-600'
                    }`}>{t.status}</span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md border ${
                      t.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      t.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-slate-700 text-slate-400 border-slate-600'
                    }`}>{t.priority}</span>
                    <span className="flex items-center gap-1 text-[9px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded-md">
                      {t.createdByRole === 'student' ? <User className="w-2.5 h-2.5" /> : <GraduationCap className="w-2.5 h-2.5" />}
                      {t.createdByRole || 'user'}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-200 line-clamp-1">{t.subject}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{t.message}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-500">
                    <span className="font-medium text-slate-400">{t.user?.name || 'Deleted User'}</span>
                    <span>·</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <Ticket className="w-8 h-8 text-slate-700 mb-3" />
                  <p className="text-sm text-slate-500">No tickets match your filters</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-700/60 flex items-center justify-between">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 disabled:opacity-40 hover:bg-slate-700 transition-colors">Previous</button>
                <span className="text-xs text-slate-500">{currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 disabled:opacity-40 hover:bg-slate-700 transition-colors">Next</button>
              </div>
            )}
          </div>
        </div>

        {/* Support Ticket Chat / Detail Section */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden flex flex-col h-[600px]"
              >
                {/* Header */}
                <div className="p-3 border-b border-slate-700/60 flex items-center justify-between bg-slate-900/50">
                  <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <div className="flex items-center gap-1.5">
                    {selectedTicket.status !== 'resolved' && (
                      <button onClick={() => handleUpdateStatus(selectedTicket._id, 'resolved')} disabled={updatingStatus} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-[10px] font-medium rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50">
                        <CheckCircle className="w-3 h-3" /> Resolve
                      </button>
                    )}
                    {selectedTicket.status !== 'closed' && (
                      <button onClick={() => handleUpdateStatus(selectedTicket._id, 'closed')} disabled={updatingStatus} className="px-2.5 py-1 bg-slate-700 text-slate-300 hover:bg-slate-600 text-[10px] font-medium rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50">
                        <XCircle className="w-3 h-3" /> Close
                      </button>
                    )}
                    <select value={selectedTicket.status} onChange={e => handleUpdateStatus(selectedTicket._id, e.target.value)} disabled={updatingStatus} className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none">
                      {['open','pending','resolved','closed'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Original Message */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-semibold text-indigo-400 uppercase tracking-wider">{selectedTicket.category}</span>
                      <span className="text-[10px] text-slate-500">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200 mb-1">{selectedTicket.subject}</h4>
                    <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700/60 mt-2">
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] text-slate-200 font-semibold">{selectedTicket.user?.name?.charAt(0) || 'U'}</div>
                      <div>
                        <span className="text-[10px] text-slate-300 font-medium">{selectedTicket.user?.name || 'Deleted User'}</span>
                        <span className="text-[9px] text-slate-500 ml-1">{selectedTicket.user?.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest text-center">Thread</p>
                    {selectedTicket.replies?.map((reply, idx) => {
                      const isAdmin = reply.user?.role === 'admin';
                      return (
                        <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[82%] rounded-xl p-3 text-xs ${
                            isAdmin ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-700 text-slate-300 rounded-tl-none'
                          }`}>
                            <span className="block text-[9px] font-semibold opacity-70 mb-1">{reply.user?.name} · {reply.user?.role}</span>
                            <p className="leading-relaxed">{reply.message}</p>
                            <span className="block text-[8px] opacity-50 text-right mt-1">{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="p-3 border-t border-slate-700/60 bg-slate-900/50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={selectedTicket.status === 'closed' ? 'Ticket is closed' : 'Type your reply…'}
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    disabled={selectedTicket.status === 'closed' || sendingReply}
                    className="flex-1 px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 placeholder-slate-500"
                  />
                  <button type="submit" disabled={selectedTicket.status === 'closed' || sendingReply || !replyMessage.trim()} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50">
                    {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </motion.div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl flex flex-col items-center justify-center h-64">
                <LifeBuoy className="w-8 h-8 text-slate-700 mb-3" />
                <p className="text-sm font-medium text-slate-400">No ticket selected</p>
                <p className="text-xs text-slate-500 mt-1">Click a ticket to view its thread</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SupportTickets;
