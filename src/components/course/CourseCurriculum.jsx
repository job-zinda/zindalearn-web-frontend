import React, { useState } from 'react';
import { ChevronDown, ChevronUp, PlayCircle, Lock, Clock } from 'lucide-react';

const CourseCurriculum = ({ modules }) => {
  const [expandedModules, setExpandedModules] = useState([0]);

  const toggleModule = (index) => {
    setExpandedModules(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const totalLessons = modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const totalDuration = modules?.reduce((acc, m) => 
    acc + (m.lessons?.reduce((a, l) => a + (l.duration || 0), 0) || 0), 0
  ) || 0;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Course content</h2>
      
      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <span>{modules?.length || 0} sections</span>
          <span>•</span>
          <span>{totalLessons} lectures</span>
          <span>•</span>
          <span>{Math.round(totalDuration / 60)}h total length</span>
        </div>
        <button 
          onClick={() => setExpandedModules(expandedModules.length === modules?.length ? [] : modules?.map((_, i) => i))}
          className="text-purple-600 font-bold hover:text-purple-700"
        >
          {expandedModules.length === modules?.length ? 'Collapse all sections' : 'Expand all sections'}
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {modules?.map((module, mIndex) => (
          <div key={module._id} className="border-b border-gray-200 last:border-0">
            {/* Module Header */}
            <button
              onClick={() => toggleModule(mIndex)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedModules.includes(mIndex) ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                <span className="font-bold text-gray-900 text-left">{module.title}</span>
              </div>
              <div className="text-sm text-gray-600 shrink-0 ml-4">
                {module.lessons?.length || 0} lectures • {Math.round(module.lessons?.reduce((a, l) => a + (l.duration || 0), 0) / 60) || 0}m
              </div>
            </button>

            {/* Lessons List */}
            {expandedModules.includes(mIndex) && (
              <div className="bg-white">
                {module.lessons?.map((lesson, lIndex) => (
                  <div key={lesson._id} className="flex items-center justify-between p-4 hover:bg-gray-50 text-sm border-t border-gray-100 first:border-0">
                    <div className="flex items-center gap-3 flex-1">
                      <PlayCircle size={18} className="text-gray-500 shrink-0" />
                      <span className="text-gray-700">{lesson.title}</span>
                    </div>
                    <div className="flex items-center gap-6 ml-4">
                      {lesson.isFree && <span className="text-purple-600 underline cursor-pointer font-bold">Preview</span>}
                      <span className="text-gray-500 w-12 text-right">{lesson.duration || 0}m</span>
                      {!lesson.isFree && <Lock size={16} className="text-gray-400" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseCurriculum;
