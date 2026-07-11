import React from 'react';

const Skeleton = ({ className, width, height, circle }) => {
  const style = {
    width: width || '100%',
    height: height || '20px',
    borderRadius: circle ? '50%' : '8px'
  };

  return (
    <div 
      className={`animate-pulse bg-zinc-200 ${className}`} 
      style={style}
    ></div>
  );
};

export const CourseCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm h-full">
    <Skeleton height="180px" className="rounded-none" />
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton width="24px" height="24px" circle />
        <Skeleton width="100px" height="12px" />
      </div>
      <Skeleton width="80%" height="20px" />
      <div className="flex gap-4">
        <Skeleton width="60px" height="12px" />
        <Skeleton width="60px" height="12px" />
      </div>
      <div className="pt-4 border-t border-zinc-50 flex justify-between items-center">
        <Skeleton width="70px" height="24px" />
        <Skeleton width="90px" height="36px" />
      </div>
    </div>
  </div>
);

export default Skeleton;
