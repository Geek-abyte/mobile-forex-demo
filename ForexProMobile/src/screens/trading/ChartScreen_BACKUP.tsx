import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  TextInput,
  PanResponder,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import TradingChart, { CandleData } from '../../components/organisms/TradingChart';
import { advancedMarketDataService } from '../../services/advancedMarketDataService';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Chart: {
    symbol: string;
    currentPrice: number;
  };
};

type ChartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chart'>;
type ChartScreenRouteProp = RouteProp<RootStackParamList, 'Chart'>;

interface Props {
  navigation: ChartScreenNavigationProp;
  route: ChartScreenRouteProp;
}

const ChartScreen: React.FC<Props> = ({ navigation, route }) => {
  const { symbol, currentPrice: initialPrice } = route.params;
  const insets = useSafeAreaInsets();
  
  // Chart data and basic state
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Chart settings
  const [showGridLines, setShowGridLines] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [chartType, setChartType] = useState('candlestick');
  
  // Natural pan and zoom state (like image viewer)
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Gesture state tracking
  const [lastScale, setLastScale] = useState(1);
  const [lastOffset, setLastOffset] = useState({ x: 0, y: 0 });
  
  // Simple trading panel state
  const [showTradingPanel, setShowTradingPanel] = useState(false);
  
  // Simplified trading state
  const [tradeDirection, setTradeDirection] = useState('buy');
  const [lotSize, setLotSize] = useState('0.01');
  
  // Animations
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const priceAnimValue = useRef(new Animated.Value(initialPrice)).current;
  
  // Market info state
  const [marketInfo, setMarketInfo] = useState({
    bid: 0,
    ask: 0,
    spread: 0,
    volume: '0',
    high24h: 0,
    low24h: 0,
    change24h: 0,
    changePercent24h: 0,
  });

  // Distance calculation for pinch gestures
  const getDistance = (touches: any[]) => {
    const [touch1, touch2] = touches;
    return Math.sqrt(
      Math.pow(touch1.pageX - touch2.pageX, 2) + 
      Math.pow(touch1.pageY - touch2.pageY, 2)
    );
  };
  
  // Natural pan and zoom gesture handler (like image viewer)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Handle all touch gestures naturally
        return evt.nativeEvent.touches.length >= 1 || Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onMoveShouldSetPanResponderCapture: (evt) => {
        // Capture multi-touch gestures immediately
        return evt.nativeEvent.touches.length > 1;
      },
      onPanResponderGrant: () => {
        // Store current transform values when gesture starts
        scale.stopAnimation((value) => setLastScale(value));
        translateX.stopAnimation((x) => {
          translateY.stopAnimation((y) => {
            setLastOffset({ x, y });
          });
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        
        if (touches.length === 2) {
          // Pinch to zoom (natural like photo viewer)
          const currentDistance = getDistance(touches);
          
          if (gestureState.numberActiveTouches === 2) {
            const initialDistance = getDistance([
              { pageX: touches[0].pageX - gestureState.dx, pageY: touches[0].pageY - gestureState.dy },
              { pageX: touches[1].pageX - gestureState.dx, pageY: touches[1].pageY - gestureState.dy }
            ]);
            
            if (initialDistance > 50) { // Minimum distance threshold
              const scaleRatio = currentDistance / initialDistance;
              const newScale = Math.max(0.3, Math.min(5, lastScale * scaleRatio));
              scale.setValue(newScale);
            }
          }
        } else if (touches.length === 1) {
          // Pan with single finger (natural drag)
          translateX.setValue(lastOffset.x + gestureState.dx);
          translateY.setValue(lastOffset.y + gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        // Update last values for next gesture
        scale.stopAnimation((value) => setLastScale(value));
        translateX.stopAnimation((x) => {
          translateY.stopAnimation((y) => {
            setLastOffset({ x, y });
          });
        });
      },
    })
  ).current;

  useEffect(() => {
    loadChartData();
    
    // Start real-time price updates
    const interval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 0.001;
      const newPrice = currentPrice + variation;
      
      setCurrentPrice(newPrice);
      
      // Animate price change
      Animated.timing(priceAnimValue, {
        toValue: newPrice,
        duration: 500,
        useNativeDriver: false,
      }).start();
      
      // Update market info
      setMarketInfo(prev => ({
        ...prev,
        bid: newPrice - 0.00010,
        ask: newPrice + 0.00010,
        spread: 2.0,
        change24h: newPrice - initialPrice,
        changePercent24h: ((newPrice - initialPrice) / initialPrice) * 100,
      }));
      
      // Update chart data with new candle
      setChartData(prevData => {
        if (prevData.length === 0) return prevData;
        
        const lastCandle = prevData[prevData.length - 1];
        const updatedCandle = {
          ...lastCandle,
          close: newPrice,
          high: Math.max(lastCandle.high, newPrice),
          low: Math.min(lastCandle.low, newPrice),
        };
        
        return [...prevData.slice(0, -1), updatedCandle];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const loadChartData = async () => {
    setIsLoading(true);
    try {
      const data = await advancedMarketDataService.generateHistoricalData(symbol, selectedTimeframe);
      setChartData(data);
      
      if (data.length > 0) {
        const latestCandle = data[data.length - 1];
        setMarketInfo(prev => ({
          ...prev,
          high24h: Math.max(...data.slice(-24).map(d => d.high)),
          low24h: Math.min(...data.slice(-24).map(d => d.low)),
        }));
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
      Alert.alert('Error', 'Failed to load chart data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    StatusBar.setHidden(!isFullscreen);
  };

  const toggleTradingPanel = () => {
    const toValue = showTradingPanel ? 0 : 1;
    setShowTradingPanel(!showTradingPanel);
    
    Animated.timing(overlayOpacity, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handlePlaceOrder = () => {
    Alert.alert(
      'Order Placed',
      `${tradeDirection.toUpperCase()} ${lotSize} lots of ${symbol}\nPrice: ${currentPrice.toFixed(5)}\nStop Loss: ${stopLoss || 'None'}\nTake Profit: ${takeProfit || 'None'}`,
      [{ text: 'OK' }]
    );
    setShowTradingPanel(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.symbolInfo}>
          <Text style={styles.symbolText}>{symbol}</Text>
          <Animated.Text style={[
            styles.priceText,
            { color: marketInfo.change24h >= 0 ? colors.status.success : colors.status.error }
          ]}>
            {currentPrice.toFixed(5)}
          </Animated.Text>
          <Text style={[
            styles.changeText,
            { color: marketInfo.change24h >= 0 ? colors.status.success : colors.status.error }
          ]}>
            {marketInfo.change24h >= 0 ? '+' : ''}{marketInfo.changePercent24h.toFixed(2)}%
          </Text>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={toggleFullscreen}
        >
          <Ionicons 
            name={isFullscreen ? "contract" : "expand"} 
            size={20} 
            color={colors.text.secondary} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.headerButton, showTradingPanel && styles.headerButtonActive]}
          onPress={toggleTradingPanel}
        >
          <MaterialIcons 
            name="timeline" 
            size={20} 
            color={showTradingPanel ? colors.primary[500] : colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMarketInfo = () => (
    <View style={styles.marketInfoContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marketInfo}>
        <View style={styles.marketInfoItem}>
          <Text style={styles.marketInfoLabel}>BID</Text>
          <Text style={styles.marketInfoValue}>{marketInfo.bid.toFixed(5)}</Text>
        </View>
        <View style={styles.marketInfoItem}>
          <Text style={styles.marketInfoLabel}>ASK</Text>
          <Text style={styles.marketInfoValue}>{marketInfo.ask.toFixed(5)}</Text>
        </View>
        <View style={styles.marketInfoItem}>
          <Text style={styles.marketInfoLabel}>SPREAD</Text>
          <Text style={styles.marketInfoValue}>{marketInfo.spread} pips</Text>
        </View>
        <View style={styles.marketInfoItem}>
          <Text style={styles.marketInfoLabel}>HIGH 24H</Text>
          <Text style={styles.marketInfoValue}>{marketInfo.high24h.toFixed(5)}</Text>
        </View>
        <View style={styles.marketInfoItem}>
          <Text style={styles.marketInfoLabel}>LOW 24H</Text>
          <Text style={styles.marketInfoValue}>{marketInfo.low24h.toFixed(5)}</Text>
        </View>
        <View style={styles.marketInfoItem}>
          <Text style={styles.marketInfoLabel}>VOLUME</Text>
          <Text style={styles.marketInfoValue}>{marketInfo.volume}</Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderTradingPanel = () => {
    if (!showTradingPanel) return null;
    
    return (
      <Animated.View style={[styles.sidePanelOverlay, { opacity: overlayOpacity }]}>
        <SafeAreaView style={styles.sidePanel} edges={['top', 'right']}>
          <View style={[styles.sidePanelHeader, { paddingTop: Math.max(insets.top, spacing[3]) }]}>
            <Text style={styles.sidePanelTitle}>Trading Panel</Text>
            <TouchableOpacity onPress={toggleTradingPanel}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.sidePanelContent}>
            {/* Order Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Type</Text>
              <View style={styles.buttonGroup}>
                {['market', 'limit', 'stop'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.segmentButton,
                      orderType === type && styles.segmentButtonActive
                    ]}
                    onPress={() => setOrderType(type)}
                  >
                    <Text style={[
                      styles.segmentButtonText,
                      orderType === type && styles.segmentButtonTextActive
                    ]}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Buy/Sell Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Direction</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.directionButton,
                    styles.buyButton,
                    tradeDirection === 'buy' && styles.directionButtonActive
                  ]}
                  onPress={() => setTradeDirection('buy')}
                >
                  <Text style={styles.directionButtonText}>BUY</Text>
                  <Text style={styles.directionPrice}>{marketInfo.ask.toFixed(5)}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.directionButton,
                    styles.sellButton,
                    tradeDirection === 'sell' && styles.directionButtonActive
                  ]}
                  onPress={() => setTradeDirection('sell')}
                >
                  <Text style={styles.directionButtonText}>SELL</Text>
                  <Text style={styles.directionPrice}>{marketInfo.bid.toFixed(5)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Lot Size */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lot Size</Text>
              <TextInput
                style={styles.input}
                value={lotSize}
                onChangeText={setLotSize}
                keyboardType="decimal-pad"
                placeholder="0.01"
              />
            </View>

            {/* Limit Price (for limit orders) */}
            {orderType === 'limit' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Limit Price</Text>
                <TextInput
                  style={styles.input}
                  value={limitPrice}
                  onChangeText={setLimitPrice}
                  keyboardType="decimal-pad"
                  placeholder={currentPrice.toFixed(5)}
                />
              </View>
            )}

            {/* Stop Loss */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stop Loss</Text>
              <TextInput
                style={styles.input}
                value={stopLoss}
                onChangeText={setStopLoss}
                keyboardType="decimal-pad"
                placeholder="Optional"
              />
            </View>

            {/* Take Profit */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Take Profit</Text>
              <TextInput
                style={styles.input}
                value={takeProfit}
                onChangeText={setTakeProfit}
                keyboardType="decimal-pad"
                placeholder="Optional"
              />
            </View>

            {/* Chart Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chart Settings</Text>
              
              <TouchableOpacity
                style={[styles.settingButton, showGridLines && styles.settingButtonActive]}
                onPress={() => setShowGridLines(!showGridLines)}
              >
                <MaterialIcons 
                  name="grid-on" 
                  size={20} 
                  color={showGridLines ? colors.primary[500] : colors.text.secondary} 
                />
                <Text style={[
                  styles.settingButtonText,
                  showGridLines && styles.settingButtonTextActive
                ]}>
                  Grid Lines
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingButton, showVolume && styles.settingButtonActive]}
                onPress={() => setShowVolume(!showVolume)}
              >
                <MaterialIcons 
                  name="bar-chart" 
                  size={20} 
                  color={showVolume ? colors.primary[500] : colors.text.secondary} 
                />
                <Text style={[
                  styles.settingButtonText,
                  showVolume && styles.settingButtonTextActive
                ]}>
                  Volume
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingButton, showCrosshair && styles.settingButtonActive]}
                onPress={() => setShowCrosshair(!showCrosshair)}
              >
                <MaterialIcons 
                  name="my-location" 
                  size={20} 
                  color={showCrosshair ? colors.primary[500] : colors.text.secondary} 
                />
                <Text style={[
                  styles.settingButtonText,
                  showCrosshair && styles.settingButtonTextActive
                ]}>
                  Crosshair
                </Text>
              </TouchableOpacity>
            </View>

            {/* Zoom Controls */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Zoom & Pan</Text>
              
              <View style={styles.zoomControls}>
                <TouchableOpacity
                  style={styles.zoomButton}
                  onPress={() => {
                    const newZoom = Math.max(0.5, zoomLevel - 0.2);
                    setZoomLevel(newZoom);
                  }}
                >
                  <Ionicons name="remove" size={20} color={colors.text.primary} />
                </TouchableOpacity>
                
                <Text style={styles.zoomText}>{Math.round(zoomLevel * 100)}%</Text>
                
                <TouchableOpacity
                  style={styles.zoomButton}
                  onPress={() => {
                    const newZoom = Math.min(3, zoomLevel + 0.2);
                    setZoomLevel(newZoom);
                  }}
                >
                  <Ionicons name="add" size={20} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.resetZoomButton}
                onPress={() => {
                  setZoomLevel(1);
                }}
              >
                <Text style={styles.resetZoomText}>Reset Zoom</Text>
              </TouchableOpacity>
              
              <Text style={styles.zoomHint}>💡 Pinch to zoom on chart</Text>
            </View>

            {/* Place Order Button */}
            <TouchableOpacity
              style={[
                styles.placeOrderButton,
                tradeDirection === 'buy' ? styles.buyOrderButton : styles.sellOrderButton
              ]}
              onPress={handlePlaceOrder}
            >
              <Text style={styles.placeOrderButtonText}>
                {tradeDirection.toUpperCase()} {lotSize} LOTS
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.background.primary}
        hidden={isFullscreen}
      />
      
      {!isFullscreen && renderHeader()}
      {!isFullscreen && renderMarketInfo()}
      
      <View style={styles.content}>
        <View style={[styles.chartContainer, isFullscreen && styles.fullscreenChart]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading chart data...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              scrollEnabled={zoomLevel > 1}
              {...panResponder.panHandlers}
              style={styles.chartScrollContainer}
              contentContainerStyle={{
                minWidth: (showTradingPanel ? width * 0.7 : width - 20) * zoomLevel,
                minHeight: (isFullscreen ? height * 0.9 : height * 0.65) * zoomLevel,
              }}
            >
              <Animated.View 
                style={[
                  styles.chartWrapper,
                  {
                    transform: [
                      { translateX: panX },
                      { translateY: panY }
                    ]
                  }
                ]}
              >
                <TradingChart
                  symbol={symbol}
                  data={chartData}
                  currentPrice={currentPrice}
                  selectedTimeframe={selectedTimeframe}
                  onTimeframeChange={handleTimeframeChange}
                  isFullscreen={isFullscreen}
                  chartHeight={(isFullscreen ? height * 0.9 : height * 0.65) * zoomLevel}
                  chartWidth={(showTradingPanel ? width * 0.7 : width - 20) * zoomLevel}
                  showGridLines={showGridLines}
                  showVolume={showVolume}
                  showCrosshair={showCrosshair}
                  chartType={chartType}
                />
              </Animated.View>
            </ScrollView>
          )}
        </View>
        
        {isFullscreen && (
          <View style={styles.fullscreenControls}>
            <TouchableOpacity 
              style={styles.fullscreenButton}
              onPress={toggleFullscreen}
            >
              <Ionicons name="contract" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fullscreenButton, { marginTop: spacing[2] }]}
              onPress={toggleTradingPanel}
            >
              <MaterialIcons name="timeline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {renderTradingPanel()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  fullscreenContainer: {
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    minHeight: 70,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: spacing[2],
    marginRight: spacing[3],
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolInfo: {
    flex: 1,
    paddingVertical: spacing[1],
  },
  symbolText: {
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 22,
    lineHeight: 28,
  },
  priceText: {
    ...typography.styles.h5,
    fontWeight: 'bold',
    marginTop: spacing[1],
    fontSize: 18,
    lineHeight: 24,
  },
  changeText: {
    ...typography.styles.caption,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
  },
  headerButton: {
    padding: spacing[2],
    marginLeft: spacing[2],
    backgroundColor: colors.background.elevated,
    borderRadius: spacing[2],
    minHeight: 40,
    minWidth: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonActive: {
    backgroundColor: colors.primary[100],
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  marketInfoContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  marketInfo: {
    backgroundColor: colors.background.elevated,
    paddingVertical: spacing[2],
  },
  marketInfoItem: {
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    minWidth: 80,
    paddingVertical: spacing[1],
  },
  marketInfoLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing[1],
    fontSize: 11,
    lineHeight: 14,
  },
  marketInfoValue: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 13,
    lineHeight: 17,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  chartContainer: {
    flex: 1,
    padding: spacing[2],
  },
  chartScrollContainer: {
    flex: 1,
  },
  fullscreenChart: {
    flex: 1,
    padding: spacing[1],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 22,
  },
  fullscreenControls: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    zIndex: 1000,
  },
  fullscreenButton: {
    backgroundColor: colors.background.elevated + 'DD',
    borderRadius: spacing[3],
    padding: spacing[3],
    minHeight: 50,
    minWidth: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidePanelOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: width * 0.35,
    backgroundColor: colors.background.primary + 'F5',
    borderLeftWidth: 1,
    borderLeftColor: colors.border.primary,
    zIndex: 1000,
  },
  sidePanel: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  sidePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    minHeight: 60,
  },
  sidePanelTitle: {
    ...typography.styles.h6,
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22,
  },
  sidePanelContent: {
    flex: 1,
    padding: spacing[3],
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing[2],
    fontSize: 14,
    lineHeight: 18,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  segmentButton: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    backgroundColor: colors.background.elevated,
    borderRadius: spacing[1],
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: colors.primary[500],
  },
  segmentButtonText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
  },
  segmentButtonTextActive: {
    color: colors.text.inverse,
  },
  directionButton: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    borderRadius: spacing[1],
    alignItems: 'center',
    marginHorizontal: spacing[1],
    minHeight: 50,
    justifyContent: 'center',
  },
  directionButtonActive: {
    borderWidth: 2,
    borderColor: colors.text.inverse,
  },
  buyButton: {
    backgroundColor: colors.status.success,
  },
  sellButton: {
    backgroundColor: colors.status.error,
  },
  directionButtonText: {
    ...typography.styles.bodySmall,
    color: colors.text.inverse,
    fontWeight: 'bold',
    fontSize: 12,
    lineHeight: 16,
  },
  directionPrice: {
    ...typography.styles.caption,
    color: colors.text.inverse,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  input: {
    backgroundColor: colors.background.elevated,
    borderRadius: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 18,
    minHeight: 36,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    marginBottom: spacing[1],
    minHeight: 36,
  },
  settingButtonActive: {
    backgroundColor: colors.primary[100],
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  settingButtonText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginLeft: spacing[2],
    fontSize: 12,
    lineHeight: 16,
  },
  settingButtonTextActive: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  placeOrderButton: {
    paddingVertical: spacing[3],
    borderRadius: spacing[2],
    alignItems: 'center',
    marginTop: spacing[4],
    minHeight: 44,
    justifyContent: 'center',
  },
  buyOrderButton: {
    backgroundColor: colors.status.success,
  },
  sellOrderButton: {
    backgroundColor: colors.status.error,
  },
  placeOrderButtonText: {
    ...typography.styles.h6,
    color: colors.text.inverse,
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 18,
  },
  chartWrapper: {
    flex: 1,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  zoomButton: {
    backgroundColor: colors.background.elevated,
    borderRadius: spacing[2],
    padding: spacing[2],
    marginHorizontal: spacing[1],
    minHeight: 36,
    minWidth: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomText: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
    marginHorizontal: spacing[3],
    fontSize: 14,
    lineHeight: 18,
  },
  resetZoomButton: {
    backgroundColor: colors.primary[500],
    borderRadius: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    marginBottom: spacing[2],
    minHeight: 36,
  },
  resetZoomText: {
    ...typography.styles.bodySmall,
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
  },
  zoomHint: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
  },
});

export default ChartScreen;
