import { useState, useEffect } from 'react';
import { 
  User, Shield, AlertTriangle, Settings as SettingsIcon, Save, Key, Mail, Info, 
  ToggleLeft, ToggleRight, Loader2, Database, Server, Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAdminSettings, updateAdminSettings, updatePassword } from '../../services/settingsService';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  
  // Loading & Saving states
  const [loading, setLoading] = useState(true);
  const [savingPlatform, setSavingPlatform] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // System settings state (Platform, Security, Notifications)
  const [sysSettings, setSysSettings] = useState({
    maintenanceMode: false,
    allowStudentRegistration: true,
    allowInstructorApplications: true,
    enablePublicCourseBrowsing: true,
    requireEmailVerification: false,
    enableGoogleLogin: true,
    jwtSessionTimeout: 24,
    enableEmailService: true,
    adminAlertEmails: 'admin@zindalearn.com',
    platformVersion: '1.0.0',
    dbStatus: 'Loading...',
    backendStatus: 'Loading...'
  });

  // Admin password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNew: ''
  });

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getAdminSettings();
        if (res.success && res.data) {
          setSysSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin settings:', err);
        toast.error('Failed to load platform settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Update Platform Config
  const handleUpdatePlatform = async (e) => {
    if (e) e.preventDefault();
    setSavingPlatform(true);
    try {
      const res = await updateAdminSettings(sysSettings);
      if (res.success) {
        setSysSettings(res.data);
        toast.success('Platform configuration updated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update platform settings');
    } finally {
      setSavingPlatform(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNew) {
      return toast.error('New passwords do not match');
    }
    setSavingPassword(true);
    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Admin password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleToggle = (key) => {
    setSysSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (key, val) => {
    setSysSettings(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const Switch = ({ checked, onChange, label, description }) => (
    <div className="flex items-start justify-between py-3 border-b border-slate-700/40 last:border-0">
      <div className="mr-4">
        <span className="text-sm font-medium text-slate-200 block">{label}</span>
        {description && <span className="text-xs text-slate-500 block mt-0.5 leading-relaxed">{description}</span>}
      </div>
      <button 
        type="button" 
        onClick={onChange}
        className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
      >
        {checked ? (
          <ToggleRight className="w-10 h-6 text-indigo-500" />
        ) : (
          <ToggleLeft className="w-10 h-6 text-slate-600" />
        )}
      </button>
    </div>
  );

  const InputField = ({ label, icon: Icon, ...props }) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />}
        <input
          {...props}
          className={`w-full bg-slate-900 border border-slate-700 rounded-lg ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-slate-500`}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-sm text-slate-400">Loading system parameters...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-100 tracking-tight">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-400">Manage administrator settings and configure platform-wide parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column — Profile & Password */}
        <div className="space-y-4">
          {/* Profile Card */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Admin Profile</h2>

            <div className="flex flex-col items-center mb-5">
              <div className="relative mb-3">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=6366f1&color=fff&size=80`}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-700"
                />
              </div>
              <p className="text-xs font-medium text-slate-200">{user?.name}</p>
              <p className="text-[10px] text-slate-500">{user?.email}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <div className="bg-slate-900/60 border border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-400">
                  {user?.name}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <div className="bg-slate-900/60 border border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-400">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Role / Access Level</label>
                <div className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-indigo-400">Super Administrator</span>
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Key className="w-3.5 h-3.5" /> Change Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <InputField 
                label="Current Password" 
                type="password" 
                placeholder="••••••••" 
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
              <InputField 
                label="New Password" 
                type="password" 
                placeholder="Enter new password" 
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                required
              />
              <InputField 
                label="Confirm New Password" 
                type="password" 
                placeholder="Confirm new password" 
                value={passwordForm.confirmNew}
                onChange={e => setPasswordForm(prev => ({ ...prev, confirmNew: e.target.value }))}
                required
              />

              <button 
                type="submit"
                disabled={savingPassword}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 mt-4"
              >
                {savingPassword ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Columns — Platform Settings & Metadata */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleUpdatePlatform} className="space-y-4">
            
            {/* 1. Platform Controls */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <SettingsIcon className="w-3.5 h-3.5" /> Platform Controls
              </h2>

              <div className="space-y-1">
                <Switch 
                  checked={sysSettings.maintenanceMode}
                  onChange={() => handleToggle('maintenanceMode')}
                  label="Maintenance Mode"
                  description="Block students and instructors from dashboard access. Only administrators can log in."
                />
                <Switch 
                  checked={sysSettings.allowStudentRegistration}
                  onChange={() => handleToggle('allowStudentRegistration')}
                  label="Allow Student Registration"
                  description="Enables signups for new student accounts."
                />
                <Switch 
                  checked={sysSettings.allowInstructorApplications}
                  onChange={() => handleToggle('allowInstructorApplications')}
                  label="Allow Instructor Applications"
                  description="Enables signup forms and applications for new instructors."
                />
                <Switch 
                  checked={sysSettings.enablePublicCourseBrowsing}
                  onChange={() => handleToggle('enablePublicCourseBrowsing')}
                  label="Enable Public Course Browsing"
                  description="Allows guest users to search, view course details, and read testimonials."
                />
              </div>
            </div>

            {/* 2. Security Controls */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Shield className="w-3.5 h-3.5" /> Security Controls
              </h2>

              <div className="space-y-4">
                <Switch 
                  checked={sysSettings.requireEmailVerification}
                  onChange={() => handleToggle('requireEmailVerification')}
                  label="Require Email Verification"
                  description="Force email authentication check before students can purchase courses."
                />
                <Switch 
                  checked={sysSettings.enableGoogleLogin}
                  onChange={() => handleToggle('enableGoogleLogin')}
                  label="Enable Google Login"
                  description="Enable Single Sign-On (SSO) authentication using Google."
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <InputField 
                    label="JWT Session Timeout (Hours)"
                    type="number"
                    min="1"
                    max="720"
                    value={sysSettings.jwtSessionTimeout || 24}
                    onChange={e => handleInputChange('jwtSessionTimeout', parseInt(e.target.value) || 24)}
                  />
                </div>
              </div>
            </div>

            {/* 3. Notification Controls */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Mail className="w-3.5 h-3.5" /> Notification Controls
              </h2>

              <div className="space-y-4">
                <Switch 
                  checked={sysSettings.enableEmailService}
                  onChange={() => handleToggle('enableEmailService')}
                  label="Enable Email Service"
                  description="Sends transactional notifications and email verification links to users."
                />
                <InputField 
                  label="Admin Alert Recipient Emails"
                  type="email"
                  placeholder="admin@zindalearn.com"
                  value={sysSettings.adminAlertEmails || ''}
                  onChange={e => handleInputChange('adminAlertEmails', e.target.value)}
                />
              </div>
            </div>

            {/* 4. Action Footer */}
            <div className="flex items-center justify-between bg-slate-850 p-4 border border-slate-700/60 rounded-xl">
              <div className="text-xs text-slate-500">
                Ensure settings are vetted before applying to the production database cluster.
              </div>
              <button
                type="submit"
                disabled={savingPlatform}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {savingPlatform ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {savingPlatform ? 'Saving changes...' : 'Update Platform Config'}
              </button>
            </div>
          </form>

          {/* 5. System Information */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Info className="w-3.5 h-3.5" /> System Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-4">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Cpu className="w-4 h-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Version</span>
                </div>
                <p className="text-sm font-semibold text-slate-200">v{sysSettings.platformVersion || '1.0.0'}</p>
                <p className="text-[10px] text-slate-500 mt-1">Platform deployment</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <Server className="w-4 h-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">API Status</span>
                </div>
                <p className="text-sm font-semibold text-slate-200">{sysSettings.backendStatus || 'Healthy'}</p>
                <p className="text-[10px] text-slate-500 mt-1">Node Express cluster</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Database className="w-4 h-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">DB Status</span>
                </div>
                <p className="text-sm font-semibold text-slate-200">{sysSettings.dbStatus || 'Connected'}</p>
                <p className="text-[10px] text-slate-500 mt-1">MongoDB cluster connection</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
