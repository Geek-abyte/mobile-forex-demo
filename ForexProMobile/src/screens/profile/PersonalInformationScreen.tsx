import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { colors, typography, spacing } from '../../theme';
import StandardHeader from '../../components/molecules/StandardHeader';

const PersonalInformationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [dateOfBirth, setDateOfBirth] = useState('January 15, 1990');
  const [country, setCountry] = useState('United States');
  const [city, setCity] = useState('New York');
  const [address, setAddress] = useState('123 Wall Street, Apt 4B');
  const [zipCode, setZipCode] = useState('10005');

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    Alert.alert(
      'Success',
      'Your personal information has been updated successfully.',
      [{ text: 'OK', onPress: () => setIsEditing(false) }]
    );
  };

  const handleCancel = () => {
    // Reset form to original values
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  const renderField = (label: string, value: string, setValue: (value: string) => void, keyboardType: any = 'default') => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
        value={value}
        onChangeText={setValue}
        editable={isEditing}
        keyboardType={keyboardType}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={colors.text.secondary}
      />
    </View>
  );

  const renderVerificationStatus = (field: string, isVerified: boolean) => (
    <View style={styles.verificationContainer}>
      <Ionicons 
        name={isVerified ? 'checkmark-circle' : 'alert-circle'} 
        size={16} 
        color={isVerified ? colors.status.success : colors.status.warning} 
      />
      <Text style={[
        styles.verificationText,
        { color: isVerified ? colors.status.success : colors.status.warning }
      ]}>
        {isVerified ? 'Verified' : 'Verification Required'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StandardHeader 
        title="Personal Information"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightActions={[
          <TouchableOpacity
            key="edit"
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        ]}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.sectionContent}>
            {renderField('First Name', firstName, setFirstName)}
            {renderField('Last Name', lastName, setLastName)}
            {renderField('Date of Birth', dateOfBirth, setDateOfBirth)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.sectionContent}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
                value={email}
                onChangeText={setEmail}
                editable={isEditing}
                keyboardType="email-address"
                placeholder="Enter email address"
                placeholderTextColor={colors.text.secondary}
              />
              {renderVerificationStatus('email', true)}
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
                value={phone}
                onChangeText={setPhone}
                editable={isEditing}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
                placeholderTextColor={colors.text.secondary}
              />
              {renderVerificationStatus('phone', false)}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Information</Text>
          <View style={styles.sectionContent}>
            {renderField('Country', country, setCountry)}
            {renderField('City', city, setCity)}
            {renderField('Address', address, setAddress)}
            {renderField('ZIP Code', zipCode, setZipCode)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Verification</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.verificationItem}>
              <View style={styles.verificationLeft}>
                <Ionicons name="document-text-outline" size={24} color={colors.primary[500]} />
                <View style={styles.verificationInfo}>
                  <Text style={styles.verificationTitle}>Identity Verification</Text>
                  <Text style={styles.verificationSubtitle}>Upload government-issued ID</Text>
                </View>
              </View>
              <View style={styles.verificationStatus}>
                <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                <Text style={[styles.verificationText, { color: colors.status.success }]}>
                  Verified
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.verificationItem}>
              <View style={styles.verificationLeft}>
                <Ionicons name="home-outline" size={24} color={colors.status.warning} />
                <View style={styles.verificationInfo}>
                  <Text style={styles.verificationTitle}>Address Verification</Text>
                  <Text style={styles.verificationSubtitle}>Upload proof of address</Text>
                </View>
              </View>
              <View style={styles.verificationStatus}>
                <Ionicons name="alert-circle" size={20} color={colors.status.warning} />
                <Text style={[styles.verificationText, { color: colors.status.warning }]}>
                  Pending
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    padding: spacing[4],
  },
  editButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[500],
    borderRadius: 8,
  },
  editButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
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
    padding: spacing[4],
  },
  fieldContainer: {
    marginBottom: spacing[4],
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing[2],
  },
  fieldInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing[3],
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.background.secondary,
  },
  fieldInputDisabled: {
    opacity: 0.7,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  verificationText: {
    fontSize: typography.sizes.xs,
    marginLeft: spacing[1],
    fontWeight: typography.weights.medium,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  verificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  verificationInfo: {
    marginLeft: spacing[3],
    flex: 1,
  },
  verificationTitle: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  verificationSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
  cancelButton: {
    flex: 1,
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  saveButton: {
    flex: 1,
    padding: spacing[4],
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
});

export default PersonalInformationScreen;
