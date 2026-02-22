import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const el = document.getElementById('hero');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: scrolled
          ? 'rgba(10, 10, 18, 0.82)'
          : 'rgba(10, 10, 18, 0.35)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        borderBottom: scrolled
          ? '1px solid rgba(108, 99, 255, 0.1)'
          : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <Toolbar
        sx={{
          maxWidth: '1200px',
          width: '100%',
          mx: 'auto',
          px: { xs: 2, md: 3 },
          py: 0.8,
          minHeight: { xs: 64, md: 72 },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'opacity 0.3s',
            '&:hover': { opacity: 0.85 },
          }}
          onClick={scrollToTop}
        >
          <img
            src="/logo2.png"
            alt="ReviewPulse"
            height="48px"
            style={{ marginRight: 8 }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Login button only */}
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{
            background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            px: 3.5,
            py: 1,
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(108, 99, 255, 0.25)',
            border: '1px solid rgba(108, 99, 255, 0.15)',
            letterSpacing: '0.01em',
            '&:hover': {
              background: 'linear-gradient(135deg, #5A52E0 0%, #7C4FE0 100%)',
              boxShadow: '0 8px 30px rgba(108, 99, 255, 0.4)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          Login
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
