import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, CheckCircle, Loader2, Sparkles, KeyRound } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, verifyOTP, resetPassword } = useContext(AuthContext);

  // Flow State: 1 = Email Input, 2 = OTP & Password Input, 3 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1: Submit Email to request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await forgotPassword(email);
      if (res.success) {
        setStep(2);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to generate verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit OTP and Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // First verify the OTP
      const verifyRes = await verifyOTP(email, otp);
      if (!verifyRes.success) {
        setError(verifyRes.message);
        setIsSubmitting(false);
        return;
      }

      // If valid, submit the password reset
      const resetRes = await resetPassword(email, otp, password);
      if (resetRes.success) {
        setStep(3);
      } else {
        setError(resetRes.message);
      }
    } catch (err) {
      setError('An error occurred during password reset. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          
          {step === 1 && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-primary-500" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Forgot Password</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Enter your email address to receive a 6-digit verification code (OTP) to reset your password.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-5">
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
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    'Send Verification OTP'
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link
                  to="/login"
                  className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-primary-500" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Verify OTP & Reset</h3>
              </div>

              {/* OTP Alert Box */}
              <div className="mb-5 p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-indigo-700 dark:text-indigo-300 text-xs flex items-start gap-2.5">
                <KeyRound size={16} className="mt-0.5 shrink-0 text-indigo-500" />
                <div>
                  <span className="font-bold block mb-0.5">Verification Code Sent</span>
                  We've sent a 6-digit verification code to <strong className="text-slate-800 dark:text-white">{email}</strong>. Please check your inbox.
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5" autoComplete="off">
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

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    New Password
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
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                      placeholder="....."
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      title={showConfirmPassword ? 'Hide Confirm Password' : 'Show Confirm Password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      'Verify & Reset Password'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                      setOtp('');
                    }}
                    className="w-full py-3 rounded-xl border border-slate-200 dark:border-darkBorder text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
                  >
                    Change Email Address
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
                <CheckCircle size={28} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Password Reset Successful</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Your password has been updated successfully. You can now use your new password to sign in to your account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-primary-500/25 transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
