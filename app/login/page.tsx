'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Loader2, Terminal, KeyRound, ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';

const ALLOWED_DOMAINS = ['takeoutmedia.xyz', 'tmlabs.xyz'];
const OTP_EXPIRY_SECONDS = 300; // 5 minutes

type Step = 'login' | 'forgot_email' | 'otp' | 'new_password';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifiedOtpCode, setVerifiedOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(OTP_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = useCallback(() => {
    setCountdown(OTP_EXPIRY_SECONDS);
    setCanResend(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const isValidEmail = (val: string) => {
    const parts = val.toLowerCase().trim().split('@');
    return parts.length === 2 && ALLOWED_DOMAINS.includes(parts[1]);
  };

  // Direct Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Only @takeoutmedia.xyz and @tmlabs.xyz email addresses are allowed.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError('');
    setInfoMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Explicit Password Error — STAY ON LOGIN PAGE and show error
        setError(data.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      // Check if user has not set up a password yet (first-time login / pending invite)
      if (data.requiresPasswordSetup) {
        setInfoMsg(data.message || 'You have not set up a password yet. Sending a verification code...');
        await handleSendOtp(email, 'otp');
        return;
      }

      // Login Successful — Direct Redirect (NO OTP)
      const role = data.role || 'staff';
      window.location.href = role === 'staff' ? '/mytasks' : '/';
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP for Password Setup / Reset
  const handleSendOtp = async (emailToUse = email, targetStep: Step = 'otp') => {
    if (!isValidEmail(emailToUse)) {
      setError('Only @takeoutmedia.xyz and @tmlabs.xyz email addresses are allowed.');
      return;
    }
    setIsLoading(true);
    setError('');
    setDevCode(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send verification code.');
        return;
      }
      if (data.devMode && data.code) {
        setDevCode(data.code);
      }
      setStep(targetStep);
      setOtp(['', '', '', '', '', '']);
      startCountdown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '') && !newOtp.includes('')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
      setTimeout(() => handleVerifyOtp(pasted), 50);
    }
  };

  // Verify OTP Code
  const handleVerifyOtp = async (code: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          code: code.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification failed. Incorrect code.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
        return;
      }

      // Valid OTP — Move to Set New Password screen
      setVerifiedOtpCode(code.trim());
      setStep('new_password');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit New Password
  const handleSetNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setError('Please enter your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          code: verifiedOtpCode,
          password: newPassword.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save password.');
        return;
      }

      const role = data.role || 'staff';
      window.location.href = role === 'staff' ? '/mytasks' : '/';
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-pink/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
            <img 
              src="/brand/Light Purple.png" 
              alt="TM Labs Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-3xl font-bold text-primary tracking-tight font-display">TM Labs</h1>
          <p className="text-secondary text-sm mt-1">Product Operations Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-8 shadow-2xl shadow-black/30">

          {/* Dev Mode Banner */}
          {devCode && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Terminal size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Dev Mode — Instant Verification Code</p>
                <p className="text-xs text-amber-300/80">Your 6-digit code is:</p>
                <p className="text-2xl font-mono font-bold tracking-[0.4em] text-amber-300 mt-1">{devCode}</p>
              </div>
            </div>
          )}

          {/* STEP 1: Main Login Screen (Email + Password) */}
          {step === 'login' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary mb-1">Welcome back</h2>
                <p className="text-secondary text-sm leading-relaxed">
                  Sign in with your work email and password.
                </p>
              </div>

              {infoMsg && (
                <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                  {infoMsg}
                </div>
              )}

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label htmlFor="email-input" className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); setInfoMsg(''); }}
                      placeholder="you@tmlabs.xyz"
                      className="w-full pl-9 pr-4 py-3 bg-elevated border border-slate-700/40 rounded-xl text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/50 focus:border-brand-pink/50 transition-all"
                      autoFocus
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password-input" className="block text-xs font-bold text-muted uppercase tracking-widest">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setInfoMsg('');
                        if (email.trim() && isValidEmail(email)) {
                          handleSendOtp(email, 'otp');
                        } else {
                          setStep('forgot_email');
                        }
                      }}
                      className="text-xs text-brand-pink hover:underline font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="Enter your password..."
                      className="w-full pl-4 pr-11 py-3 bg-elevated border border-slate-700/40 rounded-xl text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/50 focus:border-brand-pink/50 transition-all"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors cursor-pointer p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email.trim() || !password.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-pink hover:bg-brand-pink/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97] shadow-lg shadow-brand-pink/25 cursor-pointer"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* First time / Setup Password divider */}
              <div className="mt-6 pt-5 border-t border-slate-700/30 text-center">
                <p className="text-xs text-secondary mb-2">First time here or don't have a password yet?</p>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setInfoMsg('');
                    if (email.trim() && isValidEmail(email)) {
                      handleSendOtp(email, 'otp');
                    } else {
                      setStep('forgot_email');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-pink hover:underline cursor-pointer"
                >
                  <Sparkles size={13} />
                  Set up your password
                </button>
              </div>
            </div>
          )}

          {/* STEP 1.5: Forgot Password / Setup Email Entry */}
          {step === 'forgot_email' && (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => { setStep('login'); setError(''); setInfoMsg(''); }}
                  className="text-xs text-muted hover:text-primary transition-colors mb-4 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back to Sign In
                </button>
                <div className="w-10 h-10 rounded-xl bg-brand-pink/20 border border-brand-pink/30 flex items-center justify-center text-brand-pink mb-3">
                  <KeyRound size={20} />
                </div>
                <h2 className="text-xl font-bold text-primary mb-1">Set or Reset Password</h2>
                <p className="text-secondary text-sm">
                  Enter your company email address to receive a 6-digit verification code.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(email, 'otp'); }} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email-input" className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="forgot-email-input"
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@tmlabs.xyz"
                      className="w-full pl-9 pr-4 py-3 bg-elevated border border-slate-700/40 rounded-xl text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/50 focus:border-brand-pink/50 transition-all"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-pink hover:bg-brand-pink/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97] shadow-lg shadow-brand-pink/25 cursor-pointer"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Enter 6-digit OTP Code */}
          {step === 'otp' && (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => { setStep('login'); setError(''); setDevCode(null); if (countdownRef.current) clearInterval(countdownRef.current); }}
                  className="text-xs text-muted hover:text-primary transition-colors mb-4 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back to Sign In
                </button>
                <h2 className="text-xl font-bold text-primary mb-1">Check your email</h2>
                <p className="text-secondary text-sm">
                  We sent a 6-digit verification code to{' '}
                  <span className="text-primary font-semibold">{email.toLowerCase().trim()}</span>
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-3">
                    Verification Code
                  </label>
                  <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => { otpRefs.current[index] = el; }}
                        id={`otp-digit-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        disabled={isLoading}
                        autoComplete="one-time-code"
                        className={`
                          w-12 h-14 text-center text-xl font-bold rounded-xl border transition-all
                          bg-elevated text-primary
                          focus:outline-none focus:ring-2 focus:ring-brand-pink/60 focus:border-brand-pink/60
                          disabled:opacity-60
                          ${digit ? 'border-brand-pink/40 bg-brand-pink/5' : 'border-slate-700/40'}
                        `}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono font-bold ${countdown < 60 ? 'text-red-400' : 'text-muted'}`}>
                    {countdown > 0 ? `Expires in ${formatCountdown(countdown)}` : 'Code expired'}
                  </span>
                  {canResend ? (
                    <button
                      onClick={() => handleSendOtp(email, 'otp')}
                      className="text-brand-pink hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Resend code
                    </button>
                  ) : (
                    <span className="text-muted">Resend in {formatCountdown(countdown)}</span>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <button
                  onClick={() => handleVerifyOtp(otp.join(''))}
                  disabled={isLoading || otp.join('').length < 6}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-pink hover:bg-brand-pink/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97] shadow-lg shadow-brand-pink/25 cursor-pointer"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {isLoading ? 'Verifying...' : 'Verify Code & Set Password'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Create / Reset Password Screen */}
          {step === 'new_password' && (
            <div>
              <div className="mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-pink/20 border border-brand-pink/30 flex items-center justify-center text-brand-pink mb-3">
                  <KeyRound size={20} />
                </div>
                <h2 className="text-xl font-bold text-primary mb-1">Create Your Password</h2>
                <p className="text-secondary text-sm">
                  Create a password for <span className="text-primary font-semibold">{email}</span>. You will use this password to sign in on all future visits without needing OTP codes.
                </p>
              </div>

              <form onSubmit={handleSetNewPasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 chars)..."
                      className="w-full pl-4 pr-11 py-3 bg-elevated border border-slate-700/40 rounded-xl text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/50 focus:border-brand-pink/50 transition-all"
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors cursor-pointer p-1"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password..."
                      className="w-full pl-4 pr-11 py-3 bg-elevated border border-slate-700/40 rounded-xl text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/50 focus:border-brand-pink/50 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors cursor-pointer p-1"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !newPassword.trim() || newPassword.length < 6}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-pink hover:bg-brand-pink/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97] shadow-lg shadow-brand-pink/25 cursor-pointer"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {isLoading ? 'Saving password...' : 'Save Password & Sign In'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted mt-6">
          TM Labs Internal Dashboard
        </p>
      </div>
    </div>
  );
}
