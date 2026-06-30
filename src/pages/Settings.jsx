import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import API from '../services/api';
import {
  User,
  Mail,
  Lock,
  Sun,
  Moon,
  Loader2,
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Settings = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState(user?.geminiApiKey || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [imageError, setImageError] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (password && password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    try {
      setIsSaving(true);
      const res = await updateProfile(name, email, password || null, avatarFile, geminiApiKey);
      if (res.success) {
        setStatus({ type: 'success', message: 'Profile updated successfully!' });
        setPassword('');
        setConfirmPassword('');
      } else {
        setStatus({ type: 'error', message: res.message });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Manage your account profile, credentials, theme settings, and language localization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: General Configuration Preferences */}
        <div className="space-y-6">
          {/* Theme card */}
          <div className="p-5 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Appearance</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-350">Dark Mode</span>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all border ${
                  theme === 'dark'
                    ? 'bg-primary-950/20 border-primary-500 text-primary-400'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>
          </div>


        </div>

        {/* Right Column: Profile updates */}
        <div className="md:col-span-2 p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User size={18} className="text-primary-500" /> Profile Information
          </h3>

          {status.message && (
            <div
              className={`p-3 border rounded-xl text-xs flex items-center gap-2 ${
                status.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400'
              }`}
            >
              {status.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {status.message}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Profile Avatar Selection */}
            <div className="flex flex-col items-center pb-2">
              <div className="relative cursor-pointer">
                <div className="w-20 h-20 rounded-full border border-slate-200 dark:border-darkBorder overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (user?.profilePicture && !imageError) ? (
                    <img
                      src={`${API.defaults.baseURL.replace('/api', '')}${user.profilePicture}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <User size={28} className="text-slate-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1.5 bg-primary-600 rounded-full text-white cursor-pointer hover:bg-primary-700 shadow-md">
                  <Camera size={12} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <span className="text-[10px] text-slate-400 mt-1.5">Change Avatar</span>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-xs"
                    required
                  />
                </div>
              </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  New Password (optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Save */}
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
