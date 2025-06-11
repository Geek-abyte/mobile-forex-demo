import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing } from '../../theme';
import { MainStackParamList } from '../../navigation/MainNavigator';

const { width } = Dimensions.get('window');

interface P2POrder {
  id: string;
  userId: string;
  username: string;
  userRating: number;
  completedTrades: number;
  orderType: 'buy' | 'sell';
  currency: string;
  fiatCurrency: string;
  amount: number;
  price: number;
  minOrder: number;
  maxOrder: number;
  paymentMethods: string[];
  timeLimit: number; // in minutes
  isOnline: boolean;
  created: Date;
}

interface FilterOptions {
  orderType: 'all' | 'buy' | 'sell';
  currency: string;
  fiatCurrency: string;
  paymentMethod: string;
}

const P2PTradingScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [orders, setOrders] = useState<P2POrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<P2POrder[]>([]);
  const [searchAmount, setSearchAmount] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    orderType: 'all',
    currency: 'USD',
    fiatCurrency: 'USD',
    paymentMethod: 'all',
  });

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
  const paymentMethods = ['Bank Transfer', 'PayPal', 'Wise', 'Revolut', 'SEPA', 'Cash'];

  useEffect(() => {
    generateMockOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, activeTab, searchAmount, filters]);

  const generateMockOrders = () => {
    const mockOrders: P2POrder[] = [];
    const usernames = ['TraderPro', 'CryptoKing', 'ForexMaster', 'MarketMaker', 'BullishBear', 'QuickTrade'];
    const payments = ['Bank Transfer', 'PayPal', 'Wise', 'Revolut'];
    
    for (let i = 0; i < 20; i++) {
      mockOrders.push({
        id: `order_${i}`,
        userId: `user_${i}`,
        username: usernames[i % usernames.length] + (i + 1),
        userRating: 4.2 + Math.random() * 0.8, // 4.2 - 5.0
        completedTrades: Math.floor(Math.random() * 500) + 10,
        orderType: Math.random() > 0.5 ? 'buy' : 'sell',
        currency: currencies[Math.floor(Math.random() * currencies.length)],
        fiatCurrency: 'USD',
        amount: Math.floor(Math.random() * 50000) + 1000,
        price: 1.0 + (Math.random() * 0.1 - 0.05), // ±5% from 1.0
        minOrder: Math.floor(Math.random() * 500) + 50,
        maxOrder: Math.floor(Math.random() * 5000) + 1000,
        paymentMethods: payments.slice(0, Math.floor(Math.random() * 3) + 1),
        timeLimit: [15, 30, 45, 60][Math.floor(Math.random() * 4)],
        isOnline: Math.random() > 0.3,
        created: new Date(Date.now() - Math.random() * 86400000 * 7), // Last 7 days
      });
    }
    
    setOrders(mockOrders);
  };

  const filterOrders = () => {
    let filtered = orders.filter(order => {
      // Filter by tab (buy/sell from user's perspective)
      if (activeTab === 'buy' && order.orderType !== 'sell') return false;
      if (activeTab === 'sell' && order.orderType !== 'buy') return false;
      
      // Filter by currency
      if (filters.currency !== 'all' && order.currency !== filters.currency) return false;
      
      // Filter by amount
      if (searchAmount) {
        const amount = parseFloat(searchAmount);
        if (amount < order.minOrder || amount > order.maxOrder) return false;
      }
      
      return true;
    });
    
    // Sort by best price (lowest for buy, highest for sell)
    filtered.sort((a, b) => {
      if (activeTab === 'buy') {
        return a.price - b.price; // Lowest price first for buying
      } else {
        return b.price - a.price; // Highest price first for selling
      }
    });
    
    setFilteredOrders(filtered);
  };

  const handleTradePress = (order: P2POrder) => {
    navigation.navigate('P2PTradeExecution' as any, {
      order,
      tradeType: activeTab,
    });
  };

  const OrderCard: React.FC<{ order: P2POrder }> = ({ order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{order.username}</Text>
            <View style={styles.userStats}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color={colors.trading.warning} />
                <Text style={styles.rating}>{order.userRating.toFixed(1)}</Text>
              </View>
              <Text style={styles.trades}>({order.completedTrades} trades)</Text>
              <View style={[styles.onlineStatus, { backgroundColor: order.isOnline ? colors.trading.profit : colors.text.tertiary }]} />
            </View>
          </View>
        </View>
        <View style={styles.orderTypeContainer}>
          <Text style={[
            styles.orderTypeText,
            { color: order.orderType === 'buy' ? colors.trading.profit : colors.trading.loss }
          ]}>
            {order.orderType.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.price}>{order.price.toFixed(4)} {order.fiatCurrency}</Text>
        </View>
        
        <View style={styles.limitSection}>
          <Text style={styles.limitLabel}>Limits</Text>
          <Text style={styles.limit}>
            ${order.minOrder.toLocaleString()} - ${order.maxOrder.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Available</Text>
          <Text style={styles.amount}>{order.amount.toLocaleString()} {order.currency}</Text>
        </View>
      </View>

      <View style={styles.paymentMethods}>
        {order.paymentMethods.map((method, index) => (
          <View key={index} style={styles.paymentMethodTag}>
            <Text style={styles.paymentMethodText}>{method}</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.timeLimit}>
          <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
          {' '}{order.timeLimit}min limit
        </Text>
        <TouchableOpacity
          style={styles.tradeButton}
          onPress={() => handleTradePress(order)}
        >
          <Text style={styles.tradeButtonText}>
            {activeTab === 'buy' ? 'Buy' : 'Sell'} {order.currency}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
          <Text style={styles.headerTitle}>P2P Trading</Text>
          <TouchableOpacity style={styles.historyButton}>
            <Ionicons name="time-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'buy' && styles.activeTab]}
            onPress={() => setActiveTab('buy')}
          >
            <Text style={[styles.tabText, activeTab === 'buy' && styles.activeTabText]}>
              Buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sell' && styles.activeTab]}
            onPress={() => setActiveTab('sell')}
          >
            <Text style={[styles.tabText, activeTab === 'sell' && styles.activeTabText]}>
              Sell
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter amount..."
              placeholderTextColor={colors.text.secondary}
              value={searchAmount}
              onChangeText={setSearchAmount}
              keyboardType="numeric"
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTags}>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.filterTag,
                  filters.currency === currency && styles.activeFilterTag
                ]}
                onPress={() => setFilters(prev => ({ ...prev, currency }))}
              >
                <Text style={[
                  styles.filterTagText,
                  filters.currency === currency && styles.activeFilterTagText
                ]}>
                  {currency}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Orders List */}
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => <OrderCard order={item} />}
          keyExtractor={(item) => item.id}
          style={styles.ordersList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ordersListContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="swap-horizontal-outline" size={64} color={colors.text.tertiary} />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your filters or check back later
              </Text>
            </View>
          }
        />

        {/* Create Order FAB */}
        <TouchableOpacity 
          style={styles.createOrderFab}
          onPress={() => navigation.navigate('CreateP2POrder')}
        >
          <LinearGradient
            colors={[colors.primary[500], colors.secondary[500]]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={24} color={colors.text.primary} />
          </LinearGradient>
        </TouchableOpacity>
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
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: spacing[6], // 24px
    marginBottom: spacing[6], // 24px
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[3], // 12px
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.text.primary,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  activeTabText: {
    color: colors.primary[500],
  },
  filtersContainer: {
    paddingHorizontal: spacing[6], // 24px
    marginBottom: spacing[6], // 24px
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: spacing[4], // 16px
    paddingVertical: spacing[3], // 12px
    marginBottom: spacing[4], // 16px
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing[3], // 12px
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  filterTags: {
    flexDirection: 'row',
  },
  filterTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: spacing[4], // 16px
    paddingVertical: spacing[1], // 4px
    marginRight: spacing[3], // 12px
  },
  activeFilterTag: {
    backgroundColor: colors.primary[500],
  },
  filterTagText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  activeFilterTagText: {
    color: colors.text.primary,
  },
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    paddingHorizontal: spacing[6], // 24px
    paddingBottom: spacing[16], // 64px
  },
  orderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: spacing[6], // 24px
    marginBottom: spacing[4], // 16px
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4], // 16px
  },
  userInfo: {
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1], // 4px
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing[3], // 12px
  },
  rating: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    marginLeft: spacing[1], // 4px
  },
  trades: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginRight: spacing[3], // 12px
  },
  onlineStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  orderTypeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: spacing[3], // 12px
    paddingVertical: spacing[1], // 4px
  },
  orderTypeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[4], // 16px
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing[1], // 4px
  },
  price: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  limitSection: {
    flex: 1,
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing[1], // 4px
  },
  limit: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    textAlign: 'center',
  },
  amountSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing[1], // 4px
  },
  amount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing[4], // 16px
  },
  paymentMethodTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: spacing[3], // 12px
    paddingVertical: spacing[1], // 4px
    marginRight: spacing[1], // 4px
    marginBottom: spacing[1], // 4px
  },
  paymentMethodText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLimit: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  tradeButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingHorizontal: spacing[6], // 24px
    paddingVertical: spacing[3], // 12px
  },
  tradeButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[16], // 64px
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing[6], // 24px
    marginBottom: spacing[3], // 12px
  },
  emptySubtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  createOrderFab: {
    position: 'absolute',
    right: spacing[6], // 24px
    bottom: spacing[6], // 24px
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default P2PTradingScreen;
