import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ═══════════════════════════════════════════════════════════════════════════
   CRED-STYLE KEYFRAMES — Login
   ═══════════════════════════════════════════════════════════════════════════ */
const credLoginKf = `
@keyframes clRevealUp {
  from { opacity: 0; transform: translate3d(0, 60px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
`;

/* ─── CRED-style input styling ─── */
const credInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.02)',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.06)', transition: 'all 0.4s' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
    '&.Mui-focused fieldset': { borderColor: 'rgba(108,99,255,0.4)', boxShadow: '0 0 0 3px rgba(108,99,255,0.06)' },
    '&:hover': { background: 'rgba(255,255,255,0.03)' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.25)', fontWeight: 400, letterSpacing: '0.01em' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'rgba(108,99,255,0.7)' },
  '& input': { color: '#fff', fontWeight: 500 },
};



const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.requiresMfa) {
        sessionStorage.setItem('reviewpulse_pending_email', email);
        sessionStorage.setItem('reviewpulse_mfa_medium', result.medium || 'EMAIL');
        toast.success(
          result.medium === 'SMS'
            ? 'OTP sent to your phone'
            : 'OTP sent to your email'
        );
        navigate('/auth/verify');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('[LoginPage] Login error:', err.name, err.message, err);
      const msg = err.message || 'Invalid credentials';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{credLoginKf}</style>
      <Box
        sx={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0A0A12', px: 2, position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Static orbs */}
        <Box sx={{
          position: 'absolute', top: '15%', left: '30%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.07) 0%, transparent 60%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '10%', right: '20%',
          width: 300, height: 300, borderRadius: '50%',
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

              {/* Logo */}
              <Box sx={{
                textAlign: 'center', mb: 5,
                opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(20px)',
                transition: 'all 0.7s 0.1s cubic-bezier(0.16,1,0.3,1)',
              }}>
                <img src="/logo2.png" alt="ReviewPulse" height="56" style={{ opacity: 0.9 }} />
              </Box>

              {/* Title — CRED massive style */}
              <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                <Typography variant="h4" sx={{
                  color: '#fff', fontWeight: 800,
                  fontSize: { xs: '1.6rem', sm: '1.9rem' },
                  letterSpacing: '-0.03em', lineHeight: 1.2,
                  opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(30px)',
                  transition: 'opacity 0.8s 0.15s cubic-bezier(0.16,1,0.3,1), transform 0.8s 0.15s cubic-bezier(0.16,1,0.3,1)',
                }}>
                  Welcome back
                </Typography>
              </Box>
              <Typography sx={{
                color: 'rgba(255,255,255,0.3)', textAlign: 'center', mb: 5,
                fontSize: '0.88rem', fontWeight: 400, letterSpacing: '0.01em',
                opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(20px)',
                transition: 'all 0.7s 0.25s cubic-bezier(0.16,1,0.3,1)',
              }}>
                Sign in to your brand dashboard
              </Typography>

              {/* Form */}
              <Box
                component="form" onSubmit={handleSubmit}
                sx={{
                  opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(30px)',
                  transition: 'all 0.8s 0.3s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <Box sx={{
                  transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                  transform: focused === 'email' ? 'scale(1.008)' : 'scale(1)',
                }}>
                  <TextField
                    fullWidth label="Email address" type="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                    sx={{ ...credInputSx, mb: 2.5 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{
                            color: focused === 'email' ? 'rgba(108,99,255,0.7)' : 'rgba(255,255,255,0.15)',
                            fontSize: 19, transition: 'all 0.3s',
                          }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{
                  transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                  transform: focused === 'password' ? 'scale(1.008)' : 'scale(1)',
                }}>
                  <TextField
                    fullWidth label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                    sx={{ ...credInputSx, mb: 4 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{
                            color: focused === 'password' ? 'rgba(108,99,255,0.7)' : 'rgba(255,255,255,0.15)',
                            fontSize: 19, transition: 'all 0.3s',
                          }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end"
                            sx={{
                              color: 'rgba(255,255,255,0.2)',
                              transition: 'all 0.3s',
                              '&:hover': { color: 'rgba(108,99,255,0.7)' },
                            }}>
                            {showPassword ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* CRED-style white button */}
                <Button type="submit" fullWidth variant="contained" disabled={loading}
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
                  }}>
                  {loading ? <CircularProgress size={22} sx={{ color: '#0A0A12' }} /> : 'Sign In'}
                </Button>
              </Box>

              {/* Footer */}
              <Typography sx={{
                color: 'rgba(255,255,255,0.18)', textAlign: 'center', mt: 4,
                fontSize: '0.78rem', fontWeight: 400, letterSpacing: '0.02em',
                opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(15px)',
                transition: 'all 0.6s 0.5s cubic-bezier(0.16,1,0.3,1)',
              }}>
                Contact your administrator for access
              </Typography>
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

export default LoginPage;
