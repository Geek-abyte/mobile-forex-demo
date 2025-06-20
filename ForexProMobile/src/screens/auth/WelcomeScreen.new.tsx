import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import FusionMarketsLogo from '../../components/atoms/FusionMarketsLogo';

const { width, height } = Dimensions.get('window');

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

interface OnboardingSlide {
  id: number;
  icon: string;
  title: string;
  description: string;
  accentColor: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    icon: 'trending-up',
    title: 'Advanced Trading',
    description: 'Professional-grade tools with real-time market data and advanced analytics.',
    accentColor: colors.logo.primary,
  },
  {
    id: 2,
    icon: 'shield-checkmark',
    title: 'Bank-Level Security',
    description: 'Your investments are protected with military-grade encryption and regulation.',
    accentColor: colors.logo.secondary,
  },
  {
    id: 3,
    icon: 'analytics',
    title: 'AI-Powered Insights',
    description: 'Make informed decisions with machine learning algorithms and market predictions.',
    accentColor: colors.primary[400],
  },
];

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    // Main entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation for logo
    const floatingSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    floatingSequence.start();

    // Particle animations
    particleAnims.forEach((anim, index) => {
      const delay = index * 400;
      const particleLoop = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ])
      );
      particleLoop.start();
    });
  }, []);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  const handleGetStarted = () => {
    navigation.navigate('Register');
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  const FloatingParticle = ({ index }: { index: number }) => {
    const animValue = particleAnims[index];
    const size = 4 + Math.random() * 8;
    const left = Math.random() * (width - 20);
    const top = 100 + Math.random() * (height - 300);

    return (
      <Animated.View
        style={[
          styles.particle,
          {
            left,
            top,
            width: size,
            height: size,
            opacity: animValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.8, 0],
            }),
            transform: [
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -50],
                }),
              },
              {
                scale: animValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0],
                }),
              },
            ],
          },
        ]}
      />
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Animated Background */}
        <LinearGradient
          colors={[
            '#0A0B1E',
            '#1A1B3A',
            colors.logo.primary + '40',
            colors.logo.secondary + '20',
            '#0A0B1E'
          ]}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Floating Particles */}
        {particleAnims.map((_, index) => (
          <FloatingParticle key={index} index={index} />
        ))}

        <SafeAreaView style={styles.safeArea}>
          {/* Skip Button */}
          {currentSlide < onboardingSlides.length - 1 && (
            <Animated.View style={[styles.skipContainer, { opacity: fadeAnim }]}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <BlurView intensity={20} style={styles.skipBlur}>
                  <Text style={styles.skipText}>Skip</Text>
                </BlurView>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Hero Section */}
          <Animated.View 
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: logoScale },
                  {
                    translateY: floatingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoGlow}>
                <FusionMarketsLogo width={280} height={116} />
              </View>
            </View>
            
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Welcome to the Future</Text>
              <Text style={styles.heroSubtitle}>of Trading</Text>
              <Text style={styles.tagline}>
                Where Innovation Meets Opportunity
              </Text>
            </View>
          </Animated.View>

          {/* Content Section */}
          <Animated.View 
            style={[
              styles.contentSection,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.featureCard}>
              <BlurView intensity={15} tint="dark" style={styles.cardBlur}>
                <View style={styles.cardContent}>
                  <Icon 
                    name={onboardingSlides[currentSlide].icon} 
                    size={40} 
                    color={colors.logo.primary}
                    style={styles.featureIcon}
                  />
                  <Text style={styles.featureTitle}>
                    {onboardingSlides[currentSlide].title}
                  </Text>
                  <Text style={styles.featureDescription}>
                    {onboardingSlides[currentSlide].description}
                  </Text>
                </View>
              </BlurView>
            </View>

            {/* Minimal Pagination */}
            <View style={styles.paginationContainer}>
              {onboardingSlides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    {
                      width: index === currentSlide ? 24 : 8,
                      backgroundColor: index === currentSlide 
                        ? colors.logo.primary 
                        : colors.text.tertiary + '40',
                    },
                  ]}
                />
              ))}
            </View>
          </Animated.View>

          {/* Bottom Actions */}
          <Animated.View 
            style={[
              styles.bottomSection,
              { opacity: fadeAnim }
            ]}
          >
            {currentSlide === onboardingSlides.length - 1 ? (
              <View style={styles.finalActions}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
                  <LinearGradient
                    colors={[colors.logo.primary, colors.logo.secondary]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>Start Trading</Text>
                    <Icon name="rocket" size={24} color={colors.text.inverse} />
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn}>
                  <BlurView intensity={10} tint="light" style={styles.secondaryBlur}>
                    <Text style={styles.secondaryButtonText}>I already have an account</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <LinearGradient
                  colors={[colors.logo.primary + '90', colors.logo.secondary + '90']}
                  style={styles.nextButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.nextButtonText}>Continue</Text>
                  <Icon name="arrow-forward" size={20} color={colors.text.inverse} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B1E',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: colors.logo.primary,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing[6],
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
  },
  skipButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  skipBlur: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
  skipText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  logoContainer: {
    marginBottom: spacing[8],
  },
  logoGlow: {
    shadowColor: colors.logo.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 42,
    fontFamily: typography.fonts.primary,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 42,
    fontFamily: typography.fonts.primary,
    fontWeight: '800',
    color: colors.logo.primary,
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: spacing[4],
  },
  tagline: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  contentSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  featureCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: spacing[8],
  },
  cardBlur: {
    padding: spacing[8],
  },
  cardContent: {
    alignItems: 'center',
  },
  featureIcon: {
    marginBottom: spacing[5],
  },
  featureTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  featureDescription: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  paginationDot: {
    height: 4,
    borderRadius: 2,
  },
  bottomSection: {
    paddingBottom: spacing[8],
  },
  finalActions: {
    gap: spacing[4],
  },
  primaryButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.logo.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[8],
    gap: spacing[3],
  },
  buttonText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  secondaryButton: {
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: spacing[2],
  },
  secondaryBlur: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  nextButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.logo.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[8],
    gap: spacing[3],
  },
  nextButtonText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.inverse,
  },
});

export default WelcomeScreen;
