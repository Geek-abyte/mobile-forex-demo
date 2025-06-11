import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Vibration } from 'react-native';
import { Notification, NotificationTemplate, NotificationSettings, PushNotificationData } from '@/types/notification';

class NotificationService {
  private notificationListeners: Set<(notification: Notification) => void> = new Set();
  private templates: NotificationTemplate[] = [];
  private settings: NotificationSettings | null = null;
  private nextId = 1;
  private simulationInterval: NodeJS.Timeout | null = null;
  private recentNotifications: Map<string, number> = new Map(); // For rate limiting

  constructor() {
    this.initializeTemplates();
    this.loadSettings();
  }

  private initializeTemplates() {
    this.templates = [
      // Trading notifications
      {
        type: 'trade',
        title: 'Trade Executed',
        messageTemplate: '{{type}} {{amount}} {{symbol}} at {{price}}',
        priority: 'high',
        icon: 'trending-up',
        color: '#00D4AA',
        persistent: false,
        autoRemove: true,
        timeout: 8000, // Increased from 10000
      },
      {
        type: 'trade',
        title: 'Stop Loss Triggered',
        messageTemplate: 'Stop loss triggered for {{symbol}} at {{price}}. Loss: {{loss}}',
        priority: 'critical',
        icon: 'warning',
        color: '#FF4757',
        persistent: true,
        autoRemove: false,
      },
      {
        type: 'trade',
        title: 'Take Profit Hit',
        messageTemplate: 'Take profit reached for {{symbol}} at {{price}}. Profit: {{profit}}',
        priority: 'high',
        icon: 'check-circle',
        color: '#00D4AA',
        persistent: false,
        autoRemove: true,
        timeout: 8000,
      },

      // Market notifications
      {
        type: 'market',
        title: 'Market Alert',
        messageTemplate: '{{symbol}} has {{direction}} by {{percentage}}% to {{price}}',
        priority: 'medium',
        icon: 'trending-up',
        color: '#FFA726',
        autoRemove: true,
        timeout: 15000,
      },
      {
        type: 'market',
        title: 'High Volatility Warning',
        messageTemplate: 'High volatility detected in {{symbol}}. Current price: {{price}}',
        priority: 'high',
        icon: 'warning',
        color: '#FF4757',
        persistent: false,
        autoRemove: true,
        timeout: 12000,
      },

      // Price alerts
      {
        type: 'price_alert',
        title: 'Price Alert',
        messageTemplate: '{{symbol}} has reached your target price of {{targetPrice}}',
        priority: 'high',
        icon: 'notifications',
        color: '#2196F3',
        persistent: false,
        autoRemove: true,
        timeout: 10000,
      },

      // News notifications
      {
        type: 'news',
        title: 'Market News',
        messageTemplate: '{{headline}}',
        priority: 'medium',
        icon: 'newspaper',
        color: '#9C27B0',
        autoRemove: true,
        timeout: 20000,
      },

      // Account notifications
      {
        type: 'account',
        title: 'Account Update',
        messageTemplate: '{{message}}',
        priority: 'medium',
        icon: 'account-circle',
        color: '#4CAF50',
        autoRemove: true,
        timeout: 15000,
      },
      {
        type: 'account',
        title: 'Margin Call Warning',
        messageTemplate: 'Margin level is at {{marginLevel}}%. Consider adding funds or closing positions.',
        priority: 'critical',
        icon: 'warning',
        color: '#FF4757',
        persistent: true,
        autoRemove: false,
      },

      // System notifications
      {
        type: 'system',
        title: 'System Update',
        messageTemplate: '{{message}}',
        priority: 'low',
        icon: 'info',
        color: '#607D8B',
        autoRemove: true,
        timeout: 10000,
      },

      // P2P notifications
      {
        type: 'p2p',
        title: 'P2P Trade Update',
        messageTemplate: '{{message}}',
        priority: 'medium',
        icon: 'swap-horizontal',
        color: '#FF9800',
        autoRemove: true,
        timeout: 15000,
      },
    ];
  }

  private async loadSettings(): Promise<void> {
    try {
      const savedSettings = await AsyncStorage.getItem('notification_settings');
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const currentSettings = this.settings || this.getDefaultSettings();
      this.settings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem('notification_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  getSettings(): NotificationSettings {
    return this.settings || this.getDefaultSettings();
  }

  private getDefaultSettings(): NotificationSettings {
    return {
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
  }

  private isQuietHours(): boolean {
    const settings = this.getSettings();
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { startTime, endTime } = settings.quietHours;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private shouldShowNotification(type: Notification['type']): boolean {
    const settings = this.getSettings();
    
    if (!settings.enabled) return false;
    if (this.isQuietHours()) return false;

    switch (type) {
      case 'trade':
        return settings.tradingAlerts;
      case 'market':
        return settings.marketNews;
      case 'price_alert':
        return settings.priceAlerts;
      case 'account':
        return settings.accountUpdates;
      case 'p2p':
        return settings.p2pMessages;
      case 'system':
        return settings.systemNotifications;
      case 'news':
        return settings.marketNews;
      default:
        return true;
    }
  }

  private generateId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `notification_${timestamp}_${this.nextId++}_${random}`;
  }

  private interpolateTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key]?.toString() || match;
    });
  }

  createNotification(
    type: Notification['type'],
    data: Record<string, any>,
    overrides?: Partial<Notification>
  ): Notification {
    const template = this.templates.find(t => t.type === type) || this.templates[0];
    
    const notification: Notification = {
      id: this.generateId(),
      title: overrides?.title || template.title,
      message: overrides?.message || this.interpolateTemplate(template.messageTemplate, data),
      type,
      priority: overrides?.priority || template.priority,
      timestamp: new Date().toISOString(), // Convert to string for Redux serialization
      isRead: false,
      data,
      icon: overrides?.icon || template.icon,
      color: overrides?.color || template.color,
      persistent: overrides?.persistent ?? template.persistent,
      autoRemove: overrides?.autoRemove ?? template.autoRemove,
      timeout: overrides?.timeout || template.timeout,
      ...overrides,
    };

    return notification;
  }

  async showNotification(
    type: Notification['type'],
    data: Record<string, any>,
    overrides?: Partial<Notification>
  ): Promise<Notification | null> {
    // Rate limiting: prevent same type of notification within 5 seconds
    const rateLimitKey = `${type}_${JSON.stringify(data)}`;
    const now = Date.now();
    const lastTime = this.recentNotifications.get(rateLimitKey);
    
    if (lastTime && now - lastTime < 5000) {
      return null; // Skip this notification
    }
    
    this.recentNotifications.set(rateLimitKey, now);
    
    // Clean up old entries (older than 10 seconds)
    for (const [key, time] of this.recentNotifications.entries()) {
      if (now - time > 10000) {
        this.recentNotifications.delete(key);
      }
    }
    if (!this.shouldShowNotification(type)) {
      return null;
    }

    const notification = this.createNotification(type, data, overrides);
    
    // Notify listeners (Redux, UI components, etc.)
    this.notificationListeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });

    // Handle platform-specific notifications
    await this.handlePlatformNotification(notification);

    return notification;
  }

  private async handlePlatformNotification(notification: Notification): Promise<void> {
    const settings = this.getSettings();

    // Vibration
    if (settings.vibration && notification.priority !== 'low') {
      const pattern = this.getVibrationPattern(notification.priority);
      Vibration.vibrate(pattern);
    }

    // For critical notifications, show native alert
    if (notification.priority === 'critical' && notification.persistent) {
      Alert.alert(
        notification.title,
        notification.message,
        [
          {
            text: 'Dismiss',
            style: 'default',
          },
          {
            text: 'View',
            style: 'default',
            onPress: () => {
              if (notification.actionType === 'navigate' && notification.actionTarget) {
                // This would be handled by navigation service
                console.log('Navigate to:', notification.actionTarget);
              }
            },
          },
        ],
        { cancelable: false }
      );
    }
  }

  private getVibrationPattern(priority: Notification['priority']): number[] {
    switch (priority) {
      case 'critical':
        return [0, 200, 100, 200, 100, 200]; // Strong pattern
      case 'high':
        return [0, 150, 100, 150]; // Medium pattern
      case 'medium':
        return [0, 100]; // Short pattern
      case 'low':
      default:
        return [0, 50]; // Very short pattern
    }
  }

  // Predefined notification methods for common use cases
  async showTradeExecuted(symbol: string, type: 'buy' | 'sell', amount: number, price: number): Promise<void> {
    await this.showNotification('trade', {
      symbol,
      type: type.toUpperCase(),
      amount: amount.toLocaleString(),
      price: price.toFixed(5),
    });
  }

  async showStopLossTriggered(symbol: string, price: number, loss: number): Promise<void> {
    await this.showNotification('trade', {
      symbol,
      price: price.toFixed(5),
      loss: `$${Math.abs(loss).toFixed(2)}`,
    }, {
      title: 'Stop Loss Triggered',
      priority: 'critical',
    });
  }

  async showTakeProfitHit(symbol: string, price: number, profit: number): Promise<void> {
    await this.showNotification('trade', {
      symbol,
      price: price.toFixed(5),
      profit: `$${profit.toFixed(2)}`,
    }, {
      title: 'Take Profit Hit',
      priority: 'high',
    });
  }

  async showPriceAlert(symbol: string, targetPrice: number, currentPrice: number): Promise<void> {
    await this.showNotification('price_alert', {
      symbol,
      targetPrice: targetPrice.toFixed(5),
      currentPrice: currentPrice.toFixed(5),
    });
  }

  async showMarketMovement(symbol: string, direction: 'risen' | 'fallen', percentage: number, price: number): Promise<void> {
    await this.showNotification('market', {
      symbol,
      direction,
      percentage: percentage.toFixed(2),
      price: price.toFixed(5),
    });
  }

  async showMarginCall(marginLevel: number): Promise<void> {
    await this.showNotification('account', {
      marginLevel: marginLevel.toFixed(1),
    }, {
      title: 'Margin Call Warning',
      priority: 'critical',
    });
  }

  async showP2PUpdate(message: string): Promise<void> {
    await this.showNotification('p2p', { message });
  }

  async showSystemUpdate(message: string): Promise<void> {
    await this.showNotification('system', { message });
  }

  async showNewsAlert(headline: string, summary?: string): Promise<void> {
    await this.showNotification('news', {
      headline,
      summary: summary || '',
    });
  }

  // Listener management
  addListener(listener: (notification: Notification) => void): () => void {
    this.notificationListeners.add(listener);
    return () => {
      this.notificationListeners.delete(listener);
    };
  }

  removeListener(listener: (notification: Notification) => void): void {
    this.notificationListeners.delete(listener);
  }

  // Simulation methods for demo purposes
  async startTradingSimulation(): Promise<void> {
    // Clear any existing simulation
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
    let notificationCount = 0;
    const maxNotifications = 3; // Strictly limit to 3 demo notifications
    
    const simulateRandomEvent = async () => {
      if (notificationCount >= maxNotifications) {
        // Stop simulation after showing exactly 3 demo notifications
        this.stopTradingSimulation();
        console.log(`Demo simulation stopped after ${maxNotifications} notifications`);
        return;
      }

      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const events = [
        () => this.showTradeExecuted(symbol, Math.random() > 0.5 ? 'buy' : 'sell', Math.random() * 100000 + 10000, Math.random() * 2 + 1),
        () => this.showMarketMovement(symbol, Math.random() > 0.5 ? 'risen' : 'fallen', Math.random() * 5 + 0.5, Math.random() * 2 + 1),
        () => this.showPriceAlert(symbol, Math.random() * 2 + 1, Math.random() * 2 + 1),
      ];
      
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      await randomEvent();
      notificationCount++;
      
      console.log(`Demo notification ${notificationCount}/${maxNotifications} shown`);
    };

    // Show first notification immediately, then space others
    await simulateRandomEvent();
    
    // Show remaining notifications at intervals (15-30 seconds apart)
    this.simulationInterval = setInterval(async () => {
      if (notificationCount < maxNotifications) {
        await simulateRandomEvent();
      }
    }, Math.random() * 15000 + 15000); // 15-30 second intervals
  }

  stopTradingSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  async simulateP2PActivity(): Promise<void> {
    const messages = [
      'New P2P order available for USDT/USD',
      'Your P2P trade has been completed',
      'Payment received for P2P trade #12345',
      'New message in P2P trade chat',
    ];

    const simulateP2P = async () => {
      const message = messages[Math.floor(Math.random() * messages.length)];
      await this.showP2PUpdate(message);
    };

    // Simulate P2P events every 2-5 minutes
    setInterval(simulateP2P, Math.random() * 180000 + 120000);
  }

  async simulateMarketNews(): Promise<void> {
    const headlines = [
      'Federal Reserve announces interest rate decision',
      'EUR/USD reaches new weekly high amid ECB speculation',
      'Gold prices surge on inflation concerns',
      'Cryptocurrency market shows strong bullish momentum',
      'Oil prices fluctuate on OPEC+ production changes',
    ];

    const simulateNews = async () => {
      const headline = headlines[Math.floor(Math.random() * headlines.length)];
      await this.showNewsAlert(headline);
    };

    // Simulate news every 5-10 minutes
    setInterval(simulateNews, Math.random() * 300000 + 300000);
  }
}

export const notificationService = new NotificationService();
