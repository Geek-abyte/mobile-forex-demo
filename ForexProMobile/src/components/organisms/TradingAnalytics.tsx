import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface TradeAnalysisData {
  period: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  averageHoldTime: string;
}

interface TradingAnalyticsProps {
  data: TradeAnalysisData[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const TradingAnalytics: React.FC<TradingAnalyticsProps> = ({
  data,
  selectedPeriod,
  onPeriodChange,
}) => {
  const currentData = data.find(d => d.period === selectedPeriod) || data[0];

  const periods = ['1W', '1M', '3M', '6M', '1Y'];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    icon: string;
  }> = ({ title, value, subtitle, color = colors.text.primary, icon }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return colors.trading.profit;
    if (winRate >= 50) return colors.trading.warning;
    return colors.trading.loss;
  };

  const getProfitFactorColor = (profitFactor: number) => {
    if (profitFactor >= 1.5) return colors.trading.profit;
    if (profitFactor >= 1.0) return colors.trading.warning;
    return colors.trading.loss;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trading Analytics</Text>
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.activePeriodButton
              ]}
              onPress={() => onPeriodChange(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.activePeriodText
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.keyMetrics}>
        <View style={styles.metricsRow}>
          <StatCard
            title="Total Trades"
            value={currentData.totalTrades}
            subtitle={`${currentData.winningTrades}W / ${currentData.losingTrades}L`}
            icon="analytics-outline"
            color={colors.primary[500]}
          />
          <StatCard
            title="Win Rate"
            value={`${currentData.winRate.toFixed(1)}%`}
            subtitle={winRateToDescription(currentData.winRate)}
            icon="trophy-outline"
            color={getWinRateColor(currentData.winRate)}
          />
        </View>

        <View style={styles.metricsRow}>
          <StatCard
            title="Total P&L"
            value={formatCurrency(currentData.totalPnL)}
            subtitle={currentData.totalPnL >= 0 ? 'Profitable' : 'Losing'}
            icon="wallet-outline"
            color={currentData.totalPnL >= 0 ? colors.trading.profit : colors.trading.loss}
          />
          <StatCard
            title="Profit Factor"
            value={currentData.profitFactor.toFixed(2)}
            subtitle={profitFactorToDescription(currentData.profitFactor)}
            icon="calculator-outline"
            color={getProfitFactorColor(currentData.profitFactor)}
          />
        </View>
      </View>

      {/* Detailed Analysis */}
      <View style={styles.detailedAnalysis}>
        <Text style={styles.sectionTitle}>Detailed Analysis</Text>
        
        <View style={styles.analysisGrid}>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Average Win</Text>
            <Text style={[styles.analysisValue, { color: colors.trading.profit }]}>
              {formatCurrency(currentData.averageWin)}
            </Text>
          </View>
          
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Average Loss</Text>
            <Text style={[styles.analysisValue, { color: colors.trading.loss }]}>
              {formatCurrency(currentData.averageLoss)}
            </Text>
          </View>
          
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Largest Win</Text>
            <Text style={[styles.analysisValue, { color: colors.trading.profit }]}>
              {formatCurrency(currentData.largestWin)}
            </Text>
          </View>
          
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Largest Loss</Text>
            <Text style={[styles.analysisValue, { color: colors.trading.loss }]}>
              {formatCurrency(currentData.largestLoss)}
            </Text>
          </View>
          
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Avg Hold Time</Text>
            <Text style={styles.analysisValue}>
              {currentData.averageHoldTime}
            </Text>
          </View>
          
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Risk/Reward</Text>
            <Text style={styles.analysisValue}>
              1:{(Math.abs(currentData.averageWin / currentData.averageLoss)).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Performance Insights */}
      <View style={styles.insights}>
        <Text style={styles.sectionTitle}>Performance Insights</Text>
        <View style={styles.insightsList}>
          {generateInsights(currentData).map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Ionicons 
                name={insight.type === 'positive' ? 'checkmark-circle' : 
                      insight.type === 'negative' ? 'warning' : 'information-circle'} 
                size={16} 
                color={insight.type === 'positive' ? colors.trading.profit : 
                       insight.type === 'negative' ? colors.trading.loss : colors.primary[500]} 
              />
              <Text style={styles.insightText}>{insight.message}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Helper functions
const formatCurrency = (value: number): string => {
  return value >= 0 ? `+$${Math.abs(value).toLocaleString()}` : `-$${Math.abs(value).toLocaleString()}`;
};

const winRateToDescription = (winRate: number): string => {
  if (winRate >= 80) return 'Excellent';
  if (winRate >= 70) return 'Very Good';
  if (winRate >= 60) return 'Good';
  if (winRate >= 50) return 'Average';
  return 'Needs Improvement';
};

const profitFactorToDescription = (profitFactor: number): string => {
  if (profitFactor >= 2.0) return 'Excellent';
  if (profitFactor >= 1.5) return 'Very Good';
  if (profitFactor >= 1.25) return 'Good';
  if (profitFactor >= 1.0) return 'Break Even';
  return 'Losing';
};

const generateInsights = (data: TradeAnalysisData) => {
  const insights = [];
  
  if (data.winRate >= 70) {
    insights.push({
      type: 'positive' as const,
      message: `Excellent win rate of ${data.winRate.toFixed(1)}% indicates strong trading strategy.`
    });
  } else if (data.winRate < 50) {
    insights.push({
      type: 'negative' as const,
      message: `Win rate of ${data.winRate.toFixed(1)}% is below 50%. Consider reviewing entry criteria.`
    });
  }
  
  if (data.profitFactor >= 1.5) {
    insights.push({
      type: 'positive' as const,
      message: `Strong profit factor of ${data.profitFactor.toFixed(2)} shows good risk management.`
    });
  } else if (data.profitFactor < 1.0) {
    insights.push({
      type: 'negative' as const,
      message: `Profit factor below 1.0 indicates losses exceed profits. Review strategy.`
    });
  }
  
  const riskReward = Math.abs(data.averageWin / data.averageLoss);
  if (riskReward >= 2.0) {
    insights.push({
      type: 'positive' as const,
      message: `Excellent risk/reward ratio of 1:${riskReward.toFixed(2)}.`
    });
  } else if (riskReward < 1.0) {
    insights.push({
      type: 'negative' as const,
      message: `Risk/reward ratio below 1:1. Consider taking profits earlier or cutting losses sooner.`
    });
  }
  
  if (data.totalTrades < 30) {
    insights.push({
      type: 'info' as const,
      message: `Limited trade sample of ${data.totalTrades}. More data needed for reliable analysis.`
    });
  }
  
  return insights;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: spacing[4],
    marginVertical: spacing[3],
  },
  header: {
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing[1],
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: colors.primary[500],
  },
  periodText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  activePeriodText: {
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  keyMetrics: {
    marginBottom: spacing[4],
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing[3],
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  statTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing[2],
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[1],
  },
  statSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  detailedAnalysis: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  analysisItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: spacing[3],
  },
  analysisLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  analysisValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  insights: {
    marginTop: spacing[2],
  },
  insightsList: {
    gap: spacing[2],
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: spacing[3],
  },
  insightText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing[2],
    flex: 1,
    lineHeight: 20,
  },
});

export default TradingAnalytics;
