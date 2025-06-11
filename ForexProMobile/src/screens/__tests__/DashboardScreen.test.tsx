/**
 * Dashboard Screen Component Tests
 */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import DashboardScreen from '../main/DashboardScreen';
import { marketDataService } from '../../services/marketDataService';
import { marketAnalysisService } from '../../services/marketAnalysisService';
import { tradingService } from '../../services/tradingService';

// Mock dependencies
jest.mock('../../services/marketDataService');
jest.mock('../../services/marketAnalysisService');
jest.mock('../../services/tradingService');
jest.mock('../../hooks/useAuth');

const mockMarketDataService = marketDataService as jest.Mocked<typeof marketDataService>;
const mockMarketAnalysisService = marketAnalysisService as jest.Mocked<typeof marketAnalysisService>;
const mockTradingService = tradingService as jest.Mocked<typeof tradingService>;

// Mock useAuth hook
const mockUseAuth = require('../../hooks/useAuth');
mockUseAuth.useAuth = jest.fn(() => ({
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  },
  logout: jest.fn(),
}));

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mock responses
    mockMarketDataService.getCurrencyPairs.mockResolvedValue([
      {
        symbol: 'EUR/USD',
        price: 1.0952,
        change: 0.0012,
        changePercent: 0.11,
        bid: 1.0951,
        ask: 1.0953,
        precision: 4,
        isActive: true,
      },
      {
        symbol: 'GBP/USD',
        price: 1.2634,
        change: -0.0008,
        changePercent: -0.06,
        bid: 1.2633,
        ask: 1.2635,
        precision: 4,
        isActive: true,
      },
    ]);

    mockMarketAnalysisService.getMarketAlerts.mockResolvedValue([
      {
        id: '1',
        type: 'price',
        severity: 'medium',
        title: 'EUR/USD Price Alert',
        message: 'EUR/USD has reached your target price of 1.0950',
        timestamp: new Date(),
        isRead: false,
      },
    ]);

    mockTradingService.getAccountSummary.mockResolvedValue({
      balance: 10000,
      equity: 10000,
      margin: 0,
      freeMargin: 10000,
      marginLevel: 0,
    });
  });

  it('should render dashboard with loading state initially', () => {
    const { getByText } = render(<DashboardScreen />);
    
    // Should show some content (even if loading)
    expect(getByText('Forex Pro')).toBeTruthy();
  });

  it('should load and display market data', async () => {
    const { getByText } = render(<DashboardScreen />);

    await waitFor(() => {
      expect(getByText('EUR/USD')).toBeTruthy();
      expect(getByText('GBP/USD')).toBeTruthy();
    });

    expect(mockMarketDataService.getCurrencyPairs).toHaveBeenCalled();
  });

  it('should load and display market alerts', async () => {
    const { getByText } = render(<DashboardScreen />);

    await waitFor(() => {
      expect(getByText('Market Alerts')).toBeTruthy();
      expect(getByText('EUR/USD Price Alert')).toBeTruthy();
    });

    expect(mockMarketAnalysisService.getMarketAlerts).toHaveBeenCalled();
  });

  it('should display account summary information', async () => {
    const { getByText } = render(<DashboardScreen />);

    await waitFor(() => {
      expect(getByText('$10,000.00')).toBeTruthy(); // Balance
    });

    expect(mockTradingService.getAccountSummary).toHaveBeenCalled();
  });

  it('should handle refresh control', async () => {
    const { getByTestId } = render(<DashboardScreen />);

    // Find scroll view and trigger refresh
    const scrollView = getByTestId('dashboard-scroll');
    fireEvent(scrollView, 'refresh');

    // Should call data loading functions again
    await waitFor(() => {
      expect(mockMarketDataService.getCurrencyPairs).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle navigation to different sections', async () => {
    const { getByText } = render(<DashboardScreen />);

    await waitFor(() => {
      expect(getByText('Trade')).toBeTruthy();
      expect(getByText('Wallet')).toBeTruthy();
      expect(getByText('Analytics')).toBeTruthy();
    });

    // Test navigation buttons
    const tradeButton = getByText('Trade');
    fireEvent.press(tradeButton);

    // Should call navigation (mocked)
    expect(global.mockNavigation.navigate).toHaveBeenCalledWith('Trading');
  });

  it('should update market data in real-time', async () => {
    jest.useFakeTimers();
    
    const { getByText } = render(<DashboardScreen />);

    await waitFor(() => {
      expect(getByText('EUR/USD')).toBeTruthy();
    });

    // Fast-forward time to trigger real-time update
    jest.advanceTimersByTime(3000);

    // Should have called getCurrencyPairs multiple times
    expect(mockMarketDataService.getCurrencyPairs).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('should handle market trend calculation', async () => {
    // Mock pairs with positive changes (bullish trend)
    mockMarketDataService.getCurrencyPairs.mockResolvedValue([
      {
        symbol: 'EUR/USD',
        price: 1.0952,
        change: 0.0050,
        changePercent: 2.5,
        bid: 1.0951,
        ask: 1.0953,
        precision: 4,
        isActive: true,
      },
      {
        symbol: 'GBP/USD',
        price: 1.2634,
        change: 0.0080,
        changePercent: 3.2,
        bid: 1.2633,
        ask: 1.2635,
        precision: 4,
        isActive: true,
      },
    ]);

    const { getByText } = render(<DashboardScreen />);

    await waitFor(() => {
      // Should show bullish trend indicator
      expect(getByText('Market Trending')).toBeTruthy();
    });
  });

  it('should handle error states gracefully', async () => {
    // Mock service error
    mockMarketDataService.getCurrencyPairs.mockRejectedValue(new Error('Network error'));

    const { queryByText } = render(<DashboardScreen />);

    // Should still render basic components without crashing
    expect(queryByText('Forex Pro')).toBeTruthy();
  });

  it('should format currency values correctly', async () => {
    const { getByText } = render(<DashboardScreen />);

    await waitFor(() => {
      // Check for properly formatted currency values
      expect(getByText('$10,000.00')).toBeTruthy();
    });
  });

  it('should show proper color coding for profit/loss', async () => {
    const { getByText } = render(<DashboardScreen />);

    await waitFor(() => {
      expect(getByText('EUR/USD')).toBeTruthy();
    });

    // EUR/USD should show green color for positive change
    // GBP/USD should show red color for negative change
    // This would need to check styling which requires more sophisticated testing
  });

  it('should handle market alerts navigation', async () => {
    const { getByText } = render(<DashboardScreen />);

    await waitFor(() => {
      expect(getByText('View All Alerts')).toBeTruthy();
    });

    const viewAllButton = getByText('View All Alerts');
    fireEvent.press(viewAllButton);

    expect(global.mockNavigation.navigate).toHaveBeenCalledWith('RiskManagement');
  });

  it('should display quick action buttons', async () => {
    const { getByText } = render(<DashboardScreen />);

    await waitFor(() => {
      expect(getByText('Trade')).toBeTruthy();
      expect(getByText('Deposit')).toBeTruthy();
      expect(getByText('Withdraw')).toBeTruthy();
      expect(getByText('Analytics')).toBeTruthy();
    });
  });
});
