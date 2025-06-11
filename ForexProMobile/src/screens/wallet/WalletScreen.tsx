import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { colors, typography, spacing } from '../../theme';
import { MainStackParamList } from '../../navigation/MainNavigator';

const { width } = Dimensions.get('window');

const WalletScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'balances' | 'transactions'>('balances');
  
  const {
    balances,
    transactions,
    totalPortfolioValue,
    totalPnl,
    totalPnlPercent,
    hideSmallBalances,
  } = useSelector((state: RootState) => state.wallet);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatCurrency = (amount: number, currency: string = 'USD', symbol: string = '$') => {
    return `${symbol}${Math.abs(amount).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatChange = (value: number, isPercent: boolean = false) => {
    const prefix = value >= 0 ? '+' : '';
    const suffix = isPercent ? '%' : '';
    return `${prefix}${value.toFixed(2)}${suffix}`;
  };

  const renderPortfolioHeader = () => (
    <View style={styles.portfolioContainer}>
      <LinearGradient
        colors={[colors.primary[500], colors.primary[400]]}
        style={styles.portfolioGradient}
      >
        <View style={styles.portfolioHeader}>
          <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          <Text style={styles.portfolioValue}>
            {formatCurrency(totalPortfolioValue)}
          </Text>
          <View style={styles.pnlContainer}>
            <Text style={[
              styles.pnlText,
              { color: totalPnl >= 0 ? colors.trading.profit : colors.trading.loss }
            ]}>
              {formatChange(totalPnl)} ({formatChange(totalPnlPercent, true)})
            </Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Deposit', {})}
          >
            <Ionicons name="add-circle" size={20} color={colors.text.primary} />
            <Text style={styles.actionButtonText}>Deposit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Withdraw', {})}
          >
            <Ionicons name="remove-circle" size={20} color={colors.text.primary} />
            <Text style={styles.actionButtonText}>Withdraw</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('TransactionHistory')}
          >
            <Ionicons name="receipt" size={20} color={colors.text.primary} />
            <Text style={styles.actionButtonText}>History</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderBalanceItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.balanceItem}>
      <View style={styles.balanceInfo}>
        <View style={styles.currencyIcon}>
          <Text style={styles.currencySymbol}>{item.symbol}</Text>
        </View>
        <View style={styles.balanceDetails}>
          <Text style={styles.currencyName}>{item.displayName}</Text>
          <Text style={styles.currencyCode}>{item.currency}</Text>
        </View>
      </View>
      
      <View style={styles.balanceAmounts}>
        <Text style={styles.balanceAmount}>
          {formatCurrency(item.balance, item.currency, item.symbol)}
        </Text>
        <Text style={styles.availableBalance}>
          Available: {formatCurrency(item.availableBalance, item.currency, item.symbol)}
        </Text>
        {item.lockedBalance > 0 && (
          <Text style={styles.lockedBalance}>
            Locked: {formatCurrency(item.lockedBalance, item.currency, item.symbol)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTransactionItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons 
          name={getTransactionIcon(item.type)} 
          size={24} 
          color={getTransactionColor(item.type)} 
        />
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
        <View style={styles.transactionStatus}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(item.status) }
          ]} />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.transactionAmountText,
          { color: item.amount >= 0 ? colors.trading.profit : colors.trading.loss }
        ]}>
          {item.amount >= 0 ? '+' : ''}{item.amount.toFixed(4)} {item.currency}
        </Text>
        {item.fee > 0 && (
          <Text style={styles.transactionFee}>
            Fee: {item.fee.toFixed(4)} {item.currency}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return 'arrow-down-circle';
      case 'withdrawal': return 'arrow-up-circle';
      case 'trade': return 'swap-horizontal';
      case 'p2p': return 'people';
      case 'transfer': return 'send';
      default: return 'cash';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return colors.trading.profit;
      case 'withdrawal': return colors.trading.loss;
      case 'trade': return colors.primary[500];
      case 'p2p': return colors.secondary[500];
      case 'transfer': return colors.trading.warning;
      default: return colors.text.secondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.status.success;
      case 'pending': return colors.status.warning;
      case 'failed': return colors.status.error;
      case 'cancelled': return colors.text.secondary;
      default: return colors.text.secondary;
    }
  };

  const filteredBalances = hideSmallBalances 
    ? balances.filter(balance => balance.balance >= 1)
    : balances;

  const recentTransactions = transactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      {renderPortfolioHeader()}
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'balances' && styles.activeTab]}
          onPress={() => setActiveTab('balances')}
        >
          <Text style={[styles.tabText, activeTab === 'balances' && styles.activeTabText]}>
            Balances
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
            Recent Transactions
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'balances' ? (
          <FlatList
            data={filteredBalances}
            renderItem={renderBalanceItem}
            keyExtractor={(item) => item.currency}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={recentTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('TransactionHistory')}
              >
                <Text style={styles.viewAllText}>View All Transactions</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.primary[500]} />
              </TouchableOpacity>
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  portfolioContainer: {
    marginBottom: spacing[4],
  },
  portfolioGradient: {
    padding: spacing[6],
    borderRadius: 16,
    margin: spacing[4],
  },
  portfolioHeader: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  portfolioLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    opacity: 0.8,
    marginBottom: spacing[1],
  },
  portfolioValue: {
    fontSize: typography.sizes['3xl'],
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  pnlContainer: {
    alignItems: 'center',
  },
  pnlText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: spacing[3],
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    marginTop: spacing[1],
    fontWeight: typography.weights.semibold,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    margin: spacing[4],
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary[500],
  },
  tabText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
  activeTabText: {
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing[4],
    borderRadius: 12,
    marginBottom: spacing[3],
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  currencySymbol: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
  },
  balanceDetails: {
    flex: 1,
  },
  currencyName: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  currencyCode: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  balanceAmounts: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
  },
  availableBalance: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  lockedBalance: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.trading.warning,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing[4],
    borderRadius: 12,
    marginBottom: spacing[3],
  },
  transactionIcon: {
    marginRight: spacing[3],
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  transactionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing[1],
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
  },
  transactionFee: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing[4],
    borderRadius: 12,
    marginTop: spacing[3],
  },
  viewAllText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
    marginRight: spacing[1],
  },
});

export default WalletScreen;
