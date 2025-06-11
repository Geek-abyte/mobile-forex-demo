/**
 * Risk Management Service
 * Provides comprehensive risk analysis, calculations, and monitoring for trading positions
 */

import { tradingService } from './tradingService';
import { marketDataService } from './marketDataService';

export interface RiskMetrics {
  accountBalance: number;
  equity: number;
  usedMargin: number;
  freeMargin: number;
  marginLevel: number;
  drawdown: number;
  maxDrawdown: number;
  riskScore: number;
  exposurePercent: number;
  dailyVaR: number; // Value at Risk
  sharpeRatio: number;
  maxLeverage: number;
  recommendedPositionSize: number;
}

export interface PositionRisk {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  size: number;
  entryPrice: number;
  currentPrice: number;
  riskAmount: number;
  riskPercent: number;
  leverage: number;
  margin: number;
  stopLoss?: number;
  takeProfit?: number;
  unrealizedPnL: number;
  riskRewardRatio: number;
}

export interface RiskAlert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
}

export interface RiskSettings {
  maxRiskPerTrade: number; // Percentage of account
  maxDailyLoss: number; // Percentage of account
  maxDrawdown: number; // Percentage of account
  marginCallLevel: number; // Percentage
  stopOutLevel: number; // Percentage
  allowOvernight: boolean;
  maxPositions: number;
  riskAlerts: boolean;
}

class RiskManagementService {
  private currentRiskMetrics: RiskMetrics | null = null;
  private riskAlerts: RiskAlert[] = [];
  private riskSettings: RiskSettings = {
    maxRiskPerTrade: 2.0, // 2% max risk per trade
    maxDailyLoss: 5.0, // 5% max daily loss
    maxDrawdown: 10.0, // 10% max drawdown
    marginCallLevel: 50.0, // 50% margin call
    stopOutLevel: 20.0, // 20% stop out
    allowOvernight: true,
    maxPositions: 10,
    riskAlerts: true,
  };

  private listeners: Set<(metrics: RiskMetrics) => void> = new Set();

  /**
   * Get current risk metrics with real-time calculations
   */
  async getRiskMetrics(): Promise<RiskMetrics> {
    try {
      const [accountSummary, positions] = await Promise.all([
        tradingService.getAccountSummary(),
        tradingService.getPositions(),
      ]);

      const positionRisks = await Promise.all(
        positions.map((position: any) => this.calculatePositionRisk(position))
      );

      const totalExposure = positionRisks.reduce((sum: number, risk: PositionRisk) => sum + Math.abs(risk.riskAmount), 0);
      const totalUnrealizedPnL = positionRisks.reduce((sum: number, risk: PositionRisk) => sum + risk.unrealizedPnL, 0);

      const metrics: RiskMetrics = {
        accountBalance: accountSummary.balance,
        equity: accountSummary.balance + totalUnrealizedPnL,
        usedMargin: accountSummary.margin,
        freeMargin: accountSummary.freeMargin,
        marginLevel: accountSummary.marginLevel,
        drawdown: this.calculateDrawdown(accountSummary.balance, totalUnrealizedPnL),
        maxDrawdown: await this.getMaxDrawdown(),
        riskScore: this.calculateRiskScore(positionRisks, accountSummary),
        exposurePercent: (totalExposure / accountSummary.balance) * 100,
        dailyVaR: this.calculateVaR(positionRisks),
        sharpeRatio: await this.calculateSharpeRatio(),
        maxLeverage: this.calculateMaxAllowedLeverage(accountSummary),
        recommendedPositionSize: this.calculateRecommendedPositionSize(accountSummary.balance),
      };

      this.currentRiskMetrics = metrics;
      this.checkRiskAlerts(metrics, positionRisks);
      this.notifyListeners(metrics);

      return metrics;
    } catch (error) {
      console.error('Error calculating risk metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate risk metrics for a specific position
   */
  async calculatePositionRisk(position: any): Promise<PositionRisk> {
    const currentPrice = await this.getCurrentPrice(position.symbol);
    const entryPrice = position.entryPrice;
    const size = position.size;
    const leverage = position.leverage || 1;

    const priceDiff = position.type === 'buy' 
      ? currentPrice - entryPrice 
      : entryPrice - currentPrice;

    const unrealizedPnL = priceDiff * size;
    const margin = (entryPrice * size) / leverage;
    const riskAmount = position.stopLoss 
      ? Math.abs((entryPrice - position.stopLoss) * size)
      : margin; // If no stop loss, risk is full margin

    const accountBalance = (await tradingService.getAccountSummary()).balance;
    const riskPercent = (riskAmount / accountBalance) * 100;

    const riskRewardRatio = this.calculateRiskRewardRatio(
      entryPrice,
      position.stopLoss,
      position.takeProfit,
      position.type
    );

    return {
      id: position.id,
      symbol: position.symbol,
      type: position.type,
      size,
      entryPrice,
      currentPrice,
      riskAmount,
      riskPercent,
      leverage,
      margin,
      stopLoss: position.stopLoss,
      takeProfit: position.takeProfit,
      unrealizedPnL,
      riskRewardRatio,
    };
  }

  /**
   * Calculate overall risk score (0-100, where 100 is maximum risk)
   */
  private calculateRiskScore(positionRisks: PositionRisk[], accountSummary: any): number {
    let score = 0;

    // Factor 1: Margin usage (0-30 points)
    const marginUsage = (accountSummary.margin / accountSummary.balance) * 100;
    score += Math.min(marginUsage * 0.6, 30);

    // Factor 2: Number of positions (0-20 points)
    const positionCount = positionRisks.length;
    score += Math.min(positionCount * 2, 20);

    // Factor 3: Average risk per position (0-25 points)
    const avgRiskPercent = positionRisks.reduce((sum, risk) => sum + risk.riskPercent, 0) / positionRisks.length;
    score += Math.min(avgRiskPercent * 5, 25);

    // Factor 4: Leverage usage (0-15 points)
    const avgLeverage = positionRisks.reduce((sum, risk) => sum + risk.leverage, 0) / positionRisks.length;
    score += Math.min(avgLeverage * 0.5, 15);

    // Factor 5: Correlation risk (0-10 points)
    const correlationRisk = this.calculateCorrelationRisk(positionRisks);
    score += correlationRisk;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculate Value at Risk (VaR) for daily potential loss
   */
  private calculateVaR(positionRisks: PositionRisk[]): number {
    // Simplified VaR calculation using 95% confidence level
    const volatilities = positionRisks.map(risk => {
      // Assume 1% daily volatility for major pairs, adjust based on pair
      const baseVolatility = this.getAssetVolatility(risk.symbol);
      return risk.riskAmount * baseVolatility * 1.65; // 95% confidence
    });

    // Portfolio VaR (assuming some correlation)
    const totalVaR = Math.sqrt(
      volatilities.reduce((sum, vol) => sum + vol * vol, 0)
    ) * 0.8; // Correlation adjustment

    return totalVaR;
  }

  /**
   * Calculate Sharpe ratio based on recent performance
   */
  private async calculateSharpeRatio(): Promise<number> {
    // Simplified calculation - in real app would use historical performance
    const recentPnL = [120, -50, 80, 200, -30, 150, -20, 90]; // Mock recent daily P&L
    const avgReturn = recentPnL.reduce((sum, pnl) => sum + pnl, 0) / recentPnL.length;
    const stdDev = Math.sqrt(
      recentPnL.reduce((sum, pnl) => sum + Math.pow(pnl - avgReturn, 2), 0) / recentPnL.length
    );

    return stdDev === 0 ? 0 : avgReturn / stdDev;
  }

  /**
   * Check for risk alerts and generate warnings
   */
  private checkRiskAlerts(metrics: RiskMetrics, positionRisks: PositionRisk[]): void {
    const alerts: RiskAlert[] = [];

    // High risk score alert
    if (metrics.riskScore > 80) {
      alerts.push({
        id: `risk-score-${Date.now()}`,
        type: 'danger',
        title: 'High Risk Score',
        message: `Your risk score is ${metrics.riskScore}/100. Consider reducing position sizes.`,
        timestamp: new Date(),
        priority: 'high',
        actionRequired: true,
      });
    }

    // Margin level alert
    if (metrics.marginLevel < this.riskSettings.marginCallLevel) {
      alerts.push({
        id: `margin-call-${Date.now()}`,
        type: 'danger',
        title: 'Margin Call Warning',
        message: `Margin level at ${metrics.marginLevel.toFixed(1)}%. Add funds or close positions.`,
        timestamp: new Date(),
        priority: 'critical',
        actionRequired: true,
      });
    }

    // High exposure alert
    if (metrics.exposurePercent > 80) {
      alerts.push({
        id: `exposure-${Date.now()}`,
        type: 'warning',
        title: 'High Market Exposure',
        message: `${metrics.exposurePercent.toFixed(1)}% of account exposed. Consider diversification.`,
        timestamp: new Date(),
        priority: 'medium',
        actionRequired: false,
      });
    }

    // Individual position risk alerts
    positionRisks.forEach(risk => {
      if (risk.riskPercent > this.riskSettings.maxRiskPerTrade) {
        alerts.push({
          id: `position-risk-${risk.id}`,
          type: 'warning',
          title: 'Position Risk Exceeded',
          message: `${risk.symbol} position risking ${risk.riskPercent.toFixed(1)}% of account.`,
          timestamp: new Date(),
          priority: 'medium',
          actionRequired: true,
        });
      }
    });

    // Update alerts (keep only recent ones)
    this.riskAlerts = [...alerts, ...this.riskAlerts.slice(0, 10)];
  }

  /**
   * Get current risk alerts
   */
  getRiskAlerts(): RiskAlert[] {
    return this.riskAlerts;
  }

  /**
   * Get risk settings
   */
  getRiskSettings(): RiskSettings {
    return { ...this.riskSettings };
  }

  /**
   * Update risk settings
   */
  updateRiskSettings(settings: Partial<RiskSettings>): void {
    this.riskSettings = { ...this.riskSettings, ...settings };
  }

  /**
   * Subscribe to risk metrics updates
   */
  subscribe(callback: (metrics: RiskMetrics) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Calculate recommended position size based on risk management rules
   */
  calculateRecommendedPositionSize(accountBalance: number, riskPercent: number = 2): number {
    return (accountBalance * riskPercent) / 100;
  }

  // Helper methods
  private async getCurrentPrice(symbol: string): Promise<number> {
    const pairs = await marketDataService.getCurrencyPairs();
    const pair = pairs.find(p => p.symbol === symbol);
    return pair?.price || 1.0;
  }

  private calculateDrawdown(balance: number, unrealizedPnL: number): number {
    // Simplified drawdown calculation
    const equity = balance + unrealizedPnL;
    const highWaterMark = balance; // In real app, track historical high
    return Math.max(0, ((highWaterMark - equity) / highWaterMark) * 100);
  }

  private async getMaxDrawdown(): Promise<number> {
    // Mock historical max drawdown
    return 8.5;
  }

  private calculateRiskRewardRatio(entryPrice: number, stopLoss?: number, takeProfit?: number, type: 'buy' | 'sell' = 'buy'): number {
    if (!stopLoss || !takeProfit) return 0;

    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);

    return risk === 0 ? 0 : reward / risk;
  }

  private calculateCorrelationRisk(positionRisks: PositionRisk[]): number {
    // Simplified correlation risk - check for same currency exposure
    const currencies = new Set();
    positionRisks.forEach(risk => {
      const [base, quote] = risk.symbol.split('/');
      currencies.add(base);
      currencies.add(quote);
    });

    // Higher score for more currency concentration
    return Math.min((positionRisks.length - currencies.size + 1) * 2, 10);
  }

  private getAssetVolatility(symbol: string): number {
    // Mock volatility data - in real app would come from market data
    const volatilities: { [key: string]: number } = {
      'EUR/USD': 0.8,
      'GBP/USD': 1.2,
      'USD/JPY': 0.9,
      'USD/CHF': 0.7,
      'AUD/USD': 1.1,
      'USD/CAD': 0.8,
      'NZD/USD': 1.3,
      'EUR/GBP': 0.6,
    };

    return volatilities[symbol] || 1.0;
  }

  private calculateMaxAllowedLeverage(accountSummary: any): number {
    const marginLevel = accountSummary.marginLevel;
    if (marginLevel > 200) return 100;
    if (marginLevel > 150) return 50;
    if (marginLevel > 100) return 30;
    return 10; // Conservative leverage for low margin levels
  }

  private notifyListeners(metrics: RiskMetrics): void {
    this.listeners.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('Error in risk metrics listener:', error);
      }
    });
  }
}

export const riskManagementService = new RiskManagementService();
