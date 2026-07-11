import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Save,
  Wifi
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import liveClassService from '../services/liveClassService';
import { getInstructorCourses } from '../../../services/instructorService';

/* ─── Shared form primitives (same design tokens as Create) ─── */
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

const Section = ({ title, children }) => (
  <div>
    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">{title}</p>
    <div className="space-y-4">{children}</div>
  </div>
);

/* ─── Page ───────────────────────────────────────────────────── */
const EditLiveClass = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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

  useEffect(() => { fetchInitialData(); }, [id]);

  const fetchInitialData = async () => {
    try {
      setFetching(true);
      const [coursesRes, classRes] = await Promise.all([
        getInstructorCourses(),
        liveClassService.getLiveClassById(id)
      ]);
      setCourses(coursesRes.courses || []);
      if (classRes.success) {
        const lc = classRes.data;
        setFormData({
          title: lc.title,
          description: lc.description,
          courseId: lc.course?._id || lc.course,
          meetingLink: lc.meetingLink,
          scheduledDate: new Date(lc.scheduledDate).toISOString().split('T')[0],
          startTime: lc.startTime,
          duration: lc.duration,
          thumbnail: lc.thumbnail || ''
        });
      }
    } catch {
      toast.error('Failed to fetch class details');
      navigate('/instructor/live-classes');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await liveClassService.updateLiveClass(id, formData);
      if (response.success) {
        toast.success('Session updated');
        navigate('/instructor/live-classes');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  /* ── Fetching state ── */
  if (fetching) {
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
        <h1 className="text-lg font-bold text-slate-900">Edit session</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Update the details of this live class. Students will see the changes immediately.
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
              hint="What will students learn in this session?"
            >
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Topics covered, prerequisites, what to prepare…"
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

            <Field label="Duration" required>
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
              hint="Paste your Zoom, Google Meet, or Teams invite link."
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
              hint="Optional cover image for this session."
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
                <Save size={15} />
                Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLiveClass;
