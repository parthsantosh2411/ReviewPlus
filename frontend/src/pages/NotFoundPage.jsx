import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0F0E17',
        px: 2,
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontWeight: 900,
          fontSize: { xs: '6rem', md: '9rem' },
          background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          mb: 1,
        }}
      >
        404
      </Typography>
      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)', mb: 4, maxWidth: 400 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button
        onClick={() => navigate('/')}
        variant="contained"
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '12px',
          px: 4,
          py: 1.3,
          background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #5A52E0 0%, #7C4FE0 100%)' },
        }}
      >
        Back to Home
      </Button>
    </Box>
  );
};

export default NotFoundPage;
