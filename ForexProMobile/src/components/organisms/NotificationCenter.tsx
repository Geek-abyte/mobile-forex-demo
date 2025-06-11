import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';
import { colors, typography, spacing } from '@/theme';

interface NotificationCenterProps {
  onClose?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const navigation = useNavigation();
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotificationById,
    clearAllNotifications,
    clearReadNotificationsOnly,
    getNotificationStats,
  } = useNotifications();

  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredNotifications = selectedTab === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const stats = getNotificationStats();

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }

    // Handle navigation if specified
    if (notification.actionType === 'navigate' && notification.actionTarget) {
      onClose?.();
      // Navigation logic would go here
      console.log('Navigate to:', notification.actionTarget);
    }
  };

  const handleLongPress = (notification: Notification) => {
    Alert.alert(
      'Notification Options',
      notification.title,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: notification.isRead ? 'Mark as Unread' : 'Mark as Read',
          onPress: () => markNotificationAsRead(notification.id),
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeNotificationById(notification.id),
        },
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllNotifications,
        },
        {
          text: 'Clear Read Only',
          onPress: clearReadNotificationsOnly,
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNotificationIcon = (notification: Notification) => {
    return notification.icon || 'notifications';
  };

  const getNotificationColor = (notification: Notification) => {
    if (notification.color) return notification.color;
    
    switch (notification.type) {
      case 'trade':
        return colors.trading.profit;
      case 'market':
        return colors.status.warning;
      case 'price_alert':
        return colors.status.info;
      case 'news':
        return colors.secondary[500];
      case 'account':
        return colors.status.success;
      case 'p2p':
        return colors.status.warning;
      case 'system':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadItem,
      ]}
      onPress={() => handleNotificationPress(item)}
      onLongPress={() => handleLongPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(item) + '20' }
        ]}>
          <Icon
            name={getNotificationIcon(item)}
            size={20}
            color={getNotificationColor(item)}
          />
        </View>
        
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
          
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          
          <View style={styles.metaRow}>
            <Text style={styles.type}>
              {item.type.replace('_', ' ').toUpperCase()}
            </Text>
            {item.priority === 'critical' && (
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>URGENT</Text>
              </View>
            )}
          </View>
        </View>
        
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="notifications-none" size={64} color={colors.text.tertiary} />
      <Text style={styles.emptyTitle}>
        {selectedTab === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {selectedTab === 'unread' 
          ? 'All caught up! Check back later for updates.'
          : 'Notifications will appear here when you receive them.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMarkAllAsRead}
            >
              <Icon name="done-all" size={24} color={colors.primary[500]} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClearAll}
          >
            <Icon name="clear-all" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          
          {onClose && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onClose}
            >
              <Icon name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'all' && styles.activeTabText
          ]}>
            All ({stats.total})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'unread' && styles.activeTab]}
          onPress={() => setSelectedTab('unread')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'unread' && styles.activeTabText
          ]}>
            Unread ({stats.unread})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginRight: spacing[2],
  },
  badge: {
    backgroundColor: colors.status.error,
    borderRadius: 12,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: spacing[2],
    marginLeft: spacing[1],
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    margin: spacing[4],
    borderRadius: 8,
    padding: spacing[1],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary[500],
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.text.inverse,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: spacing[4],
  },
  notificationItem: {
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing[4],
    marginVertical: spacing[1],
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  unreadItem: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.primary[500] + '30',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[1],
  },
  title: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing[2],
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
  },
  message: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing[2],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  type: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.tertiary,
  },
  priorityBadge: {
    backgroundColor: colors.status.error,
    borderRadius: 4,
    paddingHorizontal: spacing[1],
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    position: 'absolute',
    top: 0,
    right: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[12],
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationCenter;
