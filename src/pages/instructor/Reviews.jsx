import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Search, 
  Filter, 
  ChevronDown, 
  MoreVertical,
  Reply,
  Trash2,
  Flag,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { getReviewData, replyToReview, reportReview } from '../../services/instructorDashboardService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Reviews = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');

  // Reply & Report States
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [activeReportId, setActiveReportId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    fetchReviewData();
  }, []);

  const handleStartReply = (review) => {
    setActiveReplyId(review._id);
    setReplyText(review.reply || '');
    setActiveReportId(null);
  };

  const handleCancelReply = () => {
    setActiveReplyId(null);
    setReplyText('');
  };

  const handleSubmitReply = async (review) => {
    if (!replyText.trim()) return toast.error('Please enter a response');
    setSubmittingReply(true);
    try {
      const res = await replyToReview(review.course?._id || review.course, review._id, replyText.trim());
      if (res.success) {
        toast.success('Reply saved successfully!');
        setData(prev => ({
          ...prev,
          reviews: prev.reviews.map(r => r._id === review._id ? { ...r, reply: replyText.trim() } : r)
        }));
        handleCancelReply();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (review) => {
    if (!window.confirm('Are you sure you want to delete your reply?')) return;
    setSubmittingReply(true);
    try {
      const res = await replyToReview(review.course?._id || review.course, review._id, '');
      if (res.success) {
        toast.success('Reply deleted successfully!');
        setData(prev => ({
          ...prev,
          reviews: prev.reviews.map(r => r._id === review._id ? { ...r, reply: '' } : r)
        }));
        handleCancelReply();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleStartReport = (review) => {
    setActiveReportId(review._id);
    setReportReason('');
    setActiveReplyId(null);
  };

  const handleCancelReport = () => {
    setActiveReportId(null);
    setReportReason('');
  };

  const handleSubmitReport = async (review) => {
    if (!reportReason.trim()) return toast.error('Please specify a reason for reporting');
    setSubmittingReport(true);
    try {
      const res = await reportReview(review.course?._id || review.course, review._id, reportReason.trim());
      if (res.success) {
        toast.success('Review reported successfully!');
        setData(prev => ({
          ...prev,
          reviews: prev.reviews.map(r => r._id === review._id ? { ...r, isReported: true, reportReason: reportReason.trim() } : r)
        }));
        handleCancelReport();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report review');
    } finally {
      setSubmittingReport(false);
    }
  };

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const res = await getReviewData();
      if (res.success) {
        setData(res);
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const filteredReviews = data?.reviews?.filter(r => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = r.user?.name?.toLowerCase().includes(searchLower) || 
                          (r.review || '').toLowerCase().includes(searchLower) ||
                          (r.comment || '').toLowerCase().includes(searchLower);
    const matchesRating = ratingFilter === 'all' || r.rating === parseInt(ratingFilter);
    const matchesCourse = courseFilter === 'all' || r.course?._id === courseFilter;
    return matchesSearch && matchesRating && matchesCourse;
  }) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Student Reviews</h2>
        <p className="text-slate-500 text-sm">Monitor and engage with your students' feedback</p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Average Rating</p>
          <div className="text-6xl font-black text-slate-900 mb-4">{data?.analytics?.avgRating || 0}</div>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-5 h-5 ${s <= Math.round(data?.analytics?.avgRating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
            ))}
          </div>
          <p className="text-sm font-bold text-slate-500">Based on {data?.analytics?.totalReviews || 0} reviews</p>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest text-center lg:text-left">Rating Distribution</h3>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((rating, idx) => {
              const count = data?.analytics?.distribution?.[idx] || 0;
              const percentage = data?.analytics?.totalReviews > 0 
                ? (count / data.analytics.totalReviews) * 100 
                : 0;
              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-12 shrink-0">
                    <span className="text-sm font-bold text-slate-600">{rating}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-primary-500"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400 w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 text-sm font-bold text-slate-600 appearance-none min-w-[160px]"
          >
            <option value="all">All Courses</option>
            {data?.courses?.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <select 
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 text-sm font-bold text-slate-600 appearance-none min-w-[140px]"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length > 0 ? filteredReviews.map((review, i) => (
          <motion.div 
            key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-violet-200 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Student Info */}
              <div className="flex md:flex-col items-center md:items-center gap-4 shrink-0 md:w-32">
                <img 
                  src={review.user?.profilePic || review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.name}&background=random`} 
                  alt={review.user?.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50"
                />
                <div className="md:text-center">
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{review.user?.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Student</p>
                </div>
              </div>

              {/* Review Content */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-100'}`} />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">
                      On <span className="text-slate-900">{review.course?.title}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    {review.isReported && (
                      <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Reported
                      </span>
                    )}
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed italic">
                  {review.review || review.comment ? `"${review.review || review.comment}"` : 'No written feedback provided'}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                  <button 
                    onClick={() => handleStartReply(review)}
                    className="flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    {review.reply ? 'Edit Reply' : 'Reply'}
                  </button>
                  <button 
                    onClick={() => handleStartReport(review)}
                    disabled={review.isReported}
                    className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                      review.isReported 
                        ? 'text-red-500 cursor-default opacity-85' 
                        : 'text-slate-400 hover:text-red-600'
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                    {review.isReported ? 'Reported' : 'Report'}
                  </button>
                </div>

                {/* Inline Reply Form */}
                {activeReplyId === review._id && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <label className="text-xs font-bold text-slate-600 block">
                      {review.reply ? 'Edit your response' : 'Write a response'}
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply to this student..."
                      rows={2}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none text-slate-800"
                    />
                    <div className="flex gap-2 justify-end">
                      {review.reply && (
                        <button
                          onClick={() => handleDeleteReply(review)}
                          className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Reply
                        </button>
                      )}
                      <button
                        onClick={handleCancelReply}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitReply(review)}
                        disabled={submittingReply || !replyText.trim()}
                        className="px-4 py-2 text-xs font-bold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        {submittingReply ? 'Saving...' : 'Save Response'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Inline Report Form */}
                {activeReportId === review._id && (
                  <div className="mt-4 p-4 bg-red-50/50 rounded-2xl border border-red-100 space-y-3">
                    <label className="text-xs font-bold text-red-800 block">Report Review</label>
                    <input
                      type="text"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Why are you reporting this review? (e.g. Abusive, Spam)"
                      className="w-full px-4 py-2 bg-white border border-red-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-800"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelReport}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitReport(review)}
                        disabled={submittingReport || !reportReason.trim()}
                        className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {submittingReport ? 'Submitting...' : 'Submit Report'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Reply Section (Rendered when not editing) */}
                {review.reply && activeReplyId !== review._id && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-900">Your Response</span>
                    </div>
                    <p className="text-sm text-slate-500 italic">"{review.reply}"</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
            <MessageSquare className="w-16 h-16 text-slate-100 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No reviews found</h3>
            <p className="text-slate-400 max-w-sm mx-auto">Try adjusting your filters or wait for students to leave feedback on your courses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
