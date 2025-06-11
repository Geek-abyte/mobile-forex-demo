/**
 * Risk Management Service Tests
 */
import { riskManagementService } from '../riskManagementService';
import { tradingService } from '../tradingService';
import type { RiskAlert } from '../riskManagementService';

// Mock dependencies
jest.mock('../tradingService');
jest.mock('../marketDataService');

const mockTradingService = tradingService as jest.Mocked<typeof tradingService>;

describe('RiskManagementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRiskMetrics', () => {
    it('should calculate risk metrics correctly', async () => {
      // Mock account summary
      const mockAccountSummary = {
        balance: 10000,
        equity: 9750,
        margin: 1250,
        freeMargin: 8500,
        marginLevel: 780,
      };

      // Mock positions
      const mockPositions = [
        {
          id: 'pos1',
          symbol: 'EUR/USD',
          type: 'buy' as const,
          size: 0.1,
          entryPrice: 1.0950,
          currentPrice: 1.0948,
          leverage: 100,
          margin: 109.48,
          stopLoss: 1.0900,
          takeProfit: 1.1000,
          pnl: -2.0,
          pnlPercent: -1.8,
          swap: 0,
          commission: 0.1,
          openTime: new Date().toISOString(),
          status: 'open' as const,
          isDemo: true,
        },
      ];

      mockTradingService.getAccountSummary.mockResolvedValue(mockAccountSummary);
      mockTradingService.getPositions.mockResolvedValue(mockPositions);

      const result = await riskManagementService.getRiskMetrics();

      expect(result).toMatchObject({
        accountBalance: 10000,
        equity: expect.any(Number),
        usedMargin: 1250,
        freeMargin: 8500,
        marginLevel: 780,
        riskScore: expect.any(Number),
        exposurePercent: expect.any(Number),
        dailyVaR: expect.any(Number),
        sharpeRatio: expect.any(Number),
        maxLeverage: expect.any(Number),
        recommendedPositionSize: expect.any(Number),
      });

      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });

    it('should handle empty positions', async () => {
      const mockAccountSummary = {
        balance: 10000,
        equity: 10000,
        margin: 0,
        freeMargin: 10000,
        marginLevel: 0,
      };

      mockTradingService.getAccountSummary.mockResolvedValue(mockAccountSummary);
      mockTradingService.getPositions.mockResolvedValue([]);

      const result = await riskManagementService.getRiskMetrics();

      expect(result.exposurePercent).toBe(0);
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle service errors gracefully', async () => {
      mockTradingService.getAccountSummary.mockRejectedValue(new Error('Service error'));

      await expect(riskManagementService.getRiskMetrics()).rejects.toThrow('Service error');
    });
  });

  describe('calculatePositionRisk', () => {
    it('should calculate position risk correctly for buy position', async () => {
      const mockPosition = {
        id: 'pos1',
        symbol: 'EUR/USD',
        type: 'buy' as const,
        size: 0.1,
        entryPrice: 1.0950,
        leverage: 100,
        stopLoss: 1.0900,
        takeProfit: 1.1000,
      };

      const mockAccountSummary = {
        balance: 10000,
        equity: 10000,
        margin: 0,
        freeMargin: 10000,
        marginLevel: 0,
      };

      mockTradingService.getAccountSummary.mockResolvedValue(mockAccountSummary);

      const result = await riskManagementService.calculatePositionRisk(mockPosition);

      expect(result).toMatchObject({
        id: 'pos1',
        symbol: 'EUR/USD',
        type: 'buy',
        size: 0.1,
        entryPrice: 1.0950,
        leverage: 100,
        stopLoss: 1.0900,
        takeProfit: 1.1000,
        riskAmount: expect.any(Number),
        riskPercent: expect.any(Number),
        unrealizedPnL: expect.any(Number),
        riskRewardRatio: expect.any(Number),
      });

      expect(result.riskPercent).toBeGreaterThanOrEqual(0);
      expect(result.riskRewardRatio).toBeGreaterThan(0); // Should have positive risk/reward
    });

    it('should calculate position risk correctly for sell position', async () => {
      const mockPosition = {
        id: 'pos2',
        symbol: 'GBP/USD',
        type: 'sell' as const,
        size: 0.05,
        entryPrice: 1.2650,
        leverage: 100,
        stopLoss: 1.2700,
        takeProfit: 1.2600,
      };

      const mockAccountSummary = {
        balance: 10000,
        equity: 10000,
        margin: 0,
        freeMargin: 10000,
        marginLevel: 0,
      };

      mockTradingService.getAccountSummary.mockResolvedValue(mockAccountSummary);

      const result = await riskManagementService.calculatePositionRisk(mockPosition);

      expect(result.type).toBe('sell');
      expect(result.riskAmount).toBeGreaterThan(0);
      expect(result.riskPercent).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Risk Settings Management', () => {
    it('should return default risk settings', () => {
      const settings = riskManagementService.getRiskSettings();

      expect(settings).toMatchObject({
        maxRiskPerTrade: expect.any(Number),
        maxDailyLoss: expect.any(Number),
        maxDrawdown: expect.any(Number),
        marginCallLevel: expect.any(Number),
        stopOutLevel: expect.any(Number),
        allowOvernight: expect.any(Boolean),
        maxPositions: expect.any(Number),
        riskAlerts: expect.any(Boolean),
      });
    });

    it('should update risk settings', () => {
      const newSettings = {
        maxRiskPerTrade: 1.5,
        maxDailyLoss: 3.0,
      };

      riskManagementService.updateRiskSettings(newSettings);
      const updatedSettings = riskManagementService.getRiskSettings();

      expect(updatedSettings.maxRiskPerTrade).toBe(1.5);
      expect(updatedSettings.maxDailyLoss).toBe(3.0);
    });
  });

  describe('Position Size Calculator', () => {
    it('should calculate recommended position size', () => {
      const accountBalance = 10000;
      const riskPercent = 2;

      const result = riskManagementService.calculateRecommendedPositionSize(accountBalance, riskPercent);

      expect(result).toBe(200); // 2% of 10000
    });

    it('should use default risk percent if not provided', () => {
      const accountBalance = 10000;

      const result = riskManagementService.calculateRecommendedPositionSize(accountBalance);

      expect(result).toBe(200); // Default 2% of 10000
    });
  });

  describe('Risk Alerts', () => {
    it('should return empty alerts initially', () => {
      const alerts = riskManagementService.getRiskAlerts();

      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should generate alerts after risk calculation', async () => {
      // Set up high-risk scenario
      const mockAccountSummary = {
        balance: 1000, // Small balance
        equity: 800,   // Losing equity
        margin: 500,   // High margin usage
        freeMargin: 300,
        marginLevel: 160, // Low margin level
      };

      const mockPositions = [
        {
          id: 'pos1',
          symbol: 'EUR/USD',
          type: 'buy' as const,
          size: 1.0, // Large position
          entryPrice: 1.0950,
          currentPrice: 1.0850, // Losing position
          leverage: 100,
          margin: 500,
          pnl: -100,
          pnlPercent: -20,
          swap: 0,
          commission: 1.0,
          openTime: new Date().toISOString(),
          status: 'open' as const,
          isDemo: true,
        },
      ];

      mockTradingService.getAccountSummary.mockResolvedValue(mockAccountSummary);
      mockTradingService.getPositions.mockResolvedValue(mockPositions);

      await riskManagementService.getRiskMetrics();
      
      const alerts = riskManagementService.getRiskAlerts();

      expect(alerts.length).toBeGreaterThan(0);
      
      // Should have some high priority alerts
      const highPriorityAlerts = alerts.filter((alert: RiskAlert) => 
        alert.priority === 'high' || alert.priority === 'critical'
      );
      expect(highPriorityAlerts.length).toBeGreaterThan(0);
    });
  });

  describe('Real-time Updates', () => {
    it('should allow subscription to risk metrics updates', () => {
      const mockCallback = jest.fn();

      const unsubscribe = riskManagementService.subscribe(mockCallback);

      expect(typeof unsubscribe).toBe('function');

      // Cleanup
      unsubscribe();
    });

    it('should notify subscribers on metrics update', async () => {
      const mockCallback = jest.fn();
      
      const unsubscribe = riskManagementService.subscribe(mockCallback);

      const mockAccountSummary = {
        balance: 10000,
        equity: 9750,
        margin: 1250,
        freeMargin: 8500,
        marginLevel: 780,
      };

      mockTradingService.getAccountSummary.mockResolvedValue(mockAccountSummary);
      mockTradingService.getPositions.mockResolvedValue([]);

      await riskManagementService.getRiskMetrics();

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          accountBalance: 10000,
          equity: expect.any(Number),
        })
      );

      unsubscribe();
    });
  });
});
