import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { tradingService } from '../../services/tradingService';

const { width } = Dimensions.get('window');

interface Order {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  size: number;
  price: number;
  currentPrice?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  timestamp: number;
  profit?: number;
  commission: number;
}

interface OrderFilter {
  status: 'all' | 'pending' | 'filled' | 'cancelled';
  type: 'all' | 'buy' | 'sell';
  symbol: 'all' | string;
}

interface TradingSummary {
  totalTrades: number;
  profitableTrades: number;
  totalProfit: number;
  totalLoss: number;
  winRate: number;
  averageProfit: number;
  bestTrade: number;
  worstTrade: number;
}

const OrderHistoryScreenProfessional: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderFilter>({
    status: 'all',
    type: 'all',
    symbol: 'all',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'history'>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(true);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

  const tabs = [
    { key: 'all', label: 'All Orders', icon: 'list-outline' as const },
    { key: 'pending', label: 'Pending', icon: 'time-outline' as const },
    { key: 'history', label: 'History', icon: 'archive-outline' as const },
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filter, selectedTab]);

  const loadOrders = async () => {
    // Generate realistic demo order history
    const orders = generateDemoOrders();
    setOrders(orders);
  };

  const generateDemoOrders = (): Order[] => {
    const symbols = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD'];
    const orders: Order[] = [];
    
    for (let i = 0; i < 25; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const type = Math.random() > 0.5 ? 'buy' : 'sell';
      const orderType = Math.random() > 0.7 ? 'limit' : 'market';
      const size = Math.floor(Math.random() * 10000) + 1000;
      const basePrice = 1.0000 + Math.random() * 0.5;
      const price = basePrice + (Math.random() - 0.5) * 0.01;
      const currentPrice = basePrice + (Math.random() - 0.5) * 0.02;
      const commission = size * 0.00001;
      
      // Determine status based on order age and type
      const now = Date.now();
      const timestamp = now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const status = orderType === 'market' || Math.random() > 0.3 
        ? (Math.random() > 0.1 ? 'filled' : 'cancelled')
        : 'pending';
      
      let profit = undefined;
      if (status === 'filled') {
        const priceDiff = type === 'buy' ? (currentPrice - price) : (price - currentPrice);
        profit = priceDiff * size - commission;
      }

      orders.push({
        id: `order_${i + 1}`,
        symbol,
        type,
        orderType,
        size,
        price,
        currentPrice,
        status,
        timestamp,
        profit,
        commission,
      });
    }
    
    return orders.sort((a, b) => b.timestamp - a.timestamp);
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Apply tab filter
    if (selectedTab === 'pending') {
      filtered = filtered.filter(order => order.status === 'pending');
    } else if (selectedTab === 'history') {
      filtered = filtered.filter(order => order.status !== 'pending');
    }

    // Apply additional filters
    if (filter.status !== 'all') {
      filtered = filtered.filter(order => order.status === filter.status);
    }
    
    if (filter.type !== 'all') {
      filtered = filtered.filter(order => order.type === filter.type);
    }
    
    if (filter.symbol !== 'all') {
      filtered = filtered.filter(order => order.symbol === filter.symbol);
    }

    setFilteredOrders(filtered);
  };

  const calculateTradingSummary = (): TradingSummary => {
    const filledOrders = orders.filter(order => order.status === 'filled' && order.profit !== undefined);
    const profitableOrders = filledOrders.filter(order => (order.profit || 0) > 0);
    const totalProfit = filledOrders.reduce((sum, order) => sum + Math.max(order.profit || 0, 0), 0);
    const totalLoss = filledOrders.reduce((sum, order) => sum + Math.min(order.profit || 0, 0), 0);
    const profits = filledOrders.map(order => order.profit || 0);

    return {
      totalTrades: filledOrders.length,
      profitableTrades: profitableOrders.length,
      totalProfit,
      totalLoss,
      winRate: filledOrders.length > 0 ? (profitableOrders.length / filledOrders.length) * 100 : 0,
      averageProfit: filledOrders.length > 0 ? (totalProfit + totalLoss) / filledOrders.length : 0,
      bestTrade: profits.length > 0 ? Math.max(...profits) : 0,
      worstTrade: profits.length > 0 ? Math.min(...profits) : 0,
    };
  };

  const handleCancelOrder = async (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              setOrders(prev => prev.map(order => 
                order.id === orderId ? { ...order, status: 'cancelled' as const } : order
              ));
              Alert.alert('Success', 'Order cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order');
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => price.toFixed(5);
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return colors.trading.warning;
      case 'filled': return colors.trading.profit;
      case 'cancelled': return colors.text.tertiary;
      case 'rejected': return colors.trading.loss;
      default: return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'filled': return 'checkmark-circle';
      case 'cancelled': return 'close-circle';
      case 'rejected': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const toggleCardExpansion = (orderId: string) => {
    setExpandedCard(expandedCard === orderId ? null : orderId);
  };

  const renderOrderCard = ({ item: order }: { item: Order }) => {
    const isExpanded = expandedCard === order.id;
    const canCancel = order.status === 'pending';
    
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => toggleCardExpansion(order.id)}
        activeOpacity={0.7}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderMainInfo}>
            <View style={styles.symbolTypeContainer}>
              <Text style={styles.orderSymbol}>{order.symbol}</Text>
              <View style={[
                styles.orderTypeBadge,
                order.type === 'buy' ? styles.buyBadge : styles.sellBadge
              ]}>
                <Text style={styles.orderTypeBadgeText}>{order.type.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.orderSize}>
              {order.size.toLocaleString()} @ {formatPrice(order.price)}
            </Text>
          </View>
          
          <View style={styles.orderRightInfo}>
            <View style={styles.statusContainer}>
              <Ionicons 
                name={getStatusIcon(order.status)} 
                size={16} 
                color={getStatusColor(order.status)} 
              />
              <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
                {order.status.toUpperCase()}
              </Text>
            </View>
            {order.profit !== undefined && (
              <Text style={[
                styles.orderProfit,
                order.profit >= 0 ? styles.profitText : styles.lossText
              ]}>
                {order.profit >= 0 ? '+' : ''}{formatCurrency(order.profit)}
              </Text>
            )}
          </View>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Type:</Text>
              <Text style={styles.detailValue}>{order.orderType.toUpperCase()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Timestamp:</Text>
              <Text style={styles.detailValue}>{formatDate(order.timestamp)}</Text>
            </View>
            {order.currentPrice && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Current Price:</Text>
                <Text style={styles.detailValue}>{formatPrice(order.currentPrice)}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Commission:</Text>
              <Text style={styles.detailValue}>{formatCurrency(order.commission)}</Text>
            </View>
            
            {canCancel && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => handleCancelOrder(order.id)}
              >
                <Ionicons name="close-circle" size={16} color={colors.trading.loss} />
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Expansion Indicator */}
        <View style={styles.expansionIndicator}>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color={colors.text.tertiary} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderSummaryCard = () => {
    const summary = calculateTradingSummary();
    
    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Trading Summary</Text>
          <TouchableOpacity onPress={() => setShowSummary(!showSummary)}>
            <Ionicons 
              name={showSummary ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>
        </View>
        
        {showSummary && (
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{summary.totalTrades}</Text>
                <Text style={styles.summaryLabel}>Total Trades</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, styles.profitText]}>
                  {summary.winRate.toFixed(1)}%
                </Text>
                <Text style={styles.summaryLabel}>Win Rate</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[
                  styles.summaryValue,
                  (summary.totalProfit + summary.totalLoss) >= 0 ? styles.profitText : styles.lossText
                ]}>
                  {formatCurrency(summary.totalProfit + summary.totalLoss)}
                </Text>
                <Text style={styles.summaryLabel}>Net P&L</Text>
              </View>
            </View>
            
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, styles.profitText]}>
                  {formatCurrency(summary.bestTrade)}
                </Text>
                <Text style={styles.summaryLabel}>Best Trade</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, styles.lossText]}>
                  {formatCurrency(summary.worstTrade)}
                </Text>
                <Text style={styles.summaryLabel}>Worst Trade</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {formatCurrency(summary.averageProfit)}
                </Text>
                <Text style={styles.summaryLabel}>Avg P&L</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Professional Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Order History</Text>
          <Text style={styles.headerSubtitle}>
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
          >
            <Ionicons 
              name={viewMode === 'compact' ? 'list' : 'grid'} 
              size={20} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon} 
              size={16} 
              color={selectedTab === tab.key ? colors.primary[500] : colors.text.secondary} 
            />
            <Text style={[
              styles.tabText,
              selectedTab === tab.key && styles.tabTextActive
            ]}>
              {tab.label}
            </Text>
            {tab.key === 'pending' && orders.filter(o => o.status === 'pending').length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {orders.filter(o => o.status === 'pending').length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Card */}
      {selectedTab !== 'pending' && renderSummaryCard()}

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        style={styles.orderList}
        contentContainerStyle={styles.orderListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'pending' 
                ? 'You have no pending orders' 
                : 'Your order history will appear here'}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  
  // Professional Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: spacing[2],
    marginLeft: spacing[1],
  },

  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 8,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: colors.background.tertiary,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginLeft: spacing[1],
  },
  tabTextActive: {
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  tabBadge: {
    position: 'absolute',
    top: spacing[1],
    right: spacing[1],
    backgroundColor: colors.trading.warning,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: colors.background.secondary,
    margin: spacing[4],
    borderRadius: 12,
    overflow: 'hidden',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  summaryTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  summaryContent: {
    padding: spacing[4],
    paddingTop: spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  // Order List
  orderList: {
    flex: 1,
  },
  orderListContent: {
    padding: spacing[4],
    paddingTop: spacing[2],
  },
  orderCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginBottom: spacing[3],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  orderMainInfo: {
    flex: 1,
  },
  symbolTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  orderSymbol: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginRight: spacing[2],
  },
  orderTypeBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  buyBadge: {
    backgroundColor: colors.trading.profit,
  },
  sellBadge: {
    backgroundColor: colors.trading.loss,
  },
  orderTypeBadgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
  },
  orderSize: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    color: colors.text.secondary,
  },
  orderRightInfo: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  orderStatus: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing[1],
    textTransform: 'uppercase',
  },
  orderProfit: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.semibold,
  },
  profitText: {
    color: colors.trading.profit,
  },
  lossText: {
    color: colors.trading.loss,
  },

  // Order Details (Expanded)
  orderDetails: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    paddingVertical: spacing[2],
    marginTop: spacing[3],
    borderWidth: 1,
    borderColor: colors.trading.loss,
  },
  cancelButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.trading.loss,
    marginLeft: spacing[1],
  },
  expansionIndicator: {
    position: 'absolute',
    bottom: spacing[2],
    right: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[10],
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  emptySubtitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
    textAlign: 'center',
    maxWidth: 250,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
});

export default OrderHistoryScreenProfessional;
