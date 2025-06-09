import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';

const { width } = Dimensions.get('window');

interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  todayPnL: number;
  todayPnLPercent: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
}

interface RiskMetrics {
  portfolioValue: number;
  exposure: number;
  exposurePercent: number;
  marginUsed: number;
  marginAvailable: number;
  marginLevel: number;
  riskScore: number;
  volatility: number;
}

const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    totalReturn: 2547.80,
    totalReturnPercent: 12.74,
    todayPnL: 234.50,
    todayPnLPercent: 1.16,
    winRate: 68.5,
    totalTrades: 147,
    winningTrades: 101,
    losingTrades: 46,
    averageWin: 156.30,
    averageLoss: -89.45,
    profitFactor: 1.75,
    sharpeRatio: 1.23,
    maxDrawdown: -1234.50,
    maxDrawdownPercent: -5.8,
  });

  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    portfolioValue: 22547.80,
    exposure: 18250.00,
    exposurePercent: 80.9,
    marginUsed: 3420.50,
    marginAvailable: 19127.30,
    riskScore: 7.2,
    volatility: 15.4,
    marginLevel: 659.2,
  });

  const timeframes = [
    { key: '1D' as const, label: '1D' },
    { key: '1W' as const, label: '1W' },
    { key: '1M' as const, label: '1M' },
    { key: '3M' as const, label: '3M' },
    { key: '1Y' as const, label: '1Y' },
  ];

  const MetricCard: React.FC<{
    title: string;
    value: string;
    change?: string;
    changeColor?: string;
    icon: string;
    gradient: readonly [string, string, ...string[]];
  }> = ({ title, value, change, changeColor, icon, gradient }) => (
    <LinearGradient colors={gradient} style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={styles.metricIconContainer}>
          <Ionicons name={icon as any} size={24} color={colors.text.primary} />
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      {change && (
        <Text style={[styles.metricChange, { color: changeColor }]}>
          {change}
        </Text>
      )}
    </LinearGradient>
  );

  const RiskBar: React.FC<{
    label: string;
    value: number;
    maxValue: number;
    color: string;
  }> = ({ label, value, maxValue, color }) => {
    const percentage = (value / maxValue) * 100;
    
    return (
      <View style={styles.riskBarContainer}>
        <View style={styles.riskBarHeader}>
          <Text style={styles.riskBarLabel}>{label}</Text>
          <Text style={styles.riskBarValue}>
            {value.toLocaleString()} ({percentage.toFixed(1)}%)
          </Text>
        </View>
        <View style={styles.riskBarTrack}>
          <View 
            style={[
              styles.riskBarFill, 
              { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }
            ]} 
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Portfolio Analytics</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Timeframe Selector */}
          <View style={styles.timeframeContainer}>
            {timeframes.map((tf) => (
              <TouchableOpacity
                key={tf.key}
                style={[
                  styles.timeframeButton,
                  timeframe === tf.key && styles.timeframeButtonActive
                ]}
                onPress={() => setTimeframe(tf.key)}
              >
                <Text style={[
                  styles.timeframeText,
                  timeframe === tf.key && styles.timeframeTextActive
                ]}>
                  {tf.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Performance Overview */}
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Total Return"
              value={`$${performanceMetrics.totalReturn.toLocaleString()}`}
              change={`+${performanceMetrics.totalReturnPercent}%`}
              changeColor={colors.trading.profit}
              icon="trending-up"
              gradient={[colors.primary[500], colors.secondary[500]] as const}
            />
            <MetricCard
              title="Today's P&L"
              value={`$${performanceMetrics.todayPnL.toLocaleString()}`}
              change={`+${performanceMetrics.todayPnLPercent}%`}
              changeColor={colors.trading.profit}
              icon="stats-chart"
              gradient={[colors.trading.profit, colors.primary[500]] as const}
            />
          </View>

          <View style={styles.metricsGrid}>
            <MetricCard
              title="Win Rate"
              value={`${performanceMetrics.winRate}%`}
              change={`${performanceMetrics.winningTrades}/${performanceMetrics.totalTrades} trades`}
              changeColor={colors.text.secondary}
              icon="trophy"
              gradient={[colors.trading.warning, colors.secondary[500]] as const}
            />
            <MetricCard
              title="Profit Factor"
              value={performanceMetrics.profitFactor.toFixed(2)}
              change="Excellent"
              changeColor={colors.trading.profit}
              icon="calculator"
              gradient={[colors.secondary[500], colors.primary[500]] as const}
            />
          </View>

          {/* Risk Management */}
          <Text style={styles.sectionTitle}>Risk Management</Text>
          <View style={styles.riskCard}>
            <View style={styles.riskHeader}>
              <Text style={styles.riskTitle}>Portfolio Risk Analysis</Text>
              <View style={styles.riskScoreContainer}>
                <Text style={styles.riskScoreLabel}>Risk Score</Text>
                <Text style={[
                  styles.riskScore,
                  { color: riskMetrics.riskScore > 8 ? colors.trading.loss : 
                           riskMetrics.riskScore > 6 ? colors.trading.warning : colors.trading.profit }
                ]}>
                  {riskMetrics.riskScore}/10
                </Text>
              </View>
            </View>

            <View style={styles.riskBarsContainer}>
              <RiskBar
                label="Portfolio Exposure"
                value={riskMetrics.exposure}
                maxValue={riskMetrics.portfolioValue}
                color={riskMetrics.exposurePercent > 85 ? colors.trading.loss : colors.primary[500]}
              />
              <RiskBar
                label="Margin Used"
                value={riskMetrics.marginUsed}
                maxValue={riskMetrics.marginUsed + riskMetrics.marginAvailable}
                color={riskMetrics.marginUsed / (riskMetrics.marginUsed + riskMetrics.marginAvailable) > 0.8 ? colors.trading.loss : colors.trading.profit}
              />
            </View>
          </View>

          {/* Advanced Metrics */}
          <Text style={styles.sectionTitle}>Advanced Metrics</Text>
          <View style={styles.advancedMetricsContainer}>
            <View style={styles.advancedMetricRow}>
              <Text style={styles.advancedMetricLabel}>Sharpe Ratio</Text>
              <Text style={styles.advancedMetricValue}>{performanceMetrics.sharpeRatio}</Text>
            </View>
            <View style={styles.advancedMetricRow}>
              <Text style={styles.advancedMetricLabel}>Max Drawdown</Text>
              <Text style={[styles.advancedMetricValue, { color: colors.trading.loss }]}>
                {performanceMetrics.maxDrawdownPercent}%
              </Text>
            </View>
            <View style={styles.advancedMetricRow}>
              <Text style={styles.advancedMetricLabel}>Volatility</Text>
              <Text style={styles.advancedMetricValue}>{riskMetrics.volatility}%</Text>
            </View>
            <View style={styles.advancedMetricRow}>
              <Text style={styles.advancedMetricLabel}>Average Win</Text>
              <Text style={[styles.advancedMetricValue, { color: colors.trading.profit }]}>
                ${performanceMetrics.averageWin}
              </Text>
            </View>
            <View style={styles.advancedMetricRow}>
              <Text style={styles.advancedMetricLabel}>Average Loss</Text>
              <Text style={[styles.advancedMetricValue, { color: colors.trading.loss }]}>
                ${performanceMetrics.averageLoss}
              </Text>
            </View>
            <View style={styles.advancedMetricRow}>
              <Text style={styles.advancedMetricLabel}>Margin Level</Text>
              <Text style={[
                styles.advancedMetricValue,
                { color: riskMetrics.marginLevel < 200 ? colors.trading.loss : colors.trading.profit }
              ]}>
                {riskMetrics.marginLevel.toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[6], // 24px
    paddingVertical: spacing[4], // 16px
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6], // 24px
  },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing[8], // 32px
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: spacing[3], // 12px
    alignItems: 'center',
    borderRadius: 8,
  },
  timeframeButtonActive: {
    backgroundColor: colors.text.primary,
  },
  timeframeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  timeframeTextActive: {
    color: colors.primary[500],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[4], // 16px
    marginTop: spacing[6], // 24px
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[4], // 16px
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    padding: spacing[6], // 24px
    marginHorizontal: spacing[1], // 4px
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3], // 12px
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3], // 12px
  },
  metricTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    opacity: 0.9,
  },
  metricValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[1], // 4px
  },
  metricChange: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  riskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: spacing[6], // 24px
    marginBottom: spacing[6], // 24px
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6], // 24px
  },
  riskTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  riskScoreContainer: {
    alignItems: 'center',
  },
  riskScoreLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing[1], // 4px
  },
  riskScore: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  riskBarsContainer: {
    gap: spacing[4], // 16px
  },
  riskBarContainer: {
    marginBottom: spacing[3], // 12px
  },
  riskBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[1], // 4px
  },
  riskBarLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  riskBarValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  riskBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  advancedMetricsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: spacing[6], // 24px
  },
  advancedMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3], // 12px
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  advancedMetricLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  advancedMetricValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  bottomPadding: {
    height: spacing[16], // 64px
  },
});

export default AnalyticsScreen;
