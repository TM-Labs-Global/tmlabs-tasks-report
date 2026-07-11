'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, ArrowRight, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, Loader2, Terminal } from 'lucide-react';

const ALLOWED_DOMAINS = ['takeoutmedia.xyz', 'tmlabs.xyz'];
const OTP_EXPIRY_SECONDS = 300; // 5 minutes

type Step = 'email' | 'otp';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleSendOtp = async (emailToUse = email) => {
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
      if (!res.ok) { setError(data.error || 'Failed to send OTP.'); return; }
      if (data.devMode && data.code) setDevCode(data.code);
      setStep('otp');
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

  const handleVerifyOtp = async (code: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification failed. Please try again.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
        return;
      }
      // Success — check if this is an invited user and route to workspace
      const searchParams = new URLSearchParams(window.location.search);
      const isInvited = searchParams.get('invited') === 'true';
      const redirectUrl = isInvited ? '/workspace' : '/';
      window.location.href = redirectUrl;
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOtp = () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits.'); return; }
    handleVerifyOtp(code);
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
            <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Terminal size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Dev Mode — No SMTP Configured</p>
                <p className="text-xs text-amber-300/80">Your one-time code is:</p>
                <p className="text-2xl font-mono font-bold tracking-[0.4em] text-amber-300 mt-1">{devCode}</p>
              </div>
            </div>
          )}

          {step === 'email' ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary mb-1">Sign in</h2>
                <p className="text-secondary text-sm leading-relaxed">
                  Enter your company email to receive a secure one-time sign-in code.
                </p>
              </div>

              <div className="space-y-4">
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
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                      placeholder="you@tmlabs.xyz"
                      className="w-full pl-9 pr-4 py-3 bg-elevated border border-slate-700/40 rounded-xl text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/50 focus:border-brand-pink/50 transition-all"
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                  <p className="text-xs text-muted mt-2">Restricted to @takeoutmedia.xyz and @tmlabs.xyz</p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <button
                  id="send-otp-btn"
                  onClick={() => handleSendOtp()}
                  disabled={isLoading || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-pink hover:bg-brand-pink/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-pink/25"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  {isLoading ? 'Sending code...' : 'Send verification code'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => { setStep('email'); setError(''); setDevCode(null); if (countdownRef.current) clearInterval(countdownRef.current); }}
                  className="text-xs text-muted hover:text-primary transition-colors mb-4 flex items-center gap-1"
                >
                  ← Back
                </button>
                <h2 className="text-xl font-bold text-primary mb-1">Check your inbox</h2>
                <p className="text-secondary text-sm">
                  We sent a 6-digit code to{' '}
                  <span className="text-primary font-semibold">{email.toLowerCase().trim()}</span>
                </p>
              </div>

              <div className="space-y-5">
                {/* OTP Input Grid */}
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

                {/* Countdown */}
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono font-bold ${countdown < 60 ? 'text-red-400' : 'text-muted'}`}>
                    {countdown > 0 ? `Expires in ${formatCountdown(countdown)}` : 'Code expired'}
                  </span>
                  {canResend ? (
                    <button
                      onClick={() => handleSendOtp()}
                      className="text-brand-pink hover:underline font-semibold flex items-center gap-1"
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
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <button
                  id="verify-otp-btn"
                  onClick={handleSubmitOtp}
                  disabled={isLoading || otp.join('').length < 6}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-pink hover:bg-brand-pink/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-pink/25"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted mt-6">
          TM Labs Internal Dashboard · Restricted Access
        </p>
      </div>
    </div>
  );
}
