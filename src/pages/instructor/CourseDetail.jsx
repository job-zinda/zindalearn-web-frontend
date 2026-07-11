import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getInstructorCourses, submitCourse } from '../../services/instructorService';
import { getCourseById, updateCourse, addSection as addSectionAPI, updateSection as updateSectionAPI, deleteSection as deleteSectionAPI, addLessonToSection, updateLessonInSection, deleteLessonFromSection, replyOrEditQA, uploadFile } from '../../services/courseService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  PlayCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  X,
  Save,
  Clock,
  Link as LinkIcon,
  HelpCircle,
  Trophy,
  Send,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Paperclip
} from 'lucide-react';
import VideoUpload from '../../components/instructor/VideoUpload';

// ── Create Module Modal ───────────────────────────────────────────────────────
const CreateModuleModal = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({ title: initialData?.title || '', description: initialData?.description || '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Module title is required');
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between p-8 pb-6 border-b border-slate-50">
          <h3 className="text-xl font-bold text-slate-900">Add New Section</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Section Title</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Getting Started with React"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-slate-900 placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
            <textarea
              rows="3"
              placeholder="Briefly describe what this section covers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-slate-900 placeholder:text-slate-300 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 transition-all">
              Create Section
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Create Test Modal ─────────────────────────────────────────────────────────
const CreateTestModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ title: '', duration: 30, passScore: 70 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between p-8 pb-6 border-b border-slate-50">
          <h3 className="text-xl font-bold text-slate-900">Create New Test</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Test Title</label>
            <input
              type="text"
              placeholder="e.g. Final Assessment"
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Duration (Mins)</label>
              <input type="number" defaultValue="30" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Pass Score (%)</label>
              <input type="number" defaultValue="70" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium" />
            </div>
          </div>

          <div className="p-10 border-2 border-dashed border-slate-100 rounded-[24px] text-center">
            <Plus className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question builder coming soon</p>
          </div>

          <button onClick={onClose} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 transition-all">
            Save Test
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Create Coupon Modal ───────────────────────────────────────────────────────
const CreateCouponModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between p-8 pb-6 border-b border-slate-50">
          <h3 className="text-xl font-bold text-slate-900">Create Coupon</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Coupon Code</label>
            <input
              type="text"
              placeholder="e.g. SUMMER50"
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-bold uppercase placeholder:normal-case"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Discount (%)</label>
              <input type="number" defaultValue="10" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Limit</label>
              <input type="number" placeholder="100" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium" />
            </div>
          </div>

          <button onClick={onClose} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 transition-all">
            Active Coupon
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Create Lesson Modal ───────────────────────────────────────────────────────
const CreateLessonModal = ({ onClose, onSave, courseId }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl animate-scale-in">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <VideoUpload
            courseId={courseId}
            onUploadSuccess={(video) => {
              onSave({
                title: video.title,
                description: video.description || '',
                videoUrl: video.videoUrl,
                duration: video.duration || 0,
                isFree: false,
                source: video.source
              });
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ── Edit Lesson Modal ────────────────────────────────────────────────────────
const EditLessonModal = ({ lesson, courseId, sectionId, onCourseUpdate, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('Info');
  
  const [formData, setFormData] = useState({
    title: lesson.title || '',
    description: lesson.description || '',
    isFree: lesson.isFree || false,
    videoUrl: lesson.videoUrl || '',
    source: lesson.source || '',
    overview: lesson.overview || '',
    notes: lesson.notes || [],
    resources: lesson.resources || [],
    keyTakeaways: lesson.keyTakeaways || [],
    requiredTools: lesson.requiredTools || [],
    tests: lesson.tests || [],
    difficultyLevel: lesson.difficultyLevel || 'All Levels',
    estimatedDuration: lesson.estimatedDuration || 0,
    tags: lesson.tags || []
  });

  const [qaList, setQaList] = useState(lesson.qa || []);
  const [replyText, setReplyText] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Title is required');
    onSave({ ...lesson, ...formData });
    onClose();
  };

  const TABS = ['Info', 'Overview', 'Takeaways & Tools', 'Notes', 'Resources', 'MCQ Tests', 'Student Q&A'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4 border-b border-slate-50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Configure Lesson Content</h3>
            <p className="text-xs text-slate-400 mt-1">Add overview details, notes, resources, quizzes, or reply to Q&A.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-hide shrink-0 bg-slate-50/55 px-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 relative ${
                activeTab === tab 
                  ? 'text-purple-600 border-purple-600' 
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              {tab}
              {tab === 'Student Q&A' && qaList.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-purple-600 text-white text-[9px] font-black rounded-full">
                  {qaList.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 flex-1 overflow-y-auto space-y-6">
          
          {/* TAB 1: Info */}
          {activeTab === 'Info' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Lesson Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Introduction to React components"
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold text-slate-900"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Short Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a brief summary of the lesson video..."
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium resize-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Difficulty Level</label>
                  <select
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold text-slate-700"
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={formData.estimatedDuration || ''}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: Number(e.target.value) })}
                    placeholder="e.g. 15"
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Video URL</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="e.g. https://res.cloudinary.com/..."
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Video Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold text-slate-700"
                  >
                    <option value="upload">Upload</option>
                    <option value="youtube">YouTube</option>
                    <option value="">None</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Lesson Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. react, hooks, components"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-slate-200 text-purple-600 focus:ring-purple-500 transition-all"
                  />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-purple-600 transition-colors">Available as Free Preview</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: Overview */}
          {activeTab === 'Overview' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Detailed Overview / Lesson Script</label>
              <textarea
                rows="10"
                placeholder="Write details about what students will learn, code snippets, or lesson instructions. Supports markdown styling..."
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-[20px] focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-slate-700 placeholder:text-slate-300 resize-y min-h-[250px]"
              />
            </div>
          )}

          {/* TAB 3: Takeaways & Tools */}
          {activeTab === 'Takeaways & Tools' && (
            <div className="space-y-6">
              {/* Takeaways Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Key Takeaways</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="takeaway-input"
                    placeholder="e.g. Understand React component lifecycle"
                    className="flex-1 px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-sm text-slate-900 placeholder:text-slate-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.target.value.trim();
                        if (val) {
                          setFormData({ ...formData, keyTakeaways: [...formData.keyTakeaways, val] });
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('takeaway-input');
                      const val = input.value.trim();
                      if (val) {
                        setFormData({ ...formData, keyTakeaways: [...formData.keyTakeaways, val] });
                        input.value = '';
                      }
                    }}
                    className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm"
                  >
                    Add
                  </button>
                </div>
                <ul className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {formData.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm font-semibold text-slate-700 truncate max-w-[90%]">• {item}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, keyTakeaways: formData.keyTakeaways.filter((_, i) => i !== idx) })}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                  {formData.keyTakeaways.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl">No takeaways added. Students will see course-level takeaways.</p>
                  )}
                </ul>
              </div>

              {/* Tools Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Required Tools</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="tool-input"
                    placeholder="e.g. VS Code, Node.js"
                    className="flex-1 px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-sm text-slate-900 placeholder:text-slate-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.target.value.trim();
                        if (val) {
                          setFormData({ ...formData, requiredTools: [...formData.requiredTools, val] });
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('tool-input');
                      const val = input.value.trim();
                      if (val) {
                        setFormData({ ...formData, requiredTools: [...formData.requiredTools, val] });
                        input.value = '';
                      }
                    }}
                    className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-1">
                  {formData.requiredTools.map((item, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full font-bold text-xs">
                      {item}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, requiredTools: formData.requiredTools.filter((_, i) => i !== idx) })}
                        className="text-purple-400 hover:text-purple-700 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {formData.requiredTools.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl w-full">No tools added. Students will see course-level tools.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Notes */}
          {activeTab === 'Notes' && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-purple-700 uppercase tracking-widest">Create Lesson Note</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    id="note-title-input"
                    placeholder="Note Title (e.g. Summary of SSR vs SSG)"
                    className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold text-sm text-slate-900"
                  />
                  <textarea
                    rows="3"
                    id="note-content-input"
                    placeholder="Note content description or cheat sheet details..."
                    className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-sm resize-none text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const titleInput = document.getElementById('note-title-input');
                      const contentInput = document.getElementById('note-content-input');
                      const title = titleInput.value.trim();
                      const content = contentInput.value.trim();
                      if (!title || !content) return toast.error('Note Title and Content are required');
                      setFormData({ ...formData, notes: [...formData.notes, { title, content }] });
                      titleInput.value = '';
                      contentInput.value = '';
                      toast.success('Note added to draft ✓');
                    }}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                  >
                    Add Note to Lesson
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lesson Notes ({formData.notes.length})</label>
                <div className="space-y-2.5">
                  {formData.notes.map((note, idx) => (
                    <div key={idx} className="flex justify-between items-start p-4 bg-slate-50 rounded-2xl">
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-800 text-sm">{note.title}</h5>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{note.content}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, notes: formData.notes.filter((_, i) => i !== idx) })}
                        className="text-slate-400 hover:text-red-500 transition-colors ml-3 p-1 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.notes.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 rounded-2xl">No notes added to this lesson yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Resources */}
          {activeTab === 'Resources' && (
            <div className="space-y-6">
              {/* Add Resource Form */}
              <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-purple-700 uppercase tracking-widest">Attach Resource File / Link</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      id="resource-title-input"
                      placeholder="Resource Title (e.g. React Cheatsheet)"
                      className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold text-sm text-slate-900"
                    />
                    <select
                      id="resource-type-input"
                      defaultValue="link"
                      className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold text-sm text-slate-700"
                      onChange={(e) => {
                        const isFile = ['pdf', 'zip', 'image'].includes(e.target.value);
                        document.getElementById('file-upload-block').style.display = isFile ? 'block' : 'none';
                        document.getElementById('url-input-block').style.display = isFile ? 'none' : 'block';
                      }}
                    >
                      <option value="link">Documentation Link</option>
                      <option value="pdf">PDF Document</option>
                      <option value="zip">ZIP Archive</option>
                      <option value="image">Image Asset</option>
                      <option value="video">Additional Video</option>
                    </select>
                  </div>

                  {/* File Upload Block */}
                  <div id="file-upload-block" style={{ display: 'none' }} className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Upload File</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id="resource-file-input"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const nameSpan = document.getElementById('selected-filename');
                          if (nameSpan) nameSpan.innerText = file.name;
                          const upToast = toast.loading('Uploading file to Cloudinary...');
                          try {
                            const fileData = new FormData();
                            fileData.append('file', file);
                            fileData.append('folder', `zinda-learn/courses/resources/${courseId}`);
                            const res = await uploadFile(fileData);
                            if (res?.success && res?.url) {
                              document.getElementById('resource-url-input').value = res.url;
                              toast.success('File uploaded successfully! ✓', { id: upToast });
                            } else {
                              throw new Error('Upload response invalid');
                            }
                          } catch (err) {
                            toast.error('File upload failed. Please try again.', { id: upToast });
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('resource-file-input').click()}
                        className="px-5 py-3 bg-white border border-dashed border-purple-300 text-purple-700 font-bold rounded-xl text-sm hover:bg-purple-50 transition-all flex items-center gap-2"
                      >
                        <Paperclip className="w-4 h-4" /> Choose File
                      </button>
                      <span className="text-xs text-slate-400 truncate max-w-[200px]" id="selected-filename"></span>
                    </div>
                  </div>

                  {/* URL Block */}
                  <div id="url-input-block" className="space-y-2">
                    <input
                      type="text"
                      id="resource-url-input"
                      placeholder="Resource URL (e.g. https://github.com/...)"
                      className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-sm text-slate-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const titleInput = document.getElementById('resource-title-input');
                      const typeInput = document.getElementById('resource-type-input');
                      const urlInput = document.getElementById('resource-url-input');
                      const title = titleInput.value.trim();
                      const type = typeInput.value;
                      const url = urlInput.value.trim();
                      if (!title || !url) return toast.error('Resource Title and URL are required');
                      setFormData({ ...formData, resources: [...formData.resources, { title, type, url }] });
                      titleInput.value = '';
                      urlInput.value = '';
                      const filename = document.getElementById('selected-filename');
                      if (filename) filename.innerText = '';
                      toast.success('Resource attached ✓');
                    }}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-all"
                  >
                    Attach to Lesson
                  </button>
                </div>
              </div>

              {/* Resources List */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resources ({formData.resources.length})</label>
                <div className="space-y-2">
                  {formData.resources.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-slate-400 capitalize bg-white p-2 rounded-lg border border-slate-100 font-black text-[10px] select-none shrink-0">{item.type}</span>
                        <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-purple-700 hover:underline truncate">{item.title}</a>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, resources: formData.resources.filter((_, i) => i !== idx) })}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.resources.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 rounded-2xl">No files or resources attached yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MCQ Tests */}
          {activeTab === 'MCQ Tests' && (
            <div className="space-y-6">
              {/* Add MCQ Question Form */}
              <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-purple-700 uppercase tracking-widest">Add MCQ Question</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Question Text</label>
                    <input
                      type="text"
                      id="mcq-question"
                      placeholder="e.g. Which hook is used to handle side effects in React?"
                      className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold text-sm text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Option A</label>
                      <input type="text" id="mcq-optA" placeholder="Option A" className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-900" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Option B</label>
                      <input type="text" id="mcq-optB" placeholder="Option B" className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-900" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Option C</label>
                      <input type="text" id="mcq-optC" placeholder="Option C" className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-900" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Option D</label>
                      <input type="text" id="mcq-optD" placeholder="Option D" className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-900" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Correct Option</label>
                      <select id="mcq-correct" className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700">
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Explanation</label>
                      <input type="text" id="mcq-explain" placeholder="Why is this answer correct?" className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-900" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const q = document.getElementById('mcq-question').value.trim();
                      const oA = document.getElementById('mcq-optA').value.trim();
                      const oB = document.getElementById('mcq-optB').value.trim();
                      const oC = document.getElementById('mcq-optC').value.trim();
                      const oD = document.getElementById('mcq-optD').value.trim();
                      const correct = document.getElementById('mcq-correct').value;
                      const exp = document.getElementById('mcq-explain').value.trim();

                      if (!q || !oA || !oB || !oC || !oD) return toast.error('Question text and all 4 options are required');
                      
                      let correctText = '';
                      if (correct === 'A') correctText = oA;
                      else if (correct === 'B') correctText = oB;
                      else if (correct === 'C') correctText = oC;
                      else correctText = oD;

                      const newQuestion = {
                        question: q,
                        options: [oA, oB, oC, oD],
                        correctAnswer: correctText,
                        explanation: exp
                      };

                      setFormData({ ...formData, tests: [...formData.tests, newQuestion] });
                      
                      document.getElementById('mcq-question').value = '';
                      document.getElementById('mcq-optA').value = '';
                      document.getElementById('mcq-optB').value = '';
                      document.getElementById('mcq-optC').value = '';
                      document.getElementById('mcq-optD').value = '';
                      document.getElementById('mcq-explain').value = '';
                      
                      toast.success('Question added to test ✓');
                    }}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                  >
                    Add Question
                  </button>
                </div>
              </div>

              {/* MCQ List */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Test Questions ({formData.tests.length})</label>
                <div className="space-y-3">
                  {formData.tests.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-slate-800 text-sm">Q{idx + 1}: {item.question}</h5>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, tests: formData.tests.filter((_, i) => i !== idx) })}
                          className="text-slate-400 hover:text-red-500 transition-colors ml-3 p-1 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pl-4 text-xs font-semibold text-slate-500">
                        {item.options.map((opt, oIdx) => (
                          <div key={oIdx} className={opt === item.correctAnswer ? "text-emerald-600 font-bold" : ""}>
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                      {item.explanation && (
                        <p className="text-[11px] text-slate-400 italic bg-white p-2 rounded-lg border border-slate-50">Explanation: {item.explanation}</p>
                      )}
                    </div>
                  ))}
                  {formData.tests.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 rounded-2xl">No test questions added to this lesson yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Student Q&A */}
          {activeTab === 'Student Q&A' && (
            <div className="space-y-5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lesson Q&A Discussion ({qaList.length})</label>
              <div className="space-y-4">
                {qaList.map((qa) => (
                  <div key={qa._id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold font-mono">
                          {qa.askedBy?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-800 leading-none">{qa.askedBy?.name || 'Student'}</h5>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(qa.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 pl-1">{qa.question}</p>
                    
                    {qa.answer ? (
                      <div className="pl-4 border-l-2 border-purple-400 py-1 space-y-1">
                        <h6 className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Your Answer:</h6>
                        <p className="text-xs font-semibold text-slate-600 bg-white p-3 rounded-xl border border-slate-50">{qa.answer}</p>
                      </div>
                    ) : (
                      <div className="pl-4 py-1">
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Unanswered</span>
                      </div>
                    )}

                    {/* Reply Form */}
                    <div className="space-y-2 pt-2">
                      <textarea
                        rows="2"
                        value={replyText[qa._id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [qa._id]: e.target.value })}
                        placeholder="Write an answer or update your existing answer..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium resize-none focus:outline-none focus:border-purple-400 text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const answer = replyText[qa._id]?.trim();
                          if (!answer) return toast.error('Answer text is required');
                          const replyToast = toast.loading('Saving answer...');
                          try {
                            const res = await replyOrEditQA(courseId, sectionId, lesson._id, qa._id, { answer });
                            if (res?.success) {
                              toast.success('Answer posted successfully! ✓', { id: replyToast });
                              
                              let updatedLesson = null;
                              res.course.modules.forEach(mod => {
                                if (mod._id === sectionId) {
                                  const l = mod.lessons.find(ls => ls._id === lesson._id);
                                  if (l) updatedLesson = l;
                                }
                              });
                              if (updatedLesson) {
                                setQaList(updatedLesson.qa || []);
                              }
                              onCourseUpdate(res.course);
                              setReplyText({ ...replyText, [qa._id]: '' });
                            } else {
                              throw new Error('API failure');
                            }
                          } catch (err) {
                            toast.error('Failed to post reply.', { id: replyToast });
                          }
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit Answer
                      </button>
                    </div>
                  </div>
                ))}
                {qaList.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-100">No student questions have been asked for this lesson yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Buttons Footer */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-50 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all">
              Cancel
            </button>
            {activeTab !== 'Student Q&A' && (
              <button type="submit" className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 transition-all">
                Save Changes
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Lesson Preview Modal ──────────────────────────────────────────────────────
const LessonPreviewModal = ({ lesson, onClose }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-10">
      <div className="w-full max-w-5xl aspect-video relative bg-black rounded-[32px] overflow-hidden shadow-2xl border border-white/10">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="absolute top-6 left-8 z-10">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Previewing Lesson</p>
          <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
        </div>

        {lesson.videoUrl ? (
          <video 
            src={lesson.videoUrl} 
            controls 
            autoPlay 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white">
            <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
            <p className="font-bold">No video URL found for this lesson</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Content Tab ───────────────────────────────────────────────────────────────
const ContentTab = ({ modules = [], courseId, onCourseUpdate }) => {
  const [selectedModule, setSelectedModule] = useState(0);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [previewingLesson, setPreviewingLesson] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAddModule = async (newMod) => {
    setSaving(true);
    try {
      const res = await addSectionAPI(courseId, newMod);
      onCourseUpdate(res.course);
      setSelectedModule(res.course.modules.length - 1);
      toast.success('Section saved ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add section');
    } finally {
      setSaving(false);
    }
  };

  const handleEditModule = async (data) => {
    setSaving(true);
    try {
      const sectionId = modules[editingSection]._id;
      const res = await updateSectionAPI(courseId, sectionId, data);
      onCourseUpdate(res.course);
      setEditingSection(null);
      toast.success('Section updated ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update section');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (index) => {
    if (!window.confirm('Delete this section and all its lessons? This cannot be undone.')) return;
    setSaving(true);
    try {
      const sectionId = modules[index]._id;
      const res = await deleteSectionAPI(courseId, sectionId);
      onCourseUpdate(res.course);
      if (selectedModule >= res.course.modules.length) {
        setSelectedModule(Math.max(0, res.course.modules.length - 1));
      }
      toast.success('Section deleted ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete section');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async (newLesson) => {
    setSaving(true);
    try {
      const sectionId = modules[selectedModule]._id;
      const res = await addLessonToSection(courseId, sectionId, newLesson);
      onCourseUpdate(res.course);
      toast.success('Lesson saved ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLesson = async (updatedLesson) => {
    setSaving(true);
    try {
      const sectionId = modules[selectedModule]._id;
      const lessonId = editingLesson.lesson._id;
      const res = await updateLessonInSection(courseId, sectionId, lessonId, updatedLesson);
      onCourseUpdate(res.course);
      setEditingLesson(null);
      toast.success('Lesson updated ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (index) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    setSaving(true);
    try {
      const sectionId = modules[selectedModule]._id;
      const lessonId = modules[selectedModule].lessons[index]._id;
      const res = await deleteLessonFromSection(courseId, sectionId, lessonId);
      onCourseUpdate(res.course);
      toast.success('Lesson deleted ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lesson');
    } finally {
      setSaving(false);
    }
  };

  // Clamp selectedModule to valid range
  const safeIdx = Math.min(selectedModule, Math.max(modules.length - 1, 0));

  return (
    <>
      {showModuleModal && (
        <CreateModuleModal
          onClose={() => setShowModuleModal(false)}
          onSave={handleAddModule}
        />
      )}
      {editingSection !== null && modules[editingSection] && (
        <CreateModuleModal
          initialData={modules[editingSection]}
          onClose={() => setEditingSection(null)}
          onSave={handleEditModule}
        />
      )}
      {showLessonModal && (
        <CreateLessonModal
          onClose={() => setShowLessonModal(false)}
          onSave={handleAddLesson}
          courseId={courseId}
        />
      )}
      {editingLesson && (
        <EditLessonModal
          lesson={editingLesson.lesson}
          courseId={courseId}
          sectionId={modules[selectedModule]._id}
          onCourseUpdate={onCourseUpdate}
          onClose={() => setEditingLesson(null)}
          onSave={handleUpdateLesson}
        />
      )}
      {previewingLesson && (
        <LessonPreviewModal
          lesson={previewingLesson}
          onClose={() => setPreviewingLesson(null)}
        />
      )}

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl animate-fade-in">
          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
        {/* Left — Modules list */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Course Modules</h3>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-bold rounded-full">{modules.length} Sections</span>
          </div>

          {modules.length > 0 ? (
            modules.map((mod, i) => (
              <button
                key={mod._id || i}
                onClick={() => setSelectedModule(i)}
                className={`w-full text-left p-5 rounded-[24px] border transition-all duration-300 ${safeIdx === i
                    ? 'border-purple-200 bg-white shadow-xl shadow-purple-500/5 border-l-4 border-l-purple-600'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${safeIdx === i ? 'text-purple-600' : 'text-slate-400'}`}>
                    Section {i + 1}
                  </span>
                  <GripVertical className="w-4 h-4 text-slate-300" />
                </div>
                <h4 className="font-bold text-slate-800 leading-snug mb-3">{mod.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-bold rounded-md">
                    {mod.lessons?.length || 0} Lessons
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-10 text-center bg-white border border-dashed border-slate-200 rounded-[24px]">
              <Plus className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">No modules yet</p>
            </div>
          )}

          <button
            onClick={() => setShowModuleModal(true)}
            disabled={saving}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[24px] text-xs font-bold text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add New Section
          </button>
        </div>

        {/* Right — Module detail */}
        <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px] p-10">
          {modules.length > 0 && modules[safeIdx] ? (
            <div className="w-full text-left">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Managing Curriculum</span>
                  <h3 className="text-2xl font-bold text-slate-900">{modules[safeIdx].title}</h3>
                  {modules[safeIdx].description && (
                    <p className="text-sm text-slate-500 mt-1">{modules[safeIdx].description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingSection(safeIdx)}
                    disabled={saving}
                    className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 disabled:opacity-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(safeIdx)}
                    disabled={saving}
                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lessons List */}
              <div className="space-y-3 mb-8">
                {modules[safeIdx].lessons?.length > 0 ? (
                  modules[safeIdx].lessons.map((lesson, idx) => (
                    <div key={lesson._id || idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group border border-transparent hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <button 
                          onClick={() => setPreviewingLesson(lesson)}
                          className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-purple-600 group-hover:bg-purple-50 transition-all shrink-0 active:scale-95"
                        >
                          <PlayCircle className="w-5 h-5" />
                        </button>
                        <div className="overflow-hidden">
                          <h5 className="text-sm font-bold text-slate-700 truncate">{lesson.title}</h5>
                          {lesson.description && (
                            <p className="text-[11px] text-slate-400 truncate max-w-[300px] font-medium mb-1">{lesson.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            <span>{lesson.duration} mins</span>
                            {lesson.isFree && <span className="text-emerald-500">Free Preview</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => setEditingLesson({ lesson, index: idx })}
                          className="p-2 text-slate-400 hover:text-purple-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLesson(idx)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 border-2 border-dashed border-slate-100 rounded-[32px] text-center">
                    <PlayCircle className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-sm text-slate-500 font-medium">No lessons in this section yet</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowLessonModal(true)}
                disabled={saving}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" /> Add Lesson to Section
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <PlayCircle className="w-16 h-16 text-slate-100 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Build your curriculum</h3>
              <p className="text-sm text-slate-500 max-w-xs">Start by adding your first section and uploading your lessons to get started.</p>
              <button
                onClick={() => setShowModuleModal(true)}
                disabled={saving}
                className="mt-8 flex items-center gap-2 px-8 py-3.5 bg-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" /> Add First Section
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Tests Tab ─────────────────────────────────────────────────────────────────
const TestsTab = () => {
  const [showModal, setShowModal] = useState(false);
  const tests = []; // Removed mock tests

  return (
    <>
      {showModal && <CreateTestModal onClose={() => setShowModal(false)} />}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Course Assessments</h3>
            <p className="text-sm text-slate-500 mt-1">Add quizzes to test your students' knowledge.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 transition-all"
          >
            <Plus className="w-5 h-5" /> Create Test
          </button>
        </div>

        <div className="bg-white border border-dashed border-slate-200 rounded-[32px] p-20 text-center shadow-sm">
          <Trophy className="w-16 h-16 text-slate-100 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No tests added yet</p>
        </div>
      </div>
    </>
  );
};

// ── Coupons Tab ───────────────────────────────────────────────────────────────
const CouponsTab = () => {
  const [showModal, setShowModal] = useState(false);
  const coupons = []; // Removed mock coupons

  return (
    <>
      {showModal && <CreateCouponModal onClose={() => setShowModal(false)} />}
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-slate-900">Active Coupons</h3>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 transition-all"
          >
            <Plus className="w-5 h-5" /> Create Coupon
          </button>
        </div>

        <div className="bg-white border border-dashed border-slate-200 rounded-[32px] p-20 text-center shadow-sm">
          <HelpCircle className="w-16 h-16 text-slate-100 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active coupons</p>
        </div>
      </div>
    </>
  );
};

// ── Course Detail Main ────────────────────────────────────────────────────────
const CourseDetail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Content');
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const tabs = ['Content', 'Tests', 'Coupons'];

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      if (import.meta.env.DEV) console.log(`[COURSE_DETAIL] Fetching course with ID: ${id}`);
      const data = await getCourseById(id);
      if (import.meta.env.DEV) console.log(`[COURSE_DETAIL] Received data:`, data);
      
      if (data) {
        setCourse(data);
      } else {
        console.error('[COURSE_DETAIL] No course data received');
        toast.error('Course data is empty');
      }
    } catch (error) {
      console.error('[COURSE_DETAIL] Fetch error:', error);
      toast.error('Failed to fetch course details');
      navigate('/instructor/my-courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      setSubmitting(true);
      await submitCourse(id);
      toast.success('Course submitted for admin review!');
      fetchCourse();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCourseUpdate = (updatedCourse) => {
    setCourse(updatedCourse);
  };

  if (loading) {
    return <div className="p-20 text-center animate-pulse">Loading course...</div>;
  }

  if (!course) {
    return <div className="p-20 text-center text-slate-500 font-bold">Course not found</div>;
  }

  return (
    <div className="animate-fade-in pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
        <Link to="/instructor/my-courses" className="hover:text-purple-600 transition-colors">Courses</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-600">Management</span>
      </div>

      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">{course.title}</h1>
          <p className="text-base text-slate-500">Course Management & Curriculum</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200">
            {['draft', 'pending', 'published', 'declined'].map(status => (
              <div
                key={status}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-extrabold transition-all duration-300 uppercase tracking-widest flex items-center gap-2 ${(course.status || 'draft') === status
                    ? status === 'published' ? 'bg-emerald-500 text-white shadow-lg' :
                      status === 'pending' ? 'bg-amber-500 text-white shadow-lg' :
                        status === 'declined' ? 'bg-rose-500 text-white shadow-lg' :
                          'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-400 opacity-40 cursor-default'
                  }`}
              >
                {status === 'published' && <CheckCircle2 className="w-3 h-3" />}
                {status === 'pending' && <Clock className="w-3 h-3" />}
                {status === 'declined' && <AlertTriangle className="w-3 h-3" />}
                {status}
              </div>
            ))}
          </div>

          {course.status === 'draft' || course.status === 'declined' ? (
            <button
              onClick={handleSubmitForReview}
              disabled={submitting}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 transition-all active:scale-95 group"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
              Submit for Review
            </button>
          ) : (
            <button className="flex items-center gap-2.5 px-8 py-3.5 bg-slate-100 text-slate-400 font-bold rounded-2xl border border-slate-200 cursor-not-allowed">
              <CheckCircle2 className="w-4 h-4" />
              In Review
            </button>
          )}

          {(user?.role === 'admin' || (course.instructor?._id || course.instructor) === (user?.id || user?._id)) && (
            <button
              onClick={() => navigate(`/instructor/edit-course/${id}`)}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-2xl transition-all active:scale-95 group"
            >
              <Edit2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Edit Info
            </button>
          )}

          <div className="flex items-center gap-2.5 px-6 py-3.5 bg-emerald-50 text-emerald-700 font-bold rounded-2xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            Auto-saved
          </div>
        </div>
      </div>

      {course.status === 'declined' && course.declineReason && (
        <div className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4 animate-bounce-subtle">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-rose-900 font-bold text-lg">Course Declined by Admin</h4>
            <p className="text-rose-700 mt-1 font-medium leading-relaxed">
              Reason: <span className="italic">"{course.declineReason}"</span>
            </p>
            <p className="text-rose-600 text-xs mt-3">Please address the feedback above and click "Submit for Review" again.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-full text-xs font-bold transition-all duration-300 border-2 whitespace-nowrap ${activeTab === tab
                ? 'bg-purple-600 text-white border-purple-600 shadow-xl shadow-purple-500/20'
                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-500">
        {activeTab === 'Content' && <ContentTab modules={course.modules} courseId={id} onCourseUpdate={handleCourseUpdate} />}
        {activeTab === 'Tests' && <TestsTab />}
        {activeTab === 'Coupons' && <CouponsTab />}
      </div>
    </div>
  );
};

export default CourseDetail;
