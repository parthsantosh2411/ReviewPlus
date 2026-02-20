import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const OtpVerifyPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const inputsRef = useRef([]);

  const userId = sessionStorage.getItem('reviewpulse_pending_userId') || '';
  const email = sessionStorage.getItem('reviewpulse_pending_email') || '';

  /* redirect if no userId */
  useEffect(() => {
    if (!userId) navigate('/login', { replace: true });
  }, [userId, navigate]);

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
    if (val && !/^\d$/.test(val)) return; // digits only
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < OTP_LENGTH - 1) focusInput(idx + 1);
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
      const { data } = await api.post('/auth/verify', {
        userId,
        otpCode: code,
      });

      // Persist auth
      const userData = {
        email: data.email || email,
        role: data.role,
        brandId: data.brandId,
      };
      login(data.token, userData);

      // Cleanup
      sessionStorage.removeItem('reviewpulse_pending_userId');
      sessionStorage.removeItem('reviewpulse_pending_email');

      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid or expired code';
      toast.error(msg);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setOtp(Array(OTP_LENGTH).fill(''));
      focusInput(0);
    } finally {
      setLoading(false);
    }
  }, [otp, userId, email, login, navigate]);

  /* auto-submit when all 6 digits filled */
  useEffect(() => {
    if (otp.every((d) => d !== '') && !loading) handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  /* ---------- resend ---------- */
  const handleResend = async () => {
    try {
      await api.post('/auth/login', { email, password: '__resend__' });
      toast.success('New code sent');
    } catch {
      toast('Resend request sent');
    }
    setResendTimer(RESEND_SECONDS);
  };

  /* ---------- render ---------- */
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F0E17',
        px: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          background:
            'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
        /* shake keyframes */
        '@keyframes shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-6px)' },
          '80%': { transform: 'translateX(6px)' },
        },
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          background: 'rgba(26, 25, 38, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(108,99,255,0.12)',
          borderRadius: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
          {/* Icon */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(108,99,255,0.1)',
              }}
            >
              <MarkEmailReadIcon sx={{ fontSize: 32, color: '#6C63FF' }} />
            </Box>
          </Box>

          <Typography
            variant="h5"
            sx={{ color: '#fff', fontWeight: 700, textAlign: 'center', mb: 0.5 }}
          >
            Check Your Email
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
              mb: 4,
            }}
          >
            We sent a 6-digit code to{' '}
            <Box component="span" sx={{ color: '#6C63FF', fontWeight: 600 }}>
              {email || 'your email'}
            </Box>
          </Typography>

          {/* OTP inputs */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: { xs: 1, sm: 1.5 },
              mb: 3.5,
              animation: shake ? 'shake 0.5s ease' : 'none',
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
                  width: { xs: 44, sm: 52 },
                  height: { xs: 52, sm: 60 },
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#fff',
                  background: 'rgba(255,255,255,0.03)',
                  border: digit
                    ? '2px solid #6C63FF'
                    : '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  outline: 'none',
                  caretColor: '#6C63FF',
                  transition: 'border 0.2s, box-shadow 0.2s',
                  '&:focus': {
                    borderColor: '#6C63FF',
                    boxShadow: '0 0 0 3px rgba(108,99,255,0.2)',
                  },
                }}
              />
            ))}
          </Box>

          {/* Verify button */}
          <Button
            fullWidth
            variant="contained"
            disabled={loading}
            onClick={handleVerify}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              background:
                'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
              boxShadow: '0 8px 25px rgba(108,99,255,0.3)',
              '&:hover': {
                background:
                  'linear-gradient(135deg, #5A52E0 0%, #7C4FE0 100%)',
                boxShadow: '0 10px 30px rgba(108,99,255,0.45)',
              },
              '&.Mui-disabled': {
                background: 'rgba(108,99,255,0.4)',
                color: 'rgba(255,255,255,0.5)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : (
              'Verify Code'
            )}
          </Button>

          {/* Resend */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            {resendTimer > 0 ? (
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}
              >
                Resend code in{' '}
                <Box component="span" sx={{ color: '#6C63FF', fontWeight: 600 }}>
                  {resendTimer}s
                </Box>
              </Typography>
            ) : (
              <Typography
                variant="body2"
                onClick={handleResend}
                sx={{
                  color: '#6C63FF',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Resend Code
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OtpVerifyPage;
