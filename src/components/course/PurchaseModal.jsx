import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';
import toast from 'react-hot-toast';
import { getReferralCode, saveReferralCode } from '../../utils/referral';
import { verifyReferral } from '../../services/paymentService';

const PurchaseModal = ({ isOpen, onClose, course, onProceed, loading }) => {
  const [agreed, setAgreed] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');
  const [checkingReferral, setCheckingReferral] = useState(false);
  const [referralError, setReferralError] = useState('');
  useEffect(() => {
    if (isOpen && course?._id) {
      try {
        setReferralCode(getReferralCode(course._id));
        setVerifiedCode('');
        setReferralError('');
      } catch (error) {
        console.error('Unable to restore referral:', error);
        toast.error('Unable to restore referral ID. Please enter it again.');
      }
    }
  }, [isOpen, course?._id]);

  // Reset agreed state when modal closes
  useEffect(() => {
    if (!isOpen) setAgreed(false);
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, loading]);

  const price = course?.price || 0;
  const discountPrice = course?.discountPrice || 0;
  const totalAmount = discountPrice > 0 && discountPrice < price ? discountPrice : price;
  const closeModal = () => {
    if (!loading) onClose();
  };

  const handleVerifyReferral = async () => {
    const code = referralCode.trim();
    if (!code) return;
    setCheckingReferral(true);
    setReferralError('');
    try {
      const result = await verifyReferral(code);
      if (!result.valid) throw new Error('Invalid Jobzinda referral ID');
      setVerifiedCode(code);
    } catch (error) {
      setVerifiedCode('');
      const message = error.response?.data?.message || error.message || 'Referral verification failed';
      setReferralError(message);
      toast.error(message);
    } finally {
      setCheckingReferral(false);
    }
  };
  const handleCopyReferralLink = async () => {
    try {
      const url = new URL(`/courses/${course._id}`, window.location.origin);
      url.searchParams.set('ref', referralCode.trim());
      await navigator.clipboard.writeText(url.toString());
      toast.success('Course referral link copied');
    } catch (error) {
      console.error('Unable to copy referral link:', error);
      toast.error('Unable to copy referral link');
    }
  };

  const handleProceed = () => {
    if (!agreed) {
      toast.error('Please accept Terms & Conditions');
      return;
    }
    try {
      saveReferralCode(course._id, referralCode);
    } catch (error) {
      console.error('Unable to save referral:', error);
      toast.error('Unable to save your referral ID. Please retry.');
      return;
    }
    onProceed(totalAmount > 0 ? referralCode.trim() : '');
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label={totalAmount === 0 ? 'Free enrollment' : 'Course payment'}
            className="relative my-auto w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              disabled={loading}
              aria-label="Close checkout"
              className="absolute top-6 right-6 p-2 rounded-full bg-zinc-100 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Image */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={course?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop'}
                alt={course?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>

            <div className="p-8 lg:p-10 -mt-10 relative bg-white rounded-t-[2.5rem]">
              {/* Course Info */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {course?.category}
                  </span>
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {course?.level}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-zinc-900 leading-tight line-clamp-2">
                  {course?.title}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-[10px]">
                    {course?.instructor?.name?.charAt(0) || 'I'}
                  </div>
                  <p className="text-xs font-bold text-zinc-500">
                    by <span className="text-zinc-900">{course?.instructor?.name || 'Expert Instructor'}</span>
                  </p>
                </div>
              </div>

              {/* Purchase Details */}
              <div className="bg-zinc-50 rounded-3xl p-6 mb-8 border border-zinc-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-zinc-500">Course Price</span>
                  <div className="flex items-center gap-2">
                    {discountPrice > 0 && discountPrice < price && (
                      <span className="text-xs text-zinc-400 line-through">
                        {formatCurrency(price)}
                      </span>
                    )}
                    <span className="text-lg font-black text-zinc-900">
                      {formatCurrency(price)}
                    </span>
                  </div>
                </div>
                
                {discountPrice > 0 && discountPrice < price && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="text-sm font-bold">Special Discount</span>
                    <span className="text-sm font-bold">
                      -{formatCurrency(price - discountPrice)}
                    </span>
                  </div>
                )}

                <div className="h-px bg-zinc-200" />
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-zinc-900">Total Payable</span>
                  <span className="text-2xl font-black text-primary-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-8 p-4 bg-primary-50/50 rounded-2xl border border-primary-100">
                <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0" />
                <p className="text-sm font-bold text-primary-900">
                  {totalAmount === 0 ? 'Enroll in this course for free.' : 'Pay securely with Razorpay to enroll in this course.'}
                </p>
              </div>

              {totalAmount > 0 && (
                <div className="mb-6">
                  <label htmlFor={`referral-${course?._id}`} className="block text-sm font-bold text-zinc-700 mb-2">
                    Jobzinda Referral ID (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id={`referral-${course?._id}`}
                      value={referralCode}
                      maxLength={100}
                      disabled={loading || checkingReferral}
                      onChange={(event) => { setReferralCode(event.target.value); setVerifiedCode(''); setReferralError(''); }}
                      placeholder="Enter Jobzinda referral ID"
                      className="min-w-0 flex-1 px-3 py-3 border border-zinc-300 rounded-xl text-sm text-zinc-900"
                    />
                    <button type="button" onClick={handleVerifyReferral} disabled={loading || checkingReferral || !referralCode.trim()} className="px-4 rounded-xl bg-zinc-100 text-zinc-700 font-bold text-sm disabled:opacity-50">
                      {checkingReferral ? 'Checking...' : 'Verify'}
                    </button>
                  </div>
                  {verifiedCode === referralCode.trim() && verifiedCode && (
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <span className="text-emerald-700">Jobzinda referral ID verified.</span>
                      <button type="button" onClick={handleCopyReferralLink} className="font-bold text-primary-600 underline">Copy course referral link</button>
                    </div>
                  )}
                  {referralError && <p role="alert" className="mt-2 text-xs text-red-600">{referralError}</p>}
                  <p className="mt-2 text-xs text-zinc-500">Commission goes to the referral owner, without increasing your course price.</p>
                </div>
              )}
              {/* Terms Checkbox */}
              <div className="space-y-6">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      disabled={loading}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-zinc-200 rounded-md peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all flex items-center justify-center">
                      <CheckCircle2 className={`w-3.5 h-3.5 text-white ${agreed ? 'scale-100' : 'scale-0'} transition-transform`} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-700 transition-colors">
                    I agree to the <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline hover:text-primary-700 transition-colors">Terms & Conditions</a>
                  </span>
                </label>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="flex-1 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-black text-sm rounded-2xl transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleProceed}
                    disabled={loading || checkingReferral || !agreed}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-black text-sm rounded-2xl shadow-lg transition-all ${
                      agreed && !loading
                        ? 'bg-primary-600 text-white shadow-primary-500/30 hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98]' 
                        : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      totalAmount === 0 ? 'Enroll for Free' : `Pay ${formatCurrency(totalAmount)} & Enroll`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default PurchaseModal;
