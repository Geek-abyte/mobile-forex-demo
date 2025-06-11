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
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing } from '../../theme';
import { tradingService, TradeRequest, Position } from '../../services/tradingService';
import { enhancedTradingService } from '../../services/enhancedTradingService';
import { marketDataService } from '../../services/marketDataService';
import IndustryStandardChart, { CandlestickData } from '../../components/organisms/IndustryStandardChart';
import ProfessionalTradingChart from '../../components/organisms/ProfessionalTradingChart';
import OptimizedFullscreenChartModal from '../../components/organisms/OptimizedFullscreenChartModal';
import { improvedMarketDataService } from '../../services/improvedMarketDataService';
import { MainStackParamList, MainTabParamList } from '../../navigation/MainNavigator';

const { width, height } = Dimensions.get('window');

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
  
  // Navigation parameters
  const initialSymbol = route.params?.symbol || 'EUR/USD';
  const initialTradeType = route.params?.type || 'buy';
  
  // Core trading state
  const [selectedPair, setSelectedPair] = useState(initialSymbol);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>(initialTradeType);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [tradeSize, setTradeSize] = useState('1000');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [leverage, setLeverage] = useState('100');
  
  // Market data state
  const [positions, setPositions] = useState<Position[]>([]);
  const [priceData, setPriceData] = useState<PriceData>({});
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [timeframe, setTimeframe] = useState('1h');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isChartFullscreen, setIsChartFullscreen] = useState(false);
  
  // UI state - Professional layout controls
  const [expandedSection, setExpandedSection] = useState<'watchlist' | 'positions' | 'analysis' | null>('watchlist');
  const [quickTradeMode, setQuickTradeMode] = useState(true);

  // Market data
  const currencyPairs = [
    { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
    { symbol: 'GBP/USD', name: 'British Pound / US Dollar' },
    { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen' },
    { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc' },
    { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar' },
    { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar' },
    { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar' },
    { symbol: 'EUR/GBP', name: 'Euro / British Pound' },
  ];

  const timeframes = [
    { value: '1m', label: '1M' },
    { value: '5m', label: '5M' },
    { value: '15m', label: '15M' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' },
  ];

  // Helper functions
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

  const formatPrice = (price: number) => price.toFixed(5);
  const formatPnL = (pnl: number) => `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}`;

  // Trading functions
  const handleTrade = async () => {
    if (!priceData[selectedPair]) {
      Alert.alert('Error', 'Price data not available');
      return;
    }

    setIsLoading(true);
    try {
      const price = tradeType === 'buy' 
        ? priceData[selectedPair].ask 
        : priceData[selectedPair].bid;

      const tradeRequest: TradeRequest = {
        symbol: selectedPair,
        type: tradeType,
        size: parseFloat(tradeSize),
        orderType,
        price: orderType === 'limit' ? parseFloat(limitPrice) : price,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        leverage: parseFloat(leverage),
      };

      await enhancedTradingService.executeMarketOrder(tradeRequest, price);
      await loadPositions();
      
      Alert.alert('Success', `${tradeType.toUpperCase()} order executed successfully`);
      
      // Reset form for quick trading
      if (quickTradeMode) {
        setLimitPrice('');
        setStopLoss('');
        setTakeProfit('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to execute trade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePosition = async (positionId: string) => {
    try {
      // Get current price for the position
      const position = positions.find(p => p.id === positionId);
      if (!position || !priceData[position.symbol]) {
        throw new Error('Position or price data not found');
      }
      
      const currentPrice = position.type === 'buy' 
        ? priceData[position.symbol].bid 
        : priceData[position.symbol].ask;
        
      await enhancedTradingService.closePosition(positionId, currentPrice);
      await loadPositions();
      Alert.alert('Success', 'Position closed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to close position');
    }
  };

  const loadPositions = async () => {
    try {
      const userPositions = await enhancedTradingService.getPositions();
      setPositions(userPositions);
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  const startPriceUpdates = () => {
    const updatePrices = () => {
      currencyPairs.forEach(({ symbol }) => {
        const currentPrice = improvedMarketDataService.getCurrentPrice(symbol);
        const spread = improvedMarketDataService.getSpread(symbol);
        const change = Math.random() * 0.02 - 0.01; // -1% to +1% change

        setPriceData(prev => ({
          ...prev,
          [symbol]: {
            bid: currentPrice - spread / 2,
            ask: currentPrice + spread / 2,
            spread,
            change,
          },
        }));
      });
    };

    updatePrices();
    const interval = setInterval(updatePrices, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  };

  const loadInitialChartData = () => {
    const data = improvedMarketDataService.getHistoricalData(selectedPair, timeframe);
    setChartData(data);
    if (data.length > 0) {
      setCurrentPrice(data[data.length - 1].close);
    }
  };

  useEffect(() => {
    loadPositions();
    const priceCleanup = startPriceUpdates();
    loadInitialChartData();
    
    return () => {
      priceCleanup();
    };
  }, []);

  useEffect(() => {
    loadInitialChartData();
    
    const chartCleanup = improvedMarketDataService.subscribeToRealTimeData(
      selectedPair,
      timeframe,
      (newCandle: CandlestickData) => {
        setChartData(prevData => {
          const updatedData = [...prevData];
          const lastIndex = updatedData.length - 1;
          
          // Check if this is an update to the current candle or a new candle
          if (lastIndex >= 0 && updatedData[lastIndex].time === newCandle.time) {
            // Update existing candle
            updatedData[lastIndex] = newCandle;
          } else {
            // Add new candle
            updatedData.push(newCandle);
            // Keep only last 100 candles
            if (updatedData.length > 100) {
              updatedData.shift();
            }
          }
          
          return updatedData;
        });
        
        setCurrentPrice(newCandle.close);
      }
    );

    return () => {
      if (chartCleanup) chartCleanup();
    };
  }, [selectedPair, timeframe]);

  const toggleSection = (section: 'watchlist' | 'positions' | 'analysis') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Professional Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Trading</Text>
          <Text style={styles.headerSubtitle}>{selectedPair}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={() => navigation.navigate('RiskManagement')}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerAction, styles.quickTradeToggle]}
            onPress={() => setQuickTradeMode(!quickTradeMode)}
          >
            <Ionicons 
              name={quickTradeMode ? "flash" : "flash-outline"} 
              size={18} 
              color={quickTradeMode ? colors.primary[500] : colors.text.secondary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Live Price Display */}
        {priceData[selectedPair] && (
          <View style={styles.priceSection}>
            <View style={styles.priceHeader}>
              <View style={styles.priceInfo}>
                <Text style={styles.currentPrice}>{formatPrice(currentPrice)}</Text>
                <Text style={[
                  styles.priceChange,
                  priceData[selectedPair].change >= 0 ? styles.priceUp : styles.priceDown
                ]}>
                  {priceData[selectedPair].change >= 0 ? '+' : ''}{(priceData[selectedPair].change * 100).toFixed(2)}%
                </Text>
              </View>
              <View style={styles.bidAskContainer}>
                <View style={styles.bidAsk}>
                  <Text style={styles.bidAskLabel}>BID</Text>
                  <Text style={styles.bidAskValue}>{formatPrice(priceData[selectedPair].bid)}</Text>
                </View>
                <View style={styles.bidAsk}>
                  <Text style={styles.bidAskLabel}>ASK</Text>
                  <Text style={styles.bidAskValue}>{formatPrice(priceData[selectedPair].ask)}</Text>
                </View>
                <View style={styles.bidAsk}>
                  <Text style={styles.bidAskLabel}>SPREAD</Text>
                  <Text style={styles.spreadValue}>{(priceData[selectedPair].spread * 10000).toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Chart Section - Professional */}
        <View style={styles.chartSection}>
          <ProfessionalTradingChart
            symbol={selectedPair}
            data={chartData}
            theme="dark"
            height={320}
            timeframe={timeframe}
            onFullscreenChange={setIsChartFullscreen}
            showControls={true}
          />
        </View>

        {/* Quick Trade Panel */}
        <View style={styles.tradePanel}>
          <View style={styles.tradePanelHeader}>
            <Text style={styles.tradePanelTitle}>Quick Trade</Text>
            <View style={styles.tradeSizeContainer}>
              <Text style={styles.tradeSizeLabel}>Size:</Text>
              <TextInput
                style={styles.tradeSizeInput}
                value={tradeSize}
                onChangeText={setTradeSize}
                keyboardType="numeric"
                placeholder="1000"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>
          </View>
          
          <View style={styles.tradeControls}>
            <TouchableOpacity
              style={[styles.tradeButton, styles.sellButton]}
              onPress={() => {
                setTradeType('sell');
                handleTrade();
              }}
              disabled={isLoading}
            >
              <Text style={styles.sellButtonText}>SELL</Text>
              {priceData[selectedPair] && (
                <Text style={styles.tradeButtonPrice}>{formatPrice(priceData[selectedPair].bid)}</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tradeButton, styles.buyButton]}
              onPress={() => {
                setTradeType('buy');
                handleTrade();
              }}
              disabled={isLoading}
            >
              <Text style={styles.buyButtonText}>BUY</Text>
              {priceData[selectedPair] && (
                <Text style={styles.tradeButtonPrice}>{formatPrice(priceData[selectedPair].ask)}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Collapsible Sections */}
        
        {/* Watchlist Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('watchlist')}
          >
            <Text style={styles.sectionTitle}>Watchlist</Text>
            <Ionicons 
              name={expandedSection === 'watchlist' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>
          
          {expandedSection === 'watchlist' && (
            <FlatList
              data={currencyPairs}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.symbol}
              contentContainerStyle={styles.watchlistContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.watchlistItem,
                    selectedPair === item.symbol && styles.watchlistItemActive
                  ]}
                  onPress={() => setSelectedPair(item.symbol)}
                >
                  <Text style={[
                    styles.watchlistSymbol,
                    selectedPair === item.symbol && styles.watchlistSymbolActive
                  ]}>
                    {item.symbol}
                  </Text>
                  {priceData[item.symbol] && (
                    <>
                      <Text style={[
                        styles.watchlistPrice,
                        selectedPair === item.symbol && styles.watchlistPriceActive
                      ]}>
                        {formatPrice(priceData[item.symbol].bid)}
                      </Text>
                      <Text style={[
                        styles.watchlistChange,
                        priceData[item.symbol].change >= 0 ? styles.priceUp : styles.priceDown
                      ]}>
                        {priceData[item.symbol].change >= 0 ? '+' : ''}{(priceData[item.symbol].change * 100).toFixed(2)}%
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Positions Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('positions')}
          >
            <Text style={styles.sectionTitle}>Positions ({positions.length})</Text>
            <Ionicons 
              name={expandedSection === 'positions' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>
          
          {expandedSection === 'positions' && (
            <View style={styles.positionsContainer}>
              {positions.length === 0 ? (
                <Text style={styles.emptyText}>No open positions</Text>
              ) : (
                positions.map((position) => (
                  <View key={position.id} style={styles.positionCard}>
                    <View style={styles.positionHeader}>
                      <View style={styles.positionInfo}>
                        <Text style={styles.positionSymbol}>{position.symbol}</Text>
                        <Text style={[
                          styles.positionType,
                          position.type === 'buy' ? styles.buyText : styles.sellText
                        ]}>
                          {position.type.toUpperCase()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.closePositionButton}
                        onPress={() => handleClosePosition(position.id)}
                      >
                        <Ionicons name="close" size={16} color={colors.text.secondary} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.positionDetails}>
                      <View style={styles.positionDetail}>
                        <Text style={styles.positionDetailLabel}>Size</Text>
                        <Text style={styles.positionDetailValue}>{position.size.toFixed(0)}</Text>
                      </View>
                      <View style={styles.positionDetail}>
                        <Text style={styles.positionDetailLabel}>Entry</Text>
                        <Text style={styles.positionDetailValue}>{formatPrice(position.entryPrice)}</Text>
                      </View>
                      <View style={styles.positionDetail}>
                        <Text style={styles.positionDetailLabel}>Current</Text>
                        <Text style={styles.positionDetailValue}>{formatPrice(position.currentPrice)}</Text>
                      </View>
                      <View style={styles.positionDetail}>
                        <Text style={styles.positionDetailLabel}>P&L</Text>
                        <Text style={[
                          styles.positionDetailValue,
                          position.pnl >= 0 ? styles.profitText : styles.lossText
                        ]}>
                          {formatPnL(position.pnl)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* Advanced Trade Options */}
        {!quickTradeMode && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('analysis')}
            >
              <Text style={styles.sectionTitle}>Advanced Order</Text>
              <Ionicons 
                name={expandedSection === 'analysis' ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.text.secondary} 
              />
            </TouchableOpacity>
            
            {expandedSection === 'analysis' && (
              <View style={styles.advancedOrderContainer}>
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

                {/* Trade Type & Execute Button */}
                <View style={styles.tradeTypeContainer}>
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

                <TouchableOpacity
                  style={[
                    styles.executeButton,
                    tradeType === 'buy' ? styles.executeButtonBuy : styles.executeButtonSell,
                    isLoading && styles.disabledButton
                  ]}
                  onPress={handleTrade}
                  disabled={isLoading}
                >
                  <Text style={styles.executeButtonText}>
                    {isLoading ? 'Processing...' : `${tradeType.toUpperCase()} ${selectedPair}`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Fullscreen Chart Modal */}
      <OptimizedFullscreenChartModal
        visible={isChartFullscreen}
        onClose={() => setIsChartFullscreen(false)}
        symbol={selectedPair}
        data={chartData}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  
  // Professional Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: spacing[2],
    marginLeft: spacing[1],
  },
  quickTradeToggle: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 6,
  },

  // Live Price Section
  priceSection: {
    backgroundColor: colors.background.secondary,
    margin: spacing[4],
    borderRadius: 12,
    padding: spacing[4],
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    flex: 1,
  },
  currentPrice: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: typography.sizes['2xl'] * typography.lineHeights.tight,
  },
  priceChange: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.medium,
    marginTop: spacing[1],
  },
  priceUp: {
    color: colors.trading.profit,
  },
  priceDown: {
    color: colors.trading.loss,
  },
  bidAskContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  bidAsk: {
    alignItems: 'center',
  },
  bidAskLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    marginBottom: spacing[1],
  },
  bidAskValue: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  spreadValue: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },

  // Chart Section - Simplified
  chartSection: {
    backgroundColor: colors.background.primary,
    margin: spacing[4],
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Quick Trade Panel
  tradePanel: {
    backgroundColor: colors.background.secondary,
    margin: spacing[4],
    marginTop: 0,
    borderRadius: 12,
    padding: spacing[4],
  },
  tradePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  tradePanelTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  tradeSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tradeSizeLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginRight: spacing[2],
  },
  tradeSizeInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 6,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    color: colors.text.primary,
    minWidth: 80,
    textAlign: 'center',
  },
  tradeControls: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  tradeButton: {
    flex: 1,
    paddingVertical: spacing[4],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  sellButton: {
    backgroundColor: colors.trading.loss,
  },
  buyButton: {
    backgroundColor: colors.trading.profit,
  },
  sellButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
    textTransform: 'uppercase',
  },
  buyButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
    textTransform: 'uppercase',
  },
  tradeButtonPrice: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    color: colors.background.primary,
    marginTop: spacing[1],
    opacity: 0.9,
  },

  // Collapsible Sections
  section: {
    backgroundColor: colors.background.secondary,
    margin: spacing[4],
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },

  // Watchlist
  watchlistContainer: {
    padding: spacing[4],
    paddingTop: spacing[3],
  },
  watchlistItem: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    padding: spacing[3],
    marginRight: spacing[3],
    minWidth: 100,
    alignItems: 'center',
  },
  watchlistItemActive: {
    backgroundColor: colors.primary[500],
  },
  watchlistSymbol: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  watchlistSymbolActive: {
    color: colors.background.primary,
  },
  watchlistPrice: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.monospace,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  watchlistPriceActive: {
    color: colors.background.primary,
  },
  watchlistChange: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.monospace,
    marginTop: spacing[1],
  },

  // Positions
  positionsContainer: {
    padding: spacing[4],
    paddingTop: spacing[3],
  },
  positionCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  positionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionSymbol: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginRight: spacing[2],
  },
  positionType: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  buyText: {
    color: colors.background.primary,
    backgroundColor: colors.trading.profit,
  },
  sellText: {
    color: colors.background.primary,
    backgroundColor: colors.trading.loss,
  },
  closePositionButton: {
    padding: spacing[1],
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  positionDetail: {
    alignItems: 'center',
  },
  positionDetailLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    marginBottom: spacing[1],
  },
  positionDetailValue: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  profitText: {
    color: colors.trading.profit,
  },
  lossText: {
    color: colors.trading.loss,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
    textAlign: 'center',
    padding: spacing[4],
    paddingTop: spacing[2],
  },

  // Advanced Order
  advancedOrderContainer: {
    padding: spacing[4],
    paddingTop: spacing[3],
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    padding: spacing[1],
    marginBottom: spacing[4],
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: 6,
    minHeight: 40,
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
    marginBottom: spacing[3],
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    minHeight: 44,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing[3],
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    padding: spacing[1],
    marginBottom: spacing[4],
  },
  executeButton: {
    paddingVertical: spacing[4],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  executeButtonBuy: {
    backgroundColor: colors.trading.profit,
  },
  executeButtonSell: {
    backgroundColor: colors.trading.loss,
  },
  executeButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
    textTransform: 'uppercase',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default TradingScreen;
