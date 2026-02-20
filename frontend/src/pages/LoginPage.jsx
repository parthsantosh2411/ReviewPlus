import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
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
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(108,99,255,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#6C63FF' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#6C63FF' },
  '& input': { color: '#fff' },
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // Store userId for OTP verification page
      sessionStorage.setItem('reviewpulse_pending_userId', data.userId);
      sessionStorage.setItem('reviewpulse_pending_email', email);
      toast.success('OTP sent to your email');
      navigate('/auth/verify');
    } catch (err) {
      const msg =
        err.response?.data?.error || 'Invalid credentials';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <img src="/logo2.png" alt="ReviewPulse" height="44" />
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              color: '#fff',
              fontWeight: 700,
              textAlign: 'center',
              mb: 0.5,
            }}
          >
            Brand Admin Login
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
              mb: 4,
            }}
          >
            Enter your credentials to access your dashboard
          </Typography>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ ...inputSx, mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ ...inputSx, mb: 3.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
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
                'Sign In'
              )}
            </Button>
          </Box>

          {/* Footer note */}
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'center',
              mt: 3.5,
              fontSize: '0.8rem',
            }}
          >
            Contact your administrator for access
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
