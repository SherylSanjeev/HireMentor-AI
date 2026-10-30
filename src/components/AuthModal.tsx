import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, X, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
import { HireMentorLogo } from './HireMentorLogo';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const { login, signup, loadDemoAccount } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify.');
        return;
      }

      setLoading(true);
      try {
        await signup(name, email, password);
        onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to sign up.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'login') {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter your email.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      setLoading(true);
      try {
        await login(email, password);
        onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to log in.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter your registered email address.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setForgotSubmitted(true);
      }, 500);
    }
  };

  const handlePreFillDemo = () => {
    setEmail('alex.rivera@example.com');
    setPassword('mentor2026!');
    setConfirmPassword('mentor2026!');
  };

  const handleInstantDemoLogin = () => {
    loadDemoAccount();
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#502D55]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#F8F4E9] rounded-3xl shadow-2xl border border-[#935073]/30 overflow-hidden">
        {/* Header in Deep Violet with HireMentor Logo */}
        <div className="bg-[#502D55] px-6 pt-6 pb-5 text-[#F8F4E9] relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-[#F8F4E9]/70 hover:text-[#F8F4E9] hover:bg-[#935073]/40 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Vector Logo: Glasses + Tie + Laurel Leaves */}
            <div className="mb-2">
              <HireMentorLogo size={52} variant="light" />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-[#F8F4E9]">
              {mode === 'login' && 'Log In to HireMentor AI'}
              {mode === 'signup' && 'Create Your Career Account'}
              {mode === 'forgot' && 'Reset Account Password'}
            </h2>

            <p className="text-[#F6DBC0] text-xs mt-1">
              {mode === 'login' && 'Enter your credentials to access your mentor dashboard'}
              {mode === 'signup' && 'Sign up to evaluate resumes, match jobs, and practice interviews'}
              {mode === 'forgot' && 'Enter your email to receive recovery instructions'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          {mode !== 'forgot' && (
            <div className="flex bg-[#935073]/40 p-1 rounded-xl mt-4 border border-[#F6DBC0]/20">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('login');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#F8F4E9] text-[#502D55] shadow-xs'
                    : 'text-[#F8F4E9]/80 hover:text-[#F8F4E9]'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('signup');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#F8F4E9] text-[#502D55] shadow-xs'
                    : 'text-[#F8F4E9]/80 hover:text-[#F8F4E9]'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Form Body in Soft Ivory */}
        <div className="p-6 text-[#502D55]">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#935073]/15 border border-[#935073]/30 text-[#502D55] text-xs font-semibold">
              {error}
            </div>
          )}

          {mode === 'forgot' && forgotSubmitted ? (
            <div className="text-center py-5">
              <div className="w-12 h-12 bg-[#F6DBC0] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#935073]/20">
                <CheckCircle2 className="w-6 h-6 text-[#502D55]" />
              </div>
              <h3 className="text-base font-bold text-[#502D55]">Password Reset Email Sent!</h3>
              <p className="text-xs text-[#935073] mt-1.5 max-w-xs mx-auto">
                We've dispatched password recovery steps to <strong className="text-[#502D55]">{email}</strong>. Check your inbox to proceed.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForgotSubmitted(false);
                  setMode('login');
                }}
                className="mt-5 px-5 py-2.5 bg-[#502D55] text-[#F8F4E9] rounded-xl text-xs font-bold hover:bg-[#935073] transition cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#502D55] mb-1">
                    Full Name <span className="text-[#935073]">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#935073] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#935073]/30 bg-white text-[#502D55] focus:outline-none focus:ring-2 focus:ring-[#935073]/40 focus:border-[#502D55]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#502D55] mb-1">
                  Email Address <span className="text-[#935073]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#935073] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#935073]/30 bg-white text-[#502D55] focus:outline-none focus:ring-2 focus:ring-[#935073]/40 focus:border-[#502D55]"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#502D55]">
                      Password <span className="text-[#935073]">*</span>
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setMode('forgot');
                        }}
                        className="text-xs text-[#935073] hover:text-[#502D55] font-semibold cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#935073] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-[#935073]/30 bg-white text-[#502D55] focus:outline-none focus:ring-2 focus:ring-[#935073]/40 focus:border-[#502D55]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#935073] hover:text-[#502D55] cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#502D55] mb-1">
                    Confirm Password <span className="text-[#935073]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#935073] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-[#935073]/30 bg-white text-[#502D55] focus:outline-none focus:ring-2 focus:ring-[#935073]/40 focus:border-[#502D55]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#935073] hover:text-[#502D55] cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Primary action button: Deep Violet (#502D55), text #F8F4E9, hover #935073 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 mt-2 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] rounded-xl text-sm font-bold shadow-md shadow-[#502D55]/20 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Log In to Dashboard'}
                      {mode === 'signup' && 'Create Account & Enter'}
                      {mode === 'forgot' && 'Send Reset Link'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#F6DBC0]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Pre-fill & Instant Log In */}
          <div className="mt-4 pt-4 border-t border-[#935073]/20 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#935073]">
              <span className="font-semibold">Hackathon / Evaluator Access</span>
              <button
                type="button"
                onClick={handlePreFillDemo}
                className="text-[11px] text-[#502D55] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <KeyRound className="w-3 h-3 text-[#935073]" />
                <span>Pre-fill Demo Credentials</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleInstantDemoLogin}
              className="w-full py-2.5 px-3 bg-[#F6DBC0] hover:bg-[#F6DBC0]/85 text-[#502D55] border border-[#935073]/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Instant Test: Sign in as Alex Rivera</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Switch Prompt */}
          <div className="mt-4 text-center text-xs text-[#935073]">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('signup');
                  }}
                  className="font-bold text-[#502D55] hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('login');
                  }}
                  className="font-bold text-[#502D55] hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('login');
                }}
                className="font-bold text-[#502D55] hover:underline cursor-pointer"
              >
                Back to log in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
