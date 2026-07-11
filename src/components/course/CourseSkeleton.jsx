import React from 'react';

const CourseSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <div className="bg-[#1c1d1f] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:w-2/3">
            <div className="h-4 w-32 bg-gray-700 rounded mb-6"></div>
            <div className="h-10 w-3/4 bg-gray-700 rounded mb-4"></div>
            <div className="h-6 w-full bg-gray-700 rounded mb-6"></div>
            <div className="flex gap-4 mb-6">
              <div className="h-6 w-20 bg-gray-700 rounded"></div>
              <div className="h-6 w-32 bg-gray-700 rounded"></div>
            </div>
            <div className="flex gap-6">
              <div className="h-4 w-24 bg-gray-700 rounded"></div>
              <div className="h-4 w-24 bg-gray-700 rounded"></div>
              <div className="h-4 w-24 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:flex gap-12">
        <div className="lg:w-2/3">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4 mb-12">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-4 w-full bg-gray-200 rounded"></div>
            ))}
          </div>

          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 w-full bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="hidden lg:block w-[350px] bg-white shadow-lg rounded-lg h-[500px] -mt-40 relative z-10 border border-gray-200 p-6">
          <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-10 w-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-12 w-full bg-gray-200 rounded mb-4"></div>
          <div className="h-12 w-full bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 w-full bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSkeleton;
