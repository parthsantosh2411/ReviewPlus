import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#0F0E17',
        }}
      >
        <CircularProgress sx={{ color: '#6C63FF' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based route guard
  const path = location.pathname;
  if (user?.role === 'superadmin' && path.startsWith('/dashboard')) {
    return <Navigate to="/superadmin" replace />;
  }
  if (user?.role !== 'superadmin' && path.startsWith('/superadmin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
