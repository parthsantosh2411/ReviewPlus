import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Collapse,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReviewsIcon from '@mui/icons-material/RateReview';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import LinkIcon from '@mui/icons-material/Link';
import CategoryIcon from '@mui/icons-material/Category';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SIDEBAR_W = 260;

/* ─── CRED-style dashboard keyframes (static, minimal) ─── */
const dashKeyframes = `
@keyframes dashFadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dashFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes dashScaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes dashPulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
`;

/* animated number hook */
const useCountUp = (end, duration = 1200) => {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    if (typeof end !== 'number' || isNaN(end) || end === 0) { setValue(end); return; }
    let start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return value;
};

/* ─── helpers ─── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

/* ─── CRED-style KPI Card — clean, static, no 3D tilt ─── */
const KpiCard = ({ icon, label, value, color, subtitle, index = 0 }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '20px',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
        flex: '1 1 180px',
        minWidth: 0,
        animation: `dashFadeUp 0.6s ${index * 0.1}s cubic-bezier(0.16,1,0.3,1) both`,
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        '&:hover': {
          background: `linear-gradient(145deg, ${color}08 0%, rgba(255,255,255,0.04) 100%)`,
          borderColor: `${color}30`,
          transform: 'translateY(-3px)',
          boxShadow: `0 12px 32px ${color}12`,
        },
      }}
    >
      {/* Static top accent line */}
      <Box sx={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: '2px',
        background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
        borderRadius: '0 0 4px 4px',
      }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 48, height: 48, borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${color}10`,
            border: `1px solid ${color}20`,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500, fontSize: '0.78rem', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, fontSize: '1.9rem', lineHeight: 1, color: '#fff', letterSpacing: '-0.02em' }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

/* ─── Product Card ─── */
const ProductCard = ({ product, onClick }) => {
  const [showAi, setShowAi] = useState(false);
  const [cardHover, setCardHover] = useState(false);
  const sentimentColor =
    product.sentiment_score >= 70
      ? '#10B981'
      : product.sentiment_score >= 40
      ? '#F59E0B'
      : '#EF4444';
  const ai = product.ai_insights;

  return (
    <Paper
      elevation={0}
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => setCardHover(false)}
      sx={{
        p: 2.5,
        borderRadius: '18px',
        background: cardHover
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.025)',
        border: `1px solid ${cardHover ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
        cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        transform: cardHover ? 'translateY(-3px)' : 'none',
      }}
    >
      {/* Top accent line */}
      <Box sx={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: '1.5px',
        background: `linear-gradient(90deg, transparent, ${sentimentColor}60, transparent)`,
      }} />
      <Box onClick={onClick}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}
          >
            {product.productName}
          </Typography>
          <OpenInNewIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.2)' }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
            <Typography
              variant="body2"
              sx={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.85rem' }}
            >
              {product.avg_rating}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}
          >
            {product.total_reviews} reviews
          </Typography>
        </Box>

        {/* Sentiment bar */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}
            >
              Sentiment
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: sentimentColor, fontWeight: 700, fontSize: '0.7rem' }}
            >
              {product.sentiment_score}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={product.sentiment_score}
            sx={{
              height: 4,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.06)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: sentimentColor,
              },
            }}
          />
        </Box>
      </Box>

      {/* AI Insights toggle */}
      {ai && (
        <>
          <Box
            onClick={(e) => { e.stopPropagation(); setShowAi(!showAi); }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 1.5,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 14, color: '#8B5CF6' }} />
            <Typography variant="caption" sx={{ color: '#8B5CF6', fontWeight: 600, fontSize: '0.72rem' }}>
              AI Insights
            </Typography>
            {showAi ? (
              <ExpandLessIcon sx={{ fontSize: 16, color: '#8B5CF6' }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 16, color: '#8B5CF6' }} />
            )}
          </Box>
          <Collapse in={showAi}>
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                borderRadius: '10px',
                background: 'rgba(139,92,246,0.06)',
                border: '1px solid rgba(139,92,246,0.12)',
              }}
            >
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', mb: 1, lineHeight: 1.5 }}>
                {ai.ai_summary}
              </Typography>
              {ai.ai_recommendations?.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#8B5CF6', fontWeight: 600, fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <LightbulbOutlinedIcon sx={{ fontSize: 12 }} /> Recommendations
                  </Typography>
                  {ai.ai_recommendations.map((rec, i) => (
                    <Typography key={i} variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem', display: 'block', pl: 1 }}>
                      • {rec}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          </Collapse>
        </>
      )}
    </Paper>
  );
};

/* ─── Stars ─── */
const Stars = ({ count, size = 14 }) => (
  <Box sx={{ display: 'inline-flex', gap: 0.2 }}>
    {[1, 2, 3, 4, 5].map((s) =>
      s <= count ? (
        <StarIcon key={s} sx={{ fontSize: size, color: '#F59E0B' }} />
      ) : (
        <StarBorderIcon
          key={s}
          sx={{ fontSize: size, color: 'rgba(255,255,255,0.12)' }}
        />
      ),
    )}
  </Box>
);

/* ─── Sentiment Badge ─── */
const SentimentBadge = ({ sentiment }) => {
  const map = {
    positive: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    neutral: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
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
        fontSize: '0.68rem',
        height: 22,
      }}
    />
  );
};

/* ─── Review Item ─── */
const ReviewItem = ({ review, compact }) => {
  const [expanded, setExpanded] = useState(false);
  const initials = (review.customerName || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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
        p: compact ? 2 : 2.5,
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        mb: 1.5,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': { borderColor: 'rgba(108,99,255,0.2)', transform: 'translateX(4px)', background: 'rgba(255,255,255,0.03)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'rgba(108,99,255,0.1)',
            color: '#6C63FF',
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              mb: 0.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}
            >
              {review.customerName || 'Anonymous'}
            </Typography>
            <Stars count={review.rating} />
            <SentimentBadge sentiment={review.sentiment} />
            {review.productName && (
              <Chip
                label={review.productName}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(139,92,246,0.1)',
                  color: '#A78BFA',
                }}
              />
            )}
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.2)',
                ml: 'auto',
                fontSize: '0.72rem',
              }}
            >
              {ts}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            onClick={() => setExpanded(!expanded)}
            sx={{
              color: 'rgba(255,255,255,0.55)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              ...(!expanded && {
                display: '-webkit-box',
                WebkitLineClamp: compact ? 1 : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }),
            }}
          >
            {review.reviewText}
          </Typography>
        </Box>
        {!compact && (
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: 'rgba(255,255,255,0.2)' }}
          >
            {expanded ? (
              <ExpandLessIcon fontSize="small" />
            ) : (
              <ExpandMoreIcon fontSize="small" />
            )}
          </IconButton>
        )}
      </Box>
    </Paper>
  );
};

/* ═══════════════════════════════════════ */
/*  MAIN COMPONENT                         */
/* ═══════════════════════════════════════ */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const brandId = user?.brandId || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: res } = await api.get(`/insights/${brandId}`);
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    if (brandId) fetchData();
    else setLoading(false);
  }, [brandId]);

  const stats = useMemo(() => {
    if (!data) return null;
    const dist = data.overall_sentiment_distribution || {};
    const total =
      (dist.positive || 0) + (dist.neutral || 0) + (dist.negative || 0);
    const sentScore = total
      ? Math.round(((dist.positive || 0) / total) * 100)
      : 0;
    const ls = data.link_stats || {};
    return {
      sentScore,
      totalProducts: data.total_products || data.products?.length || 0,
      responseRate: ls.usage_rate ?? 0,
      linksSent: ls.total_sent ?? 0,
    };
  }, [data]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (view) => {
    setActiveView(view);
    setDrawerOpen(false);
  };

  /* ─── nav items ─── */
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { key: 'products', label: 'Products', icon: <InventoryIcon /> },
    { key: 'reviews', label: 'Reviews', icon: <ReviewsIcon /> },
    { key: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  /* ─── sidebar ─── */
  const sidebarContent = (
    <Box
      sx={{
        width: SIDEBAR_W,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0A0A12',
        borderRight: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Static accent line at top */}
      <Box
        sx={{
          height: 2,
          background: 'linear-gradient(90deg, transparent, #6C63FF, #8B5CF6, transparent)',
        }}
      />

      {/* Logo + brand */}
      <Box sx={{ p: 2.5, pb: 2 }}>
        <img
          src="/logo2.png"
          alt="ReviewPulse"
          height={48}
          style={{ display: 'block', marginBottom: 14 }}
        />
        <Typography
          variant="subtitle2"
          sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}
          noWrap
        >
          {data?.brand_name || 'Loading…'}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}
        >
          {user?.email}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1.5, py: 2, overflow: 'auto', minHeight: 0 }}>
        {navItems.map((item) => {
          const active = activeView === item.key;
          return (
            <ListItemButton
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              sx={{
                borderRadius: '10px',
                mb: 0.5,
                py: 1,
                pl: 2,
                background: active
                  ? 'linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(139,92,246,0.08) 100%)'
                  : 'transparent',
                borderLeft: active
                  ? '3px solid #6C63FF'
                  : '3px solid transparent',
                '&:hover': {
                  background: active ? 'linear-gradient(135deg, rgba(108,99,255,0.16) 0%, rgba(139,92,246,0.1) 100%)' : 'rgba(108,99,255,0.08)',
                  transform: 'translateX(3px)',
                },
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: active ? '#6C63FF' : 'rgba(255,255,255,0.3)',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.84rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Role badge */}
      <Box sx={{ px: 2.5, pb: 1, flexShrink: 0 }}>
        <Chip
          label={user?.role === 'admin' ? 'Admin' : 'Viewer'}
          size="small"
          sx={{
            bgcolor:
              user?.role === 'admin'
                ? 'rgba(108,99,255,0.1)'
                : 'rgba(255,255,255,0.05)',
            color:
              user?.role === 'admin' ? '#6C63FF' : 'rgba(255,255,255,0.4)',
            fontWeight: 600,
            fontSize: '0.72rem',
            border: `1px solid ${
              user?.role === 'admin'
                ? 'rgba(108,99,255,0.2)'
                : 'rgba(255,255,255,0.08)'
            }`,
          }}
        />
      </Box>

      {/* Logout - always visible */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            justifyContent: 'flex-start',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'none',
            borderRadius: '10px',
            fontSize: '0.84rem',
            py: 1,
            border: '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.25s ease',
            '&:hover': {
              color: '#EF4444',
              bgcolor: 'rgba(239,68,68,0.08)',
              borderColor: 'rgba(239,68,68,0.2)',
              transform: 'translateX(2px)',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  /* ─── loading ─── */
  if (loading) {
    return (
      <>
        <style>{dashKeyframes}</style>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#0A0A12',
          }}
        >
          <Box sx={{ textAlign: 'center', animation: 'dashFadeIn 0.5s ease both' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
              <CircularProgress size={48} sx={{ color: '#6C63FF' }} />
            </Box>
            <Typography
              sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', animation: 'dashPulse 1.5s ease infinite' }}
            >
              Loading dashboard…
            </Typography>
          </Box>
        </Box>
      </>
    );
  }

  /* ═══════════════ DASHBOARD VIEW ═══════════════ */
  const renderDashboard = () => (
    <>
      {/* KPI row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <KpiCard
          icon={<TrendingUpIcon sx={{ color: '#6C63FF', fontSize: 22 }} />}
          label="Total Reviews"
          value={data?.total_reviews ?? 0}
          color="#6C63FF"
          subtitle="All time"
          index={0}
        />
        <KpiCard
          icon={<StarIcon sx={{ color: '#F59E0B', fontSize: 22 }} />}
          label="Average Rating"
          value={`${data?.avg_rating ?? 0}`}
          color="#F59E0B"
          subtitle="Out of 5 stars"
          index={1}
        />
        <KpiCard
          icon={
            <SentimentSatisfiedIcon
              sx={{ color: '#10B981', fontSize: 22 }}
            />
          }
          label="Positive Sentiment"
          value={`${stats?.sentScore ?? 0}%`}
          color="#10B981"
          subtitle="Based on AI analysis"
          index={2}
        />
        <KpiCard
          icon={<CategoryIcon sx={{ color: '#8B5CF6', fontSize: 22 }} />}
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          color="#8B5CF6"
          index={3}
        />
        <KpiCard
          icon={<LinkIcon sx={{ color: '#06B6D4', fontSize: 22 }} />}
          label="Response Rate"
          value={`${stats?.responseRate ?? 0}%`}
          color="#06B6D4"
          subtitle={`${stats?.linksSent ?? 0} links sent`}
          index={4}
        />
      </Box>

      {/* AI Product Summaries KPI */}
      {data?.products?.some((p) => p.ai_insights) && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '16px',
            background: 'linear-gradient(145deg, rgba(139,92,246,0.06) 0%, rgba(108,99,255,0.03) 100%)',
            border: '1px solid rgba(139,92,246,0.15)',
            animation: 'dashFadeUp 0.7s 0.3s cubic-bezier(0.16,1,0.3,1) both',
            transition: 'box-shadow 0.3s',
            '&:hover': { boxShadow: '0 8px 32px rgba(139,92,246,0.1)' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <AutoAwesomeIcon sx={{ color: '#8B5CF6', fontSize: 22 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>
              AI Product Insights
            </Typography>
            <Chip
              label="Powered by AI"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.62rem',
                fontWeight: 600,
                bgcolor: 'rgba(139,92,246,0.12)',
                color: '#A78BFA',
                ml: 'auto',
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.products.filter((p) => p.ai_insights).map((p) => (
              <Box
                key={p.productId}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                    {p.productName}
                  </Typography>
                  <Chip
                    label={`${p.ai_insights.ai_summary_review_count} reviews analyzed`}
                    size="small"
                    sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(108,99,255,0.1)', color: '#A78BFA' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', mb: 1.5, lineHeight: 1.6 }}>
                  {p.ai_insights.ai_summary}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {/* Strengths */}
                  {p.ai_insights.ai_strengths?.length > 0 && (
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <ThumbUpAltOutlinedIcon sx={{ fontSize: 12 }} /> Strengths
                      </Typography>
                      {p.ai_insights.ai_strengths.map((s, i) => (
                        <Typography key={i} variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', display: 'block' }}>
                          • {s}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  {/* Weaknesses */}
                  {p.ai_insights.ai_weaknesses?.length > 0 && (
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 600, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <ThumbDownAltOutlinedIcon sx={{ fontSize: 12 }} /> Weaknesses
                      </Typography>
                      {p.ai_insights.ai_weaknesses.map((w, i) => (
                        <Typography key={i} variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', display: 'block' }}>
                          • {w}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  {/* Recommendations */}
                  {p.ai_insights.ai_recommendations?.length > 0 && (
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="caption" sx={{ color: '#8B5CF6', fontWeight: 600, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <LightbulbOutlinedIcon sx={{ fontSize: 12 }} /> Recommendations
                      </Typography>
                      {p.ai_insights.ai_recommendations.map((rec, i) => (
                        <Typography key={i} variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', display: 'block' }}>
                          • {rec}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Products + Recent Activity */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.5fr 1fr' },
          gap: 3,
        }}
      >
        {/* Products */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, #6C63FF, #8B5CF6)', boxShadow: '0 0 8px rgba(108,99,255,0.3)' }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}
              >
                Products
              </Typography>
            </Box>
            {data?.products?.length > 4 && (
              <Button
                size="small"
                onClick={() => setActiveView('products')}
                sx={{
                  color: '#6C63FF',
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                View All
              </Button>
            )}
          </Box>
          {data?.products?.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              {data.products.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.productId}
                  product={p}
                  onClick={() =>
                    navigate(`/dashboard/${p.productId}`, {
                      state: { productName: p.productName },
                    })
                  }
                />
              ))}
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>
                No products yet. Send review links to get started.
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Recent Activity */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, #10B981, #06B6D4)', boxShadow: '0 0 8px rgba(16,185,129,0.3)' }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}
              >
                Recent Activity
              </Typography>
            </Box>
            {data?.recent_activity?.length > 5 && (
              <Button
                size="small"
                onClick={() => setActiveView('reviews')}
                sx={{
                  color: '#6C63FF',
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                View All
              </Button>
            )}
          </Box>
          {data?.recent_activity?.length > 0 ? (
            data.recent_activity
              .slice(0, 5)
              .map((r) => (
                <ReviewItem key={r.FeedbackId} review={r} compact />
              ))
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>
                No reviews yet.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );

  /* ═══════════════ PRODUCTS VIEW ═══════════════ */
  const renderProducts = () => (
    <>
      <Typography
        variant="h5"
        sx={{ fontWeight: 800, color: '#fff', mb: 0.5, fontSize: '1.4rem' }}
      >
        Products
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: 'rgba(255,255,255,0.35)', mb: 3 }}
      >
        {data?.products?.length || 0} products tracked
      </Typography>

      {data?.products?.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          {data.products.map((p) => (
            <ProductCard
              key={p.productId}
              product={p}
              onClick={() =>
                navigate(`/dashboard/${p.productId}`, {
                  state: { productName: p.productName },
                })
              }
            />
          ))}
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center',
          }}
        >
          <CategoryIcon
            sx={{ fontSize: 48, color: 'rgba(255,255,255,0.12)', mb: 2 }}
          />
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            No Products Yet
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Products appear here automatically when you send review links.
          </Typography>
        </Paper>
      )}
    </>
  );

  /* ═══════════════ REVIEWS VIEW ═══════════════ */
  const renderReviews = () => (
    <>
      <Typography
        variant="h5"
        sx={{ fontWeight: 800, color: '#fff', mb: 0.5, fontSize: '1.4rem' }}
      >
        Reviews
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: 'rgba(255,255,255,0.35)', mb: 3 }}
      >
        {data?.total_reviews || 0} total reviews &middot; Showing recent
        activity
      </Typography>

      {data?.recent_activity?.length > 0 ? (
        data.recent_activity.map((r) => (
          <ReviewItem key={r.FeedbackId} review={r} />
        ))
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center',
          }}
        >
          <ReviewsIcon
            sx={{ fontSize: 48, color: 'rgba(255,255,255,0.12)', mb: 2 }}
          />
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            No Reviews Yet
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Reviews will appear here as customers submit feedback.
          </Typography>
        </Paper>
      )}
    </>
  );

  /* ═══════════════ SETTINGS VIEW ═══════════════ */
  const renderSettings = () => (
    <>
      <Typography
        variant="h5"
        sx={{ fontWeight: 800, color: '#fff', mb: 0.5, fontSize: '1.4rem' }}
      >
        Settings
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: 'rgba(255,255,255,0.35)', mb: 3 }}
      >
        Account &amp; brand information
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* Profile Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ color: '#fff', fontWeight: 700, mb: 2.5 }}
          >
            Profile
          </Typography>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'rgba(108,99,255,0.12)',
                color: '#6C63FF',
                fontWeight: 700,
                fontSize: '1.2rem',
                border: '2px solid rgba(108,99,255,0.25)',
              }}
            >
              {(user?.email?.[0] || 'U').toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                {user?.email?.split('@')[0] || 'User'}
              </Typography>
              <Chip
                label={user?.role === 'admin' ? 'Admin' : 'Viewer'}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 22,
                  bgcolor: 'rgba(108,99,255,0.1)',
                  color: '#6C63FF',
                  fontWeight: 600,
                  fontSize: '0.68rem',
                }}
              />
            </Box>
          </Box>

          {[
            {
              icon: <EmailOutlinedIcon sx={{ fontSize: 18 }} />,
              label: 'Email',
              value: user?.email || '—',
            },
            {
              icon: <BadgeIcon sx={{ fontSize: 18 }} />,
              label: 'Role',
              value: user?.role || 'viewer',
            },
          ].map((item, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1.5,
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <Box sx={{ color: 'rgba(255,255,255,0.3)' }}>{item.icon}</Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.3)',
                    display: 'block',
                    fontSize: '0.68rem',
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}
                >
                  {item.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Brand Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ color: '#fff', fontWeight: 700, mb: 2.5 }}
          >
            Brand Information
          </Typography>

          {[
            {
              icon: <BusinessIcon sx={{ fontSize: 18 }} />,
              label: 'Brand Name',
              value: data?.brand_name || '—',
            },
            {
              icon: <CategoryIcon sx={{ fontSize: 18 }} />,
              label: 'Brand ID',
              value: brandId || '—',
            },
            {
              icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
              label: 'Total Reviews',
              value: `${data?.total_reviews ?? 0}`,
            },
            {
              icon: <InventoryIcon sx={{ fontSize: 18 }} />,
              label: 'Total Products',
              value: `${stats?.totalProducts ?? 0}`,
            },
          ].map((item, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1.5,
                borderTop:
                  i > 0
                    ? '1px solid rgba(255,255,255,0.05)'
                    : 'none',
              }}
            >
              <Box sx={{ color: 'rgba(255,255,255,0.3)' }}>{item.icon}</Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.3)',
                    display: 'block',
                    fontSize: '0.68rem',
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}
                >
                  {item.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Paper>
      </Box>
    </>
  );

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0A0A12' }}>
      <style>{dashKeyframes}</style>
      {/* Sidebar — desktop */}
      {!isMobile && (
        <Box sx={{ width: SIDEBAR_W, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
          {sidebarContent}
        </Box>
      )}

      {/* Sidebar — mobile drawer */}
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { bgcolor: '#0A0A12' } }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, sm: 3, md: 4 }, position: 'relative', overflow: 'hidden' }}>
        {/* Subtle dot grid background */}
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Mobile menu button */}
        {isMobile && (
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ color: '#fff', mb: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* CRED-style hero — static, massive typography */}
        {activeView === 'dashboard' && (
          <Box
            sx={{
              mb: 4,
              position: 'relative',
              animation: 'dashFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '24px',
                p: { xs: 3, md: 4 },
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Static accent line at top */}
              <Box sx={{
                position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(108,99,255,0.3), transparent)',
              }} />

              {/* Static orb accents */}
              <Box sx={{
                position: 'absolute', top: '-40px', right: '10%',
                width: 120, height: 120, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
                filter: 'blur(30px)', pointerEvents: 'none',
              }} />
              <Box sx={{
                position: 'absolute', bottom: '-30px', left: '15%',
                width: 100, height: 100, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
                filter: 'blur(25px)', pointerEvents: 'none',
              }} />

              {/* Dot grid overlay */}
              <Box sx={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
                backgroundSize: '20px 20px', pointerEvents: 'none',
              }} />

              {/* Content */}
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,0.4)' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Dashboard Overview
                  </Typography>
                  <Box sx={{ width: 60, height: '1px', background: 'linear-gradient(90deg, rgba(108,99,255,0.3), transparent)' }} />
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    mb: 0.5,
                    fontSize: { xs: '1.6rem', md: '2.4rem' },
                    color: '#fff',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.2,
                  }}
                >
                  {getGreeting()},{' '}
                  <Box component="span" sx={{ color: 'rgba(108,99,255,0.9)' }}>
                    {user?.email?.split('@')[0] || 'Admin'}
                  </Box>
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>
                    {formatDate()}
                  </Typography>
                  {data?.total_reviews > 0 && (
                    <Chip
                      icon={<AutoAwesomeIcon sx={{ fontSize: 13, color: '#8B5CF6 !important' }} />}
                      label={`${data.total_reviews} reviews tracked`}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        bgcolor: 'rgba(139,92,246,0.08)',
                        color: '#A78BFA',
                        border: '1px solid rgba(139,92,246,0.15)',
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* View content */}
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'products' && renderProducts()}
        {activeView === 'reviews' && renderReviews()}
        {activeView === 'settings' && renderSettings()}
      </Box>
    </Box>
  );
};

export default DashboardPage;
