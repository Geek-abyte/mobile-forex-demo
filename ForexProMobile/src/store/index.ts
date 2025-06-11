import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import slices
import uiSlice from './slices/uiSlice';
import authSlice from './slices/authSlice';
import tradingSlice from './slices/tradingSlice';
import walletSlice from './slices/walletSlice';
import p2pSlice from './slices/p2pSlice';
import marketSlice from './slices/marketSlice';
import notificationSlice from './slices/notificationSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['ui', 'auth', 'trading', 'wallet'], // Persist core state
  blacklist: ['p2p', 'market', 'notifications'], // Don't persist real-time data
};

// Root reducer
const rootReducer = combineReducers({
  ui: uiSlice,
  auth: authSlice,
  trading: tradingSlice,
  wallet: walletSlice,
  p2p: p2pSlice,
  market: marketSlice,
  notifications: notificationSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['_persist'],
      },
    }),
  devTools: __DEV__, // Enable Redux DevTools in development
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
