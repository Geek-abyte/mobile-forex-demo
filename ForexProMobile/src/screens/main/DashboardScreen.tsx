import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { marketDataService, CurrencyPair } from '../../services/marketDataService';
import { tradingService } from '../../services/tradingService';

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [currencyPairs, setCurrencyPairs] = useState<CurrencyPair[]>([]);
  const [accountSummary, setAccountSummary] = useState({
    balance: 10000,
    equity: 10000,
    margin: 0,
    freeMargin: 10000,
    marginLevel: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pairs, summary] = await Promise.all([
        marketDataService.getCurrencyPairs(),
        tradingService.getAccountSummary(),
      ]);
      setCurrencyPairs(pairs.slice(0, 6)); // Show top 6 pairs
      setAccountSummary(summary);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPrice = (price: number, precision: number) => {
    return price.toFixed(precision);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back, {user?.firstName || 'Trader'}!
            </Text>
            <Text style={styles.subtitle}>ForexPro Trading Platform</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Account Summary */}
        <View style={styles.accountCard}>
          <Text style={styles.cardTitle}>Account Summary</Text>
          <View style={styles.accountGrid}>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Balance</Text>
              <Text style={styles.accountValue}>
                {formatCurrency(accountSummary.balance)}
              </Text>
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Equity</Text>
              <Text style={styles.accountValue}>
                {formatCurrency(accountSummary.equity)}
              </Text>
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Free Margin</Text>
              <Text style={styles.accountValue}>
                {formatCurrency(accountSummary.freeMargin)}
              </Text>
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Margin Level</Text>
              <Text style={styles.accountValue}>
                {accountSummary.marginLevel.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Market Overview */}
        <View style={styles.marketCard}>
          <Text style={styles.cardTitle}>Market Overview</Text>
          {currencyPairs.map((pair) => (
            <View key={pair.id} style={styles.pairRow}>
              <View style={styles.pairInfo}>
                <Text style={styles.pairSymbol}>{pair.symbol}</Text>
                <Text style={styles.pairName}>{pair.name}</Text>
              </View>
              <View style={styles.pairPricing}>
                <Text style={styles.pairPrice}>
                  {formatPrice(pair.price, pair.precision)}
                </Text>
                <Text style={[
                  styles.pairChange,
                  { color: pair.change >= 0 ? colors.trading.profit : colors.trading.loss }
                ]}>
                  {pair.change >= 0 ? '+' : ''}{pair.changePercent.toFixed(2)}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Demo Mode Notice */}
        <View style={styles.demoNotice}>
          <Text style={styles.demoText}>
            🎯 Demo Mode Active - All trades are simulated
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  greeting: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  logoutButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
  },
  logoutText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
  },
  accountCard: {
    backgroundColor: colors.background.secondary,
    margin: spacing[4],
    padding: spacing[4],
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  accountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  accountItem: {
    width: '48%',
    marginBottom: spacing[3],
  },
  accountLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  accountValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  marketCard: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    padding: spacing[4],
    borderRadius: 12,
  },
  pairRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  pairInfo: {
    flex: 1,
  },
  pairSymbol: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  pairName: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  pairPricing: {
    alignItems: 'flex-end',
  },
  pairPrice: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  pairChange: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    marginTop: 2,
  },
  demoNotice: {
    backgroundColor: colors.background.tertiary,
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    padding: spacing[3],
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  demoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default DashboardScreen;
