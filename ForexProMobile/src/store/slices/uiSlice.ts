import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode, LanguageCode, CurrencyCode } from '@/types/common';

export interface UIState {
  theme: ThemeMode;
  language: LanguageCode;
  currency: CurrencyCode;
  isOnboardingComplete: boolean;
  isFirstLaunch: boolean;
  activeTab: string;
  isLoading: boolean;
  error: string | null;
  toastMessage: string | null;
  isOffline: boolean;
}

const initialState: UIState = {
  theme: 'dark',
  language: 'en',
  currency: 'USD',
  isOnboardingComplete: false,
  isFirstLaunch: true,
  activeTab: 'trading',
  isLoading: false,
  error: null,
  toastMessage: null,
  isOffline: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.language = action.payload;
    },
    setCurrency: (state, action: PayloadAction<CurrencyCode>) => {
      state.currency = action.payload;
    },
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingComplete = action.payload;
    },
    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.isFirstLaunch = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setToastMessage: (state, action: PayloadAction<string | null>) => {
      state.toastMessage = action.payload;
    },
    setOfflineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearToast: (state) => {
      state.toastMessage = null;
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setCurrency,
  setOnboardingComplete,
  setFirstLaunch,
  setActiveTab,
  setLoading,
  setError,
  setToastMessage,
  setOfflineStatus,
  clearError,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;
