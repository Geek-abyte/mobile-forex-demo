import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../../theme';

const { width } = Dimensions.get('window');

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface TechnicalIndicator {
  name: string;
  values: Array<{ timestamp: number; value: number }>;
  color: string;
  visible: boolean;
}

interface ProfessionalTradingChartProps {
  symbol: string;
  data: CandleData[];
  currentPrice: number;
  onTimeframeChange: (timeframe: string) => void;
  selectedTimeframe: string;
  showVolume?: boolean;
  showIndicators?: boolean;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
}

const ProfessionalTradingChart: React.FC<ProfessionalTradingChartProps> = ({
  symbol,
  data,
  currentPrice,
  onTimeframeChange,
  selectedTimeframe,
  showVolume = true,
  showIndicators = true,
  isFullscreen = false,
  onFullscreenToggle,
}) => {
  const [chartType, setChartType] = useState<'line' | 'candle'>('candle');
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['SMA20']);
  const [showOrderLines, setShowOrderLines] = useState(true);
  const [crosshairData, setCrosshairData] = useState<any>(null);

  const chartOpacity = useSharedValue(1);
  const indicatorPanelHeight = useSharedValue(showIndicators ? 100 : 0);

  const timeframes = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1d', value: '1d' },
  ];

  const indicatorOptions = [
    { key: 'SMA20', label: 'SMA 20', color: colors.chart.bullish },
    { key: 'SMA50', label: 'SMA 50', color: colors.primary[400] },
    { key: 'EMA20', label: 'EMA 20', color: colors.secondary[500] },
    { key: 'EMA50', label: 'EMA 50', color: colors.secondary[300] },
    { key: 'BB', label: 'Bollinger Bands', color: colors.text.tertiary },
    { key: 'RSI', label: 'RSI', color: colors.status.warning },
    { key: 'MACD', label: 'MACD', color: colors.status.info },
  ];

  // Convert data for wagmi charts format
  const formattedData = useMemo(() => {
    return data.map(candle => ({
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
  }, [data]);

  // Calculate Simple Moving Average
  const calculateSMA = (period: number): TechnicalIndicator => {
    if (data.length < period) return { name: `SMA${period}`, values: [], color: colors.chart.bullish, visible: true };
    
    const smaValues = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, candle) => acc + candle.close, 0);
      smaValues.push({
        timestamp: data[i].timestamp,
        value: sum / period,
      });
    }
    
    return {
      name: `SMA${period}`,
      values: smaValues,
      color: period === 20 ? colors.chart.bullish : colors.primary[400],
      visible: activeIndicators.includes(`SMA${period}`),
    };
  };

  // Calculate Exponential Moving Average
  const calculateEMA = (period: number): TechnicalIndicator => {
    if (data.length < period) return { name: `EMA${period}`, values: [], color: colors.secondary[500], visible: true };
    
    const emaValues = [];
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((acc, candle) => acc + candle.close, 0) / period;
    
    emaValues.push({ timestamp: data[period - 1].timestamp, value: ema });
    
    for (let i = period; i < data.length; i++) {
      ema = (data[i].close - ema) * multiplier + ema;
      emaValues.push({
        timestamp: data[i].timestamp,
        value: ema,
      });
    }
    
    return {
      name: `EMA${period}`,
      values: emaValues,
      color: period === 20 ? colors.secondary[500] : colors.secondary[300],
      visible: activeIndicators.includes(`EMA${period}`),
    };
  };

  // Calculate RSI
  const calculateRSI = (period: number = 14): TechnicalIndicator => {
    if (data.length < period + 1) return { name: 'RSI', values: [], color: colors.status.warning, visible: true };
    
    const rsiValues = [];
    let gains = 0;
    let losses = 0;

    // Initial calculation
    for (let i = 1; i <= period; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) gains += change;
      else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      const rs = avgGain / (avgLoss || 0.00001);
      const rsi = 100 - (100 / (1 + rs));

      rsiValues.push({
        timestamp: data[i].timestamp,
        value: rsi,
      });
    }

    return {
      name: 'RSI',
      values: rsiValues,
      color: colors.status.warning,
      visible: activeIndicators.includes('RSI'),
    };
  };

  // Get current technical indicators
  const technicalIndicators = useMemo(() => {
    const indicators: TechnicalIndicator[] = [];
    
    if (activeIndicators.includes('SMA20')) indicators.push(calculateSMA(20));
    if (activeIndicators.includes('SMA50')) indicators.push(calculateSMA(50));
    if (activeIndicators.includes('EMA20')) indicators.push(calculateEMA(20));
    if (activeIndicators.includes('EMA50')) indicators.push(calculateEMA(50));
    if (activeIndicators.includes('RSI')) indicators.push(calculateRSI());
    
    return indicators;
  }, [data, activeIndicators]);

  const toggleIndicator = (indicatorKey: string) => {
    setActiveIndicators(prev => {
      if (prev.includes(indicatorKey)) {
        return prev.filter(key => key !== indicatorKey);
      } else {
        return [...prev, indicatorKey];
      }
    });
  };

  const animatedChartStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
  }));

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    height: withTiming(indicatorPanelHeight.value),
  }));

  const formatPrice = (price: number) => price.toFixed(5);
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  const chartHeight = isFullscreen ? Dimensions.get('window').height - 100 : 300;

  return (
    <View style={[styles.container, { height: chartHeight + 150 }]}>
      {/* Chart Header */}
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={styles.symbolText}>{symbol}</Text>
          <View style={styles.priceContainer}>
            <Text style={[
              styles.currentPrice,
              { color: data.length > 1 && currentPrice > data[data.length - 2]?.close ? colors.chart.bullish : colors.chart.bearish }
            ]}>
              {formatPrice(currentPrice)}
            </Text>
            {data.length > 1 && (
              <Text style={[
                styles.priceChange,
                { color: currentPrice > data[data.length - 2]?.close ? colors.chart.bullish : colors.chart.bearish }
              ]}>
                {currentPrice > data[data.length - 2]?.close ? '↗' : '↘'} 
                {Math.abs(((currentPrice - data[data.length - 2]?.close) / data[data.length - 2]?.close) * 100).toFixed(2)}%
              </Text>
            )}
          </View>
        </View>

        {onFullscreenToggle && (
          <TouchableOpacity onPress={onFullscreenToggle} style={styles.fullscreenButton}>
            <Ionicons
              name={isFullscreen ? "contract" : "expand"}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Chart Type & Timeframe Controls */}
      <View style={styles.controlsContainer}>
        {/* Chart Type Toggle */}
        <View style={styles.chartTypeContainer}>
          <TouchableOpacity
            style={[styles.chartTypeButton, chartType === 'candle' && styles.chartTypeButtonActive]}
            onPress={() => setChartType('candle')}
          >
            <Ionicons name="stats-chart" size={16} color={chartType === 'candle' ? colors.background.primary : colors.text.secondary} />
            <Text style={[styles.chartTypeText, chartType === 'candle' && styles.chartTypeTextActive]}>
              Candles
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartTypeButton, chartType === 'line' && styles.chartTypeButtonActive]}
            onPress={() => setChartType('line')}
          >
            <Ionicons name="trending-up" size={16} color={chartType === 'line' ? colors.background.primary : colors.text.secondary} />
            <Text style={[styles.chartTypeText, chartType === 'line' && styles.chartTypeTextActive]}>
              Line
            </Text>
          </TouchableOpacity>
        </View>

        {/* Timeframe Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.timeframeScrollView}
          contentContainerStyle={styles.timeframeContainer}
        >
          {timeframes.map((timeframe) => (
            <TouchableOpacity
              key={timeframe.value}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe.value && styles.timeframeButtonActive,
              ]}
              onPress={() => onTimeframeChange(timeframe.value)}
            >
              <Text
                style={[
                  styles.timeframeText,
                  selectedTimeframe === timeframe.value && styles.timeframeTextActive,
                ]}
              >
                {timeframe.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Professional Chart */}
      <Animated.View style={[styles.chartWrapper, animatedChartStyle]}>
        {chartType === 'candle' ? (
          <CandlestickChart.Provider data={formattedData}>
            <CandlestickChart height={chartHeight - 50}>
              <CandlestickChart.Candles 
                positiveColor={colors.chart.bullish}
                negativeColor={colors.chart.bearish}
              />
              
              <CandlestickChart.Crosshair
                color={colors.text.tertiary}
              >
                <CandlestickChart.Tooltip />
              </CandlestickChart.Crosshair>
            </CandlestickChart>
          </CandlestickChart.Provider>
        ) : (
          <LineChart.Provider 
            data={formattedData.map(d => ({ timestamp: d.timestamp, value: d.close }))}
          >
            <LineChart height={chartHeight - 50}>
              <LineChart.Path color={colors.primary[500]} />
              <LineChart.CursorCrosshair 
                color={colors.text.tertiary}
              >
                <LineChart.Tooltip />
              </LineChart.CursorCrosshair>
            </LineChart>
          </LineChart.Provider>
        )}
      </Animated.View>

      {/* Technical Indicators Panel */}
      {showIndicators && (
        <Animated.View style={[styles.indicatorsPanel, animatedIndicatorStyle]}>
          <Text style={styles.indicatorsPanelTitle}>Technical Indicators</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.indicatorsContainer}
          >
            {indicatorOptions.map((indicator) => (
              <TouchableOpacity
                key={indicator.key}
                style={[
                  styles.indicatorButton,
                  activeIndicators.includes(indicator.key) && styles.indicatorButtonActive,
                  { borderColor: indicator.color }
                ]}
                onPress={() => toggleIndicator(indicator.key)}
              >
                <Text
                  style={[
                    styles.indicatorText,
                    activeIndicators.includes(indicator.key) && { color: indicator.color },
                  ]}
                >
                  {indicator.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Crosshair Info Display */}
      {crosshairData && (
        <View style={styles.crosshairInfo}>
          <Text style={styles.crosshairText}>
            {chartType === 'candle' 
              ? `O: ${formatPrice(crosshairData.open)} H: ${formatPrice(crosshairData.high)} L: ${formatPrice(crosshairData.low)} C: ${formatPrice(crosshairData.close)}`
              : `Price: ${formatPrice(crosshairData.value)}`
            }
          </Text>
          <Text style={styles.crosshairText}>
            {new Date(crosshairData.timestamp).toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    marginHorizontal: spacing[4],
    marginVertical: spacing[2],
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  symbolText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.bold,
  },
  priceChange: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.medium,
  },
  fullscreenButton: {
    padding: spacing[2],
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.secondary,
  },
  chartTypeContainer: {
    flexDirection: 'row',
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
    padding: 2,
  },
  chartTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 4,
    gap: spacing[1],
  },
  chartTypeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  chartTypeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  chartTypeTextActive: {
    color: colors.background.primary,
    fontWeight: typography.weights.semibold,
  },
  timeframeScrollView: {
    flexGrow: 0,
  },
  timeframeContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  timeframeButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
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
  chartWrapper: {
    flex: 1,
    paddingHorizontal: spacing[2],
  },
  indicatorsPanel: {
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    overflow: 'hidden',
  },
  indicatorsPanelTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  indicatorsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[2],
  },
  indicatorButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.tertiary,
  },
  indicatorButtonActive: {
    backgroundColor: colors.background.primary,
  },
  indicatorText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
    fontWeight: typography.weights.medium,
  },
  crosshairInfo: {
    position: 'absolute',
    top: 80,
    left: spacing[4],
    backgroundColor: colors.overlay.card,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 6,
    minWidth: 200,
  },
  crosshairText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.monospace,
    color: colors.text.primary,
    lineHeight: 16,
  },
});

export default ProfessionalTradingChart;
