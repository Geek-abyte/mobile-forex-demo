import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing } from '../../theme';
import { tradingService, TradeRequest, Position } from '../../services/tradingService';
import { enhancedTradingService } from '../../services/enhancedTradingService';
import TradingViewProfessionalChart, { CandlestickData } from '../../components/organisms/TradingViewProfessionalChart';
import { tradingViewDataService } from '../../services/tradingViewDataService';
import { MainStackParamList } from '../../navigation/MainNavigator';
import TutorialHelpButton from '../../components/molecules/TutorialHelpButton';

const { width, height } = Dimensions.get('window');

// Layout constants
const HEADER_HEIGHT = 60;
const SIDE_PANEL_WIDTH = width * 0.85; // 85% of screen width
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 83 : 60; // Account for safe area on iOS

interface PriceData {
  [symbol: string]: {
    bid: number;
    ask: number;
    spread: number;
    change: number;
  };
}

type ActivePanel = 'trade' | 'positions' | 'orders' | null;

const TradingScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  
  // Trading state
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [tradeSize, setTradeSize] = useState('1000');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [leverage, setLeverage] = useState('100');
  
  // Data state
  const [positions, setPositions] = useState<Position[]>([]);
  const [priceData, setPriceData] = useState<PriceData>({});
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [timeframe, setTimeframe] = useState('1h');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  
  // UI state
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [showPairSelector, setShowPairSelector] = useState(false);
  
  // Animations
  const sidePanelAnimation = useRef(new Animated.Value(-SIDE_PANEL_WIDTH)).current;

  // Popular currency pairs
  const currencyPairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
    'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP'
  ];

  // Timeframe options
  const timeframes = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1d', value: '1d' },
  ];

  // Side panel animation helpers
  const toggleSidePanel = (panel: ActivePanel) => {
    if (activePanel === panel) {
      // Close current panel
      setActivePanel(null);
      Animated.timing(sidePanelAnimation, {
        toValue: -SIDE_PANEL_WIDTH,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Open new panel
      setActivePanel(panel);
      Animated.timing(sidePanelAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const closeSidePanel = () => {
    setActivePanel(null);
    Animated.timing(sidePanelAnimation, {
      toValue: -SIDE_PANEL_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Helper function to convert timeframe to milliseconds
  const getTimeframeMs = (tf: string): number => {
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

  useEffect(() => {
    loadPositions();
    const priceCleanup = startPriceUpdates();
    generateInitialChartData();
    
    return () => {
      priceCleanup();
    };
  }, []);

  useEffect(() => {
    // Update chart when pair changes
    generateInitialChartData();
    
    // Start real-time chart updates for selected pair
    const chartCleanup = tradingViewDataService.subscribeToRealTimeData(
      selectedPair,
      (newCandle: CandlestickData) => {
        setChartData(prevData => {
          const updatedData = [...prevData];
          const lastIndex = updatedData.length - 1;
          
          // Update the last candle or add new one based on timeframe
          const timeDiff = (newCandle.time * 1000) - ((updatedData[lastIndex]?.time || 0) * 1000);
          const timeframeMs = getTimeframeMs(timeframe);
          
          if (timeDiff < timeframeMs && updatedData.length > 0) {
            // Update current candle
            updatedData[lastIndex] = {
              ...updatedData[lastIndex],
              high: Math.max(updatedData[lastIndex].high, newCandle.close),
              low: Math.min(updatedData[lastIndex].low, newCandle.close),
              close: newCandle.close,
              volume: (updatedData[lastIndex].volume || 0) + (newCandle.volume || 0),
            };
          } else {
            // Add new candle and keep only last 100
            updatedData.push(newCandle);
            return updatedData.slice(-100);
          }
          
          return updatedData;
        });
        
        // Update current price
        setCurrentPrice(newCandle.close);
      }
    );
    
    return chartCleanup;
  }, [selectedPair, timeframe]);

  const loadPositions = async () => {
    try {
      const positionsData = await enhancedTradingService.getPositions();
      setPositions(positionsData);
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  const generateInitialChartData = async () => {
    try {
      setIsLoading(true);
      
      // Get historical data from TradingView
      const historicalData = await tradingViewDataService.getHistoricalData(selectedPair, timeframe, 100);
      
      console.log('TradingView historical data:', historicalData.slice(0, 3)); // Debug log
      console.log('Total data points:', historicalData.length);
      
      if (historicalData && historicalData.length > 0) {
        setChartData(historicalData);
        setCurrentPrice(historicalData[historicalData.length - 1].close);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
      // Generate fallback data if API fails
      const fallbackData = generateFallbackChartData();
      setChartData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackChartData = (): CandlestickData[] => {
    const basePrice = getBasePriceForPair(selectedPair);
    const data: CandlestickData[] = [];
    const now = Math.floor(Date.now() / 1000);
    let currentPrice = basePrice;
    
    for (let i = 100; i >= 0; i--) {
      const time = now - (i * 3600); // 1 hour intervals
      
      // Generate realistic OHLC data
      const change = (Math.random() - 0.5) * 0.01; // ±0.5% max change
      const open = currentPrice;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.003);
      const low = Math.min(open, close) * (1 - Math.random() * 0.003);
      
      data.push({
        time,
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 1000000),
      });
      
      currentPrice = close;
    }
    
    return data;
  };

  const getBasePriceForPair = (pair: string): number => {
    const basePrices: { [key: string]: number } = {
      'EUR/USD': 1.0845,
      'GBP/USD': 1.2734,
      'USD/JPY': 149.87,
      'AUD/USD': 0.6578,
      'USD/CHF': 0.8923,
      'USD/CAD': 1.3542,
      'NZD/USD': 0.6123,
      'EUR/GBP': 0.8801,
    };
    return basePrices[pair] || 1.0;
  };

  const startPriceUpdates = () => {
    // Simulate real-time price updates for pricing display
    const interval = setInterval(async () => {
      const newPriceData: PriceData = {};
      
      for (const pair of currencyPairs) {
        try {
          const current = await tradingViewDataService.getCurrentPrice(pair);
          const spread = current * 0.0001; // Typical forex spread
          
          newPriceData[pair] = {
            bid: current - spread / 2,
            ask: current + spread / 2,
            spread: spread,
            change: Math.random() * 4 - 2, // ±2% change simulation
          };
        } catch (error) {
          // Fallback pricing if API fails
          const basePrice = getBasePriceForPair(pair);
          const spread = basePrice * 0.0001;
          
          newPriceData[pair] = {
            bid: basePrice - spread / 2,
            ask: basePrice + spread / 2,
            spread: spread,
            change: Math.random() * 4 - 2,
          };
        }
      }
      
      setPriceData(newPriceData);
      
      // Update current price for selected pair
      if (newPriceData[selectedPair]) {
        setCurrentPrice(newPriceData[selectedPair].bid);
      }
    }, 5000); // Update every 5 seconds to avoid hitting API limits

    return () => clearInterval(interval);
  };

  const handleTrade = async () => {
    if (!tradeSize || parseFloat(tradeSize) <= 0) {
      Alert.alert('Invalid Trade Size', 'Please enter a valid trade size');
      return;
    }

    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      Alert.alert('Invalid Limit Price', 'Please enter a valid limit price');
      return;
    }

    setIsLoading(true);

    try {
      const tradeRequest: TradeRequest = {
        symbol: selectedPair,
        type: tradeType,
        orderType,
        size: parseFloat(tradeSize),
        price: limitPrice ? parseFloat(limitPrice) : undefined,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        leverage: parseFloat(leverage),
      };

      if (orderType === 'market') {
        const currentMarketPrice = priceData[selectedPair] 
          ? (tradeType === 'buy' ? priceData[selectedPair].ask : priceData[selectedPair].bid)
          : currentPrice;

        const result = await enhancedTradingService.executeMarketOrder(tradeRequest, currentMarketPrice);
        Alert.alert('Trade Executed', `Market order executed successfully. Position ID: ${result.id}`);
      } else {
        const result = await enhancedTradingService.placeLimitOrder(tradeRequest);
        Alert.alert('Order Placed', `Limit order placed successfully. Order ID: ${result.id}`);
      }
      
      await loadPositions();
      
      // Reset form
      setTradeSize('1000');
      setLimitPrice('');
      setStopLoss('');
      setTakeProfit('');
      
      // Close panel after successful trade
      closeSidePanel();
    } catch (error) {
      console.error('Trade execution error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to execute trade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePosition = async (positionId: string) => {
    try {
      const position = positions.find(p => p.id === positionId);
      if (!position) {
        Alert.alert('Error', 'Position not found');
        return;
      }

      const currentMarketPrice = priceData[position.symbol] 
        ? (position.type === 'buy' ? priceData[position.symbol].bid : priceData[position.symbol].ask)
        : position.currentPrice;

      await enhancedTradingService.closePosition(positionId, currentMarketPrice);
      await loadPositions();
      Alert.alert('Position Closed', 'Position closed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to close position');
    }
  };

  const formatPrice = (price: number) => price.toFixed(5);
  const formatPnL = (pnl: number) => `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}`;

  // Render functions for side panels
  const renderTradePanel = () => (
    <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Place Order</Text>
        <TouchableOpacity onPress={closeSidePanel}>
          <Ionicons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Trade Type Toggle */}
      <View style={styles.tradeTypeContainer}>
        <TouchableOpacity
          style={[
            styles.tradeTypeButton,
            tradeType === 'buy' ? styles.buyButton : styles.inactiveButton,
          ]}
          onPress={() => setTradeType('buy')}
        >
          <Text style={[
            styles.tradeTypeText,
            tradeType === 'buy' ? styles.buyButtonText : styles.inactiveButtonText,
          ]}>
            BUY
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tradeTypeButton,
            tradeType === 'sell' ? styles.sellButton : styles.inactiveButton,
          ]}
          onPress={() => setTradeType('sell')}
        >
          <Text style={[
            styles.tradeTypeText,
            tradeType === 'sell' ? styles.sellButtonText : styles.inactiveButtonText,
          ]}>
            SELL
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current Price Display */}
      {priceData[selectedPair] && (
        <View style={styles.priceDisplay}>
          <Text style={styles.priceDisplayLabel}>Current Price</Text>
          <Text style={styles.priceDisplayValue}>
            {formatPrice(tradeType === 'buy' ? priceData[selectedPair].ask : priceData[selectedPair].bid)}
          </Text>
        </View>
      )}

      {/* Order Type */}
      <View style={styles.orderTypeContainer}>
        <TouchableOpacity
          style={[
            styles.orderTypeButton,
            orderType === 'market' && styles.orderTypeButtonActive,
          ]}
          onPress={() => setOrderType('market')}
        >
          <Text style={[
            styles.orderTypeText,
            orderType === 'market' && styles.orderTypeTextActive,
          ]}>
            Market
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.orderTypeButton,
            orderType === 'limit' && styles.orderTypeButtonActive,
          ]}
          onPress={() => setOrderType('limit')}
        >
          <Text style={[
            styles.orderTypeText,
            orderType === 'limit' && styles.orderTypeTextActive,
          ]}>
            Limit
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trade Size */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Trade Size</Text>
        <TextInput
          style={styles.input}
          value={tradeSize}
          onChangeText={setTradeSize}
          placeholder="Enter trade size"
          placeholderTextColor={colors.text.tertiary}
          keyboardType="numeric"
        />
      </View>

      {/* Limit Price (conditional) */}
      {orderType === 'limit' && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Limit Price</Text>
          <TextInput
            style={styles.input}
            value={limitPrice}
            onChangeText={setLimitPrice}
            placeholder="Enter limit price"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
          />
        </View>
      )}

      {/* Stop Loss & Take Profit */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing[2] }]}>
          <Text style={styles.inputLabel}>Stop Loss</Text>
          <TextInput
            style={styles.input}
            value={stopLoss}
            onChangeText={setStopLoss}
            placeholder="Optional"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing[2] }]}>
          <Text style={styles.inputLabel}>Take Profit</Text>
          <TextInput
            style={styles.input}
            value={takeProfit}
            onChangeText={setTakeProfit}
            placeholder="Optional"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          tradeType === 'buy' ? styles.buyButton : styles.sellButton,
          isLoading && styles.disabledButton
        ]}
        onPress={handleTrade}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Processing...' : `${tradeType.toUpperCase()} ${selectedPair}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPositionsPanel = () => (
    <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Open Positions ({positions.length})</Text>
        <TouchableOpacity onPress={closeSidePanel}>
          <Ionicons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {positions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No open positions</Text>
        </View>
      ) : (
        positions.map((position) => (
          <View key={position.id} style={styles.positionCard}>
            <View style={styles.positionHeader}>
              <Text style={styles.positionSymbol}>{position.symbol}</Text>
              <Text style={[
                styles.positionType,
                position.type === 'buy' ? styles.buyText : styles.sellText
              ]}>
                {position.type.toUpperCase()}
              </Text>
            </View>
            <View style={styles.positionDetails}>
              <Text style={styles.positionDetail}>
                Size: {position.size.toFixed(0)} | Entry: {formatPrice(position.entryPrice)}
              </Text>
              <Text style={styles.positionDetail}>
                Current: {formatPrice(position.currentPrice)} | 
                P&L: <Text style={position.pnl >= 0 ? styles.profitText : styles.lossText}>
                  {formatPnL(position.pnl)}
                </Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => handleClosePosition(position.id)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderOrdersPanel = () => (
    <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Order History</Text>
        <TouchableOpacity onPress={closeSidePanel}>
          <Ionicons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recent orders</Text>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            closeSidePanel();
            navigation.navigate('OrderHistory');
          }}
        >
          <Text style={styles.secondaryButtonText}>View Full History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.pairSelector}
          onPress={() => setShowPairSelector(true)}
        >
          <Text style={styles.selectedPair}>{selectedPair}</Text>
          <Text style={styles.currentPrice}>
            {priceData[selectedPair] ? formatPrice(priceData[selectedPair].bid) : '---'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
        </TouchableOpacity>

        <View style={styles.headerControls}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.timeframeContainer}
          >
            {timeframes.map((tf) => (
              <TouchableOpacity
                key={tf.value}
                style={[
                  styles.timeframeButton,
                  timeframe === tf.value && styles.timeframeButtonActive,
                ]}
                onPress={() => setTimeframe(tf.value)}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    timeframe === tf.value && styles.timeframeTextActive,
                  ]}
                >
                  {tf.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Chart */}
        <View style={styles.chartContainer}>
          <TradingViewProfessionalChart
            symbol={selectedPair}
            data={chartData}
            height={height - HEADER_HEIGHT - TAB_BAR_HEIGHT}
            theme="dark"
          />
        </View>

        {/* Floating Action Buttons */}
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={[
              styles.fab,
              activePanel === 'trade' && styles.fabActive
            ]}
            onPress={() => toggleSidePanel('trade')}
          >
            <Ionicons 
              name="add" 
              size={24} 
              color={activePanel === 'trade' ? colors.background.primary : colors.text.primary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.fab,
              activePanel === 'positions' && styles.fabActive
            ]}
            onPress={() => toggleSidePanel('positions')}
          >
            <Ionicons 
              name="list" 
              size={24} 
              color={activePanel === 'positions' ? colors.background.primary : colors.text.primary} 
            />
            {positions.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{positions.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.fab,
              activePanel === 'orders' && styles.fabActive
            ]}
            onPress={() => toggleSidePanel('orders')}
          >
            <Ionicons 
              name="time" 
              size={24} 
              color={activePanel === 'orders' ? colors.background.primary : colors.text.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Side Panel */}
        <Animated.View style={[
          styles.sidePanel,
          {
            transform: [{ translateX: sidePanelAnimation }]
          }
        ]}>
          {activePanel === 'trade' && renderTradePanel()}
          {activePanel === 'positions' && renderPositionsPanel()}
          {activePanel === 'orders' && renderOrdersPanel()}
        </Animated.View>

        {/* Side Panel Backdrop */}
        {activePanel && (
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeSidePanel}
          />
        )}
      </View>

      {/* Pair Selector Modal */}
      <Modal
        visible={showPairSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPairSelector(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPairSelector(false)}
        >
          <View style={styles.pairSelectorModal}>
            <Text style={styles.modalTitle}>Select Currency Pair</Text>
            <ScrollView>
              {currencyPairs.map((pair) => (
                <TouchableOpacity
                  key={pair}
                  style={[
                    styles.pairOption,
                    selectedPair === pair && styles.pairOptionActive
                  ]}
                  onPress={() => {
                    setSelectedPair(pair);
                    setShowPairSelector(false);
                  }}
                >
                  <Text style={[
                    styles.pairOptionText,
                    selectedPair === pair && styles.pairOptionTextActive
                  ]}>
                    {pair}
                  </Text>
                  {priceData[pair] && (
                    <Text style={[
                      styles.pairOptionPrice,
                      priceData[pair].change >= 0 ? styles.priceUp : styles.priceDown
                    ]}>
                      {formatPrice(priceData[pair].bid)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Tutorial Help Button */}
      <TutorialHelpButton screenName="Trading" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  
  // Header
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  pairSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    minWidth: 120,
  },
  selectedPair: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginRight: spacing[2],
  },
  currentPrice: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    color: colors.text.secondary,
    marginRight: spacing[2],
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  timeframeContainer: {
    flexDirection: 'row',
    marginLeft: spacing[3],
  },
  timeframeButton: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    marginHorizontal: spacing[1],
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  timeframeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  timeframeTextActive: {
    color: colors.background.primary,
    fontWeight: typography.weights.semibold,
  },

  // Content
  content: {
    flex: 1,
    position: 'relative',
  },
  chartContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Floating Action Buttons
  fabContainer: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    position: 'relative',
  },
  fabActive: {
    backgroundColor: colors.primary[500],
  },
  badge: {
    position: 'absolute',
    top: -spacing[1],
    right: -spacing[1],
    backgroundColor: colors.trading.loss,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.background.primary,
    fontWeight: typography.weights.bold,
  },

  // Side Panel
  sidePanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIDE_PANEL_WIDTH,
    height: '100%',
    backgroundColor: colors.background.secondary,
    borderRightWidth: 1,
    borderRightColor: colors.border.primary,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  panelContent: {
    flex: 1,
    padding: spacing[4],
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  panelTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },

  // Trade Panel
  tradeTypeContainer: {
    flexDirection: 'row',
    marginBottom: spacing[4],
  },
  tradeTypeButton: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: spacing[1],
  },
  buyButton: {
    backgroundColor: colors.trading.profit,
  },
  sellButton: {
    backgroundColor: colors.trading.loss,
  },
  inactiveButton: {
    backgroundColor: colors.background.tertiary,
  },
  tradeTypeText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
  },
  buyButtonText: {
    color: colors.background.primary,
  },
  sellButtonText: {
    color: colors.background.primary,
  },
  inactiveButtonText: {
    color: colors.text.secondary,
  },

  priceDisplay: {
    backgroundColor: colors.background.tertiary,
    padding: spacing[3],
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  priceDisplayLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  priceDisplayValue: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  orderTypeContainer: {
    flexDirection: 'row',
    marginBottom: spacing[4],
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    padding: spacing[1],
  },
  orderTypeButton: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: 6,
  },
  orderTypeButtonActive: {
    backgroundColor: colors.background.primary,
  },
  orderTypeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  orderTypeTextActive: {
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },

  inputGroup: {
    marginBottom: spacing[4],
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    backgroundColor: colors.background.tertiary,
  },

  row: {
    flexDirection: 'row',
    marginBottom: spacing[4],
  },

  submitButton: {
    paddingVertical: spacing[4],
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing[4],
  },
  submitButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.background.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Positions Panel
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },

  positionCard: {
    backgroundColor: colors.background.tertiary,
    padding: spacing[4],
    borderRadius: 8,
    marginBottom: spacing[3],
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  positionSymbol: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  positionType: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  buyText: {
    color: colors.trading.profit,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  sellText: {
    color: colors.trading.loss,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  positionDetails: {
    marginBottom: spacing[3],
  },
  positionDetail: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  profitText: {
    color: colors.trading.profit,
    fontWeight: typography.weights.semibold,
  },
  lossText: {
    color: colors.trading.loss,
    fontWeight: typography.weights.semibold,
  },
  closeButton: {
    backgroundColor: colors.trading.loss,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  closeButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.background.primary,
  },

  secondaryButton: {
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 8,
  },
  secondaryButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pairSelectorModal: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing[4],
    maxHeight: height * 0.7,
    width: width * 0.8,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  pairOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 8,
    marginBottom: spacing[2],
  },
  pairOptionActive: {
    backgroundColor: colors.primary[500],
  },
  pairOptionText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
  },
  pairOptionTextActive: {
    color: colors.background.primary,
    fontWeight: typography.weights.semibold,
  },
  pairOptionPrice: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.medium,
  },
  priceUp: {
    color: colors.trading.profit,
  },
  priceDown: {
    color: colors.trading.loss,
  },
});

export default TradingScreen;
