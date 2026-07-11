import React, { useState } from 'react';
import { Star, Clock, Users, BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from './Button';
import { enrollInCourse } from '../services/courseService';
import { formatCurrency } from '../utils/currencyFormatter';
import { useAuth } from '../context/AuthContext';
import PurchaseModal from './course/PurchaseModal';
import { loadRazorpayScript } from '../utils/razorpayLoader';
import { formatCategory } from '../utils/format';

const CourseCard = ({ course, enrolled = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    _id,
    title,
    price,
    discountPrice,
    thumbnail,
    category,
    level,
    rating,
    totalRatings,
    totalStudents,
    instructor,
    modules = [],
  } = course;

  const totalLessonsCount = course.totalLessons || modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0);
  const totalDurationSeconds = course.totalDuration || modules.reduce(
    (acc, mod) => acc + (mod.lessons?.reduce((a, l) => a + (l.duration || 0), 0) || 0),
    0
  );
  const hours = Math.floor(totalDurationSeconds / 60);
  const mins = totalDurationSeconds % 60;

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // loadRazorpayScript removed as it now uses the shared utility

  const handleEnrollClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isEnrolling) return;

    if (!isAuthenticated) {
      toast.error('Please login to enroll in courses');
      navigate('/login');
      return;
    }
    
    setShowPurchaseModal(true);
  };

  const initiatePayment = async () => {
    if (isEnrolling) return;
    setIsEnrolling(true);
    const loadingToast = toast.loading('Initializing enrollment...');
    
    try {
      // 1. If course is free
      if (price === 0) {
        await enrollInCourse(_id);
        toast.success('Successfully Enrolled!', { id: loadingToast });
        setShowPurchaseModal(false);
        setTimeout(() => navigate('/student/my-learning'), 1000);
        return;
      }

      // 2. Load Razorpay Script
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load.', { id: loadingToast });
        setIsEnrolling(false);
        return;
      }

      // 3. Create Order
      const { createOrder } = await import('../services/paymentService');
      const orderData = await createOrder(_id);

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // 4. Open Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Zinda Learn',
        description: `Enrollment for ${title}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          toast.loading('Verifying payment...', { id: loadingToast });
          try {
            const { verifyPayment } = await import('../services/paymentService');
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              toast.success('Payment Successful! Enrolled.', { id: loadingToast });
              setShowPurchaseModal(false);
              setTimeout(() => navigate('/student/my-learning'), 1500);
            } else {
              toast.error(verifyRes.message || 'Payment verification failed', { id: loadingToast });
              setIsEnrolling(false);
            }
          } catch (err) {
            toast.error('Verification failed.', { id: loadingToast });
            setIsEnrolling(false);
          }
        },
        modal: {
          ondismiss: function() {
            setIsEnrolling(false);
            toast.dismiss(loadingToast);
            toast('Payment cancelled');
          }
        },
        theme: { color: '#7c3aed' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Enrollment failed. Please try again.', { id: loadingToast });
      setIsEnrolling(false);
    }
  };

  const handleCardClick = () => {
    navigate(enrolled ? `/student/my-learning?course=${_id}` : `/courses/${_id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-video">
        <img
          src={thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Rating floating badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-white rounded-full shadow-md z-10">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-surface-900">{rating}</span>
          <span className="text-[10px] text-surface-400 font-medium">({totalRatings?.toLocaleString()})</span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm text-primary-700 rounded-lg">
            {formatCategory(category)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
            {instructor?.name?.charAt(0) || 'Z'}
          </div>
          <span className="text-xs text-surface-500 font-medium">{instructor?.name || 'Instructor'}</span>
        </div>

        <h3 className="font-bold text-surface-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
          {title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-surface-500 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {totalLessonsCount} lessons
          </span>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between pt-4 border-t border-surface-100">
            <div className="text-right">
              {discountPrice > 0 && discountPrice < price ? (
                <>
                  <span className="text-xs text-surface-400 line-through">{formatCurrency(price)}</span>
                  <span className="font-bold text-primary-600 text-lg">{formatCurrency(discountPrice)}</span>
                </>
              ) : price === 0 ? (
                <span className="font-bold text-emerald-500 text-lg">Free</span>
              ) : (
                <span className="font-bold text-surface-900 text-lg">{formatCurrency(price)}</span>
              )}
            </div>

            {!enrolled ? (
              <Button 
                onClick={handleEnrollClick}
                disabled={isEnrolling}
                size="sm" 
                className="rounded-xl shadow-sm hover:shadow-md"
              >
                {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            ) : (
              <Button 
                variant="secondary"
                size="sm"
                className="rounded-xl"
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <PurchaseModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        course={course}
        onProceed={initiatePayment}
        loading={isEnrolling}
      />
    </div>
  );
};

export default CourseCard;
