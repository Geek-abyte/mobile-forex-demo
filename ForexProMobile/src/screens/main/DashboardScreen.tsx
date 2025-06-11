import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { marketDataService, CurrencyPair } from '../../services/marketDataService';
import { marketAnalysisService, MarketAlert } from '../../services/marketAnalysisService';
import { tradingService } from '../../services/tradingService';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/MainNavigator';
import NotificationBell from '../../components/atoms/NotificationBell';

const { width } = Dimensions.get('window');

interface AccountSummary {
  balance: number;
  equity: number;
  freeMargin: number;
  todayProfit: number;
  totalProfit: number;
  openPositions: number;
}

interface Position {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  openTime: Date;
}

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [accountSummary, setAccountSummary] = useState<AccountSummary>({
    balance: 50000,
    equity: 52150,
    freeMargin: 48200,
    todayProfit: 1250,
    totalProfit: 2150,
    openPositions: 3,
  });
  const [topPairs, setTopPairs] = useState<CurrencyPair[]>([]);
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load market data
      const pairs = await marketDataService.getCurrencyPairs();
      setTopPairs(pairs.slice(0, 6));

      // Load market alerts - use mock data for now
      const mockAlerts: MarketAlert[] = [
        {
          id: '1',
          type: 'price',
          severity: 'high',
          title: 'EUR/USD Price Alert',
          message: 'EUR/USD has broken above 1.0850 resistance level',
          timestamp: new Date(Date.now() - 15 * 60000),
          symbol: 'EURUSD',
          isRead: false,
        },
        {
          id: '2',
          type: 'news',
          severity: 'medium',
          title: 'Federal Reserve News',
          message: 'FOMC meeting scheduled for next week may impact USD pairs',
          timestamp: new Date(Date.now() - 2 * 60 * 60000),
          symbol: 'USD',
          isRead: false,
        }
      ];
      setMarketAlerts(mockAlerts);

      // Load positions
      const currentPositions = await tradingService.getPositions();
      const formattedPositions: Position[] = currentPositions.slice(0, 5).map(pos => ({
        ...pos,
        openTime: new Date(pos.openTime)
      }));
      setPositions(formattedPositions);

      // Simulate account data updates
      setAccountSummary(prev => ({
        ...prev,
        todayProfit: prev.todayProfit + (Math.random() - 0.5) * 100,
        balance: 50000 + prev.todayProfit,
      }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatAlertTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price': return 'trending-up';
      case 'news': return 'article';
      case 'technical': return 'analytics';
      default: return 'info';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#FF4757';
      case 'medium': return '#FFA726';
      case 'low': return '#00D4AA';
      default: return colors.text.secondary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Professional Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userNameText}>{user?.firstName || 'Trader'}</Text>
          </View>
          <View style={styles.headerRight}>
            <NotificationBell 
              size={24} 
              color={colors.text.primary}
              showBadge={true}
            />
            <TouchableOpacity 
              style={styles.profileButton} 
              onPress={() => navigation.navigate('Profile' as never)}
            >
              <Ionicons name="person-circle-outline" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Portfolio Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#1B1B2F', '#162447']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          >
            <View style={styles.balanceHeader}>
              <View>
                <Text style={styles.balanceLabel}>Total Portfolio Value</Text>
                <Text style={styles.balanceAmount}>{formatCurrency(accountSummary.balance)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.walletButton}
                onPress={() => navigation.navigate('Wallet' as never)}
              >
                <MaterialIcons name="account-balance-wallet" size={24} color="#00D4AA" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.balanceStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Today's P&L</Text>
                <Text style={[
                  styles.statValue,
                  { color: accountSummary.todayProfit >= 0 ? '#00D4AA' : '#FF4757' }
                ]}>
                  {accountSummary.todayProfit >= 0 ? '+' : ''}{formatCurrency(accountSummary.todayProfit)}
                  <Text style={styles.statPercent}>
                    {' '}({accountSummary.todayProfit >= 0 ? '+' : ''}{((accountSummary.todayProfit / accountSummary.balance) * 100).toFixed(2)}%)
                  </Text>
                </Text>
              </View>
              <View style={styles.statDivider} />
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
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Trading' as never)}
            >
              <View style={styles.actionContent}>
                <MaterialIcons name="trending-up" size={28} color={colors.primary[500]} />
                <Text style={styles.actionTitle}>Trade</Text>
                <Text style={styles.actionSubtitle}>Start Trading</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Analytics' as never)}
            >
              <View style={styles.actionContent}>
                <MaterialIcons name="analytics" size={28} color={colors.secondary[500]} />
                <Text style={styles.actionTitle}>Analytics</Text>
                <Text style={styles.actionSubtitle}>Portfolio Insights</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Market' as never)}
            >
              <View style={styles.actionContent}>
                <MaterialIcons name="show-chart" size={28} color={colors.primary[500]} />
                <Text style={styles.actionTitle}>Markets</Text>
                <Text style={styles.actionSubtitle}>Live Prices</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('P2P' as never)}
            >
              <View style={styles.actionContent}>
                <MaterialIcons name="swap-horizontal-circle" size={28} color={colors.secondary[500]} />
                <Text style={styles.actionTitle}>P2P</Text>
                <Text style={styles.actionSubtitle}>Peer Trading</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Market Overview */}
        <View style={styles.marketSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Market Overview</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Market' as never)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.marketGrid}>
            {topPairs.slice(0, 6).map((pair, index) => (
              <TouchableOpacity 
                key={pair.symbol} 
                style={styles.marketCard}
                onPress={() => navigation.navigate('Trading', { symbol: pair.symbol })}
              >
                <View style={styles.marketHeader}>
                  <Text style={styles.marketSymbol}>{pair.symbol}</Text>
                  <Text style={[
                    styles.marketChange,
                    { color: pair.change >= 0 ? '#00D4AA' : '#FF4757' }
                  ]}>
                    {pair.change >= 0 ? '+' : ''}{pair.changePercent.toFixed(2)}%
                  </Text>
                </View>
                <Text style={styles.marketPrice}>{pair.price.toFixed(5)}</Text>
                <View style={styles.marketTrend}>
                  <MaterialIcons 
                    name={pair.change >= 0 ? "trending-up" : "trending-down"} 
                    size={16} 
                    color={pair.change >= 0 ? '#00D4AA' : '#FF4757'} 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Market Alerts */}
        {marketAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Market Alerts</Text>
              <TouchableOpacity onPress={() => navigation.navigate('RiskManagement' as never)}>
                <Text style={styles.viewAllText}>Manage</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.alertsList}>
              {marketAlerts.slice(0, 3).map((alert, index) => (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={[
                    styles.alertIconContainer,
                    { backgroundColor: getAlertColor(alert.severity) + '20' }
                  ]}>
                    <MaterialIcons 
                      name={getAlertIcon(alert.type)} 
                      size={20} 
                      color={getAlertColor(alert.severity)} 
                    />
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertMessage} numberOfLines={2}>{alert.message}</Text>
                    <Text style={styles.alertTime}>
                      {formatAlertTime(alert.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrderHistory' as never)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {positions.slice(0, 3).map((position, index) => (
              <View key={position.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <MaterialIcons 
                    name={position.type === 'buy' ? 'north-east' : 'south-east'} 
                    size={20} 
                    color={position.type === 'buy' ? '#00D4AA' : '#FF4757'} 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{position.type.toUpperCase()} {position.symbol}</Text>
                  <Text style={styles.activitySubtitle}>
                    Size: {position.size.toLocaleString()} | Entry: {position.entryPrice.toFixed(5)}
                  </Text>
                </View>
                <View style={styles.activityValue}>
                  <Text style={[
                    styles.activityPnL,
                    { color: position.pnl >= 0 ? '#00D4AA' : '#FF4757' }
                  ]}>
                    {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Padding */}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[5],
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  welcomeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    fontWeight: typography.weights.regular,
  },
  userNameText: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    marginTop: spacing[1],
  },
  notificationButton: {
    position: 'relative',
    padding: spacing[2],
  },
  notificationBadge: {
    position: 'absolute',
    top: spacing[1],
    right: spacing[1],
    width: 8,
    height: 8,
    backgroundColor: '#FF4757',
    borderRadius: 4,
  },
  profileButton: {
    padding: spacing[1],
  },

  // Balance Card
  balanceCard: {
    marginHorizontal: spacing[6],
    marginBottom: spacing[6],
    borderRadius: 16,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: spacing[6],
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[5],
  },
  balanceLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: typography.weights.medium,
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: typography.fonts.primary,
    color: 'white',
    fontWeight: typography.weights.bold,
    marginTop: spacing[1],
  },
  walletButton: {
    backgroundColor: 'rgba(0, 212, 170, 0.2)',
    padding: spacing[3],
    borderRadius: 12,
  },
  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: spacing[4],
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: typography.weights.medium,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    marginTop: spacing[1],
  },
  statPercent: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },

  // Quick Actions
  actionsSection: {
    marginHorizontal: spacing[6],
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.primary[500],
    fontWeight: typography.weights.medium,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  actionCard: {
    width: (width - spacing[6] * 2 - spacing[3]) / 2,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionContent: {
    flex: 1,
    padding: spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  actionTitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    marginTop: spacing[2],
  },
  actionSubtitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginTop: spacing[1],
  },

  // Market Section
  marketSection: {
    marginHorizontal: spacing[6],
    marginBottom: spacing[6],
  },
  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  marketCard: {
    width: (width - spacing[6] * 2 - spacing[3] * 2) / 3,
    backgroundColor: colors.background.secondary,
    padding: spacing[3],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  marketSymbol: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
  },
  marketChange: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
  },
  marketPrice: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing[1],
  },
  marketTrend: {
    alignItems: 'flex-end',
  },

  // Alerts Section
  alertsSection: {
    marginHorizontal: spacing[6],
    marginBottom: spacing[6],
  },
  alertsList: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
    overflow: 'hidden',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing[1],
  },
  alertMessage: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing[1],
  },
  alertTime: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
  },

  // Activity Section
  activitySection: {
    marginHorizontal: spacing[6],
    marginBottom: spacing[6],
  },
  activityList: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing[1],
  },
  activitySubtitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  activityValue: {
    alignItems: 'flex-end',
  },
  activityPnL: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
  },

  bottomPadding: {
    height: spacing[8],
  },
});

export default DashboardScreen;
