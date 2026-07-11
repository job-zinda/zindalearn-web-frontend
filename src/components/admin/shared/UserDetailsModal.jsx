import React from 'react';
import { 
  X, Mail, Phone, Calendar, Shield, BookOpen, 
  TrendingUp, CreditCard, Globe, AlertTriangle 
} from 'lucide-react';
import { 
  FaGithub as Github, 
  FaLinkedin as Linkedin, 
  FaTwitter as Twitter 
} from 'react-icons/fa';

const UserDetailsModal = ({ isOpen, onClose, user, onBlockToggle }) => {
  if (!isOpen || !user) return null;

  const formattedDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const avatarUrl = user.avatar || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=6366f1&color=fff&size=120`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={avatarUrl} 
              alt={user.name} 
              className="w-16 h-16 rounded-full object-cover border border-slate-700 shadow-lg"
            />
            <div>
              <h3 className="text-lg font-bold text-slate-100">{user.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  user.role === 'admin' 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : user.role === 'instructor'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}>
                  <Shield className="w-3 h-3" />
                  {user.role}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  user.isBlocked 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {user.isBlocked ? 'Suspended' : 'Active'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Suspension Callout */}
          {user.isBlocked && (
            <div className="flex gap-3 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-xs text-rose-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold uppercase tracking-wider">Account Suspended</p>
                <p className="mt-1 text-slate-300 leading-relaxed">
                  Reason: {user.blockedReason || 'No reason provided.'}
                </p>
              </div>
            </div>
          )}

          {/* Core Info Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Joined Date</span>
              <p className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                {formattedDate}
              </p>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Phone Number</span>
              <p className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400" />
                {user.phone || 'Not Provided'}
              </p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Biography</span>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {user.bio || 'No biography has been added yet.'}
            </p>
          </div>

          {/* Role-Specific details */}
          {user.role === 'student' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Learning Overview</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-center">
                  <BookOpen className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Courses Enrolled</span>
                  <span className="text-lg font-bold text-slate-200 mt-1 block">{user.enrolledCount || 0}</span>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-center">
                  <TrendingUp className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Avg Progress</span>
                  <span className="text-lg font-bold text-slate-200 mt-1 block">{user.avgProgress || 0}%</span>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-center">
                  <CreditCard className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Total Spent</span>
                  <span className="text-lg font-bold text-slate-200 mt-1 block">₹{(user.totalSpent || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {user.role === 'instructor' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional & Social Profiles</h4>
              
              {user.socialLinks && Object.values(user.socialLinks).some(link => !!link) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.socialLinks.website && (
                    <a 
                      href={user.socialLinks.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-805 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-xs text-slate-300"
                    >
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span>Website</span>
                    </a>
                  )}
                  {user.socialLinks.linkedin && (
                    <a 
                      href={user.socialLinks.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-805 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-xs text-slate-300"
                    >
                      <Linkedin className="w-4 h-4 text-indigo-400" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {user.socialLinks.twitter && (
                    <a 
                      href={user.socialLinks.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-xs text-slate-300"
                    >
                      <Twitter className="w-4 h-4 text-indigo-400" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {user.socialLinks.github && (
                    <a 
                      href={user.socialLinks.github} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-850 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-xs text-slate-300"
                    >
                      <Github className="w-4 h-4 text-indigo-400" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No social links provided.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div>
            {onBlockToggle && (
              <button
                onClick={() => onBlockToggle(user)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                  user.isBlocked 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                }`}
              >
                {user.isBlocked ? 'Reactivate Account' : 'Suspend Account'}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
