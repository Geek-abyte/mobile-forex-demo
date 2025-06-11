export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'trade' | 'market' | 'price_alert' | 'news' | 'account' | 'system' | 'p2p';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string; // ISO string for Redux serialization
  isRead: boolean;
  data?: any; // Additional data for actions
  actionType?: 'navigate' | 'execute' | 'dismiss';
  actionTarget?: string; // Screen to navigate to or action to execute
  icon?: string;
  color?: string;
  persistent?: boolean; // Whether notification should persist until user dismisses
  autoRemove?: boolean; // Whether to auto-remove after timeout
  timeout?: number; // Timeout in milliseconds
}

export interface NotificationSettings {
  enabled: boolean;
  tradingAlerts: boolean;
  marketNews: boolean;
  priceAlerts: boolean;
  accountUpdates: boolean;
  p2pMessages: boolean;
  systemNotifications: boolean;
  sound: boolean;
  vibration: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // Format: "HH:mm"
    endTime: string;   // Format: "HH:mm"
  };
}

export interface NotificationTemplate {
  type: Notification['type'];
  title: string;
  messageTemplate: string; // Template with placeholders like {{symbol}}, {{price}}, etc.
  priority: Notification['priority'];
  icon?: string;
  color?: string;
  persistent?: boolean;
  autoRemove?: boolean;
  timeout?: number;
}

export interface PushNotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: number;
  channelId?: string;
}
