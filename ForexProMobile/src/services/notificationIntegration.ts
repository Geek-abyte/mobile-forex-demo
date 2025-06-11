import { notificationService } from './notificationService';
import { store } from '@/store';
import { clearNotifications } from '@/store/slices/notificationSlice';

class NotificationIntegration {
  // Trading notifications
  static async onTradeExecuted(
    symbol: string,
    type: 'buy' | 'sell',
    amount: number,
    price: number
  ): Promise<void> {
    try {
      await notificationService.showTradeExecuted(symbol, type, amount, price);
    } catch (error) {
      console.error('Failed to show trade notification:', error);
    }
  }

  static async onStopLossTriggered(
    symbol: string,
    price: number,
    loss: number
  ): Promise<void> {
    try {
      await notificationService.showStopLossTriggered(symbol, price, loss);
    } catch (error) {
      console.error('Failed to show stop loss notification:', error);
    }
  }

  static async onTakeProfitHit(
    symbol: string,
    price: number,
    profit: number
  ): Promise<void> {
    try {
      await notificationService.showTakeProfitHit(symbol, price, profit);
    } catch (error) {
      console.error('Failed to show take profit notification:', error);
    }
  }

  // Market notifications
  static async onPriceAlert(
    symbol: string,
    targetPrice: number,
    currentPrice: number
  ): Promise<void> {
    try {
      await notificationService.showPriceAlert(symbol, targetPrice, currentPrice);
    } catch (error) {
      console.error('Failed to show price alert:', error);
    }
  }

  static async onMarketMovement(
    symbol: string,
    direction: 'risen' | 'fallen',
    percentage: number,
    price: number
  ): Promise<void> {
    try {
      await notificationService.showMarketMovement(symbol, direction, percentage, price);
    } catch (error) {
      console.error('Failed to show market movement notification:', error);
    }
  }

  static async onHighVolatility(symbol: string, price: number): Promise<void> {
    try {
      await notificationService.showNotification('market', {
        symbol,
        price: price.toFixed(5),
      }, {
        title: 'High Volatility Warning',
        priority: 'high',
      });
    } catch (error) {
      console.error('Failed to show volatility notification:', error);
    }
  }

  // Account notifications
  static async onMarginCall(marginLevel: number): Promise<void> {
    try {
      await notificationService.showMarginCall(marginLevel);
    } catch (error) {
      console.error('Failed to show margin call notification:', error);
    }
  }

  static async onLowBalance(balance: number, threshold: number): Promise<void> {
    try {
      await notificationService.showNotification('account', {
        balance: balance.toFixed(2),
        threshold: threshold.toFixed(2),
      }, {
        title: 'Low Balance Warning',
        message: 'Your account balance is below the recommended threshold',
        priority: 'medium',
      });
    } catch (error) {
      console.error('Failed to show low balance notification:', error);
    }
  }

  static async onAccountUpdate(message: string): Promise<void> {
    try {
      await notificationService.showNotification('account', { message });
    } catch (error) {
      console.error('Failed to show account update notification:', error);
    }
  }

  // P2P notifications
  static async onP2POrderMatched(orderType: string, amount: number): Promise<void> {
    try {
      await notificationService.showP2PUpdate(
        `Your ${orderType} order for ${amount} has been matched`
      );
    } catch (error) {
      console.error('Failed to show P2P order notification:', error);
    }
  }

  static async onP2PPaymentReceived(amount: number, currency: string): Promise<void> {
    try {
      await notificationService.showP2PUpdate(
        `Payment of ${amount} ${currency} has been received`
      );
    } catch (error) {
      console.error('Failed to show P2P payment notification:', error);
    }
  }

  static async onP2PTradeCompleted(amount: number, currency: string): Promise<void> {
    try {
      await notificationService.showP2PUpdate(
        `P2P trade completed: ${amount} ${currency}`
      );
    } catch (error) {
      console.error('Failed to show P2P completion notification:', error);
    }
  }

  static async onP2PMessage(from: string, preview: string): Promise<void> {
    try {
      await notificationService.showP2PUpdate(
        `New message from ${from}: ${preview}`
      );
    } catch (error) {
      console.error('Failed to show P2P message notification:', error);
    }
  }

  // News notifications
  static async onBreakingNews(headline: string, summary?: string): Promise<void> {
    try {
      await notificationService.showNewsAlert(headline, summary);
    } catch (error) {
      console.error('Failed to show news notification:', error);
    }
  }

  static async onEconomicEvent(
    event: string,
    currency: string,
    impact: 'low' | 'medium' | 'high'
  ): Promise<void> {
    try {
      const priority = impact === 'high' ? 'high' : 'medium';
      await notificationService.showNotification('news', {
        event,
        currency,
        impact: impact.toUpperCase(),
      }, {
        title: 'Economic Event',
        message: `${event} (${currency}) - ${impact.toUpperCase()} impact`,
        priority,
      });
    } catch (error) {
      console.error('Failed to show economic event notification:', error);
    }
  }

  // System notifications
  static async onSystemMaintenance(startTime: string, duration: string): Promise<void> {
    try {
      await notificationService.showSystemUpdate(
        `Scheduled maintenance: ${startTime} for ${duration}`
      );
    } catch (error) {
      console.error('Failed to show maintenance notification:', error);
    }
  }

  static async onAppUpdate(version: string): Promise<void> {
    try {
      await notificationService.showSystemUpdate(
        `App updated to version ${version}. Check out the new features!`
      );
    } catch (error) {
      console.error('Failed to show update notification:', error);
    }
  }

  // Custom notifications
  static async showCustomNotification(
    type: 'trade' | 'market' | 'price_alert' | 'news' | 'account' | 'system' | 'p2p',
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    data?: any
  ): Promise<void> {
    try {
      await notificationService.showNotification(type, data || {}, {
        title,
        message,
        priority,
      });
    } catch (error) {
      console.error('Failed to show custom notification:', error);
    }
  }

  // Authentication-related notifications
  static async onUserLogin(username?: string): Promise<void> {
    try {
      await this.showCustomNotification(
        'system',
        'Login Successful',
        username ? `Welcome back, ${username}!` : 'You have successfully logged in.',
        'low'
      );
    } catch (error) {
      console.error('Failed to show login notification:', error);
    }
  }

  static async onUserLogout(): Promise<void> {
    try {
      // Stop all notifications when user logs out
      this.stopDemoNotifications();
    } catch (error) {
      console.error('Failed to handle logout notifications:', error);
    }
  }

  // Demo simulation helpers
  static async startDemoNotifications(): Promise<void> {
    try {
      // Show welcome notification (1 of 3)
      await this.showCustomNotification(
        'system',
        'Welcome Back!',
        'You\'re now logged in. Demo notifications will show trading activity.',
        'low'
      );

      // Show account update notification after delay (2 of 3)
      setTimeout(() => {
        this.onAccountUpdate('Demo account ready - $10,000 balance available');
      }, 8000);

      // Start limited trading simulation for 1 more notification (3 of 3)
      setTimeout(async () => {
        const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const events = [
          () => notificationService.showTradeExecuted(symbol, Math.random() > 0.5 ? 'buy' : 'sell', Math.random() * 100000 + 10000, Math.random() * 2 + 1),
          () => notificationService.showMarketMovement(symbol, Math.random() > 0.5 ? 'risen' : 'fallen', Math.random() * 5 + 0.5, Math.random() * 2 + 1),
          () => notificationService.showPriceAlert(symbol, Math.random() * 2 + 1, Math.random() * 2 + 1),
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        await randomEvent();
        console.log('Demo notifications complete - exactly 3 notifications shown');
      }, 16000);

      console.log('Demo notifications started - strictly limited to 3 notifications total');

    } catch (error) {
      console.error('Failed to start demo notifications:', error);
    }
  }

  static stopDemoNotifications(): void {
    try {
      notificationService.stopTradingSimulation();
      // Clear all existing notifications when stopping demo
      store.dispatch(clearNotifications());
    } catch (error) {
      console.error('Failed to stop demo notifications:', error);
    }
  }
}

export default NotificationIntegration;
