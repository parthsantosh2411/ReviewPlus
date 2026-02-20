import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        borderTop: '1px solid rgba(108,99,255,0.08)',
        background: 'rgba(15,14,23,0.6)',
      }}
    >
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src="/logo2.png" alt="ReviewPulse" height="28" />
          </Box>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}
          >
            © {new Date().getFullYear()} ReviewPulse. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
