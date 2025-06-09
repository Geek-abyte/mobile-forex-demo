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
import { marketDataService } from '../../services/marketDataService';
import TradingViewProfessionalChart, { CandlestickData } from '../../components/organisms/TradingViewProfessionalChart';
import { tradingViewDataService } from '../../services/tradingViewDataService';
import { MainStackParamList } from '../../navigation/MainNavigator';

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

  // UI Animation Helpers for new design
  const togglePanel = (panel: ActivePanel) => {
    if (activePanel === panel) {
      // Close current panel
      setActivePanel(null);
      Animated.timing(panelAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Open new panel
      setActivePanel(panel);
      Animated.timing(panelAnimation, {
        toValue: BOTTOM_PANEL_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const togglePairSelector = () => {
    setShowPairSelector(!showPairSelector);
    Animated.timing(pairSelectorAnimation, {
      toValue: showPairSelector ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (activePanel) {
      setActivePanel(null);
      Animated.timing(panelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      
      {/* Compact Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.pairSelectorButton}
          onPress={togglePairSelector}
        >
          <Text style={styles.selectedPair}>{selectedPair}</Text>
          <Text style={styles.currentPrice}>
            {priceData[selectedPair] ? formatPrice(priceData[selectedPair].bid) : '---'}
          </Text>
          <Ionicons 
            name={showPairSelector ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={colors.text.secondary} 
          />
        </TouchableOpacity>

        <View style={styles.headerControls}>
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

          <TouchableOpacity 
            style={styles.fullscreenButton}
            onPress={toggleFullscreen}
          >
            <Ionicons 
              name={isFullscreen ? "contract-outline" : "expand-outline"} 
              size={20} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Price Display */}
      {priceData[selectedPair] && !isFullscreen && (
        <View style={styles.priceBar}>
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
            <Text style={styles.spreadValue}>{(priceData[selectedPair].spread * 10000).toFixed(1)}</Text>
          </View>
        </View>
      )}

      {/* Main Chart Area */}
      <View style={[styles.chartContainer, isFullscreen && styles.chartContainerFullscreen]}>
        <TradingViewProfessionalChart
          symbol={selectedPair}
          data={chartData}
          height={isFullscreen ? height - HEADER_HEIGHT : CHART_HEIGHT - (priceData[selectedPair] ? 60 : 0)}
          theme="dark"
        />
      </View>

      {/* Bottom Action Bar */}
      {!isFullscreen && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              activePanel === 'trade' && styles.actionButtonActive
            ]}
            onPress={() => togglePanel('trade')}
          >
            <Ionicons 
              name="trending-up" 
              size={20} 
              color={activePanel === 'trade' ? colors.primary[500] : colors.text.secondary} 
            />
            <Text style={[
              styles.actionButtonText,
              activePanel === 'trade' && styles.actionButtonTextActive
            ]}>
              Trade
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              activePanel === 'positions' && styles.actionButtonActive
            ]}
            onPress={() => togglePanel('positions')}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={activePanel === 'positions' ? colors.primary[500] : colors.text.secondary} 
            />
            <Text style={[
              styles.actionButtonText,
              activePanel === 'positions' && styles.actionButtonTextActive
            ]}>
              Positions
            </Text>
            {positions.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{positions.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              activePanel === 'analysis' && styles.actionButtonActive
            ]}
            onPress={() => togglePanel('analysis')}
          >
            <Ionicons 
              name="analytics" 
              size={20} 
              color={activePanel === 'analysis' ? colors.primary[500] : colors.text.secondary} 
            />
            <Text style={[
              styles.actionButtonText,
              activePanel === 'analysis' && styles.actionButtonTextActive
            ]}>
              Analysis
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.actionButtonText}>History</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sliding Bottom Panel */}
      <Animated.View style={[
        styles.bottomPanel,
        {
          height: panelAnimation,
          transform: [{
            translateY: panelAnimation.interpolate({
              inputRange: [0, BOTTOM_PANEL_HEIGHT],
              outputRange: [BOTTOM_PANEL_HEIGHT, 0],
            })
          }]
        }
      ]}>
        {activePanel === 'trade' && renderTradePanel()}
        {activePanel === 'positions' && renderPositionsPanel()}
        {activePanel === 'analysis' && renderAnalysisPanel()}
      </Animated.View>

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
    </View>
  );

  // Panel Render Functions
  function renderTradePanel() {
    return (
      <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>New Order</Text>
          <TouchableOpacity onPress={() => togglePanel(null)}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Quick Trade Buttons */}
        <View style={styles.quickTradeButtons}>
          <TouchableOpacity
            style={[styles.quickTradeButton, styles.buyButton]}
            onPress={() => {
              setTradeType('buy');
              handleTrade();
            }}
          >
            <Text style={styles.quickTradeButtonText}>BUY</Text>
            <Text style={styles.quickTradePrice}>
              {priceData[selectedPair] ? formatPrice(priceData[selectedPair].ask) : '---'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickTradeButton, styles.sellButton]}
            onPress={() => {
              setTradeType('sell');
              handleTrade();
            }}
          >
            <Text style={styles.quickTradeButtonText}>SELL</Text>
            <Text style={styles.quickTradePrice}>
              {priceData[selectedPair] ? formatPrice(priceData[selectedPair].bid) : '---'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Advanced Trade Form */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionTitle}>Advanced Order</Text>
          
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
            <Text style={styles.inputLabel}>Size</Text>
            <TextInput
              style={styles.input}
              value={tradeSize}
              onChangeText={setTradeSize}
              placeholder="1000"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="numeric"
            />
          </View>

          {/* Limit Price */}
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
        </View>
      </ScrollView>
    );
  }

  function renderPositionsPanel() {
    return (
      <View style={styles.panelContent}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Open Positions ({positions.length})</Text>
          <TouchableOpacity onPress={() => togglePanel(null)}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
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
        </ScrollView>
      </View>
    );
  }

  function renderAnalysisPanel() {
    return (
      <View style={styles.panelContent}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Market Analysis</Text>
          <TouchableOpacity onPress={() => togglePanel(null)}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.analysisText}>
            Technical analysis tools and market insights will be available here.
          </Text>
          
          {/* Placeholder for future analysis features */}
          <View style={styles.analysisPlaceholder}>
            <Ionicons name="analytics-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.placeholderText}>Coming Soon</Text>
            <Text style={styles.placeholderSubtext}>
              Technical indicators, market sentiment, and AI-powered insights
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    height: HEADER_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.primary,
  },
  pairSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  selectedPair: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  currentPrice: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    color: colors.text.secondary,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  timeframeContainer: {
    flexDirection: 'row',
  },
  timeframeButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    marginHorizontal: spacing[1],
    borderRadius: 4,
    backgroundColor: colors.background.tertiary,
    minWidth: 32,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  timeframeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  timeframeTextActive: {
    color: colors.background.primary,
    fontWeight: typography.weights.bold,
  },
  fullscreenButton: {
    padding: spacing[2],
  },

  // Price Display
  priceBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
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
  },
  priceValue: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  spreadValue: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    color: colors.text.secondary,
  },
  priceUp: {
    color: colors.trading.profit,
  },
  priceDown: {
    color: colors.trading.loss,
  },

  // Chart Styles
  chartContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  chartContainerFullscreen: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },

  // Action Bar
  actionBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 8,
    minWidth: 60,
    position: 'relative',
  },
  actionButtonActive: {
    backgroundColor: colors.background.tertiary,
  },
  actionButtonText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginTop: spacing[1],
    textAlign: 'center',
  },
  actionButtonTextActive: {
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  badge: {
    position: 'absolute',
    top: -spacing[1],
    right: spacing[1],
    backgroundColor: colors.trading.loss,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.background.primary,
    fontWeight: typography.weights.bold,
  },

  // Bottom Panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  panelTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pairSelectorModal: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    margin: spacing[4],
    maxHeight: height * 0.6,
    minWidth: width * 0.8,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  pairOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  pairOptionActive: {
    backgroundColor: colors.primary[100],
  },
  pairOptionText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  pairOptionTextActive: {
    color: colors.primary[500],
    fontWeight: typography.weights.bold,
  },
  pairOptionPrice: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    color: colors.text.secondary,
  },

  // Trade Panel Styles
  quickTradeButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginVertical: spacing[4],
  },
  quickTradeButton: {
    flex: 1,
    paddingVertical: spacing[4],
    borderRadius: 12,
    alignItems: 'center',
  },
  quickTradeButtonText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
  },
  quickTradePrice: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    color: colors.background.primary,
    marginTop: spacing[1],
  },
  formSection: {
    marginVertical: spacing[3],
  },
  formSectionTitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },

  // Form Controls
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: spacing[4],
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    padding: spacing[1],
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: 6,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary[500],
  },
  toggleText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  toggleTextActive: {
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
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    minHeight: 48,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing[4],
  },

  // Buttons
  buyButton: {
    backgroundColor: colors.trading.profit,
  },
  sellButton: {
    backgroundColor: colors.trading.loss,
  },
  submitButton: {
    paddingVertical: spacing[4],
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing[4],
    minHeight: 52,
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
    textTransform: 'uppercase',
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Position Styles
  emptyText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing[6],
  },
  positionCard: {
    backgroundColor: colors.background.tertiary,
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
  },
  positionType: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  buyText: {
    backgroundColor: colors.secondary[100],
    color: colors.trading.profit,
  },
  sellText: {
    backgroundColor: colors.background.primary,
    color: colors.trading.loss,
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
    minHeight: 32,
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.background.primary,
  },

  // Analysis Panel
  analysisText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginVertical: spacing[4],
    textAlign: 'center',
  },
  analysisPlaceholder: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  placeholderText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.tertiary,
    marginTop: spacing[3],
  },
  placeholderSubtext: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing[2],
    paddingHorizontal: spacing[4],
  },
});

export default TradingScreen;
