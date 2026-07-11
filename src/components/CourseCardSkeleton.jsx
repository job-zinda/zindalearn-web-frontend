import React from 'react';

const CourseCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse flex flex-col h-full border border-surface-100">
      {/* Thumbnail Skeleton */}
      <div className="aspect-video bg-surface-200"></div>
      
      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-surface-200"></div>
          <div className="w-24 h-3 bg-surface-200 rounded"></div>
        </div>

        <div className="h-5 w-full bg-surface-200 rounded mb-2"></div>
        <div className="h-5 w-2/3 bg-surface-200 rounded mb-4"></div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-3 bg-surface-200 rounded"></div>
          <div className="w-16 h-3 bg-surface-200 rounded"></div>
        </div>

        <div className="mt-auto pt-4 border-t border-surface-100 flex items-center justify-between">
          <div className="w-20 h-6 bg-surface-200 rounded"></div>
          <div className="w-24 h-9 bg-surface-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton;
