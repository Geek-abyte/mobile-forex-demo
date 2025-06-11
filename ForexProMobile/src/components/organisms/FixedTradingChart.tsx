import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TradingViewProfessionalChart, { CandlestickData } from './TradingViewProfessionalChart';
import { colors, typography, spacing } from '../../theme';

interface FixedTradingChartProps {
  data: CandlestickData[];
  symbol?: string;
  theme?: 'light' | 'dark';
  onCrosshairMove?: (data: any) => void;
  width?: number;
  height?: number;
  timeframe?: string;
  isFullscreen?: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;
}

const FixedTradingChart: React.FC<FixedTradingChartProps> = ({
  data = [],
  symbol = 'EURUSD',
  theme = 'dark',
  onCrosshairMove,
  width,
  height = 300,
  timeframe = '1h',
  isFullscreen = false,
  onFullscreenChange,
}) => {
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const screenWidth = width || Dimensions.get('window').width;

  const timeframes = [
    { value: '1m', label: '1M' },
    { value: '5m', label: '5M' },
    { value: '15m', label: '15M' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' },
  ];

  const chartTypes = [
    { value: 'candlestick', label: 'Candles', icon: 'bar-chart-outline' },
    { value: 'line', label: 'Line', icon: 'trending-up-outline' },
    { value: 'area', label: 'Area', icon: 'analytics-outline' },
  ];

  // Get current price info for display
  const currentCandle = data.length > 0 ? data[data.length - 1] : null;
  const previousCandle = data.length > 1 ? data[data.length - 2] : null;
  const priceChange = currentCandle && previousCandle 
    ? currentCandle.close - previousCandle.close 
    : 0;
  const priceChangePercent = previousCandle 
    ? (priceChange / previousCandle.close) * 100 
    : 0;

  const handleFullscreenToggle = () => {
    onFullscreenChange?.(!isFullscreen);
  };

  if (isFullscreen) {
    // Fullscreen layout - minimal controls
    return (
      <View style={styles.fullscreenContainer}>
        {/* Minimal Header */}
        <View style={styles.fullscreenHeader}>
          <View style={styles.fullscreenInfo}>
            <Text style={styles.fullscreenSymbol}>{symbol}</Text>
            {currentCandle && (
              <View style={styles.fullscreenPriceInfo}>
                <Text style={styles.fullscreenPrice}>
                  {currentCandle.close.toFixed(5)}
                </Text>
                <Text style={[
                  styles.fullscreenChange,
                  priceChangePercent >= 0 ? styles.positiveChange : styles.negativeChange
                ]}>
                  {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            onPress={handleFullscreenToggle}
            style={styles.fullscreenCloseButton}
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Chart Types and Actions */}
        <View style={styles.fullscreenControls}>
          <View style={styles.chartTypeSelector}>
            {chartTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.chartTypeButton,
                  chartType === type.value && styles.chartTypeButtonActive,
                ]}
                onPress={() => setChartType(type.value as any)}
              >
                <Text
                  style={[
                    styles.chartTypeText,
                    chartType === type.value && styles.chartTypeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart Area */}
        <View style={styles.fullscreenChartArea}>
          <TradingViewProfessionalChart
            symbol={symbol}
            data={data}
            theme={theme}
            height={Dimensions.get('window').height - 120}
            onCrosshairMove={onCrosshairMove}
          />
        </View>
      </View>
    );
  }

  // Normal layout - compact header with integrated controls
  return (
    <View style={[styles.container, { height }]}>
      {/* Compact Header */}
      <View style={styles.compactHeader}>
        <View style={styles.symbolPriceInfo}>
          <Text style={styles.symbolText}>{symbol}</Text>
          {currentCandle && (
            <Text style={[
              styles.priceChangeText,
              priceChangePercent >= 0 ? styles.positiveChange : styles.negativeChange
            ]}>
              {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </Text>
          )}
        </View>
        
        <View style={styles.compactControls}>
          {/* Chart Type Buttons */}
          <View style={styles.compactChartTypes}>
            {chartTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.compactTypeButton,
                  chartType === type.value && styles.compactTypeButtonActive,
                ]}
                onPress={() => setChartType(type.value as any)}
              >
                <Text
                  style={[
                    styles.compactTypeText,
                    chartType === type.value && styles.compactTypeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Fullscreen Button */}
          <TouchableOpacity
            onPress={handleFullscreenToggle}
            style={styles.expandButton}
          >
            <Ionicons name="expand-outline" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chart Area */}
      <View style={styles.chartArea}>
        <TradingViewProfessionalChart
          symbol={symbol}
          data={data}
          theme={theme}
          height={height - 44} // Account for header
          onCrosshairMove={onCrosshairMove}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Compact layout styles
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.secondary + 'F0',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary + '40',
    height: 44,
  },
  symbolPriceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  symbolText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  priceChangeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    paddingHorizontal: spacing[1],
    paddingVertical: 2,
    borderRadius: 4,
  },
  positiveChange: {
    color: colors.trading.profit,
    backgroundColor: colors.trading.profit + '20',
  },
  negativeChange: {
    color: colors.trading.loss,
    backgroundColor: colors.trading.loss + '20',
  },
  compactControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  compactChartTypes: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: 6,
    overflow: 'hidden',
  },
  compactTypeButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: 'transparent',
  },
  compactTypeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  compactTypeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  compactTypeTextActive: {
    color: colors.text.inverse,
  },
  expandButton: {
    padding: spacing[1],
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
  },
  chartArea: {
    flex: 1,
  },

  // Fullscreen layout styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.secondary + 'F5',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary + '60',
    height: 70,
  },
  fullscreenInfo: {
    flex: 1,
  },
  fullscreenSymbol: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  fullscreenPriceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  fullscreenPrice: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  fullscreenChange: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 6,
  },
  fullscreenCloseButton: {
    padding: spacing[2],
    backgroundColor: colors.background.tertiary + '80',
    borderRadius: 8,
  },
  fullscreenControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary + '40',
    height: 50,
  },
  chartTypeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartTypeButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: 'transparent',
  },
  chartTypeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  chartTypeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  chartTypeTextActive: {
    color: colors.text.inverse,
  },
  fullscreenChartArea: {
    flex: 1,
  },
});

export default FixedTradingChart;
