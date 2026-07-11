import React from 'react';
import { Star, Users, PlayCircle, MessageSquare } from 'lucide-react';

const CourseInstructorCard = ({ instructor }) => {
  if (!instructor) return null;

  return (
    <div className="mt-12 pt-12 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructor</h2>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="shrink-0">
          <img 
            src={instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&background=random&size=128`} 
            alt={instructor.name}
            className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-purple-600 underline underline-offset-4 cursor-pointer mb-2">
            {instructor.name}
          </h3>
          <p className="text-gray-600 font-bold mb-4">Expert Instructor</p>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm font-bold text-gray-700">
            <div className="flex items-center gap-2">
              <Star size={16} fill="currentColor" className="text-amber-500" />
              <span>4.8 Instructor Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-gray-500" />
              <span>1,234 Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-500" />
              <span>{instructor.totalStudents?.toLocaleString() || '10,000+'} Students</span>
            </div>
            <div className="flex items-center gap-2">
              <PlayCircle size={16} className="text-gray-500" />
              <span>{instructor.totalCourses || '12'} Courses</span>
            </div>
          </div>

          <div className="prose prose-sm text-gray-700 max-w-none">
            <p>{instructor.bio || "I am a passionate educator with over 10 years of experience in the industry. My goal is to help students master complex concepts through simplified, practical teaching methods."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseInstructorCard;
