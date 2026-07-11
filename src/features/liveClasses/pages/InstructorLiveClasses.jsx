import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Video,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Play,
  XCircle,
  ExternalLink,
  Radio,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import liveClassService from '../services/liveClassService';

/* ─── Skeleton loader ────────────────────────────────────────── */
const Skeleton = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-violet-100 border-t-violet-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Radio size={14} className="text-violet-500" />
        </div>
      </div>
      <span className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
        Loading sessions
      </span>
    </div>
  </div>
);

/* ─── Status config map ──────────────────────────────────────── */
const STATUS = {
  upcoming: {
    label: 'Upcoming',
    dot: 'bg-amber-400',
    badge: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  live: {
    label: 'Live',
    dot: 'bg-red-500 animate-ping',
    badge: 'text-red-700 bg-red-50 border-red-200',
  },
  ended: {
    label: 'Completed',
    dot: 'bg-emerald-400',
    badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    dot: 'bg-slate-400',
    badge: 'text-slate-500 bg-slate-50 border-slate-200',
  },
};

/* ─── Stat bar — horizontal row, not cards ───────────────────── */
const StatBar = ({ stats }) => (
  <div className="flex items-center gap-0 bg-white border border-slate-100 rounded-xl overflow-hidden divide-x divide-slate-100">
    {[
      { label: 'Upcoming', value: stats.upcoming, color: 'text-amber-600' },
      { label: 'Live now', value: stats.live, color: 'text-red-600', pulse: true },
      { label: 'Completed', value: stats.completed, color: 'text-emerald-600' },
      { label: 'Total', value: stats.total, color: 'text-slate-700' },
    ].map((s) => (
      <div key={s.label} className="flex-1 px-5 py-3.5 min-w-0">
        <div className={`text-xl font-bold tabular-nums ${s.color} ${s.pulse && s.value > 0 ? 'animate-pulse' : ''}`}>
          {s.value}
        </div>
        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5 truncate">
          {s.label}
        </div>
      </div>
    ))}
  </div>
);

/* ─── Filter tabs ────────────────────────────────────────────── */
const FilterTabs = ({ active, onChange, counts }) => {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'live', label: 'Live' },
    { id: 'ended', label: 'Completed' },
  ];
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
            active === t.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

/* ─── Actions menu (replaces hover-only trash) ───────────────── */
const ActionMenu = ({ liveClass, onStart, onEnd, onDelete }) => {
  const [open, setOpen] = useState(false);

  const handleAction = (fn) => {
    setOpen(false);
    fn();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/60 py-1.5 w-36 text-xs font-medium">
            {liveClass.status === 'upcoming' && (
              <>
                <Link
                  to={`/instructor/live-classes/edit/${liveClass._id}`}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-slate-600 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  <Edit3 size={13} /> Edit
                </Link>
                <button
                  onClick={() => handleAction(onStart)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-violet-600 hover:bg-violet-50"
                >
                  <Play size={13} /> Start now
                </button>
              </>
            )}
            {liveClass.status === 'live' && (
              <button
                onClick={() => handleAction(onEnd)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-600 hover:bg-slate-50"
              >
                <XCircle size={13} /> End session
              </button>
            )}
            <button
              onClick={() => handleAction(onDelete)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-500 hover:bg-red-50"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Instructor live class card — list-style for instructor view */
const LiveClassRow = ({ liveClass, onStart, onEnd, onDelete }) => {
  const s = STATUS[liveClass.status] || STATUS.upcoming;
  const isLive = liveClass.status === 'live';
  const isUpcoming = liveClass.status === 'upcoming';
  const isEnded = liveClass.status === 'ended';

  const formattedDate = new Date(
    liveClass.scheduledDateStr || liveClass.startTime
  ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      className={`group bg-white border rounded-xl overflow-hidden transition-all ${
        isLive
          ? 'border-red-200 shadow-sm shadow-red-100'
          : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-0">
        {/* thumbnail strip — narrow vertical band */}
        <div className="relative w-28 sm:w-36 flex-shrink-0 self-stretch bg-slate-100 overflow-hidden">
          {liveClass.thumbnail ? (
            <img
              src={liveClass.thumbnail}
              alt={liveClass.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${
                isLive
                  ? 'bg-gradient-to-b from-violet-600 to-indigo-700'
                  : 'bg-gradient-to-b from-slate-100 to-slate-200'
              }`}
            >
              <Video
                className={isLive ? 'text-white/40' : 'text-slate-300'}
                size={24}
                strokeWidth={1.5}
              />
            </div>
          )}
          {isLive && (
            <div className="absolute inset-0 bg-red-900/20" />
          )}
        </div>

        {/* content */}
        <div className="flex-1 min-w-0 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              {/* status + course on same line */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${s.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
                {liveClass.course?.title && (
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[160px]">
                    {liveClass.course.title}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 leading-snug">
                {liveClass.title}
              </h3>
            </div>

            <ActionMenu
              liveClass={liveClass}
              onStart={onStart}
              onEnd={onEnd}
              onDelete={onDelete}
            />
          </div>

          {/* date + time row */}
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-400" />
              {formattedDate}
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-slate-400" />
              {liveClass.startTimeStr}
              {liveClass.duration && (
                <span className="text-slate-400">· {liveClass.duration} min</span>
              )}
            </span>
          </div>

          {/* primary actions — inline, not oversized */}
          <div className="flex items-center gap-2 flex-wrap">
            {isUpcoming && (
              <button
                onClick={onStart}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors"
              >
                <Play size={12} fill="white" /> Start class
              </button>
            )}
            {isLive && (
              <>
                <a
                  href={liveClass.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors"
                >
                  <ExternalLink size={12} /> Open meeting
                </a>
                <button
                  onClick={onEnd}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  <XCircle size={12} /> End session
                </button>
              </>
            )}
            {isEnded && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <CheckCircle2 size={13} className="text-emerald-400" /> Session completed
              </span>
            )}

            {/* edit link — text only, doesn't compete with primary CTA */}
            {isUpcoming && (
              <Link
                to={`/instructor/live-classes/edit/${liveClass._id}`}
                className="ml-auto text-xs text-slate-400 hover:text-violet-600 transition-colors font-medium"
              >
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Stat cards (old 3-card grid) replaced by StatBar above.
       Keeping StatCard only if needed somewhere else. */

/* ─── Empty state ────────────────────────────────────────────── */
const EmptyState = () => (
  <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-4">
      <Video size={18} className="text-slate-300" />
    </div>
    <p className="text-sm font-semibold text-slate-700 mb-1">No sessions yet</p>
    <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto leading-relaxed">
      Schedule your first live class and start teaching interactively.
    </p>
    <Link
      to="/instructor/live-classes/create"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700"
    >
      <Plus size={13} strokeWidth={2.5} /> Schedule a session
    </Link>
  </div>
);

/* ─── Page ───────────────────────────────────────────────────── */
const InstructorLiveClasses = () => {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchLiveClasses(); }, []);

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      const response = await liveClassService.getInstructorLiveClasses();
      if (response.success) setLiveClasses(response.data);
    } catch (error) {
      toast.error('Failed to fetch live classes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartClass = async (id) => {
    try {
      const r = await liveClassService.startLiveClass(id);
      if (r.success) { toast.success('Class started'); fetchLiveClasses(); }
    } catch { toast.error('Failed to start class'); }
  };

  const handleEndClass = async (id) => {
    try {
      const r = await liveClassService.endLiveClass(id);
      if (r.success) { toast.success('Class ended'); fetchLiveClasses(); }
    } catch { toast.error('Failed to end class'); }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    try {
      const r = await liveClassService.deleteLiveClass(id);
      if (r.success) { toast.success('Deleted'); fetchLiveClasses(); }
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <Skeleton />;

  const stats = {
    total: liveClasses.length,
    upcoming: liveClasses.filter((c) => c.status === 'upcoming').length,
    live: liveClasses.filter((c) => c.status === 'live').length,
    completed: liveClasses.filter((c) => c.status === 'ended').length,
  };

  const filtered = liveClasses.filter(
    (c) => filter === 'all' || c.status === filter
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Live Classes</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and schedule interactive sessions with your students.
          </p>
        </div>
        <Link
          to="/instructor/live-classes/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Schedule session</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* ── Stats bar ── */}
      <StatBar stats={stats} />

      {/* ── Filter row ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <FilterTabs active={filter} onChange={setFilter} />
        <span className="text-xs text-slate-400 font-medium">
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {filtered.map((lc) => (
            <LiveClassRow
              key={lc._id}
              liveClass={lc}
              onStart={() => handleStartClass(lc._id)}
              onEnd={() => handleEndClass(lc._id)}
              onDelete={() => handleDeleteClass(lc._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorLiveClasses;
