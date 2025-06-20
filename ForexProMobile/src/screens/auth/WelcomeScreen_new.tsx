import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import FusionMarketsLogo from '../../components/atoms/FusionMarketsLogo';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

interface FeatureItem {
  id: number;
  icon: string;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    id: 1,
    icon: 'trending-up',
    title: 'Real-Time Trading',
    description: 'Access live market data and execute trades instantly',
  },
  {
    id: 2,
    icon: 'shield-checkmark',
    title: 'Secure & Regulated',
    description: 'Bank-level security with full regulatory compliance',
  },
  {
    id: 3,
    icon: 'analytics',
    title: 'Advanced Analytics',
    description: 'Professional-grade charts and market analysis tools',
  },
];

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleGetStarted = () => {
    navigation.navigate('Register');
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              {/* Header */}
              <View style={styles.header}>
                <FusionMarketsLogo width={120} height={48} />
                <Text style={styles.welcomeText}>Welcome to Fusion Markets</Text>
                <Text style={styles.subtitle}>
                  Professional forex trading at your fingertips
                </Text>
              </View>

              {/* Features Section */}
              <View style={styles.featuresSection}>
                {features.map((feature) => (
                  <View key={feature.id} style={styles.featureItem}>
                    <View style={styles.featureIconContainer}>
                      <Icon 
                        name={feature.icon} 
                        size={24} 
                        color={colors.primary[500]} 
                      />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
                  <LinearGradient
                    colors={[colors.primary[500], colors.secondary[500]]}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>Get Started</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn}>
                  <Text style={styles.secondaryButtonText}>Sign In</Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Start your professional trading journey today
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[6], // 24px
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing[10], // 40px
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[16], // 64px
  },
  welcomeText: {
    fontSize: typography.sizes['3xl'], // 30px
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing[6], // 24px
    marginBottom: spacing[2], // 8px
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: spacing[16], // 64px
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[8], // 32px
    paddingHorizontal: spacing[4], // 16px
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[5], // 20px
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1], // 4px
  },
  featureDescription: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  actionsContainer: {
    marginBottom: spacing[16], // 64px
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing[5], // 20px
  },
  buttonGradient: {
    paddingVertical: spacing[4], // 16px
    paddingHorizontal: spacing[8], // 32px
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  secondaryButton: {
    paddingVertical: spacing[4], // 16px
    paddingHorizontal: spacing[8], // 32px
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
