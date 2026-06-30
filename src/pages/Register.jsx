import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Sparkles, Loader2, Camera, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register, isAuthenticated, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();



  const handleGoogleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isMockMode = !clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID' || clientId.trim() === '';

    if (isMockMode) {
      setError('');
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      window.open(
        `/google-login-simulation.html${email ? `?email=${encodeURIComponent(email)}` : ''}`,
        'GoogleSignInSimulation',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
      );
    } else {
      setError('');
      try {
        if (!window.google) {
          setError('Google Sign-In SDK failed to load. Please refresh the page.');
          return;
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (response) => {
            if (response.error) {
              setError(`Google Login failed: ${response.error_description || response.error}`);
              return;
            }
            if (response.access_token) {
              setIsSubmitting(true);
              const res = await loginWithGoogle(response.access_token, null, null, null, null, role);
              setIsSubmitting(false);
              if (res.success) {
                navigate('/');
              } else {
                setError(res.message);
              }
            }
          },
          error_callback: (err) => {
            setError(`Google auth error: ${err.message}`);
          }
        });
        client.requestAccessToken();
      } catch (err) {
        console.error('Google OAuth client initialization failed:', err);
        setError('Failed to initialize Google Login Client.');
      }
    }
  };

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_SIGNIN_SUCCESS') {
        const { email, name, picture, password } = event.data.payload;
        setIsSubmitting(true);
        setError('');
        try {
          const res = await loginWithGoogle(email, name, email.split('@')[0], picture, password, role);
          if (res.success) {
            navigate('/');
          } else {
            setError(res.message);
          }
        } catch (err) {
          setError('Google Sign-In failed. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [loginWithGoogle, navigate, role]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !username || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const res = await register(name, username, email, password, role, profileFile);
      
      if (!res.success) {
        setError(res.message);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-darkBg px-4 py-8 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 dark:bg-primary-500/5 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full filter blur-3xl" />

      <div className="w-full max-w-lg z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 text-white font-bold text-2xl shadow-lg shadow-primary-500/20 mb-3">
            S
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Create Account
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Join StudyAI and start optimizing your revision schedules
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-darkBorder overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={28} className="text-slate-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1.5 bg-primary-600 rounded-full text-white cursor-pointer hover:bg-primary-700 shadow-md">
                  <Camera size={12} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <span className="text-[10px] text-slate-400 mt-1.5">Profile Picture (Optional)</span>
            </div>

            {/* Twin Grid Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                    placeholder="janedoe123"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  placeholder="example@gmail.com"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                    placeholder="....."
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                    placeholder="....."
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    title={showConfirmPassword ? 'Hide Confirm Password' : 'Show Confirm Password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Account Role
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    role === 'student'
                      ? 'bg-primary-50 dark:bg-primary-950/20 border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-slate-200 dark:border-darkBorder text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    role === 'teacher'
                      ? 'bg-primary-50 dark:bg-primary-950/20 border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-slate-200 dark:border-darkBorder text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Teacher
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center">
            <div className="flex-grow border-t border-slate-100 dark:border-darkBorder"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-darkCard px-2">
              Or continue with
            </span>
            <div className="flex-grow border-t border-slate-100 dark:border-darkBorder"></div>
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            className="w-full py-3 rounded-xl border border-slate-200 dark:border-darkBorder text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-all flex items-center justify-center gap-2.5 shadow-sm mb-4"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.89 3.02C6.21 7.42 8.87 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.09 2.67-2.31 3.49l3.58 2.78c2.1-1.94 3.79-4.79 3.79-8.42z" />
              <path fill="#FBBC05" d="M5.28 14.78a6.99 6.99 0 0 1 0-4.16L1.39 7.6a11.96 11.96 0 0 0 0 8.8l3.89-3.02C4.69 16.33 4.69 15.67 5.28 14.78z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.58-2.78c-.99.66-2.26 1.06-3.8 1.06-3.13 0-5.79-2.38-6.72-5.54l-3.89 3.02C3.37 20.33 7.35 23 12 23z" />
            </svg>
            Continue with Google
          </button>

          {/* Switch link */}
          <div className="text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
