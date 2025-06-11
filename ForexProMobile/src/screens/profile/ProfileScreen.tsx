import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { colors, typography, spacing } from '../../theme';
import StandardHeader from '../../components/molecules/StandardHeader';

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from ForexPro Mobile?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            // Navigation will automatically handle redirect to auth stack
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call an API to delete the account
            Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
            dispatch(logout());
          },
        },
      ]
    );
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <LinearGradient
        colors={[colors.primary[500], colors.primary[400]]}
        style={styles.profileGradient}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.userName}>
          {user?.firstName && user?.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : 'User Name'}
        </Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>157</Text>
            <Text style={styles.statLabel}>Trades</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2.1y</Text>
            <Text style={styles.statLabel}>Member</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderSettingsSection = (title: string, items: any[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.settingItem,
              index === items.length - 1 && styles.lastSettingItem
            ]}
            onPress={item.onPress}
            disabled={item.type === 'switch'}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={20} color={colors.text.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.settingRight}>
              {item.type === 'switch' ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onValueChange}
                  trackColor={{ false: colors.background.secondary, true: colors.primary[300] }}
                  thumbColor={item.value ? colors.primary[500] : colors.text.secondary}
                />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const accountSettings = [
    {
      icon: 'person-outline',
      iconBg: colors.primary[500],
      title: 'Personal Information',
      subtitle: 'Edit your personal details',
      onPress: () => Alert.alert('Info', 'Personal Information editing not implemented yet'),
    },
    {
      icon: 'shield-checkmark-outline',
      iconBg: colors.status.success,
      title: 'Security & Privacy',
      subtitle: 'Password, 2FA, privacy settings',
      onPress: () => Alert.alert('Info', 'Security settings not implemented yet'),
    },
    {
      icon: 'card-outline',
      iconBg: colors.secondary[500],
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      onPress: () => navigation.navigate('DepositScreen' as never),
    },
    {
      icon: 'document-text-outline',
      iconBg: colors.status.info,
      title: 'Trading History',
      subtitle: 'View your complete trading history',
      onPress: () => navigation.navigate('TransactionHistoryScreen' as never),
    },
  ];

  const appSettings = [
    {
      icon: 'fingerprint',
      iconBg: colors.status.success,
      title: 'Biometric Authentication',
      subtitle: 'Use fingerprint or face ID to unlock',
      type: 'switch',
      value: biometricEnabled,
      onValueChange: setBiometricEnabled,
    },
    {
      icon: 'notifications-outline',
      iconBg: colors.status.warning,
      title: 'Notification Settings',
      subtitle: 'Manage all notification preferences',
      onPress: () => navigation.navigate('NotificationSettings' as never),
    },
    {
      icon: 'moon-outline',
      iconBg: colors.background.secondary,
      title: 'Dark Mode',
      subtitle: 'Enable dark theme',
      type: 'switch',
      value: darkModeEnabled,
      onValueChange: setDarkModeEnabled,
    },
    {
      icon: 'language-outline',
      iconBg: colors.status.info,
      title: 'Language',
      subtitle: 'English (US)',
      onPress: () => Alert.alert('Info', 'Language selection not implemented yet'),
    },
  ];

  const supportSettings = [
    {
      icon: 'notifications-active',
      iconBg: colors.primary[500],
      title: 'Notification Demo',
      subtitle: 'Test all notification types',
      onPress: () => navigation.navigate('NotificationDemo' as never),
    },
    {
      icon: 'help-circle-outline',
      iconBg: colors.status.info,
      title: 'Help & Support',
      subtitle: 'Get help with your account',
      onPress: () => Alert.alert('Info', 'Support not implemented yet'),
    },
    {
      icon: 'document-outline',
      iconBg: colors.text.secondary,
      title: 'Terms & Conditions',
      subtitle: 'Read our terms of service',
      onPress: () => Alert.alert('Info', 'Terms & Conditions not implemented yet'),
    },
    {
      icon: 'shield-outline',
      iconBg: colors.text.secondary,
      title: 'Privacy Policy',
      subtitle: 'How we handle your data',
      onPress: () => Alert.alert('Info', 'Privacy Policy not implemented yet'),
    },
    {
      icon: 'information-circle-outline',
      iconBg: colors.primary[500],
      title: 'About ForexPro',
      subtitle: 'Version 1.0.0',
      onPress: () => Alert.alert('ForexPro Mobile', 'Version 1.0.0\n\nA professional trading platform for forex, crypto, and commodities.'),
    },
  ];

  const dangerZoneSettings = [
    {
      icon: 'log-out-outline',
      iconBg: colors.status.warning,
      title: 'Logout',
      subtitle: 'Sign out of your account',
      onPress: handleLogout,
    },
    {
      icon: 'trash-outline',
      iconBg: colors.status.error,
      title: 'Delete Account',
      subtitle: 'Permanently delete your account',
      onPress: handleDeleteAccount,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StandardHeader title="Profile" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        
        {renderSettingsSection('Account', accountSettings)}
        {renderSettingsSection('App Settings', appSettings)}
        {renderSettingsSection('Support', supportSettings)}
        {renderSettingsSection('Danger Zone', dangerZoneSettings)}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ForexPro Mobile © 2025
          </Text>
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
  profileHeader: {
    marginBottom: spacing[6],
  },
  profileGradient: {
    padding: spacing[6],
    borderRadius: 16,
    margin: spacing[4],
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: spacing[4],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.text.primary,
  },
  avatarText: {
    fontSize: typography.sizes['2xl'],
    color: colors.primary[500],
    fontWeight: typography.weights.bold,
  },
  userName: {
    fontSize: typography.sizes['2xl'],
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[1],
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    opacity: 0.8,
    marginBottom: spacing[6],
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  statValue: {
    fontSize: typography.sizes.xl,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.text.primary,
    opacity: 0.3,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  sectionContent: {
    backgroundColor: colors.background.tertiary,
    marginHorizontal: spacing[4],
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  settingSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  settingRight: {
    marginLeft: spacing[3],
  },
  footer: {
    alignItems: 'center',
    padding: spacing[6],
  },
  footerText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
});

export default ProfileScreen;
