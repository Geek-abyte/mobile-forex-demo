import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
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

interface TradingChartProps {
  symbol: string;
  data: CandleData[];
  currentPrice: number;
  onTimeframeChange: (timeframe: string) => void;
  selectedTimeframe: string;
}

const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  data,
  currentPrice,
  onTimeframeChange,
  selectedTimeframe,
}) => {
  const [chartType, setChartType] = useState<'line' | 'candle'>('candle');
  const [indicators, setIndicators] = useState({
    ema: false,
    sma: false,
    bollinger: false,
    rsi: false,
  });

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

  // Calculate technical indicators
  const calculateSMA = (period: number) => {
    if (data.length < period) return [];
    const smaData = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, candle) => acc + candle.close, 0);
      smaData.push({
        timestamp: data[i].timestamp,
        value: sum / period,
      });
    }
    return smaData;
  };

  const calculateEMA = (period: number) => {
    if (data.length < period) return [];
    const emaData = [];
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((acc, candle) => acc + candle.close, 0) / period;
    
    for (let i = period; i < data.length; i++) {
      ema = (data[i].close - ema) * multiplier + ema;
      emaData.push({
        timestamp: data[i].timestamp,
        value: ema,
      });
    }
    return emaData;
  };

  const calculateRSI = (period: number = 14) => {
    if (data.length < period + 1) return [];
    const rsiData = [];
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

      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));

      rsiData.push({
        timestamp: data[i].timestamp,
        value: rsi,
      });
    }
    return rsiData;
  };

  const renderTimeframeButtons = () => (
    <View style={styles.timeframeContainer}>
      {timeframes.map((tf) => (
        <TouchableOpacity
          key={tf}
          style={[
            styles.timeframeButton,
            selectedTimeframe === tf && styles.timeframeButtonActive,
          ]}
          onPress={() => onTimeframeChange(tf)}
        >
          <Text
            style={[
              styles.timeframeText,
              selectedTimeframe === tf && styles.timeframeTextActive,
            ]}
          >
            {tf}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChartControls = () => (
    <View style={styles.controlsContainer}>
      <View style={styles.chartTypeControls}>
        <TouchableOpacity
          style={[
            styles.chartTypeButton,
            chartType === 'line' && styles.chartTypeButtonActive,
          ]}
          onPress={() => setChartType('line')}
        >
          <Ionicons
            name="trending-up"
            size={16}
            color={chartType === 'line' ? colors.text.primary : colors.text.secondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chartTypeButton,
            chartType === 'candle' && styles.chartTypeButtonActive,
          ]}
          onPress={() => setChartType('candle')}
        >
          <Ionicons
            name="bar-chart"
            size={16}
            color={chartType === 'candle' ? colors.text.primary : colors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.indicatorControls}>
        <TouchableOpacity
          style={[
            styles.indicatorButton,
            indicators.sma && styles.indicatorButtonActive,
          ]}
          onPress={() => setIndicators(prev => ({ ...prev, sma: !prev.sma }))}
        >
          <Text style={[
            styles.indicatorText,
            indicators.sma && styles.indicatorTextActive,
          ]}>
            SMA
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.indicatorButton,
            indicators.ema && styles.indicatorButtonActive,
          ]}
          onPress={() => setIndicators(prev => ({ ...prev, ema: !prev.ema }))}
        >
          <Text style={[
            styles.indicatorText,
            indicators.ema && styles.indicatorTextActive,
          ]}>
            EMA
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.indicatorButton,
            indicators.rsi && styles.indicatorButtonActive,
          ]}
          onPress={() => setIndicators(prev => ({ ...prev, rsi: !prev.rsi }))}
        >
          <Text style={[
            styles.indicatorText,
            indicators.rsi && styles.indicatorTextActive,
          ]}>
            RSI
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Ionicons name="analytics-outline" size={48} color={colors.text.secondary} />
          <Text style={styles.noDataText}>No chart data available</Text>
        </View>
      );
    }

    const chartData = data.map(candle => ({
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    return (
      <View style={styles.chartWrapper}>
        {chartType === 'candle' ? (
          <CandlestickChart.Provider data={chartData}>
            <CandlestickChart height={300} width={width - 40}>
              <CandlestickChart.Candles />
              <CandlestickChart.Crosshair>
                <CandlestickChart.Tooltip />
              </CandlestickChart.Crosshair>
              
              {/* Technical Indicators */}
              {indicators.sma && (
                <LineChart.Provider data={calculateSMA(20).map(item => ({ 
                  timestamp: item.timestamp, 
                  value: item.value 
                }))}>
                  <LineChart.Path color={colors.trading.warning} width={2} />
                </LineChart.Provider>
              )}
              
              {indicators.ema && (
                <LineChart.Provider data={calculateEMA(20).map(item => ({ 
                  timestamp: item.timestamp, 
                  value: item.value 
                }))}>
                  <LineChart.Path color={colors.secondary[500]} width={2} />
                </LineChart.Provider>
              )}
            </CandlestickChart>
          </CandlestickChart.Provider>
        ) : (
          <LineChart.Provider data={chartData.map(item => ({ 
            timestamp: item.timestamp, 
            value: item.close 
          }))}>
            <LineChart height={300} width={width - 40}>
              <LineChart.Path color={colors.primary[500]} width={3} />
              <LineChart.CursorCrosshair>
                <LineChart.Tooltip />
              </LineChart.CursorCrosshair>
            </LineChart>
          </LineChart.Provider>
        )}

        {/* RSI Indicator */}
        {indicators.rsi && (
          <View style={styles.rsiContainer}>
            <Text style={styles.rsiLabel}>RSI (14)</Text>
            <LineChart.Provider data={calculateRSI().map(item => ({ 
              timestamp: item.timestamp, 
              value: item.value 
            }))}>
              <LineChart height={80} width={width - 40}>
                <LineChart.Path color={colors.status.info} width={2} />
                <LineChart.HorizontalLine at={{ value: 70 }} color={colors.status.error} />
                <LineChart.HorizontalLine at={{ value: 30 }} color={colors.status.success} />
              </LineChart>
            </LineChart.Provider>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={styles.symbolText}>{symbol}</Text>
          <Text style={[
            styles.priceText,
            { color: currentPrice > 0 ? colors.status.success : colors.status.error }
          ]}>
            {currentPrice.toFixed(5)}
          </Text>
        </View>
      </View>

      {renderTimeframeButtons()}
      {renderChartControls()}
      {renderChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.tertiary,
    borderRadius: spacing[4],
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
    minHeight: 40, // Ensure adequate height
    paddingVertical: spacing[2], // Add padding
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolText: {
    fontSize: typography.sizes.lg,
    lineHeight: typography.sizes.lg * 1.4,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginRight: spacing[3],
  },
  priceText: {
    fontSize: typography.sizes.lg,
    lineHeight: typography.sizes.lg * 1.4,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fonts.monospace,
  },
  timeframeContainer: {
    flexDirection: 'row',
    marginBottom: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: spacing[2],
    padding: spacing[1], // Increase padding
    minHeight: 40, // Ensure adequate height
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: spacing[3], // Increase padding
    paddingHorizontal: spacing[3],
    borderRadius: spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36, // Ensure adequate height
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  timeframeText: {
    fontSize: typography.sizes.sm, // Increase from caption
    color: colors.text.secondary,
    fontWeight: '600',
    lineHeight: typography.sizes.sm * 1.4, // Add proper line height
  },
  timeframeTextActive: {
    color: colors.text.primary,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  chartTypeControls: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: spacing[1],
    padding: 2,
  },
  chartTypeButton: {
    padding: spacing[3], // Increase padding
    borderRadius: spacing[1],
    marginHorizontal: 2,
    minHeight: 32, // Ensure adequate height
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartTypeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  indicatorControls: {
    flexDirection: 'row',
  },
  indicatorButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3], // Increase padding
    borderRadius: spacing[1],
    marginLeft: spacing[2],
    backgroundColor: colors.background.secondary,
    minHeight: 32, // Ensure adequate height
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorButtonActive: {
    backgroundColor: colors.primary[500],
  },
  indicatorText: {
    fontSize: typography.sizes.sm, // Increase from caption
    color: colors.text.secondary,
    fontWeight: '600',
    lineHeight: typography.sizes.sm * 1.4, // Add proper line height
  },
  indicatorTextActive: {
    color: colors.text.primary,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  noDataContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[3],
  },
  rsiContainer: {
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: spacing[1],
    minHeight: 100, // Ensure adequate height for RSI chart
  },
  rsiLabel: {
    fontSize: typography.sizes.sm, // Increase from caption
    color: colors.text.secondary,
    marginBottom: spacing[2],
    lineHeight: typography.sizes.sm * 1.4, // Add proper line height
    fontWeight: typography.weights.medium,
  },
});

export default TradingChart;
