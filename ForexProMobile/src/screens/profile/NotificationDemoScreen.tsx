import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationIntegration from '@/services/notificationIntegration';
import { colors, typography, spacing } from '@/theme';

const NotificationDemoScreen: React.FC = () => {
  const navigation = useNavigation();
  const { getNotificationStats, clearAllNotifications } = useNotifications();
  const stats = getNotificationStats();

  const testNotifications = [
    {
      title: 'Trade Executed',
      subtitle: 'Simulate a successful trade',
      icon: 'trending-up',
      color: colors.trading.profit,
      onPress: () => NotificationIntegration.onTradeExecuted('EURUSD', 'buy', 50000, 1.1234),
    },
    {
      title: 'Stop Loss Triggered',
      subtitle: 'Simulate a stop loss',
      icon: 'warning',
      color: colors.status.error,
      onPress: () => NotificationIntegration.onStopLossTriggered('GBPUSD', 1.2500, 250),
    },
    {
      title: 'Take Profit Hit',
      subtitle: 'Simulate a take profit',
      icon: 'check-circle',
      color: colors.trading.profit,
      onPress: () => NotificationIntegration.onTakeProfitHit('USDJPY', 150.25, 180),
    },
    {
      title: 'Price Alert',
      subtitle: 'Target price reached',
      icon: 'notifications',
      color: colors.status.info,
      onPress: () => NotificationIntegration.onPriceAlert('EURUSD', 1.1250, 1.1251),
    },
    {
      title: 'Market Movement',
      subtitle: 'Significant price change',
      icon: 'show-chart',
      color: colors.status.warning,
      onPress: () => NotificationIntegration.onMarketMovement('AUDUSD', 'risen', 1.2, 0.6523),
    },
    {
      title: 'High Volatility',
      subtitle: 'Market volatility warning',
      icon: 'trending-up',
      color: colors.status.warning,
      onPress: () => NotificationIntegration.onHighVolatility('USDCHF', 0.9125),
    },
    {
      title: 'Margin Call',
      subtitle: 'Critical margin level',
      icon: 'priority-high',
      color: colors.status.error,
      onPress: () => NotificationIntegration.onMarginCall(45),
    },
    {
      title: 'Low Balance',
      subtitle: 'Account balance warning',
      icon: 'account-balance',
      color: colors.status.warning,
      onPress: () => NotificationIntegration.onLowBalance(500, 1000),
    },
    {
      title: 'P2P Order Matched',
      subtitle: 'P2P trade activity',
      icon: 'swap-horiz',
      color: colors.secondary[500],
      onPress: () => NotificationIntegration.onP2POrderMatched('SELL', 1000),
    },
    {
      title: 'P2P Payment Received',
      subtitle: 'Payment notification',
      icon: 'payment',
      color: colors.status.success,
      onPress: () => NotificationIntegration.onP2PPaymentReceived(1000, 'USD'),
    },
    {
      title: 'P2P Message',
      subtitle: 'New chat message',
      icon: 'chat',
      color: colors.primary[500],
      onPress: () => NotificationIntegration.onP2PMessage('TradePro2024', 'Payment sent, please confirm...'),
    },
    {
      title: 'Breaking News',
      subtitle: 'Market news alert',
      icon: 'newspaper',
      color: colors.secondary[500],
      onPress: () => NotificationIntegration.onBreakingNews('Fed announces surprise rate cut', 'The Federal Reserve has announced an unexpected 0.25% rate cut...'),
    },
    {
      title: 'Economic Event',
      subtitle: 'High impact event',
      icon: 'event',
      color: colors.status.info,
      onPress: () => NotificationIntegration.onEconomicEvent('Non-Farm Payrolls', 'USD', 'high'),
    },
    {
      title: 'System Maintenance',
      subtitle: 'Scheduled maintenance',
      icon: 'build',
      color: colors.text.secondary,
      onPress: () => NotificationIntegration.onSystemMaintenance('2:00 AM UTC', '30 minutes'),
    },
    {
      title: 'App Update',
      subtitle: 'New version available',
      icon: 'system-update',
      color: colors.status.success,
      onPress: () => NotificationIntegration.onAppUpdate('2.1.0'),
    },
  ];

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearAllNotifications },
      ]
    );
  };

  const handleStartDemo = () => {
    Alert.alert(
      'Start Demo Notifications',
      'This will start sending random demo notifications every 30-60 seconds.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => NotificationIntegration.startDemoNotifications() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Notification Demo</Text>
        
        <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
          <Icon name="clear-all" size={24} color={colors.status.error} />
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Current Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.unread}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.read}</Text>
            <Text style={styles.statLabel}>Read</Text>
          </View>
        </View>
      </View>

      {/* Demo Controls */}
      <View style={styles.controlsSection}>
        <TouchableOpacity style={styles.demoButton} onPress={handleStartDemo}>
          <Icon name="play-arrow" size={24} color={colors.text.inverse} />
          <Text style={styles.demoButtonText}>Start Auto Demo</Text>
        </TouchableOpacity>
      </View>

      {/* Test Notifications */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Test Notifications</Text>
        
        {testNotifications.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.testItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.testIcon, { backgroundColor: item.color + '20' }]}>
              <Icon name={item.icon} size={24} color={item.color} />
            </View>
            
            <View style={styles.testContent}>
              <Text style={styles.testTitle}>{item.title}</Text>
              <Text style={styles.testSubtitle}>{item.subtitle}</Text>
            </View>
            
            <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: spacing[2],
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing[4],
  },
  clearButton: {
    padding: spacing[2],
  },
  statsSection: {
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    margin: spacing[4],
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  controlsSection: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: 12,
    gap: spacing[2],
  },
  demoButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.inverse,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  testContent: {
    flex: 1,
  },
  testTitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  testSubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
});

export default NotificationDemoScreen;
