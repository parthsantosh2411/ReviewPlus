import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 5,
        borderTop: '1px solid rgba(108,99,255,0.06)',
        background: 'linear-gradient(180deg, rgba(10,10,18,0.4) 0%, rgba(10,10,18,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top shimmer */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent 10%, rgba(108,99,255,0.15) 50%, transparent 90%)',
      }} />
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <img src="/logo2.png" alt="ReviewPulse" height="36" style={{ opacity: 0.85 }} />
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: '0.78rem',
              fontWeight: 400,
              letterSpacing: '0.02em',
            }}
          >
            &copy; {new Date().getFullYear()} ReviewPulse. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
