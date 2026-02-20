import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href) => {
    setDrawerOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: scrolled
            ? 'rgba(15, 14, 23, 0.85)'
            : 'rgba(15, 14, 23, 0.5)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(108, 99, 255, 0.1)',
          transition: 'background 0.3s ease',
        }}
      >
        <Toolbar
          sx={{
            maxWidth: '1200px',
            width: '100%',
            mx: 'auto',
            px: { xs: 2, md: 3 },
            py: 0.5,
          }}
        >
          {/* Logo */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => scrollTo('#hero')}
          >
            <img
              src="/logo2.png"
              alt="ReviewPulse"
              height="36px"
              style={{ marginRight: 8 }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop nav links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    px: 2,
                    '&:hover': {
                      color: '#fff',
                      background: 'rgba(108, 99, 255, 0.08)',
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}

              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  color: '#6C63FF',
                  borderColor: 'rgba(108, 99, 255, 0.5)',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  ml: 2,
                  px: 2.5,
                  borderRadius: '10px',
                  '&:hover': {
                    borderColor: '#6C63FF',
                    background: 'rgba(108, 99, 255, 0.08)',
                  },
                }}
              >
                Login
              </Button>

              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 2.5,
                  borderRadius: '10px',
                  boxShadow: '0 4px 15px rgba(108, 99, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5A52E0 0%, #7C4FE0 100%)',
                    boxShadow: '0 6px 20px rgba(108, 99, 255, 0.45)',
                  },
                }}
              >
                Get Started
              </Button>
            </Box>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ color: '#fff' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: '#0F0E17',
            borderLeft: '1px solid rgba(108, 99, 255, 0.15)',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {NAV_LINKS.map((link) => (
            <ListItem
              button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              sx={{ '&:hover': { background: 'rgba(108, 99, 255, 0.08)' } }}
            >
              <ListItemText
                primary={link.label}
                sx={{ color: 'rgba(255,255,255,0.8)' }}
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ px: 2, mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => { setDrawerOpen(false); navigate('/login'); }}
            sx={{
              color: '#6C63FF',
              borderColor: 'rgba(108, 99, 255, 0.5)',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              '&:hover': { borderColor: '#6C63FF' },
            }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => { setDrawerOpen(false); navigate('/login'); }}
            sx={{
              background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              '&:hover': {
                background: 'linear-gradient(135deg, #5A52E0 0%, #7C4FE0 100%)',
              },
            }}
          >
            Get Started
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
