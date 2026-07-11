import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Video,
  ArrowLeft,
  Play,
  AlertCircle,
  CheckCircle2,
  Lock,
  BookOpen,
  Timer,
  Wifi
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import liveClassService from '../services/liveClassService';

/* ─── Helpers ────────────────────────────────────────────────── */
const pad = (n) => n.toString().padStart(2, '0');

/* ─── Countdown unit ─────────────────────────────────────────── */
const CountUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center">
      <span className="text-xl font-bold text-white tabular-nums font-mono">{pad(value)}</span>
    </div>
    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1.5">{label}</span>
  </div>
);

/* ─── Status config ──────────────────────────────────────────── */
const STATUS = {
  live: { label: 'Live now', badge: 'bg-red-500 text-white', dot: true },
  upcoming: { label: 'Upcoming', badge: 'bg-violet-100 text-violet-700', dot: false },
  ended: { label: 'Completed', badge: 'bg-emerald-100 text-emerald-700', dot: false },
  cancelled: { label: 'Cancelled', badge: 'bg-slate-100 text-slate-500', dot: false },
};

/* ─── Page ───────────────────────────────────────────────────── */
const LiveClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => { fetchClassDetails(); }, [id]);

  useEffect(() => {
    if (!liveClass || liveClass.status !== 'upcoming') return;
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [liveClass]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await liveClassService.getLiveClassById(id);
      if (response.success) {
        setLiveClass(response.data);
        checkJoinStatus(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch details');
      navigate('/student/live-classes');
    } finally {
      setLoading(false);
    }
  };

  const checkJoinStatus = (data) => {
    if (data.status === 'live') { setCanJoin(true); return; }
    if (data.status === 'ended' || data.status === 'cancelled') { setCanJoin(false); return; }
    const now = new Date();
    const t = new Date(data.scheduledDateStr || data.startTime);
    const [h, m] = data.startTimeStr ? data.startTimeStr.split(':') : [0, 0];
    t.setHours(parseInt(h), parseInt(m), 0, 0);
    setCanJoin((t - now) / 60000 <= 10);
  };

  const calculateTimeLeft = () => {
    if (!liveClass) return;
    const now = new Date();
    const t = new Date(liveClass.scheduledDateStr || liveClass.startTime);
    const [h, m] = liveClass.startTimeStr ? liveClass.startTimeStr.split(':') : [0, 0];
    t.setHours(parseInt(h), parseInt(m), 0, 0);
    const diff = t - now;
    if (diff > 0) {
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
      if (diff / 60000 <= 10 && !canJoin) setCanJoin(true);
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      if (liveClass.status === 'upcoming') setCanJoin(true);
    }
  };

  const handleJoin = async () => {
    try {
      setJoining(true);
      const response = await liveClassService.joinLiveClass(id);
      if (response.success) {
        toast.success('Opening meeting…');
        window.open(response.data.meetingLink, '_blank');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join class');
    } finally {
      setJoining(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-violet-100 border-t-violet-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Wifi size={14} className="text-violet-500" />
          </div>
        </div>
      </div>
    );
  }

  if (!liveClass) return null;

  const isLive = liveClass.status === 'live';
  const isEnded = liveClass.status === 'ended';
  const isUpcoming = liveClass.status === 'upcoming';
  const sc = STATUS[liveClass.status] || STATUS.upcoming;

  const formattedDate = new Date(
    liveClass.scheduledDateStr || liveClass.startTime
  ).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Back nav ── */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-7 font-medium"
      >
        <ArrowLeft size={16} /> Back to Live Classes
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

        {/* ──────────── LEFT COLUMN ──────────── */}
        <div className="space-y-4">

          {/* ── Hero thumbnail + status badge ── */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-100">
            {liveClass.thumbnail ? (
              <img
                src={liveClass.thumbnail}
                alt={liveClass.title}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div
                className={`w-full h-64 flex items-center justify-center ${
                  isLive
                    ? 'bg-gradient-to-br from-violet-700 to-indigo-800'
                    : 'bg-gradient-to-br from-slate-100 to-slate-200'
                }`}
              >
                <Video
                  className={isLive ? 'text-white/20' : 'text-slate-300'}
                  size={52}
                  strokeWidth={1}
                />
              </div>
            )}

            {/* status badge — top left */}
            <div className="absolute top-4 left-4">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${sc.badge}`}
              >
                {sc.dot && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                )}
                {sc.label}
              </span>
            </div>
          </div>

          {/* ── Course label + title ── */}
          <div>
            {liveClass.course?.title && (
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen size={12} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {liveClass.course.title}
                </span>
              </div>
            )}
            <h1 className="text-xl font-bold text-slate-900 leading-snug">
              {liveClass.title}
            </h1>
          </div>

          {/* ── Session meta — compact inline grid ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: <Calendar size={14} className="text-slate-400" />,
                label: 'Date',
                value: new Date(liveClass.scheduledDateStr || liveClass.startTime).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                }),
              },
              {
                icon: <Clock size={14} className="text-slate-400" />,
                label: 'Start time',
                value: liveClass.startTimeStr || '—',
              },
              {
                icon: <Timer size={14} className="text-slate-400" />,
                label: 'Duration',
                value: liveClass.duration ? `${liveClass.duration} min` : '—',
              },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-white border border-slate-100 rounded-xl p-3.5"
              >
                <div className="flex items-center gap-1.5 mb-1.5">{m.icon}
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {m.label}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-800">{m.value}</div>
              </div>
            ))}
          </div>

          {/* ── Description ── */}
          {liveClass.description && (
            <div className="bg-white border border-slate-100 rounded-xl p-5">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">About this session</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{liveClass.description}</p>
            </div>
          )}

          {/* ── Instructor strip ── */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-violet-100 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0">
              {liveClass.instructor?.avatar ? (
                <img
                  src={liveClass.instructor.avatar}
                  alt={liveClass.instructor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-violet-300" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                Instructor
              </div>
              <div className="text-sm font-semibold text-slate-900 truncate">
                {liveClass.instructor?.name}
              </div>
              {liveClass.instructor?.bio && (
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {liveClass.instructor.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ──────────── RIGHT COLUMN (sidebar) ──────────── */}
        <div className="space-y-4">

          {/* ── Join card ── */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 sticky top-6">

            {/* live state */}
            {isLive && (
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-50">
                <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Play size={16} fill="#ef4444" className="text-red-500 ml-0.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Session is live</p>
                  <p className="text-xs text-slate-500">Join now to participate</p>
                </div>
              </div>
            )}

            {/* upcoming countdown */}
            {isUpcoming && (
              <div className="mb-5 pb-5 border-b border-slate-50">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Starts in
                </p>
                <div className="flex items-start justify-center gap-3">
                  {timeLeft.days > 0 && <CountUnit value={timeLeft.days} label="Days" />}
                  <CountUnit value={timeLeft.hours} label="Hrs" />
                  <CountUnit value={timeLeft.minutes} label="Min" />
                  <CountUnit value={timeLeft.seconds} label="Sec" />
                </div>
                {!canJoin && (
                  <p className="text-[10px] text-slate-400 text-center mt-4 leading-relaxed">
                    Join link unlocks 10 minutes before start
                  </p>
                )}
              </div>
            )}

            {/* ended state */}
            {isEnded && (
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-50">
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Session completed</p>
                  <p className="text-xs text-slate-500">Check recordings if available</p>
                </div>
              </div>
            )}

            {/* join button */}
            <button
              onClick={handleJoin}
              disabled={!canJoin || joining}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                canJoin && !joining
                  ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {joining ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : canJoin ? (
                <>
                  <Video size={16} />
                  Join live class
                </>
              ) : (
                <>
                  <Lock size={15} />
                  Link locked
                </>
              )}
            </button>
          </div>

          {/* ── Session rules card ── */}
          <div className="bg-slate-900 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={14} className="text-amber-400" />
              <h4 className="text-xs font-semibold text-white">Session rules</h4>
            </div>
            <ul className="space-y-2.5">
              {[
                'Must be enrolled in the course',
                'Join up to 10 minutes before start',
                'Stay active for attendance tracking',
              ].map((rule) => (
                <li key={rule} className="flex items-start gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-slate-400 leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveClassDetail;
