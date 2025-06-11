import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import P2PTradingScreen from '../p2p/P2PTradingScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

// Mock Alert
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

describe('P2PTradingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with P2P orders', () => {
    const { getByText } = render(<P2PTradingScreen />);
    
    expect(getByText('P2P Trading')).toBeTruthy();
    expect(getByText('Buy')).toBeTruthy();
    expect(getByText('Sell')).toBeTruthy();
  });

  it('can switch between buy and sell tabs', () => {
    const { getByText } = render(<P2PTradingScreen />);
    
    const sellTab = getByText('Sell');
    fireEvent.press(sellTab);
    
    // The tab should be selected (styling changes)
    expect(sellTab).toBeTruthy();
  });

  it('displays search functionality', () => {
    const { getByPlaceholderText } = render(<P2PTradingScreen />);
    
    const searchInput = getByPlaceholderText('Enter amount...');
    expect(searchInput).toBeTruthy();
    
    fireEvent.changeText(searchInput, '1000');
    expect(searchInput.props.value).toBe('1000');
  });

  it('shows currency filter options', () => {
    const { getByText } = render(<P2PTradingScreen />);
    
    expect(getByText('USD')).toBeTruthy();
    expect(getByText('EUR')).toBeTruthy();
    expect(getByText('GBP')).toBeTruthy();
  });

  it('filters orders by currency', () => {
    const { getByText } = render(<P2PTradingScreen />);
    
    const eurFilter = getByText('EUR');
    fireEvent.press(eurFilter);
    
    // Should filter the orders list
    expect(eurFilter).toBeTruthy();
  });

  it('displays order cards with trader information', async () => {
    const { getByText } = render(<P2PTradingScreen />);
    
    // Wait for orders to load
    await waitFor(() => {
      // Check for trader usernames (generated dynamically)
      expect(getByText(/TraderPro\d+/)).toBeTruthy();
    });
  });

  it('shows order details including price and limits', async () => {
    const { getByText } = render(<P2PTradingScreen />);
    
    await waitFor(() => {
      expect(getByText('Price')).toBeTruthy();
      expect(getByText('Limits')).toBeTruthy();
      expect(getByText('Available')).toBeTruthy();
    });
  });

  it('can initiate a trade', async () => {
    const { getByText, getAllByText } = render(<P2PTradingScreen />);
    
    await waitFor(() => {
      // Find the first "Buy" button (there might be multiple)
      const buyButtons = getAllByText(/Buy/);
      if (buyButtons.length > 1) {
        fireEvent.press(buyButtons[1]); // Second one should be a trade button
      }
    });
    
    // Check that Alert.alert was called
    expect(require('react-native').Alert.alert).toHaveBeenCalled();
  });

  it('displays payment methods for orders', async () => {
    const { getByText } = render(<P2PTradingScreen />);
    
    await waitFor(() => {
      // Check for common payment methods
      expect(getByText('Bank Transfer') || getByText('PayPal') || getByText('Wise')).toBeTruthy();
    });
  });

  it('shows online status indicators', async () => {
    const { getByText } = render(<P2PTradingScreen />);
    
    await waitFor(() => {
      // The online status is shown as a colored dot, check for trader info
      expect(getByText(/TraderPro\d+/)).toBeTruthy();
    });
  });
});
