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
import { colors, typography, spacing } from '../../theme';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'fee' | 'bonus' | 'transfer';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  timestamp: number;
  description: string;
  reference?: string;
  method?: string;
  fee?: number;
  tradePair?: string;
  tradeType?: 'buy' | 'sell';
}

const TransactionHistoryScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'trade'>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | '3months' | 'year'>('month');

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'deposit', label: 'Deposits' },
    { key: 'withdrawal', label: 'Withdrawals' },
    { key: 'trade', label: 'Trading' },
  ];

  const timeframeOptions = [
    { key: 'week', label: '7 Days' },
    { key: 'month', label: '30 Days' },
    { key: '3months', label: '3 Months' },
    { key: 'year', label: '1 Year' },
  ];

  useEffect(() => {
    loadTransactions();
  }, [selectedFilter, selectedTimeframe]);

  const loadTransactions = () => {
    setIsLoading(true);
    
    // Generate mock transaction data
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'deposit',
        amount: 1000,
        currency: 'USD',
        status: 'completed',
        timestamp: Date.now() - 86400000, // 1 day ago
        description: 'Bank Transfer Deposit',
        method: 'Bank Transfer',
        reference: 'DEP001234',
      },
      {
        id: '2',
        type: 'trade',
        amount: -150.50,
        currency: 'USD',
        status: 'completed',
        timestamp: Date.now() - 172800000, // 2 days ago
        description: 'EUR/USD Trade Loss',
        tradePair: 'EUR/USD',
        tradeType: 'sell',
        fee: 2.50,
      },
      {
        id: '3',
        type: 'trade',
        amount: 245.75,
        currency: 'USD',
        status: 'completed',
        timestamp: Date.now() - 259200000, // 3 days ago
        description: 'GBP/USD Trade Profit',
        tradePair: 'GBP/USD',
        tradeType: 'buy',
        fee: 3.25,
      },
      {
        id: '4',
        type: 'withdrawal',
        amount: -500,
        currency: 'USD',
        status: 'pending',
        timestamp: Date.now() - 345600000, // 4 days ago
        description: 'Bank Transfer Withdrawal',
        method: 'Bank Transfer',
        reference: 'WD001235',
        fee: 5.00,
      },
      {
        id: '5',
        type: 'deposit',
        amount: 750,
        currency: 'USD',
        status: 'completed',
        timestamp: Date.now() - 432000000, // 5 days ago
        description: 'Credit Card Deposit',
        method: 'Credit Card',
        reference: 'DEP001236',
        fee: 15.00,
      },
      {
        id: '6',
        type: 'bonus',
        amount: 50,
        currency: 'USD',
        status: 'completed',
        timestamp: Date.now() - 518400000, // 6 days ago
        description: 'Welcome Bonus',
        reference: 'BON001001',
      },
      {
        id: '7',
        type: 'fee',
        amount: -12.50,
        currency: 'USD',
        status: 'completed',
        timestamp: Date.now() - 604800000, // 7 days ago
        description: 'Maintenance Fee',
        reference: 'FEE001001',
      },
      {
        id: '8',
        type: 'trade',
        amount: 89.25,
        currency: 'USD',
        status: 'completed',
        timestamp: Date.now() - 691200000, // 8 days ago
        description: 'USD/JPY Trade Profit',
        tradePair: 'USD/JPY',
        tradeType: 'buy',
        fee: 1.75,
      },
    ];

    // Filter transactions based on selected criteria
    let filteredTransactions = mockTransactions;

    if (selectedFilter !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => tx.type === selectedFilter);
    }

    // Filter by timeframe
    const now = Date.now();
    const timeframes = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      '3months': 90 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    };

    filteredTransactions = filteredTransactions.filter(
      tx => (now - tx.timestamp) <= timeframes[selectedTimeframe]
    );

    // Sort by timestamp (most recent first)
    filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);

    setTimeout(() => {
      setTransactions(filteredTransactions);
      setIsLoading(false);
    }, 500);
  };

  const getTransactionIcon = (type: Transaction['type'], status: Transaction['status']) => {
    if (status === 'failed') return 'close-circle';
    if (status === 'pending') return 'time';
    
    switch (type) {
      case 'deposit': return 'arrow-down-circle';
      case 'withdrawal': return 'arrow-up-circle';
      case 'trade': return 'trending-up';
      case 'fee': return 'card';
      case 'bonus': return 'gift';
      case 'transfer': return 'swap-horizontal';
      default: return 'cash';
    }
  };

  const getTransactionColor = (type: Transaction['type'], amount: number, status: Transaction['status']) => {
    if (status === 'failed') return colors.trading.loss;
    if (status === 'pending') return colors.trading.warning;
    
    if (type === 'deposit' || type === 'bonus' || amount > 0) return colors.trading.profit;
    return colors.trading.loss;
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return colors.trading.profit;
      case 'pending': return colors.trading.warning;
      case 'failed': return colors.trading.loss;
      case 'cancelled': return colors.text.secondary;
      default: return colors.text.secondary;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount.toFixed(2)} ${currency}`;
  };

  const calculateTotalAmount = () => {
    return transactions
      .filter(tx => tx.status === 'completed')
      .reduce((total, tx) => total + tx.amount, 0);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getTransactionColor(item.type, item.amount, item.status) + '20' }
        ]}>
          <Ionicons
            name={getTransactionIcon(item.type, item.status)}
            size={20}
            color={getTransactionColor(item.type, item.amount, item.status)}
          />
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionDate}>{formatDate(item.timestamp)}</Text>
            <Text style={[styles.transactionStatus, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          {item.reference && (
            <Text style={styles.transactionReference}>Ref: {item.reference}</Text>
          )}
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={[
            styles.transactionAmount,
            { color: getTransactionColor(item.type, item.amount, item.status) }
          ]}>
            {formatAmount(item.amount, item.currency)}
          </Text>
          {item.fee && (
            <Text style={styles.transactionFee}>Fee: {item.fee.toFixed(2)} {item.currency}</Text>
          )}
        </View>
      </View>
      
      {item.method && (
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionMethod}>Method: {item.method}</Text>
        </View>
      )}
      
      {item.tradePair && (
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionMethod}>
            Pair: {item.tradePair} • {item.tradeType?.toUpperCase()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total ({selectedTimeframe})</Text>
        <Text style={[
          styles.summaryAmount,
          { color: calculateTotalAmount() >= 0 ? colors.trading.profit : colors.trading.loss }
        ]}>
          {formatAmount(calculateTotalAmount(), 'USD')}
        </Text>
        <Text style={styles.summaryCount}>{transactions.length} transactions</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                selectedFilter === option.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(option.key as any)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === option.key && styles.filterTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Period</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {timeframeOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                selectedTimeframe === option.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedTimeframe(option.key as any)}
            >
              <Text style={[
                styles.filterText,
                selectedTimeframe === option.key && styles.filterTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        style={styles.transactionList}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadTransactions}
            tintColor={colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptySubtitle}>
              No transactions found for the selected period and filters.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  summaryCard: {
    backgroundColor: colors.background.secondary,
    margin: spacing[4],
    padding: spacing[4],
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  summaryAmount: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[1],
  },
  summaryCount: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  filtersContainer: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  filterTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginRight: spacing[2],
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.weights.semibold,
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  transactionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  transactionDate: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  transactionStatus: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
  },
  transactionReference: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[1],
  },
  transactionFee: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  transactionDetails: {
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  transactionMethod: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  emptySubtitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
});

export default TransactionHistoryScreen;
