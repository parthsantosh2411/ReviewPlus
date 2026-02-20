import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  Collapse,
  Modal,
  TextField,
  InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import LinkIcon from '@mui/icons-material/Link';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SendIcon from '@mui/icons-material/Send';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/* ─── stat card (reused) ─── */
const StatCard = ({ icon, label, value, trend, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: '16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      flex: '1 1 200px',
      minWidth: 0,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}15`,
        }}
      >
        {icon}
      </Box>
      {trend && (
        <Chip
          icon={<ArrowUpwardIcon sx={{ fontSize: 14 }} />}
          label={trend}
          size="small"
          sx={{
            height: 24,
            fontSize: '0.7rem',
            fontWeight: 700,
            bgcolor: 'rgba(16,185,129,0.1)',
            color: '#10B981',
            '& .MuiChip-icon': { color: '#10B981' },
          }}
        />
      )}
    </Box>
    <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 0.3, fontSize: '1.8rem' }}>
      {value}
    </Typography>
    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500, fontSize: '0.8rem' }}>
      {label}
    </Typography>
  </Paper>
);

/* ─── stars helper ─── */
const Stars = ({ count, size = 16 }) => (
  <Box sx={{ display: 'inline-flex', gap: 0.2 }}>
    {[1, 2, 3, 4, 5].map((s) =>
      s <= count ? (
        <StarIcon key={s} sx={{ fontSize: size, color: '#FBBF24' }} />
      ) : (
        <StarBorderIcon key={s} sx={{ fontSize: size, color: 'rgba(255,255,255,0.15)' }} />
      ),
    )}
  </Box>
);

/* ─── sentiment chip helper ─── */
const SentimentBadge = ({ sentiment }) => {
  const map = {
    positive: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    neutral: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
    negative: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  };
  const s = (sentiment || 'neutral').toLowerCase();
  const cfg = map[s] || map.neutral;
  return (
    <Chip
      label={s.charAt(0).toUpperCase() + s.slice(1)}
      size="small"
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 22,
      }}
    />
  );
};

/* ─── review row ─── */
const ReviewRow = ({ review }) => {
  const [open, setOpen] = useState(false);
  const initials = (review.customerName || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const topics = Array.isArray(review.topics) ? review.topics : [];
  const ts = review.timestamp
    ? new Date(review.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        mb: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'rgba(108,99,255,0.12)',
            color: '#6C63FF',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600 }}>
              {review.customerName || 'Anonymous'}
            </Typography>
            <Stars count={review.rating} />
            <SentimentBadge sentiment={review.sentiment} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', ml: 'auto' }}>
              {ts}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            onClick={() => setOpen(!open)}
            sx={{
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              ...(!open && {
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }),
              mb: 0.8,
            }}
          >
            {review.reviewText}
          </Typography>

          <Collapse in={open}>
            {review.summary && (
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.3)',
                  fontStyle: 'italic',
                  mb: 0.8,
                  fontSize: '0.8rem',
                }}
              >
                AI Summary: {review.summary}
              </Typography>
            )}
          </Collapse>

          {topics.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {topics.map((t, i) => (
                <Chip
                  key={i}
                  label={t}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: 'rgba(108,99,255,0.08)',
                    color: 'rgba(255,255,255,0.45)',
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        <IconButton size="small" onClick={() => setOpen(!open)} sx={{ color: 'rgba(255,255,255,0.25)' }}>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
};

/* ─── text field style ─── */
const fieldSx = {
  mb: 2,
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

/* ═══════════════════════════════════════ */
/*  MAIN COMPONENT                         */
/* ═══════════════════════════════════════ */
const ProductDashboardPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const brandId = user?.brandId || '';
  const isAdmin = user?.role === 'admin';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* send-link modal */
  const [modalOpen, setModalOpen] = useState(false);
  const [linkForm, setLinkForm] = useState({ customerEmail: '', customerName: '', customerPhone: '', orderId: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await api.get(`/insights/${brandId}/${productId}`);
        setData(res);
      } catch (err) {
        console.error('Failed to load product insights', err);
      } finally {
        setLoading(false);
      }
    };
    if (brandId && productId) fetch();
    else setLoading(false);
  }, [brandId, productId]);

  /* ── computed ── */
  const stats = useMemo(() => {
    if (!data) return {};
    const dist = data.sentiment_distribution || {};
    const total = (dist.positive || 0) + (dist.neutral || 0) + (dist.negative || 0);
    const sentScore = total ? Math.round(((dist.positive || 0) / total) * 100) : 0;
    const ls = data.link_stats || {};
    return { sentScore, usageRate: ls.usage_rate ?? 0 };
  }, [data]);

  /* ── charts ── */
  const sentimentTrendChart = useMemo(() => {
    if (!data?.sentiment_trend) return null;
    const labels = data.sentiment_trend.map((m) => m.month);
    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Positive',
            data: data.sentiment_trend.map((m) => m.positive),
            backgroundColor: '#6C63FF',
            borderRadius: 4,
          },
          {
            label: 'Neutral',
            data: data.sentiment_trend.map((m) => m.neutral),
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: 4,
          },
          {
            label: 'Negative',
            data: data.sentiment_trend.map((m) => m.negative),
            backgroundColor: '#EF4444',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } } } },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: 'rgba(255,255,255,0.35)' },
          },
          y: {
            stacked: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(255,255,255,0.35)' },
          },
        },
      },
    };
  }, [data]);

  const ratingDistChart = useMemo(() => {
    if (!data?.recent_reviews) return null;
    const counts = [0, 0, 0, 0, 0]; // index 0 = 5★, index 4 = 1★
    (data.recent_reviews || []).forEach((r) => {
      const idx = 5 - (r.rating || 0);
      if (idx >= 0 && idx < 5) counts[idx]++;
    });
    // Use total_reviews from all reviews (the reviews list is only recent 10)
    // We'll show distribution of what we have
    const total = counts.reduce((a, b) => a + b, 0) || 1;
    return {
      data: {
        labels: ['5★', '4★', '3★', '2★', '1★'],
        datasets: [
          {
            data: counts,
            backgroundColor: ['#6C63FF', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
            borderRadius: 6,
            barThickness: 22,
          },
        ],
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pct = Math.round((ctx.raw / total) * 100);
                return `${ctx.raw} reviews (${pct}%)`;
              },
            },
          },
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.35)' } },
          y: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { weight: '600' } } },
        },
      },
    };
  }, [data]);

  /* ── send link handler ── */
  const handleSendLink = async () => {
    if (!linkForm.customerEmail || !linkForm.orderId) {
      toast.error('Email and Order ID are required');
      return;
    }
    setSending(true);
    try {
      await api.post('/auth/send-review-link', {
        brandId,
        productId,
        customerEmail: linkForm.customerEmail.trim(),
        customerName: linkForm.customerName.trim(),
        customerPhone: linkForm.customerPhone.trim(),
        orderId: linkForm.orderId.trim(),
      });
      toast.success('Review link sent!');
      setModalOpen(false);
      setLinkForm({ customerEmail: '', customerName: '', customerPhone: '', orderId: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send link');
    } finally {
      setSending(false);
    }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0F0E17' }}>
        <CircularProgress sx={{ color: '#6C63FF' }} />
      </Box>
    );
  }

  /* ═══════════════════════════ */
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F0E17', p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        {/* back + title row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{
              bgcolor: 'rgba(255,255,255,0.05)',
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(108,99,255,0.15)' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
              {data?.recent_reviews?.[0]?.customerName
                ? productId
                : productId}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)' }}>
              Product Analytics
            </Typography>
          </Box>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setModalOpen(true)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '12px',
                px: 3,
                background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
                boxShadow: '0 6px 20px rgba(108,99,255,0.3)',
                '&:hover': { boxShadow: '0 8px 25px rgba(108,99,255,0.45)' },
              }}
            >
              Send Review Link
            </Button>
          )}
        </Box>

        {/* stat cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <StatCard
            icon={<TrendingUpIcon sx={{ color: '#6C63FF', fontSize: 22 }} />}
            label="Total Reviews"
            value={data?.total_reviews ?? 0}
            trend="+12%"
            color="#6C63FF"
          />
          <StatCard
            icon={<StarIcon sx={{ color: '#FBBF24', fontSize: 22 }} />}
            label="Avg Rating"
            value={`${data?.avg_rating ?? 0}★`}
            trend="+0.2"
            color="#FBBF24"
          />
          <StatCard
            icon={<SentimentSatisfiedIcon sx={{ color: '#10B981', fontSize: 22 }} />}
            label="Sentiment Score"
            value={`${stats.sentScore ?? 0}%`}
            trend="+4%"
            color="#10B981"
          />
          <StatCard
            icon={<LinkIcon sx={{ color: '#8B5CF6', fontSize: 22 }} />}
            label="Link Usage"
            value={`${stats.usageRate ?? 0}%`}
            trend="+8%"
            color="#8B5CF6"
          />
        </Box>

        {/* charts row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
            gap: 2.5,
            mb: 4,
          }}
        >
          {/* sentiment trend */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
              Sentiment Trend
            </Typography>
            <Box sx={{ height: 260 }}>
              {sentimentTrendChart ? (
                <Bar data={sentimentTrendChart.data} options={sentimentTrendChart.options} />
              ) : (
                <Typography sx={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', pt: 10 }}>
                  No data yet
                </Typography>
              )}
            </Box>
          </Paper>

          {/* rating distribution */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
              Rating Distribution
            </Typography>
            <Box sx={{ height: 260 }}>
              {ratingDistChart ? (
                <Bar data={ratingDistChart.data} options={ratingDistChart.options} />
              ) : (
                <Typography sx={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', pt: 10 }}>
                  No data yet
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* recent reviews */}
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
          Recent Reviews
        </Typography>

        {data?.recent_reviews && data.recent_reviews.length > 0 ? (
          data.recent_reviews.map((r) => <ReviewRow key={r.FeedbackId} review={r} />)
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ color: 'rgba(255,255,255,0.35)' }}>
              No reviews yet for this product.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* ── Send Review Link Modal ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '92%', sm: 460 },
            bgcolor: '#1A1926',
            border: '1px solid rgba(108,99,255,0.15)',
            borderRadius: '20px',
            p: { xs: 3, sm: 4 },
            outline: 'none',
          }}
        >
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
            Send Review Link
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 3 }}>
            The customer will receive an email with a unique review link.
          </Typography>

          <TextField
            fullWidth
            label="Customer Email"
            value={linkForm.customerEmail}
            onChange={(e) => setLinkForm({ ...linkForm, customerEmail: e.target.value })}
            sx={fieldSx}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Customer Name"
            value={linkForm.customerName}
            onChange={(e) => setLinkForm({ ...linkForm, customerName: e.target.value })}
            sx={fieldSx}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Customer Phone"
            value={linkForm.customerPhone}
            onChange={(e) => setLinkForm({ ...linkForm, customerPhone: e.target.value })}
            sx={fieldSx}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneOutlinedIcon sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Order ID"
            value={linkForm.orderId}
            onChange={(e) => setLinkForm({ ...linkForm, orderId: e.target.value })}
            sx={{ ...fieldSx, mb: 3 }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ReceiptLongIcon sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setModalOpen(false)}
              sx={{
                textTransform: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                borderColor: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.5)',
                '&:hover': { borderColor: 'rgba(255,255,255,0.25)' },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              disabled={sending}
              onClick={handleSendLink}
              sx={{
                textTransform: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #5A52E0 0%, #7C4FE0 100%)' },
              }}
            >
              {sending ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Send Link'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ProductDashboardPage;
