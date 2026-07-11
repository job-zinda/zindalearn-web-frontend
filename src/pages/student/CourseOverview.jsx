import { useState } from 'react';
import { Star, Users, Clock, BookOpen, CheckCircle2, ChevronDown, Play, Award } from 'lucide-react';
import ModuleAccordion from '../../components/ModuleAccordion';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { enrollInCourse } from '../../services/courseService';
import { formatCurrency } from '../../utils/currencyFormatter';
import { useAuth } from '../../context/AuthContext';
import PurchaseModal from '../../components/course/PurchaseModal';
import { loadRazorpayScript } from '../../utils/razorpayLoader';
import CourseReviews from '../../components/course/CourseReviews';
import { formatCategory } from '../../utils/format';

const formatDuration = (mins) => {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const CourseOverview = ({ course, enrollment, onLessonClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [enrolling, setEnrolling] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const isEnrolled = !!enrollment;

  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const totalMins = course.modules?.reduce(
    (acc, m) => acc + (m.lessons?.reduce((a, l) => a + (l.duration || 0), 0) || 0), 0
  ) || 0;

  // loadRazorpayScript removed as it now uses the shared utility

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll in courses');
      navigate('/login');
      return;
    }
    setShowPurchaseModal(true);
  };

  const initiatePayment = async () => {
    if (enrolling) return;
    setEnrolling(true);
    const loadingToast = toast.loading('Initializing payment process...');
    
    try {
      // 1. If course is free, use direct enrollment
      if (course.price === 0 || course.isFree) {
        await enrollInCourse(course._id);
        toast.success('Successfully Enrolled!', { id: loadingToast });
        setShowPurchaseModal(false);
        setTimeout(() => navigate('/student/my-learning'), 1000);
        return;
      }

      // 2. Load Razorpay Script
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Please check your connection.', { id: loadingToast });
        setEnrolling(false);
        return;
      }

      // 3. Create Order
      const { createOrder } = await import('../../services/paymentService');
      const orderData = await createOrder(course._id);

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      toast.loading('Opening Razorpay Checkout...', { id: loadingToast });

      // 4. Open Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Zinda Learn',
        description: `Enrollment for ${course.title}`,
        image: '/logo.png',
        order_id: orderData.orderId,
        handler: async function (response) {
          toast.loading('Verifying payment signature...', { id: loadingToast });
          try {
            const { verifyPayment } = await import('../../services/paymentService');
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              toast.success('Payment Successful! Welcome.', { id: loadingToast });
              setShowPurchaseModal(false);
              setTimeout(() => navigate('/student/my-learning'), 1500);
            } else {
              toast.error(verifyRes.message || 'Payment verification failed', { id: loadingToast });
              setEnrolling(false);
            }
          } catch (err) {
            toast.error('Verification failed. Please contact support.', { id: loadingToast });
            setEnrolling(false);
          }
        },
        modal: {
          ondismiss: function() {
            setEnrolling(false);
            toast.dismiss(loadingToast);
            toast('Payment cancelled');
          }
        },
        theme: { color: '#7c3aed' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (err) {
      console.error('Enrollment error:', err);
      toast.error(err.response?.data?.message || err.message || 'Payment initialization failed.', { id: loadingToast });
      setEnrolling(false);
    }
  };

  const handleContinue = () => {
    // 1. Try the saved currentLesson from enrollment progress
    if (course.modules?.length) {
      const m = enrollment?.currentLesson?.moduleIndex || 0;
      const l = enrollment?.currentLesson?.lessonIndex || 0;
      const module = course.modules[m];
      const lesson = module?.lessons?.[l];

      if (lesson) {
        onLessonClick({ moduleIndex: m, lessonIndex: l, lesson, module });
        return;
      }

      // 2. Fallback: find the first module that has at least one lesson
      const firstModuleWithLessons = course.modules.find(mod => mod.lessons?.length > 0);
      if (firstModuleWithLessons) {
        const mIdx = course.modules.indexOf(firstModuleWithLessons);
        onLessonClick({
          moduleIndex: mIdx,
          lessonIndex: 0,
          lesson: firstModuleWithLessons.lessons[0],
          module: firstModuleWithLessons
        });
        return;
      }
    }

    // 3. Course has zero modules/lectures — open player with empty state
    onLessonClick({ isEmpty: true, moduleIndex: 0, lessonIndex: 0, lesson: null, module: null });
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* ── HERO CARD ── */}
      <div className="bg-white rounded-3xl shadow-md border border-zinc-100 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left content */}
          <div className="flex-1 p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-black uppercase tracking-widest rounded-lg">
                {formatCategory(course.category)}
              </span>
              <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest rounded-lg ${
                course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                course.level === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {course.level}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 leading-tight mb-4">
              {course.title}
            </h1>
            <p className="text-zinc-500 text-lg leading-relaxed mb-6">
              {course.shortDescription || course.description?.slice(0, 180) + '...'}
            </p>

            {/* Instructor */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {course.instructor?.name?.charAt(0) || 'I'}
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Instructor</p>
                <p className="font-bold text-zinc-900">{course.instructor?.name || 'Expert Instructor'}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-5 mb-8 text-sm">
              {course.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-zinc-900">{course.rating}</span>
                  {course.totalRatings > 0 && (
                    <span className="text-zinc-400">({course.totalRatings?.toLocaleString()} ratings)</span>
                  )}
                </div>
              )}
              {course.totalStudents > 0 && (
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Users className="w-4 h-4" />
                  <span>{course.totalStudents?.toLocaleString()} students</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(totalMins)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500">
                <BookOpen className="w-4 h-4" />
                <span>{totalLessons} lessons</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              {isEnrolled ? (
                <Button onClick={handleContinue} className="!px-8 !py-3.5 text-base font-bold rounded-xl flex items-center gap-2">
                  <Play className="w-5 h-5 fill-current" />
                  Continue Learning
                </Button>
              ) : (
                <Button onClick={handleEnrollClick} loading={enrolling} className="!px-8 !py-3.5 text-base font-bold rounded-xl">
                  Enroll Now
                </Button>
              )}
              <button className="px-6 py-3.5 border-2 border-zinc-200 text-zinc-700 font-bold rounded-xl hover:border-primary-400 hover:text-primary-600 transition-colors">
                ♡ Wishlist
              </button>
            </div>
          </div>

          {/* Right — preview + price */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 p-6 lg:border-l border-zinc-100 bg-zinc-50 flex flex-col gap-5">
            {/* Thumbnail preview */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-200 group cursor-pointer">
              <img
                src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=350&fit=crop'}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-6 h-6 text-zinc-900 fill-zinc-900 ml-1" />
                </div>
              </div>
              <span className="absolute bottom-3 left-3 text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
                Preview
              </span>
            </div>

            {/* Price box */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                {course.discountPrice > 0 && course.discountPrice < course.price ? (
                  <>
                    <span className="text-3xl font-extrabold text-primary-600">{formatCurrency(course.discountPrice)}</span>
                    <span className="text-lg text-zinc-400 line-through">{formatCurrency(course.price)}</span>
                  </>
                ) : course.price === 0 ? (
                  <span className="text-3xl font-extrabold text-emerald-600">Free</span>
                ) : (
                  <span className="text-3xl font-extrabold text-zinc-900">{formatCurrency(course.price)}</span>
                )}
              </div>
              {isEnrolled ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-700 text-sm">You're enrolled</span>
                </div>
              ) : (
                <Button onClick={handleEnrollClick} loading={enrolling} fullWidth className="!py-3.5 text-base font-bold rounded-xl">
                  Enroll Now
                </Button>
              )}
              <p className="text-xs text-zinc-400 text-center mt-3">Lifetime access included</p>
            </div>

            {/* Includes */}
            <div className="space-y-2 px-1">
              {[
                `${totalLessons} on-demand lessons`,
                `${formatDuration(totalMins)} of content`,
                'Full lifetime access',
                'Certificate of completion',
                'Access on mobile & desktop',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-zinc-600">
                  <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── COURSE REVIEWS ── */}
      <div className="bg-white rounded-3xl shadow-md border border-zinc-100 p-8 lg:p-10">
        <CourseReviews courseId={course._id} isEnrolled={isEnrolled} />
      </div>

      <PurchaseModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        course={course}
        onProceed={initiatePayment}
        loading={enrolling}
      />
    </div>
  );
};

export default CourseOverview;
