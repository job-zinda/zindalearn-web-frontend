import { useState } from 'react';
import { FileText, MessageSquare, Paperclip, Info, Download } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'qa', label: 'Q&A', icon: MessageSquare },
  { id: 'resources', label: 'Resources', icon: Paperclip },
];

const LessonTabs = ({ lesson, module }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b border-zinc-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">{lesson?.title || 'Lesson Overview'}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {lesson?.description || 'No description available for this lesson. Watch the video to learn more.'}
              </p>
            </div>
            <div className="flex items-center gap-6 pt-4 border-t border-zinc-100">
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-0.5">Duration</p>
                <p className="text-sm font-bold text-zinc-800">
                  {lesson?.duration ? `${lesson.duration} min` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-0.5">Module</p>
                <p className="text-sm font-bold text-zinc-800">{module?.title || '—'}</p>
              </div>
              {lesson?.isFree && (
                <div>
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
                    Free Preview
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400 font-medium">Take notes while you learn.</p>
            <textarea
              rows={8}
              placeholder="Write your notes here..."
              className="w-full border border-zinc-200 rounded-xl p-4 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none"
            />
            <button className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors">
              Save Note
            </button>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="space-y-6">
            <div>
              <textarea
                rows={4}
                placeholder="Ask a question about this lesson..."
                className="w-full border border-zinc-200 rounded-xl p-4 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none"
              />
              <button className="mt-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors">
                Post Question
              </button>
            </div>
            <div className="text-center py-8 text-zinc-400 text-sm">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              No questions yet. Be the first to ask!
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400 font-medium mb-4">Downloadable resources for this lesson.</p>
            {['Lesson Slides.pdf', 'Source Code.zip', 'Cheat Sheet.pdf'].map((file) => (
              <div key={file} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:bg-zinc-100 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Paperclip className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">{file}</p>
                    <p className="text-xs text-zinc-400">Click to download</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-zinc-400 group-hover:text-primary-600 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonTabs;
