import React from 'react';
import { Star, Users, Clock, Globe, Calendar, Info } from 'lucide-react';
import { formatCategory } from '../../utils/format';

const CourseHero = ({ course }) => {
  if (!course) return null;

  return (
    <section className="relative bg-[#1c1d1f] text-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex">
        <div className="lg:w-2/3 lg:pr-12">
          {/* Breadcrumbs */}
          <nav className="flex text-sm font-bold text-purple-400 mb-6 space-x-2">
            <a href="/courses" className="hover:underline">Courses</a>
            <span>&gt;</span>
            <a href={`/courses?category=${course.category}`} className="hover:underline">{formatCategory(course.category)}</a>
          </nav>

          <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            {course.title}
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-300 mb-6">
            {course.shortDescription || course.description?.substring(0, 160) + '...'}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-1 rounded text-amber-400 font-bold">
              <span>{course.rating || 0}</span>
              <Star size={16} fill="currentColor" />
            </div>
            <span className="text-purple-300 underline underline-offset-4 cursor-pointer">
              ({course.totalRatings || 0} ratings)
            </span>
            <span className="text-gray-300">
              {course.totalStudents?.toLocaleString() || 0} students
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Created by</span>
              <span className="text-purple-400 font-bold underline underline-offset-4 cursor-pointer">
                {course.instructor?.name || 'Expert Instructor'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span>Last updated {new Date(course.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-gray-400" />
              <span>{course.language || 'English'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Info size={16} className="text-gray-400" />
              <span className="capitalize">{course.level || 'All Levels'}</span>
            </div>
          </div>
        </div>

        {/* This will be hidden on large screens because the sidebar takes over */}
        <div className="lg:hidden mt-8">
           {/* Preview Card for Mobile will be handled by the Sidebar component stacking */}
        </div>
      </div>
    </section>
  );
};

export default CourseHero;
