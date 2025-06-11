import { CandlestickData } from '../components/organisms/TradingViewProfessionalChart';

interface MarketSession {
  name: string;
  start: number; // Hour in UTC
  end: number;
  timezone: string;
  pairs: string[];
}

interface MarketTick {
  timestamp: number;
  price: number;
  volume: number;
}

class ImprovedMarketDataService {
  private priceHistory: Map<string, CandlestickData[]> = new Map();
  private currentCandles: Map<string, CandlestickData> = new Map();
  private marketTicks: Map<string, MarketTick[]> = new Map();
  private subscriptions: Map<string, ((data: CandlestickData) => void)[]> = new Map();
  private timeframeIntervals: Map<string, number> = new Map();
  private lastCandleTime: Map<string, number> = new Map();

  private readonly marketSessions: MarketSession[] = [
    { name: 'Sydney', start: 22, end: 7, timezone: 'Australia/Sydney', pairs: ['AUD/USD', 'NZD/USD'] },
    { name: 'Tokyo', start: 0, end: 9, timezone: 'Asia/Tokyo', pairs: ['USD/JPY', 'AUD/JPY'] },
    { name: 'London', start: 8, end: 17, timezone: 'Europe/London', pairs: ['GBP/USD', 'EUR/USD', 'EUR/GBP'] },
    { name: 'New York', start: 13, end: 22, timezone: 'America/New_York', pairs: ['USD/CAD', 'USD/CHF'] }
  ];

  private basePrices: { [key: string]: number } = {
    'EUR/USD': 1.0845,
    'GBP/USD': 1.2734,
    'USD/JPY': 149.87,
    'AUD/USD': 0.6578,
    'USD/CHF': 0.8923,
    'USD/CAD': 1.3542,
    'NZD/USD': 0.6123,
    'EUR/GBP': 0.8801
  };

  constructor() {
    this.initializeTimeframes();
    this.startMarketSimulation();
  }

  private initializeTimeframes(): void {
    this.timeframeIntervals.set('1m', 60 * 1000);
    this.timeframeIntervals.set('5m', 5 * 60 * 1000);
    this.timeframeIntervals.set('15m', 15 * 60 * 1000);
    this.timeframeIntervals.set('30m', 30 * 60 * 1000);
    this.timeframeIntervals.set('1h', 60 * 60 * 1000);
    this.timeframeIntervals.set('4h', 4 * 60 * 60 * 1000);
    this.timeframeIntervals.set('1d', 24 * 60 * 60 * 1000);
    this.timeframeIntervals.set('1w', 7 * 24 * 60 * 60 * 1000);
  }

  private getTimeframeInterval(timeframe: string): number {
    return this.timeframeIntervals.get(timeframe) || 60 * 60 * 1000; // Default to 1 hour
  }

  private getCandleStartTime(timestamp: number, timeframeMs: number): number {
    // Round down to the nearest timeframe boundary
    return Math.floor(timestamp / timeframeMs) * timeframeMs;
  }

  private getMarketVolatility(pair: string, hour: number): number {
    let volatility = 0.0001;

    // Market session volatility
    const activeSessions = this.marketSessions.filter(session => {
      const isActive = (session.start <= session.end) 
        ? (hour >= session.start && hour < session.end)
        : (hour >= session.start || hour < session.end);
      return isActive && session.pairs.some(p => p === pair);
    });

    volatility *= (1 + activeSessions.length * 0.5);
    
    // Add realistic intraday patterns
    if (hour >= 8 && hour <= 17) { // London session
      volatility *= 1.5;
    }
    if (hour >= 13 && hour <= 22) { // New York session
      volatility *= 1.3;
    }
    if (hour >= 0 && hour <= 9) { // Tokyo session
      volatility *= 1.2;
    }

    return volatility;
  }

  private generateRealisticPrice(pair: string, currentPrice: number): number {
    const hour = new Date().getUTCHours();
    const volatility = this.getMarketVolatility(pair, hour);
    
    // Generate realistic price movement with proper trend and mean reversion
    const randomComponent = (Math.random() - 0.5) * volatility;
    const trend = (Math.random() - 0.5) * volatility * 0.5; // Weaker trend component
    const meanReversion = (this.basePrices[pair] - currentPrice) * 0.001; // Mean reversion
    
    const totalChange = randomComponent + trend + meanReversion;
    return currentPrice + totalChange;
  }

  private updateCandlestick(
    pair: string, 
    timeframe: string, 
    price: number, 
    volume: number, 
    timestamp: number
  ): CandlestickData | null {
    const timeframeMs = this.getTimeframeInterval(timeframe);
    const candleStartTime = this.getCandleStartTime(timestamp, timeframeMs);
    const candleKey = `${pair}_${timeframe}`;
    
    let currentCandle = this.currentCandles.get(candleKey);
    const lastCandleTime = this.lastCandleTime.get(candleKey) || 0;

    // Check if we need to create a new candle
    if (!currentCandle || candleStartTime > lastCandleTime) {
      // Close previous candle if it exists
      if (currentCandle && lastCandleTime > 0) {
        // Return completed candle
        const completedCandle = { ...currentCandle };
        
        // Add to history
        const history = this.priceHistory.get(candleKey) || [];
        history.push(completedCandle);
        
        // Keep only last 100 candles
        if (history.length > 100) {
          history.shift();
        }
        
        this.priceHistory.set(candleKey, history);
      }

      // Create new candle
      currentCandle = {
        time: Math.floor(candleStartTime / 1000),
        open: price,
        high: price,
        low: price,
        close: price,
        volume: volume
      };

      this.currentCandles.set(candleKey, currentCandle);
      this.lastCandleTime.set(candleKey, candleStartTime);
      
      return currentCandle;
    } else {
      // Update existing candle
      currentCandle.high = Math.max(currentCandle.high, price);
      currentCandle.low = Math.min(currentCandle.low, price);
      currentCandle.close = price;
      currentCandle.volume = (currentCandle.volume || 0) + volume;
      
      this.currentCandles.set(candleKey, currentCandle);
      
      return currentCandle;
    }
  }

  private startMarketSimulation(): void {
    // Generate initial historical data for all pairs
    Object.keys(this.basePrices).forEach(pair => {
      this.generateHistoricalData(pair, '1h', 50);
      this.generateHistoricalData(pair, '15m', 50);
      this.generateHistoricalData(pair, '5m', 50);
      this.generateHistoricalData(pair, '1m', 50);
    });

    // Start real-time price simulation
    this.startRealTimeUpdates();
  }

  private startRealTimeUpdates(): void {
    // Update prices every 1-5 seconds (realistic tick frequency)
    setInterval(() => {
      Object.keys(this.basePrices).forEach(pair => {
        const currentHistory = this.priceHistory.get(`${pair}_1m`) || [];
        const lastCandle = currentHistory[currentHistory.length - 1];
        const currentPrice = lastCandle ? lastCandle.close : this.basePrices[pair];
        
        const newPrice = this.generateRealisticPrice(pair, currentPrice);
        const volume = Math.floor(Math.random() * 10000) + 1000;
        const timestamp = Date.now();

        // Update ticks
        const ticks = this.marketTicks.get(pair) || [];
        ticks.push({ timestamp, price: newPrice, volume });
        
        // Keep only last 1000 ticks
        if (ticks.length > 1000) {
          ticks.shift();
        }
        this.marketTicks.set(pair, ticks);

        // Update all timeframes
        ['1m', '5m', '15m', '30m', '1h', '4h', '1d'].forEach(timeframe => {
          const updatedCandle = this.updateCandlestick(pair, timeframe, newPrice, volume, timestamp);
          
          if (updatedCandle) {
            // Notify subscribers
            const subscribers = this.subscriptions.get(`${pair}_${timeframe}`) || [];
            subscribers.forEach(callback => {
              try {
                callback(updatedCandle);
              } catch (error) {
                console.error('Error in market data callback:', error);
              }
            });
          }
        });
      });
    }, Math.random() * 4000 + 1000); // Random interval between 1-5 seconds
  }

  generateHistoricalData(symbol: string, timeframe: string, count: number = 50): CandlestickData[] {
    const data: CandlestickData[] = [];
    const timeframeMs = this.getTimeframeInterval(timeframe);
    const now = Date.now();
    let basePrice = this.basePrices[symbol] || 1.0000;

    for (let i = count - 1; i >= 0; i--) {
      const timestamp = now - (i * timeframeMs);
      const candleStartTime = this.getCandleStartTime(timestamp, timeframeMs);
      
      // Generate realistic OHLC data
      const open = basePrice;
      const volatility = this.getMarketVolatility(symbol, new Date(timestamp).getUTCHours());
      
      // Generate multiple price points within the candle period
      const pricePoints = [];
      for (let j = 0; j < 10; j++) {
        const change = (Math.random() - 0.5) * volatility * 2;
        pricePoints.push(Math.max(0.0001, basePrice + change));
      }
      
      const close = pricePoints[pricePoints.length - 1];
      const high = Math.max(open, ...pricePoints);
      const low = Math.min(open, ...pricePoints);
      
      data.push({
        time: Math.floor(candleStartTime / 1000),
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 500000) + 100000,
      });

      basePrice = close;
    }

    // Store in history
    const candleKey = `${symbol}_${timeframe}`;
    this.priceHistory.set(candleKey, data);

    return data;
  }

  subscribeToRealTimeData(
    symbol: string, 
    timeframe: string, 
    callback: (candle: CandlestickData) => void
  ): (() => void) {
    const key = `${symbol}_${timeframe}`;
    const subscribers = this.subscriptions.get(key) || [];
    subscribers.push(callback);
    this.subscriptions.set(key, subscribers);

    // Send initial data
    const history = this.priceHistory.get(key) || [];
    if (history.length > 0) {
      callback(history[history.length - 1]);
    }

    // Return unsubscribe function
    return () => {
      const updatedSubscribers = subscribers.filter(cb => cb !== callback);
      if (updatedSubscribers.length > 0) {
        this.subscriptions.set(key, updatedSubscribers);
      } else {
        this.subscriptions.delete(key);
      }
    };
  }

  getHistoricalData(symbol: string, timeframe: string): CandlestickData[] {
    const key = `${symbol}_${timeframe}`;
    const history = this.priceHistory.get(key) || [];
    const currentCandle = this.currentCandles.get(key);
    
    if (currentCandle) {
      return [...history, currentCandle];
    }
    
    return history;
  }

  getCurrentPrice(symbol: string): number {
    const ticks = this.marketTicks.get(symbol) || [];
    if (ticks.length > 0) {
      return ticks[ticks.length - 1].price;
    }
    return this.basePrices[symbol] || 1.0000;
  }

  getSpread(symbol: string): number {
    // Realistic forex spreads
    const spreads: { [key: string]: number } = {
      'EUR/USD': 0.0001,
      'GBP/USD': 0.0002,
      'USD/JPY': 0.001,
      'AUD/USD': 0.0002,
      'USD/CHF': 0.0002,
      'USD/CAD': 0.0002,
      'NZD/USD': 0.0003,
      'EUR/GBP': 0.0002
    };
    
    return spreads[symbol] || 0.0002;
  }
}

export const improvedMarketDataService = new ImprovedMarketDataService();
