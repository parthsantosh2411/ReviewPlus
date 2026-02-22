import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

/* ═══════════════════════════════════════════════════════════════════════════
   CRED-STYLE KEYFRAMES — OTP
   ═══════════════════════════════════════════════════════════════════════════ */
const credOtpKf = `
@keyframes coRevealUp {
  from { opacity: 0; transform: translate3d(0, 60px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes coShake {
  0%, 100% { transform: translateX(0); }
  20%  { transform: translateX(-8px); }
  40%  { transform: translateX(8px); }
  60%  { transform: translateX(-5px); }
  80%  { transform: translateX(5px); }
}
@keyframes coDigitPop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}
`;



const OtpVerifyPage = () => {
  const navigate = useNavigate();
  const { verifyOtp, isAuthenticated, user } = useAuth();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [verified, setVerified] = useState(false);
  const [popDigit, setPopDigit] = useState(-1);
  const [loaded, setLoaded] = useState(false);
  const inputsRef = useRef([]);

  const email = sessionStorage.getItem('reviewpulse_pending_email') || '';

  useEffect(() => { setLoaded(true); }, []);

  /* redirect if no email */
  useEffect(() => {
    if (!email) navigate('/login', { replace: true });
  }, [email, navigate]);

  /* Navigate based on role once React has committed isAuthenticated = true */
  useEffect(() => {
    if (verified && isAuthenticated) {
      sessionStorage.removeItem('reviewpulse_pending_email');
      toast.success('Welcome back!');
      const dest = user?.role === 'superadmin' ? '/superadmin' : '/dashboard';
      navigate(dest, { replace: true });
    }
  }, [verified, isAuthenticated, navigate, user]);

  /* resend countdown */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  /* ---------- input handlers ---------- */
  const focusInput = (idx) => inputsRef.current[idx]?.focus();

  const handleChange = (e, idx) => {
    const val = e.target.value;
    if (val && !/^\d$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val) {
      setPopDigit(idx);
      setTimeout(() => setPopDigit(-1), 200);
      if (idx < OTP_LENGTH - 1) focusInput(idx + 1);
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      focusInput(idx - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  /* ---------- verify ---------- */
  const handleVerify = useCallback(async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      toast.error('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(code);
      setVerified(true);
    } catch (err) {
      const msg = err.message || 'Invalid or expired code';
      toast.error(msg);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setOtp(Array(OTP_LENGTH).fill(''));
      focusInput(0);
    } finally {
      setLoading(false);
    }
  }, [otp, verifyOtp, navigate]);

  /* auto-submit when all 6 digits filled */
  useEffect(() => {
    if (otp.every((d) => d !== '') && !loading) handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  /* ---------- resend ---------- */
  const handleResend = async () => {
    toast('Please log in again to receive a new code');
    navigate('/login', { replace: true });
  };

  /* ---------- render ---------- */
  return (
    <>
      <style>{credOtpKf}</style>
      <Box
        sx={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0A0A12', px: 2, position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Static orbs */}
        <Box sx={{
          position: 'absolute', top: '20%', left: '35%',
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.07) 0%, transparent 60%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '15%', right: '25%',
          width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 60%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        {/* Subtle grid */}
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />

        {/* Main card */}
        <Box
          sx={{
            maxWidth: 440, width: '100%', position: 'relative', zIndex: 1,
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'none' : 'translate3d(0,60px,0)',
            transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Glass card */}
          <Box sx={{
            p: '1px', borderRadius: '28px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          }}>
            <Box sx={{
              background: 'rgba(10,10,18,0.8)',
              borderRadius: '27px',
              backdropFilter: 'blur(40px)',
              position: 'relative', overflow: 'hidden',
              p: { xs: 3.5, sm: 5 }, pt: { xs: 4.5, sm: 6 },
            }}>
              {/* Static top accent line */}
              <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(108,99,255,0.4), rgba(236,72,153,0.2), transparent)',
              }} />

              {/* Icon */}
              <Box sx={{
                textAlign: 'center', mb: 4,
                opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(20px)',
                transition: 'all 0.7s 0.1s cubic-bezier(0.16,1,0.3,1)',
              }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <Box sx={{
                    position: 'absolute', inset: -8,
                    border: '1px solid rgba(108,99,255,0.1)',
                    borderRadius: '22px',
                  }} />
                  <Box sx={{
                    width: 64, height: 64, borderRadius: '18px',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(108,99,255,0.06)',
                    border: '1px solid rgba(108,99,255,0.1)',
                    transition: 'all 0.3s',
                    '&:hover': { background: 'rgba(108,99,255,0.1)', transform: 'scale(1.05)' },
                  }}>
                    <MarkEmailReadIcon sx={{ fontSize: 30, color: 'rgba(108,99,255,0.8)' }} />
                  </Box>
                </Box>
              </Box>

              {/* Title — CRED massive style */}
              <Typography variant="h4" sx={{
                color: '#fff', fontWeight: 800, textAlign: 'center',
                fontSize: { xs: '1.5rem', sm: '1.8rem' },
                letterSpacing: '-0.03em', lineHeight: 1.2, mb: 1,
                opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(30px)',
                transition: 'opacity 0.8s 0.15s cubic-bezier(0.16,1,0.3,1), transform 0.8s 0.15s cubic-bezier(0.16,1,0.3,1)',
              }}>
                Check your email
              </Typography>
              <Typography sx={{
                color: 'rgba(255,255,255,0.3)', textAlign: 'center', mb: 5,
                fontSize: '0.88rem', fontWeight: 400, letterSpacing: '0.01em',
                opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(20px)',
                transition: 'all 0.7s 0.25s cubic-bezier(0.16,1,0.3,1)',
              }}>
                We sent a 6-digit code to{' '}
                <Box component="span" sx={{ color: 'rgba(108,99,255,0.8)', fontWeight: 600 }}>
                  {email || 'your email'}
                </Box>
              </Typography>

              {/* OTP inputs — CRED minimal style */}
              <Box
                sx={{
                  display: 'flex', justifyContent: 'center',
                  gap: { xs: 1, sm: 1.5 }, mb: 5,
                  opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(30px)',
                  transition: 'all 0.8s 0.3s cubic-bezier(0.16,1,0.3,1)',
                  ...(shake && { animation: 'coShake 0.5s ease' }),
                }}
                onPaste={handlePaste}
              >
                {otp.map((digit, i) => (
                  <Box
                    key={i}
                    component="input"
                    ref={(el) => (inputsRef.current[i] = el)}
                    value={digit}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    maxLength={1}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    sx={{
                      width: { xs: 44, sm: 50 }, height: { xs: 54, sm: 62 },
                      textAlign: 'center', fontSize: '1.4rem', fontWeight: 700, color: '#fff',
                      position: 'relative', zIndex: 2, cursor: 'text', padding: 0, boxSizing: 'border-box',
                      background: digit ? 'rgba(108,99,255,0.04)' : 'rgba(255,255,255,0.02)',
                      border: digit
                        ? '1.5px solid rgba(108,99,255,0.35)'
                        : '1.5px solid rgba(255,255,255,0.06)',
                      borderRadius: '16px', outline: 'none',
                      caretColor: 'rgba(108,99,255,0.6)',
                      transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                      animation: popDigit === i ? 'coDigitPop 0.2s ease' : 'none',
                      '&:focus': {
                        borderColor: 'rgba(108,99,255,0.4)',
                        boxShadow: '0 0 0 3px rgba(108,99,255,0.06)',
                        background: 'rgba(108,99,255,0.03)',
                      },
                      '&:hover': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  />
                ))}
              </Box>

              {/* Verify button — CRED-style white */}
              <Box sx={{
                opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(25px)',
                transition: 'all 0.7s 0.4s cubic-bezier(0.16,1,0.3,1)',
              }}>
                <Button
                  fullWidth variant="contained" disabled={loading} onClick={handleVerify}
                  endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    py: 1.8, borderRadius: '16px', textTransform: 'none',
                    fontWeight: 700, fontSize: '1.05rem',
                    background: '#fff', color: '#0A0A12',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 0 0 0 rgba(255,255,255,0)',
                    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',

                    '&:hover': {
                      background: '#fff',
                      boxShadow: '0 16px 50px rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.08)',
                      transform: 'translateY(-2px) scale(1.01)',
                    },
                    '&:active': { transform: 'translateY(0) scale(0.99)' },
                    '&.Mui-disabled': { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.3)' },
                    '& .MuiButton-endIcon': { transition: 'transform 0.3s ease' },
                    '&:hover .MuiButton-endIcon': { transform: 'translateX(3px)' },
                  }}
                >
                  {loading ? <CircularProgress size={22} sx={{ color: '#0A0A12' }} /> : 'Verify Code'}
                </Button>
              </Box>

              {/* Resend */}
              <Box sx={{
                textAlign: 'center', mt: 4,
                opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(15px)',
                transition: 'all 0.6s 0.5s cubic-bezier(0.16,1,0.3,1)',
              }}>
                {resendTimer > 0 ? (
                  <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem', fontWeight: 400 }}>
                    Resend code in{' '}
                    <Box component="span" sx={{
                      color: 'rgba(108,99,255,0.7)', fontWeight: 600,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {resendTimer}s
                    </Box>
                  </Typography>
                ) : (
                  <Typography onClick={handleResend}
                    sx={{
                      color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                      fontWeight: 500, fontSize: '0.82rem', letterSpacing: '0.01em',
                      transition: 'all 0.3s',
                      '&:hover': { color: '#fff' },
                    }}>
                    Resend Code
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Bottom fade */}
        <Box sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
          background: 'linear-gradient(180deg, transparent, rgba(10,10,18,0.5))',
          pointerEvents: 'none',
        }} />
      </Box>
    </>
  );
};

export default OtpVerifyPage;
