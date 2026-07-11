import { useState } from 'react';
import { ChevronDown, Clock, Play, Lock, CheckCircle2 } from 'lucide-react';

const ModuleAccordion = ({ modules = [], activeLesson, completedLessons = [], onLessonClick, isEnrolled }) => {
  const [openModules, setOpenModules] = useState([0]);

  const toggleModule = (index) => {
    setOpenModules((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const formatDuration = (mins) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="space-y-2">
      {modules.map((module, moduleIndex) => {
        const isOpen = openModules.includes(moduleIndex);
        const moduleDuration = module.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0;
        const completedInModule = module.lessons?.filter(l => completedLessons.includes(l._id)).length || 0;

        return (
          <div key={module._id || moduleIndex} className="border border-zinc-200 rounded-xl overflow-hidden">
            {/* Module Header */}
            <button
              onClick={() => toggleModule(moduleIndex)}
              className="w-full flex items-center justify-between px-5 py-4 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                    Module {moduleIndex + 1}
                  </span>
                  {isEnrolled && (
                    <span className="text-xs text-zinc-400">
                      · {completedInModule}/{module.lessons?.length || 0} done
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-zinc-900 text-sm leading-snug truncate">{module.title}</h4>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-zinc-400 hidden sm:block">
                  {module.lessons?.length || 0} lessons · {formatDuration(moduleDuration)}
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Lessons List */}
            {isOpen && (
              <div className="divide-y divide-zinc-100">
                {module.lessons?.map((lesson, lessonIndex) => {
                  const lessonId = lesson._id || `${moduleIndex}-${lessonIndex}`;
                  const isActive = activeLesson?.lessonIndex === lessonIndex && activeLesson?.moduleIndex === moduleIndex;
                  const isCompleted = completedLessons.includes(lessonId);
                  const isLocked = !isEnrolled && !lesson.isFree;

                  return (
                    <button
                      key={lessonId}
                      onClick={() => !isLocked && onLessonClick?.({ moduleIndex, lessonIndex, lesson, module })}
                      disabled={isLocked}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                        isActive
                          ? 'bg-primary-50 border-l-4 border-l-primary-600'
                          : isLocked
                          ? 'opacity-60 cursor-not-allowed hover:bg-transparent'
                          : 'hover:bg-zinc-50 cursor-pointer'
                      }`}
                    >
                      {/* Icon */}
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      ) : lesson.isFree ? (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-primary-600' : 'bg-primary-100'}`}>
                          <Play className={`w-3 h-3 fill-current ml-0.5 ${isActive ? 'text-white' : 'text-primary-600'}`} />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                          <Lock className="w-3 h-3 text-zinc-400" />
                        </div>
                      )}

                      {/* Lesson info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary-700' : 'text-zinc-800'}`}>
                          {lesson.title}
                        </p>
                        {lesson.isFree && !isEnrolled && (
                          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Free Preview</span>
                        )}
                      </div>

                      {/* Duration */}
                      {lesson.duration > 0 && (
                        <div className="flex items-center gap-1 text-xs text-zinc-400 shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatDuration(lesson.duration)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ModuleAccordion;
