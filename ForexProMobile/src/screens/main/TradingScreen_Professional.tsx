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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing } from '../../theme';
import { tradingService, TradeRequest, Position } from '../../services/tradingService';
import { enhancedTradingService } from '../../services/enhancedTradingService';
import { marketDataService } from '../../services/marketDataService';
import TradingViewProfessionalChart, { CandlestickData } from '../../components/organisms/TradingViewProfessionalChart';
import { realisticMarketSimulation } from '../../services/realisticMarketSimulation';
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

interface QuickTradeInfo {
  symbol: string;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
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
  const [showTradePanel, setShowTradePanel] = useState(false);
  const [activeView, setActiveView] = useState<'chart' | 'watchlist' | 'positions'>('chart');
  const slideAnimation = useRef(new Animated.Value(height)).current;

  // Popular currency pairs
  const currencyPairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
    'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP'
  ];

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

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

  const toggleTradePanel = () => {
    if (showTradePanel) {
      // Close panel
      Animated.timing(slideAnimation, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowTradePanel(false));
    } else {
      // Open panel
      setShowTradePanel(true);
      Animated.timing(slideAnimation, {
        toValue: 0,
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
    generateInitialChartData();
    
    const chartCleanup = realisticMarketSimulation.subscribeToRealTimeData(
      selectedPair,
      (newCandle: any) => {
        setChartData(prevData => {
          const updatedData = [...prevData];
          const lastIndex = updatedData.length - 1;
          
          const timeDiff = newCandle.timestamp - (updatedData[lastIndex]?.time || 0);
          const timeframeMs = getTimeframeMs(timeframe);
          
          if (timeDiff < timeframeMs && updatedData.length > 0) {
            updatedData[lastIndex] = {
              ...updatedData[lastIndex],
              high: Math.max(updatedData[lastIndex].high, newCandle.close),
              low: Math.min(updatedData[lastIndex].low, newCandle.close),
              close: newCandle.close,
              volume: (updatedData[lastIndex].volume || 0) + (newCandle.volume || 0),
            };
          } else {
            updatedData.push({
              time: Math.floor(newCandle.timestamp / 1000),
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
    const historicalData = realisticMarketSimulation.generateHistoricalData(selectedPair, timeframe, 50);
    
    const convertedData: CandlestickData[] = historicalData.map(candle => ({
      time: Math.floor(candle.timestamp / 1000),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
    }));
    
    setChartData(convertedData);
    
    if (convertedData.length > 0) {
      setCurrentPrice(convertedData[convertedData.length - 1].close);
    }
  };

  const startPriceUpdates = () => {
    const interval = setInterval(() => {
      const newPriceData: PriceData = {};
      
      currencyPairs.forEach(pair => {
        const bidAsk = realisticMarketSimulation.getBidAsk(pair);
        const currentData = priceData[pair];
        const currentPrice = bidAsk.bid;
        const previousPrice = currentData?.bid || currentPrice;
        const change = currentPrice - previousPrice;
        
        newPriceData[pair] = {
          bid: bidAsk.bid,
          ask: bidAsk.ask,
          spread: bidAsk.ask - bidAsk.bid,
          change: change,
        };
      });
      
      setPriceData(newPriceData);
    }, 1000);
    
    return () => clearInterval(interval);
  };

  const handleTrade = async () => {
    if (parseFloat(tradeSize) <= 0) {
      Alert.alert('Error', 'Please enter a valid trade size');
      return;
    }

    const price = orderType === 'market' 
      ? (tradeType === 'buy' ? priceData[selectedPair]?.ask : priceData[selectedPair]?.bid) || currentPrice
      : parseFloat(limitPrice);

    if (!price) {
      Alert.alert('Error', 'Price data not available');
      return;
    }

    setIsLoading(true);

    try {
      const tradeRequest: TradeRequest = {
        symbol: selectedPair,
        type: tradeType,
        orderType,
        size: parseFloat(tradeSize),
        price,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        leverage: parseInt(leverage),
      };

      if (orderType === 'market') {
        await enhancedTradingService.executeMarketOrder(tradeRequest, price);
      } else {
        await enhancedTradingService.placeLimitOrder(tradeRequest);
      }
      
      Alert.alert('Success', 'Trade executed successfully');
      loadPositions();
      toggleTradePanel();
      
      // Reset form
      setTradeSize('1000');
      setLimitPrice('');
      setStopLoss('');
      setTakeProfit('');
      
    } catch (error) {
      Alert.alert('Error', 'Failed to execute trade');
    } finally {
      setIsLoading(false);
    }
  };

  const closePosition = async (positionId: string) => {
    try {
      const position = positions.find(p => p.id === positionId);
      if (!position) {
        Alert.alert('Error', 'Position not found');
        return;
      }
      
      await enhancedTradingService.closePosition(positionId, position.currentPrice);
      loadPositions();
      Alert.alert('Success', 'Position closed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to close position');
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Trading</Text>
          <Text style={styles.headerSubtitle}>Professional Trading Platform</Text>
        </View>
        <TouchableOpacity 
          style={styles.tradeButton}
          onPress={toggleTradePanel}
        >
          <Ionicons name="add" size={24} color={colors.white} />
          <Text style={styles.tradeButtonText}>Trade</Text>
        </TouchableOpacity>
      </View>
      
      {/* Market Summary Bar */}
      <View style={styles.marketSummary}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {currencyPairs.slice(0, 4).map((pair, index) => {
            const data = priceData[pair];
            const isPositive = data?.change >= 0;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.marketItem,
                  selectedPair === pair && styles.selectedMarketItem
                ]}
                onPress={() => setSelectedPair(pair)}
              >
                <Text style={styles.marketPair}>{pair}</Text>
                <Text style={styles.marketPrice}>
                  {data?.bid?.toFixed(5) || '0.00000'}
                </Text>
                <Text style={[
                  styles.marketChange,
                  { color: isPositive ? colors.success : colors.error }
                ]}>
                  {isPositive ? '+' : ''}{(data?.change || 0).toFixed(5)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </LinearGradient>
  );

  const renderViewSelector = () => (
    <View style={styles.viewSelector}>
      {[
        { key: 'chart', label: 'Chart', icon: 'bar-chart' },
        { key: 'watchlist', label: 'Watchlist', icon: 'list' },
        { key: 'positions', label: 'Positions', icon: 'briefcase' },
      ].map((view) => (
        <TouchableOpacity
          key={view.key}
          style={[
            styles.viewTab,
            activeView === view.key && styles.activeViewTab
          ]}
          onPress={() => setActiveView(view.key as any)}
        >
          <Ionicons 
            name={view.icon as any} 
            size={20} 
            color={activeView === view.key ? colors.primary : colors.textSecondary} 
          />
          <Text style={[
            styles.viewTabText,
            activeView === view.key && styles.activeViewTabText
          ]}>
            {view.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChartView = () => (
    <View style={styles.chartContainer}>
      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {timeframes.map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[
                styles.timeframeButton,
                timeframe === tf && styles.activeTimeframeButton
              ]}
              onPress={() => setTimeframe(tf)}
            >
              <Text style={[
                styles.timeframeText,
                timeframe === tf && styles.activeTimeframeText
              ]}>
                {tf}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        <TradingViewProfessionalChart
          data={chartData}
          symbol={selectedPair}
          timeframe={timeframe}
          height={300}
          width={width - 32}
        />
      </View>

      {/* Price Info */}
      <View style={styles.priceInfo}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Current Price</Text>
          <Text style={styles.currentPrice}>
            {currentPrice.toFixed(5)}
          </Text>
        </View>
        
        {priceData[selectedPair] && (
          <>
            <View style={styles.bidAskContainer}>
              <View style={styles.bidAsk}>
                <Text style={styles.bidAskLabel}>BID</Text>
                <Text style={[styles.bidAskPrice, { color: colors.error }]}>
                  {priceData[selectedPair].bid.toFixed(5)}
                </Text>
              </View>
              <View style={styles.bidAsk}>
                <Text style={styles.bidAskLabel}>ASK</Text>
                <Text style={[styles.bidAskPrice, { color: colors.success }]}>
                  {priceData[selectedPair].ask.toFixed(5)}
                </Text>
              </View>
              <View style={styles.bidAsk}>
                <Text style={styles.bidAskLabel}>SPREAD</Text>
                <Text style={styles.bidAskPrice}>
                  {(priceData[selectedPair].spread * 10000).toFixed(1)} pips
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );

  const renderWatchlistView = () => (
    <ScrollView style={styles.watchlistContainer}>
      {currencyPairs.map((pair, index) => {
        const data = priceData[pair];
        const isPositive = data?.change >= 0;
        
        return (
          <TouchableOpacity
            key={index}
            style={styles.watchlistItem}
            onPress={() => {
              setSelectedPair(pair);
              setActiveView('chart');
            }}
          >
            <View style={styles.watchlistLeft}>
              <Text style={styles.watchlistPair}>{pair}</Text>
              <Text style={styles.watchlistSpread}>
                Spread: {data ? (data.spread * 10000).toFixed(1) : '0.0'} pips
              </Text>
            </View>
            
            <View style={styles.watchlistCenter}>
              <Text style={styles.watchlistBid}>
                {data?.bid?.toFixed(5) || '0.00000'}
              </Text>
              <Text style={styles.watchlistAsk}>
                {data?.ask?.toFixed(5) || '0.00000'}
              </Text>
            </View>
            
            <View style={styles.watchlistRight}>
              <Text style={[
                styles.watchlistChange,
                { color: isPositive ? colors.success : colors.error }
              ]}>
                {isPositive ? '+' : ''}{(data?.change || 0).toFixed(5)}
              </Text>
              <View style={styles.quickTradeButtons}>
                <TouchableOpacity
                  style={[styles.quickTradeBtn, { backgroundColor: colors.error }]}
                  onPress={() => {
                    setSelectedPair(pair);
                    setTradeType('sell');
                    toggleTradePanel();
                  }}
                >
                  <Text style={styles.quickTradeBtnText}>SELL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickTradeBtn, { backgroundColor: colors.success }]}
                  onPress={() => {
                    setSelectedPair(pair);
                    setTradeType('buy');
                    toggleTradePanel();
                  }}
                >
                  <Text style={styles.quickTradeBtnText}>BUY</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderPositionsView = () => (
    <ScrollView style={styles.positionsContainer}>
      {positions.length === 0 ? (
        <View style={styles.emptyPositions}>
          <Ionicons name="briefcase-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyPositionsText}>No open positions</Text>
          <Text style={styles.emptyPositionsSubtext}>
            Start trading to see your positions here
          </Text>
        </View>
      ) : (
        positions.map((position, index) => {
          const isProfit = position.profit > 0;
          
          return (
            <View key={index} style={styles.positionItem}>
              <View style={styles.positionHeader}>
                <View>
                  <Text style={styles.positionPair}>{position.symbol}</Text>
                  <Text style={styles.positionType}>
                    {position.type.toUpperCase()} • {position.size.toLocaleString()} units
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => closePosition(position.id)}
                >
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.positionDetails}>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Entry Price:</Text>
                  <Text style={styles.positionValue}>
                    {position.entryPrice.toFixed(5)}
                  </Text>
                </View>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Current Price:</Text>
                  <Text style={styles.positionValue}>
                    {position.currentPrice.toFixed(5)}
                  </Text>
                </View>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>P&L:</Text>
                  <Text style={[
                    styles.positionPnl,
                    { color: isProfit ? colors.success : colors.error }
                  ]}>
                    {isProfit ? '+' : ''}${position.profit.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );

  const renderTradePanel = () => (
    <Modal
      visible={showTradePanel}
      transparent
      animationType="none"
      onRequestClose={toggleTradePanel}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.tradePanel,
            {
              transform: [{ translateY: slideAnimation }]
            }
          ]}
        >
          <View style={styles.tradePanelHeader}>
            <Text style={styles.tradePanelTitle}>New Trade</Text>
            <TouchableOpacity onPress={toggleTradePanel}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.tradePanelContent}>
            {/* Symbol Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Currency Pair</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.symbolSelector}>
                  {currencyPairs.map((pair) => (
                    <TouchableOpacity
                      key={pair}
                      style={[
                        styles.symbolButton,
                        selectedPair === pair && styles.selectedSymbolButton
                      ]}
                      onPress={() => setSelectedPair(pair)}
                    >
                      <Text style={[
                        styles.symbolButtonText,
                        selectedPair === pair && styles.selectedSymbolButtonText
                      ]}>
                        {pair}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Trade Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trade Type</Text>
              <View style={styles.tradeTypeSelector}>
                <TouchableOpacity
                  style={[
                    styles.tradeTypeButton,
                    styles.buyButton,
                    tradeType === 'buy' && styles.activeBuyButton
                  ]}
                  onPress={() => setTradeType('buy')}
                >
                  <Text style={[
                    styles.tradeTypeText,
                    tradeType === 'buy' && styles.activeTradeTypeText
                  ]}>
                    BUY
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tradeTypeButton,
                    styles.sellButton,
                    tradeType === 'sell' && styles.activeSellButton
                  ]}
                  onPress={() => setTradeType('sell')}
                >
                  <Text style={[
                    styles.tradeTypeText,
                    tradeType === 'sell' && styles.activeTradeTypeText
                  ]}>
                    SELL
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Order Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Order Type</Text>
              <View style={styles.orderTypeSelector}>
                <TouchableOpacity
                  style={[
                    styles.orderTypeButton,
                    orderType === 'market' && styles.activeOrderTypeButton
                  ]}
                  onPress={() => setOrderType('market')}
                >
                  <Text style={[
                    styles.orderTypeText,
                    orderType === 'market' && styles.activeOrderTypeText
                  ]}>
                    Market
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.orderTypeButton,
                    orderType === 'limit' && styles.activeOrderTypeButton
                  ]}
                  onPress={() => setOrderType('limit')}
                >
                  <Text style={[
                    styles.orderTypeText,
                    orderType === 'limit' && styles.activeOrderTypeText
                  ]}>
                    Limit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Trade Size */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trade Size (Units)</Text>
              <TextInput
                style={styles.textInput}
                value={tradeSize}
                onChangeText={setTradeSize}
                placeholder="10000"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Limit Price (if limit order) */}
            {orderType === 'limit' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Limit Price</Text>
                <TextInput
                  style={styles.textInput}
                  value={limitPrice}
                  onChangeText={setLimitPrice}
                  placeholder="1.0000"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            )}

            {/* Stop Loss & Take Profit */}
            <View style={styles.rowInputGroup}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Stop Loss</Text>
                <TextInput
                  style={styles.textInput}
                  value={stopLoss}
                  onChangeText={setStopLoss}
                  placeholder="Optional"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Take Profit</Text>
                <TextInput
                  style={styles.textInput}
                  value={takeProfit}
                  onChangeText={setTakeProfit}
                  placeholder="Optional"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {/* Leverage */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Leverage</Text>
              <View style={styles.leverageSelector}>
                {['50', '100', '200', '500'].map((lev) => (
                  <TouchableOpacity
                    key={lev}
                    style={[
                      styles.leverageButton,
                      leverage === lev && styles.activeLeverageButton
                    ]}
                    onPress={() => setLeverage(lev)}
                  >
                    <Text style={[
                      styles.leverageText,
                      leverage === lev && styles.activeLeverageText
                    ]}>
                      1:{lev}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Current Price Display */}
            {priceData[selectedPair] && (
              <View style={styles.currentPriceDisplay}>
                <Text style={styles.currentPriceLabel}>Current Prices</Text>
                <View style={styles.currentPriceRow}>
                  <View style={styles.currentPriceItem}>
                    <Text style={styles.currentPriceType}>BID</Text>
                    <Text style={[styles.currentPriceValue, { color: colors.error }]}>
                      {priceData[selectedPair].bid.toFixed(5)}
                    </Text>
                  </View>
                  <View style={styles.currentPriceItem}>
                    <Text style={styles.currentPriceType}>ASK</Text>
                    <Text style={[styles.currentPriceValue, { color: colors.success }]}>
                      {priceData[selectedPair].ask.toFixed(5)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Trade Button */}
          <View style={styles.tradePanelFooter}>
            <TouchableOpacity
              style={[
                styles.executeTradeButton,
                tradeType === 'buy' ? styles.buyTradeButton : styles.sellTradeButton,
                isLoading && styles.disabledButton
              ]}
              onPress={handleTrade}
              disabled={isLoading}
            >
              <Text style={styles.executeTradeButtonText}>
                {isLoading ? 'Executing...' : `${tradeType.toUpperCase()} ${selectedPair}`}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {renderHeader()}
      {renderViewSelector()}
      
      <View style={styles.content}>
        {activeView === 'chart' && renderChartView()}
        {activeView === 'watchlist' && renderWatchlistView()}
        {activeView === 'positions' && renderPositionsView()}
      </View>

      {renderTradePanel()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.white,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.8,
    marginTop: 2,
  },
  tradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tradeButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  marketSummary: {
    marginTop: spacing.md,
  },
  marketItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    minWidth: 90,
    alignItems: 'center',
  },
  selectedMarketItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  marketPair: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  marketPrice: {
    ...typography.small,
    color: colors.white,
    marginTop: 2,
  },
  marketChange: {
    ...typography.small,
    marginTop: 2,
    fontWeight: '500',
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  viewTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  activeViewTab: {
    backgroundColor: colors.primary + '20',
  },
  viewTabText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  activeViewTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  timeframeContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeframeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    marginRight: spacing.xs,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTimeframeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeframeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTimeframeText: {
    color: colors.white,
    fontWeight: '600',
  },
  chartWrapper: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  priceInfo: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  priceLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  currentPrice: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  bidAskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bidAsk: {
    alignItems: 'center',
    flex: 1,
  },
  bidAskLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  bidAskPrice: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  watchlistContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  watchlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  watchlistLeft: {
    flex: 2,
  },
  watchlistPair: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  watchlistSpread: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  watchlistCenter: {
    flex: 2,
    alignItems: 'center',
  },
  watchlistBid: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  watchlistAsk: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  watchlistRight: {
    flex: 2,
    alignItems: 'flex-end',
  },
  watchlistChange: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  quickTradeButtons: {
    flexDirection: 'row',
  },
  quickTradeBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
  quickTradeBtnText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  positionsContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  emptyPositions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyPositionsText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptyPositionsSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  positionItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  positionPair: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  positionType: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: 6,
    backgroundColor: colors.background,
  },
  positionDetails: {
    gap: spacing.sm,
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  positionValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  positionPnl: {
    ...typography.body,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  tradePanel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tradePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tradePanelTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  tradePanelContent: {
    flex: 1,
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  symbolSelector: {
    flexDirection: 'row',
  },
  symbolButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedSymbolButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  symbolButtonText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  selectedSymbolButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  tradeTypeSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tradeTypeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  buyButton: {
    borderRightWidth: 0.5,
    borderRightColor: colors.border,
  },
  sellButton: {
    borderLeftWidth: 0.5,
    borderLeftColor: colors.border,
  },
  activeBuyButton: {
    backgroundColor: colors.success,
  },
  activeSellButton: {
    backgroundColor: colors.error,
  },
  tradeTypeText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  activeTradeTypeText: {
    color: colors.white,
  },
  orderTypeSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderTypeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRightWidth: 0.5,
    borderRightColor: colors.border,
  },
  activeOrderTypeButton: {
    backgroundColor: colors.primary,
  },
  orderTypeText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  activeOrderTypeText: {
    color: colors.white,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    ...typography.body,
    color: colors.textPrimary,
  },
  rowInputGroup: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  halfInput: {
    flex: 1,
  },
  leverageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leverageButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeLeverageButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  leverageText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  activeLeverageText: {
    color: colors.white,
    fontWeight: '600',
  },
  currentPriceDisplay: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  currentPriceLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  currentPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  currentPriceItem: {
    alignItems: 'center',
  },
  currentPriceType: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  currentPriceValue: {
    ...typography.h4,
    fontWeight: 'bold',
  },
  tradePanelFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  executeTradeButton: {
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyTradeButton: {
    backgroundColor: colors.success,
  },
  sellTradeButton: {
    backgroundColor: colors.error,
  },
  disabledButton: {
    opacity: 0.6,
  },
  executeTradeButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default TradingScreen;
