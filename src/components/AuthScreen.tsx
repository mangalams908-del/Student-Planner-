import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthMode } from '../types';
import { BookOpen, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface AuthScreenProps {
  initialMode?: AuthMode;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ initialMode = 'login' }) => {
  const { login, signup, resetPassword, signInWithGoogle, isFirebaseLive } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (mode !== 'forgot_password' && !password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'signup') {
        await signup(email, password);
      } else if (mode === 'forgot_password') {
        await resetPassword(email);
        setSuccessMessage('Password reset instructions have been sent to your email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col justify-center items-center px-4 py-8 font-sans">
      {/* Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Navy Header */}
        <div className="bg-[#0c1f38] px-6 py-7 text-white text-center relative overflow-hidden">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 items-center justify-center text-blue-200 mb-2 shadow-inner">
            <BookOpen className="w-6 h-6 text-blue-300" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Student Planner <span className="text-blue-300 font-semibold text-xs px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/20">Lite</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs mx-auto">
            {mode === 'login' && 'Sign in to access your personal coursework and growth metrics'}
            {mode === 'signup' && 'Create your personal study planner account to get started'}
            {mode === 'forgot_password' && 'Enter your email to reset your account password'}
          </p>

          {/* Connection Status Pill */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/10 text-slate-200 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${isFirebaseLive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{isFirebaseLive ? 'Live Firebase Cloud Connected' : 'Preview Mode'}</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7">
          {/* Messages */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              {errorMessage.includes('Firebase') && (
                <div className="mt-2.5 pt-2 border-t border-rose-200/80">
                  <a
                    href="https://console.firebase.google.com/project/level-primacy-lbcxw/authentication/providers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 hover:underline"
                  >
                    <span>Enable Email/Password in Firebase Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google One-Tap Sign In */}
          {mode !== 'forgot_password' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 disabled:opacity-60"
              >
                {googleLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-[#0c1f38] rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  <span className="bg-white px-3">or continue with email</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Student Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 focus:border-[#1e40af]"
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs text-[#1e40af] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 focus:border-[#1e40af]"
                  />
                </div>
              </div>
            )}

            {/* Confirm Password on Signup */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 focus:border-[#1e40af]"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 px-4 bg-[#0c1f38] hover:bg-[#163359] disabled:opacity-70 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In with Email'}
                    {mode === 'signup' && 'Create Account with Email'}
                    {mode === 'forgot_password' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch Modes */}
          <div className="mt-4 text-center text-xs text-slate-500">
            {mode === 'login' && (
              <p>
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#1e40af] font-bold hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#1e40af] font-bold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot_password' && (
              <p>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#1e40af] font-bold hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
