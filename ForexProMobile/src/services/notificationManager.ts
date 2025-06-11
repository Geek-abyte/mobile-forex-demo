import { store } from '@/store';
import { addNotification } from '@/store/slices/notificationSlice';
import { notificationService } from './notificationService';
import { Notification } from '@/types/notification';

class NotificationManager {
  private static instance: NotificationManager;
  private isInitialized = false;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    
    // Set up global notification listener
    notificationService.addListener((notification: Notification) => {
      store.dispatch(addNotification(notification));
    });
  }

  cleanup(): void {
    this.isInitialized = false;
    // Note: notificationService doesn't expose a way to remove all listeners
    // This would need to be implemented if needed
  }
}

export const notificationManager = NotificationManager.getInstance();
