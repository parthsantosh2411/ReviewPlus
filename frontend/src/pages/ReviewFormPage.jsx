import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Paper,
  InputAdornment,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import toast from 'react-hot-toast';
import api from '../services/api';

/* ─── light theme override for customer page ─── */
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6C63FF' },
    background: { default: '#F5F5FA', paper: '#FFFFFF' },
    text: { primary: '#1A1A2E', secondary: '#6B7280' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
  },
  shape: { borderRadius: 14 },
});

const STAR_LABELS = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent'];
const MIN_CHARS = 10;
const MAX_CHARS = 500;

/* ─── star rating component ─── */
const StarRating = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 1 }}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hover || value);
          return (
            <Box
              key={star}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.15s',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            >
              {filled ? (
                <StarIcon sx={{ fontSize: 44, color: '#FBBF24' }} />
              ) : (
                <StarBorderIcon
                  sx={{ fontSize: 44, color: '#D1D5DB' }}
                />
              )}
            </Box>
          );
        })}
      </Box>
      {value > 0 && (
        <Typography
          variant="body2"
          sx={{ color: '#6B7280', fontWeight: 500 }}
        >
          {value} out of 5 stars — {STAR_LABELS[value]}
        </Typography>
      )}
    </Box>
  );
};

/* ────────────────────────────────────────────── */
/*  MAIN COMPONENT                                */
/* ────────────────────────────────────────────── */
const ReviewFormPage = () => {
  const { token } = useParams();

  /* data states */
  const [prefill, setPrefill] = useState(null);
  const [pageState, setPageState] = useState('loading'); // loading | form | submitted | error | gone

  /* form fields */
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ── fetch pre-fill on mount ── */
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/review/${token}`);
        setPrefill(data);
        setCustomerName(data.customerName || '');
        setEmail(data.customerEmail || '');
        setPhone(data.customerPhone || '');
        setPageState('form');
      } catch (err) {
        const status = err.response?.status;
        if (status === 410) {
          setPageState('gone');
        } else {
          setPageState('error');
        }
      }
    };
    load();
  }, [token]);

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (reviewText.length < MIN_CHARS) {
      toast.error(`Review must be at least ${MIN_CHARS} characters`);
      return;
    }
    if (reviewText.length > MAX_CHARS) {
      toast.error(`Review must be under ${MAX_CHARS} characters`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/review', {
        token,
        rating,
        reviewText,
        customerName: customerName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
      });
      setPageState('submitted');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ═══════════════════════════════════════ */
  /*  STATUS PAGES                           */
  /* ═══════════════════════════════════════ */
  const StatusPage = ({ icon, title, subtitle, color }) => (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5F5FA',
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
          p: { xs: 4, sm: 5 },
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
        }}
      >
        <Box sx={{ mb: 2 }}>{icon}</Box>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: '#1A1A2E', mb: 1 }}
        >
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#6B7280' }}>
          {subtitle}
        </Typography>
      </Paper>
    </Box>
  );

  /* ── loading ── */
  if (pageState === 'loading') {
    return (
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F5F5FA',
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: '#6C63FF' }} />
          <Typography sx={{ color: '#6B7280' }}>
            Loading your review form…
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  /* ── invalid / expired ── */
  if (pageState === 'error') {
    return (
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <StatusPage
          icon={
            <ErrorOutlineIcon
              sx={{ fontSize: 64, color: '#EF4444' }}
            />
          }
          title="Link Invalid or Expired"
          subtitle="This review link is no longer valid. Please contact the brand for a new link."
        />
      </ThemeProvider>
    );
  }

  /* ── already submitted ── */
  if (pageState === 'gone') {
    return (
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <StatusPage
          icon={
            <SentimentSatisfiedAltIcon
              sx={{ fontSize: 64, color: '#6C63FF' }}
            />
          }
          title="Already Submitted"
          subtitle="This review has already been submitted. Thank you for your feedback!"
        />
      </ThemeProvider>
    );
  }

  /* ── success ── */
  if (pageState === 'submitted') {
    return (
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F5F5FA',
            px: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              maxWidth: 440,
              width: '100%',
              textAlign: 'center',
              p: { xs: 4, sm: 5 },
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* confetti-like top bar */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background:
                  'linear-gradient(90deg, #6C63FF, #8B5CF6, #EC4899, #FBBF24, #34D399)',
              }}
            />

            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.08)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
                animation: 'popIn 0.5s ease',
                '@keyframes popIn': {
                  '0%': { transform: 'scale(0)' },
                  '60%': { transform: 'scale(1.15)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            >
              <CheckCircleOutlineIcon
                sx={{ fontSize: 48, color: '#10B981' }}
              />
            </Box>

            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: '#1A1A2E', mb: 1 }}
            >
              Thank You!
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#6B7280', lineHeight: 1.7 }}
            >
              Your review has been submitted successfully.
              <br />
              Your feedback helps us improve our products and services.
            </Typography>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  /* ═══════════════════════════════════════ */
  /*  REVIEW FORM                            */
  /* ═══════════════════════════════════════ */
  const charCount = reviewText.length;
  const charColor =
    charCount > MAX_CHARS
      ? '#EF4444'
      : charCount >= MIN_CHARS
      ? '#10B981'
      : '#9CA3AF';

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: '#F5F5FA',
          py: { xs: 3, sm: 5 },
          px: 2,
        }}
      >
        <Box sx={{ maxWidth: 520, mx: 'auto' }}>
          {/* logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <img
              src="/logo2.png"
              alt="ReviewPulse"
              height="36"
              style={{ display: 'inline-block' }}
            />
          </Box>

          {/* progress header */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#6C63FF',
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                fontSize: '0.7rem',
              }}
            >
              Step 1 of 1
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#1A1A2E', fontWeight: 600, mt: 0.3 }}
            >
              Share Your Experience
            </Typography>
            <LinearProgress
              variant="determinate"
              value={100}
              sx={{
                mt: 1.5,
                height: 4,
                borderRadius: 4,
                bgcolor: '#E5E7EB',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background:
                    'linear-gradient(90deg, #6C63FF, #8B5CF6)',
                },
              }}
            />
          </Paper>

          {/* product card */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              mb: 2.5,
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              background:
                'linear-gradient(135deg, rgba(108,99,255,0.04) 0%, rgba(139,92,246,0.04) 100%)',
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: '#1A1A2E', mb: 1 }}
            >
              {prefill?.productName || 'Product Review'}
            </Typography>
            <Chip
              label={`Order: ${prefill?.orderId || '—'}`}
              size="small"
              sx={{
                bgcolor: 'rgba(108,99,255,0.08)',
                color: '#6C63FF',
                fontWeight: 600,
                fontSize: '0.75rem',
                border: '1px solid rgba(108,99,255,0.15)',
              }}
            />
          </Paper>

          {/* form card */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
            }}
          >
            <Box component="form" onSubmit={handleSubmit}>
              {/* customer info */}
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#6B7280',
                  fontWeight: 600,
                  mb: 2,
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: 0.5,
                }}
              >
                Your Details
              </Typography>

              <TextField
                fullWidth
                label="Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon
                        sx={{ color: '#9CA3AF', fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon
                        sx={{ color: '#9CA3AF', fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                sx={{ mb: 3 }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon
                        sx={{ color: '#9CA3AF', fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              {/* star rating */}
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#6B7280',
                  fontWeight: 600,
                  mb: 1.5,
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: 0.5,
                }}
              >
                Rating
              </Typography>

              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: '12px',
                  background: '#FAFAFA',
                  border: '1px solid #F0F0F0',
                }}
              >
                <StarRating value={rating} onChange={setRating} />
              </Box>

              {/* review text */}
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#6B7280',
                  fontWeight: 600,
                  mb: 1.5,
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: 0.5,
                }}
              >
                Your Review
              </Typography>

              <TextField
                fullWidth
                multiline
                minRows={4}
                maxRows={8}
                placeholder="Tell us about your experience with this product..."
                value={reviewText}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS + 10)
                    setReviewText(e.target.value);
                }}
                sx={{ mb: 0.5 }}
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 3.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: charColor, fontSize: '0.75rem' }}
                >
                  {charCount < MIN_CHARS
                    ? `${MIN_CHARS - charCount} more characters needed`
                    : 'Looks good!'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: charColor, fontWeight: 600, fontSize: '0.75rem' }}
                >
                  {charCount}/{MAX_CHARS}
                </Typography>
              </Box>

              {/* submit */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={submitting}
                sx={{
                  py: 1.6,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  background:
                    'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
                  boxShadow: '0 8px 25px rgba(108,99,255,0.25)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #5A52E0 0%, #7C4FE0 100%)',
                    boxShadow: '0 10px 30px rgba(108,99,255,0.35)',
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(108,99,255,0.4)',
                    color: 'rgba(255,255,255,0.6)',
                  },
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                ) : (
                  'Submit Review'
                )}
              </Button>
            </Box>
          </Paper>

          {/* footer */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 3,
              color: '#9CA3AF',
              fontSize: '0.7rem',
            }}
          >
            Powered by ReviewPulse — Your feedback is anonymous and secure
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ReviewFormPage;
