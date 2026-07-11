import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, Shield, CreditCard, Globe } from 'lucide-react';

const InstructorSettings = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('Profile');

  const sections = [
    { label: 'Profile', icon: User },
    { label: 'Notifications', icon: Bell },
    { label: 'Security', icon: Shield },
    { label: 'Payouts', icon: CreditCard },
    { label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500 text-sm">Manage your instructor account and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar nav */}
        <div className="md:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 space-y-1">
            {sections.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setActiveSection(label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeSection === label
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-100'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === 'Profile' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Profile Information</h2>

              <div className="flex items-center gap-5">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Instructor')}&background=7c3aed&color=fff&size=96`}
                  alt="Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
                />
                <div>
                  <button className="px-4 py-2 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors">
                    Change Photo
                  </button>
                  <p className="text-[10px] text-slate-400 mt-2">JPG, PNG or GIF · Max 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                  <input defaultValue={user?.name || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <input defaultValue={user?.email || ''} type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Bio</label>
                  <textarea defaultValue={user?.bio || ''} rows={3} placeholder="Tell students about yourself..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Website</label>
                  <input type="url" placeholder="https://yourwebsite.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">LinkedIn</label>
                  <input type="url" placeholder="https://linkedin.com/in/you" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors">Discard</button>
                <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-100 transition-all">Save Changes</button>
              </div>
            </div>
          )}

          {activeSection === 'Security' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Security Settings</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-colors" />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-100 transition-all">Update Password</button>
              </div>
            </div>
          )}

          {['Notifications', 'Payouts', 'Preferences'].includes(activeSection) && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
                {activeSection === 'Notifications' && <Bell className="w-8 h-8 text-purple-400" />}
                {activeSection === 'Payouts' && <CreditCard className="w-8 h-8 text-purple-400" />}
                {activeSection === 'Preferences' && <Globe className="w-8 h-8 text-purple-400" />}
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-2">{activeSection} Settings</h3>
              <p className="text-sm text-slate-400">This section is coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorSettings;
