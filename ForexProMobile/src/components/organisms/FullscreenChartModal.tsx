import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OptimizedTradingChart from './OptimizedTradingChart';
import { colors, typography, spacing } from '../../theme';

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface FullscreenChartModalProps {
  visible: boolean;
  onClose: () => void;
  symbol: string;
  data: CandlestickData[];
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const FullscreenChartModal: React.FC<FullscreenChartModalProps> = ({
  visible,
  onClose,
  symbol,
  data,
  timeframe,
  onTimeframeChange,
}) => {
  const { height } = Dimensions.get('window');

  const timeframes = [
    { value: '1m', label: '1M' },
    { value: '5m', label: '5M' },
    { value: '15m', label: '15M' },
    { value: '30m', label: '30M' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' },
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.symbol}>{symbol}</Text>
            <Text style={styles.subtitle}>Professional Chart</Text>
          </View>
          
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Timeframe Selector */}
        <View style={styles.timeframeContainer}>
          {timeframes.map((tf) => (
            <TouchableOpacity
              key={tf.value}
              style={[
                styles.timeframeButton,
                timeframe === tf.value && styles.timeframeButtonActive,
              ]}
              onPress={() => onTimeframeChange(tf.value)}
            >
              <Text
                style={[
                  styles.timeframeText,
                  timeframe === tf.value && styles.timeframeTextActive,
                ]}
              >
                {tf.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <OptimizedTradingChart
            symbol={symbol}
            data={data}
            theme="dark"
            height={height - 120}
            timeframe={timeframe}
            isFullscreen={true}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: 40, // Account for status bar without SafeAreaView
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
  headerLeft: {
    flex: 1,
  },
  symbol: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  closeButton: {
    padding: spacing[2],
    borderRadius: 8,
    backgroundColor: colors.background.tertiary,
  },
  timeframeContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  timeframeButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 6,
    marginRight: spacing[2],
    backgroundColor: colors.background.tertiary,
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  timeframeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  timeframeTextActive: {
    color: colors.background.primary,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});

export default FullscreenChartModal;
