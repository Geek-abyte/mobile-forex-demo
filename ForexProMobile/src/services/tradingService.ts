import { CurrencyPair } from './marketDataService';

export interface TradeRequest {
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  size: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage: number;
}

export interface Position {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  size: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage: number;
  margin: number;
  pnl: number;
  pnlPercent: number;
  swap: number;
  commission: number;
  openTime: string;
  status: 'open' | 'closed';
  isDemo: boolean;
}

export interface Order {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  size: number;
  price?: number;
  stopPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  createdAt: string;
  filledAt?: string;
  filledPrice?: number;
  isDemo: boolean;
}

export interface AccountSummary {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
}

class TradingService {
  private currentPositions: Position[] = [];
  private currentOrders: Order[] = [];
  private balance = 10000; // Demo balance
  
  async executeMarketOrder(request: TradeRequest, currentPrice: number): Promise<Position> {
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Calculate margin required
    const margin = (request.size * currentPrice) / request.leverage;
    
    if (margin > this.getFreeMargin()) {
      throw new Error('Insufficient margin');
    }

    const position: Position = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: request.symbol,
      type: request.type,
      size: request.size,
      entryPrice: currentPrice,
      currentPrice: currentPrice,
      stopLoss: request.stopLoss,
      takeProfit: request.takeProfit,
      leverage: request.leverage,
      margin,
      pnl: 0,
      pnlPercent: 0,
      swap: 0,
      commission: this.calculateCommission(request.size, currentPrice),
      openTime: new Date().toISOString(),
      status: 'open',
      isDemo: true,
    };

    this.currentPositions.push(position);
    this.balance -= position.commission; // Deduct commission

    return position;
  }

  async placeLimitOrder(request: TradeRequest): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!request.price) {
      throw new Error('Price is required for limit orders');
    }

    const order: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: request.symbol,
      type: request.type,
      orderType: request.orderType,
      size: request.size,
      price: request.price,
      stopLoss: request.stopLoss,
      takeProfit: request.takeProfit,
      leverage: request.leverage,
      status: 'pending',
      createdAt: new Date().toISOString(),
      isDemo: true,
    };

    this.currentOrders.push(order);
    return order;
  }

  async closePosition(positionId: string, currentPrice: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const positionIndex = this.currentPositions.findIndex(p => p.id === positionId);
    if (positionIndex === -1) {
      throw new Error('Position not found');
    }

    const position = this.currentPositions[positionIndex];
    
    // Calculate final P&L
    const priceDiff = position.type === 'buy' 
      ? currentPrice - position.entryPrice
      : position.entryPrice - currentPrice;
    
    const pnl = priceDiff * position.size * position.leverage;
    position.pnl = pnl;
    position.status = 'closed';

    // Update account balance
    this.balance += pnl + position.margin; // Return margin and add/subtract P&L

    // Remove from active positions
    this.currentPositions.splice(positionIndex, 1);
  }

  async cancelOrder(orderId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const order = this.currentOrders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = 'cancelled';
  }

  async getPositions(): Promise<Position[]> {
    return [...this.currentPositions];
  }

  async getOrders(): Promise<Order[]> {
    return [...this.currentOrders];
  }

  async getAccountSummary(): Promise<AccountSummary> {
    const totalMargin = this.currentPositions.reduce((sum, pos) => sum + pos.margin, 0);
    const totalPnL = this.currentPositions.reduce((sum, pos) => sum + pos.pnl, 0);
    const equity = this.balance + totalPnL;
    const freeMargin = equity - totalMargin;
    const marginLevel = totalMargin > 0 ? (equity / totalMargin) * 100 : 0;

    return {
      balance: this.balance,
      equity,
      margin: totalMargin,
      freeMargin,
      marginLevel,
    };
  }

  updatePositionPnL(positionId: string, currentPrice: number): void {
    const position = this.currentPositions.find(p => p.id === positionId);
    if (!position) return;

    position.currentPrice = currentPrice;
    
    const priceDiff = position.type === 'buy' 
      ? currentPrice - position.entryPrice
      : position.entryPrice - currentPrice;
    
    position.pnl = priceDiff * position.size * position.leverage;
    position.pnlPercent = (position.pnl / position.margin) * 100;

    // Check for stop loss or take profit
    if (position.stopLoss && 
        ((position.type === 'buy' && currentPrice <= position.stopLoss) ||
         (position.type === 'sell' && currentPrice >= position.stopLoss))) {
      // Auto-close position at stop loss
      this.closePosition(position.id, currentPrice);
    } else if (position.takeProfit && 
               ((position.type === 'buy' && currentPrice >= position.takeProfit) ||
                (position.type === 'sell' && currentPrice <= position.takeProfit))) {
      // Auto-close position at take profit
      this.closePosition(position.id, currentPrice);
    }
  }

  private calculateCommission(size: number, price: number): number {
    // Simple commission calculation: 0.01% of trade value
    return (size * price * 0.0001);
  }

  private getFreeMargin(): number {
    const totalMargin = this.currentPositions.reduce((sum, pos) => sum + pos.margin, 0);
    const totalPnL = this.currentPositions.reduce((sum, pos) => sum + pos.pnl, 0);
    return this.balance + totalPnL - totalMargin;
  }

  // Reset demo account
  resetDemoAccount(): void {
    this.currentPositions = [];
    this.currentOrders = [];
    this.balance = 10000;
  }
}

export const tradingService = new TradingService();
