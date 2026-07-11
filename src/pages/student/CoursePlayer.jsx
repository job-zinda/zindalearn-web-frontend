import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import {
  Play, ChevronLeft, ChevronRight, CheckCircle2, CheckCircle,
  Clock, BarChart2, Eye, Lock, Lightbulb, Wrench,
  Video, Calendar, Users, ChevronDown, ChevronUp,
  Star, Send, Paperclip, BookOpen, HelpCircle, FileText,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { updateProgress, addLessonQA, replyOrEditQA, addLessonReview } from '../../services/courseService';
import toast from 'react-hot-toast';
import VideoPlayer from '../../components/VideoPlayer';
import CourseReviews from '../../components/course/CourseReviews';
import liveClassService from '../../features/liveClasses/services/liveClassService';

const fmtDuration = (mins) => {
  if (!mins) return '0:00';
  const h = Math.floor(mins / 60);
  const m = String(mins % 60).padStart(2, '0');
  return h > 0 ? `${h}:${m}:00` : `${mins}:00`;
};

// ─── Sub-component: Tab Bar ───────────────────────────────────────────────────
const TABS = ['Overview', 'Notes', 'Q&A', 'Resources', 'Tests', 'Reviews'];

const TabBar = memo(({ active, onChange }) => (
  <div className="flex gap-1 border-b border-zinc-200 mb-8 overflow-x-auto scrollbar-hide">
    {TABS.map((tab) => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`px-4 py-3 text-sm font-semibold transition-all relative whitespace-nowrap ${active === tab
            ? 'text-primary-600'
            : 'text-zinc-500 hover:text-zinc-800'
          }`}
      >
        {tab}
        {active === tab && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
        )}
      </button>
    ))}
  </div>
));

TabBar.displayName = 'TabBar';

// ─── Sub-component: Module Accordion Row ────────────────────────────────────
const ModuleRow = memo(({ module, moduleIndex, activeLesson, completedLessons, onLessonClick }) => {
  const [open, setOpen] = useState(
    moduleIndex === (activeLesson?.moduleIndex ?? 0)
  );

  return (
    <div>
      {/* Module header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <span className="text-sm font-bold text-zinc-800 group-hover:text-primary-600 transition-colors leading-snug">
          {module.title}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
        }
      </button>

      {open && (
        <div className="space-y-1 mb-2">
          {module.lessons?.map((lesson, lessonIndex) => {
            const lessonId = lesson._id || `${moduleIndex}-${lessonIndex}`;
            const isActive = activeLesson?.moduleIndex === moduleIndex && activeLesson?.lessonIndex === lessonIndex;
            const isCompleted = completedLessons?.includes(lessonId);

            return (
              <button
                key={lessonId}
                onClick={() => onLessonClick({ moduleIndex, lessonIndex, lesson, module })}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${isActive ? 'bg-primary-100' : 'hover:bg-zinc-50'
                  }`}
              >
                {/* Status icon */}
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-primary-600" />
                  ) : isActive ? (
                    <div className="w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center">
                      <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold leading-snug truncate ${isActive ? 'text-primary-700' : isCompleted ? 'text-zinc-500' : 'text-zinc-700'
                    }`}>
                    {String(lessonIndex + 1).padStart(2, '0')}. {lesson.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-zinc-400">{fmtDuration(lesson.duration)}</span>
                    {isActive && (
                      <span className="text-[10px] font-bold text-primary-600">• In Progress</span>
                    )}
                    {!lesson.isFree && !isCompleted && !isActive && (
                      <Lock className="w-3 h-3 text-zinc-300" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

ModuleRow.displayName = 'ModuleRow';

// ─── Main Component ───────────────────────────────────────────────────────────
const CoursePlayer = ({ course, enrollment, activeLesson, onLessonClick, onProgressUpdate, onBack }) => {
  const navigate = useNavigate();
  const { moduleIndex = 0, lessonIndex = 0, lesson = null, module: activeModule = null } = activeLesson || {};
  const [activeTab, setActiveTab] = useState('Overview');
  const [savingProgress, setSavingProgress] = useState(false);

  const completedLessons = enrollment?.completedLessons || [];
  const progress = enrollment?.progress || 0;

  const isLessonCompleted = completedLessons.includes(lesson?._id);

  // Watch tracking refs
  const highestTimeWatchedRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastSaveTimeRef = useRef(Date.now());

  // Refs for tracking active lesson coordinates during cleanup/unmount
  const lessonRef = useRef(lesson);
  const moduleIndexRef = useRef(moduleIndex);
  const lessonIndexRef = useRef(lessonIndex);
  const currentTimeRef = useRef(0);

  // Update refs when lesson changes
  useEffect(() => {
    lessonRef.current = lesson;
    moduleIndexRef.current = moduleIndex;
    lessonIndexRef.current = lessonIndex;
    currentTimeRef.current = 0;
  }, [lesson, moduleIndex, lessonIndex]);

  // Derived initial time
  const isCurrentActiveLesson = enrollment?.currentLesson?.lessonId === lesson?._id ||
    (enrollment?.currentLesson?.moduleIndex === moduleIndex && enrollment?.currentLesson?.lessonIndex === lessonIndex);

  const initialTime = useMemo(() => {
    if (!enrollment?._id || !lesson?._id) return 0;
    const localTime = localStorage.getItem(`zinda_progress_${enrollment._id}_${lesson._id}`);
    if (localTime !== null) {
      const parsed = Number(localTime);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return isCurrentActiveLesson ? (enrollment?.lastVideoTimestamp || 0) : 0;
  }, [enrollment?._id, lesson?._id, isCurrentActiveLesson, enrollment?.lastVideoTimestamp]);

  const allLessons = useMemo(() => course.modules?.flatMap((mod, mIdx) =>
    mod.lessons?.map((l, lIdx) => ({ moduleIndex: mIdx, lessonIndex: lIdx, lesson: l, module: mod })) || []
  ) || [], [course.modules]);

  const currentFlatIdx = useMemo(() => allLessons.findIndex(
    al => al.moduleIndex === moduleIndex && al.lessonIndex === lessonIndex
  ), [allLessons, moduleIndex, lessonIndex]);

  const prevLesson = currentFlatIdx > 0 ? allLessons[currentFlatIdx - 1] : null;
  const nextLesson = currentFlatIdx < allLessons.length - 1 ? allLessons[currentFlatIdx + 1] : null;

  const totalLessons = allLessons.length;
  const completedCount = completedLessons.length;

  const saveProgressToBackend = useCallback(async (timestamp, isCompleted) => {
    if (!enrollment?._id || !lessonRef.current?._id) return;
    try {
      const data = await updateProgress(enrollment._id, {
        lessonId: lessonRef.current._id,
        moduleIndex: moduleIndexRef.current,
        lessonIndex: lessonIndexRef.current,
        lastVideoTimestamp: timestamp,
        markCompleted: isCompleted
      });
      if (data?.success && data?.enrollment) {
        onProgressUpdate(data.enrollment);
      }
    } catch (err) {
      console.error("Failed to save progress to backend:", err);
    }
  }, [enrollment?._id, onProgressUpdate]);

  const triggerComplete = useCallback(async () => {
    if (savingProgress || !enrollment?._id || !lessonRef.current?._id) return;
    setSavingProgress(true);
    try {
      const data = await updateProgress(enrollment._id, {
        lessonId: lessonRef.current._id,
        moduleIndex: moduleIndexRef.current,
        lessonIndex: lessonIndexRef.current,
        lastVideoTimestamp: currentTimeRef.current,
        markCompleted: true
      });
      if (data?.success && data?.enrollment) {
        onProgressUpdate(data.enrollment);
        toast.success('Lesson completed! (+10 XP)');

        if (nextLesson) {
          setTimeout(() => {
            onLessonClick(nextLesson);
          }, 1500);
        }
      }
    } catch (err) {
      console.error("Auto-completion failed:", err);
      toast.error('Failed to mark lesson as completed.');
    } finally {
      setSavingProgress(false);
    }
  }, [enrollment?._id, savingProgress, onProgressUpdate, nextLesson, onLessonClick]);

  // Sync on leave (lesson change or unmount)
  const syncOnLeave = useCallback(() => {
    const targetLesson = lessonRef.current;
    const targetTime = currentTimeRef.current;
    if (!enrollment?._id || !targetLesson?._id || targetTime === 0) return;

    updateProgress(enrollment._id, {
      lessonId: targetLesson._id,
      moduleIndex: moduleIndexRef.current,
      lessonIndex: lessonIndexRef.current,
      lastVideoTimestamp: targetTime,
      markCompleted: false
    }).then(data => {
      if (data?.success && data?.enrollment) {
        onProgressUpdate(data.enrollment);
      }
    }).catch(err => {
      console.error("Sync on leave failed:", err);
    });
  }, [enrollment?._id, onProgressUpdate]);

  // Reset trackers and sync old lesson on change
  useEffect(() => {
    highestTimeWatchedRef.current = 0;
    lastTimeRef.current = 0;
    lastSaveTimeRef.current = Date.now();

    return () => {
      syncOnLeave();
    };
  }, [lesson?._id, syncOnLeave]);

  // Handle time updates from VideoPlayer
  const handleTimeUpdate = useCallback((currentTime, duration) => {
    if (!duration || !lesson?._id || !enrollment?._id) return;

    currentTimeRef.current = currentTime;

    // 1. Immediately save to localStorage as a refresh-safe fallback
    localStorage.setItem(`zinda_progress_${enrollment._id}_${lesson._id}`, String(currentTime));

    // 2. Track watch progress with cheat/seek protection
    if (currentTime > highestTimeWatchedRef.current) {
      if (currentTime - highestTimeWatchedRef.current <= 5) {
        highestTimeWatchedRef.current = currentTime;
      }
    }

    // 3. Mark completed if user watches >= 90%
    const isCompleted = enrollment?.completedLessons?.includes(lesson._id);
    if (!isCompleted && !savingProgress) {
      const percentWatched = highestTimeWatchedRef.current / duration;
      if (percentWatched >= 0.9) {
        triggerComplete();
      }
    }

    // 4. Periodic auto-save to database (every 15 seconds)
    const now = Date.now();
    if (now - lastSaveTimeRef.current >= 15000) {
      lastSaveTimeRef.current = now;
      saveProgressToBackend(currentTime, false);
    }
  }, [lesson?._id, enrollment?._id, enrollment?.completedLessons, savingProgress, triggerComplete, saveProgressToBackend]);

  const handleVideoEnded = useCallback(() => {
    const isCompleted = enrollment?.completedLessons?.includes(lesson?._id);
    if (!isCompleted) {
      highestTimeWatchedRef.current = currentTimeRef.current;
      triggerComplete();
    }
  }, [lesson?._id, enrollment?.completedLessons, triggerComplete]);

  // ── EMPTY STATE: course has no lessons ──────────────────────────
  if (activeLesson?.isEmpty || !lesson) {
    return (
      <div className="animate-fade-in space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Course
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Empty video placeholder */}
            <div className="relative aspect-video w-full bg-slate-900 rounded-[24px] overflow-hidden shadow-2xl border border-slate-800 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-5">
                <Play className="w-9 h-9 text-zinc-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Content Available</h3>
              <p className="text-sm text-zinc-400 max-w-sm text-center leading-relaxed">
                This course doesn't have any published lectures yet. The instructor is still preparing content — check back soon!
              </p>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 text-sm mb-1">Course content coming soon</p>
                <p className="text-amber-700 text-sm leading-relaxed">
                  The instructor will add lectures to this course. You're already enrolled, so you'll have full access as soon as they're published.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {course.instructor?.name?.charAt(0) || 'I'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900 text-sm truncate">{course.instructor?.name || 'Instructor'}</p>
                  <p className="text-xs text-zinc-400 truncate">Expert Instructor, Zinda Learn</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-zinc-900 mb-3 leading-snug">{course.title}</p>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span className="font-bold text-zinc-700">Course Progress</span>
                <span className="font-black text-primary-600 text-base">{progress}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <h3 className="font-bold text-zinc-900">Course Content</h3>
              </div>
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-400 text-sm">No lessons available yet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleMarkComplete = async () => {
    if (isLessonCompleted || savingProgress || !enrollment?._id || !lesson?._id) return;
    setSavingProgress(true);
    try {
      const data = await updateProgress(enrollment._id, {
        lessonId: lesson._id,
        moduleIndex,
        lessonIndex,
        lastVideoTimestamp: currentTimeRef.current || 0,
        markCompleted: true
      });
      if (data?.success && data?.enrollment) {
        onProgressUpdate(data.enrollment);
        toast.success('Lesson marked as complete!');

        if (nextLesson) {
          setTimeout(() => {
            onLessonClick(nextLesson);
          }, 1500);
        }
      }
    } catch (err) {
      console.error("Failed to manually complete lesson:", err);
      toast.error('Could not save progress.');
    } finally {
      setSavingProgress(false);
    }
  };

  const handleNavigate = async (target) => {
    if (!isLessonCompleted && enrollment?._id && lesson?._id) {
      try {
        const currentTimestamp = currentTimeRef.current;
        const data = await updateProgress(enrollment._id, {
          lessonId: lesson._id,
          moduleIndex: target.moduleIndex,
          lessonIndex: target.lessonIndex,
          lastVideoTimestamp: currentTimestamp,
          markCompleted: false
        });
        if (data?.success && data?.enrollment) {
          onProgressUpdate(data.enrollment);
        }
      } catch (_) { }
    }
    onLessonClick(target);
  };

  // ── STUDENT CMS INTERACTION STATES ──
  const [newQuestionText, setNewQuestionText] = useState('');
  const [submittingQA, setSubmittingQA] = useState(false);

  const [newRating, setNewRating] = useState(5);
  const [newReview, setNewReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [testAnswers, setTestAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(null);

  const [personalNoteText, setPersonalNoteText] = useState('');

  // ── LIVE CLASS STATES ──
  const [liveClasses, setLiveClasses] = useState([]);
  const [loadingLiveClasses, setLoadingLiveClasses] = useState(true);

  useEffect(() => {
    const fetchLiveClasses = async () => {
      try {
        setLoadingLiveClasses(true);
        const res = await liveClassService.getStudentLiveClasses();
        if (res?.success) {
          // Filter classes for the current course
          const courseClasses = (res.data || []).filter(c => 
            c.course?._id === course._id || c.course === course._id
          );
          setLiveClasses(courseClasses);
        }
      } catch (err) {
        console.error('Failed to fetch live classes:', err);
      } finally {
        setLoadingLiveClasses(false);
      }
    };
    if (course?._id) {
      fetchLiveClasses();
    }
  }, [course?._id]);

  const currentLiveClass = useMemo(() => {
    if (liveClasses.length === 0) return null;
    return liveClasses.find(c => c.status === 'live') || liveClasses[0];
  }, [liveClasses]);

  const getJoinButtonState = useCallback((lc) => {
    const now = new Date();
    const start = new Date(lc.startTime);
    const diffInMins = (start - now) / 60000;
    
    if (lc.status === 'ended') {
      return { enabled: false, text: 'Session Ended' };
    }
    if (lc.status === 'live' || diffInMins <= 10) {
      return { enabled: true, text: 'Join Live Session' };
    }
    
    if (diffInMins > 0) {
      if (diffInMins < 60) {
        return { enabled: false, text: `Starts in ${Math.round(diffInMins)}m` };
      }
      const hours = Math.round(diffInMins / 60);
      if (hours < 24) {
        return { enabled: false, text: `Starts in ${hours}h` };
      }
      const days = Math.round(hours / 24);
      return { enabled: false, text: `Starts in ${days}d` };
    }
    return { enabled: false, text: 'Upcoming' };
  }, []);

  // Reset test state and load personal notes on lesson change
  useEffect(() => {
    setTestAnswers({});
    setTestSubmitted(false);
    setTestScore(null);
    setNewQuestionText('');
    setNewComment('');
    setNewRating(5);

    if (enrollment?._id && lesson?._id) {
      const savedNote = localStorage.getItem(`personal_note_${enrollment._id}_${lesson._id}`) || '';
      setPersonalNoteText(savedNote);
    }
  }, [lesson?._id, enrollment?._id]);

  const handleSavePersonalNote = () => {
    if (!enrollment?._id || !lesson?._id) return;
    localStorage.setItem(`personal_note_${enrollment._id}_${lesson._id}`, personalNoteText);
    toast.success('Personal note saved to browser storage ✓');
  };

  const handlePostQuestion = async () => {
    if (!newQuestionText.trim()) return toast.error('Please enter a question');
    setSubmittingQA(true);
    try {
      const sectionId = activeModule?._id || course.modules?.[moduleIndex]?._id;
      const res = await addLessonQA(course._id, sectionId, lesson._id, { question: newQuestionText.trim() });
      if (res?.success && res?.course) {
        toast.success('Question posted successfully!');
        setNewQuestionText('');
        const updatedEnrollment = { ...enrollment, course: res.course };
        onProgressUpdate(updatedEnrollment);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to post question');
    } finally {
      setSubmittingQA(false);
    }
  };

  const handlePostReview = async () => {
    if (!newReview.trim()) return toast.error('Please enter a review');
    setSubmittingReview(true);
    try {
      const sectionId = activeModule?._id || course.modules?.[moduleIndex]?._id;
      const res = await addLessonReview(course._id, sectionId, lesson._id, { rating: newRating, review: newReview.trim() });
      if (res?.success && res?.course) {
        toast.success('Review submitted successfully!');
        setNewReview('');
        const updatedEnrollment = { ...enrollment, course: res.course };
        onProgressUpdate(updatedEnrollment);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Derived lesson average rating
  const lessonReviews = lesson?.reviews || [];
  const avgLessonRating = useMemo(() => {
    if (lessonReviews.length === 0) return 0;
    const total = lessonReviews.reduce((sum, r) => sum + r.rating, 0);
    return Math.round((total / lessonReviews.length) * 10) / 10;
  }, [lessonReviews]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Course
      </button>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══ LEFT: Video + Content ══ */}
        <div className="lg:col-span-2 space-y-5">

          {/* 1. VIDEO PLAYER */}
          <VideoPlayer
            videoUrl={lesson?.videoUrl}
            source={lesson?.source}
            thumbnail={course.thumbnail}
            title={lesson?.title}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            initialTime={initialTime}
          />

          {/* COURSE COMPLETION BANNER */}
          {(progress === 100 || enrollment?.isCompleted) && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-sm flex items-start gap-4 animate-fade-in mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Award className="w-6 h-6 animate-bounce" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-emerald-900">Congratulations! You've Completed the Course!</h3>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  You have successfully completed all lessons in <strong>{course.title}</strong>. A certificate of completion has been issued to your account.
                </p>
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => navigate('/student/certificates')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    View Certificates
                  </button>
                  <button
                    onClick={onBack}
                    className="px-4 py-2 bg-white text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors"
                  >
                    Back to My Learning
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. NAVIGATION BUTTONS */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => prevLesson && handleNavigate(prevLesson)}
              disabled={!prevLesson}
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-zinc-200 text-sm font-bold text-zinc-700 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Lesson
            </button>
            <button
              onClick={() => nextLesson && handleNavigate(nextLesson)}
              disabled={!nextLesson}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-primary-500/30"
            >
              Next Lesson
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3. MARK AS COMPLETED */}
          <button
            onClick={handleMarkComplete}
            disabled={isLessonCompleted || savingProgress}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all ${isLessonCompleted
                ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                : 'bg-zinc-100 text-zinc-700 hover:bg-primary-50 hover:text-primary-700'
              }`}
          >
            <CheckCircle2 className={`w-5 h-5 ${isLessonCompleted ? 'text-green-500' : 'text-zinc-400'}`} />
            {savingProgress ? 'Saving...' : isLessonCompleted ? 'Completed ✓' : 'Mark as Completed'}
          </button>

          {/* Divider */}
          <hr className="border-zinc-200" />

          {/* 4. TAB BAR */}
          <TabBar active={activeTab} onChange={setActiveTab} />

          {/* 5. LESSON CONTENT (Overview tab) */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-zinc-900 mb-4 leading-tight">
                  {String(lessonIndex + 1).padStart(2, '0')}. {lesson?.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-5">
                  {lesson?.estimatedDuration || lesson?.duration ? (
                    <span className="flex items-center gap-1.5 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <Clock className="w-4 h-4 text-primary-500" />
                      {lesson.estimatedDuration || lesson.duration} mins
                    </span>
                  ) : null}
                  {lesson?.difficultyLevel ? (
                    <span className="flex items-center gap-1.5 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <BarChart2 className="w-4 h-4 text-primary-500" />
                      {lesson.difficultyLevel}
                    </span>
                  ) : course.level ? (
                    <span className="flex items-center gap-1.5 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <BarChart2 className="w-4 h-4 text-primary-500" />
                      {course.level}
                    </span>
                  ) : null}
                  {lesson?.tags && lesson.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      {lesson.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg border border-purple-100 uppercase tracking-wide">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Overview Text/Markdown */}
                <div className="prose max-w-none text-zinc-600 leading-relaxed bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm mb-6">
                  {lesson?.overview ? (
                    <div className="whitespace-pre-wrap">{lesson.overview}</div>
                  ) : lesson?.description || course.description ? (
                    <p>{lesson?.description || course.description}</p>
                  ) : (
                    <p className="text-zinc-400 italic text-sm">No overview or description provided for this lesson.</p>
                  )}
                </div>
              </div>

              {/* 6. INFO CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Key Takeaways */}
                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-primary-500" />
                    <h3 className="font-bold text-zinc-800">Key Takeaways</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {lesson?.keyTakeaways && lesson.keyTakeaways.length > 0 ? (
                      lesson.keyTakeaways.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                          <span className="text-zinc-400 mt-0.5">•</span> {item}
                        </li>
                      ))
                    ) : course.whatYouWillLearn && course.whatYouWillLearn.length > 0 ? (
                      course.whatYouWillLearn.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                          <span className="text-zinc-400 mt-0.5">•</span> {item}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-zinc-400 italic">No takeaways defined for this lesson.</li>
                    )}
                  </ul>
                </div>

                {/* Required Tools */}
                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-5 h-5 text-primary-500" />
                    <h3 className="font-bold text-zinc-800">Required Tools</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {lesson?.requiredTools && lesson.requiredTools.length > 0 ? (
                      lesson.requiredTools.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                          <span className="text-zinc-400 mt-0.5">•</span> {item}
                        </li>
                      ))
                    ) : course.requirements && course.requirements.length > 0 ? (
                      course.requirements.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                          <span className="text-zinc-400 mt-0.5">•</span> {item}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-zinc-400 italic">No specific tools required for this lesson.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Notes tab */}
          {activeTab === 'Notes' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Read-Only Lesson Summary Notes */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary-600" /> Lesson Notes Summary
                  </h3>
                  <div className="space-y-3">
                    {lesson?.notes && lesson.notes.length > 0 ? (
                      lesson.notes.map((note, idx) => (
                        <details key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 group transition-all" open={idx === 0}>
                          <summary className="font-bold text-slate-800 text-sm cursor-pointer select-none outline-none list-none flex justify-between items-center">
                            <span>{note.title}</span>
                            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                          </summary>
                          <p className="text-xs text-slate-600 mt-3 whitespace-pre-wrap leading-relaxed border-t border-slate-200/60 pt-3">{note.content}</p>
                        </details>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-6 text-center bg-slate-50 rounded-2xl">No summary notes provided by the instructor for this lesson.</p>
                    )}
                  </div>
                </div>

                {/* Personal Notepad */}
                <div className="space-y-4 border-t md:border-t-0 md:border-l border-zinc-100 md:pl-6 pt-6 md:pt-0">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary-600" /> Personal Notebook
                  </h3>
                  <div className="space-y-3">
                    <textarea
                      rows={8}
                      placeholder="Write your notes here... They are automatically saved to your browser storage."
                      value={personalNoteText}
                      onChange={(e) => setPersonalNoteText(e.target.value)}
                      className="w-full border border-zinc-200 rounded-2xl p-4 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none min-h-[180px]"
                    />
                    <button
                      onClick={handleSavePersonalNote}
                      className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors shadow-md"
                    >
                      Save Notepad Note
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Q&A tab */}
          {activeTab === 'Q&A' && (
            <div className="space-y-6">
              {/* Question list */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {lesson?.qa && lesson.qa.length > 0 ? (
                  lesson.qa.map((qa) => (
                    <div key={qa._id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold font-mono">
                          {qa.askedBy?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-800 leading-none">{qa.askedBy?.name || 'Student'}</p>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase">{new Date(qa.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-zinc-700 pl-1">{qa.question}</p>
                      
                      {qa.answer && (
                        <div className="ml-4 pl-3 border-l-2 border-primary-500 py-1.5 space-y-1">
                          <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest leading-none">Instructor Reply:</p>
                          <p className="text-xs font-semibold text-zinc-600 bg-white p-3 rounded-xl border border-zinc-50">{qa.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-400 italic text-center py-8 bg-zinc-50 rounded-2xl border border-dashed border-zinc-100">No questions posted yet. Be the first to ask!</p>
                )}
              </div>

              {/* Ask Question Box */}
              <div className="space-y-3 pt-2 border-t border-zinc-100">
                <textarea
                  rows={3}
                  placeholder="Ask a question about this lesson... Our instructor will answer it directly."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full border border-zinc-200 rounded-2xl p-4 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none text-zinc-800"
                />
                <button
                  onClick={handlePostQuestion}
                  disabled={submittingQA || !newQuestionText.trim()}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {submittingQA ? 'Posting...' : <><Send className="w-4 h-4" /> Post Question</>}
                </button>
              </div>
            </div>
          )}

          {/* Resources tab */}
          {activeTab === 'Resources' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Paperclip className="w-4 h-4 text-primary-600" /> Lesson Resource Files
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lesson?.resources && lesson.resources.length > 0 ? (
                  lesson.resources.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-primary-200 hover:shadow-sm transition-all duration-300">
                      <div className="flex items-center gap-3 truncate">
                        <span className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg font-black text-[9px] text-slate-400 uppercase select-none shrink-0">{item.type}</span>
                        <div className="truncate">
                          <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
                          <a href={item.url} target="_blank" rel="noreferrer" className="text-[10px] text-primary-600 font-bold hover:underline truncate">View / Download Link</a>
                        </div>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-white hover:bg-primary-50 text-slate-400 hover:text-primary-600 border border-slate-100 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="col-span-2 text-sm text-zinc-400 italic text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-100">No resources attached to this lesson by the instructor.</p>
                )}
              </div>
            </div>
          )}

          {/* Tests tab */}
          {activeTab === 'Tests' && (
            <div className="space-y-6">
              {lesson?.tests && lesson.tests.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Lesson Quiz Assessment</h3>
                      <p className="text-xs text-slate-500">Answer these MCQ questions to check your knowledge.</p>
                    </div>
                    {testSubmitted && (
                      <span className={`px-4 py-2 rounded-2xl font-black text-sm ${testScore / lesson.tests.length >= 0.75 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                        Score: {testScore} / {lesson.tests.length} ({Math.round((testScore / lesson.tests.length) * 100)}%)
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-5">
                    {lesson.tests.map((item, idx) => {
                      const isCorrectAnswerSelected = testAnswers[idx] === item.correctAnswer;
                      return (
                        <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                          <h4 className="font-bold text-slate-800 text-sm">Question {idx + 1}: {item.question}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                            {item.options.map((opt, oIdx) => {
                              const isSelected = testAnswers[idx] === opt;
                              const isCorrect = opt === item.correctAnswer;
                              
                              let optionClass = "border border-slate-200 bg-white hover:bg-slate-100";
                              if (testSubmitted) {
                                if (isCorrect) {
                                  optionClass = "border-2 border-emerald-500 bg-emerald-50 text-emerald-700";
                                } else if (isSelected) {
                                  optionClass = "border-2 border-rose-500 bg-rose-50 text-rose-700";
                                } else {
                                  optionClass = "border border-slate-100 bg-white opacity-60";
                                }
                              } else if (isSelected) {
                                optionClass = "border-2 border-primary-500 bg-primary-50 text-primary-700";
                              }

                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  disabled={testSubmitted}
                                  onClick={() => setTestAnswers({ ...testAnswers, [idx]: opt })}
                                  className={`px-5 py-3 rounded-xl text-left text-xs font-semibold transition-all duration-200 flex items-center justify-between ${optionClass}`}
                                >
                                  <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                  {isSelected && <span className="text-[9px] uppercase font-black tracking-widest pl-1 shrink-0">Selected</span>}
                                </button>
                              );
                            })}
                          </div>
                          {testSubmitted && item.explanation && (
                            <div className="p-4 bg-white rounded-xl border border-slate-100 text-xs text-slate-500 mt-2">
                              <span className="font-bold text-slate-700 block mb-1">Explanation:</span>
                              <p className="italic leading-relaxed">{item.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    {!testSubmitted ? (
                      <button
                        onClick={() => {
                          let score = 0;
                          lesson.tests.forEach((t, i) => {
                            if (testAnswers[i] === t.correctAnswer) score++;
                          });
                          setTestScore(score);
                          setTestSubmitted(true);
                          toast.success(`Quiz completed! Score: ${score}/${lesson.tests.length}`);
                        }}
                        disabled={Object.keys(testAnswers).length < lesson.tests.length}
                        className="flex-1 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setTestAnswers({});
                          setTestSubmitted(false);
                          setTestScore(null);
                        }}
                        className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                      >
                        Retake Quiz
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-400 italic text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-100">No tests or quizzes configured for this lesson.</p>
              )}
            </div>
          )}

          {/* Reviews tab */}
          {activeTab === 'Reviews' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Rating summaries */}
                <div className="md:col-span-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Average Lesson Rating</span>
                  <h4 className="text-4xl font-black text-primary-600 mb-1">{avgLessonRating}</h4>
                  <div className="flex justify-center items-center gap-0.5 text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(avgLessonRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-bold block">{lessonReviews.length} Student Ratings</span>
                </div>

                {/* Right Side: Add review form */}
                <div className="md:col-span-8 p-5 bg-white border border-slate-100 rounded-2xl space-y-4 shadow-sm">
                  <h5 className="text-xs font-black text-slate-700 uppercase tracking-widest">Submit Lesson Rating & Review</h5>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase mr-2">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star className={`w-6 h-6 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <textarea
                      rows="2"
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder="Share your thoughts about this specific lesson..."
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-semibold resize-none text-slate-800 placeholder:text-slate-300 focus:outline-none"
                    />
                    <button
                      onClick={handlePostReview}
                      disabled={submittingReview || !newReview.trim()}
                      className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                    >
                      {submittingReview ? 'Saving...' : <><Star className="w-3.5 h-3.5 fill-white text-white" /> Submit Review</>}
                    </button>
                  </div>
                </div>

              </div>

              {/* Review comments list */}
              <div className="space-y-3 border-t border-zinc-100 pt-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Student Reviews ({lessonReviews.length})</label>
                <div className="space-y-3.5">
                  {lessonReviews.map((rev) => (
                    <div key={rev._id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold font-mono shrink-0">
                            {rev.user?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-none">{rev.user?.name || 'Student'}</p>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-0.5 text-amber-400 shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 pl-1 leading-relaxed">{rev.review || rev.comment || 'No written feedback provided'}</p>
                    </div>
                  ))}
                  {lessonReviews.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 rounded-2xl">No reviews posted for this lesson yet.</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ══ RIGHT: Course Sidebar ══ */}
        <div className="space-y-5">

          {/* 1. INSTRUCTOR CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                {course.instructor?.name?.charAt(0) || 'I'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-zinc-900 text-sm truncate">{course.instructor?.name || 'Instructor'}</p>
                <p className="text-xs text-zinc-400 truncate">Expert Instructor, Zinda Learn</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-zinc-900 mb-3 leading-snug">{course.title}</p>
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
              <span className="font-bold text-zinc-700">Course Progress</span>
              <span className="font-black text-primary-600 text-base">{progress}%</span>
            </div>
            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 2. COURSE CONTENT */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900">Course Content</h3>
              <span className="text-xs text-zinc-400 font-semibold">
                {completedCount} / {totalLessons} Lessons
              </span>
            </div>
            <div className="px-4 py-2 max-h-[480px] overflow-y-auto divide-y divide-zinc-100">
              {course.modules?.map((mod, mIdx) => (
                <ModuleRow
                  key={mod._id || mIdx}
                  module={mod}
                  moduleIndex={mIdx}
                  activeLesson={{ moduleIndex, lessonIndex }}
                  completedLessons={completedLessons}
                  onLessonClick={onLessonClick}
                />
              ))}
            </div>
          </div>

          {/* 3. LIVE SESSION CARD */}
          {loadingLiveClasses ? (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-5 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/6"></div>
              </div>
              <div className="h-24 bg-slate-100 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            </div>
          ) : currentLiveClass ? (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800">Live Session</span>
                {currentLiveClass.status === 'live' ? (
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" /> Live
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-purple-200">
                    Upcoming
                  </span>
                )}
              </div>
              
              {/* Thumbnail */}
              <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img 
                  src={currentLiveClass.thumbnail || course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"} 
                  alt={currentLiveClass.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-1.5">
                <h4 className="font-bold text-zinc-900 text-sm leading-snug line-clamp-1">{currentLiveClass.title}</h4>
                <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">{currentLiveClass.description}</p>
              </div>
              
              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {currentLiveClass.instructor?.name?.charAt(0) || 'I'}
                  </div>
                  <span className="font-semibold text-zinc-700">{currentLiveClass.instructor?.name || 'Instructor'}</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">
                  {new Date(currentLiveClass.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(currentLiveClass.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span className="font-bold">{currentLiveClass.enrolledStudents?.length || course.totalStudents || 0} Enrolled Students</span>
              </div>
              
              {(() => {
                const btn = getJoinButtonState(currentLiveClass);
                return (
                  <button
                    onClick={() => btn.enabled && window.open(currentLiveClass.meetingLink, '_blank')}
                    disabled={!btn.enabled}
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                      btn.enabled 
                        ? 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95' 
                        : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    {btn.text}
                  </button>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-5 text-center py-8">
              <Video className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-zinc-500 text-xs font-bold">No live classes scheduled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
