import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { tradingService } from '../../services/tradingService';

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

const OrderHistoryScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderFilter>({
    status: 'all',
    type: 'all',
    symbol: 'all',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'history'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filter, selectedTab]);

  const loadOrders = async () => {
    try {
      // Generate mock order data
      const mockOrders: Order[] = generateMockOrders();
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load order history');
    }
  };

  const generateMockOrders = (): Order[] => {
    const symbols = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'];
    const statuses: Order['status'][] = ['pending', 'filled', 'cancelled'];
    const types: Order['type'][] = ['buy', 'sell'];
    const orderTypes: Order['orderType'][] = ['market', 'limit', 'stop'];
    
    const orders: Order[] = [];
    
    for (let i = 0; i < 20; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const size = Math.floor(Math.random() * 100000) + 10000;
      const price = 1.0000 + Math.random() * 0.5;
      const currentPrice = price + (Math.random() - 0.5) * 0.02;
      const commission = size * 0.00003; // 3 pips commission
      
      let profit = 0;
      if (status === 'filled') {
        const priceDiff = type === 'buy' ? currentPrice - price : price - currentPrice;
        profit = (priceDiff * size) - commission;
      }
      
      orders.push({
        id: `order_${i + 1}`,
        symbol,
        type,
        orderType,
        size,
        price,
        currentPrice: status === 'filled' ? currentPrice : undefined,
        status,
        timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Last 7 days
        profit: status === 'filled' ? profit : undefined,
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
              // Update order status
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

  const formatPrice = (price: number) => {
    return price.toFixed(5);
  };

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

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'all', label: 'All Orders' },
        { key: 'pending', label: 'Pending' },
        { key: 'history', label: 'History' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabButton,
            selectedTab === tab.key && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab(tab.key as any)}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === tab.key && styles.tabTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOrderCard = (order: Order) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderTitleContainer}>
          <Text style={styles.orderSymbol}>{order.symbol}</Text>
          <View style={styles.orderTypeContainer}>
            <View style={[
              styles.typeTag,
              { backgroundColor: order.type === 'buy' ? colors.secondary[100] : colors.background.elevated }
            ]}>
              <Text style={[
                styles.typeText,
                { color: order.type === 'buy' ? colors.trading.profit : colors.trading.loss }
              ]}>
                {order.type.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.orderTypeText}>{order.orderType}</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <Ionicons
            name={getStatusIcon(order.status) as any}
            size={16}
            color={getStatusColor(order.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderDetailRow}>
          <Text style={styles.detailLabel}>Size:</Text>
          <Text style={styles.detailValue}>{order.size.toLocaleString()}</Text>
        </View>
        <View style={styles.orderDetailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>{formatPrice(order.price)}</Text>
        </View>
        {order.currentPrice && (
          <View style={styles.orderDetailRow}>
            <Text style={styles.detailLabel}>Current:</Text>
            <Text style={styles.detailValue}>{formatPrice(order.currentPrice)}</Text>
          </View>
        )}
        <View style={styles.orderDetailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>{formatDate(order.timestamp)}</Text>
        </View>
        {order.profit !== undefined && (
          <View style={styles.orderDetailRow}>
            <Text style={styles.detailLabel}>P&L:</Text>
            <Text style={[
              styles.detailValue,
              { color: order.profit >= 0 ? colors.trading.profit : colors.trading.loss }
            ]}>
              {formatCurrency(order.profit)}
            </Text>
          </View>
        )}
      </View>

      {order.status === 'pending' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelOrder(order.id)}
        >
          <Text style={styles.cancelButtonText}>Cancel Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order History</Text>
        <TouchableOpacity onPress={loadOrders}>
          <Ionicons name="refresh" size={24} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {renderTabBar()}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>
              {selectedTab === 'pending' ? 'No pending orders' : 'No order history available'}
            </Text>
          </View>
        ) : (
          filteredOrders.map(renderOrderCard)
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  title: {
    ...typography.styles.h3,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
    borderRadius: spacing[2],
    padding: spacing[1],
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: spacing[1],
  },
  tabButtonActive: {
    backgroundColor: colors.primary[500],
  },
  tabText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  tabTextActive: {
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  orderCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: spacing[3],
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  orderTitleContainer: {
    flex: 1,
  },
  orderSymbol: {
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[1],
  },
  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeTag: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: spacing[1],
    marginRight: spacing[2],
  },
  typeText: {
    ...typography.styles.caption,
    fontWeight: typography.weights.bold,
  },
  orderTypeText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    ...typography.styles.caption,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing[1],
  },
  orderDetails: {
    marginBottom: spacing[3],
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  detailLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  cancelButton: {
    backgroundColor: colors.trading.loss,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: spacing[2],
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[10],
  },
  emptyText: {
    ...typography.styles.h4,
    color: colors.text.secondary,
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  emptySubtext: {
    ...typography.styles.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default OrderHistoryScreen;
