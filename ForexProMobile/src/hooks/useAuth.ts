import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  clearError,
  setBiometricEnabled,
  setOnboardingCompleted,
} from '@/store/slices/authSlice';
import { authService, LoginCredentials, RegisterData } from '@/services/authService';
import NotificationIntegration from '@/services/notificationIntegration';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { 
    isAuthenticated, 
    user, 
    isLoading, 
    error, 
    biometricEnabled, 
    onboardingCompleted 
  } = useAppSelector((state) => state.auth);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch(loginStart());
      const response = await authService.login(credentials);
      dispatch(loginSuccess(response));
      
      // Trigger login notification
      const userName = response.user?.firstName || response.user?.email;
      await NotificationIntegration.onUserLogin(userName);
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch(loginFailure(message));
      throw error;
    }
  }, [dispatch]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      dispatch(loginStart());
      const response = await authService.register(data);
      dispatch(loginSuccess(response));
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch(loginFailure(message));
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch(logoutAction());
      
      // Handle logout notifications
      NotificationIntegration.onUserLogout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      dispatch(logoutAction());
      NotificationIntegration.onUserLogout();
    }
  }, [dispatch]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await authService.forgotPassword(email);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      dispatch(loginFailure(message));
      throw error;
    }
  }, [dispatch]);

  const setupBiometric = useCallback(async () => {
    try {
      const available = await authService.checkBiometricAvailability();
      if (!available) {
        throw new Error('Biometric authentication is not available on this device');
      }
      
      const success = await authService.setupBiometric();
      if (success) {
        dispatch(setBiometricEnabled(true));
      }
      return success;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Biometric setup failed';
      dispatch(loginFailure(message));
      throw error;
    }
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const completeOnboarding = useCallback(() => {
    dispatch(setOnboardingCompleted(true));
  }, [dispatch]);

  return {
    // State
    isAuthenticated,
    user,
    isLoading,
    error,
    biometricEnabled,
    onboardingCompleted,
    
    // Actions
    login,
    register,
    logout,
    forgotPassword,
    setupBiometric,
    clearAuthError,
    completeOnboarding,
  };
};
