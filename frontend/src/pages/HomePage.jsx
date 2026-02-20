import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedIcon from '@mui/icons-material/Verified';
import InsightsIcon from '@mui/icons-material/Insights';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LinkIcon from '@mui/icons-material/Link';
import ReviewsIcon from '@mui/icons-material/Reviews';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* ========================================================================= */
/* Shared styles                                                             */
/* ========================================================================= */
const sectionSx = {
  py: { xs: 8, md: 12 },
  px: { xs: 2, md: 3 },
};

const gradientText = {
  background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 50%, #C084FC 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

/* ========================================================================= */
/* HERO SECTION                                                              */
/* ========================================================================= */
const HeroSection = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      id="hero"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 12, md: 8 },
        /* radial glow behind hero */
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '800px',
          background:
            'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left copy */}
          <Grid size={{ xs: 12, md: 7 }}>
            {/* Trust badge pill */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.5,
                mb: 3,
                borderRadius: '999px',
                border: '1px solid rgba(108,99,255,0.25)',
                background: 'rgba(108,99,255,0.06)',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#22C55E',
                  boxShadow: '0 0 8px #22C55E',
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}
              >
                Trusted by B2C Brands
              </Typography>
            </Box>

            {/* Headline */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.4rem', sm: '3rem', md: '3.8rem' },
                fontWeight: 800,
                lineHeight: 1.1,
                color: '#fff',
                mb: 3,
                letterSpacing: '-0.02em',
              }}
            >
              Collect Verified Reviews.
              <br />
              <Box component="span" sx={gradientText}>
                Unlock Real Insights.
              </Box>
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.55)',
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.15rem' },
                lineHeight: 1.7,
                maxWidth: 540,
                mb: 4,
              }}
            >
              ReviewPulse sends secure 72-hour review links to your verified
              customers. No fake reviews. No guesswork. Just authentic feedback
              that drives growth.
            </Typography>

            {/* CTA buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  background:
                    'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(108,99,255,0.35)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #5A52E0 0%, #7C4FE0 100%)',
                    boxShadow: '0 12px 40px rgba(108,99,255,0.5)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Request a Demo
              </Button>
              <Button
                variant="outlined"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.2)',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  '&:hover': {
                    borderColor: 'rgba(108,99,255,0.5)',
                    background: 'rgba(108,99,255,0.06)',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>

            {/* Trust badges */}
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 1.5, md: 3 },
                flexWrap: 'wrap',
              }}
            >
              {[
                'No fake reviews',
                'Order-verified only',
                '72-hr secure links',
              ].map((txt) => (
                <Box
                  key={txt}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                  }}
                >
                  <VerifiedIcon
                    sx={{ fontSize: 16, color: '#6C63FF', opacity: 0.7 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.45)',
                      fontSize: '0.8rem',
                    }}
                  >
                    {txt}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Right — dashboard preview card */}
          {!isMobile && (
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  p: 0.5,
                  borderRadius: '20px',
                  background:
                    'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(139,92,246,0.15))',
                }}
              >
                <Box
                  sx={{
                    background: 'rgba(15,14,23,0.9)',
                    borderRadius: '18px',
                    p: 3,
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Mini title bar */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0.8,
                      mb: 3,
                    }}
                  >
                    {['#FF5F57', '#FEBD2E', '#27C840'].map((c) => (
                      <Box
                        key={c}
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: c,
                        }}
                      />
                    ))}
                  </Box>

                  <Typography
                    variant="overline"
                    sx={{
                      color: 'rgba(255,255,255,0.4)',
                      letterSpacing: 2,
                      fontSize: '0.65rem',
                    }}
                  >
                    DASHBOARD PREVIEW
                  </Typography>

                  {/* stat cards */}
                  <Grid container spacing={2} sx={{ mt: 1.5 }}>
                    {[
                      {
                        label: 'Total Reviews',
                        value: '1,284',
                        icon: <ReviewsIcon />,
                        color: '#6C63FF',
                      },
                      {
                        label: 'Avg Rating',
                        value: '4.7 ★',
                        icon: <StarIcon />,
                        color: '#F59E0B',
                      },
                      {
                        label: 'Sentiment',
                        value: '89%',
                        icon: <TrendingUpIcon />,
                        color: '#22C55E',
                      },
                      {
                        label: 'Link Usage',
                        value: '76%',
                        icon: <LinkIcon />,
                        color: '#A78BFA',
                      },
                    ].map((stat) => (
                      <Grid size={6} key={stat.label}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            transition: 'all 0.3s',
                            '&:hover': {
                              background: 'rgba(108,99,255,0.06)',
                              border: '1px solid rgba(108,99,255,0.2)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              color: stat.color,
                              mb: 0.5,
                              '& svg': { fontSize: 20 },
                            }}
                          >
                            {stat.icon}
                          </Box>
                          <Typography
                            variant="h5"
                            sx={{
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '1.3rem',
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255,255,255,0.4)',
                              fontSize: '0.7rem',
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Mini bar chart placeholder */}
                  <Box sx={{ mt: 2.5, display: 'flex', gap: 0.6, alignItems: 'flex-end', height: 48 }}>
                    {[35, 50, 40, 65, 55, 80, 70, 90, 60, 75, 85, 95].map((h, i) => (
                      <Box
                        key={i}
                        sx={{
                          flex: 1,
                          height: `${h}%`,
                          borderRadius: '3px',
                          background: `rgba(108,99,255,${0.3 + (h / 100) * 0.6})`,
                          transition: 'height 0.5s ease',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

/* ========================================================================= */
/* FEATURES SECTION                                                          */
/* ========================================================================= */
const FEATURES = [
  {
    icon: <LockIcon sx={{ fontSize: 32 }} />,
    badge: 'Anti-Fraud',
    badgeColor: '#EF4444',
    title: '72-Hour Secure Links',
    description:
      'Each review link expires in 72 hours and is tied to a verified order. One link, one review — no duplicates, no manipulation.',
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 32 }} />,
    badge: 'Verified Only',
    badgeColor: '#22C55E',
    title: '100% Verified Reviews',
    description:
      'Only customers who actually purchased your product can leave a review. Say goodbye to fake reviews polluting your data.',
  },
  {
    icon: <InsightsIcon sx={{ fontSize: 32 }} />,
    badge: 'Deep Insights',
    badgeColor: '#6C63FF',
    title: 'Brand-Level Analytics',
    description:
      'AI-powered sentiment analysis, topic extraction, and trend tracking across all your products. See what customers really think.',
  },
];

const FeaturesSection = () => (
  <Box id="features" sx={{ ...sectionSx, position: 'relative' }}>
    <Container maxWidth="lg">
      {/* Section header */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography
          variant="overline"
          sx={{
            color: '#6C63FF',
            fontWeight: 700,
            letterSpacing: 3,
            fontSize: '0.75rem',
          }}
        >
          PLATFORM FEATURES
        </Typography>
        <Typography
          variant="h3"
          sx={{
            color: '#fff',
            fontWeight: 800,
            mt: 1,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
          }}
        >
          Why ReviewPulse?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.5)',
            mt: 1.5,
            maxWidth: 520,
            mx: 'auto',
          }}
        >
          Built for B2C brands that care about authentic customer feedback
        </Typography>
      </Box>

      {/* Feature cards */}
      <Grid container spacing={3}>
        {FEATURES.map((f) => (
          <Grid size={{ xs: 12, md: 4 }} key={f.title}>
            <Card
              sx={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '1px solid rgba(108,99,255,0.3)',
                  background: 'rgba(108,99,255,0.04)',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Icon + badge row */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(108,99,255,0.1)',
                      color: '#6C63FF',
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Chip
                    label={f.badge}
                    size="small"
                    sx={{
                      background: `${f.badgeColor}18`,
                      color: f.badgeColor,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 26,
                      border: `1px solid ${f.badgeColor}30`,
                    }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}
                >
                  {f.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}
                >
                  {f.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

/* ========================================================================= */
/* STATS BAR                                                                 */
/* ========================================================================= */
const STATS = [
  { value: '50K+', label: 'Reviews Collected' },
  { value: '98%', label: 'Delivery Rate' },
  { value: '3', label: 'Active Brands' },
  { value: '<2hr', label: 'Avg Response' },
];

const StatsSection = () => (
  <Box
    sx={{
      py: { xs: 5, md: 6 },
      background:
        'linear-gradient(180deg, rgba(108,99,255,0.06) 0%, rgba(15,14,23,0) 100%)',
      borderTop: '1px solid rgba(108,99,255,0.08)',
      borderBottom: '1px solid rgba(108,99,255,0.08)',
    }}
  >
    <Container maxWidth="lg">
      <Grid container spacing={4} justifyContent="center">
        {STATS.map((s) => (
          <Grid size={{ xs: 6, md: 3 }} key={s.label}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.8rem', md: '2.4rem' },
                  ...gradientText,
                }}
              >
                {s.value}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.45)',
                  mt: 0.5,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

/* ========================================================================= */
/* HOW IT WORKS                                                              */
/* ========================================================================= */
const STEPS = [
  {
    num: '01',
    title: 'Order Placed',
    desc: 'A customer completes a purchase from your store or platform.',
  },
  {
    num: '02',
    title: 'Secure Link Sent',
    desc: 'ReviewPulse sends a unique 72-hour review link via email to the customer.',
  },
  {
    num: '03',
    title: 'Customer Reviews',
    desc: 'The customer writes an authentic review through the secure link.',
  },
  {
    num: '04',
    title: 'You Get Insights',
    desc: 'AI analyzes sentiment, topics, and trends — you see actionable data.',
  },
];

const HowItWorksSection = () => (
  <Box id="how-it-works" sx={sectionSx}>
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography
          variant="overline"
          sx={{
            color: '#6C63FF',
            fontWeight: 700,
            letterSpacing: 3,
            fontSize: '0.75rem',
          }}
        >
          HOW IT WORKS
        </Typography>
        <Typography
          variant="h3"
          sx={{
            color: '#fff',
            fontWeight: 800,
            mt: 1,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
          }}
        >
          Four Simple Steps
        </Typography>
      </Box>

      {/* Steps */}
      <Grid container spacing={3}>
        {STEPS.map((step, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={step.num}>
            <Box
              sx={{
                position: 'relative',
                p: 3.5,
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '1px solid rgba(108,99,255,0.25)',
                  background: 'rgba(108,99,255,0.04)',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              {/* Step number */}
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: '3rem',
                  ...gradientText,
                  opacity: 0.2,
                  lineHeight: 1,
                  mb: 2,
                }}
              >
                {step.num}
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: '#fff', fontWeight: 700, mb: 1 }}
              >
                {step.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}
              >
                {step.desc}
              </Typography>

              {/* Connector arrow (desktop, not last) */}
              {i < STEPS.length - 1 && (
                <Box
                  sx={{
                    display: { xs: 'none', md: 'block' },
                    position: 'absolute',
                    top: '50%',
                    right: -18,
                    transform: 'translateY(-50%)',
                    color: 'rgba(108,99,255,0.3)',
                    fontSize: '1.2rem',
                  }}
                >
                  →
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

/* ========================================================================= */
/* HOME PAGE                                                                 */
/* ========================================================================= */
const HomePage = () => {
  return (
    <Box sx={{ background: '#0F0E17', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <Footer />
    </Box>
  );
};

export default HomePage;
