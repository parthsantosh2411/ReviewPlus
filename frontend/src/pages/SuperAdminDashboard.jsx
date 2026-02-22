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
import BusinessIcon from '@mui/icons-material/Business';
import ReviewsIcon from '@mui/icons-material/RateReview';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import LinkIcon from '@mui/icons-material/Link';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BarChartIcon from '@mui/icons-material/BarChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SIDEBAR_W = 270;

/* ─── keyframes ─── */
const saKeyframes = `
@keyframes saFadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes saScaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes saShimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes saPulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
@keyframes saAccentPulse {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes saGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(108,99,255,0.08); }
  50%      { box-shadow: 0 0 40px rgba(108,99,255,0.18); }
}
@keyframes saFloat {
  0%,100% { transform: translateY(0px); }
  50%     { transform: translateY(-6px); }
}
@keyframes saGradientText {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes saHeroSlide {
  from { opacity: 0; transform: translateY(30px) rotateX(10deg); }
  to   { opacity: 1; transform: translateY(0) rotateX(0deg); }
}
@keyframes saOrb1 {
  0%,100% { transform: translate(0,0) scale(1); }
  25%     { transform: translate(60px,-30px) scale(1.2); }
  50%     { transform: translate(20px,-60px) scale(0.9); }
  75%     { transform: translate(-40px,-20px) scale(1.1); }
}
@keyframes saOrb2 {
  0%,100% { transform: translate(0,0) scale(1); }
  25%     { transform: translate(-50px,20px) scale(0.85); }
  50%     { transform: translate(-20px,50px) scale(1.15); }
  75%     { transform: translate(30px,30px) scale(0.95); }
}
@keyframes saPulseRing {
  0%   { transform: scale(0.8); opacity: 0.6; }
  50%  { transform: scale(1.2); opacity: 0; }
  100% { transform: scale(0.8); opacity: 0; }
}
@keyframes saIconFloat {
  0%,100% { transform: translateY(0) rotate(0deg); }
  50%     { transform: translateY(-3px) rotate(5deg); }
}
@keyframes saSpinner {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

/* ─── helpers ─── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};
const formatDate = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

/* ─── KPI Card ─── */
const KpiCard = ({ icon, label, value, color, subtitle, index = 0 }) => {
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const cardRef = React.useRef(null);
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 16,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * -16,
    });
  };
  return (
    <Paper
      ref={cardRef}
      elevation={0}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setIsHovered(false); }}
      sx={{
        p: 2.5, borderRadius: '20px',
        background: isHovered
          ? `linear-gradient(145deg, ${color}10 0%, rgba(255,255,255,0.05) 50%, ${color}08 100%)`
          : 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        border: `1px solid ${isHovered ? color + '40' : 'rgba(255,255,255,0.06)'}`,
        flex: '1 1 160px', minWidth: 0,
        animation: `saFadeUp 0.6s ${index * 0.1}s cubic-bezier(0.16,1,0.3,1) both`,
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) ${isHovered ? 'translateY(-6px) scale(1.02)' : ''}`,
        transformStyle: 'preserve-3d', backdropFilter: 'blur(12px)',
        position: 'relative', overflow: 'hidden',
        boxShadow: isHovered
          ? `0 20px 50px ${color}20, 0 0 30px ${color}10, inset 0 1px 1px rgba(255,255,255,0.06)`
          : '0 4px 16px rgba(0,0,0,0.15)',
        cursor: 'default',
      }}
    >
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s ease',
      }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, transform: 'translateZ(20px)' }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
          border: `1px solid ${color}25`,
          animation: isHovered ? 'saIconFloat 2s ease-in-out infinite' : 'none',
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500, fontSize: '0.78rem', mb: 0.5, transform: 'translateZ(10px)' }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{
        fontWeight: 800, fontSize: '1.8rem', lineHeight: 1, transform: 'translateZ(30px)',
        background: isHovered ? `linear-gradient(135deg, #fff 0%, ${color} 150%)` : 'none',
        WebkitBackgroundClip: isHovered ? 'text' : 'initial',
        WebkitTextFillColor: isHovered ? 'transparent' : '#fff',
        color: '#fff', transition: 'all 0.3s ease',
      }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
          {subtitle}
        </Typography>
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
        <StarBorderIcon key={s} sx={{ fontSize: size, color: 'rgba(255,255,255,0.12)' }} />
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
    <Chip label={s.charAt(0).toUpperCase() + s.slice(1)} size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.68rem', height: 22 }}
    />
  );
};

/* ─── Brand Card ─── */
const BrandCard = ({ brand, onClick }) => {
  const [hover, setHover] = useState(false);
  const sentimentColor =
    brand.sentiment_score >= 70 ? '#10B981' : brand.sentiment_score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <Paper
      elevation={0}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      sx={{
        p: 3, borderRadius: '20px', cursor: 'pointer',
        background: hover
          ? 'linear-gradient(145deg, rgba(108,99,255,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(139,92,246,0.05) 100%)'
          : 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
        border: `1px solid ${hover ? 'rgba(108,99,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: 'saScaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both',
        position: 'relative', overflow: 'hidden',
        transform: hover ? 'translateY(-6px) scale(1.01)' : 'none',
        boxShadow: hover ? '0 20px 50px rgba(0,0,0,0.35), 0 0 30px rgba(108,99,255,0.08)' : '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      {/* Top accent */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, #6C63FF, #8B5CF6, #06B6D4)',
        opacity: hover ? 1 : 0, transition: 'opacity 0.3s',
      }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar sx={{
          width: 48, height: 48, fontSize: '1.1rem', fontWeight: 700,
          background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
          border: '2px solid rgba(108,99,255,0.3)',
        }}>
          {(brand.brandName || '?')[0].toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
            {brand.brandName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
            {brand.total_products} product{brand.total_products !== 1 ? 's' : ''} · {brand.total_reviews} reviews
          </Typography>
        </Box>
      </Box>

      {/* Stats row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
          <Typography variant="body2" sx={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.85rem' }}>
            {brand.avg_rating}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LinkIcon sx={{ fontSize: 14, color: '#06B6D4' }} />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
            {brand.response_rate}% response
          </Typography>
        </Box>
      </Box>

      {/* Sentiment bar */}
      <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>
          Sentiment
        </Typography>
        <Typography variant="caption" sx={{ color: sentimentColor, fontWeight: 700, fontSize: '0.7rem' }}>
          {brand.sentiment_score}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={brand.sentiment_score}
        sx={{
          height: 5, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.06)',
          '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: sentimentColor },
        }}
      />
    </Paper>
  );
};

/* ═══════════════════════════════════════ */
/*  MAIN COMPONENT                         */
/* ═══════════════════════════════════════ */
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: res } = await api.get('/insights');
        setData(res);
      } catch (err) {
        console.error('Failed to load superadmin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (view) => {
    setActiveView(view);
    setSelectedBrand(null);
    if (isMobile) setDrawerOpen(false);
  };

  const navItems = [
    { key: 'overview', label: 'Overview', icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
    { key: 'brands', label: 'All Brands', icon: <StorefrontIcon sx={{ fontSize: 20 }} /> },
    { key: 'activity', label: 'Activity Feed', icon: <ReviewsIcon sx={{ fontSize: 20 }} /> },
  ];

  /* ─── sidebar ─── */
  const sidebarContent = (
    <Box sx={{
      width: SIDEBAR_W, height: '100%', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #0D0C15 0%, #0A0919 100%)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Accent line */}
      <Box sx={{
        height: 3,
        background: 'linear-gradient(90deg, #EC4899, #6C63FF, #06B6D4, #EC4899)',
        backgroundSize: '200% 100%',
        animation: 'saAccentPulse 4s ease infinite',
      }} />

      {/* Logo + brand */}
      <Box sx={{ p: 2.5, pb: 2 }}>
        <img src="/logo2.png" alt="ReviewPulse" height={48} style={{ display: 'block', marginBottom: 14 }} />
        <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }} noWrap>
          ReviewPulse HQ
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>
          {user?.email}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

      {/* Nav */}
      <List sx={{ flex: 1, px: 1.5, py: 2, overflow: 'auto', minHeight: 0 }}>
        {navItems.map((item) => {
          const active = activeView === item.key;
          return (
            <ListItemButton
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              sx={{
                borderRadius: '10px', mb: 0.5, py: 1, pl: 2,
                background: active
                  ? 'linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(139,92,246,0.08) 100%)'
                  : 'transparent',
                borderLeft: active ? '3px solid #6C63FF' : '3px solid transparent',
                '&:hover': {
                  background: active ? 'linear-gradient(135deg, rgba(108,99,255,0.16) 0%, rgba(139,92,246,0.1) 100%)' : 'rgba(108,99,255,0.08)',
                  transform: 'translateX(3px)',
                },
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: active ? '#6C63FF' : 'rgba(255,255,255,0.3)' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label}
                primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,0.45)' }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Role badge */}
      <Box sx={{ px: 2.5, pb: 1, flexShrink: 0 }}>
        <Chip
          icon={<AdminPanelSettingsIcon sx={{ fontSize: 14, color: '#EC4899 !important' }} />}
          label="Super Admin"
          size="small"
          sx={{
            bgcolor: 'rgba(236,72,153,0.1)', color: '#EC4899', fontWeight: 600, fontSize: '0.72rem',
            border: '1px solid rgba(236,72,153,0.2)',
          }}
        />
      </Box>

      {/* Logout */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Button fullWidth startIcon={<LogoutIcon />} onClick={handleLogout}
          sx={{
            justifyContent: 'flex-start', color: 'rgba(255,255,255,0.4)', textTransform: 'none',
            borderRadius: '10px', fontSize: '0.84rem', py: 1,
            border: '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.25s ease',
            '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  /* ─── Hero Header ─── */
  const renderHero = () => (
    <Box sx={{ mb: 4, perspective: '1200px', animation: 'saHeroSlide 0.8s cubic-bezier(0.16,1,0.3,1) both' }}>
      <Box sx={{
        position: 'relative', overflow: 'hidden', borderRadius: '24px',
        p: { xs: 3, md: 4 },
        background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(108,99,255,0.1) 40%, rgba(6,182,212,0.06) 100%)',
        border: '1px solid rgba(236,72,153,0.2)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
      }}>
        {/* Floating orbs */}
        <Box sx={{ position: 'absolute', top: '-40px', right: '10%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)', animation: 'saOrb1 8s ease-in-out infinite', filter: 'blur(20px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: '-30px', left: '15%', width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%)', animation: 'saOrb2 10s ease-in-out infinite', filter: 'blur(18px)', pointerEvents: 'none' }} />

        {/* Pulse ring */}
        <Box sx={{ position: 'absolute', top: 20, right: 30, width: 50, height: 50, borderRadius: '50%', border: '2px solid rgba(236,72,153,0.3)', animation: 'saPulseRing 3s ease-in-out infinite', pointerEvents: 'none' }} />

        {/* Grid pattern */}
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EC4899', boxShadow: '0 0 12px rgba(236,72,153,0.5)', animation: 'saPulse 2s ease-in-out infinite' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Super Admin Console
            </Typography>
          </Box>
          <Typography variant="h4" sx={{
            fontWeight: 900, mb: 0.5, fontSize: { xs: '1.6rem', md: '2.2rem' },
            background: 'linear-gradient(135deg, #fff 0%, #EC4899 40%, #6C63FF 60%, #06B6D4 100%)',
            backgroundSize: '200% 200%', animation: 'saGradientText 4s ease infinite',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            {getGreeting()}, Super Admin
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>
              {formatDate()}
            </Typography>
            {data && (
              <Chip
                icon={<AdminPanelSettingsIcon sx={{ fontSize: 13, color: '#EC4899 !important' }} />}
                label={`${data.total_brands} brand${data.total_brands !== 1 ? 's' : ''} · ${data.total_reviews_all_brands} reviews`}
                size="small"
                sx={{
                  height: 24, fontSize: '0.7rem', fontWeight: 600,
                  bgcolor: 'rgba(236,72,153,0.1)', color: '#F9A8D4',
                  border: '1px solid rgba(236,72,153,0.2)',
                  animation: 'saFadeUp 0.8s 0.4s cubic-bezier(0.16,1,0.3,1) both',
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  /* ─── Overview ─── */
  const renderOverview = () => (
    <>
      {/* KPI row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <KpiCard
          icon={<BusinessIcon sx={{ color: '#EC4899', fontSize: 22 }} />}
          label="Total Brands"
          value={data?.total_brands ?? 0}
          color="#EC4899"
          index={0}
        />
        <KpiCard
          icon={<TrendingUpIcon sx={{ color: '#6C63FF', fontSize: 22 }} />}
          label="Total Reviews"
          value={data?.total_reviews_all_brands ?? 0}
          color="#6C63FF"
          subtitle="All brands combined"
          index={1}
        />
        <KpiCard
          icon={<StarIcon sx={{ color: '#F59E0B', fontSize: 22 }} />}
          label="Avg Rating"
          value={data?.overall_avg_rating ?? 0}
          color="#F59E0B"
          subtitle="Across all brands"
          index={2}
        />
        <KpiCard
          icon={<SentimentSatisfiedIcon sx={{ color: '#10B981', fontSize: 22 }} />}
          label="Overall Sentiment"
          value={`${data?.overall_sentiment_score ?? 0}%`}
          color="#10B981"
          subtitle="Positive reviews"
          index={3}
        />
        <KpiCard
          icon={<CategoryIcon sx={{ color: '#8B5CF6', fontSize: 22 }} />}
          label="Total Products"
          value={data?.total_products_all ?? 0}
          color="#8B5CF6"
          index={4}
        />
        <KpiCard
          icon={<LinkIcon sx={{ color: '#06B6D4', fontSize: 22 }} />}
          label="Response Rate"
          value={`${data?.overall_response_rate ?? 0}%`}
          color="#06B6D4"
          subtitle={`${data?.total_links_sent ?? 0} links sent`}
          index={5}
        />
      </Box>

      {/* Brands grid + Recent Activity */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.5fr 1fr' }, gap: 3 }}>
        {/* Brands */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, #EC4899, #6C63FF)', boxShadow: '0 0 8px rgba(236,72,153,0.3)' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>
              Brands
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {(data?.brands || []).map((b) => (
              <BrandCard
                key={b.brandId}
                brand={b}
                onClick={() => { setSelectedBrand(b); setActiveView('brandDetail'); }}
              />
            ))}
          </Box>
        </Box>

        {/* Recent Activity */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, #10B981, #06B6D4)', boxShadow: '0 0 8px rgba(16,185,129,0.3)' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>
              Recent Activity
            </Typography>
          </Box>
          {(data?.recent_activity || []).slice(0, 8).map((r, i) => (
            <Paper key={i} elevation={0} sx={{
              p: 2, borderRadius: '14px', background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)', mb: 1.5,
              transition: 'all 0.3s', '&:hover': { borderColor: 'rgba(108,99,255,0.2)', transform: 'translateX(4px)' },
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: 'rgba(108,99,255,0.12)', color: '#6C63FF' }}>
                  {(r.customerName || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem' }}>
                    {r.customerName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem' }}>
                    {r.brandName} · {r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                  </Typography>
                </Box>
                <Stars count={r.rating} size={12} />
                <SentimentBadge sentiment={r.sentiment} />
              </Box>
              {r.reviewText && (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', mt: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.reviewText}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      </Box>
    </>
  );

  /* ─── All Brands view ─── */
  const renderBrands = () => (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, #EC4899, #6C63FF)' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontSize: '1.2rem' }}>
          All Brands ({data?.total_brands ?? 0})
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2.5 }}>
        {(data?.brands || []).map((b) => (
          <BrandCard
            key={b.brandId}
            brand={b}
            onClick={() => { setSelectedBrand(b); setActiveView('brandDetail'); }}
          />
        ))}
      </Box>
    </>
  );

  /* ─── Brand Detail view ─── */
  const renderBrandDetail = () => {
    if (!selectedBrand) return null;
    const b = selectedBrand;
    const sentColor = b.sentiment_score >= 70 ? '#10B981' : b.sentiment_score >= 40 ? '#F59E0B' : '#EF4444';
    const dist = b.sentiment_distribution || {};

    return (
      <>
        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => { setSelectedBrand(null); setActiveView('brands'); }}
          sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'none', mb: 2, fontSize: '0.85rem', '&:hover': { color: '#fff' } }}
        >
          Back to All Brands
        </Button>

        {/* Brand header */}
        <Paper elevation={0} sx={{
          p: 3, borderRadius: '20px', mb: 3,
          background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(139,92,246,0.05) 100%)',
          border: '1px solid rgba(108,99,255,0.2)',
          animation: 'saFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{
              width: 56, height: 56, fontSize: '1.4rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
            }}>
              {(b.brandName || '?')[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
                {b.brandName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                Brand ID: {b.brandId}
              </Typography>
            </Box>
          </Box>

          {/* Brand KPIs */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>Reviews</Typography>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>{b.total_reviews}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>Avg Rating</Typography>
              <Typography variant="h6" sx={{ color: '#F59E0B', fontWeight: 700 }}>{b.avg_rating} ★</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>Sentiment</Typography>
              <Typography variant="h6" sx={{ color: sentColor, fontWeight: 700 }}>{b.sentiment_score}%</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>Products</Typography>
              <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 700 }}>{b.total_products}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>Response Rate</Typography>
              <Typography variant="h6" sx={{ color: '#06B6D4', fontWeight: 700 }}>{b.response_rate}%</Typography>
            </Box>
          </Box>

          {/* Sentiment distribution bar */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', mb: 0.5, display: 'block' }}>
              Sentiment Breakdown
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, height: 8, borderRadius: 4, overflow: 'hidden' }}>
              {dist.positive > 0 && (
                <Box sx={{ flex: dist.positive, bgcolor: '#10B981', borderRadius: 4 }} />
              )}
              {dist.neutral > 0 && (
                <Box sx={{ flex: dist.neutral, bgcolor: '#F59E0B', borderRadius: 4 }} />
              )}
              {dist.negative > 0 && (
                <Box sx={{ flex: dist.negative, bgcolor: '#EF4444', borderRadius: 4 }} />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 3, mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#10B981', fontSize: '0.68rem' }}>Positive: {dist.positive || 0}</Typography>
              <Typography variant="caption" sx={{ color: '#F59E0B', fontSize: '0.68rem' }}>Neutral: {dist.neutral || 0}</Typography>
              <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '0.68rem' }}>Negative: {dist.negative || 0}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Products for this brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, #8B5CF6, #6C63FF)' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>
            Products ({b.products?.length || 0})
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
          {(b.products || []).map((p) => {
            const pSentColor = p.sentiment_score >= 70 ? '#10B981' : p.sentiment_score >= 40 ? '#F59E0B' : '#EF4444';
            return (
              <Paper key={p.productId} elevation={0} sx={{
                p: 2.5, borderRadius: '16px',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.3s',
                '&:hover': { borderColor: 'rgba(108,99,255,0.25)', transform: 'translateY(-3px)' },
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', mb: 1 }}>
                  {p.productName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                    <Typography variant="body2" sx={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.82rem' }}>
                      {p.avg_rating}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
                    {p.total_reviews} reviews
                  </Typography>
                  <Typography variant="body2" sx={{ color: pSentColor, fontSize: '0.78rem', fontWeight: 600 }}>
                    {p.sentiment_score}% positive
                  </Typography>
                </Box>

                {/* AI Insights */}
                {p.ai_insights && (
                  <Box sx={{
                    p: 2, borderRadius: '12px', mt: 1,
                    background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <AutoAwesomeIcon sx={{ fontSize: 14, color: '#8B5CF6' }} />
                      <Typography variant="caption" sx={{ color: '#8B5CF6', fontWeight: 600, fontSize: '0.72rem' }}>
                        AI Insights
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', mb: 1, lineHeight: 1.5 }}>
                      {p.ai_insights.ai_summary}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {p.ai_insights.ai_strengths?.length > 0 && (
                        <Box sx={{ flex: '1 1 180px' }}>
                          <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600, fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <ThumbUpAltOutlinedIcon sx={{ fontSize: 11 }} /> Strengths
                          </Typography>
                          {p.ai_insights.ai_strengths.map((s, i) => (
                            <Typography key={i} variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', display: 'block' }}>• {s}</Typography>
                          ))}
                        </Box>
                      )}
                      {p.ai_insights.ai_weaknesses?.length > 0 && (
                        <Box sx={{ flex: '1 1 180px' }}>
                          <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 600, fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <ThumbDownAltOutlinedIcon sx={{ fontSize: 11 }} /> Weaknesses
                          </Typography>
                          {p.ai_insights.ai_weaknesses.map((w, i) => (
                            <Typography key={i} variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', display: 'block' }}>• {w}</Typography>
                          ))}
                        </Box>
                      )}
                      {p.ai_insights.ai_recommendations?.length > 0 && (
                        <Box sx={{ flex: '1 1 180px' }}>
                          <Typography variant="caption" sx={{ color: '#8B5CF6', fontWeight: 600, fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <LightbulbOutlinedIcon sx={{ fontSize: 11 }} /> Recommendations
                          </Typography>
                          {p.ai_insights.ai_recommendations.map((rec, i) => (
                            <Typography key={i} variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', display: 'block' }}>• {rec}</Typography>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>

        {/* Recent reviews for this brand */}
        {b.recent_reviews?.length > 0 && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, #10B981, #06B6D4)' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>
                Recent Reviews
              </Typography>
            </Box>
            {b.recent_reviews.map((r, i) => (
              <Paper key={i} elevation={0} sx={{
                p: 2, borderRadius: '14px', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)', mb: 1.5,
                transition: 'all 0.3s', '&:hover': { borderColor: 'rgba(108,99,255,0.15)' },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem', flex: 1 }}>
                    {r.customerName}
                  </Typography>
                  <Stars count={r.rating} size={12} />
                  <SentimentBadge sentiment={r.sentiment} />
                </Box>
                {r.reviewText && (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
                    {r.reviewText}
                  </Typography>
                )}
              </Paper>
            ))}
          </>
        )}
      </>
    );
  };

  /* ─── Activity Feed ─── */
  const renderActivity = () => (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, #10B981, #06B6D4)' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontSize: '1.2rem' }}>
          Activity Feed — All Brands
        </Typography>
      </Box>
      {(data?.recent_activity || []).map((r, i) => (
        <Paper key={i} elevation={0} sx={{
          p: 2.5, borderRadius: '14px', background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)', mb: 1.5,
          transition: 'all 0.3s', animation: `saFadeUp 0.4s ${i * 0.05}s cubic-bezier(0.16,1,0.3,1) both`,
          '&:hover': { borderColor: 'rgba(108,99,255,0.2)', transform: 'translateX(4px)', background: 'rgba(255,255,255,0.03)' },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Avatar sx={{ width: 36, height: 36, fontSize: '0.8rem', bgcolor: 'rgba(108,99,255,0.12)', color: '#6C63FF' }}>
              {(r.customerName || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                {r.customerName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={r.brandName} size="small" sx={{
                  height: 18, fontSize: '0.6rem', bgcolor: 'rgba(236,72,153,0.08)', color: '#F9A8D4',
                  border: '1px solid rgba(236,72,153,0.15)',
                }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.68rem' }}>
                  {r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </Typography>
              </Box>
            </Box>
            <Stars count={r.rating} size={13} />
            <SentimentBadge sentiment={r.sentiment} />
          </Box>
          {r.reviewText && (
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', mt: 1, lineHeight: 1.5 }}>
              {r.reviewText}
            </Typography>
          )}
        </Paper>
      ))}
      {(!data?.recent_activity || data.recent_activity.length === 0) && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>No activity yet</Typography>
        </Paper>
      )}
    </>
  );

  /* ─── Loading ─── */
  if (loading) {
    return (
      <>
        <style>{saKeyframes}</style>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0F0E17' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{
              width: 48, height: 48, border: '3px solid rgba(236,72,153,0.15)', borderTop: '3px solid #EC4899',
              borderRadius: '50%', animation: 'saSpinner 0.8s linear infinite', mx: 'auto', mb: 2,
            }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              Loading platform data…
            </Typography>
          </Box>
        </Box>
      </>
    );
  }

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0F0E17' }}>
      <style>{saKeyframes}</style>

      {/* Sidebar — desktop */}
      {!isMobile && (
        <Box sx={{ width: SIDEBAR_W, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
          {sidebarContent}
        </Box>
      )}

      {/* Sidebar — mobile drawer */}
      {isMobile && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { bgcolor: '#0D0C15' } }}>
          {sidebarContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, sm: 3, md: 4 }, position: 'relative', overflow: 'hidden' }}>
        {/* Mobile menu */}
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: '#fff', mb: 2 }}>
            <MenuIcon />
          </IconButton>
        )}

        {/* Hero — on overview */}
        {activeView === 'overview' && renderHero()}

        {/* View content */}
        {activeView === 'overview' && renderOverview()}
        {activeView === 'brands' && renderBrands()}
        {activeView === 'brandDetail' && renderBrandDetail()}
        {activeView === 'activity' && renderActivity()}
      </Box>
    </Box>
  );
};

export default SuperAdminDashboard;
