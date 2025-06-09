import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Animated,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  
  // Chart data and basic state
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Trading panel state
  const [showTradingPanel, setShowTradingPanel] = useState(false);
  const [showOrderBook, setShowOrderBook] = useState(false);
  const [showPositions, setShowPositions] = useState(false);
  
  // Chart settings
  const [showGridLines, setShowGridLines] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showIndicators, setShowIndicators] = useState(false);
  const [chartType, setChartType] = useState('candlestick');
  
  // Trading state
  const [orderType, setOrderType] = useState('market'); // market, limit, stop
  const [tradeDirection, setTradeDirection] = useState('buy');
  const [lotSize, setLotSize] = useState('0.01');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  
  // Zoom and pan state
  const zoomLevel = useRef(new Animated.Value(1)).current;
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  
  // Overlay animation
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
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

  const priceAnimValue = useRef(new Animated.Value(initialPrice)).current;

  useEffect(() => {
    loadChartData();
    
    // Start real-time price updates with animation
    const interval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 0.001;
      const newPrice = currentPrice + variation;
      
      setCurrentPrice(newPrice);
      
      // Animate price change
      if (chartSettings.animations) {
        Animated.spring(priceAnimValue, {
          toValue: newPrice,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      }

      // Update chart data with new candle
      setChartData(prevData => {
        if (prevData.length === 0) return prevData;
        
        const lastCandle = prevData[prevData.length - 1];
        const now = Date.now();
        
        // Update last candle or create new one based on timeframe
        const timeframeDuration = getTimeframeDuration(selectedTimeframe);
        const shouldCreateNewCandle = now - lastCandle.timestamp > timeframeDuration;
        
        if (shouldCreateNewCandle) {
          // Create new candle
          const newCandle: CandleData = {
            timestamp: now,
            open: lastCandle.close,
            high: Math.max(lastCandle.close, newPrice),
            low: Math.min(lastCandle.close, newPrice),
            close: newPrice,
            volume: Math.random() * 1000000,
          };
          return [...prevData.slice(-100), newCandle]; // Keep last 100 candles
        } else {
          // Update last candle
          const updatedCandle = {
            ...lastCandle,
            high: Math.max(lastCandle.high, newPrice),
            low: Math.min(lastCandle.low, newPrice),
            close: newPrice,
          };
          return [...prevData.slice(0, -1), updatedCandle];
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedTimeframe, chartSettings.animations]);

  const getTimeframeDuration = (timeframe: string): number => {
    const durations: { [key: string]: number } = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
    };
    return durations[timeframe] || 60 * 60 * 1000;
  };

  const loadChartData = async () => {
    setIsLoading(true);
    try {
      const data = await advancedMarketDataService.generateHistoricalData(symbol, selectedTimeframe);
      setChartData(data);
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
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    StatusBar.setHidden(newFullscreenState);
  };

  const toggleControlsOverlay = () => {
    setShowControlsOverlay(!showControlsOverlay);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
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
            { color: currentPrice > initialPrice ? colors.status.success : colors.status.error }
          ]}>
            {currentPrice.toFixed(5)}
          </Animated.Text>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        {!isFullscreen && (
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={toggleControlsOverlay}
          >
            <Ionicons 
              name="settings-outline" 
              size={20} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>
        )}
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
          style={styles.headerButton}
          onPress={() => setShowOrderPanel(!showOrderPanel)}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={20} 
            color={colors.primary[500]} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderControlsOverlay = () => {
    if (!showControlsOverlay) return null;

    return (
      <View style={styles.overlayContainer}>
        <TouchableOpacity 
          style={styles.overlayBackdrop} 
          onPress={() => setShowControlsOverlay(false)}
          activeOpacity={1}
        />
        <View style={styles.controlsOverlay}>
          <View style={styles.overlayHeader}>
            <Text style={styles.overlayTitle}>Chart Controls</Text>
            <TouchableOpacity 
              style={styles.overlayCloseButton}
              onPress={() => setShowControlsOverlay(false)}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.overlayContent} showsVerticalScrollIndicator={false}>
            {/* Market Info */}
            <View style={styles.overlaySection}>
              <Text style={styles.overlaySectionTitle}>Market Info</Text>
              <View style={styles.marketInfoGrid}>
                <View style={styles.marketInfoItem}>
                  <Text style={styles.marketInfoLabel}>BID</Text>
                  <Text style={styles.marketInfoValue}>{(currentPrice - 0.00010).toFixed(5)}</Text>
                </View>
                <View style={styles.marketInfoItem}>
                  <Text style={styles.marketInfoLabel}>ASK</Text>
                  <Text style={styles.marketInfoValue}>{(currentPrice + 0.00010).toFixed(5)}</Text>
                </View>
                <View style={styles.marketInfoItem}>
                  <Text style={styles.marketInfoLabel}>SPREAD</Text>
                  <Text style={styles.marketInfoValue}>2.0 pips</Text>
                </View>
                <View style={styles.marketInfoItem}>
                  <Text style={styles.marketInfoLabel}>VOLUME</Text>
                  <Text style={styles.marketInfoValue}>1.2M</Text>
                </View>
              </View>
            </View>

            {/* Zoom Controls */}
            <View style={styles.overlaySection}>
              <Text style={styles.overlaySectionTitle}>Zoom Controls</Text>
              <View style={styles.zoomControls}>
                <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
                  <Ionicons name="remove" size={20} color={colors.text.primary} />
                  <Text style={styles.zoomButtonText}>Zoom Out</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.zoomButton} onPress={resetZoom}>
                  <Text style={styles.zoomButtonText}>Reset (1:1)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
                  <Ionicons name="add" size={20} color={colors.text.primary} />
                  <Text style={styles.zoomButtonText}>Zoom In</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.zoomLevel}>Current Zoom: {Math.round(zoomLevel * 100)}%</Text>
            </View>

            {/* Chart Settings */}
            <View style={styles.overlaySection}>
              <Text style={styles.overlaySectionTitle}>Chart Settings</Text>
              
              <TouchableOpacity 
                style={[styles.toggleButton, showGridLines && styles.toggleButtonActive]}
                onPress={() => setShowGridLines(!showGridLines)}
              >
                <Ionicons 
                  name="grid-outline" 
                  size={20} 
                  color={showGridLines ? colors.primary[500] : colors.text.secondary} 
                />
                <Text style={[
                  styles.toggleButtonText,
                  showGridLines && styles.toggleButtonTextActive
                ]}>
                  Grid Lines
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.toggleButton, chartSettings.showVolume && styles.toggleButtonActive]}
                onPress={() => setChartSettings(prev => ({ ...prev, showVolume: !prev.showVolume }))}
              >
                <Ionicons 
                  name="bar-chart-outline" 
                  size={20} 
                  color={chartSettings.showVolume ? colors.primary[500] : colors.text.secondary} 
                />
                <Text style={[
                  styles.toggleButtonText,
                  chartSettings.showVolume && styles.toggleButtonTextActive
                ]}>
                  Volume
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.toggleButton, chartSettings.showCrosshair && styles.toggleButtonActive]}
                onPress={() => setChartSettings(prev => ({ ...prev, showCrosshair: !prev.showCrosshair }))}
              >
                <Ionicons 
                  name="add-outline" 
                  size={20} 
                  color={chartSettings.showCrosshair ? colors.primary[500] : colors.text.secondary} 
                />
                <Text style={[
                  styles.toggleButtonText,
                  chartSettings.showCrosshair && styles.toggleButtonTextActive
                ]}>
                  Crosshair
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.toggleButton, chartSettings.animations && styles.toggleButtonActive]}
                onPress={() => setChartSettings(prev => ({ ...prev, animations: !prev.animations }))}
              >
                <Ionicons 
                  name="play-outline" 
                  size={20} 
                  color={chartSettings.animations ? colors.primary[500] : colors.text.secondary} 
                />
                <Text style={[
                  styles.toggleButtonText,
                  chartSettings.animations && styles.toggleButtonTextActive
                ]}>
                  Animations
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderQuickOrderPanel = () => {
    if (!showOrderPanel) return null;
    
    return (
      <View style={styles.quickOrderPanel}>
        <Text style={styles.quickOrderTitle}>Quick Order</Text>
        <View style={styles.quickOrderButtons}>
          <TouchableOpacity style={[styles.quickOrderBtn, styles.buyButton]}>
            <Text style={styles.quickOrderBtnText}>BUY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickOrderBtn, styles.sellButton]}>
            <Text style={styles.quickOrderBtnText}>SELL</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMarketInfo = () => (
    <View style={styles.marketInfo}>
      <View style={styles.marketInfoItem}>
        <Text style={styles.marketInfoLabel}>BID</Text>
        <Text style={styles.marketInfoValue}>{(currentPrice - 0.00010).toFixed(5)}</Text>
      </View>
      <View style={styles.marketInfoItem}>
        <Text style={styles.marketInfoLabel}>ASK</Text>
        <Text style={styles.marketInfoValue}>{(currentPrice + 0.00010).toFixed(5)}</Text>
      </View>
      <View style={styles.marketInfoItem}>
        <Text style={styles.marketInfoLabel}>SPREAD</Text>
        <Text style={styles.marketInfoValue}>2.0 pips</Text>
      </View>
      <View style={styles.marketInfoItem}>
        <Text style={styles.marketInfoLabel}>VOLUME</Text>
        <Text style={styles.marketInfoValue}>1.2M</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.background.primary}
        hidden={isFullscreen}
      />
      
      {!isFullscreen && renderHeader()}
      
      <View style={styles.content}>
        {!isFullscreen && renderMarketInfo()}
        {renderQuickOrderPanel()}
        
        <View style={[styles.chartContainer, isFullscreen && styles.fullscreenChart]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading chart data...</Text>
            </View>
          ) : (
            <TradingChart
              symbol={symbol}
              data={chartData}
              currentPrice={currentPrice}
              selectedTimeframe={selectedTimeframe}
              onTimeframeChange={handleTimeframeChange}
              isFullscreen={isFullscreen}
              chartHeight={isFullscreen ? height * 0.9 : height * 0.7}
              chartWidth={width - 20}
              showGridLines={showGridLines}
              zoomLevel={zoomLevel}
              chartSettings={chartSettings}
            />
          )}
        </View>
        
        {/* Controls Overlay */}
        {renderControlsOverlay()}
        
        {isFullscreen && (
          <View style={styles.fullscreenControls}>
            <TouchableOpacity 
              style={styles.fullscreenControlButton}
              onPress={toggleControlsOverlay}
            >
              <Ionicons name="settings-outline" size={20} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.fullscreenExitBtn}
              onPress={toggleFullscreen}
            >
              <Ionicons name="contract" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    minHeight: 56,
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
    minHeight: 40,
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
    fontSize: 18,
    lineHeight: 24,
  },
  priceText: {
    ...typography.styles.h5,
    fontWeight: 'bold',
    marginTop: spacing[1],
    fontSize: 16,
    lineHeight: 22,
  },
  headerButton: {
    padding: spacing[2],
    marginLeft: spacing[2],
    backgroundColor: colors.background.elevated,
    borderRadius: spacing[2],
    minHeight: 36,
    minWidth: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  marketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.background.elevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  marketInfoItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing[1],
    minHeight: 40,
  },
  marketInfoLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing[1],
    fontSize: 12,
    lineHeight: 16,
  },
  marketInfoValue: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 18,
  },
  quickOrderPanel: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  quickOrderTitle: {
    ...typography.styles.h6,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  quickOrderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickOrderBtn: {
    flex: 1,
    paddingVertical: spacing[3],
    marginHorizontal: spacing[2],
    borderRadius: spacing[2],
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  buyButton: {
    backgroundColor: colors.status.success,
  },
  sellButton: {
    backgroundColor: colors.status.error,
  },
  quickOrderBtnText: {
    ...typography.styles.h6,
    color: colors.text.inverse,
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 20,
  },
  chartContainer: {
    flex: 1,
    padding: spacing[2],
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
    flexDirection: 'column',
    gap: spacing[2],
  },
  fullscreenControlButton: {
    backgroundColor: colors.background.elevated + 'CC',
    borderRadius: spacing[3],
    padding: spacing[2],
    minHeight: 40,
    minWidth: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  fullscreenExitBtn: {
    backgroundColor: colors.background.elevated + 'CC',
    borderRadius: spacing[3],
    padding: spacing[3],
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Overlay Styles
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlsOverlay: {
    backgroundColor: colors.background.primary,
    borderRadius: spacing[3],
    width: width * 0.9,
    maxHeight: height * 0.8,
    marginHorizontal: spacing[4],
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  overlayTitle: {
    ...typography.styles.h5,
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 24,
  },
  overlayCloseButton: {
    padding: spacing[1],
    minHeight: 32,
    minWidth: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  overlaySection: {
    marginBottom: spacing[4],
  },
  overlaySectionTitle: {
    ...typography.styles.h6,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing[3],
    fontSize: 16,
    lineHeight: 22,
  },
  marketInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  zoomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  zoomButton: {
    flex: 1,
    backgroundColor: colors.background.elevated,
    borderRadius: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    marginHorizontal: spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    flexDirection: 'row',
  },
  zoomButtonText: {
    ...typography.styles.caption,
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    marginLeft: spacing[1],
  },
  zoomLevel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    marginBottom: spacing[2],
    minHeight: 44,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary[100],
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  toggleButtonText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing[2],
    fontSize: 13,
    lineHeight: 18,
  },
  toggleButtonTextActive: {
    color: colors.primary[500],
    fontWeight: '600',
  },
});

export default ChartScreen;
