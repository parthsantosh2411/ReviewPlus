import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signIn,
  confirmSignIn,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
} from 'aws-amplify/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

/* ---------- helpers ---------- */
const USER_KEY = 'reviewpulse_user';

/* ---------- provider ---------- */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // initial check

  // On mount — check if user is already signed in via Cognito session
  useEffect(() => {
    const checkSession = async () => {
      try {
        await getCurrentUser();
        const attributes = await fetchUserAttributes();
        const userData = {
          email: attributes.email || '',
          role: attributes['custom:role'] || 'viewer',
          brandId: attributes['custom:brandId'] || '',
        };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      } catch {
        // No active session
        localStorage.removeItem(USER_KEY);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async (email, password) => {
    // If there's already an active session, sign out first
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        console.log('[Auth] Active session found, signing out first');
        await signOut();
      }
    } catch {
      // No active session — good, proceed with sign-in
    }

    try {
      console.log('[Auth] Calling signIn with USER_PASSWORD_AUTH');
      const result = await signIn({
        username: email,
        password,
        options: { authFlowType: 'USER_PASSWORD_AUTH' },
      });
      console.log('[Auth] signIn result:', JSON.stringify(result.nextStep));

      const step = result.nextStep.signInStep;
      if (
        step === 'CONFIRM_SIGN_IN_WITH_SMS_MFA_CODE' ||
        step === 'CONFIRM_SIGN_IN_WITH_SMS_CODE' ||
        step === 'CONFIRM_SIGN_IN_WITH_EMAIL_MFA_CODE' ||
        step === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE'
      ) {
        const medium =
          result.nextStep?.codeDeliveryDetails?.deliveryMedium || 'EMAIL';
        return { requiresMfa: true, email, medium };
      }
      // No MFA — fetch attributes and set user
      const attributes = await fetchUserAttributes();
      const userData = {
        email: attributes.email || email,
        role: attributes['custom:role'] || 'viewer',
        brandId: attributes['custom:brandId'] || '',
      };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      return { requiresMfa: false };
    } catch (error) {
      console.error('[Auth] signIn error:', error.name, error.message, error);
      throw error;
    }
  }, []);

  const verifyOtp = useCallback(async (otpCode) => {
    try {
      await confirmSignIn({ challengeResponse: otpCode });
      const attributes = await fetchUserAttributes();
      const role = attributes['custom:role'] || 'viewer';
      const brandId = attributes['custom:brandId'] || '';
      const userData = { email: attributes.email, role, brandId };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      return { role, brandId, email: attributes.email };
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const getAccessToken = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch {
      return null;
    }
  }, []);

  const value = { isAuthenticated, user, login, verifyOtp, logout, loading, getAccessToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
