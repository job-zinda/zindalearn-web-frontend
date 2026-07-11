import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Shield, Bell, 
  Trash2, Camera, Check, AlertCircle, Eye, EyeOff, Save,
  ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  getSettings, 
  updateProfile, 
  updatePassword, 
  updateNotifications, 
  deleteAccount,
  uploadAvatar,
  sendVerificationEmail
} from '../../services/settingsService';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  
  // Modal State for Danger Zone Account Deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Form States
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: '',
    username: '',
    phone: '',
    language: 'English (US)',
    avatar: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNew: ''
  });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    liveClassReminders: true,
    chatMessages: true,
    courseUpdates: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsRes = await getSettings();
        const data = settingsRes.data;
        setSettings(data);
        
        setProfileForm({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || '',
          username: data.username || '',
          phone: data.phone || '',
          language: data.language || 'English (US)',
          avatar: data.avatar || ''
        });
        
        setNotifications(data.notificationPreferences || notifications);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileUpdate = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const response = await updateProfile(profileForm);
      if (response.success) {
        updateUser(response.data);
        toast.success('Profile updated successfully');
        setIsEditingUsername(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('File size must be less than 2MB');
    }

    setUploading(true);
    try {
      const response = await uploadAvatar(file);
      if (response.success) {
        const newAvatar = response.url;
        setProfileForm(prev => ({ ...prev, avatar: newAvatar }));
        const updateRes = await updateProfile({ ...profileForm, avatar: newAvatar });
        if (updateRes.success) {
          updateUser(updateRes.data);
          toast.success('Avatar updated successfully');
        }
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setSaving(true);
    try {
      const updatedForm = { ...profileForm, avatar: '' };
      setProfileForm(updatedForm);
      const response = await updateProfile(updatedForm);
      if (response.success) {
        updateUser(response.data);
        toast.success('Avatar removed');
      }
    } catch (error) {
      toast.error('Failed to remove avatar');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNew) {
      return toast.error('New passwords do not match');
    }
    setSaving(true);
    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotification = async (key, value) => {
    const newNotifs = { ...notifications, [key]: value };
    setNotifications(newNotifs);
    try {
      await updateNotifications(newNotifs);
    } catch (error) {
      toast.error('Failed to update notification settings');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      toast.success('Account deleted successfully');
      setShowDeleteModal(false);
      logout();
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  if (loading) return <Loader fullScreen text="Loading your preferences..." />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-12 pb-20 px-4 sm:px-6"
    >
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Settings</h1>
        <p className="text-zinc-500 max-w-2xl font-medium">
          Manage your account profile and learning notifications.
        </p>
      </div>

      {/* 1. PROFILE DETAILS */}
      <section className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-zinc-100 shadow-xl shadow-zinc-200/40 space-y-8">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Profile Details</h2>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-100 border-4 border-white shadow-xl relative">
                {uploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : profileForm.avatar ? (
                  <img src={profileForm.avatar} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <User className="w-12 h-12" />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="text-white w-6 h-6" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg">
                <Check className="w-4 h-4" />
              </div>
            </div>

           <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-zinc-900 mb-1">Profile Photo</h3>
                <p className="text-xs text-zinc-400 font-medium">Min. 400x400px, JPG, PNG or GIF.</p>
              </div>
              <div className="flex gap-3">
                 <label className="px-6 py-2 bg-primary-50 text-primary-600 text-xs font-black rounded-full hover:bg-primary-100 transition-colors cursor-pointer">
                   Upload New
                   <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                 </label>
                 <button 
                  onClick={handleRemoveAvatar}
                  className="px-6 py-2 text-red-500 text-xs font-black rounded-full hover:bg-red-50 transition-colors"
                 >
                   Remove
                 </button>
              </div>
           </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest pl-1">Full Name</label>
              <input 
                type="text" 
                value={profileForm.name}
                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                placeholder="Alex Johnson"
                className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none" 
              />
           </div>
           <div className="space-y-2">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest pl-1">Email Address</label>
              <input 
                type="email" 
                value={profileForm.email}
                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                placeholder="alex.j@zindalearn.com"
                className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none" 
              />
              <div className="flex items-center gap-2 pl-1 pt-1">
                {settings?.emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-200">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-lg border border-amber-200">
                      <AlertCircle className="w-3 h-3" /> Unverified
                    </span>
                    <button
                      type="button"
                      disabled={sendingVerification}
                      onClick={async () => {
                        setSendingVerification(true);
                        try {
                          await sendVerificationEmail();
                          toast.success('Verification email sent! Check your inbox.');
                        } catch (err) {
                          toast.error(err.response?.data?.message || 'Failed to send verification email');
                        } finally {
                          setSendingVerification(false);
                        }
                      }}
                      className="text-[10px] font-black text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50"
                    >
                      {sendingVerification ? 'Sending...' : 'Send Verification Email'}
                    </button>
                  </>
                )}
              </div>
           </div>
           <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest pl-1">Bio</label>
              <textarea 
                rows="4"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                placeholder="Passionate lifelong learner currently exploring UI/UX and advanced Python architectures..."
                className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-sm font-bold text-zinc-900 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-none leading-relaxed" 
              />
           </div>
           <div className="md:col-span-2 flex justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="px-10 py-4 bg-primary-600 text-white font-black text-sm rounded-full shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
                <Save className="w-4 h-4" />
              </button>
           </div>
        </form>
      </section>

      {/* 2. ACCOUNT & SECURITY */}
      <div className="grid grid-cols-1 gap-8">
        {/* Account Details */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/40 space-y-8">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
              <h2 className="text-xl font-black text-zinc-900 tracking-tight">Account Details</h2>
           </div>

           <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-1">Username</label>
                  <div className="relative">
                    {isEditingUsername ? (
                      <input 
                        type="text" 
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white border border-primary-500 rounded-2xl text-sm font-bold text-zinc-900 outline-none"
                        autoFocus
                        onBlur={handleProfileUpdate}
                      />
                    ) : (
                      <div className="px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 flex items-center justify-between">
                         <span>{profileForm.username || 'Not set'}</span>
                         <button 
                          type="button"
                          onClick={() => setIsEditingUsername(true)}
                          className="text-primary-600 text-[11px] font-black uppercase tracking-widest"
                         >
                           Edit
                         </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-1">Phone</label>
                  <input 
                    type="text" 
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    placeholder="+1 (555) 012-3456"
                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 focus:bg-white transition-all outline-none" 
                    onBlur={handleProfileUpdate}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-1">Language</label>
                  <div className="relative group">
                    <select 
                      value={profileForm.language}
                      onChange={(e) => {
                        const newLanguage = e.target.value;
                        setProfileForm(prev => ({ ...prev, language: newLanguage }));
                        updateProfile({ ...profileForm, language: newLanguage });
                      }}
                      className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 appearance-none focus:bg-white transition-all outline-none cursor-pointer"
                    >
                      <option>English (US)</option>
                      <option>French (FR)</option>
                      <option>Spanish (ES)</option>
                      <option>German (DE)</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                  </div>
                </div>
              </div>
           </form>
        </div>
      </div>

      {/* 3. SECURITY (Password Change Only) */}
      <section className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-zinc-100 shadow-xl shadow-zinc-200/40 space-y-8">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Security</h2>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { label: 'Current Password', key: 'currentPassword' },
               { label: 'New Password', key: 'newPassword' },
               { label: 'Confirm New', key: 'confirmNew' }
             ].map((field, i) => (
               <div key={i} className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">{field.label}</label>
                  <div className="relative group">
                    <input 
                      type={showPass[field.key.includes('current') ? 'current' : field.key.includes('newPassword') ? 'new' : 'confirm'] ? 'text' : 'password'}
                      value={passwordForm[field.key]}
                      onChange={(e) => setPasswordForm({...passwordForm, [field.key]: e.target.value})}
                      placeholder={i === 0 ? '••••••••' : 'Enter new'}
                      className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 focus:bg-white transition-all outline-none pr-12" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(prev => ({...prev, [field.key.includes('current') ? 'current' : field.key.includes('newPassword') ? 'new' : 'confirm']: !prev[field.key.includes('current') ? 'current' : field.key.includes('newPassword') ? 'new' : 'confirm']}))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 transition-colors"
                    >
                      {showPass[field.key.includes('current') ? 'current' : field.key.includes('newPassword') ? 'new' : 'confirm'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
               </div>
             ))}
           </div>
           <div className="flex justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="px-10 py-4 bg-emerald-600 text-white font-black text-sm rounded-full shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                Update Password
              </button>
           </div>
        </form>
      </section>

      {/* 4. NOTIFICATIONS */}
      <section className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-zinc-100 shadow-xl shadow-zinc-200/40 space-y-8">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Notifications</h2>
        </div>

        <div className="space-y-2">
           {[
             { title: 'Email notifications', desc: 'Weekly digest and activity alerts', key: 'emailNotifications' },
             { title: 'Live class reminders', desc: 'Get notified 15 minutes before starts', key: 'liveClassReminders' },
             { title: 'Chat messages', desc: 'Instructor and peer replies', key: 'chatMessages' },
             { title: 'Course updates', desc: 'New lessons and downloadable resources', key: 'courseUpdates' }
           ].map((notif, i) => (
              <div key={i} className="flex items-center justify-between p-4 px-6 hover:bg-zinc-50 rounded-2xl transition-colors group">
                 <div>
                    <h4 className="text-sm font-bold text-zinc-900">{notif.title}</h4>
                    <p className="text-xs text-zinc-400 font-medium mt-0.5">{notif.desc}</p>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                   <input 
                     type="checkbox" 
                     className="sr-only peer" 
                     checked={notifications[notif.key]}
                     onChange={(e) => handleToggleNotification(notif.key, e.target.checked)}
                   />
                   <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[20px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                 </label>
              </div>
           ))}
        </div>
      </section>

      {/* 5. DANGER ZONE */}
      <section className="bg-red-50/50 rounded-[2.5rem] p-8 lg:p-10 border border-red-100 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h2 className="text-xl font-black text-red-600 tracking-tight">Danger Zone</h2>
              <p className="text-xs text-red-400 font-medium mt-1">Permanently delete your account and all associated data.</p>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={logout}
                className="px-8 py-3.5 text-zinc-500 font-black text-xs uppercase tracking-widest hover:text-zinc-900 transition-colors"
              >
                Logout
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="px-8 py-3.5 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-700 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
           </div>
        </div>
      </section>

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 border border-zinc-100 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-xl font-black tracking-tight">Delete Account</h3>
            </div>
            
            <p className="text-sm text-zinc-500 font-medium leading-relaxed">
              This action is permanent and cannot be undone. All your progress, course enrollments, and certificates will be lost.
            </p>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                Type <span className="text-red-600 font-black font-mono">delete my account</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="delete my account"
                className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none"
              />
            </div>
            
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText('');
                }}
                className="px-6 py-3.5 text-zinc-500 font-black text-xs uppercase tracking-widest hover:bg-zinc-50 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirmationText !== 'delete my account'}
                onClick={handleDeleteAccount}
                className="px-8 py-3.5 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SettingsPage;
