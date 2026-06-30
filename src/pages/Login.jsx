import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Loader2, Sparkles, Eye, EyeOff, KeyRound } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, verifyLoginOTP, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  // Step states: 'login' or 'verify-otp'
  const [step, setStep] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);



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
          const res = await loginWithGoogle(email, name, email.split('@')[0], picture, password);
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
  }, [loginWithGoogle, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await login(email, password);
      
      if (!res.success) {
        setError(res.message);
      } else if (res.requireVerification) {
        setStep('verify-otp');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');
      const res = await verifyLoginOTP(email, otp);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

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
              const res = await loginWithGoogle(response.access_token);
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-darkBg px-4 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 dark:bg-primary-500/5 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full filter blur-3xl" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 text-white font-bold text-2xl shadow-lg shadow-primary-500/20 mb-3">
            S
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            StudyAI
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Smart Learning & AI-Powered Revision platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-xl shadow-slate-100/40 dark:shadow-none p-8">
          
          {step === 'verify-otp' ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-primary-500" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Verify Your Account</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Welcome to StudyAI! We've sent a 6-digit verification code (OTP) to <strong className="text-slate-800 dark:text-white">{email}</strong> to complete your login. Please check your inbox.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5" autoComplete="off">
                {/* OTP Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    6-Digit Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm tracking-widest text-center font-bold text-lg"
                    placeholder="000000"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      'Verify & Log In'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('login');
                      setError('');
                      setOtp('');
                    }}
                    className="w-full py-3 rounded-xl border border-slate-200 dark:border-darkBorder text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={18} className="text-primary-500" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Welcome back!</h3>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                      placeholder="example@gmail.com"
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                      placeholder="....."
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      title={showPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Link
                      to="/reset-password"
                      className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-primary-500/10 hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    'Sign In'
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
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-darkBorder text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-all flex items-center justify-center gap-2.5 shadow-sm"
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
              <div className="text-center mt-6">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                  >
                    Create Account
                  </Link>
                </span>
              </div>
            </>
          )}
        </div>
      </div>


    </div>
  );
};

export default Login;
