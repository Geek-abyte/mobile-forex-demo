import { TradeRequest, Position, Order, AccountSummary } from './tradingService';
import { realisticMarketSimulation } from './realisticMarketSimulation';

class EnhancedTradingService {
  private currentPositions: Position[] = [];
  private currentOrders: Order[] = [];
  private balance = 10000; // Demo balance
  private equity = 10000;
  private drawdown = 0;
  private maxDrawdown = 0;
  
  async executeMarketOrder(request: TradeRequest, currentPrice: number): Promise<Position> {
    // Simulate execution delay based on market conditions
    const delay = this.getExecutionDelay();
    await new Promise(resolve => setTimeout(resolve, delay));

    // Apply slippage
    const slippage = realisticMarketSimulation.getExecutionSlippage(request.symbol, request.size);
    const executionPrice = request.type === 'buy' 
      ? currentPrice + slippage 
      : currentPrice - slippage;

    // Calculate margin required
    const margin = (request.size * executionPrice) / request.leverage;
    
    if (margin > this.getFreeMargin()) {
      throw new Error('Insufficient margin for this trade');
    }

    // Calculate commission with realistic rates
    const commission = this.calculateRealisticCommission(request.size, executionPrice);

    const position: Position = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: request.symbol,
      type: request.type,
      size: request.size,
      entryPrice: executionPrice,
      currentPrice: executionPrice,
      stopLoss: request.stopLoss,
      takeProfit: request.takeProfit,
      leverage: request.leverage,
      margin,
      pnl: 0,
      pnlPercent: 0,
      swap: 0,
      commission,
      openTime: new Date().toISOString(),
      status: 'open',
      isDemo: true,
    };

    this.currentPositions.push(position);
    this.balance -= commission; // Deduct commission
    this.updateAccountMetrics();

    // Log realistic trading activity
    console.log(`✅ Order executed: ${request.type.toUpperCase()} ${request.size} ${request.symbol} @ ${executionPrice.toFixed(5)} (Slippage: ${slippage.toFixed(5)})`);

    return position;
  }

  async placeLimitOrder(request: TradeRequest): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!request.price) {
      throw new Error('Limit price is required for limit orders');
    }

    const order: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: request.symbol,
      type: request.type,
      orderType: 'limit',
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

    // Simulate realistic order processing
    this.simulateOrderFill(order);

    return order;
  }

  private simulateOrderFill(order: Order): void {
    const checkInterval = setInterval(() => {
      const currentPrice = realisticMarketSimulation.getCurrentPrice(order.symbol);
      let shouldFill = false;

      if (order.type === 'buy' && order.price && currentPrice <= order.price) {
        shouldFill = true;
      } else if (order.type === 'sell' && order.price && currentPrice >= order.price) {
        shouldFill = true;
      }

      if (shouldFill) {
        clearInterval(checkInterval);
        this.fillLimitOrder(order, order.price!);
      }
    }, 5000); // Check every 5 seconds

    // Auto-cancel after 24 hours (simulate)
    setTimeout(() => {
      clearInterval(checkInterval);
      if (order.status === 'pending') {
        order.status = 'cancelled';
        console.log(`🚫 Order cancelled: ${order.id} (expired)`);
      }
    }, 24 * 60 * 60 * 1000);
  }

  private async fillLimitOrder(order: Order, fillPrice: number): Promise<void> {
    try {
      const tradeRequest: TradeRequest = {
        symbol: order.symbol,
        type: order.type,
        orderType: 'market',
        size: order.size,
        stopLoss: order.stopLoss,
        takeProfit: order.takeProfit,
        leverage: order.leverage,
      };

      const position = await this.executeMarketOrder(tradeRequest, fillPrice);
      
      order.status = 'filled';
      order.filledAt = new Date().toISOString();
      order.filledPrice = fillPrice;

      console.log(`✅ Limit order filled: ${order.id} @ ${fillPrice.toFixed(5)}`);
    } catch (error) {
      order.status = 'rejected';
      console.log(`❌ Limit order rejected: ${order.id} - ${error}`);
    }
  }

  private getExecutionDelay(): number {
    // Realistic execution delays based on market conditions
    const baseDelay = 200; // Base 200ms
    const sentiment = realisticMarketSimulation.getMarketSentiment('EUR/USD'); // Use EUR/USD as market proxy
    
    if (sentiment.sentiment === 'bullish' || sentiment.sentiment === 'bearish') {
      return baseDelay + Math.random() * 300; // Up to 500ms in trending markets
    } else {
      return baseDelay + Math.random() * 100; // Up to 300ms in calm markets
    }
  }

  private calculateRealisticCommission(size: number, price: number): number {
    // More realistic commission structure
    const tradeValue = size * price;
    const baseCommission = tradeValue * 0.00008; // 0.8 basis points
    const minCommission = 2.50; // Minimum commission
    const maxCommission = 25.00; // Maximum commission
    
    return Math.max(minCommission, Math.min(maxCommission, baseCommission));
  }

  private calculateSwap(position: Position): number {
    // Simulate overnight swap charges
    const hoursHeld = (Date.now() - new Date(position.openTime).getTime()) / (1000 * 60 * 60);
    if (hoursHeld < 24) return 0;
    
    const days = Math.floor(hoursHeld / 24);
    const swapRate = position.type === 'buy' ? -0.0002 : 0.0001; // Realistic swap rates
    
    return position.size * position.entryPrice * swapRate * days;
  }

  updatePositionPnL(positionId: string, currentPrice: number): void {
    const position = this.currentPositions.find(p => p.id === positionId && p.status === 'open');
    if (!position) return;

    // Calculate P&L
    const priceDiff = position.type === 'buy' 
      ? currentPrice - position.entryPrice
      : position.entryPrice - currentPrice;
    
    const pnl = priceDiff * position.size * position.leverage;
    const pnlPercent = (pnl / (position.size * position.entryPrice)) * 100;

    // Calculate swap
    const swap = this.calculateSwap(position);

    position.currentPrice = currentPrice;
    position.pnl = pnl;
    position.pnlPercent = pnlPercent;
    position.swap = swap;

    // Auto-close at stop loss or take profit with realistic slippage
    if ((position.stopLoss && 
         ((position.type === 'buy' && currentPrice <= position.stopLoss) ||
          (position.type === 'sell' && currentPrice >= position.stopLoss))) ||
        (position.takeProfit && 
         ((position.type === 'buy' && currentPrice >= position.takeProfit) ||
          (position.type === 'sell' && currentPrice <= position.takeProfit)))) {
      
      // Add slippage for stop orders
      const slippage = position.stopLoss && 
        ((position.type === 'buy' && currentPrice <= position.stopLoss) ||
         (position.type === 'sell' && currentPrice >= position.stopLoss))
        ? realisticMarketSimulation.getExecutionSlippage(position.symbol, position.size) * 2 // More slippage on stops
        : 0;

      const executionPrice = position.type === 'buy' 
        ? currentPrice - slippage 
        : currentPrice + slippage;

      this.closePosition(position.id, executionPrice);
    }

    this.updateAccountMetrics();
  }

  async closePosition(positionId: string, currentPrice: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.getExecutionDelay()));

    const positionIndex = this.currentPositions.findIndex(p => p.id === positionId);
    if (positionIndex === -1) {
      throw new Error('Position not found');
    }

    const position = this.currentPositions[positionIndex];
    
    // Apply slippage
    const slippage = realisticMarketSimulation.getExecutionSlippage(position.symbol, position.size);
    const executionPrice = position.type === 'buy' 
      ? currentPrice - slippage 
      : currentPrice + slippage;

    // Calculate final P&L with slippage
    const priceDiff = position.type === 'buy' 
      ? executionPrice - position.entryPrice
      : position.entryPrice - executionPrice;
    
    const pnl = priceDiff * position.size * position.leverage;
    const swap = this.calculateSwap(position);
    const totalPnl = pnl + swap - position.commission;

    position.pnl = totalPnl;
    position.status = 'closed';
    position.currentPrice = executionPrice;

    // Update account balance
    this.balance += totalPnl + position.margin; // Return margin and add/subtract P&L

    // Remove from active positions
    this.currentPositions.splice(positionIndex, 1);

    this.updateAccountMetrics();

    console.log(`🔒 Position closed: ${positionId} P&L: $${totalPnl.toFixed(2)} (Slippage: ${slippage.toFixed(5)})`);
  }

  private updateAccountMetrics(): void {
    const totalPnL = this.currentPositions.reduce((sum, pos) => sum + pos.pnl, 0);
    this.equity = this.balance + totalPnL;
    
    // Calculate drawdown
    const peakEquity = Math.max(this.equity, this.maxDrawdown || this.equity);
    this.drawdown = (peakEquity - this.equity) / peakEquity * 100;
    this.maxDrawdown = Math.max(this.maxDrawdown, this.equity);
  }

  async getPositions(): Promise<Position[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...this.currentPositions];
  }

  async getOrders(): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...this.currentOrders];
  }

  async cancelOrder(orderId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const order = this.currentOrders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending') {
      throw new Error('Order cannot be cancelled');
    }

    order.status = 'cancelled';
    console.log(`🚫 Order cancelled: ${orderId}`);
  }

  async getAccountSummary(): Promise<AccountSummary> {
    await new Promise(resolve => setTimeout(resolve, 150));

    const totalMargin = this.currentPositions.reduce((sum, pos) => sum + pos.margin, 0);
    const totalPnL = this.currentPositions.reduce((sum, pos) => sum + pos.pnl, 0);
    
    return {
      balance: this.balance,
      equity: this.balance + totalPnL,
      margin: totalMargin,
      freeMargin: this.getFreeMargin(),
      marginLevel: totalMargin > 0 ? ((this.balance + totalPnL) / totalMargin) * 100 : 0,
    };
  }

  private getFreeMargin(): number {
    const totalMargin = this.currentPositions.reduce((sum, pos) => sum + pos.margin, 0);
    const totalPnL = this.currentPositions.reduce((sum, pos) => sum + pos.pnl, 0);
    return this.balance + totalPnL - totalMargin;
  }

  // Enhanced account management
  getAccountMetrics() {
    return {
      balance: this.balance,
      equity: this.equity,
      drawdown: this.drawdown,
      maxDrawdown: this.maxDrawdown,
      totalTrades: this.currentPositions.length,
      winRate: this.calculateWinRate(),
    };
  }

  private calculateWinRate(): number {
    const closedPositions = this.currentPositions.filter(p => p.status === 'closed');
    if (closedPositions.length === 0) return 0;
    
    const winningTrades = closedPositions.filter(p => p.pnl > 0).length;
    return (winningTrades / closedPositions.length) * 100;
  }

  resetDemoAccount(): void {
    this.currentPositions = [];
    this.currentOrders = [];
    this.balance = 10000;
    this.equity = 10000;
    this.drawdown = 0;
    this.maxDrawdown = 0;
    console.log('🔄 Demo account reset');
  }
}

export const enhancedTradingService = new EnhancedTradingService();
