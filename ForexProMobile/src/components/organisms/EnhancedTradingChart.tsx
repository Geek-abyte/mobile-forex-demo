import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, CandlestickChart } from 'react-native-wagmi-charts';
import { colors, typography, spacing } from '../../theme';

const { width } = Dimensions.get('window');

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface EnhancedTradingChartProps {
  symbol: string;
  data: CandleData[];
  currentPrice: number;
  onTimeframeChange: (timeframe: string) => void;
  selectedTimeframe: string;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
}

const EnhancedTradingChart: React.FC<EnhancedTradingChartProps> = ({
  symbol,
  data,
  currentPrice,
  onTimeframeChange,
  selectedTimeframe,
  isFullscreen = false,
  onFullscreenToggle,
}) => {
  const [chartType, setChartType] = useState<'line' | 'candle'>('candle');
  const [showVolume, setShowVolume] = useState(false);

  const timeframes = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1d', value: '1d' },
  ];

  // Format data for wagmi charts
  const formattedData = useMemo(() => {
    return data.map(candle => ({
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
  }, [data]);

  const lineData = useMemo(() => {
    return data.map(candle => ({
      timestamp: candle.timestamp,
      value: candle.close,
    }));
  }, [data]);

  const formatPrice = (price: number) => price.toFixed(5);
  const chartHeight = isFullscreen ? Dimensions.get('window').height - 150 : 300;

  // Calculate price change
  const priceChange = data.length > 1 ? currentPrice - data[data.length - 2]?.close : 0;
  const priceChangePercent = data.length > 1 ? (priceChange / data[data.length - 2]?.close) * 100 : 0;

  return (
    <View style={[styles.container, { height: chartHeight + 100 }]}>
      {/* Chart Header */}
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={styles.symbolText}>{symbol}</Text>
          <View style={styles.priceContainer}>
            <Text style={[
              styles.currentPrice,
              { color: priceChange >= 0 ? colors.chart.bullish : colors.chart.bearish }
            ]}>
              {formatPrice(currentPrice)}
            </Text>
            <Text style={[
              styles.priceChange,
              { color: priceChange >= 0 ? colors.chart.bullish : colors.chart.bearish }
            ]}>
              {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChangePercent).toFixed(2)}%
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Chart Type Toggle */}
          <TouchableOpacity
            style={[styles.actionButton, chartType === 'candle' && styles.actionButtonActive]}
            onPress={() => setChartType(chartType === 'candle' ? 'line' : 'candle')}
          >
            <Ionicons 
              name={chartType === 'candle' ? 'stats-chart' : 'trending-up'} 
              size={16} 
              color={chartType === 'candle' ? colors.background.primary : colors.text.secondary} 
            />
          </TouchableOpacity>

          {/* Volume Toggle */}
          <TouchableOpacity
            style={[styles.actionButton, showVolume && styles.actionButtonActive]}
            onPress={() => setShowVolume(!showVolume)}
          >
            <Ionicons 
              name="bar-chart" 
              size={16} 
              color={showVolume ? colors.background.primary : colors.text.secondary} 
            />
          </TouchableOpacity>

          {/* Fullscreen Toggle */}
          {onFullscreenToggle && (
            <TouchableOpacity onPress={onFullscreenToggle} style={styles.actionButton}>
              <Ionicons
                name={isFullscreen ? "contract" : "expand"}
                size={16}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.timeframeScrollContainer}
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
      <View style={styles.chartWrapper}>
        {data.length > 0 && (
          chartType === 'candle' ? (
            <CandlestickChart.Provider data={formattedData}>
              <CandlestickChart height={chartHeight}>
                <CandlestickChart.Candles 
                  positiveColor={colors.chart.bullish}
                  negativeColor={colors.chart.bearish}
                />
                <CandlestickChart.Crosshair color={colors.text.tertiary}>
                  <CandlestickChart.Tooltip 
                    textStyle={styles.tooltipText}
                  />
                </CandlestickChart.Crosshair>
              </CandlestickChart>
            </CandlestickChart.Provider>
          ) : (
            <LineChart.Provider data={lineData}>
              <LineChart height={chartHeight}>
                <LineChart.Path 
                  color={colors.primary[500]} 
                  width={2}
                />
                <LineChart.CursorCrosshair color={colors.text.tertiary}>
                  <LineChart.Tooltip 
                    textStyle={styles.tooltipText}
                  />
                </LineChart.CursorCrosshair>
              </LineChart>
            </LineChart.Provider>
          )
        )}
      </View>

      {/* Market Info */}
      <View style={styles.marketInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>High</Text>
          <Text style={styles.infoValue}>{formatPrice(Math.max(...data.map(d => d.high)))}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Low</Text>
          <Text style={styles.infoValue}>{formatPrice(Math.min(...data.map(d => d.low)))}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Volume</Text>
          <Text style={styles.infoValue}>
            {data.length > 0 ? (data[data.length - 1].volume || 0).toLocaleString() : '0'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Change</Text>
          <Text style={[
            styles.infoValue,
            { color: priceChange >= 0 ? colors.chart.bullish : colors.chart.bearish }
          ]}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(5)}
          </Text>
        </View>
      </View>
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
    borderWidth: 1,
    borderColor: colors.border.primary,
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
    flex: 1,
  },
  symbolText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  currentPrice: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.bold,
  },
  priceChange: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.semibold,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: colors.primary[500],
  },
  timeframeContainer: {
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing[2],
  },
  timeframeScrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
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
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[2],
    paddingTop: spacing[2],
  },
  tooltipText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.monospace,
    color: colors.text.primary,
  },
  marketInfo: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing[1],
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
});

export default EnhancedTradingChart;
