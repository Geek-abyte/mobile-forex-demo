import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { marketDataService, CurrencyPair } from '../../services/marketDataService';
import { tradingService } from '../../services/tradingService';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [currencyPairs, setCurrencyPairs] = useState<CurrencyPair[]>([]);
  const [accountSummary, setAccountSummary] = useState({
    balance: 10000,
    equity: 10000,
    margin: 0,
    freeMargin: 10000,
    marginLevel: 0,
    totalProfit: 247.85,
    todayProfit: 32.15,
    openPositions: 3,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [marketTrend, setMarketTrend] = useState('bullish');

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [pairs, summary] = await Promise.all([
        marketDataService.getCurrencyPairs(),
        tradingService.getAccountSummary(),
      ]);
      setCurrencyPairs(pairs.slice(0, 8));
      setAccountSummary({
        ...summary,
        totalProfit: 247.85,
        todayProfit: 32.15,
        openPositions: 3,
      });
      
      const avgChange = pairs.reduce((sum, pair) => sum + pair.changePercent, 0) / pairs.length;
      setMarketTrend(avgChange > 1 ? 'bullish' : avgChange < -1 ? 'bearish' : 'neutral');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const updateRealTimeData = () => {
    setCurrencyPairs(prev => 
      prev.map(pair => ({
        ...pair,
        price: pair.price * (1 + (Math.random() - 0.5) * 0.002),
        change: pair.change + (Math.random() - 0.5) * 0.5,
        changePercent: pair.changePercent + (Math.random() - 0.5) * 0.1,
      }))
    );
    
    setAccountSummary(prev => ({
      ...prev,
      todayProfit: prev.todayProfit + (Math.random() - 0.5) * 2,
      totalProfit: prev.totalProfit + (Math.random() - 0.5) * 1,
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPrice = (price: number, precision: number): string => {
    return price.toFixed(precision);
  };

  const getMarketTrendIcon = () => {
    switch (marketTrend) {
      case 'bullish': return 'trending-up';
      case 'bearish': return 'trending-down';
      default: return 'remove';
    }
  };

  const getMarketTrendColor = () => {
    switch (marketTrend) {
      case 'bullish': return colors.trading.profit;
      case 'bearish': return colors.trading.loss;
      default: return colors.text.secondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}</Text>
            <Text style={styles.username}>{user?.firstName || 'Trader'}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile' as never)}>
            <Ionicons name="person-circle" size={32} color={colors.primary[500]} />
          </TouchableOpacity>
        </View>

        {/* Portfolio Summary */}
        <LinearGradient
          colors={[colors.primary[500], colors.primary[400]]}
          style={styles.portfolioCard}
        >
          <View style={styles.portfolioHeader}>
            <Text style={styles.portfolioTitle}>Portfolio Balance</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Wallet' as never)}>
              <Ionicons name="wallet" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.portfolioBalance}>{formatCurrency(accountSummary.balance)}</Text>
          <View style={styles.portfolioStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Today's P&L</Text>
              <Text style={[
                styles.statValue,
                { color: accountSummary.todayProfit >= 0 ? '#00D4AA' : '#FF4757' }
              ]}>
                {accountSummary.todayProfit >= 0 ? '+' : ''}{formatCurrency(accountSummary.todayProfit)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total P&L</Text>
              <Text style={[
                styles.statValue,
                { color: accountSummary.totalProfit >= 0 ? '#00D4AA' : '#FF4757' }
              ]}>
                {accountSummary.totalProfit >= 0 ? '+' : ''}{formatCurrency(accountSummary.totalProfit)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Trading' as never)}
          >
            <LinearGradient
              colors={[colors.status.success, colors.trading.profit]}
              style={styles.actionGradient}
            >
              <Ionicons name="trending-up" size={24} color="white" />
              <Text style={styles.actionText}>Trade</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Market' as never)}
          >
            <View style={[styles.actionGradient, { backgroundColor: colors.background.tertiary }]}>
              <Ionicons name="bar-chart" size={24} color={colors.primary[500]} />
              <Text style={[styles.actionText, { color: colors.primary[500] }]}>Markets</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('P2P' as never)}
          >
            <View style={[styles.actionGradient, { backgroundColor: colors.background.tertiary }]}>
              <Ionicons name="people" size={24} color={colors.secondary[500]} />
              <Text style={[styles.actionText, { color: colors.secondary[500] }]}>P2P</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Market Overview */}
        <View style={styles.marketCard}>
          <View style={styles.marketHeader}>
            <Text style={styles.cardTitle}>Market Overview</Text>
            <View style={styles.marketTrend}>
              <Ionicons 
                name={getMarketTrendIcon()} 
                size={16} 
                color={getMarketTrendColor()} 
              />
              <Text style={[styles.trendText, { color: getMarketTrendColor() }]}>
                {marketTrend.toUpperCase()}
              </Text>
            </View>
          </View>
          {currencyPairs.map((pair, index) => (
            <TouchableOpacity 
              key={pair.id} 
              style={[styles.pairRow, index === currencyPairs.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate('Trading' as never)}
            >
              <View style={styles.pairInfo}>
                <View style={styles.pairHeader}>
                  <Text style={styles.pairSymbol}>{pair.symbol}</Text>
                  <View style={[
                    styles.categoryBadge,
                    { backgroundColor: pair.category === 'major' ? colors.primary[500] : colors.text.tertiary }
                  ]}>
                    <Text style={styles.categoryText}>{pair.category.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.pairName}>{pair.name}</Text>
              </View>
              <View style={styles.pairPricing}>
                <Text style={styles.pairPrice}>
                  {formatPrice(pair.price, pair.precision)}
                </Text>
                <View style={styles.changeContainer}>
                  <Ionicons 
                    name={pair.change >= 0 ? 'caret-up' : 'caret-down'} 
                    size={12} 
                    color={pair.change >= 0 ? colors.trading.profit : colors.trading.loss} 
                  />
                  <Text style={[
                    styles.pairChange,
                    { color: pair.change >= 0 ? colors.trading.profit : colors.trading.loss }
                  ]}>
                    {Math.abs(pair.changePercent).toFixed(2)}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Market' as never)}
          >
            <Text style={styles.viewAllText}>View All Markets</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary[500]} />
          </TouchableOpacity>
        </View>

        {/* Account Summary */}
        <View style={styles.accountCard}>
          <Text style={styles.cardTitle}>Account Summary</Text>
          <View style={styles.accountGrid}>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Equity</Text>
              <Text style={styles.accountValue}>
                {formatCurrency(accountSummary.equity)}
              </Text>
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Margin</Text>
              <Text style={styles.accountValue}>
                {formatCurrency(accountSummary.margin)}
              </Text>
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Free Margin</Text>
              <Text style={styles.accountValue}>
                {formatCurrency(accountSummary.freeMargin)}
              </Text>
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Open Positions</Text>
              <Text style={styles.accountValue}>
                {accountSummary.openPositions}
              </Text>
            </View>
          </View>
        </View>

        {/* Demo Mode Notice */}
        <View style={styles.demoNotice}>
          <Ionicons name="information-circle" size={20} color={colors.status.info} />
          <Text style={styles.demoText}>
            Demo Mode Active - All trades are simulated
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
  },
  greeting: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
  },
  username: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing[1],
  },
  profileButton: {
    padding: spacing[2],
  },
  portfolioCard: {
    margin: spacing[6],
    padding: spacing[6],
    borderRadius: 16,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  portfolioTitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  portfolioBalance: {
    fontSize: typography.sizes['4xl'],
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: 'white',
    marginBottom: spacing[6],
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: spacing[1],
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing[6],
    marginBottom: spacing[6],
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    gap: spacing[2],
  },
  actionText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: 'white',
  },
  marketCard: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing[6],
    marginBottom: spacing[6],
    borderRadius: 16,
    padding: spacing[6],
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  cardTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  marketTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  trendText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
  },
  pairRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.secondary,
  },
  pairInfo: {
    flex: 1,
  },
  pairHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  pairSymbol: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  categoryBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  categoryText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: 'white',
  },
  pairName: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
  },
  pairPricing: {
    alignItems: 'flex-end',
  },
  pairPrice: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  pairChange: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    marginTop: spacing[2],
    gap: spacing[2],
  },
  viewAllText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.primary[500],
  },
  accountCard: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing[6],
    marginBottom: spacing[6],
    borderRadius: 16,
    padding: spacing[6],
  },
  accountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
  },
  accountItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.tertiary,
    padding: spacing[4],
    borderRadius: 12,
  },
  accountLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  accountValue: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing[6],
    marginBottom: spacing[6],
    padding: spacing[4],
    borderRadius: 12,
    gap: spacing[3],
  },
  demoText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    flex: 1,
  },
});

export default DashboardScreen;
