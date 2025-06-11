import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';
import StandardHeader from '../../components/molecules/StandardHeader';

const SecurityPrivacyScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Security Settings
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [loginAlerts, setLoginAlerts] = useState(true);
  
  // Privacy Settings
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('private');
  
  // Password Change Modal
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }

    Alert.alert(
      'Success',
      'Your password has been changed successfully.',
      [{ 
        text: 'OK', 
        onPress: () => {
          setPasswordModalVisible(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      }]
    );
  };

  const handleTwoFactorSetup = () => {
    if (twoFactorEnabled) {
      Alert.alert(
        'Disable 2FA',
        'Are you sure you want to disable two-factor authentication?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable', 
            style: 'destructive',
            onPress: () => setTwoFactorEnabled(false)
          }
        ]
      );
    } else {
      Alert.alert(
        '2FA Setup',
        'Two-factor authentication adds an extra layer of security to your account. You would typically scan a QR code with an authenticator app.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Set Up', 
            onPress: () => {
              setTwoFactorEnabled(true);
              Alert.alert('Success', '2FA has been enabled for your account.');
            }
          }
        ]
      );
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    rightComponent: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color={colors.primary[500]} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
      </View>
    </TouchableOpacity>
  );

  const renderPasswordModal = () => (
    <Modal
      visible={passwordModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setPasswordModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Change Password</Text>
          <TouchableOpacity onPress={handlePasswordChange}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.textInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Enter current password"
              placeholderTextColor={colors.text.secondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Enter new password"
              placeholderTextColor={colors.text.secondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm new password"
              placeholderTextColor={colors.text.secondary}
            />
          </View>
          
          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={styles.requirementItem}>• At least 8 characters</Text>
            <Text style={styles.requirementItem}>• Include uppercase and lowercase letters</Text>
            <Text style={styles.requirementItem}>• Include at least one number</Text>
            <Text style={styles.requirementItem}>• Include at least one special character</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StandardHeader 
        title="Security & Privacy"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSection('Account Security', 
          <>
            {renderSettingItem(
              'lock-closed-outline',
              'Change Password',
              'Update your account password',
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />,
              () => setPasswordModalVisible(true)
            )}
            
            {renderSettingItem(
              'shield-checkmark-outline',
              'Two-Factor Authentication',
              twoFactorEnabled ? 'Enabled' : 'Disabled',
              <Switch
                value={twoFactorEnabled}
                onValueChange={handleTwoFactorSetup}
                trackColor={{ false: colors.background.secondary, true: colors.primary[300] }}
                thumbColor={twoFactorEnabled ? colors.primary[500] : colors.text.secondary}
              />
            )}
            
            {renderSettingItem(
              'fingerprint',
              'Biometric Authentication',
              'Use fingerprint or face ID',
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: colors.background.secondary, true: colors.primary[300] }}
                thumbColor={biometricEnabled ? colors.primary[500] : colors.text.secondary}
              />
            )}
            
            {renderSettingItem(
              'time-outline',
              'Session Timeout',
              `Auto-logout after ${sessionTimeout} minutes`,
              <TouchableOpacity onPress={() => {
                Alert.alert(
                  'Session Timeout',
                  'Choose session timeout duration:',
                  [
                    { text: '15 minutes', onPress: () => setSessionTimeout(15) },
                    { text: '30 minutes', onPress: () => setSessionTimeout(30) },
                    { text: '60 minutes', onPress: () => setSessionTimeout(60) },
                    { text: 'Never', onPress: () => setSessionTimeout(0) },
                  ]
                );
              }}>
                <Text style={styles.settingValue}>{sessionTimeout}m</Text>
              </TouchableOpacity>
            )}
            
            {renderSettingItem(
              'notifications-outline',
              'Login Alerts',
              'Get notified of new logins',
              <Switch
                value={loginAlerts}
                onValueChange={setLoginAlerts}
                trackColor={{ false: colors.background.secondary, true: colors.primary[300] }}
                thumbColor={loginAlerts ? colors.primary[500] : colors.text.secondary}
              />
            )}
          </>
        )}

        {renderSection('Privacy Settings',
          <>
            {renderSettingItem(
              'eye-outline',
              'Profile Visibility',
              profileVisibility === 'private' ? 'Private' : 'Public',
              <TouchableOpacity onPress={() => {
                Alert.alert(
                  'Profile Visibility',
                  'Choose who can see your profile:',
                  [
                    { text: 'Private', onPress: () => setProfileVisibility('private') },
                    { text: 'Public', onPress: () => setProfileVisibility('public') },
                  ]
                );
              }}>
                <Text style={styles.settingValue}>
                  {profileVisibility === 'private' ? 'Private' : 'Public'}
                </Text>
              </TouchableOpacity>
            )}
            
            {renderSettingItem(
              'share-outline',
              'Data Sharing',
              'Share data with partners',
              <Switch
                value={dataSharing}
                onValueChange={setDataSharing}
                trackColor={{ false: colors.background.secondary, true: colors.primary[300] }}
                thumbColor={dataSharing ? colors.primary[500] : colors.text.secondary}
              />
            )}
            
            {renderSettingItem(
              'analytics-outline',
              'Analytics & Performance',
              'Help improve the app',
              <Switch
                value={analyticsEnabled}
                onValueChange={setAnalyticsEnabled}
                trackColor={{ false: colors.background.secondary, true: colors.primary[300] }}
                thumbColor={analyticsEnabled ? colors.primary[500] : colors.text.secondary}
              />
            )}
            
            {renderSettingItem(
              'mail-outline',
              'Marketing Communications',
              'Receive promotional emails',
              <Switch
                value={marketingEmails}
                onValueChange={setMarketingEmails}
                trackColor={{ false: colors.background.secondary, true: colors.primary[300] }}
                thumbColor={marketingEmails ? colors.primary[500] : colors.text.secondary}
              />
            )}
          </>
        )}

        {renderSection('Data Management',
          <>
            {renderSettingItem(
              'download-outline',
              'Download My Data',
              'Export your account data',
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />,
              () => Alert.alert('Data Export', 'Your data export will be emailed to you within 24 hours.')
            )}
            
            {renderSettingItem(
              'trash-outline',
              'Delete My Data',
              'Request data deletion',
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />,
              () => Alert.alert(
                'Delete Data',
                'This will permanently delete all your data. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Request Submitted', 'Your data deletion request has been submitted.') }
                ]
              )
            )}
          </>
        )}
      </ScrollView>
      
      {renderPasswordModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[3],
  },
  sectionContent: {
    backgroundColor: colors.background.tertiary,
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
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
  settingValue: {
    fontSize: typography.sizes.sm,
    color: colors.primary[500],
    fontWeight: typography.weights.medium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
  },
  modalCancel: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  modalSave: {
    fontSize: typography.sizes.base,
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  modalContent: {
    flex: 1,
    padding: spacing[4],
  },
  inputGroup: {
    marginBottom: spacing[4],
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing[2],
  },
  textInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing[3],
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.background.secondary,
  },
  passwordRequirements: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    padding: spacing[4],
    marginTop: spacing[4],
  },
  requirementsTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing[2],
  },
  requirementItem: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
});

export default SecurityPrivacyScreen;
