import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationService } from '@/services/notificationService';
import { colors, typography, spacing } from '@/theme';

const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { settings, updateNotificationSettings, getNotificationStats } = useNotifications();
  const stats = getNotificationStats();

  const [tempSettings, setTempSettings] = useState(settings);

  const handleToggle = async (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...tempSettings, [key]: value };
    setTempSettings(newSettings);
    await updateNotificationSettings({ [key]: value });
  };

  const handleQuietHoursToggle = async (enabled: boolean) => {
    const newSettings = {
      ...tempSettings,
      quietHours: { ...tempSettings.quietHours, enabled }
    };
    setTempSettings(newSettings);
    await updateNotificationSettings({
      quietHours: { ...tempSettings.quietHours, enabled }
    });
  };

  const handleTimeChange = (type: 'startTime' | 'endTime') => {
    // In a real app, this would open a time picker
    Alert.alert('Time Picker', 'Time picker would open here');
  };

  const testNotification = async () => {
    Alert.alert(
      'Test Notification',
      'Which type of notification would you like to test?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Trade Alert', onPress: () => testTradeNotification() },
        { text: 'Price Alert', onPress: () => testPriceAlert() },
        { text: 'Market News', onPress: () => testMarketNews() },
      ]
    );
  };

  const testTradeNotification = async () => {
    await notificationService.showTradeExecuted('EURUSD', 'buy', 50000, 1.1234);
  };

  const testPriceAlert = async () => {
    await notificationService.showPriceAlert('GBPUSD', 1.2500, 1.2501);
  };

  const testMarketNews = async () => {
    await notificationService.showNewsAlert('Test: EUR/USD breaks key resistance level');
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    icon: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Icon name={icon} size={24} color={colors.primary[500]} />
      </View>
      
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: colors.background.tertiary,
          true: colors.primary[500] + '40',
        }}
        thumbColor={value ? colors.primary[500] : colors.text.tertiary}
      />
    </View>
  );

  const renderTimeSelector = (label: string, time: string, onPress: () => void) => (
    <TouchableOpacity style={styles.timeSelector} onPress={onPress}>
      <Text style={styles.timeLabel}>{label}</Text>
      <View style={styles.timeValue}>
        <Text style={styles.timeText}>{time}</Text>
        <Icon name="chevron-right" size={20} color={colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );

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
        
        <Text style={styles.headerTitle}>Notification Settings</Text>
        
        <TouchableOpacity style={styles.testButton} onPress={testNotification}>
          <Icon name="notifications" size={24} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
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

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          {renderSettingItem(
            'Enable Notifications',
            'Turn all notifications on or off',
            tempSettings.enabled,
            (value) => handleToggle('enabled', value),
            'notifications'
          )}

          {renderSettingItem(
            'Sound',
            'Play sound for notifications',
            tempSettings.sound,
            (value) => handleToggle('sound', value),
            'volume-up'
          )}

          {renderSettingItem(
            'Vibration',
            'Vibrate for important notifications',
            tempSettings.vibration,
            (value) => handleToggle('vibration', value),
            'vibration'
          )}

          {renderSettingItem(
            'Push Notifications',
            'Receive push notifications when app is closed',
            tempSettings.pushNotifications,
            (value) => handleToggle('pushNotifications', value),
            'smartphone'
          )}
        </View>

        {/* Trading Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trading Alerts</Text>
          
          {renderSettingItem(
            'Trading Alerts',
            'Order executions, stop losses, take profits',
            tempSettings.tradingAlerts,
            (value) => handleToggle('tradingAlerts', value),
            'trending-up'
          )}

          {renderSettingItem(
            'Price Alerts',
            'When target prices are reached',
            tempSettings.priceAlerts,
            (value) => handleToggle('priceAlerts', value),
            'notifications'
          )}

          {renderSettingItem(
            'Account Updates',
            'Margin calls, balance changes',
            tempSettings.accountUpdates,
            (value) => handleToggle('accountUpdates', value),
            'account-balance'
          )}
        </View>

        {/* Market Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Information</Text>
          
          {renderSettingItem(
            'Market News',
            'Breaking news and market updates',
            tempSettings.marketNews,
            (value) => handleToggle('marketNews', value),
            'newspaper'
          )}

          {renderSettingItem(
            'System Notifications',
            'App updates and maintenance notices',
            tempSettings.systemNotifications,
            (value) => handleToggle('systemNotifications', value),
            'info'
          )}
        </View>

        {/* P2P Trading */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>P2P Trading</Text>
          
          {renderSettingItem(
            'P2P Messages',
            'Chat messages and trade updates',
            tempSettings.p2pMessages,
            (value) => handleToggle('p2pMessages', value),
            'chat'
          )}
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <Text style={styles.sectionSubtitle}>
            Disable non-critical notifications during specified hours
          </Text>
          
          {renderSettingItem(
            'Enable Quiet Hours',
            'Mute non-urgent notifications',
            tempSettings.quietHours.enabled,
            handleQuietHoursToggle,
            'do-not-disturb'
          )}

          {tempSettings.quietHours.enabled && (
            <View style={styles.quietHoursSettings}>
              {renderTimeSelector(
                'Start Time',
                tempSettings.quietHours.startTime,
                () => handleTimeChange('startTime')
              )}
              
              {renderTimeSelector(
                'End Time',
                tempSettings.quietHours.endTime,
                () => handleTimeChange('endTime')
              )}
            </View>
          )}
        </View>

        {/* Email Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          
          {renderSettingItem(
            'Email Notifications',
            'Receive notifications via email',
            tempSettings.emailNotifications,
            (value) => handleToggle('emailNotifications', value),
            'email'
          )}
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
  testButton: {
    padding: spacing[2],
  },
  content: {
    flex: 1,
  },
  statsSection: {
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    margin: spacing[4],
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing[3],
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
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginHorizontal: spacing[4],
    marginBottom: spacing[1],
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  settingSubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  quietHoursSettings: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    marginBottom: spacing[2],
  },
  timeLabel: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  timeValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    marginRight: spacing[2],
  },
});

export default NotificationSettingsScreen;
