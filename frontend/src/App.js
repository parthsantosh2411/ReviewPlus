import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OtpVerifyPage from './pages/OtpVerifyPage';
import DashboardPage from './pages/DashboardPage';
import ProductDashboardPage from './pages/ProductDashboardPage';
import ReviewFormPage from './pages/ReviewFormPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6C63FF' },
    background: { default: '#0F0E17', paper: '#1A1926' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1A1926',
                color: '#fff',
                border: '1px solid rgba(108,99,255,0.2)',
                borderRadius: '12px',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/verify" element={<OtpVerifyPage />} />
            <Route path="/review/:token" element={<ReviewFormPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/:productId"
              element={
                <PrivateRoute>
                  <ProductDashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/superadmin"
              element={
                <PrivateRoute>
                  <SuperAdminDashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
