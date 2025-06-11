import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';
import StandardHeader from '../../components/molecules/StandardHeader';
import PerformanceChart from '../../components/organisms/PerformanceChart';
import PortfolioBreakdown from '../../components/organisms/PortfolioBreakdown';
import TradingAnalytics from '../../components/organisms/TradingAnalytics';

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

interface PortfolioBreakdown {
  currency: string;
  allocation: number;
  value: number;
  change24h: number;
  change24hPercent: number;
}

interface TradeHistory {
  date: string;
  pnl: number;
  cumulativePnL: number;
}

const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const [portfolioBreakdown, setPortfolioBreakdown] = useState<PortfolioBreakdown[]>([
    { currency: 'USD', allocation: 0.35, value: 7892, change24h: 89, change24hPercent: 1.14 },
    { currency: 'EUR', allocation: 0.28, value: 6313, change24h: -125, change24hPercent: -1.94 },
    { currency: 'GBP', allocation: 0.18, value: 4058, change24h: 67, change24hPercent: 1.68 },
    { currency: 'JPY', allocation: 0.12, value: 2706, change24h: 23, change24hPercent: 0.86 },
    { currency: 'AUD', allocation: 0.07, value: 1578, change24h: -34, change24hPercent: -2.11 },
  ]);

  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([
    { date: '2025-06-04', pnl: 125, cumulativePnL: 22423 },
    { date: '2025-06-05', pnl: -89, cumulativePnL: 22334 },
    { date: '2025-06-06', pnl: 234, cumulativePnL: 22568 },
    { date: '2025-06-07', pnl: -156, cumulativePnL: 22412 },
    { date: '2025-06-08', pnl: 89, cumulativePnL: 22501 },
    { date: '2025-06-09', pnl: 178, cumulativePnL: 22679 },
    { date: '2025-06-10', pnl: -132, cumulativePnL: 22547 },
  ]);

  const [tradingAnalyticsData] = useState([
    {
      period: '1W',
      totalTrades: 12,
      winningTrades: 8,
      losingTrades: 4,
      winRate: 66.7,
      totalPnL: 347,
      averageWin: 89.5,
      averageLoss: -45.2,
      profitFactor: 1.98,
      largestWin: 234,
      largestLoss: -89,
      averageHoldTime: '4h 32m',
    },
    {
      period: '1M',
      totalTrades: 58,
      winningTrades: 39,
      losingTrades: 19,
      winRate: 67.2,
      totalPnL: 2547,
      averageWin: 156.3,
      averageLoss: -89.4,
      profitFactor: 1.75,
      largestWin: 892,
      largestLoss: -234,
      averageHoldTime: '6h 15m',
    },
    {
      period: '3M',
      totalTrades: 147,
      winningTrades: 101,
      losingTrades: 46,
      winRate: 68.7,
      totalPnL: 5234,
      averageWin: 145.8,
      averageLoss: -78.9,
      profitFactor: 1.85,
      largestWin: 1245,
      largestLoss: -456,
      averageHoldTime: '5h 48m',
    },
  ]);

  const [selectedAnalyticsPeriod, setSelectedAnalyticsPeriod] = useState('1M');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate realistic data based on timeframe
      generateTimeframeData();
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeframeData = () => {
    const now = new Date();
    const history: TradeHistory[] = [];
    let baseValue = 22000;
    
    // Generate data points based on timeframe
    const dataPoints = timeframe === '1D' ? 24 : 
                      timeframe === '1W' ? 7 : 
                      timeframe === '1M' ? 30 : 
                      timeframe === '3M' ? 90 : 365;
    
    const intervalMs = timeframe === '1D' ? 60 * 60 * 1000 : // 1 hour
                      timeframe === '1W' ? 24 * 60 * 60 * 1000 : // 1 day
                      24 * 60 * 60 * 1000; // 1 day for others
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * intervalMs);
      const pnl = (Math.random() - 0.5) * 400; // Random P&L between -200 and +200
      baseValue += pnl;
      
      history.push({
        date: date.toISOString().split('T')[0],
        pnl: Math.round(pnl),
        cumulativePnL: Math.round(baseValue),
      });
    }
    
    setTradeHistory(history);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

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
  }> = ({ title, value, change, changeColor, icon }) => (
    <View style={styles.metricCard}>
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
    </View>
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StandardHeader 
        title="Portfolio Analytics" 
        showBackButton={true}
        rightActions={[
          <TouchableOpacity key="settings" style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ]}
      />

      <ScrollView
        style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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
            />
            <MetricCard
              title="Today's P&L"
              value={`$${performanceMetrics.todayPnL.toLocaleString()}`}
              change={`+${performanceMetrics.todayPnLPercent}%`}
              changeColor={colors.trading.profit}
              icon="stats-chart"
            />
          </View>

          <View style={styles.metricsGrid}>
            <MetricCard
              title="Win Rate"
              value={`${performanceMetrics.winRate}%`}
              change={`${performanceMetrics.winningTrades}/${performanceMetrics.totalTrades} trades`}
              changeColor={colors.text.secondary}
              icon="trophy"
            />
            <MetricCard
              title="Profit Factor"
              value={performanceMetrics.profitFactor.toFixed(2)}
              change="Excellent"
              changeColor={colors.trading.profit}
              icon="calculator"
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

          {/* Performance Chart */}
          <PerformanceChart
            data={tradeHistory.map(trade => ({
              date: trade.date,
              value: trade.cumulativePnL,
              change: trade.pnl,
            }))}
            timeframe={timeframe}
            onTimeframeChange={(tf) => setTimeframe(tf as '1D' | '1W' | '1M' | '3M' | '1Y')}
            title="Portfolio Performance"
            valueFormatter={(value) => `$${value.toLocaleString()}`}
            color={colors.primary[500]}
          />

          {/* Portfolio Breakdown */}
          <PortfolioBreakdown
            data={portfolioBreakdown.map(item => ({
              currency: item.currency,
              allocation: item.allocation * 100, // Convert to percentage
              value: item.value,
              change24h: item.change24h,
              change24hPercent: item.change24hPercent,
            }))}
            totalValue={riskMetrics.portfolioValue}
          />

          {/* Trading Analytics */}
          <TradingAnalytics
            data={tradingAnalyticsData}
            selectedPeriod={selectedAnalyticsPeriod}
            onPeriodChange={setSelectedAnalyticsPeriod}
          />

          {/* Trade History */}
          <Text style={styles.sectionTitle}>Trade History</Text>
          <View style={styles.tradeHistoryContainer}>
            {tradeHistory.map((trade) => (
              <View key={trade.date} style={styles.tradeHistoryItem}>
                <Text style={styles.tradeHistoryDate}>{trade.date}</Text>
                <Text style={styles.tradeHistoryPnL}>${trade.pnl}</Text>
                <Text style={styles.tradeHistoryCumulativePnL}>
                  ${trade.cumulativePnL}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6], // 24px
  },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
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
    backgroundColor: colors.background.secondary,
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
    backgroundColor: colors.background.tertiary,
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
    backgroundColor: colors.background.secondary,
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
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  advancedMetricsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: spacing[6], // 24px
  },
  advancedMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3], // 12px
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
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
  chartContainer: {
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    marginBottom: spacing[6], // 24px
  },
  breakdownContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: spacing[6], // 24px
    marginBottom: spacing[6], // 24px
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3], // 12px
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  breakdownCurrency: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  breakdownAllocation: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  breakdownValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  breakdownChange: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  tradeHistoryContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: spacing[6], // 24px
  },
  tradeHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3], // 12px
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  tradeHistoryDate: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  tradeHistoryPnL: {
    fontSize: typography.sizes.sm,
    color: colors.trading.profit,
  },
  tradeHistoryCumulativePnL: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  bottomPadding: {
    height: spacing[16], // 64px
  },
});

export default AnalyticsScreen;
