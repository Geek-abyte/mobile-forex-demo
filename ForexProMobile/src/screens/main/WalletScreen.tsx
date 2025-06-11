import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing } from '../../theme';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { accountService, AccountBalance, RecentTransaction } from '../../services/accountService';
import StandardHeader from '../../components/molecules/StandardHeader';

const WalletScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [dailyChange, setDailyChange] = useState(0);

  useEffect(() => {
    loadWalletData();
    
    // Set up interval to update data from centralized service
    const interval = setInterval(() => {
      const updatedBalances = accountService.getBalances();
      const updatedTransactions = accountService.getRecentTransactions();
      const updatedPortfolioValue = accountService.getTotalPortfolioValue();
      
      setBalances(updatedBalances);
      setRecentTransactions(updatedTransactions);
      setPortfolioValue(updatedPortfolioValue);
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadWalletData = async () => {
    setIsLoading(true);
    
    try {
      // Get data from centralized account service
      const balances = accountService.getBalances();
      const transactions = accountService.getRecentTransactions();
      const totalValue = accountService.getTotalPortfolioValue();
      
      setBalances(balances);
      setRecentTransactions(transactions);
      setPortfolioValue(totalValue);
      setDailyChange(Math.random() * 400 - 200); // Random daily change for demo
      
      console.log('WalletScreen - Loaded portfolio value:', totalValue);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: RecentTransaction['type']) => {
    switch (type) {
      case 'deposit': return 'arrow-down-circle';
      case 'withdrawal': return 'arrow-up-circle';
      case 'trade': return 'trending-up';
      default: return 'cash';
    }
  };

  const getTransactionColor = (type: RecentTransaction['type'], amount: number) => {
    if (type === 'deposit' || amount > 0) return colors.trading.profit;
    return colors.trading.loss;
  };

  const renderBalance = ({ item }: { item: AccountBalance }) => (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceCurrency}>{item.currency}</Text>
        <Text style={styles.balanceTotal}>{formatCurrency(item.total, '')}</Text>
      </View>
      <View style={styles.balanceDetails}>
        <View style={styles.balanceDetail}>
          <Text style={styles.balanceLabel}>Available</Text>
          <Text style={styles.balanceValue}>{formatCurrency(item.available, '')}</Text>
        </View>
        <View style={styles.balanceDetail}>
          <Text style={styles.balanceLabel}>In Use</Text>
          <Text style={styles.balanceValue}>{formatCurrency(item.locked, '')}</Text>
        </View>
      </View>
    </View>
  );

  const renderTransaction = ({ item }: { item: RecentTransaction }) => (
    <View style={styles.transactionItem}>
      <View style={[
        styles.transactionIcon,
        { backgroundColor: getTransactionColor(item.type, item.amount) + '20' }
      ]}>
        <Ionicons
          name={getTransactionIcon(item.type)}
          size={16}
          color={getTransactionColor(item.type, item.amount)}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionType}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
        <Text style={styles.transactionTime}>{formatDate(item.timestamp)}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.transactionValue,
          { color: getTransactionColor(item.type, item.amount) }
        ]}>
          {item.amount >= 0 ? '+' : ''}{formatCurrency(item.amount, item.currency)}
        </Text>
        <Text style={[
          styles.transactionStatus,
          { color: item.status === 'completed' ? colors.trading.profit : colors.trading.warning }
        ]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StandardHeader title="Wallet" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadWalletData}
            tintColor={colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* Portfolio Summary */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          <Text style={styles.portfolioValue}>${portfolioValue.toFixed(2)}</Text>
          <View style={styles.portfolioChange}>
            <Ionicons
              name={dailyChange >= 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={dailyChange >= 0 ? colors.trading.profit : colors.trading.loss}
            />
            <Text style={[
              styles.portfolioChangeText,
              { color: dailyChange >= 0 ? colors.trading.profit : colors.trading.loss }
            ]}>
              {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(2)} (24h)
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Deposit', {})}
            >
              <Ionicons name="add-circle" size={24} color={colors.trading.profit} />
              <Text style={styles.actionButtonText}>Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Withdraw', {})}
            >
              <Ionicons name="remove-circle" size={24} color={colors.trading.loss} />
              <Text style={styles.actionButtonText}>Withdraw</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('TransactionHistory')}
            >
              <Ionicons name="time" size={24} color={colors.primary[500]} />
              <Text style={styles.actionButtonText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Balances */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Balances</Text>
          <FlatList
            data={balances}
            renderItem={renderBalance}
            keyExtractor={(item) => item.currency}
            scrollEnabled={false}
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={colors.text.secondary} />
                <Text style={styles.emptyStateText}>No recent transactions</Text>
              </View>
            }
          />
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
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  portfolioCard: {
    backgroundColor: colors.background.secondary,
    margin: spacing[4],
    padding: spacing[4],
    borderRadius: 12,
    alignItems: 'center',
  },
  portfolioLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  portfolioValue: {
    fontSize: typography.sizes['3xl'],
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  portfolioChangeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
  },
  actionsContainer: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    paddingVertical: spacing[4],
    marginHorizontal: spacing[1],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginTop: spacing[2],
  },
  section: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.primary[500],
    fontWeight: typography.weights.medium,
  },
  balanceCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  balanceCurrency: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  balanceTotal: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceDetail: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  balanceValue: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.monospace,
    color: colors.text.primary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  transactionTime: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing[1],
  },
  transactionStatus: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyStateText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginTop: spacing[3],
  },
});

export default WalletScreen;
