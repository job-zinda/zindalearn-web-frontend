import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  Link as LinkIcon,
  FileText,
  BookOpen,
  Image as ImageIcon,
  Timer
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import liveClassService from '../services/liveClassService';
import { getInstructorCourses } from '../../../services/instructorService';

/* ─── Shared form field components ──────────────────────────── */
const Field = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
      {label}
      {required && <span className="text-violet-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{hint}</p>}
  </div>
);

const inputCls =
  'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-colors';

/* ─── Section divider ────────────────────────────────────────── */
const Section = ({ title, children }) => (
  <div>
    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">{title}</p>
    <div className="space-y-4">{children}</div>
  </div>
);

/* ─── Page ───────────────────────────────────────────────────── */
const CreateLiveClass = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    meetingLink: '',
    scheduledDate: '',
    startTime: '',
    duration: 60,
    thumbnail: ''
  });

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const response = await getInstructorCourses();
      setCourses(response.courses || []);
    } catch {
      toast.error('Failed to fetch courses');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId || !formData.meetingLink || !formData.scheduledDate || !formData.startTime) {
      return toast.error('Please fill in all required fields');
    }
    if (new Date(formData.scheduledDate) < new Date().setHours(0, 0, 0, 0)) {
      return toast.error('Scheduled date cannot be in the past');
    }
    setLoading(true);
    try {
      const response = await liveClassService.createLiveClass(formData);
      if (response.success) {
        toast.success('Session scheduled');
        navigate('/instructor/live-classes');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create live class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Back nav ── */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-7 font-medium"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* ── Page header ── */}
      <div className="mb-7">
        <h1 className="text-lg font-bold text-slate-900">Schedule a session</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Set up a new live class for your students.
        </p>
      </div>

      {/* ── Form card ── */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">

        <div className="p-6 space-y-7">

          {/* — Basic info — */}
          <Section title="Session info">
            <Field label="Class title" required>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Week 4 Q&A — React Hooks Deep Dive"
                className={inputCls}
                required
              />
            </Field>

            <Field label="Course" required>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className={inputCls}
                required
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </Field>

            <Field
              label="Description"
              required
              hint="What will students learn in this session? Keep it specific."
            >
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Topics covered, prerequisites, what to bring…"
                rows={3}
                className={inputCls}
                required
              />
            </Field>
          </Section>

          {/* — Schedule — */}
          <Section title="Date & time">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date" required>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className={inputCls}
                  required
                />
              </Field>
              <Field label="Start time" required>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={inputCls}
                  required
                />
              </Field>
            </div>

            <Field label="Duration (minutes)" required>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="15"
                  max="360"
                  className={`${inputCls} w-32`}
                  required
                />
                <span className="text-xs text-slate-400 font-medium">minutes</span>
              </div>
            </Field>
          </Section>

          {/* — Links — */}
          <Section title="Meeting">
            <Field
              label="Meeting link"
              required
              hint="Paste your Zoom, Google Meet, or Microsoft Teams invite link."
            >
              <input
                type="url"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleChange}
                placeholder="https://meet.google.com/xxx-yyyy-zzz"
                className={inputCls}
                required
              />
            </Field>

            <Field
              label="Thumbnail URL"
              hint="Optional. A cover image makes your session easier to identify."
            >
              <input
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="https://example.com/thumbnail.jpg"
                className={inputCls}
              />
            </Field>
          </Section>
        </div>

        {/* ── Footer actions ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Calendar size={15} />
                Schedule session
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLiveClass;
