import React from 'react';
import { Play, Shield, Monitor, FileText, Award, Heart, Share2 } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';

const CourseSidebar = ({ 
  course, 
  enrolled, 
  enrolling, 
  onEnroll, 
  onContinue,
  wishlisted,
  wishlisting,
  onToggleWishlist,
  onShare
}) => {
  if (!course) return null;

  return (
    <div className="lg:absolute lg:top-24 lg:right-0 lg:z-10 w-full lg:w-[350px] bg-white lg:shadow-2xl lg:border border-gray-200 lg:rounded-lg overflow-hidden mb-8 lg:mb-0">
      {/* Preview Section */}
      <div className="relative group cursor-pointer aspect-video lg:aspect-auto lg:h-48 overflow-hidden bg-gray-900">
        <img 
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=350&fit=crop'} 
          alt={course.title}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform duration-300">
            <Play size={32} fill="white" className="text-white ml-1" />
          </div>
          <span className="mt-4 text-white font-bold text-lg drop-shadow-md">Preview this course</span>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="p-6">
        <div className="flex items-baseline gap-3 mb-6">
          {course.discountPrice > 0 ? (
            <>
              <span className="text-3xl font-bold text-gray-900">{formatCurrency(course.discountPrice)}</span>
              <span className="text-lg text-gray-500 line-through">{formatCurrency(course.price)}</span>
              <span className="text-gray-600 text-sm">
                {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% off
              </span>
            </>
          ) : (
            <span className="text-3xl font-bold text-gray-900">
              {course.price === 0 ? 'Free' : formatCurrency(course.price)}
            </span>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {enrolled ? (
            <button 
              onClick={onContinue}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Play size={20} fill="currentColor" />
              Continue Learning
            </button>
          ) : (
            <button 
              disabled={enrolling}
              onClick={onEnroll}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold rounded-lg transition-colors"
            >
              {enrolling ? 'Processing...' : 'Enroll Now'}
            </button>
          )}
        </div>

        <p className="text-xs text-center text-gray-500 mb-6">30-Day Money-Back Guarantee</p>

        {/* This course includes */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">This course includes:</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-center gap-3">
              <Monitor size={18} className="text-gray-500" />
              <span>{course.totalDuration > 0 ? Math.round(course.totalDuration / 60) : 0} hours on-demand video</span>
            </li>
            <li className="flex items-center gap-3">
              <FileText size={18} className="text-gray-500" />
              <span>{course.totalLessons || 0} lessons</span>
            </li>
            <li className="flex items-center gap-3">
              <Shield size={18} className="text-gray-500" />
              <span>Full lifetime access</span>
            </li>
            <li className="flex items-center gap-3">
              <Award size={18} className="text-gray-500" />
              <span>Certificate of completion</span>
            </li>
          </ul>
        </div>

        {/* Share/Wishlist */}
        <div className="flex border-t border-gray-100 mt-6 pt-6">
          <button 
            onClick={onShare}
            className="flex-1 flex items-center justify-center gap-2 font-bold text-sm text-gray-700 hover:text-purple-600 transition-colors"
          >
            <Share2 size={18} />
            Share
          </button>
          <button 
            disabled={wishlisting}
            onClick={onToggleWishlist}
            className={`flex-1 flex items-center justify-center gap-2 font-bold text-sm transition-colors border-l border-gray-100 ${
              wishlisted ? 'text-red-500 hover:text-red-650' : 'text-gray-700 hover:text-purple-600'
            }`}
          >
            <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} className={wishlisting ? 'animate-pulse' : ''} />
            {wishlisted ? 'Wishlisted' : 'Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseSidebar;
