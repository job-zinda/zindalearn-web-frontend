import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import api from '../../services/api'; // Or whatever API service they use
import { useAuth } from '../../context/AuthContext';
import Button from '../Button';
import toast from 'react-hot-toast';

const CourseReviews = ({ courseId, isEnrolled }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/courses/${courseId}/reviews`);
      setReviews(res.data.reviews || []);
      
      // Check if current user already reviewed
      if (user) {
        const existing = res.data.reviews?.find(r => r.user?._id === user._id);
        if (existing) {
          setUserReview(existing);
          setRating(existing.rating);
          setReviewText(existing.review || existing.comment || '');
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      return toast.error('Please select a rating');
    }
    if (!reviewText.trim()) {
      return toast.error('Please write a review');
    }

    setSubmitting(true);
    try {
      if (userReview) {
        // Update existing
        await api.put(`/courses/${courseId}/reviews/${userReview._id}`, { rating, review: reviewText.trim() });
        toast.success('Review updated successfully!');
      } else {
        // Create new
        await api.post(`/courses/${courseId}/reviews`, { rating, review: reviewText.trim() });
        toast.success('Review submitted successfully!');
      }
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      console.error('Submit review error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const distribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === stars).length / totalReviews) * 100 : 0
  }));

  if (loading) {
    return <div className="py-10 text-center text-zinc-500">Loading reviews...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">Student Feedback</h2>
        {isEnrolled && !showForm && (
          <Button onClick={() => setShowForm(true)} variant={userReview ? "secondary" : "primary"}>
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">{userReview ? 'Update your review' : 'How would you rate this course?'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating) 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-zinc-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us what you think about the course..."
              rows={4}
              className="w-full rounded-xl border border-zinc-200 p-4 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              required
            />
            <div className="flex gap-3">
              <Button type="submit" loading={submitting}>
                {userReview ? 'Update Review' : 'Submit Review'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {totalReviews === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-zinc-200 p-10 text-center">
          <MessageSquare className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500 mb-2">No reviews yet for this course.</p>
          {isEnrolled && !showForm && (
            <button onClick={() => setShowForm(true)} className="text-primary-600 font-semibold hover:underline">
              Be the first to review
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Stats Column */}
          <div className="md:col-span-4 lg:col-span-3 space-y-6">
            <div className="text-center md:text-left">
              <p className="text-5xl font-black text-zinc-900">{avgRating}</p>
              <div className="flex items-center justify-center md:justify-start gap-1 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} 
                  />
                ))}
              </div>
              <p className="text-zinc-500 text-sm font-semibold">Course Rating</p>
            </div>

            <div className="space-y-2">
              {distribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 w-12 shrink-0">
                    <span className="font-semibold text-zinc-700">{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-zinc-400 text-xs">{percentage > 0 ? Math.round(percentage) : 0}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="md:col-span-8 lg:col-span-9 space-y-5">
            {reviews.map((rev) => (
              <div key={rev._id} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                      {rev.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 text-sm">{rev.user?.name || 'Anonymous User'}</p>
                      <p className="text-xs text-zinc-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed">{rev.review || rev.comment || 'No written feedback provided'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseReviews;
