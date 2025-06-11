import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IndustryStandardChart from './IndustryStandardChart';
import ProfessionalTradingChart from './ProfessionalTradingChart';
import { colors, typography, spacing } from '../../theme';

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface OptimizedFullscreenChartModalProps {
  visible: boolean;
  onClose: () => void;
  symbol: string;
  data: CandlestickData[];
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const OptimizedFullscreenChartModal: React.FC<OptimizedFullscreenChartModalProps> = ({
  visible,
  onClose,
  symbol,
  data,
  timeframe,
  onTimeframeChange,
}) => {
  const { width, height } = Dimensions.get('window');

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
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
    >
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Minimal Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.symbolInfo}>
            <Text style={styles.symbol}>{symbol}</Text>
            <Text style={styles.timeframeText}>{timeframes.find(t => t.value === timeframe)?.label}</Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Timeframe Selector - Compact */}
        <View style={styles.timeframeContainer}>
          {timeframes.map((tf) => (
            <TouchableOpacity
              key={tf.value}
              style={[
                styles.timeframeButton,
                timeframe === tf.value && styles.timeframeButtonActive,
              ]}
              onPress={() => onTimeframeChange(tf.value)}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Text
                style={[
                  styles.timeframeButtonText,
                  timeframe === tf.value && styles.timeframeButtonTextActive,
                ]}
              >
                {tf.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Full Chart Area - No redundant controls */}
        <View style={styles.chartContainer}>
          <ProfessionalTradingChart
            symbol={symbol}
            data={data}
            theme="dark"
            height={height - 80} // Account for minimal top bar and timeframes
            timeframe={timeframe}
            isFullscreen={true}
            width={width}
            showControls={false}
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
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary + '20',
    height: 50,
  },
  symbolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  symbol: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  timeframeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: spacing[2],
    borderRadius: 6,
    backgroundColor: colors.background.tertiary + '80',
  },
  timeframeContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary + '20',
    gap: spacing[2],
    height: 44,
    alignItems: 'center',
  },
  timeframeButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  timeframeButtonText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  timeframeButtonTextActive: {
    color: colors.text.inverse,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});

export default OptimizedFullscreenChartModal;
