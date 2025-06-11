import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationSettings } from '@/types/notification';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  lastNotificationTime: string | null;
}

const initialSettings: NotificationSettings = {
  enabled: true,
  tradingAlerts: true,
  marketNews: true,
  priceAlerts: true,
  accountUpdates: true,
  p2pMessages: true,
  systemNotifications: true,
  sound: true,
  vibration: true,
  pushNotifications: true,
  emailNotifications: false,
  quietHours: {
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
  },
};

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  settings: initialSettings,
  isLoading: false,
  error: null,
  lastNotificationTime: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
      state.lastNotificationTime = action.payload.timestamp;
    },
    
    addMultipleNotifications: (state, action: PayloadAction<Notification[]>) => {
      const newNotifications = action.payload;
      state.notifications.unshift(...newNotifications);
      const unreadNew = newNotifications.filter(n => !n.isRead).length;
      state.unreadCount += unreadNew;
      if (newNotifications.length > 0) {
        state.lastNotificationTime = new Date().toISOString();
      }
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    clearReadNotifications: (state) => {
      state.notifications = state.notifications.filter(n => !n.isRead);
    },

    updateSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Auto-remove notifications that have expired
    removeExpiredNotifications: (state) => {
      const now = new Date().getTime();
      const toRemove: string[] = [];
      
      state.notifications.forEach(notification => {
        if (notification.autoRemove && notification.timeout) {
          const notificationTime = new Date(notification.timestamp).getTime();
          if (now - notificationTime > notification.timeout) {
            toRemove.push(notification.id);
            if (!notification.isRead) {
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
          }
        }
      });

      if (toRemove.length > 0) {
        state.notifications = state.notifications.filter(n => !toRemove.includes(n.id));
      }
    },

    // Bulk operations
    markMultipleAsRead: (state, action: PayloadAction<string[]>) => {
      const ids = action.payload;
      let readCount = 0;
      
      state.notifications.forEach(notification => {
        if (ids.includes(notification.id) && !notification.isRead) {
          notification.isRead = true;
          readCount++;
        }
      });

      state.unreadCount = Math.max(0, state.unreadCount - readCount);
    },

    removeMultipleNotifications: (state, action: PayloadAction<string[]>) => {
      const ids = action.payload;
      const toRemove = state.notifications.filter(n => ids.includes(n.id));
      const unreadRemoved = toRemove.filter(n => !n.isRead).length;
      
      state.unreadCount = Math.max(0, state.unreadCount - unreadRemoved);
      state.notifications = state.notifications.filter(n => !ids.includes(n.id));
    },
  },
});

export const {
  addNotification,
  addMultipleNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
  clearReadNotifications,
  updateSettings,
  setLoading,
  setError,
  clearError,
  removeExpiredNotifications,
  markMultipleAsRead,
  removeMultipleNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
