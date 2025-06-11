import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import StandardHeader from '../../components/molecules/StandardHeader';

const { width, height } = Dimensions.get('window');

const BiometricSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  const handleSkip = () => {
    Alert.alert(
      'Skip Biometric Setup',
      'You can set up biometric authentication later in your profile settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          onPress: () => navigation.navigate('MainNavigator' as never)
        }
      ]
    );
  };

  const handleBiometricSetup = () => {
    // Simulate biometric setup process
    Alert.alert(
      'Biometric Authentication',
      'Please place your finger on the sensor or look at the camera to set up biometric authentication.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // Simulate setup delay
            setTimeout(() => {
              setIsSetupComplete(true);
              Alert.alert(
                'Success!',
                'Biometric authentication has been set up successfully.',
                [
                  { 
                    text: 'Continue', 
                    onPress: () => navigation.navigate('MainNavigator' as never)
                  }
                ]
              );
            }, 2000);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StandardHeader 
          title=""
          rightActions={[
            <TouchableOpacity 
              key="skip"
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ]}
        />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.biometricIcon}>
              <Ionicons 
                name="finger-print" 
                size={80} 
                color={colors.primary[500]} 
              />
            </View>
          </View>

          <Text style={styles.title}>Secure Your Account</Text>
          <Text style={styles.subtitle}>
            Set up biometric authentication for quick and secure access to your ForexPro account.
          </Text>

          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark" size={24} color={colors.status.success} />
              <Text style={styles.benefitText}>Enhanced Security</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="flash" size={24} color={colors.status.warning} />
              <Text style={styles.benefitText}>Quick Access</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="lock-closed" size={24} color={colors.primary[500]} />
              <Text style={styles.benefitText}>Privacy Protection</Text>
            </View>
          </View>

          <View style={styles.supportedMethods}>
            <Text style={styles.methodsTitle}>Supported Methods:</Text>
            <View style={styles.methodsRow}>
              <View style={styles.methodItem}>
                <Ionicons name="finger-print" size={32} color={colors.text.secondary} />
                <Text style={styles.methodText}>Fingerprint</Text>
              </View>
              <View style={styles.methodItem}>
                <Ionicons name="scan" size={32} color={colors.text.secondary} />
                <Text style={styles.methodText}>Face ID</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.setupButton, isSetupComplete && styles.setupButtonComplete]}
            onPress={handleBiometricSetup}
            disabled={isSetupComplete}
          >
            <View style={[styles.setupButtonContent, isSetupComplete && styles.setupButtonCompleteContent]}>
              <Ionicons 
                name={isSetupComplete ? "checkmark" : "finger-print"} 
                size={24} 
                color="white" 
              />
              <Text style={styles.setupButtonText}>
                {isSetupComplete ? 'Setup Complete' : 'Set Up Biometric'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.laterButton}
            onPress={handleSkip}
          >
            <Text style={styles.laterButtonText}>I'll do this later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  skipButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  skipText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  iconContainer: {
    marginBottom: spacing[8],
  },
  biometricIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing[8],
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: spacing[8],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginBottom: spacing[3],
  },
  benefitText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginLeft: spacing[3],
  },
  supportedMethods: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  methodsTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  methodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  methodItem: {
    alignItems: 'center',
    padding: spacing[4],
  },
  methodText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
  },
  setupButton: {
    borderRadius: 12,
    marginBottom: spacing[4],
    backgroundColor: colors.primary[500],
    overflow: 'hidden',
  },
  setupButtonComplete: {
    backgroundColor: colors.status.success,
    opacity: 0.8,
  },
  setupButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
  },
  setupButtonCompleteContent: {
    backgroundColor: 'transparent',
  },
  setupButtonText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: 'white',
    marginLeft: spacing[2],
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  laterButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
});

export default BiometricSetupScreen;
