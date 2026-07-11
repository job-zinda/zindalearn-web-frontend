import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  HelpCircle, 
  ChevronRight, 
  Plus, 
  X,
  Loader2,
  Send,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  LifeBuoy,
  MessageSquare,
  ArrowLeft,
  BookOpen,
  ShieldAlert,
  PlayCircle,
  Users
} from 'lucide-react';
import { createTicket, getMyTickets, getTicketById, replyToTicket } from '../../services/supportService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const HelpCenter = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingTickets, setFetchingTickets] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected ticket for detailed view
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [fetchingTicketDetails, setFetchingTicketDetails] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const chatEndRef = useRef(null);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Course Creation',
    message: '',
  });

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
      setFetchingTickets(true);
      const res = await getMyTickets(1, 50);
      if (res.success) setTickets(res.tickets);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load tickets');
    } finally {
      setFetchingTickets(false);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await createTicket(formData);
      if (res.success) {
        toast.success('Ticket submitted successfully');
        setShowTicketModal(false);
        setFormData({ subject: '', category: 'Course Creation', message: '' });
        fetchTickets();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (ticketId) => {
    try {
      setFetchingTicketDetails(true);
      const res = await getTicketById(ticketId);
      if (res.success) {
        setSelectedTicket(res.ticket);
      }
    } catch (error) {
      toast.error('Failed to load ticket details');
    } finally {
      setFetchingTicketDetails(false);
    }
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
        // Refresh ticket list in background
        const listRes = await getMyTickets(1, 50);
        if (listRes.success) setTickets(listRes.tickets);
      }
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const faqs = [
    {
      category: 'Course Creation & Management',
      items: [
        { q: 'How do I upload high-quality videos?', a: 'We recommend MP4 format with H.264 codec at 1080p resolution for best results.' },
        { q: 'What is the review process for new courses?', a: 'Once submitted, courses are reviewed by admins within 24-48 hours before being published.' },
        { q: 'Can I offer coupons for my courses?', a: 'Yes, go to course settings and use the Coupon generator to create discount codes.' }
      ]
    },
    {
      category: 'Payments & Withdrawals',
      items: [
        { q: 'How do I withdraw my earnings?', a: 'Go to the Payouts page and click "Request Withdrawal". Minimum amount is ₹500.' },
        { q: 'When will I receive my payment?', a: 'Withdrawals are typically processed within 2-3 business days after approval.' },
        { q: 'What are the platform fees?', a: 'We charge a flat 10% platform fee on all course sales to cover hosting and transaction costs.' }
      ]
    }
  ];

  const categories = [
    { name: 'Course Creation', icon: PlayCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Student Support', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Payments', icon: HelpCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Account Info', icon: HelpCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  const filteredTickets = tickets.filter(t => t.subject.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="animate-fade-in space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary-600 rounded-[3rem] p-10 lg:p-14 text-center text-white shadow-xl">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl lg:text-5xl font-black">Instructor Help Center</h2>
          <p className="text-primary-100">Find answers to frequently asked questions or raise a support ticket directly with our administration.</p>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: FAQ Accordion & Categories */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.bg} ${cat.color}`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800">{cat.name}</span>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-primary-600" />
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {faqs.map((group, gIdx) => (
                <div key={gIdx} className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{group.category}</h4>
                  {group.items.map((faq, fIdx) => {
                    const id = `${gIdx}-${fIdx}`;
                    const isOpen = activeFaq === id;
                    return (
                      <div key={id} className={`bg-white rounded-2xl border transition-all ${isOpen ? 'border-primary-200 shadow-sm' : 'border-slate-100'}`}>
                        <button 
                          onClick={() => setActiveFaq(isOpen ? null : id)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <span className="font-bold text-slate-800 text-sm">{faq.q}</span>
                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 text-slate-600 text-xs leading-relaxed border-t border-slate-50 pt-3 mx-4">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Support Tickets & Ticket Detail View */}
        <div className="lg:col-span-1 space-y-8">
          <AnimatePresence mode="wait">
            {!selectedTicket ? (
              // Tickets List View
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <Ticket className="w-6 h-6 text-primary-600" />
                    My Support Tickets
                  </h3>
                  <button 
                    onClick={() => setShowTicketModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-50 text-primary-600 font-bold text-xs rounded-xl hover:bg-primary-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Ticket
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[350px] flex flex-col">
                  <div className="p-3 border-b border-slate-50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search tickets..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div className="divide-y divide-slate-50 overflow-y-auto max-h-[400px] flex-1">
                    {fetchingTickets ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                      </div>
                    ) : filteredTickets.length > 0 ? filteredTickets.map((ticket, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleSelectTicket(ticket._id)}
                        className="p-5 hover:bg-slate-50 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg ${
                            ticket.status === 'open' ? 'bg-blue-50 text-blue-700' :
                            ticket.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                            ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="text-[10px] text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors line-clamp-1">{ticket.subject}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{ticket.message}</p>
                      </div>
                    )) : (
                      <div className="py-16 text-center space-y-3">
                        <Ticket className="w-10 h-10 text-slate-100 mx-auto" />
                        <p className="text-xs text-slate-400">No support tickets found</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              // Detailed Ticket / Chat Reply View
              <motion.div 
                key="detail"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden flex flex-col h-[550px]"
              >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedTicket(null)}
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold text-slate-600"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg ${
                    selectedTicket.status === 'open' ? 'bg-blue-50 text-blue-700' :
                    selectedTicket.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                    selectedTicket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Ticket Details & Chat thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-100/50 space-y-2">
                    <span className="text-[9px] font-bold text-primary-600 uppercase tracking-wider">{selectedTicket.category}</span>
                    <h4 className="font-bold text-slate-800 text-sm">{selectedTicket.subject}</h4>
                    <p className="text-xs text-slate-600 whitespace-pre-wrap">{selectedTicket.message}</p>
                    <span className="block text-[9px] text-slate-400 text-right">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 pb-2">Conversation Thread</span>
                    {selectedTicket.replies && selectedTicket.replies.map((reply, idx) => {
                      const isSelf = reply.user?._id === selectedTicket.user?._id;
                      const replyRole = reply.user?.role;
                      return (
                        <div key={idx} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm text-xs ${
                            isSelf 
                              ? 'bg-primary-600 text-white rounded-tr-none' 
                              : replyRole === 'admin'
                                ? 'bg-amber-50 border border-amber-200 text-slate-800 rounded-tl-none'
                                : 'bg-slate-100 text-slate-800 rounded-tl-none'
                          }`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-black text-[9px] opacity-75">
                                {reply.user?.name || 'User'}
                              </span>
                              <span className={`px-1 py-0.2 text-[8px] font-bold rounded uppercase ${
                                replyRole === 'admin' ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-800'
                              }`}>
                                {replyRole}
                              </span>
                            </div>
                            <p className="leading-relaxed">{reply.message}</p>
                            <span className="block text-[8px] opacity-60 text-right mt-1">{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="p-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder={selectedTicket.status === 'closed' ? "This ticket is closed" : "Type your reply..."} 
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    disabled={selectedTicket.status === 'closed' || sendingReply}
                    className="flex-1 px-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary-500 focus:outline-none disabled:bg-slate-100"
                  />
                  <button 
                    type="submit" 
                    disabled={selectedTicket.status === 'closed' || sendingReply || !replyMessage.trim()}
                    className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors active:scale-95 disabled:opacity-50"
                  >
                    {sendingReply ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Raise Ticket Modal */}
      <AnimatePresence>
        {showTicketModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                      <LifeBuoy className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Contact Admin Support</h3>
                  </div>
                  <button onClick={() => setShowTicketModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Subject</label>
                    <input 
                      type="text" 
                      placeholder="Brief summary of your complaint"
                      value={formData.subject}
                      onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-1 focus:ring-primary-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-1 focus:ring-primary-500 focus:outline-none appearance-none"
                    >
                      <option>Course Creation</option>
                      <option>Payments</option>
                      <option>Withdrawals</option>
                      <option>Technical Issues</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Detailed Message</label>
                    <textarea 
                      placeholder="Describe your issue or complaint in detail..."
                      value={formData.message}
                      onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-1 focus:ring-primary-500 focus:outline-none h-32 resize-none"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-primary-600 text-white font-bold rounded-xl shadow-md hover:bg-primary-700 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Complaint
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

export default HelpCenter;
