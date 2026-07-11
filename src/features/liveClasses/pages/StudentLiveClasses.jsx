import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Calendar,
  Clock,
  User,
  Play,
  BookOpen,
  ArrowRight,
  Wifi
} from 'lucide-react';
import { useLiveClasses } from '../hooks/useLiveClasses';

/* ─── Helpers ────────────────────────────────────────────────── */
const fmt = (raw) =>
  new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/* ─── Loading skeleton ───────────────────────────────────────── */
const Skeleton = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-violet-100 border-t-violet-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Wifi size={14} className="text-violet-500" />
        </div>
      </div>
      <span className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
        Loading sessions
      </span>
    </div>
  </div>
);

/* ─── Live pill ──────────────────────────────────────────────── */
const LivePill = () => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold tracking-wider uppercase">
    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping absolute" />
    <span className="w-1.5 h-1.5 rounded-full bg-white relative" />
    Live
  </span>
);

/* ─── Hero banner ────────────────────────────────────────────── */
const HeroBanner = ({ liveCount, upcomingCount }) => (
  <div className="relative bg-violet-950 rounded-2xl overflow-hidden px-7 py-8 md:px-10 md:py-9">
    {/* subtle radial glow — one, not three */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.25),transparent_65%)]" />

    <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="max-w-lg">
        {liveCount > 0 && (
          <div className="mb-3">
            <LivePill />
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug tracking-tight">
          Live Classes
        </h1>
        <p className="mt-2 text-sm text-violet-300/80 leading-relaxed max-w-sm">
          Join your instructor in real time — ask questions, get feedback, and learn faster.
        </p>
      </div>

      {/* inline stats — compact, right-aligned */}
      <div className="flex items-center gap-6 flex-shrink-0">
        <div className="text-right">
          <div className="text-2xl font-bold text-white tabular-nums">{liveCount}</div>
          <div className="text-[10px] font-medium text-violet-400 uppercase tracking-widest mt-0.5">Active</div>
        </div>
        <div className="w-px h-8 bg-violet-800" />
        <div className="text-right">
          <div className="text-2xl font-bold text-white tabular-nums">{upcomingCount}</div>
          <div className="text-[10px] font-medium text-violet-400 uppercase tracking-widest mt-0.5">Upcoming</div>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Live-now strip (horizontal scroll, not a 3-col grid) ──── */
const LiveNowStrip = ({ classes }) => (
  <section>
    <div className="flex items-center gap-2 mb-4">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      <h2 className="text-sm font-semibold text-slate-800">Streaming now</h2>
      <span className="ml-auto text-xs text-slate-400">{classes.length} session{classes.length !== 1 ? 's' : ''}</span>
    </div>

    {/* horizontal scroll row — visually distinct from upcoming grid */}
    <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {classes.map((c) => (
        <LiveNowCard key={c._id} liveClass={c} />
      ))}
    </div>
  </section>
);

/* ─── Live-now card (wide, short — different shape from upcoming) */
const LiveNowCard = ({ liveClass }) => (
  <Link
    to={`/student/live-classes/${liveClass._id}`}
    className="flex-shrink-0 w-72 bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-md hover:shadow-violet-100 transition-all group"
  >
    {/* thumbnail — shorter since it's horizontal */}
    <div className="relative h-36 bg-slate-100 overflow-hidden">
      {liveClass.thumbnail ? (
        <img
          src={liveClass.thumbnail}
          alt={liveClass.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
          <Video className="text-white/30" size={32} strokeWidth={1.5} />
        </div>
      )}
      {/* red overlay tint for live state */}
      <div className="absolute inset-0 bg-red-900/10" />
      <div className="absolute top-3 left-3">
        <LivePill />
      </div>
    </div>

    <div className="p-4">
      <div className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider mb-1 truncate">
        {liveClass.course?.title}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 mb-3 group-hover:text-violet-700 transition-colors">
        {liveClass.title}
      </h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-violet-100 overflow-hidden flex items-center justify-center">
            {liveClass.instructor?.avatar ? (
              <img src={liveClass.instructor.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={11} className="text-violet-400" />
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-medium truncate max-w-[90px]">
            {liveClass.instructor?.name}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-violet-600 px-2.5 py-1 rounded-lg">
          <Play size={9} fill="white" /> Join
        </span>
      </div>
    </div>
  </Link>
);

/* ─── Filter tabs ────────────────────────────────────────────── */
const FilterTabs = ({ active, onChange }) => {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'ended', label: 'Completed' },
  ];
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
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

/* ─── Upcoming class card ────────────────────────────────────── */
const UpcomingCard = ({ liveClass }) => {
  const isUpcoming = liveClass.status === 'upcoming';
  const isEnded = liveClass.status === 'ended';

  return (
    <Link
      to={`/student/live-classes/${liveClass._id}`}
      className="group flex flex-col bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-md hover:shadow-violet-100/60 transition-all"
    >
      {/* thumbnail */}
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {liveClass.thumbnail ? (
          <img
            src={liveClass.thumbnail}
            alt={liveClass.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <Video className="text-slate-300" size={36} strokeWidth={1.5} />
          </div>
        )}

        {/* status chip — top-left only */}
        <div className="absolute top-3 left-3">
          {isEnded ? (
            <span className="px-2.5 py-1 rounded-full bg-slate-700/80 backdrop-blur-sm text-white text-[10px] font-semibold">
              Completed
            </span>
          ) : isUpcoming ? (
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-violet-700 text-[10px] font-semibold border border-violet-100">
              Upcoming
            </span>
          ) : null}
        </div>
      </div>

      {/* content */}
      <div className="flex flex-col flex-1 p-5">
        {/* course name */}
        <div className="flex items-center gap-1.5 mb-2">
          <BookOpen size={11} className="text-slate-400 flex-shrink-0" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
            {liveClass.course?.title}
          </span>
        </div>

        {/* title */}
        <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-4 group-hover:text-violet-700 transition-colors">
          {liveClass.title}
        </h3>

        {/* date + time — single row, natural text size */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-auto mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-slate-400" />
            {fmt(liveClass.scheduledDateStr || liveClass.startTime)}
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-400" />
            {liveClass.startTimeStr}
          </span>
        </div>

        {/* instructor row + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-violet-50 border border-violet-100 overflow-hidden flex items-center justify-center">
              {liveClass.instructor?.avatar ? (
                <img src={liveClass.instructor.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={12} className="text-violet-300" />
              )}
            </div>
            <span className="text-[11px] font-medium text-slate-600 truncate max-w-[110px]">
              {liveClass.instructor?.name}
            </span>
          </div>

          {isEnded ? (
            <span className="text-[10px] text-slate-400 font-medium">View recap</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 group-hover:gap-2 transition-all">
              Details <ArrowRight size={11} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

/* ─── Empty state ────────────────────────────────────────────── */
const EmptyState = ({ filter }) => (
  <div className="text-center py-16 px-8">
    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
      <Calendar size={22} className="text-slate-300" />
    </div>
    <p className="text-sm font-semibold text-slate-700 mb-1">No sessions found</p>
    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
      {filter === 'ended'
        ? 'No completed sessions yet for your enrolled courses.'
        : "There aren't any live classes scheduled right now. Check back soon."}
    </p>
  </div>
);

/* ─── Page ───────────────────────────────────────────────────── */
const StudentLiveClasses = () => {
  const { liveClasses, loading } = useLiveClasses();
  const [filter, setFilter] = useState('all');

  if (loading) return <Skeleton />;

  const liveNow = liveClasses.filter((c) => c.status === 'live');
  const rest = liveClasses.filter((c) => c.status !== 'live');
  const filtered = rest.filter((c) => filter === 'all' || c.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero */}
      <HeroBanner liveCount={liveNow.length} upcomingCount={liveClasses.filter((c) => c.status === 'upcoming').length} />

      {/* Live now — horizontal strip, only when something is live */}
      {liveNow.length > 0 && <LiveNowStrip classes={liveNow} />}

      {/* Scheduled / Upcoming / Ended section */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-800">Schedule</h2>
          <FilterTabs active={filter} onChange={setFilter} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <UpcomingCard key={c._id} liveClass={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentLiveClasses;
