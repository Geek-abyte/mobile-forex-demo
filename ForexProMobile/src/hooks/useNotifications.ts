import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
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
} from '@/store/slices/notificationSlice';
import { notificationService } from '@/services/notificationService';
import { Notification, NotificationSettings } from '@/types/notification';

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const {
    notifications,
    unreadCount,
    settings,
    isLoading,
    error,
    lastNotificationTime,
  } = useAppSelector((state) => state.notifications);

  // Removed listener setup - now handled by NotificationManager

  // Clean up expired notifications periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      dispatch(removeExpiredNotifications());
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, [dispatch]);

  // Actions
  const markNotificationAsRead = useCallback((id: string) => {
    dispatch(markAsRead(id));
  }, [dispatch]);

  const markAllNotificationsAsRead = useCallback(() => {
    dispatch(markAllAsRead());
  }, [dispatch]);

  const removeNotificationById = useCallback((id: string) => {
    dispatch(removeNotification(id));
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  const clearReadNotificationsOnly = useCallback(() => {
    dispatch(clearReadNotifications());
  }, [dispatch]);

  const updateNotificationSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      dispatch(setLoading(true));
      await notificationService.updateSettings(newSettings);
      dispatch(updateSettings(newSettings));
      dispatch(clearError());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const bulkMarkAsRead = useCallback((ids: string[]) => {
    dispatch(markMultipleAsRead(ids));
  }, [dispatch]);

  const bulkRemoveNotifications = useCallback((ids: string[]) => {
    dispatch(removeMultipleNotifications(ids));
  }, [dispatch]);

  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Notification creation helpers
  const showTradeNotification = useCallback(async (
    symbol: string,
    type: 'buy' | 'sell',
    amount: number,
    price: number
  ) => {
    await notificationService.showTradeExecuted(symbol, type, amount, price);
  }, []);

  const showPriceAlert = useCallback(async (
    symbol: string,
    targetPrice: number,
    currentPrice: number
  ) => {
    await notificationService.showPriceAlert(symbol, targetPrice, currentPrice);
  }, []);

  const showMarketAlert = useCallback(async (
    symbol: string,
    direction: 'risen' | 'fallen',
    percentage: number,
    price: number
  ) => {
    await notificationService.showMarketMovement(symbol, direction, percentage, price);
  }, []);

  const showMarginCallWarning = useCallback(async (marginLevel: number) => {
    await notificationService.showMarginCall(marginLevel);
  }, []);

  const showP2PNotification = useCallback(async (message: string) => {
    await notificationService.showP2PUpdate(message);
  }, []);

  const showSystemNotification = useCallback(async (message: string) => {
    await notificationService.showSystemUpdate(message);
  }, []);

  const showNewsAlert = useCallback(async (headline: string, summary?: string) => {
    await notificationService.showNewsAlert(headline, summary);
  }, []);

  // Filtering helpers
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((n: Notification) => !n.isRead);
  }, [notifications]);

  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter((n: Notification) => n.type === type);
  }, [notifications]);

  const getNotificationsByPriority = useCallback((priority: Notification['priority']) => {
    return notifications.filter((n: Notification) => n.priority === priority);
  }, [notifications]);

  const getRecentNotifications = useCallback((hours: number = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return notifications.filter((n: Notification) => new Date(n.timestamp) > cutoff);
  }, [notifications]);

  // Statistics
  const getNotificationStats = useCallback(() => {
    const total = notifications.length;
    const unread = unreadCount;
    const byType = notifications.reduce((acc: Record<string, number>, n: Notification) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byPriority = notifications.reduce((acc: Record<string, number>, n: Notification) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unread,
      read: total - unread,
      byType,
      byPriority,
    };
  }, [notifications, unreadCount]);

  // Simulation controls
  const startNotificationSimulation = useCallback(async () => {
    await notificationService.startTradingSimulation();
    await notificationService.simulateP2PActivity();
    await notificationService.simulateMarketNews();
  }, []);

  return {
    // State
    notifications,
    unreadCount,
    settings,
    isLoading,
    error,
    lastNotificationTime,

    // Actions
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotificationById,
    clearAllNotifications,
    clearReadNotificationsOnly,
    updateNotificationSettings,
    bulkMarkAsRead,
    bulkRemoveNotifications,
    clearErrorMessage,

    // Notification creators
    showTradeNotification,
    showPriceAlert,
    showMarketAlert,
    showMarginCallWarning,
    showP2PNotification,
    showSystemNotification,
    showNewsAlert,

    // Filters
    getUnreadNotifications,
    getNotificationsByType,
    getNotificationsByPriority,
    getRecentNotifications,

    // Statistics
    getNotificationStats,

    // Simulation
    startNotificationSimulation,
  };
};
