import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Lock,
  CreditCard,
  Bell,
  Shield,
  Camera,
  Save,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Mail,
  Phone,
  Building2,
  Smartphone,
  Check,
  X,
  Laptop,
  Trash2
} from 'lucide-react';
import { 
  FaGithub as Github, 
  FaLinkedin as Linkedin, 
  FaTwitter as Twitter 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { 
  getSettings,
  updateProfile, 
  updateAvatar, 
  changePassword, 
  requestEmailChange, 
  verifyEmailOtp, 
  logoutAllDevices 
} from '../../services/instructorDashboardService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Core Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    socialLinks: {
      website: '',
      linkedin: '',
      twitter: '',
      github: ''
    },
    paymentDetails: {
      bank: {
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        accountHolderName: ''
      },
      upi: {
        upiId: ''
      }
    },
    notificationPreferences: {
      emailNotifications: true,
      courseEnrollments: true,
      reviews: true,
      qaQuestions: true,
      payouts: true,
      messages: true,
      liveClasses: true
    },
    privacySettings: {
      showEmail: true,
      showProfile: true
    }
  });

  // Security Form States
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [pwdStrength, setPwdStrength] = useState({ score: 0, label: 'None', color: 'bg-slate-200' });

  // Email OTP States
  const [newEmail, setNewEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [submittingEmailOtp, setSubmittingEmailOtp] = useState(false);

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState([]);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Load user data on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSettings();
      if (res.success && res.user) {
        const u = res.user;
        const mappedData = {
          name: u.name || '',
          phone: u.phone || '',
          bio: u.bio || '',
          socialLinks: {
            website: u.socialLinks?.website || '',
            linkedin: u.socialLinks?.linkedin || '',
            twitter: u.socialLinks?.twitter || '',
            github: u.socialLinks?.github || ''
          },
          paymentDetails: {
            bank: {
              accountNumber: u.paymentDetails?.bank?.accountNumber || '',
              ifscCode: u.paymentDetails?.bank?.ifscCode || '',
              bankName: u.paymentDetails?.bank?.bankName || '',
              accountHolderName: u.paymentDetails?.bank?.accountHolderName || ''
            },
            upi: {
              upiId: u.paymentDetails?.upi?.upiId || ''
            }
          },
          notificationPreferences: {
            emailNotifications: u.notificationPreferences?.emailNotifications ?? true,
            courseEnrollments: u.notificationPreferences?.courseEnrollments ?? true,
            reviews: u.notificationPreferences?.reviews ?? true,
            qaQuestions: u.notificationPreferences?.qaQuestions ?? true,
            payouts: u.notificationPreferences?.payouts ?? true,
            messages: u.notificationPreferences?.messages ?? true,
            liveClasses: u.notificationPreferences?.liveClasses ?? true
          },
          privacySettings: {
            showEmail: u.privacySettings?.showEmail ?? true,
            showProfile: u.privacySettings?.showProfile ?? true
          }
        };
        setFormData(mappedData);
        setActiveSessions(u.activeSessions || []);
        setNewEmail(u.email || '');
        setAvatarPreview(u.avatar || u.profilePic || null);
        setIsDirty(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load settings from server');
    } finally {
      setLoading(false);
    }
  };

  // Detect Unsaved Changes
  const checkDirty = (updatedData) => {
    if (!user) return;
    const cleanUser = {
      name: user.name || '',
      phone: user.phone || '',
      bio: user.bio || '',
      socialLinks: {
        website: user.socialLinks?.website || '',
        linkedin: user.socialLinks?.linkedin || '',
        twitter: user.socialLinks?.twitter || '',
        github: user.socialLinks?.github || ''
      },
      paymentDetails: {
        bank: {
          accountNumber: user.paymentDetails?.bank?.accountNumber || '',
          ifscCode: user.paymentDetails?.bank?.ifscCode || '',
          bankName: user.paymentDetails?.bank?.bankName || '',
          accountHolderName: user.paymentDetails?.bank?.accountHolderName || ''
        },
        upi: {
          upiId: user.paymentDetails?.upi?.upiId || ''
        }
      },
      notificationPreferences: {
        emailNotifications: user.notificationPreferences?.emailNotifications ?? true,
        courseEnrollments: user.notificationPreferences?.courseEnrollments ?? true,
        reviews: user.notificationPreferences?.reviews ?? true,
        qaQuestions: user.notificationPreferences?.qaQuestions ?? true,
        payouts: user.notificationPreferences?.payouts ?? true,
        messages: user.notificationPreferences?.messages ?? true,
        liveClasses: user.notificationPreferences?.liveClasses ?? true
      },
      privacySettings: {
        showEmail: user.privacySettings?.showEmail ?? true,
        showProfile: user.privacySettings?.showProfile ?? true
      }
    };
    const isDifferent = JSON.stringify(cleanUser) !== JSON.stringify(updatedData);
    setIsDirty(isDifferent);
  };

  const handleInputChange = (path, value) => {
    const keys = path.split('.');
    let updated;
    if (keys.length === 1) {
      updated = { ...formData, [keys[0]]: value };
    } else if (keys.length === 2) {
      updated = {
        ...formData,
        [keys[0]]: { ...formData[keys[0]], [keys[1]]: value }
      };
    } else if (keys.length === 3) {
      updated = {
        ...formData,
        [keys[0]]: {
          ...formData[keys[0]],
          [keys[1]]: { ...formData[keys[0]][keys[1]], [keys[2]]: value }
        }
      };
    }
    setFormData(updated);
    checkDirty(updated);
  };

  // Avatar Upload Logic
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Avatar file size cannot exceed 2MB');
    }

    // Validate image format
    if (!file.type.startsWith('image/')) {
      return toast.error('Only image formats are supported');
    }

    // Local Preview
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);

    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);

      const res = await updateAvatar(uploadForm);
      if (res.success) {
        toast.success('Profile picture updated!');
        updateUser(res.user);
        setAvatarPreview(res.avatar);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
      // Revert preview
      setAvatarPreview(user?.avatar || user?.profilePic || null);
    } finally {
      setAvatarUploading(false);
    }
  };

  // Save Settings Changes
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await updateProfile(formData);
      if (res.success) {
        toast.success('Settings updated successfully!');
        updateUser(res.user);
        setIsDirty(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  // Reset local state to last saved
  const handleReset = () => {
    fetchSettings();
  };

  // Password Strength Logic
  const checkPwdStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmNewPassword) {
      return toast.error('New passwords do not match');
    }
    if (securityData.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }

    try {
      setLoading(true);
      const res = await changePassword({
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword
      });
      if (res.success) {
        toast.success('Password changed successfully!');
        setSecurityData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        setPwdStrength({ score: 0, label: 'None', color: 'bg-slate-200' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Request Email Update
  const handleRequestEmail = async (e) => {
    e.preventDefault();
    if (!newEmail || newEmail === user.email) return toast.error('Please enter a new email address');
    try {
      setLoading(true);
      const res = await requestEmailChange(newEmail);
      if (res.success) {
        toast.success('Verification OTP code sent to your new email!');
        setOtpSent(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request email change');
    } finally {
      setLoading(false);
    }
  };

  // Verify Email Change OTP
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!emailOtp || emailOtp.length !== 6) return toast.error('OTP code must be 6 digits');
    try {
      setSubmittingEmailOtp(true);
      const res = await verifyEmailOtp(emailOtp);
      if (res.success) {
        toast.success('Email address updated successfully!');
        updateUser(res.user);
        setOtpSent(false);
        setEmailOtp('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP code');
    } finally {
      setSubmittingEmailOtp(false);
    }
  };

  // Logout other devices
  const handleLogoutAll = async () => {
    if (!window.confirm('Are you sure you want to log out from all other devices? This will terminate other active sessions.')) return;
    try {
      setLoading(true);
      const res = await logoutAllDevices();
      if (res.success) {
        toast.success('Successfully logged out of all other sessions');
        setActiveSessions([]);
      }
    } catch (error) {
      toast.error('Failed to log out of other devices');
    } finally {
      setLoading(false);
    }
  };

  // Profile Completion Score
  const getProfileCompletion = () => {
    const fields = [
      formData.name,
      formData.bio,
      formData.phone,
      formData.socialLinks?.website,
      formData.socialLinks?.linkedin,
      formData.socialLinks?.twitter,
      formData.socialLinks?.github,
      avatarPreview
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'payments', label: 'Payout Details', icon: CreditCard },
    { id: 'notifications', label: 'Preferences', icon: Bell },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-24">
      {/* Header and Progress Indicator */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Account Settings</h2>
          <p className="text-sm text-slate-500">Configure your profile, notification rules, and devices</p>
        </div>
        <div className="w-full md:w-64 bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1.5 shrink-0">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Profile Completion</span>
            <span className="text-primary-600 font-mono text-sm">{getProfileCompletion()}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-500 rounded-full" 
              style={{ width: `${getProfileCompletion()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Nav Tabs */}
        <div className="w-full lg:w-64 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-xl shadow-primary-100'
                  : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="flex-1 w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-8 lg:p-10">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-10">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[2.2rem] overflow-hidden ring-8 ring-slate-50 shadow-xl relative">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt={formData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-4xl">
                          {formData.name.charAt(0) || 'U'}
                        </div>
                      )}
                      {avatarUploading && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-lg transition-transform hover:scale-110"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-slate-900">{formData.name || 'Your Name'}</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-0.5">{user?.role} Account</p>
                    <p className="text-[10px] text-slate-400 mt-2">Maximum file size 2MB. Supports JPG, PNG, GIF</p>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    icon={User}
                    required
                  />
                  <Input
                    label="Email Address (Verify or Request Change via Security)"
                    value={user?.email || ''}
                    icon={Mail}
                    disabled
                  />
                  <Input
                    label="Phone Number"
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    icon={Phone}
                    placeholder="+1 555-555-5555"
                  />
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor Bio</label>
                      <span className="text-[10px] font-bold text-slate-400">{formData.bio.length}/500</span>
                    </div>
                    <textarea
                      value={formData.bio}
                      onChange={e => handleInputChange('bio', e.target.value.slice(0, 500))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none h-32 resize-none font-medium text-slate-700 transition-all"
                      placeholder="Share your professional background, certifications, and teaching approach with students..."
                    />
                  </div>
                </div>

                {/* Social Settings */}
                <div className="pt-8 border-t border-slate-50">
                  <h4 className="text-xs font-black text-slate-900 mb-6 uppercase tracking-widest">Social Profiles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Personal Website"
                      value={formData.socialLinks.website}
                      onChange={e => handleInputChange('socialLinks.website', e.target.value)}
                      icon={Globe}
                      placeholder="https://yourdomain.com"
                    />
                    <Input
                      label="LinkedIn Link"
                      value={formData.socialLinks.linkedin}
                      onChange={e => handleInputChange('socialLinks.linkedin', e.target.value)}
                      icon={Linkedin}
                      placeholder="https://linkedin.com/in/username"
                    />
                    <Input
                      label="Twitter / X Link"
                      value={formData.socialLinks.twitter}
                      onChange={e => handleInputChange('socialLinks.twitter', e.target.value)}
                      icon={Twitter}
                      placeholder="https://x.com/username"
                    />
                    <Input
                      label="GitHub Profile"
                      value={formData.socialLinks.github}
                      onChange={e => handleInputChange('socialLinks.github', e.target.value)}
                      icon={Github}
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>

                {/* Privacy Preferences */}
                <div className="pt-8 border-t border-slate-50">
                  <h4 className="text-xs font-black text-slate-900 mb-6 uppercase tracking-widest">Privacy Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Toggle
                      label="Show Email on Public Profile"
                      description="Allow students and guests to view your email address"
                      checked={formData.privacySettings.showEmail}
                      onChange={v => handleInputChange('privacySettings.showEmail', v)}
                    />
                    <Toggle
                      label="List Profile publicly"
                      description="Let search engines index your public profile page"
                      checked={formData.privacySettings.showProfile}
                      onChange={v => handleInputChange('privacySettings.showProfile', v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                {/* Email Change */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary-600" />
                    Change Account Email Address
                  </h4>
                  <p className="text-xs text-slate-400">Changing your email address requires verifying your identity via a code sent to the new email address.</p>
                  
                  {!otpSent ? (
                    <form onSubmit={handleRequestEmail} className="flex flex-col sm:flex-row gap-4 items-end max-w-xl">
                      <div className="flex-1 w-full">
                        <Input
                          label="New Email Address"
                          value={newEmail}
                          onChange={e => setNewEmail(e.target.value)}
                          icon={Mail}
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={loading || newEmail === user.email}
                        className="px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl text-xs transition-colors shrink-0 disabled:opacity-50"
                      >
                        Request OTP
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyEmailOtp} className="space-y-4 max-w-xl bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verification Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={emailOtp}
                          onChange={e => setEmailOtp(e.target.value)}
                          placeholder="######"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-black tracking-widest text-center text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <button 
                          type="button" 
                          onClick={() => setOtpSent(false)}
                          className="text-xs font-bold text-slate-400 hover:underline"
                        >
                          Change Email Address
                        </button>
                        <div className="flex gap-2">
                          <button 
                            type="button" 
                            onClick={() => setOtpSent(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            disabled={submittingEmailOtp}
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                          >
                            {submittingEmailOtp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Verify & Update
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {/* Change Password */}
                <form onSubmit={handlePasswordChange} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary-600" />
                    Change Account Password
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="Current Password"
                      type="password"
                      value={securityData.currentPassword}
                      onChange={e => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      icon={Lock}
                      required
                    />
                    <div className="relative">
                      <Input
                        label="New Password"
                        type="password"
                        value={securityData.newPassword}
                        onChange={e => {
                          const val = e.target.value;
                          setSecurityData(prev => ({ ...prev, newPassword: val }));
                          setPwdStrength(checkPwdStrength(val));
                        }}
                        icon={Lock}
                        required
                      />
                      {securityData.newPassword && (
                        <div className="mt-2.5 space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                            <span>Strength: {pwdStrength.label}</span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${pwdStrength.color} transition-all duration-300`} 
                              style={{ width: `${(pwdStrength.score / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={securityData.confirmNewPassword}
                      onChange={e => setSecurityData(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                      icon={Lock}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || !securityData.newPassword}
                      className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl text-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </form>

                {/* Session Management */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Laptop className="w-5 h-5 text-primary-600" />
                        Active Devices & Sessions
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">Here is a list of devices currently logged in to your account. Terminate other sessions if you notice suspicious activity.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleLogoutAll}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Logout All Devices
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {activeSessions.map((session, idx) => (
                      <div key={idx} className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-3">
                          <Laptop className="w-6 h-6 text-slate-400" />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{session.device || 'Unknown Browser'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.ip || 'Unknown IP'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase">Active</span>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Last seen: {new Date(session.lastActive).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    {activeSessions.length === 0 && (
                      <p className="text-sm text-slate-400 italic text-center py-6">No session info logged</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-10">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary-600" />
                    Bank Transfer Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Account Holder Name"
                      value={formData.paymentDetails.bank.accountHolderName}
                      onChange={e => handleInputChange('paymentDetails.bank.accountHolderName', e.target.value)}
                      icon={User}
                      placeholder="Account holder's full name"
                    />
                    <Input
                      label="Bank Name"
                      value={formData.paymentDetails.bank.bankName}
                      onChange={e => handleInputChange('paymentDetails.bank.bankName', e.target.value)}
                      icon={Building2}
                      placeholder="e.g. HDFC Bank"
                    />
                    <Input
                      label="Account Number"
                      value={formData.paymentDetails.bank.accountNumber}
                      onChange={e => handleInputChange('paymentDetails.bank.accountNumber', e.target.value)}
                      icon={CreditCard}
                      placeholder="#######"
                    />
                    <Input
                      label="Bank IFSC Code"
                      value={formData.paymentDetails.bank.ifscCode}
                      onChange={e => handleInputChange('paymentDetails.bank.ifscCode', e.target.value)}
                      icon={Globe}
                      placeholder="e.g. HDFC0000123"
                    />
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-50">
                  <h4 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-primary-600" />
                    UPI Direct Settings
                  </h4>
                  <div className="max-w-md">
                    <Input
                      label="UPI ID"
                      value={formData.paymentDetails.upi.upiId}
                      onChange={e => handleInputChange('paymentDetails.upi.upiId', e.target.value)}
                      icon={Smartphone}
                      placeholder="username@okaxis"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest">Real-time Notification Preferences</h4>
                <div className="space-y-4">
                  <Toggle
                    label="Global Email Alerts"
                    description="Allow Zinda Learn to dispatch transaction or update email notifications to your inbox"
                    checked={formData.notificationPreferences.emailNotifications}
                    onChange={v => handleInputChange('notificationPreferences.emailNotifications', v)}
                  />
                  <Toggle
                    label="Course Enrollment Notifications"
                    description="Receive notifications whenever a student registers for your curriculum"
                    checked={formData.notificationPreferences.courseEnrollments}
                    onChange={v => handleInputChange('notificationPreferences.courseEnrollments', v)}
                  />
                  <Toggle
                    label="New Reviews & Ratings"
                    description="Be notified immediately when students submit reviews or star ratings"
                    checked={formData.notificationPreferences.reviews}
                    onChange={v => handleInputChange('notificationPreferences.reviews', v)}
                  />
                  <Toggle
                    label="Student Q&A Submissions"
                    description="Stay informed when students post questions on course curriculum timelines"
                    checked={formData.notificationPreferences.qaQuestions}
                    onChange={v => handleInputChange('notificationPreferences.qaQuestions', v)}
                  />
                  <Toggle
                    label="Payout & Earning Status Updates"
                    description="Stay notified about direct bank payouts and withdrawal request logs"
                    checked={formData.notificationPreferences.payouts}
                    onChange={v => handleInputChange('notificationPreferences.payouts', v)}
                  />
                  <Toggle
                    label="Direct Chat Messaging alerts"
                    description="Get notified when students message you regarding course content"
                    checked={formData.notificationPreferences.messages}
                    onChange={v => handleInputChange('notificationPreferences.messages', v)}
                  />
                  <Toggle
                    label="Upcoming Live Class Updates"
                    description="Receive start alerts 15 minutes before your scheduled live interactive sessions"
                    checked={formData.notificationPreferences.liveClasses}
                    onChange={v => handleInputChange('notificationPreferences.liveClasses', v)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Save Changes Bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div 
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-3xl flex justify-between items-center shadow-2xl z-50 gap-4"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <span className="text-xs font-bold sm:text-sm">You have unsaved configuration changes</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2 text-xs font-black text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Input = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-12' : 'px-4'} pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-bold text-slate-700 disabled:opacity-50 outline-none`}
      />
    </div>
  </div>
);

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-primary-100 hover:bg-white transition-all">
    <div className="pr-6">
      <h5 className="font-bold text-slate-900 text-sm leading-snug">{label}</h5>
      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{description}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-all relative shrink-0 focus:outline-none ${checked ? 'bg-primary-600' : 'bg-slate-300'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  </div>
);

export default Settings;
