import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing } from '../../theme';
import { tradingService, TradeRequest, Position } from '../../services/tradingService';
import { enhancedTradingService } from '../../services/enhancedTradingService';
import { marketDataService } from '../../services/marketDataService';
import TradingViewProfessionalChart, { CandlestickData } from '../../components/organisms/TradingViewProfessionalChart';
import { realisticMarketSimulation } from '../../services/realisticMarketSimulation';
import { MainStackParamList, MainTabParamList } from '../../navigation/MainNavigator';

const { width } = Dimensions.get('window');

interface PriceData {
  [symbol: string]: {
    bid: number;
    ask: number;
    spread: number;
    change: number;
  };
}

const TradingScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'Trading'>>();
  
  // Get navigation parameters
  const initialSymbol = route.params?.symbol || 'EUR/USD';
  const initialTradeType = route.params?.type || 'buy';
  
  const [selectedPair, setSelectedPair] = useState(initialSymbol);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>(initialTradeType);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [tradeSize, setTradeSize] = useState('1000');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [leverage, setLeverage] = useState('100');
  const [positions, setPositions] = useState<Position[]>([]);
  const [priceData, setPriceData] = useState<PriceData>({});
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [timeframe, setTimeframe] = useState('1h');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [activePanelTab, setActivePanelTab] = useState<'analysis' | 'settings' | 'orders'>('analysis');
  const slideAnimation = useRef(new Animated.Value(0)).current;

  // Popular currency pairs
  const currencyPairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
    'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP'
  ];

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

  const toggleSidePanel = () => {
    if (showSidePanel) {
      // Close panel
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowSidePanel(false));
    } else {
      // Open panel
      setShowSidePanel(true);
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
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
    const chartCleanup = realisticMarketSimulation.subscribeToRealTimeData(
      selectedPair,
      (newCandle: any) => {
        setChartData(prevData => {
          const updatedData = [...prevData];
          const lastIndex = updatedData.length - 1;
          
          // Update the last candle or add new one based on timeframe
          const timeDiff = newCandle.timestamp - (updatedData[lastIndex]?.time || 0);
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
            // Add new candle and keep only last 50
            updatedData.push({
              time: Math.floor(newCandle.timestamp / 1000), // Convert to seconds for TradingView
              open: newCandle.close,
              high: newCandle.close,
              low: newCandle.close,
              close: newCandle.close,
              volume: newCandle.volume || 0,
            });
            return updatedData.slice(-50);
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

  const generateInitialChartData = () => {
    // Generate historical candlestick data
    const historicalData = realisticMarketSimulation.generateHistoricalData(selectedPair, timeframe, 50);
    
    // Convert data format from simulation service to TradingView format
    const convertedData: CandlestickData[] = historicalData.map(candle => ({
      time: Math.floor(candle.timestamp / 1000), // Convert to seconds for TradingView
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
    }));
    
    console.log('Generated chart data:', convertedData.length, 'candles');
    console.log('Sample data:', convertedData.slice(-3)); // Log last 3 candles
    
    setChartData(convertedData);
    
    // Set current price from latest data
    if (convertedData.length > 0) {
      setCurrentPrice(convertedData[convertedData.length - 1].close);
    }
  };

  const startPriceUpdates = () => {
    // Simulate real-time price updates
    const interval = setInterval(() => {
      const newPriceData: PriceData = {};
      
      currencyPairs.forEach(pair => {
        const bidAsk = realisticMarketSimulation.getBidAsk(pair);
        const current = realisticMarketSimulation.getCurrentPrice(pair);
        const change = Math.random() * 4 - 2; // ±2% change simulation
        
        newPriceData[pair] = {
          bid: bidAsk.bid,
          ask: bidAsk.ask,
          spread: bidAsk.spread,
          change: change,
        };
      });
      
      setPriceData(newPriceData);
      
      // Update current price for selected pair
      if (newPriceData[selectedPair]) {
        setCurrentPrice(newPriceData[selectedPair].bid);
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const handleTrade = async () => {
    if (!priceData[selectedPair]) {
      Alert.alert('Error', 'Price data not available');
      return;
    }

    setIsLoading(true);
    
    try {
      const currentPrice = tradeType === 'buy' 
        ? priceData[selectedPair].ask 
        : priceData[selectedPair].bid;

      const tradeRequest: TradeRequest = {
        symbol: selectedPair,
        type: tradeType,
        orderType: orderType,
        size: parseFloat(tradeSize),
        price: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        leverage: parseFloat(leverage),
      };

      if (orderType === 'market') {
        await enhancedTradingService.executeMarketOrder(tradeRequest, currentPrice);
        Alert.alert('Success', 'Trade executed successfully!');
      } else {
        await enhancedTradingService.placeLimitOrder(tradeRequest);
        Alert.alert('Success', 'Limit order placed successfully!');
      }

      await loadPositions();
      
      // Reset form
      setTradeSize('1000');
      setLimitPrice('');
      setStopLoss('');
      setTakeProfit('');
      
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to execute trade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePosition = async (positionId: string) => {
    if (!priceData[selectedPair]) return;
    
    try {
      const currentPrice = priceData[selectedPair].bid; // Use bid price for closing
      await enhancedTradingService.closePosition(positionId, currentPrice);
      Alert.alert('Success', 'Position closed successfully!');
      await loadPositions();
    } catch (error) {
      Alert.alert('Error', 'Failed to close position');
    }
  };

  const formatPrice = (price: number) => price.toFixed(5);
  const formatPnL = (pnl: number) => `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trading Terminal</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={toggleSidePanel}
            >
              <Ionicons name="menu-outline" size={20} color={colors.primary[500]} />
              <Text style={styles.headerButtonText}>Panel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('OrderHistory')}
            >
              <Ionicons name="time-outline" size={20} color={colors.primary[500]} />
              <Text style={styles.headerButtonText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('RiskManagement')}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary[500]} />
              <Text style={styles.headerButtonText}>Risk</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Currency Pair Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Currency Pair</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pairSelector}>
            {currencyPairs.map((pair) => (
              <TouchableOpacity
                key={pair}
                style={[
                  styles.pairButton,
                  selectedPair === pair && styles.pairButtonActive
                ]}
                onPress={() => setSelectedPair(pair)}
              >
                <Text style={[
                  styles.pairText,
                  selectedPair === pair && styles.pairTextActive
                ]}>
                  {pair}
                </Text>
                {priceData[pair] && (
                  <Text style={[
                    styles.pairPrice,
                    priceData[pair].change >= 0 ? styles.priceUp : styles.priceDown
                  ]}>
                    {formatPrice(priceData[pair].bid)}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Price Display */}
        {priceData[selectedPair] && (
          <View style={styles.priceSection}>
            <View style={styles.priceCard}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>BID</Text>
                <Text style={styles.priceValue}>{formatPrice(priceData[selectedPair].bid)}</Text>
              </View>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>ASK</Text>
                <Text style={styles.priceValue}>{formatPrice(priceData[selectedPair].ask)}</Text>
              </View>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>SPREAD</Text>
                <Text style={styles.spreadValue}>{(priceData[selectedPair].spread * 10000).toFixed(1)} pips</Text>
              </View>
            </View>
          </View>
        )}

        {/* Chart Section */}
        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>{selectedPair} Chart</Text>
            
            {/* Timeframe Selector */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.timeframeContainer}
            >
              {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
                <TouchableOpacity
                  key={tf}
                  style={[
                    styles.timeframeButton,
                    timeframe === tf && styles.timeframeButtonActive,
                  ]}
                  onPress={() => setTimeframe(tf)}
                >
                  <Text
                    style={[
                      styles.timeframeText,
                      timeframe === tf && styles.timeframeTextActive,
                    ]}
                  >
                    {tf}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Professional TradingView Chart */}
          <TradingViewProfessionalChart
            symbol={selectedPair}
            data={chartData}
            theme="dark"
            height={350}
          />
        </View>

        {/* Trading Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Order</Text>
          
          {/* Trade Type Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, tradeType === 'buy' && styles.buyButtonActive]}
              onPress={() => setTradeType('buy')}
            >
              <Text style={[styles.toggleText, tradeType === 'buy' && styles.buyTextActive]}>
                BUY
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, tradeType === 'sell' && styles.sellButtonActive]}
              onPress={() => setTradeType('sell')}
            >
              <Text style={[styles.toggleText, tradeType === 'sell' && styles.sellTextActive]}>
                SELL
              </Text>
            </TouchableOpacity>
          </View>

          {/* Order Type Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, orderType === 'market' && styles.toggleButtonActive]}
              onPress={() => setOrderType('market')}
            >
              <Text style={[styles.toggleText, orderType === 'market' && styles.toggleTextActive]}>
                Market
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, orderType === 'limit' && styles.toggleButtonActive]}
              onPress={() => setOrderType('limit')}
            >
              <Text style={[styles.toggleText, orderType === 'limit' && styles.toggleTextActive]}>
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
              placeholder="1000"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="numeric"
            />
          </View>

          {/* Limit Price (only for limit orders) */}
          {orderType === 'limit' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Limit Price</Text>
              <TextInput
                style={styles.input}
                value={limitPrice}
                onChangeText={setLimitPrice}
                placeholder="Enter price"
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

          {/* Leverage */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Leverage (1:X)</Text>
            <TextInput
              style={styles.input}
              value={leverage}
              onChangeText={setLeverage}
              placeholder="100"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="numeric"
            />
          </View>

          {/* Execute Trade Button */}
          <TouchableOpacity
            style={[
              styles.tradeButton,
              tradeType === 'buy' ? styles.buyButton : styles.sellButton,
              isLoading && styles.disabledButton
            ]}
            onPress={handleTrade}
            disabled={isLoading}
          >
            <Text style={styles.tradeButtonText}>
              {isLoading ? 'Processing...' : `${tradeType.toUpperCase()} ${selectedPair}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Open Positions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Open Positions ({positions.length})</Text>
          {positions.length === 0 ? (
            <Text style={styles.emptyText}>No open positions</Text>
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
        </View>

      </ScrollView>

      {/* Side Panel Modal */}
      <Modal
        visible={showSidePanel}
        transparent
        animationType="none"
        onRequestClose={toggleSidePanel}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={toggleSidePanel}
          />
          <Animated.View 
            style={[
              styles.sidePanel,
              {
                transform: [{
                  translateX: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [width, 0],
                  })
                }]
              }
            ]}
          >
            {/* Panel Header */}
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Trading Panel</Text>
              <TouchableOpacity onPress={toggleSidePanel}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Panel Tabs */}
            <View style={styles.panelTabs}>
              <TouchableOpacity 
                style={[styles.panelTab, activePanelTab === 'analysis' && styles.panelTabActive]}
                onPress={() => setActivePanelTab('analysis')}
              >
                <Text style={[styles.panelTabText, activePanelTab === 'analysis' && styles.panelTabTextActive]}>
                  Analysis
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.panelTab, activePanelTab === 'settings' && styles.panelTabActive]}
                onPress={() => setActivePanelTab('settings')}
              >
                <Text style={[styles.panelTabText, activePanelTab === 'settings' && styles.panelTabTextActive]}>
                  Settings
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.panelTab, activePanelTab === 'orders' && styles.panelTabActive]}
                onPress={() => setActivePanelTab('orders')}
              >
                <Text style={[styles.panelTabText, activePanelTab === 'orders' && styles.panelTabTextActive]}>
                  Orders
                </Text>
              </TouchableOpacity>
            </View>

            {/* Panel Content */}
            <ScrollView style={styles.panelContent}>
              {activePanelTab === 'analysis' && (
                <View>
                  <Text style={styles.panelSectionTitle}>Market Analysis</Text>
                  <View style={styles.panelCard}>
                    <Text style={styles.panelCardTitle}>Technical Indicators</Text>
                    <Text style={styles.panelText}>RSI: 65.2 (Overbought)</Text>
                    <Text style={styles.panelText}>MACD: Bullish Crossover</Text>
                    <Text style={styles.panelText}>Moving Average: Above 50 EMA</Text>
                  </View>
                  <View style={styles.panelCard}>
                    <Text style={styles.panelCardTitle}>Market Sentiment</Text>
                    <Text style={styles.panelText}>Bullish: 68%</Text>
                    <Text style={styles.panelText}>Bearish: 32%</Text>
                  </View>
                </View>
              )}
              
              {activePanelTab === 'settings' && (
                <View>
                  <Text style={styles.panelSectionTitle}>Trading Settings</Text>
                  <View style={styles.panelCard}>
                    <Text style={styles.panelCardTitle}>Chart Settings</Text>
                    <TouchableOpacity style={styles.panelButton}>
                      <Text style={styles.panelButtonText}>Change Chart Type</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.panelButton}>
                      <Text style={styles.panelButtonText}>Add Indicators</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.panelCard}>
                    <Text style={styles.panelCardTitle}>Risk Management</Text>
                    <Text style={styles.panelText}>Max Risk per Trade: 2%</Text>
                    <Text style={styles.panelText}>Daily Loss Limit: 5%</Text>
                  </View>
                </View>
              )}
              
              {activePanelTab === 'orders' && (
                <View>
                  <Text style={styles.panelSectionTitle}>Order Management</Text>
                  <View style={styles.panelCard}>
                    <Text style={styles.panelCardTitle}>Pending Orders</Text>
                    <Text style={styles.panelText}>No pending orders</Text>
                  </View>
                  <View style={styles.panelCard}>
                    <Text style={styles.panelCardTitle}>Quick Actions</Text>
                    <TouchableOpacity style={styles.panelButton}>
                      <Text style={styles.panelButtonText}>Close All Positions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.panelButton}>
                      <Text style={styles.panelButtonText}>Cancel All Orders</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: typography.sizes.xl * typography.lineHeights.normal,
  },
  refreshButton: {
    padding: spacing[2],
  },
  section: {
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
    lineHeight: typography.sizes.lg * typography.lineHeights.normal,
  },
  pairSelector: {
    marginBottom: spacing[2],
  },
  pairButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginRight: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  pairButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  pairText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  pairTextActive: {
    color: colors.background.primary,
  },
  pairPrice: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.monospace,
    marginTop: spacing[1],
    lineHeight: typography.sizes.xs * typography.lineHeights.normal,
  },
  priceUp: {
    color: colors.trading.profit,
  },
  priceDown: {
    color: colors.trading.loss,
  },
  priceSection: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  priceCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing[4],
    justifyContent: 'space-between',
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    marginBottom: spacing[1],
    lineHeight: typography.sizes.xs * typography.lineHeights.normal,
  },
  priceValue: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: typography.sizes.lg * typography.lineHeights.normal,
  },
  spreadValue: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing[1],
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: 6,
    minHeight: 44, // Ensure sufficient height for text
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary[500],
  },
  buyButtonActive: {
    backgroundColor: colors.trading.profit,
  },
  sellButtonActive: {
    backgroundColor: colors.trading.loss,
  },
  toggleText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  toggleTextActive: {
    color: colors.background.primary,
  },
  buyTextActive: {
    color: colors.background.primary,
  },
  sellTextActive: {
    color: colors.background.primary,
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
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
    minHeight: 48, // Ensure sufficient height for text
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing[4],
  },
  tradeButton: {
    paddingVertical: spacing[4],
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing[2],
    minHeight: 52, // Ensure sufficient height for text
    justifyContent: 'center',
  },
  buyButton: {
    backgroundColor: colors.trading.profit,
  },
  sellButton: {
    backgroundColor: colors.trading.loss,
  },
  disabledButton: {
    opacity: 0.6,
  },
  tradeButtonText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
    textTransform: 'uppercase',
    lineHeight: typography.sizes.lg * typography.lineHeights.normal,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing[6],
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  positionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  positionSymbol: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: typography.sizes.lg * typography.lineHeights.normal,
  },
  positionType: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
    textTransform: 'uppercase',
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
    minHeight: 24, // Ensure sufficient height
  },
  buyText: {
    backgroundColor: colors.secondary[100],
    color: colors.trading.profit,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  sellText: {
    backgroundColor: colors.background.tertiary,
    color: colors.trading.loss,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  positionDetails: {
    marginBottom: spacing[3],
  },
  positionDetail: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  profitText: {
    color: colors.trading.profit,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  lossText: {
    color: colors.trading.loss,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  closeButton: {
    backgroundColor: colors.trading.loss,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 6,
    alignSelf: 'flex-start',
    minHeight: 32, // Ensure sufficient height for text
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.background.primary,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    minHeight: 32, // Ensure sufficient height for text
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.primary[500],
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  timeframeContainer: {
    flexGrow: 0,
  },
  timeframeButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginHorizontal: spacing[1],
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
    minWidth: 40,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  timeframeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  timeframeTextActive: {
    color: colors.background.primary,
    fontWeight: typography.weights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay.backdrop,
  },
  modalBackdrop: {
    flex: 1,
  },
  sidePanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: width * 0.85,
    backgroundColor: colors.background.secondary,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1000,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.tertiary,
  },
  panelTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  panelTabs: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  panelTab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  panelTabActive: {
    borderBottomColor: colors.primary[500],
  },
  panelTabText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  panelTabTextActive: {
    color: colors.primary[500],
    fontWeight: typography.weights.bold,
  },
  panelContent: {
    flex: 1,
    padding: spacing[4],
  },
  panelSectionTitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  panelCard: {
    backgroundColor: colors.background.elevated,
    padding: spacing[4],
    borderRadius: 12,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  panelCardTitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  panelText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  panelButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 8,
    marginBottom: spacing[2],
    alignItems: 'center',
  },
  panelButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.background.primary,
  },
});

export default TradingScreen;
