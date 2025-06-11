import { marketDataService, CurrencyPair } from './marketDataService';

export interface MarketTrend {
  symbol: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-100
  confidence: number; // 0-100
}

export interface TechnicalIndicator {
  symbol: string;
  rsi: number;
  macd: {
    signal: number;
    histogram: number;
    macd: number;
  };
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface MarketSentiment {
  symbol: string;
  bullishPercentage: number;
  bearishPercentage: number;
  neutralPercentage: number;
  volume: number;
  volatility: number;
}

export interface MarketAlert {
  id: string;
  symbol: string;
  type: 'price' | 'technical' | 'news' | 'volatility';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  isRead: boolean;
}

class MarketAnalysisService {
  private trends: Map<string, MarketTrend> = new Map();
  private indicators: Map<string, TechnicalIndicator> = new Map();
  private sentiment: Map<string, MarketSentiment> = new Map();
  private alerts: MarketAlert[] = [];
  private priceHistory: Map<string, number[]> = new Map();

  async getTrend(symbol: string): Promise<MarketTrend> {
    if (!this.trends.has(symbol)) {
      await this.calculateTrend(symbol);
    }
    return this.trends.get(symbol)!;
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicator> {
    if (!this.indicators.has(symbol)) {
      await this.calculateTechnicalIndicators(symbol);
    }
    return this.indicators.get(symbol)!;
  }

  async getMarketSentiment(symbol: string): Promise<MarketSentiment> {
    if (!this.sentiment.has(symbol)) {
      await this.calculateMarketSentiment(symbol);
    }
    return this.sentiment.get(symbol)!;
  }

  async getMarketAlerts(): Promise<MarketAlert[]> {
    return this.alerts.filter(alert => !alert.isRead);
  }

  async getAllMarketAlerts(): Promise<MarketAlert[]> {
    return this.alerts;
  }

  markAlertAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
    }
  }

  private async calculateTrend(symbol: string): Promise<void> {
    try {
      const pair = await marketDataService.getCurrencyPair(symbol);
      const currentPrice = pair?.price || 1.0;
      const history = this.getPriceHistory(symbol);
      
      if (history.length < 20) {
        // Not enough data, generate some history
        await this.generatePriceHistory(symbol, currentPrice);
      }

      const sma20 = this.calculateSMA(history.slice(-20));
      const sma50 = this.calculateSMA(history.slice(-50));
      
      let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      let strength = 50;
      let confidence = 50;

      if (currentPrice > sma20 && sma20 > sma50) {
        trend = 'bullish';
        strength = Math.min(95, 60 + (currentPrice - sma20) / sma20 * 1000);
        confidence = Math.min(95, 70 + Math.random() * 25);
      } else if (currentPrice < sma20 && sma20 < sma50) {
        trend = 'bearish';
        strength = Math.min(95, 60 + (sma20 - currentPrice) / sma20 * 1000);
        confidence = Math.min(95, 70 + Math.random() * 25);
      } else {
        strength = 45 + Math.random() * 10;
        confidence = 40 + Math.random() * 20;
      }

      this.trends.set(symbol, {
        symbol,
        trend,
        strength: Math.round(strength),
        confidence: Math.round(confidence),
      });
    } catch (error) {
      console.error('Error calculating trend:', error);
      // Fallback with simulated data
      this.trends.set(symbol, {
        symbol,
        trend: Math.random() > 0.5 ? 'bullish' : 'bearish',
        strength: Math.round(50 + Math.random() * 40),
        confidence: Math.round(60 + Math.random() * 30),
      });
    }
  }

  private async calculateTechnicalIndicators(symbol: string): Promise<void> {
    try {
      const pair = await marketDataService.getCurrencyPair(symbol);
      const currentPrice = pair?.price || 1.0;
      const history = this.getPriceHistory(symbol);

      if (history.length < 50) {
        await this.generatePriceHistory(symbol, currentPrice);
      }

      const rsi = this.calculateRSI(history.slice(-14));
      const sma20 = this.calculateSMA(history.slice(-20));
      const sma50 = this.calculateSMA(history.slice(-50));
      const ema12 = this.calculateEMA(history.slice(-12), 12);
      const ema26 = this.calculateEMA(history.slice(-26), 26);

      const macdLine = ema12 - ema26;
      const signalLine = this.calculateEMA([macdLine], 9);
      const histogram = macdLine - signalLine;

      const bollinger = this.calculateBollingerBands(history.slice(-20));

      this.indicators.set(symbol, {
        symbol,
        rsi: Math.round(rsi * 100) / 100,
        macd: {
          signal: Math.round(signalLine * 100000) / 100000,
          histogram: Math.round(histogram * 100000) / 100000,
          macd: Math.round(macdLine * 100000) / 100000,
        },
        sma20: Math.round(sma20 * 100000) / 100000,
        sma50: Math.round(sma50 * 100000) / 100000,
        ema12: Math.round(ema12 * 100000) / 100000,
        ema26: Math.round(ema26 * 100000) / 100000,
        bollinger: {
          upper: Math.round(bollinger.upper * 100000) / 100000,
          middle: Math.round(bollinger.middle * 100000) / 100000,
          lower: Math.round(bollinger.lower * 100000) / 100000,
        },
      });
    } catch (error) {
      console.error('Error calculating technical indicators:', error);
    }
  }

  private async calculateMarketSentiment(symbol: string): Promise<void> {
    try {
      // Simulate market sentiment based on recent price movements
      const history = this.getPriceHistory(symbol);
      const recentChanges = history.slice(-10).map((price, index) => {
        if (index === 0) return 0;
        return (price - history[history.length - 10 + index - 1]) / history[history.length - 10 + index - 1];
      }).slice(1);

      const positiveChanges = recentChanges.filter(change => change > 0).length;
      const negativeChanges = recentChanges.filter(change => change < 0).length;
      const neutralChanges = recentChanges.length - positiveChanges - negativeChanges;

      const total = recentChanges.length;
      const bullishPercentage = Math.round((positiveChanges / total) * 100);
      const bearishPercentage = Math.round((negativeChanges / total) * 100);
      const neutralPercentage = 100 - bullishPercentage - bearishPercentage;

      const volatility = this.calculateVolatility(recentChanges);
      const volume = Math.random() * 1000000 + 500000; // Simulated volume

      this.sentiment.set(symbol, {
        symbol,
        bullishPercentage,
        bearishPercentage,
        neutralPercentage,
        volume: Math.round(volume),
        volatility: Math.round(volatility * 10000) / 100,
      });
    } catch (error) {
      console.error('Error calculating market sentiment:', error);
    }
  }

  private getPriceHistory(symbol: string): number[] {
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, []);
    }
    return this.priceHistory.get(symbol)!;
  }

  private async generatePriceHistory(symbol: string, currentPrice: number): Promise<void> {
    const history: number[] = [];
    let price = currentPrice * (0.98 + Math.random() * 0.04); // Start slightly different

    // Generate 100 historical price points
    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * 0.02; // ±1% change
      price = price * (1 + change);
      history.push(price);
    }

    this.priceHistory.set(symbol, history);
  }

  public updatePriceHistory(symbol: string, newPrice: number): void {
    const history = this.getPriceHistory(symbol);
    history.push(newPrice);
    
    // Keep only last 200 prices
    if (history.length > 200) {
      history.splice(0, history.length - 200);
    }

    this.priceHistory.set(symbol, history);
    
    // Check for alerts
    this.checkForAlerts(symbol, newPrice);
  }

  private checkForAlerts(symbol: string, currentPrice: number): void {
    // Check for volatility alerts
    const history = this.getPriceHistory(symbol);
    if (history.length >= 5) {
      const recentChanges = history.slice(-5).map((price, index) => {
        if (index === 0) return 0;
        return Math.abs((price - history[history.length - 5 + index - 1]) / history[history.length - 5 + index - 1]);
      }).slice(1);

      const avgVolatility = recentChanges.reduce((sum, change) => sum + change, 0) / recentChanges.length;
      
      if (avgVolatility > 0.01) { // 1% average change
        this.addAlert({
          id: `volatility_${symbol}_${Date.now()}`,
          symbol,
          type: 'volatility',
          title: 'High Volatility Alert',
          message: `${symbol} is experiencing high volatility. Current price: ${currentPrice.toFixed(5)}`,
          severity: avgVolatility > 0.02 ? 'high' : 'medium',
          timestamp: new Date(),
          isRead: false,
        });
      }
    }
  }

  private addAlert(alert: MarketAlert): void {
    this.alerts.unshift(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }
  }

  // Technical indicator calculation methods
  private calculateSMA(prices: number[]): number {
    if (prices.length === 0) return 0;
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length === 1) return prices[0];

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  private calculateRSI(prices: number[]): number {
    if (prices.length < 2) return 50;

    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains.push(change);
        losses.push(0);
      } else {
        gains.push(0);
        losses.push(-change);
      }
    }

    const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / gains.length;
    const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / losses.length;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateBollingerBands(prices: number[]): { upper: number; middle: number; lower: number } {
    const sma = this.calculateSMA(prices);
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    return {
      upper: sma + (stdDev * 2),
      middle: sma,
      lower: sma - (stdDev * 2),
    };
  }

  private calculateVolatility(changes: number[]): number {
    if (changes.length === 0) return 0;
    
    const mean = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    const variance = changes.reduce((sum, change) => sum + Math.pow(change - mean, 2), 0) / changes.length;
    
    return Math.sqrt(variance);
  }

  // Public method to get all analysis for a symbol
  async getCompleteAnalysis(symbol: string): Promise<{
    trend: MarketTrend;
    indicators: TechnicalIndicator;
    sentiment: MarketSentiment;
  }> {
    const [trend, indicators, sentiment] = await Promise.all([
      this.getTrend(symbol),
      this.getTechnicalIndicators(symbol),
      this.getMarketSentiment(symbol),
    ]);

    return { trend, indicators, sentiment };
  }
}

export const marketAnalysisService = new MarketAnalysisService();
