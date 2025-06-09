import { CandleData } from '../components/organisms/TradingChart';

interface MarketSession {
  name: string;
  start: number; // Hour in UTC
  end: number;
  timezone: string;
  pairs: string[];
}

interface EconomicEvent {
  timestamp: number;
  impact: 'low' | 'medium' | 'high';
  currency: string;
  description: string;
}

interface MarketRegime {
  type: 'trending' | 'ranging' | 'volatile' | 'calm';
  strength: number; // 0-1
  duration: number; // minutes
}

interface TrendData {
  direction: 'up' | 'down' | 'sideways';
  strength: number; // 0-1
  momentum: number;
  support: number;
  resistance: number;
}

class RealisticMarketSimulation {
  private priceHistory: Map<string, CandleData[]> = new Map();
  private currentTrends: Map<string, TrendData> = new Map();
  private marketRegime: MarketRegime = {
    type: 'calm',
    strength: 0.3,
    duration: 60
  };
  
  private readonly marketSessions: MarketSession[] = [
    { name: 'Sydney', start: 22, end: 7, timezone: 'Australia/Sydney', pairs: ['AUD/USD', 'NZD/USD'] },
    { name: 'Tokyo', start: 0, end: 9, timezone: 'Asia/Tokyo', pairs: ['USD/JPY', 'AUD/JPY'] },
    { name: 'London', start: 8, end: 17, timezone: 'Europe/London', pairs: ['GBP/USD', 'EUR/USD', 'EUR/GBP'] },
    { name: 'New York', start: 13, end: 22, timezone: 'America/New_York', pairs: ['USD/CAD', 'USD/CHF'] }
  ];

  private readonly economicEvents: EconomicEvent[] = [
    { timestamp: Date.now() + 3600000, impact: 'high', currency: 'USD', description: 'FOMC Rate Decision' },
    { timestamp: Date.now() + 7200000, impact: 'medium', currency: 'EUR', description: 'ECB Press Conference' },
    { timestamp: Date.now() + 14400000, impact: 'high', currency: 'GBP', description: 'UK Employment Data' }
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
    this.initializeTrends();
    this.updateMarketRegime();
  }

  private initializeTrends(): void {
    Object.keys(this.basePrices).forEach(pair => {
      this.currentTrends.set(pair, {
        direction: Math.random() > 0.5 ? 'up' : 'down',
        strength: Math.random() * 0.7 + 0.3,
        momentum: Math.random() * 0.5,
        support: this.basePrices[pair] * (1 - Math.random() * 0.02),
        resistance: this.basePrices[pair] * (1 + Math.random() * 0.02)
      });
    });
  }

  private updateMarketRegime(): void {
    setInterval(() => {
      const regimeTypes: MarketRegime['type'][] = ['trending', 'ranging', 'volatile', 'calm'];
      const randomType = regimeTypes[Math.floor(Math.random() * regimeTypes.length)];
      
      this.marketRegime = {
        type: randomType,
        strength: Math.random() * 0.8 + 0.2,
        duration: Math.random() * 120 + 30 // 30-150 minutes
      };
    }, 10 * 60 * 1000); // Update every 10 minutes
  }

  private getMarketVolatility(pair: string, hour: number): number {
    // Base volatility
    let volatility = 0.0001;

    // Market session volatility
    const activeSessions = this.marketSessions.filter(session => {
      const isActive = (session.start <= session.end) 
        ? (hour >= session.start && hour < session.end)
        : (hour >= session.start || hour < session.end);
      return isActive && session.pairs.some(p => p === pair);
    });

    volatility *= (1 + activeSessions.length * 0.5);

    // Market regime impact
    switch (this.marketRegime.type) {
      case 'volatile':
        volatility *= 2.5;
        break;
      case 'trending':
        volatility *= 1.5;
        break;
      case 'ranging':
        volatility *= 0.8;
        break;
      case 'calm':
        volatility *= 0.6;
        break;
    }

    return volatility;
  }

  private getTrendInfluence(pair: string): number {
    const trend = this.currentTrends.get(pair);
    if (!trend) return 0;

    let influence = 0;
    const currentPrice = this.getCurrentPrice(pair);

    // Trend following
    if (trend.direction === 'up') {
      influence = trend.strength * trend.momentum * 0.3;
    } else if (trend.direction === 'down') {
      influence = -trend.strength * trend.momentum * 0.3;
    }

    // Support/resistance levels
    if (currentPrice <= trend.support) {
      influence += 0.5; // Bounce from support
    } else if (currentPrice >= trend.resistance) {
      influence -= 0.5; // Rejection at resistance
    }

    return Math.max(-1, Math.min(1, influence));
  }

  private getEconomicEventImpact(pair: string): number {
    const now = Date.now();
    const relevantEvents = this.economicEvents.filter(event => {
      const timeDiff = Math.abs(event.timestamp - now);
      const isRelevant = pair.includes(event.currency) && timeDiff < 1800000; // 30 minutes
      return isRelevant;
    });

    let impact = 0;
    relevantEvents.forEach(event => {
      const timeFactor = Math.max(0, 1 - Math.abs(event.timestamp - now) / 1800000);
      const impactMultiplier = event.impact === 'high' ? 1.0 : event.impact === 'medium' ? 0.6 : 0.3;
      impact += (Math.random() - 0.5) * impactMultiplier * timeFactor;
    });

    return impact;
  }

  generateRealisticPriceMovement(pair: string): number {
    const hour = new Date().getUTCHours();
    const volatility = this.getMarketVolatility(pair, hour);
    const trendInfluence = this.getTrendInfluence(pair);
    const economicImpact = this.getEconomicEventImpact(pair);

    // Combine all factors
    const randomComponent = (Math.random() - 0.5) * volatility;
    const trendComponent = trendInfluence * volatility * 2;
    const eventComponent = economicImpact * volatility * 3;

    const totalChange = randomComponent + trendComponent + eventComponent;

    // Add mean reversion for extreme moves
    const currentPrice = this.getCurrentPrice(pair);
    const basePrice = this.basePrices[pair];
    const deviation = (currentPrice - basePrice) / basePrice;
    const meanReversionForce = -deviation * 0.1;

    return totalChange + meanReversionForce;
  }

  generateHistoricalData(symbol: string, timeframe: string, count: number = 100): CandleData[] {
    const data: CandleData[] = [];
    const basePrice = this.basePrices[symbol] || 1.0000;
    const now = Date.now();
    
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
      const priceChange = this.generateRealisticPriceMovement(symbol);
      
      const open = currentPrice;
      const close = open * (1 + priceChange);
      
      // Generate realistic OHLC
      const volatilityFactor = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
      const range = Math.abs(close - open) * (2 + volatilityFactor);
      
      const high = Math.max(open, close) + (range * Math.random() * 0.3);
      const low = Math.min(open, close) - (range * Math.random() * 0.3);
      
      // Volume correlation with price movement and time
      const priceMovementFactor = Math.abs(priceChange) * 10000;
      const timeOfDayFactor = this.getVolumeTimeOfDayFactor(timestamp);
      const baseVolume = 500000;
      const volume = Math.floor(baseVolume * (0.5 + priceMovementFactor + timeOfDayFactor));
      
      data.push({
        timestamp,
        open: Number(open.toFixed(5)),
        high: Number(high.toFixed(5)),
        low: Number(low.toFixed(5)),
        close: Number(close.toFixed(5)),
        volume: Math.max(10000, volume)
      });
      
      currentPrice = close;
    }

    // Store for future reference
    this.priceHistory.set(symbol, data);
    this.basePrices[symbol] = currentPrice;
    
    return data.sort((a, b) => a.timestamp - b.timestamp);
  }

  private getVolumeTimeOfDayFactor(timestamp: number): number {
    const hour = new Date(timestamp).getUTCHours();
    
    // High volume during major session overlaps
    if ((hour >= 8 && hour <= 12) || (hour >= 13 && hour <= 17)) {
      return 1.5; // London/NY overlap and main sessions
    } else if (hour >= 0 && hour <= 3) {
      return 1.2; // Tokyo session
    } else {
      return 0.8; // Off-peak hours
    }
  }

  subscribeToRealTimeData(symbol: string, callback: (data: CandleData) => void): () => void {
    const basePrice = this.getCurrentPrice(symbol);
    let currentCandle: CandleData = {
      timestamp: Date.now(),
      open: basePrice,
      high: basePrice,
      low: basePrice,
      close: basePrice,
      volume: 0,
    };

    const interval = setInterval(() => {
      const priceChange = this.generateRealisticPriceMovement(symbol);
      const newClose = currentCandle.close * (1 + priceChange);
      
      // Update OHLC
      const newHigh = Math.max(currentCandle.high, newClose);
      const newLow = Math.min(currentCandle.low, newClose);
      
      // Add realistic volume tick
      const volumeTick = Math.floor(Math.random() * 50000 + 5000);
      
      const updatedCandle: CandleData = {
        timestamp: Date.now(),
        open: currentCandle.open,
        high: Number(newHigh.toFixed(5)),
        low: Number(newLow.toFixed(5)),
        close: Number(newClose.toFixed(5)),
        volume: (currentCandle.volume || 0) + volumeTick,
      };
      
      currentCandle = updatedCandle;
      callback(updatedCandle);
      
      // Update stored price
      this.basePrices[symbol] = newClose;
    }, 1000);

    return () => clearInterval(interval);
  }

  getCurrentPrice(symbol: string): number {
    return this.basePrices[symbol] || 1.0000;
  }

  getBidAsk(symbol: string): { bid: number; ask: number; spread: number } {
    const mid = this.getCurrentPrice(symbol);
    
    // Dynamic spread based on market conditions
    let baseSpread = 0.0002; // 2 pips
    
    // Wider spreads during volatile markets
    if (this.marketRegime.type === 'volatile') {
      baseSpread *= 2.5;
    } else if (this.marketRegime.type === 'calm') {
      baseSpread *= 0.7;
    }
    
    // Wider spreads during off-hours
    const hour = new Date().getUTCHours();
    const isOffPeak = hour < 6 || hour > 20;
    if (isOffPeak) {
      baseSpread *= 1.5;
    }
    
    const spread = Number(baseSpread.toFixed(5));
    
    return {
      bid: Number((mid - spread/2).toFixed(5)),
      ask: Number((mid + spread/2).toFixed(5)),
      spread: spread,
    };
  }

  getMarketSentiment(symbol: string): { sentiment: 'bullish' | 'bearish' | 'neutral'; strength: number } {
    const trend = this.currentTrends.get(symbol);
    if (!trend) return { sentiment: 'neutral', strength: 0.5 };
    
    if (trend.direction === 'up' && trend.strength > 0.6) {
      return { sentiment: 'bullish', strength: trend.strength };
    } else if (trend.direction === 'down' && trend.strength > 0.6) {
      return { sentiment: 'bearish', strength: trend.strength };
    } else {
      return { sentiment: 'neutral', strength: 0.5 };
    }
  }

  // Get simulated slippage for order execution
  getExecutionSlippage(symbol: string, orderSize: number): number {
    const baseSlippage = 0.00005; // 0.5 pips
    
    // More slippage for larger orders
    const sizeFactor = Math.min(orderSize / 100000, 5); // Max 5x for very large orders
    
    // More slippage during volatile markets
    const volatilityFactor = this.marketRegime.type === 'volatile' ? 3 : 1;
    
    return baseSlippage * (1 + sizeFactor) * volatilityFactor;
  }
}

export const realisticMarketSimulation = new RealisticMarketSimulation();
export type { TrendData, MarketRegime, EconomicEvent };
