import AsyncStorage from '@react-native-async-storage/async-storage';

export interface P2POrder {
  id: string;
  userId: string;
  username: string;
  type: 'buy' | 'sell';
  currency: string;
  amount: number;
  price: number;
  totalValue: number;
  paymentMethods: string[];
  minAmount?: number;
  maxAmount?: number;
  status: 'active' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  timeLimit: number; // in minutes
  terms?: string;
  isVerified: boolean;
  rating: number;
  tradesCompleted: number;
}

export interface P2PTrade {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  buyerUsername: string;
  sellerUsername: string;
  currency: string;
  amount: number;
  price: number;
  totalValue: number;
  paymentMethod: string;
  status: 'pending' | 'payment_sent' | 'payment_confirmed' | 'completed' | 'cancelled' | 'disputed';
  escrowStatus: 'locked' | 'released' | 'refunded';
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  messages: P2PMessage[];
  escrowAmount: number;
  platformFee: number;
}

export interface P2PMessage {
  id: string;
  tradeId: string;
  senderId: string;
  senderUsername: string;
  message: string;
  type: 'text' | 'payment_proof' | 'system';
  timestamp: Date;
  attachments?: string[];
}

export interface P2PUser {
  id: string;
  username: string;
  rating: number;
  tradesCompleted: number;
  isVerified: boolean;
  joinDate: Date;
  lastSeen: Date;
  paymentMethods: string[];
  preferredCurrencies: string[];
}

class P2PService {
  private orders: P2POrder[] = [];
  private trades: P2PTrade[] = [];
  private currentUser: P2PUser = {
    id: 'user1',
    username: 'TradePro2024',
    rating: 4.8,
    tradesCompleted: 127,
    isVerified: true,
    joinDate: new Date('2023-01-15'),
    lastSeen: new Date(),
    paymentMethods: ['Bank Transfer', 'PayPal', 'Wise'],
    preferredCurrencies: ['USD', 'EUR', 'GBP'],
  };

  constructor() {
    this.loadData();
    this.generateSampleData();
  }

  private async loadData() {
    try {
      const ordersData = await AsyncStorage.getItem('p2p_orders');
      const tradesData = await AsyncStorage.getItem('p2p_trades');
      
      if (ordersData) {
        this.orders = JSON.parse(ordersData);
      }
      if (tradesData) {
        this.trades = JSON.parse(tradesData);
      }
    } catch (error) {
      console.error('Failed to load P2P data:', error);
    }
  }

  private async saveData() {
    try {
      await AsyncStorage.setItem('p2p_orders', JSON.stringify(this.orders));
      await AsyncStorage.setItem('p2p_trades', JSON.stringify(this.trades));
    } catch (error) {
      console.error('Failed to save P2P data:', error);
    }
  }

  private generateSampleData() {
    const sampleOrders: P2POrder[] = [
      {
        id: 'order_1',
        userId: 'user2',
        username: 'CryptoKing',
        type: 'sell',
        currency: 'USD',
        amount: 1000,
        price: 1.0952,
        totalValue: 1095.2,
        paymentMethods: ['Bank Transfer', 'PayPal'],
        minAmount: 100,
        maxAmount: 1000,
        status: 'active',
        createdAt: new Date(Date.now() - 3600000),
        timeLimit: 30,
        terms: 'Payment within 30 minutes. Bank transfer only.',
        isVerified: true,
        rating: 4.9,
        tradesCompleted: 89,
      },
      {
        id: 'order_2',
        userId: 'user3',
        username: 'ForexMaster',
        type: 'buy',
        currency: 'EUR',
        amount: 500,
        price: 0.9134,
        totalValue: 456.7,
        paymentMethods: ['Wise', 'SEPA'],
        minAmount: 50,
        maxAmount: 500,
        status: 'active',
        createdAt: new Date(Date.now() - 7200000),
        timeLimit: 45,
        isVerified: true,
        rating: 4.7,
        tradesCompleted: 156,
      },
      {
        id: 'order_3',
        userId: 'user4',
        username: 'TradingBot',
        type: 'sell',
        currency: 'GBP',
        amount: 750,
        price: 1.2634,
        totalValue: 947.55,
        paymentMethods: ['Bank Transfer'],
        minAmount: 100,
        maxAmount: 750,
        status: 'active',
        createdAt: new Date(Date.now() - 1800000),
        timeLimit: 60,
        isVerified: false,
        rating: 4.2,
        tradesCompleted: 23,
      },
    ];

    this.orders = [...this.orders, ...sampleOrders];
  }

  async createOrder(orderData: Omit<P2POrder, 'id' | 'userId' | 'username' | 'createdAt' | 'rating' | 'tradesCompleted' | 'isVerified'>): Promise<P2POrder> {
    const order: P2POrder = {
      ...orderData,
      id: `order_${Date.now()}`,
      userId: this.currentUser.id,
      username: this.currentUser.username,
      createdAt: new Date(),
      rating: this.currentUser.rating,
      tradesCompleted: this.currentUser.tradesCompleted,
      isVerified: this.currentUser.isVerified,
    };

    this.orders.push(order);
    await this.saveData();
    return order;
  }

  async getOrders(filters?: {
    type?: 'buy' | 'sell';
    currency?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: 'price' | 'amount' | 'rating' | 'time';
    sortOrder?: 'asc' | 'desc';
  }): Promise<P2POrder[]> {
    let filteredOrders = this.orders.filter(order => 
      order.status === 'active' && order.userId !== this.currentUser.id
    );

    if (filters) {
      if (filters.type) {
        filteredOrders = filteredOrders.filter(order => order.type === filters.type);
      }
      if (filters.currency) {
        filteredOrders = filteredOrders.filter(order => order.currency === filters.currency);
      }
      if (filters.minAmount) {
        filteredOrders = filteredOrders.filter(order => 
          (order.maxAmount || order.amount) >= filters.minAmount!
        );
      }
      if (filters.maxAmount) {
        filteredOrders = filteredOrders.filter(order => 
          (order.minAmount || 0) <= filters.maxAmount!
        );
      }

      if (filters.sortBy) {
        filteredOrders.sort((a, b) => {
          let valueA: number;
          let valueB: number;

          switch (filters.sortBy) {
            case 'price':
              valueA = a.price;
              valueB = b.price;
              break;
            case 'amount':
              valueA = a.amount;
              valueB = b.amount;
              break;
            case 'rating':
              valueA = a.rating;
              valueB = b.rating;
              break;
            case 'time':
              valueA = a.createdAt.getTime();
              valueB = b.createdAt.getTime();
              break;
            default:
              valueA = 0;
              valueB = 0;
          }

          if (filters.sortOrder === 'desc') {
            return valueB - valueA;
          }
          return valueA - valueB;
        });
      }
    }

    return filteredOrders;
  }

  async acceptOrder(orderId: string, amount: number, paymentMethod: string): Promise<P2PTrade> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId === this.currentUser.id) {
      throw new Error('Cannot accept your own order');
    }

    if (amount < (order.minAmount || 0) || amount > (order.maxAmount || order.amount)) {
      throw new Error('Amount outside allowed range');
    }

    if (!order.paymentMethods.includes(paymentMethod)) {
      throw new Error('Payment method not supported');
    }

    const platformFee = amount * 0.001; // 0.1% platform fee
    const escrowAmount = order.type === 'sell' ? amount : amount * order.price;

    const trade: P2PTrade = {
      id: `trade_${Date.now()}`,
      orderId: order.id,
      buyerId: order.type === 'buy' ? order.userId : this.currentUser.id,
      sellerId: order.type === 'sell' ? order.userId : this.currentUser.id,
      buyerUsername: order.type === 'buy' ? order.username : this.currentUser.username,
      sellerUsername: order.type === 'sell' ? order.username : this.currentUser.username,
      currency: order.currency,
      amount,
      price: order.price,
      totalValue: amount * order.price,
      paymentMethod,
      status: 'pending',
      escrowStatus: 'locked',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + order.timeLimit * 60000),
      messages: [{
        id: `msg_${Date.now()}`,
        tradeId: `trade_${Date.now()}`,
        senderId: 'system',
        senderUsername: 'System',
        message: `Trade initiated. ${order.type === 'sell' ? 'Buyer' : 'Seller'} has ${order.timeLimit} minutes to complete payment.`,
        type: 'system',
        timestamp: new Date(),
      }],
      escrowAmount,
      platformFee,
    };

    this.trades.push(trade);

    // Update order status if fully matched
    if (amount >= order.amount) {
      order.status = 'processing';
    }

    await this.saveData();
    return trade;
  }

  async getTrades(): Promise<P2PTrade[]> {
    return this.trades.filter(trade => 
      trade.buyerId === this.currentUser.id || trade.sellerId === this.currentUser.id
    );
  }

  async getTradeById(tradeId: string): Promise<P2PTrade | null> {
    const trade = this.trades.find(t => t.id === tradeId);
    return trade || null;
  }

  async confirmPayment(tradeId: string): Promise<void> {
    const trade = this.trades.find(t => t.id === tradeId);
    if (!trade) throw new Error('Trade not found');

    if (trade.buyerId !== this.currentUser.id) {
      throw new Error('Only buyer can confirm payment');
    }

    trade.status = 'payment_sent';
    
    const message: P2PMessage = {
      id: `msg_${Date.now()}`,
      tradeId,
      senderId: this.currentUser.id,
      senderUsername: this.currentUser.username,
      message: 'Payment has been sent. Please check and confirm receipt.',
      type: 'system',
      timestamp: new Date(),
    };

    trade.messages.push(message);
    await this.saveData();
  }

  async confirmReceipt(tradeId: string): Promise<void> {
    const trade = this.trades.find(t => t.id === tradeId);
    if (!trade) throw new Error('Trade not found');

    if (trade.sellerId !== this.currentUser.id) {
      throw new Error('Only seller can confirm receipt');
    }

    trade.status = 'payment_confirmed';
    trade.escrowStatus = 'released';
    trade.completedAt = new Date();
    
    const message: P2PMessage = {
      id: `msg_${Date.now()}`,
      tradeId,
      senderId: this.currentUser.id,
      senderUsername: this.currentUser.username,
      message: 'Payment confirmed. Trade completed successfully!',
      type: 'system',
      timestamp: new Date(),
    };

    trade.messages.push(message);
    await this.saveData();
  }

  async sendMessage(tradeId: string, message: string, attachments?: string[]): Promise<void> {
    const trade = this.trades.find(t => t.id === tradeId);
    if (!trade) throw new Error('Trade not found');

    if (trade.buyerId !== this.currentUser.id && trade.sellerId !== this.currentUser.id) {
      throw new Error('Unauthorized to send message');
    }

    const newMessage: P2PMessage = {
      id: `msg_${Date.now()}`,
      tradeId,
      senderId: this.currentUser.id,
      senderUsername: this.currentUser.username,
      message,
      type: 'text',
      timestamp: new Date(),
      attachments,
    };

    trade.messages.push(newMessage);
    await this.saveData();
  }

  async cancelTrade(tradeId: string, reason: string): Promise<void> {
    const trade = this.trades.find(t => t.id === tradeId);
    if (!trade) throw new Error('Trade not found');

    if (trade.buyerId !== this.currentUser.id && trade.sellerId !== this.currentUser.id) {
      throw new Error('Unauthorized to cancel trade');
    }

    trade.status = 'cancelled';
    trade.escrowStatus = 'refunded';
    
    const message: P2PMessage = {
      id: `msg_${Date.now()}`,
      tradeId,
      senderId: this.currentUser.id,
      senderUsername: this.currentUser.username,
      message: `Trade cancelled. Reason: ${reason}`,
      type: 'system',
      timestamp: new Date(),
    };

    trade.messages.push(message);
    await this.saveData();
  }

  getCurrentUser(): P2PUser {
    return this.currentUser;
  }

  async getMyOrders(): Promise<P2POrder[]> {
    return this.orders.filter(order => order.userId === this.currentUser.id);
  }

  async cancelOrder(orderId: string): Promise<void> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');

    if (order.userId !== this.currentUser.id) {
      throw new Error('Unauthorized to cancel order');
    }

    order.status = 'cancelled';
    await this.saveData();
  }

  // Utility methods
  calculateTradingStats(): {
    totalVolume: number;
    successRate: number;
    averageCompletionTime: number;
    activeTrades: number;
  } {
    const userTrades = this.trades.filter(t => 
      t.buyerId === this.currentUser.id || t.sellerId === this.currentUser.id
    );

    const completedTrades = userTrades.filter(t => t.status === 'completed');
    const totalVolume = completedTrades.reduce((sum, t) => sum + t.totalValue, 0);
    const successRate = userTrades.length > 0 ? (completedTrades.length / userTrades.length) * 100 : 0;
    
    const avgTime = completedTrades.length > 0 
      ? completedTrades.reduce((sum, t) => {
          const time = t.completedAt!.getTime() - t.createdAt.getTime();
          return sum + time;
        }, 0) / completedTrades.length / 60000 // Convert to minutes
      : 0;

    const activeTrades = userTrades.filter(t => 
      ['pending', 'payment_sent', 'payment_confirmed'].includes(t.status)
    ).length;

    return {
      totalVolume,
      successRate,
      averageCompletionTime: avgTime,
      activeTrades,
    };
  }
}

export const p2pService = new P2PService();
