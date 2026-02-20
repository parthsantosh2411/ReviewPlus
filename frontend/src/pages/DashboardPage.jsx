import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
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
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReviewsIcon from '@mui/icons-material/RateReview';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import LinkIcon from '@mui/icons-material/Link';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SIDEBAR_W = 260;

/* ─── greeting helper ─── */
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

/* ─── stat card ─── */
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

/* ─── product card ─── */
const ProductCard = ({ product, onClick }) => {
  const sentimentColor =
    product.sentiment_score >= 70
      ? '#10B981'
      : product.sentiment_score >= 40
      ? '#FBBF24'
      : '#EF4444';
  const sentimentLabel =
    product.sentiment_score >= 70
      ? 'Positive'
      : product.sentiment_score >= 40
      ? 'Neutral'
      : 'Negative';

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          border: '1px solid rgba(108,99,255,0.3)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        },
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', mb: 1.5 }}>
        {product.productName}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          {product.total_reviews} reviews
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
          <StarIcon sx={{ fontSize: 16, color: '#FBBF24' }} />
          <Typography variant="body2" sx={{ color: '#FBBF24', fontWeight: 600 }}>
            {product.avg_rating}
          </Typography>
        </Box>
      </Box>
      <Chip
        label={`${sentimentLabel} · ${product.sentiment_score}%`}
        size="small"
        sx={{
          bgcolor: `${sentimentColor}15`,
          color: sentimentColor,
          fontWeight: 600,
          fontSize: '0.7rem',
          height: 24,
        }}
      />
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
    const total = (dist.positive || 0) + (dist.neutral || 0) + (dist.negative || 0);
    const sentScore = total ? Math.round(((dist.positive || 0) / total) * 100) : 0;
    // link stats placeholder — brand-level link_stats not in current API, derive from products
    return { sentScore };
  }, [data]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* ─── sidebar content ─── */
  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, active: true },
    { label: 'Products', icon: <InventoryIcon /> },
    { label: 'Reviews', icon: <ReviewsIcon /> },
    { label: 'Settings', icon: <SettingsIcon /> },
  ];

  const sidebarContent = (
    <Box
      sx={{
        width: SIDEBAR_W,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0D0C15',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* logo + brand name */}
      <Box sx={{ p: 2.5 }}>
        <img src="/logo2.png" alt="ReviewPulse" height={40} style={{ display: 'block', marginBottom: 12 }} />
        <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }} noWrap>
          {data?.brand_name || 'Loading…'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
          {user?.email}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* nav items */}
      <List sx={{ flex: 1, px: 1.5, py: 1.5 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            sx={{
              borderRadius: '10px',
              mb: 0.5,
              py: 1,
              background: item.active ? 'rgba(108,99,255,0.1)' : 'transparent',
              '&:hover': { background: 'rgba(108,99,255,0.08)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: item.active ? '#6C63FF' : 'rgba(255,255,255,0.35)' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.85rem',
                fontWeight: item.active ? 600 : 400,
                color: item.active ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* role badge */}
      <Box sx={{ px: 2.5, pb: 1 }}>
        <Chip
          label={user?.role === 'admin' ? 'Admin' : 'Viewer'}
          size="small"
          sx={{
            bgcolor: user?.role === 'admin' ? 'rgba(108,99,255,0.12)' : 'rgba(255,255,255,0.06)',
            color: user?.role === 'admin' ? '#6C63FF' : 'rgba(255,255,255,0.5)',
            fontWeight: 600,
            fontSize: '0.72rem',
          }}
        />
      </Box>

      {/* logout */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            justifyContent: 'flex-start',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'none',
            borderRadius: '10px',
            '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.08)' },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  /* ─── loading state ─── */
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0F0E17' }}>
        <CircularProgress sx={{ color: '#6C63FF' }} />
      </Box>
    );
  }

  /* ═══════════════════════════ */
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0F0E17' }}>
      {/* sidebar — desktop */}
      {!isMobile && (
        <Box sx={{ width: SIDEBAR_W, flexShrink: 0 }}>{sidebarContent}</Box>
      )}

      {/* sidebar — mobile drawer */}
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { bgcolor: '#0D0C15' } }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* main content */}
      <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, sm: 3, md: 4 } }}>
        {/* mobile menu button */}
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: '#fff', mb: 2 }}>
            <MenuIcon />
          </IconButton>
        )}

        {/* welcome header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
            {getGreeting()}, {user?.email?.split('@')[0] || 'Admin'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)' }}>
            {formatDate()}
          </Typography>
        </Box>

        {/* stat cards */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: 4,
          }}
        >
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
            value={`${stats?.sentScore ?? 0}%`}
            trend="+4%"
            color="#10B981"
          />
          <StatCard
            icon={<LinkIcon sx={{ color: '#8B5CF6', fontSize: 22 }} />}
            label="Link Usage"
            value="—"
            trend="+8%"
            color="#8B5CF6"
          />
        </Box>

        {/* products heading */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 2 }}>
          Products
        </Typography>

        {/* products grid */}
        {data?.products && data.products.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            {data.products.map((p) => (
              <ProductCard
                key={p.productId}
                product={p}
                onClick={() => navigate(`/dashboard/${p.productId}`)}
              />
            ))}
          </Box>
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
              No products found. Send review links to start collecting feedback.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default DashboardPage;
