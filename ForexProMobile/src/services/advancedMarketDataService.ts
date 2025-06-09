import { CandleData } from '../components/organisms/TradingChart';

interface MarketDataService {
  generateHistoricalData: (symbol: string, timeframe: string, count: number) => CandleData[];
  generateCandleUpdate: (lastCandle: CandleData, priceChange: number) => CandleData;
  subscribeToRealTimeData: (symbol: string, callback: (data: CandleData) => void) => () => void;
}

class MarketDataServiceImpl implements MarketDataService {
  private priceHistory: { [key: string]: number } = {
    'EUR/USD': 1.1000,
    'GBP/USD': 1.2500,
    'USD/JPY': 150.00,
    'USD/CHF': 0.9200,
    'AUD/USD': 0.6500,
    'USD/CAD': 1.3600,
    'NZD/USD': 0.6100,
    'EUR/GBP': 0.8800,
  };

  generateHistoricalData(symbol: string, timeframe: string, count: number = 100): CandleData[] {
    const data: CandleData[] = [];
    const basePrice = this.priceHistory[symbol] || 1.0000;
    const now = Date.now();
    
    // Calculate time interval based on timeframe
    const getInterval = (tf: string): number => {
      switch (tf) {
        case '1m': return 60 * 1000;
        case '5m': return 5 * 60 * 1000;
        case '15m': return 15 * 60 * 1000;
        case '1h': return 60 * 60 * 1000;
        case '4h': return 4 * 60 * 60 * 1000;
        case '1d': return 24 * 60 * 60 * 1000;
        default: return 60 * 1000;
      }
    };

    const interval = getInterval(timeframe);
    let currentPrice = basePrice;

    for (let i = count - 1; i >= 0; i--) {
      const timestamp = now - (i * interval);
      
      // Generate realistic price movement
      const volatility = 0.001; // 0.1% volatility
      const trend = (Math.random() - 0.5) * 0.0005; // Small random trend
      const priceChange = (Math.random() - 0.5) * volatility + trend;
      
      const open = currentPrice;
      const close = open + (open * priceChange);
      
      // Generate high and low based on open and close
      const [min, max] = [Math.min(open, close), Math.max(open, close)];
      const range = Math.abs(close - open) * 2 + (open * volatility * 0.5);
      
      const high = max + (Math.random() * range * 0.3);
      const low = min - (Math.random() * range * 0.3);
      
      const volume = Math.random() * 1000000 + 500000; // Random volume
      
      data.push({
        timestamp,
        open: Number(open.toFixed(5)),
        high: Number(high.toFixed(5)),
        low: Number(low.toFixed(5)),
        close: Number(close.toFixed(5)),
        volume: Math.floor(volume),
      });
      
      currentPrice = close;
    }

    // Update stored price
    this.priceHistory[symbol] = currentPrice;
    
    return data.sort((a, b) => a.timestamp - b.timestamp);
  }

  generateCandleUpdate(lastCandle: CandleData, priceChange: number = 0): CandleData {
    const baseChange = priceChange || (Math.random() - 0.5) * 0.002; // ±0.2% change
    const newClose = lastCandle.close + (lastCandle.close * baseChange);
    
    // Update high/low if necessary
    const newHigh = Math.max(lastCandle.high, newClose);
    const newLow = Math.min(lastCandle.low, newClose);
    
    return {
      timestamp: Date.now(),
      open: lastCandle.open, // Keep same open for current candle update
      high: Number(newHigh.toFixed(5)),
      low: Number(newLow.toFixed(5)),
      close: Number(newClose.toFixed(5)),
      volume: (lastCandle.volume || 0) + Math.floor(Math.random() * 10000),
    };
  }

  subscribeToRealTimeData(symbol: string, callback: (data: CandleData) => void): () => void {
    const basePrice = this.priceHistory[symbol] || 1.0000;
    let currentCandle: CandleData = {
      timestamp: Date.now(),
      open: basePrice,
      high: basePrice,
      low: basePrice,
      close: basePrice,
      volume: 0,
    };

    const interval = setInterval(() => {
      // Generate new candle data every second
      const updatedCandle = this.generateCandleUpdate(currentCandle);
      currentCandle = updatedCandle;
      callback(updatedCandle);
      
      // Update stored price
      this.priceHistory[symbol] = updatedCandle.close;
    }, 1000);

    // Return cleanup function
    return () => clearInterval(interval);
  }

  // Get current price for a symbol
  getCurrentPrice(symbol: string): number {
    return this.priceHistory[symbol] || 1.0000;
  }

  // Get bid/ask spread
  getBidAsk(symbol: string): { bid: number; ask: number; spread: number } {
    const mid = this.getCurrentPrice(symbol);
    const spread = 0.0002; // 2 pips
    return {
      bid: Number((mid - spread/2).toFixed(5)),
      ask: Number((mid + spread/2).toFixed(5)),
      spread: Number(spread.toFixed(5)),
    };
  }

  // Calculate percentage change
  calculateChange(current: number, previous: number): number {
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  // Format price for display
  formatPrice(price: number, symbol: string): string {
    const isJPY = symbol.includes('JPY');
    return isJPY ? price.toFixed(3) : price.toFixed(5);
  }

  // Get market status (simplified)
  getMarketStatus(): 'open' | 'closed' | 'pre-market' {
    const hour = new Date().getHours();
    if (hour >= 9 && hour < 17) return 'open';
    if (hour >= 8 && hour < 9) return 'pre-market';
    return 'closed';
  }
}

export const advancedMarketDataService = new MarketDataServiceImpl();
export type { CandleData };
