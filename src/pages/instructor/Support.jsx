import React, { useState, useEffect, useRef } from 'react';
import { 
  LifeBuoy, 
  Send, 
  Headset, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  ArrowLeft, 
  Loader2, 
  Plus, 
  X, 
  Search, 
  Filter,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { createTicket, getMyTickets, getTicketById, replyToTicket } from '../../services/supportService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const InstructorSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // New Ticket Form State
  const [form, setForm] = useState({
    subject: '',
    category: 'Course Creation',
    priority: 'medium',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Chat/Reply State
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.replies]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await getMyTickets(1, 100);
      if (res.success) {
        setTickets(res.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (ticketId) => {
    try {
      setFetchingDetails(true);
      const res = await getTicketById(ticketId);
      if (res.success) {
        setSelectedTicket(res.ticket);
      }
    } catch (error) {
      console.error('Error loading ticket details:', error);
      toast.error('Failed to load conversation history');
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      return toast.error('Please fill in all required fields');
    }

    try {
      setSubmitting(true);
      const res = await createTicket(form);
      if (res.success) {
        toast.success('Support ticket created successfully');
        setShowModal(false);
        setForm({
          subject: '',
          category: 'Course Creation',
          priority: 'medium',
          message: ''
        });
        // Reload list and select the new ticket
        const listRes = await getMyTickets(1, 100);
        if (listRes.success) {
          setTickets(listRes.tickets);
          if (listRes.tickets.length > 0) {
            handleSelectTicket(listRes.tickets[0]._id);
          }
        }
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      setSubmittingReply(true);
      const res = await replyToTicket(selectedTicket._id, replyMessage);
      if (res.success) {
        setSelectedTicket(res.ticket);
        setReplyMessage('');
        // Update ticket in local list to show fresh status
        setTickets(prev => prev.map(t => t._id === res.ticket._id ? res.ticket : t));
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in space-y-8 font-sans max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 rounded-3xl p-8 lg:p-12 text-white shadow-xl shadow-indigo-950/20">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-indigo-200">
            <Headset className="w-3.5 h-3.5" />
            <span>24/7 Dedicated Support</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Instructor Support Center</h1>
          <p className="text-indigo-100 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
            Need assistance with course configuration, payouts, student coordination, or technical matters? Speak directly with our administration support agents.
          </p>
        </div>
        
        {/* Decorative backdrop shapes */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      {/* Main Support Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column - Action Card + Tickets List (lg:col-span-5 or 4) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Action Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Need direct assistance?</h3>
                <p className="text-xs text-slate-500">Initiate a support request ticket.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-900/10 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create Ticket
            </button>
          </div>

          {/* Tickets Container Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden min-h-[450px]">
            {/* List Controls */}
            <div className="p-4 border-b border-slate-50 space-y-3 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search request history..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none placeholder-slate-400 text-slate-700 font-medium"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {['all', 'open', 'pending', 'resolved', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      statusFilter === status 
                        ? 'bg-slate-800 text-white shadow-sm' 
                        : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* List Body */}
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[500px] flex-1">
              {loading ? (
                // Skeleton loader
                <div className="space-y-4 p-5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-slate-100 rounded w-16"></div>
                        <div className="h-3 bg-slate-100 rounded w-12"></div>
                      </div>
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredTickets.length > 0 ? (
                filteredTickets.map((t) => {
                  const isSelected = selectedTicket?._id === t._id;
                  return (
                    <div 
                      key={t._id} 
                      onClick={() => handleSelectTicket(t._id)}
                      className={`p-5 hover:bg-slate-50 cursor-pointer transition-all flex flex-col gap-2 relative ${
                        isSelected ? 'bg-purple-50/40 border-l-4 border-purple-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                          t.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          t.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          t.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {t.status}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide ${
                            t.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            t.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-50 text-slate-600 border border-slate-200'
                          }`}>
                            {t.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-purple-600 transition-colors line-clamp-1">
                        {t.subject}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                        {t.message}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="py-24 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                    <Ticket className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">No support tickets found</p>
                    <p className="text-xs text-slate-400 mt-1">Need help? Create your first support request.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Ticket Details / Thread Panel (lg:col-span-7 or 8) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!selectedTicket ? (
              // Empty selection state
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center flex flex-col items-center justify-center h-full min-h-[450px]"
              >
                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-6">
                  <Headset className="w-10 h-10" />
                </div>
                <h3 className="font-black text-slate-800 text-lg mb-2">No Ticket Selected</h3>
                <p className="text-slate-500 text-sm max-w-sm leading-relaxed font-medium">
                  Select a support ticket from the request history panel to view the communication history and exchange replies with administrators.
                </p>
              </motion.div>
            ) : (
              // Interactive Ticket Conversation View
              <motion.div 
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[550px]"
              >
                {/* Detail Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                        selectedTicket.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        selectedTicket.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        selectedTicket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {selectedTicket.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {selectedTicket.category}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-800 text-base">{selectedTicket.subject}</h3>
                  </div>

                  <button 
                    onClick={() => setSelectedTicket(null)}
                    className="lg:hidden px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-xs font-bold text-slate-600 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to List
                  </button>
                </div>

                {/* Conversation Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[450px]">
                  
                  {/* Original message card */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Original Inquiry</span>
                      <span className="text-slate-400">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.message}
                    </p>
                  </div>

                  {/* Reply timeline */}
                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Conversation History
                    </span>
                    
                    {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                      selectedTicket.replies.map((reply, idx) => {
                        const isSelf = reply.user?._id === selectedTicket.user?._id || reply.user === selectedTicket.user;
                        const replyRole = reply.user?.role || (isSelf ? 'instructor' : 'admin');
                        return (
                          <div key={idx} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-xs ${
                              isSelf 
                                ? 'bg-purple-600 text-white rounded-tr-none shadow-purple-200' 
                                : replyRole === 'admin'
                                  ? 'bg-amber-50/80 border border-amber-200 text-slate-800 rounded-tl-none'
                                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
                            }`}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="font-black text-[10px] opacity-90">
                                  {reply.user?.name || (isSelf ? 'You' : 'Support')}
                                </span>
                                <span className={`px-1.5 py-0.2 text-[8px] font-black rounded uppercase tracking-wider ${
                                  replyRole === 'admin' ? 'bg-amber-200 text-amber-800' : 'bg-slate-200/50 text-slate-700'
                                }`}>
                                  {replyRole}
                                </span>
                              </div>
                              <p className="leading-relaxed text-sm font-medium">{reply.message}</p>
                              <span className="block text-[9px] opacity-60 text-right mt-1.5">
                                {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span className="block text-xs text-slate-400 text-center italic py-4">
                        Awaiting review from our support administrators.
                      </span>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center gap-3">
                  <input 
                    type="text" 
                    placeholder={selectedTicket.status === 'closed' ? "This ticket has been closed" : "Provide supplementary information or respond..."} 
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    disabled={selectedTicket.status === 'closed' || submittingReply}
                    className="flex-1 px-4 py-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none disabled:bg-slate-100 text-slate-800 font-medium"
                  />
                  <button 
                    type="submit" 
                    disabled={selectedTicket.status === 'closed' || submittingReply || !replyMessage.trim()}
                    className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center shrink-0"
                  >
                    {submittingReply ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Ticket Modal Popover */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-6">
                
                {/* Modal Title */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <LifeBuoy className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800">Submit Support Request</h3>
                      <p className="text-xs text-slate-400 font-medium">Please be as descriptive as possible.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowModal(false)} 
                    className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-4.5 h-4.5 text-slate-400" />
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Subject
                    </label>
                    <input 
                      type="text" 
                      placeholder="Brief title summary of the problem"
                      value={form.subject}
                      onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-purple-500 focus:outline-none text-slate-800"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        Category
                      </label>
                      <select 
                        value={form.category}
                        onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-purple-500 focus:outline-none text-slate-700"
                      >
                        <option value="Course Creation">Course Creation</option>
                        <option value="Payments">Payments</option>
                        <option value="Withdrawals">Withdrawals</option>
                        <option value="Technical Issues">Technical Issues</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        Priority Level
                      </label>
                      <select 
                        value={form.priority}
                        onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-purple-500 focus:outline-none text-slate-700"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Detailed Message Description
                    </label>
                    <textarea 
                      placeholder="Please specify timestamps, course details, or step-by-step reproduction of the issue..."
                      value={form.message}
                      onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-purple-500 focus:outline-none h-32 resize-none text-slate-800"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 text-xs uppercase tracking-wider"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Support Ticket
                  </button>
                </form>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InstructorSupport;
