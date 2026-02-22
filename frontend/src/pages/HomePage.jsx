import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
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
import ShieldIcon from '@mui/icons-material/Shield';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* ═══════════════════════════════════════════════════════════════════════════
   CRED-STYLE KEYFRAMES
   ═══════════════════════════════════════════════════════════════════════════ */
const credKeyframes = `
@keyframes credRevealUp {
  from { opacity: 0; transform: translate3d(0, 80px, 0); filter: blur(8px); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); filter: blur(0); }
}
@keyframes credRevealScale {
  from { opacity: 0; transform: scale(0.92); filter: blur(6px); }
  to   { opacity: 1; transform: scale(1); filter: blur(0); }
}
@keyframes credFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes credFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-18px); }
}
@keyframes credFloatSlow {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-10px) rotate(2deg); }
}
@keyframes credGradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes credShimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes credPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.4; transform: scale(1.2); }
}
@keyframes credOrb1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25%      { transform: translate(60px, -40px) scale(1.12); }
  50%      { transform: translate(20px, -80px) scale(0.92); }
  75%      { transform: translate(-40px, -20px) scale(1.06); }
}
@keyframes credOrb2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(-50px, 30px) scale(0.9); }
  66%      { transform: translate(30px, 50px) scale(1.1); }
}
@keyframes credBarGrow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
@keyframes credLineGrow {
  from { width: 0; }
  to   { width: 100%; }
}
@keyframes credCountUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes credGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(108,99,255,0.05); }
  50%      { box-shadow: 0 0 50px rgba(108,99,255,0.18); }
}
@keyframes credSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes credStepPulse {
  0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(108,99,255,0.3); }
  70%  { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(108,99,255,0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(108,99,255,0); }
}
@keyframes credMesh {
  0%   { background-position: 0% 0%; }
  50%  { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
}
@keyframes credSlideLeft {
  from { opacity: 0; transform: translateX(60px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes credDotPulse {
  0%, 100% { box-shadow: 0 0 4px currentColor; }
  50%      { box-shadow: 0 0 16px currentColor; }
}
@keyframes credMarquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   INTERSECTION OBSERVER HOOK — scroll triggers
   ═══════════════════════════════════════════════════════════════════════════ */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { setInView(entry.isIntersecting); },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER HOOK
   ═══════════════════════════════════════════════════════════════════════════ */
const useCounter = (end, duration = 2000, start = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const numEnd = parseFloat(end.toString().replace(/[^0-9.]/g, '')) || 0;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * numEnd));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, end, duration]);
  return val;
};

/* ═══════════════════════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════════════════════════ */
const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <Box sx={{
      position: 'fixed', top: 0, left: 0, height: 2, zIndex: 9999,
      width: `${progress}%`,
      background: 'linear-gradient(90deg, #6C63FF 0%, #A78BFA 30%, #EC4899 60%, #06B6D4 100%)',
      transition: 'width 0.08s linear',
      boxShadow: '0 0 20px rgba(108,99,255,0.6), 0 0 40px rgba(108,99,255,0.2)',
    }} />
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   FLOATING PARTICLES — cinematic subtle dust
   ═══════════════════════════════════════════════════════════════════════════ */
const CinematicParticles = React.memo(() => {
  const particles = useMemo(() =>
    Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      size: 1.5 + Math.random() * 3,
      left: Math.random() * 100,
      delay: Math.random() * 20,
      dur: 18 + Math.random() * 14,
      opacity: 0.15 + Math.random() * 0.25,
    })), []
  );
  return (
    <Box sx={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p) => (
        <Box key={p.id} sx={{
          position: 'absolute', bottom: 0, left: `${p.left}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: 'rgba(255,255,255,0.6)',
          animation: `credFloat ${p.dur}s ${p.delay}s infinite ease-in-out`,
          opacity: p.opacity,
        }} />
      ))}
    </Box>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 1 — CINEMATIC HERO
   Full-screen, massive typography, word-by-word reveal, parallax orbs
   ═══════════════════════════════════════════════════════════════════════════ */
const HeroSection = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(true); }, []);

  const handleMouse = useCallback((e) => {
    setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  }, []);
  useEffect(() => {
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [handleMouse]);

  const px = (f) => ({
    transform: `translate(${(mousePos.x - 0.5) * f}px, ${(mousePos.y - 0.5) * f}px)`,
    transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  });

  const heroWords1 = ['Collect', 'Verified', 'Reviews.'];
  const heroWords2 = ['Unlock', 'Real', 'Insights.'];

  return (
    <Box
      id="hero"
      sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        pt: { xs: 14, md: 0 },
      }}
    >
      {/* Animated mesh background */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 50% at 40% 40%, rgba(108,99,255,0.10) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 75% 65%, rgba(236,72,153,0.05) 0%, transparent 70%)',
        backgroundSize: '200% 200%', animation: 'credMesh 22s ease infinite',
      }} />

      {/* Orbs */}
      <Box sx={{ ...px(-25), position: 'absolute', top: '8%', right: '10%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', animation: 'credOrb1 14s ease-in-out infinite', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <Box sx={{ ...px(18), position: 'absolute', bottom: '12%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', animation: 'credOrb2 18s ease-in-out infinite', filter: 'blur(30px)', pointerEvents: 'none' }} />

      {/* Subtle grid */}
      <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            {/* Trust pill */}
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1, px: 2.5, py: 0.8,
              mb: 4, borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(30px)',
              transition: 'all 0.8s 0.1s cubic-bezier(0.16,1,0.3,1)',
            }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px rgba(34,197,94,0.5)', animation: 'credPulse 2s ease-in-out infinite' }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: '0.8rem', letterSpacing: '0.04em' }}>
                Trusted by B2C Brands
              </Typography>
              <AutoAwesomeIcon sx={{ fontSize: 13, color: 'rgba(108,99,255,0.5)' }} />
            </Box>

            {/* CRED-style massive headline — word-by-word reveal */}
            <Box sx={{ mb: 4 }}>
              {/* Line 1 */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, md: 1.5 } }}>
                {heroWords1.map((word, i) => (
                  <Typography key={word} variant="h1" sx={{
                    fontSize: { xs: '2.8rem', sm: '3.6rem', md: '4.5rem', lg: '5rem' },
                    fontWeight: 800, lineHeight: 1.05, color: '#fff',
                    letterSpacing: '-0.04em',
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? 'translate3d(0,0,0)' : 'translate3d(0,80px,0)',
                    filter: loaded ? 'blur(0)' : 'blur(8px)',
                    transition: `all 0.9s ${0.2 + i * 0.12}s cubic-bezier(0.16,1,0.3,1)`,
                  }}>
                    {word}
                  </Typography>
                ))}
              </Box>
              {/* Line 2 — gradient */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, md: 1.5 }, mt: 0.5 }}>
                {heroWords2.map((word, i) => (
                  <Typography key={word} variant="h1" sx={{
                    fontSize: { xs: '2.8rem', sm: '3.6rem', md: '4.5rem', lg: '5rem' },
                    fontWeight: 800, lineHeight: 1.05,
                    letterSpacing: '-0.04em',
                    background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 25%, #EC4899 55%, #06B6D4 100%)',
                    backgroundSize: '300% 300%',
                    animation: loaded ? 'credGradientShift 6s ease infinite' : 'none',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? 'translate3d(0,0,0)' : 'translate3d(0,80px,0)',
                    filter: loaded ? 'blur(0)' : 'blur(8px)',
                    transition: `all 0.9s ${0.55 + i * 0.12}s cubic-bezier(0.16,1,0.3,1)`,
                  }}>
                    {word}
                  </Typography>
                ))}
              </Box>
            </Box>

            {/* Sub-headline — cinematic line */}
            <Box sx={{
              maxWidth: 540, mb: 5,
              opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(40px)',
              transition: 'all 0.9s 0.9s cubic-bezier(0.16,1,0.3,1)',
            }}>
              <Typography sx={{
                color: 'rgba(255,255,255,0.42)', fontWeight: 400,
                fontSize: { xs: '1.02rem', md: '1.2rem' }, lineHeight: 1.85,
                letterSpacing: '0.01em',
              }}>
                ReviewPulse sends secure 72-hour review links to your verified
                customers. No fake reviews. No guesswork. Just authentic feedback
                that drives growth.
              </Typography>
            </Box>

            {/* CTA — CRED-style large buttons */}
            <Box sx={{
              display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5,
              opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(40px)',
              transition: 'all 0.9s 1.05s cubic-bezier(0.16,1,0.3,1)',
            }}>
              <Button
                variant="contained" size="large"
                onClick={() => navigate('/login')}
                sx={{
                  background: '#fff', color: '#0F0E17',
                  textTransform: 'none', fontWeight: 700, fontSize: '1.05rem',
                  px: 5, py: 1.8, borderRadius: '14px',
                  boxShadow: '0 8px 32px rgba(255,255,255,0.08)',
                  position: 'relative', overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  '&::before': {
                    content: '""', position: 'absolute', top: 0, left: '-100%',
                    width: '100%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(108,99,255,0.1), transparent)',
                    animation: 'credShimmer 3s ease-in-out infinite',
                  },
                  '&:hover': {
                    background: '#fff',
                    boxShadow: '0 24px 64px rgba(255,255,255,0.18), 0 0 0 1px rgba(255,255,255,0.15)',
                    transform: 'translateY(-3px) scale(1.02)',
                  },
                  transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                Get Started
              </Button>
              <Button
                variant="text" size="large"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                onClick={() => navigate('/login')}
                sx={{
                  color: 'rgba(255,255,255,0.5)', textTransform: 'none',
                  fontWeight: 600, fontSize: '1.05rem', px: 4, py: 1.8,
                  borderRadius: '16px',
                  '&:hover': {
                    color: '#fff', background: 'rgba(255,255,255,0.04)',
                    '& .MuiButton-endIcon': { transform: 'translateX(4px)' },
                  },
                  '& .MuiButton-endIcon': { transition: 'transform 0.3s ease' },
                  transition: 'all 0.3s ease',
                }}
              >
                Sign In
              </Button>
            </Box>

            {/* Trust signals — minimal */}
            <Box sx={{
              display: 'flex', gap: { xs: 2, md: 4 }, flexWrap: 'wrap',
              opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(20px)',
              transition: 'all 0.9s 1.2s cubic-bezier(0.16,1,0.3,1)',
            }}>
              {[
                { txt: 'No fake reviews', icon: <ShieldIcon sx={{ fontSize: 14 }} /> },
                { txt: 'Order-verified', icon: <VerifiedIcon sx={{ fontSize: 14 }} /> },
                { txt: '72-hr links', icon: <LockIcon sx={{ fontSize: 14 }} /> },
              ].map(({ txt, icon }) => (
                <Box key={txt} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ color: 'rgba(255,255,255,0.2)', display: 'flex' }}>{icon}</Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.02em' }}>
                    {txt}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Right — 3D dashboard preview */}
          {!isMobile && (
            <Grid size={{ xs: 12, md: 5 }}>
              <DashboardPreviewCard loaded={loaded} />
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Bottom fade */}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(180deg, transparent, #0A0A12)', pointerEvents: 'none' }} />
    </Box>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   3D DASHBOARD PREVIEW CARD — CRED-style glass card with parallax tilt
   ═══════════════════════════════════════════════════════════════════════════ */
const DashboardPreviewCard = ({ loaded }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);
  const cardRef = useRef(null);

  const handleMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 14,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * -14,
    });
  };

  return (
    <Box
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHover(false); }}
      sx={{
        perspective: '1200px',
        opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'scale(0.9) translateY(40px)',
        filter: loaded ? 'blur(0)' : 'blur(6px)',
        transition: 'all 1s 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <Box sx={{
        p: '1px', borderRadius: '24px',
        background: hover
          ? 'linear-gradient(135deg, rgba(108,99,255,0.35), rgba(236,72,153,0.15), rgba(6,182,212,0.15))'
          : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        animation: hover ? 'credGlow 3s ease-in-out infinite' : 'none',
      }}>
        <Box sx={{
          background: 'rgba(10,10,18,0.85)',
          borderRadius: '23px', p: 3,
          backdropFilter: 'blur(40px)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top shimmer line */}
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(108,99,255,0.5), rgba(236,72,153,0.3), transparent)',
            backgroundSize: '200% 100%', animation: 'credShimmer 3s linear infinite',
          }} />

          {/* Title bar */}
          <Box sx={{ display: 'flex', gap: 0.7, mb: 3, transform: 'translateZ(20px)', alignItems: 'center' }}>
            {['#FF5F57', '#FEBD2E', '#27C840'].map((c) => (
              <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.85, boxShadow: `0 0 6px ${c}40` }} />
            ))}
            <Typography sx={{ color: 'rgba(255,255,255,0.15)', ml: 1.5, fontSize: '0.55rem', fontWeight: 500, letterSpacing: 1 }}>
              reviewpulse.app
            </Typography>
          </Box>

          <Typography sx={{ color: 'rgba(255,255,255,0.2)', letterSpacing: 3, fontSize: '0.58rem', fontWeight: 600, mb: 2, transform: 'translateZ(15px)' }}>
            DASHBOARD PREVIEW
          </Typography>

          {/* Stat cards */}
          <Grid container spacing={1.5}>
            {[
              { label: 'Total Reviews', value: '1,284', icon: <ReviewsIcon />, color: '#6C63FF' },
              { label: 'Avg Rating', value: '4.7 ★', icon: <StarIcon />, color: '#F59E0B' },
              { label: 'Sentiment', value: '89%', icon: <TrendingUpIcon />, color: '#22C55E' },
              { label: 'Link Usage', value: '76%', icon: <LinkIcon />, color: '#A78BFA' },
            ].map((stat, i) => (
              <Grid size={6} key={stat.label}>
                <Box sx={{
                  p: 2, borderRadius: '14px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  transform: `translateZ(${25 + i * 5}px)`,
                  opacity: loaded ? 1 : 0,
                  transition: `all 0.6s ${0.8 + i * 0.1}s cubic-bezier(0.16,1,0.3,1), background 0.3s, border 0.3s, box-shadow 0.3s`,
                  '&:hover': {
                    background: `${stat.color}08`,
                    border: `1px solid ${stat.color}20`,
                    boxShadow: `0 8px 20px ${stat.color}08`,
                  },
                }}>
                  <Box sx={{ color: stat.color, mb: 0.5, '& svg': { fontSize: 18 }, opacity: 0.7 }}>
                    {stat.icon}
                  </Box>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Bar chart */}
          <Box sx={{ mt: 2.5, display: 'flex', gap: 0.5, alignItems: 'flex-end', height: 50, transform: 'translateZ(30px)' }}>
            {[35, 50, 40, 65, 55, 80, 70, 90, 60, 75, 85, 95].map((h, i) => (
              <Box key={i} sx={{
                flex: 1, height: `${h}%`, borderRadius: '3px 3px 1px 1px',
                background: `rgba(108,99,255,${0.15 + (h / 100) * 0.45})`,
                transformOrigin: 'bottom',
                animation: `credBarGrow 0.7s ${1.0 + i * 0.05}s cubic-bezier(0.16,1,0.3,1) both`,
                transition: 'all 0.3s',
                '&:hover': { background: 'rgba(108,99,255,0.7)' },
              }} />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 2 — SCROLLING MARQUEE
   CRED-style infinite scrolling text strip
   ═══════════════════════════════════════════════════════════════════════════ */
const MarqueeSection = () => {
  const items = ['Verified Reviews', 'AI Sentiment Analysis', '72-Hour Secure Links', 'Brand Analytics', 'Anti-Fraud', 'Real-Time Insights', 'Order-Verified Only'];
  return (
    <Box sx={{
      py: 3.5, overflow: 'hidden', position: 'relative',
      borderTop: '1px solid rgba(255,255,255,0.03)',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      background: 'linear-gradient(180deg, rgba(108,99,255,0.02) 0%, transparent 100%)',
    }}>
      <Box sx={{
        display: 'flex', whiteSpace: 'nowrap',
        animation: 'credMarquee 25s linear infinite',
      }}>
        {[...items, ...items].map((item, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', mx: 4 }}>
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: '#6C63FF', opacity: 0.35, mr: 2, boxShadow: '0 0 6px rgba(108,99,255,0.3)' }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {item}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 3 — FEATURES (CRED-style large alternating rows)
   ═══════════════════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: <LockIcon sx={{ fontSize: 40 }} />,
    tag: 'ANTI-FRAUD',
    tagColor: '#EF4444',
    title: '72-Hour Secure Links',
    subtitle: 'One link. One review. Zero manipulation.',
    description: 'Each review link expires in 72 hours and is cryptographically tied to a verified order. No duplicates, no bots, no gaming the system.',
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
    tag: 'VERIFIED ONLY',
    tagColor: '#22C55E',
    title: '100% Verified Reviews',
    subtitle: 'Only real buyers. Always.',
    description: 'Only customers who actually purchased your product can leave a review. Say goodbye to fake reviews polluting your data forever.',
  },
  {
    icon: <InsightsIcon sx={{ fontSize: 40 }} />,
    tag: 'DEEP INSIGHTS',
    tagColor: '#6C63FF',
    title: 'Brand-Level Analytics',
    subtitle: 'AI that reads between the lines.',
    description: 'AI-powered sentiment analysis, topic extraction, and trend tracking across all your products. See what customers really think — in real time.',
  },
];

const FeatureRow = ({ feature, index, isReversed }) => {
  const [ref, inView] = useInView(0.12);
  const [hover, setHover] = useState(false);

  return (
    <Box ref={ref} sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center" direction={isReversed ? 'row-reverse' : 'row'}>
          {/* Text side */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Tag */}
            <Typography sx={{
              color: feature.tagColor, fontWeight: 700, fontSize: '0.7rem',
              letterSpacing: '0.15em', mb: 2,
              opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(30px)',
              transition: 'all 0.7s 0.1s cubic-bezier(0.16,1,0.3,1)',
            }}>
              {feature.tag}
            </Typography>

            {/* Title */}
            <Typography variant="h2" sx={{
              color: '#fff', fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.8rem' },
              lineHeight: 1.1, letterSpacing: '-0.03em', mb: 1.5,
              opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(40px)',
              filter: inView ? 'blur(0)' : 'blur(4px)',
              transition: 'all 0.8s 0.15s cubic-bezier(0.16,1,0.3,1)',
            }}>
              {feature.title}
            </Typography>

            {/* Subtitle */}
            <Typography sx={{
              color: 'rgba(255,255,255,0.55)', fontWeight: 500,
              fontSize: { xs: '1.05rem', md: '1.2rem' }, mb: 2.5,
              opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(30px)',
              transition: 'all 0.7s 0.25s cubic-bezier(0.16,1,0.3,1)',
            }}>
              {feature.subtitle}
            </Typography>

            {/* Description */}
            <Typography sx={{
              color: 'rgba(255,255,255,0.3)', lineHeight: 1.9,
              fontSize: '0.95rem', maxWidth: 440,
              opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(30px)',
              transition: 'all 0.7s 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}>
              {feature.description}
            </Typography>

            {/* Accent line */}
            <Box sx={{
              mt: 3, height: 2, borderRadius: 1,
              background: `linear-gradient(90deg, ${feature.tagColor}, transparent)`,
              width: inView ? 80 : 0,
              transition: 'width 0.8s 0.5s cubic-bezier(0.16,1,0.3,1)',
            }} />
          </Grid>

          {/* Visual side — CRED-style glassmorphic icon card */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              sx={{
                width: { xs: 220, md: 280 }, height: { xs: 220, md: 280 },
                borderRadius: '28px', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `radial-gradient(circle at 30% 30%, ${feature.tagColor}0D, transparent 70%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${hover ? feature.tagColor + '30' : 'rgba(255,255,255,0.05)'}`,
                boxShadow: hover ? `0 30px 80px rgba(0,0,0,0.35), 0 0 60px ${feature.tagColor}0A` : '0 10px 40px rgba(0,0,0,0.2)',
                transform: inView
                  ? (hover ? 'translateY(-8px) scale(1.02)' : 'none')
                  : (isReversed ? 'translateX(-60px)' : 'translateX(60px)'),
                opacity: inView ? 1 : 0,
                filter: inView ? 'blur(0)' : 'blur(6px)',
                transition: 'all 0.9s 0.2s cubic-bezier(0.16,1,0.3,1)',
                overflow: 'hidden',
              }}
            >
              {/* Rotating ring */}
              <Box sx={{
                position: 'absolute', inset: 20,
                border: `1px dashed ${feature.tagColor}15`,
                borderRadius: '50%',
                animation: 'credSpin 30s linear infinite',
              }} />
              {/* Inner glow */}
              <Box sx={{
                position: 'absolute',
                width: 120, height: 120, borderRadius: '50%',
                background: `radial-gradient(circle, ${feature.tagColor}15, transparent 70%)`,
                animation: hover ? 'credPulse 2s ease-in-out infinite' : 'none',
              }} />
              {/* Icon */}
              <Box sx={{
                color: feature.tagColor, position: 'relative', zIndex: 1,
                animation: hover ? 'credFloatSlow 3s ease-in-out infinite' : 'none',
                '& svg': { fontSize: { xs: 48, md: 56 } },
              }}>
                {feature.icon}
              </Box>
              {/* Step number */}
              <Typography sx={{
                position: 'absolute', bottom: 20, right: 24,
                color: 'rgba(255,255,255,0.04)', fontSize: '3.5rem', fontWeight: 900,
                lineHeight: 1,
              }}>
                {String(index + 1).padStart(2, '0')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const FeaturesSection = () => (
  <Box id="features" sx={{ position: 'relative' }}>
    {FEATURES.map((f, i) => (
      <FeatureRow key={f.title} feature={f} index={i} isReversed={i % 2 !== 0} />
    ))}
  </Box>
);

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 4 — STATS (CRED-style large numbers, animated counters)
   ═══════════════════════════════════════════════════════════════════════════ */
const STATS = [
  { num: 50, suffix: 'K+', label: 'Reviews Collected', color: '#6C63FF' },
  { num: 98, suffix: '%', label: 'Delivery Rate', color: '#22C55E' },
  { num: 3, suffix: '', label: 'Active Brands', color: '#EC4899' },
  { num: 2, suffix: 'hr', label: 'Avg Response', prefix: '<', color: '#06B6D4' },
];

const StatItem = ({ stat, index }) => {
  const [ref, inView] = useInView(0.3);
  const count = useCounter(stat.num, 1800, inView);
  return (
    <Grid size={{ xs: 6, md: 3 }}>
      <Box ref={ref} sx={{
        textAlign: 'center', py: 3,
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(40px)',
        transition: `all 0.7s ${index * 0.1}s cubic-bezier(0.16,1,0.3,1)`,
      }}>
        <Typography sx={{
          fontWeight: 800, fontSize: { xs: '2.5rem', md: '3.5rem' },
          lineHeight: 1, letterSpacing: '-0.04em',
          color: '#fff',
        }}>
          {stat.prefix || ''}{count}{stat.suffix}
        </Typography>
        <Typography sx={{
          color: 'rgba(255,255,255,0.25)', mt: 1, fontWeight: 500,
          fontSize: '0.85rem', letterSpacing: '0.05em',
        }}>
          {stat.label}
        </Typography>
        {/* Underline dot */}
        <Box sx={{
          width: 4, height: 4, borderRadius: '50%', mx: 'auto', mt: 2,
          background: stat.color, color: stat.color,
          animation: inView ? 'credDotPulse 2s ease-in-out infinite' : 'none',
          animationDelay: `${index * 0.2}s`,
        }} />
      </Box>
    </Grid>
  );
};

const StatsSection = () => (
  <Box sx={{
    py: { xs: 8, md: 12 }, position: 'relative',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    background: 'linear-gradient(180deg, transparent 0%, rgba(108,99,255,0.015) 50%, transparent 100%)',
  }}>
    {/* Shimmer top line */}
    <Box sx={{
      position: 'absolute', top: -1, left: 0, right: 0, height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(108,99,255,0.3), transparent)',
      backgroundSize: '200% 100%', animation: 'credShimmer 5s linear infinite',
    }} />
    <Container maxWidth="lg">
      <Grid container spacing={2}>
        {STATS.map((s, i) => <StatItem key={s.label} stat={s} index={i} />)}
      </Grid>
    </Container>
  </Box>
);

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 5 — HOW IT WORKS (CRED-style vertical timeline)
   ═══════════════════════════════════════════════════════════════════════════ */
const STEPS = [
  { num: '01', title: 'Order Placed', desc: 'A customer completes a purchase from your store or platform.', color: '#6C63FF', icon: <ReviewsIcon /> },
  { num: '02', title: 'Secure Link Sent', desc: 'ReviewPulse sends a unique 72-hour review link via email to the verified customer.', color: '#EC4899', icon: <LinkIcon /> },
  { num: '03', title: 'Customer Reviews', desc: 'The customer writes an authentic review through the secure, time-limited link.', color: '#22C55E', icon: <StarIcon /> },
  { num: '04', title: 'You Get Insights', desc: 'AI analyzes sentiment, topics, and trends — you see actionable data in real time.', color: '#06B6D4', icon: <InsightsIcon /> },
];

const TimelineStep = ({ step, index, isLast }) => {
  const [ref, inView] = useInView(0.3);
  const [hover, setHover] = useState(false);
  const isMobile = useMediaQuery('(max-width:899px)');

  return (
    <Box ref={ref} sx={{ display: 'flex', gap: { xs: 3, md: 5 }, position: 'relative' }}>
      {/* Timeline line + dot */}
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minWidth: { xs: 40, md: 56 },
      }}>
        {/* Dot */}
        <Box
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          sx={{
            width: { xs: 40, md: 56 }, height: { xs: 40, md: 56 },
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: hover ? `${step.color}15` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${hover ? step.color + '30' : 'rgba(255,255,255,0.06)'}`,
            color: step.color, flexShrink: 0,
            opacity: inView ? 1 : 0,
            transform: inView ? 'scale(1)' : 'scale(0.7)',
            transition: `all 0.6s ${index * 0.1}s cubic-bezier(0.16,1,0.3,1)`,
            animation: hover ? 'credStepPulse 1.5s ease-in-out infinite' : 'none',
            '& svg': { fontSize: { xs: 18, md: 22 } },
          }}
        >
          {step.icon}
        </Box>
        {/* Vertical line */}
        {!isLast && (
          <Box sx={{
            width: 1, flex: 1, mt: 1,
            background: inView
              ? `linear-gradient(180deg, ${step.color}30, rgba(255,255,255,0.04))`
              : 'rgba(255,255,255,0.02)',
            transition: 'background 0.8s ease',
          }} />
        )}
      </Box>

      {/* Content */}
      <Box sx={{
        pb: isLast ? 0 : { xs: 5, md: 7 },
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(30px)',
        transition: `all 0.7s ${0.1 + index * 0.1}s cubic-bezier(0.16,1,0.3,1)`,
      }}>
        <Typography sx={{
          color: step.color, fontWeight: 700, fontSize: '0.7rem',
          letterSpacing: '0.12em', mb: 0.8, opacity: 0.7,
        }}>
          STEP {step.num}
        </Typography>
        <Typography variant="h4" sx={{
          color: '#fff', fontWeight: 800,
          fontSize: { xs: '1.4rem', md: '1.8rem' },
          letterSpacing: '-0.02em', mb: 1, lineHeight: 1.2,
        }}>
          {step.title}
        </Typography>
        <Typography sx={{
          color: 'rgba(255,255,255,0.35)', lineHeight: 1.8,
          fontSize: '0.95rem', maxWidth: 420,
        }}>
          {step.desc}
        </Typography>
      </Box>
    </Box>
  );
};

const HowItWorksSection = () => {
  const [ref, inView] = useInView(0.1);
  return (
    <Box id="how-it-works" sx={{ py: { xs: 10, md: 16 }, position: 'relative' }}>
      {/* Background orb */}
      <Box sx={{
        position: 'absolute', top: '20%', right: '-8%', width: 300, height: 300,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.05) 0%, transparent 70%)',
        animation: 'credOrb2 20s ease-in-out infinite', filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <Container maxWidth="md">
        {/* Section header */}
        <Box ref={ref} sx={{ mb: { xs: 6, md: 10 } }}>
          <Typography sx={{
            color: '#6C63FF', fontWeight: 700, fontSize: '0.7rem',
            letterSpacing: '0.15em', mb: 2,
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
          }}>
            HOW IT WORKS
          </Typography>
          <Typography variant="h2" sx={{
            color: '#fff', fontWeight: 800,
            fontSize: { xs: '2rem', md: '3rem' },
            lineHeight: 1.1, letterSpacing: '-0.03em',
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(30px)',
            filter: inView ? 'blur(0)' : 'blur(4px)',
            transition: 'all 0.7s 0.1s cubic-bezier(0.16,1,0.3,1)',
          }}>
            Four simple steps{' '}
            <Box component="span" sx={{
              background: 'linear-gradient(135deg, #EC4899, #06B6D4)',
              backgroundSize: '200% 200%', animation: 'credGradientShift 4s ease infinite',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              to real insights
            </Box>
          </Typography>
        </Box>

        {/* Timeline */}
        {STEPS.map((step, i) => (
          <TimelineStep key={step.num} step={step} index={i} isLast={i === STEPS.length - 1} />
        ))}
      </Container>
    </Box>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CTA SECTION — CRED-style full-width cinematic call-to-action
   ═══════════════════════════════════════════════════════════════════════════ */
const CtaSection = () => {
  const [ref, inView] = useInView(0.2);
  const navigate = useNavigate();
  return (
    <Box sx={{
      py: { xs: 12, md: 18 }, position: 'relative', overflow: 'hidden',
      borderTop: '1px solid rgba(255,255,255,0.04)',
    }}>
      {/* Background glow */}
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 60%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <Container maxWidth="sm" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Box ref={ref}>
          <Typography sx={{
            color: '#6C63FF', fontWeight: 700, fontSize: '0.7rem',
            letterSpacing: '0.15em', mb: 3,
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
          }}>
            GET STARTED
          </Typography>

          <Typography variant="h2" sx={{
            color: '#fff', fontWeight: 800,
            fontSize: { xs: '2rem', md: '3rem' },
            lineHeight: 1.1, letterSpacing: '-0.03em', mb: 3,
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(40px)',
            filter: inView ? 'blur(0)' : 'blur(4px)',
            transition: 'all 0.8s 0.1s cubic-bezier(0.16,1,0.3,1)',
          }}>
            Ready to hear what your customers{' '}
            <Box component="span" sx={{
              background: 'linear-gradient(135deg, #6C63FF, #EC4899)',
              backgroundSize: '200% 200%', animation: 'credGradientShift 4s ease infinite',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              really think?
            </Box>
          </Typography>

          <Typography sx={{
            color: 'rgba(255,255,255,0.3)', mb: 5,
            fontSize: '1rem', lineHeight: 1.8,
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(30px)',
            transition: 'all 0.7s 0.2s cubic-bezier(0.16,1,0.3,1)',
          }}>
            Join brands that trust ReviewPulse for verified, actionable customer feedback.
          </Typography>

          <Box sx={{
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(30px)',
            transition: 'all 0.7s 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <Button
              variant="contained" size="large"
              onClick={() => navigate('/login')}
              sx={{
                background: '#fff', color: '#0A0A12',
                textTransform: 'none', fontWeight: 700, fontSize: '1.1rem',
                px: 6, py: 2, borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.1)',
                '&::before': {
                  content: '""', position: 'absolute', top: 0, left: '-100%',
                  width: '100%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(108,99,255,0.1), transparent)',
                  animation: 'credShimmer 3s ease-in-out infinite',
                },
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(255,255,255,0.08)',
                '&:hover': {
                  background: '#fff',
                  boxShadow: '0 24px 64px rgba(255,255,255,0.15)',
                  transform: 'translateY(-3px) scale(1.02)',
                },
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              Start Free Trial
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   HOME PAGE — CRED-style composition
   ═══════════════════════════════════════════════════════════════════════════ */
const HomePage = () => {
  return (
    <Box sx={{ background: '#0A0A12', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style>{credKeyframes}</style>
      <ScrollProgress />
      <CinematicParticles />
      <Navbar />
      <HeroSection />
      <MarqueeSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </Box>
  );
};

export default HomePage;
