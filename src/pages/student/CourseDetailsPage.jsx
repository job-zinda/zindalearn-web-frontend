import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, enrollInCourse } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import PurchaseModal from '../../components/course/PurchaseModal';
import { loadRazorpayScript } from '../../utils/razorpayLoader';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';

// Components
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CourseHero from '../../components/course/CourseHero';
import CourseSidebar from '../../components/course/CourseSidebar';
import CourseCurriculum from '../../components/course/CourseCurriculum';
import CourseInstructorCard from '../../components/course/CourseInstructorCard';
import CourseSkeleton from '../../components/course/CourseSkeleton';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUser } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [error, setError] = useState(null);

  // Wishlist States
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await getCourseById(id);
        
        // If already enrolled, direct to learning page
        if (data.enrolled) {
           navigate(`/student/my-learning?course=${id}`); 
           return;
        }

        setCourse(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.response?.data?.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate]);

  // Sync wishlist local state with global user context
  useEffect(() => {
    if (user && user.wishlist && course) {
      setWishlisted(user.wishlist.includes(course._id));
    }
  }, [user, course]);

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

      toast.loading('Opening Razorpay Secure Checkout...', { id: loadingToast });

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
              toast.success('Payment Successful! Welcome to the course.', { id: loadingToast });
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
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#7c3aed'
        },
        modal: {
          ondismiss: function() {
            setEnrolling(false);
            toast.dismiss(loadingToast);
            toast('Payment cancelled');
          }
        }
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
    navigate(`/student/my-learning?course=${id}&play=true`);
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to manage your wishlist');
      navigate('/login');
      return;
    }

    setWishlisting(true);
    try {
      const { toggleWishlist } = await import('../../services/settingsService');
      const response = await toggleWishlist(course._id);
      
      if (response.success) {
        // Sync context state
        const updatedUser = { ...user, wishlist: response.wishlist };
        updateUser(updatedUser);
        setWishlisted(response.isWishlisted);
        toast.success(response.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlisting(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: course?.title || 'Zinda Learn Course',
      text: course?.subtitle || `Check out this course on Zinda Learn: ${course?.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Course shared successfully!');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error sharing:', err);
      }
    }

    // Fallback to clipboard copy
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Course link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy course link');
    }
  };

  if (loading) return <CourseSkeleton />;

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Navbar showBackground={true} />
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Course not found</h2>
          <p className="text-gray-500 mb-8">{error || "The course you're looking for might have been moved or deleted."}</p>
          <button 
            onClick={() => navigate('/courses')}
            className="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse all courses
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar showBackground={true} />
      
      <CourseHero course={course} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:flex gap-12 relative">
          
          {/* Main Content */}
          <div className="lg:w-2/3">
            
            {/* What you'll learn */}
            <div className="border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {(course.whatYouWillLearn?.length > 0 ? course.whatYouWillLearn : [
                  "Master the core concepts of the subject from scratch",
                  "Build real-world projects to reinforce learning",
                  "Learn best practices and industry standards",
                  "Get lifetime access to course materials"
                ]).map((item, index) => (
                  <div key={index} className="flex gap-3 text-sm text-gray-700">
                    <CheckCircle2 size={18} className="text-gray-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <div className="prose prose-purple max-w-none text-gray-700">
                <div dangerouslySetInnerHTML={{ __html: course.description }} />
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {(course.requirements?.length > 0 ? course.requirements : [
                  "No prior experience required",
                  "A computer with internet access",
                  "Passion to learn and grow"
                ]).map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Curriculum */}
            <CourseCurriculum modules={course.modules} />

            {/* Instructor */}
            <CourseInstructorCard instructor={course.instructor} />

          </div>

          {/* Sidebar - Desktop Sticky Container */}
          <div className="lg:w-1/3">
            <CourseSidebar 
              course={course} 
              enrolled={course.enrolled}
              enrolling={enrolling}
              onEnroll={handleEnrollClick}
              onContinue={handleContinue}
              wishlisted={wishlisted}
              wishlisting={wishlisting}
              onToggleWishlist={handleToggleWishlist}
              onShare={handleShare}
            />
          </div>

        </div>
      </main>

      <PurchaseModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        course={course}
        onProceed={initiatePayment}
        loading={enrolling}
      />

      <Footer />
    </div>
  );
};

export default CourseDetailsPage;
