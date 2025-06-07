export interface CurrencyPair {
  id: string;
  symbol: string;
  base: string;
  quote: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  bid: number;
  ask: number;
  spread: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  isActive: boolean;
  precision: number;
  minTradeSize: number;
  maxTradeSize: number;
  category: 'major' | 'minor' | 'exotic' | 'crypto';
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'economic' | 'market' | 'forex' | 'crypto';
  importance: 'low' | 'medium' | 'high';
  publishedAt: string;
  source: string;
  affectedCurrencies: string[];
}

class MarketDataService {
  private priceSubscriptions: Map<string, ((update: PriceUpdate) => void)[]> = new Map();
  private priceIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Mock currency pairs data
  private currencyPairs: CurrencyPair[] = [
    {
      id: 'EURUSD',
      symbol: 'EURUSD',
      base: 'EUR',
      quote: 'USD',
      name: 'Euro / US Dollar',
      price: 1.0845,
      change: 0.0012,
      changePercent: 0.11,
      bid: 1.0843,
      ask: 1.0847,
      spread: 0.0004,
      high24h: 1.0892,
      low24h: 1.0821,
      volume24h: 1250000,
      isActive: true,
      precision: 5,
      minTradeSize: 0.01,
      maxTradeSize: 100,
      category: 'major',
    },
    {
      id: 'GBPUSD',
      symbol: 'GBPUSD',
      base: 'GBP',
      quote: 'USD',
      name: 'British Pound / US Dollar',
      price: 1.2734,
      change: -0.0028,
      changePercent: -0.22,
      bid: 1.2732,
      ask: 1.2736,
      spread: 0.0004,
      high24h: 1.2789,
      low24h: 1.2698,
      volume24h: 980000,
      isActive: true,
      precision: 5,
      minTradeSize: 0.01,
      maxTradeSize: 100,
      category: 'major',
    },
    {
      id: 'USDJPY',
      symbol: 'USDJPY',
      base: 'USD',
      quote: 'JPY',
      name: 'US Dollar / Japanese Yen',
      price: 149.87,
      change: 0.23,
      changePercent: 0.15,
      bid: 149.85,
      ask: 149.89,
      spread: 0.04,
      high24h: 150.21,
      low24h: 149.34,
      volume24h: 875000,
      isActive: true,
      precision: 3,
      minTradeSize: 0.01,
      maxTradeSize: 100,
      category: 'major',
    },
    {
      id: 'AUDUSD',
      symbol: 'AUDUSD',
      base: 'AUD',
      quote: 'USD',
      name: 'Australian Dollar / US Dollar',
      price: 0.6578,
      change: 0.0034,
      changePercent: 0.52,
      bid: 0.6576,
      ask: 0.6580,
      spread: 0.0004,
      high24h: 0.6612,
      low24h: 0.6534,
      volume24h: 625000,
      isActive: true,
      precision: 5,
      minTradeSize: 0.01,
      maxTradeSize: 100,
      category: 'major',
    },
    {
      id: 'USDCAD',
      symbol: 'USDCAD',
      base: 'USD',
      quote: 'CAD',
      name: 'US Dollar / Canadian Dollar',
      price: 1.3542,
      change: -0.0015,
      changePercent: -0.11,
      bid: 1.3540,
      ask: 1.3544,
      spread: 0.0004,
      high24h: 1.3578,
      low24h: 1.3521,
      volume24h: 445000,
      isActive: true,
      precision: 5,
      minTradeSize: 0.01,
      maxTradeSize: 100,
      category: 'major',
    },
    {
      id: 'USDCHF',
      symbol: 'USDCHF',
      base: 'USD',
      quote: 'CHF',
      name: 'US Dollar / Swiss Franc',
      price: 0.8923,
      change: 0.0008,
      changePercent: 0.09,
      bid: 0.8921,
      ask: 0.8925,
      spread: 0.0004,
      high24h: 0.8954,
      low24h: 0.8901,
      volume24h: 335000,
      isActive: true,
      precision: 5,
      minTradeSize: 0.01,
      maxTradeSize: 100,
      category: 'major',
    },
  ];

  // Mock market news
  private marketNews: MarketNews[] = [
    {
      id: '1',
      title: 'Fed Holds Rates Steady, Signals Cautious Approach',
      summary: 'Federal Reserve maintains interest rates while watching inflation data closely.',
      content: 'The Federal Reserve decided to hold interest rates steady at their current level, citing mixed economic signals and ongoing inflation concerns...',
      category: 'economic',
      importance: 'high',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      source: 'Reuters',
      affectedCurrencies: ['USD'],
    },
    {
      id: '2',
      title: 'EUR/USD Breaks Key Resistance Level',
      summary: 'Euro gains strength against dollar following ECB comments.',
      content: 'The EUR/USD pair has broken through a key resistance level at 1.0840, with traders reacting to recent ECB commentary...',
      category: 'forex',
      importance: 'medium',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      source: 'MarketWatch',
      affectedCurrencies: ['EUR', 'USD'],
    },
    {
      id: '3',
      title: 'UK Inflation Data Surprises to Upside',
      summary: 'Higher than expected inflation puts pressure on Bank of England.',
      content: 'UK inflation data came in higher than expected, putting additional pressure on the Bank of England to consider rate adjustments...',
      category: 'economic',
      importance: 'high',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      source: 'Financial Times',
      affectedCurrencies: ['GBP'],
    },
  ];

  async getCurrencyPairs(): Promise<CurrencyPair[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.currencyPairs];
  }

  async getCurrencyPair(symbol: string): Promise<CurrencyPair | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.currencyPairs.find(pair => pair.symbol === symbol) || null;
  }

  async getMarketNews(): Promise<MarketNews[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.marketNews];
  }

  // Real-time price simulation
  subscribeToPriceUpdates(symbol: string, callback: (update: PriceUpdate) => void): () => void {
    if (!this.priceSubscriptions.has(symbol)) {
      this.priceSubscriptions.set(symbol, []);
    }
    
    const callbacks = this.priceSubscriptions.get(symbol)!;
    callbacks.push(callback);

    // Start price updates if this is the first subscription
    if (callbacks.length === 1) {
      this.startPriceUpdates(symbol);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.priceSubscriptions.get(symbol);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        
        // Stop updates if no more subscribers
        if (callbacks.length === 0) {
          this.stopPriceUpdates(symbol);
        }
      }
    };
  }

  private startPriceUpdates(symbol: string): void {
    const pair = this.currencyPairs.find(p => p.symbol === symbol);
    if (!pair) return;

    const interval = setInterval(() => {
      // Simulate price movement
      const volatility = 0.0001; // 1 pip
      const change = (Math.random() - 0.5) * volatility * 2;
      
      pair.price += change;
      pair.bid = pair.price - pair.spread / 2;
      pair.ask = pair.price + pair.spread / 2;
      
      // Update 24h high/low
      if (pair.price > pair.high24h) pair.high24h = pair.price;
      if (pair.price < pair.low24h) pair.low24h = pair.price;
      
      // Calculate change from some base price (simulated)
      const basePrice = 1.0800; // Simulated opening price
      pair.change = pair.price - basePrice;
      pair.changePercent = (pair.change / basePrice) * 100;

      const update: PriceUpdate = {
        symbol,
        price: pair.price,
        bid: pair.bid,
        ask: pair.ask,
        change: pair.change,
        changePercent: pair.changePercent,
        timestamp: Date.now(),
      };

      // Notify all subscribers
      const callbacks = this.priceSubscriptions.get(symbol);
      if (callbacks) {
        callbacks.forEach(callback => callback(update));
      }
    }, 1000); // Update every second

    this.priceIntervals.set(symbol, interval);
  }

  private stopPriceUpdates(symbol: string): void {
    const interval = this.priceIntervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.priceIntervals.delete(symbol);
    }
  }

  // Cleanup method
  cleanup(): void {
    this.priceIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.priceIntervals.clear();
    this.priceSubscriptions.clear();
  }
}

export const marketDataService = new MarketDataService();
