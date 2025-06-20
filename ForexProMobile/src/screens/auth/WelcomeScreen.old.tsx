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
  ScrollView,
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
    title: 'Trade with Confidence',
    description: 'Access global markets with professional-grade tools and real-time data.',
    accentColor: colors.logo.primary,
  },
  {
    id: 2,
    icon: 'shield-checkmark',
    title: 'Secure & Regulated',
    description: 'Your funds are protected with bank-grade security and regulatory compliance.',
    accentColor: colors.logo.secondary,
  },
  {
    id: 3,
    icon: 'analytics',
    title: 'Smart Analytics',
    description: 'Make informed decisions with AI-powered insights and advanced charting.',
    accentColor: colors.primary[400],
  },
];

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
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

  const onScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const slide = Math.round(contentOffset / width);
    if (slide !== currentSlide) {
      setCurrentSlide(slide);
    }
  };

  const renderSlide = (slide: OnboardingSlide, index: number) => (
    <View key={slide.id} style={styles.slide}>
      <View style={styles.slideContent}>
        <View style={[styles.iconContainer, { 
          backgroundColor: slide.accentColor + '15',
          borderColor: slide.accentColor + '30'
        }]}>
          <LinearGradient
            colors={[slide.accentColor + '20', slide.accentColor + '10']}
            style={styles.iconGradient}
          >
            <Icon name={slide.icon} size={52} color={slide.accentColor} />
          </LinearGradient>
        </View>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDescription}>{slide.description}</Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {onboardingSlides.map((_, index) => (          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === currentSlide ? colors.logo.secondary : colors.text.tertiary,
                width: index === currentSlide ? 24 : 8,
              },
            ]}
          />
      ))}
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[colors.background.primary, colors.background.secondary, colors.logo.primary + '15']}
          style={styles.gradient}
        >
          {/* Header - Enhanced with better visual hierarchy */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={styles.logoSection}>
              <View style={styles.logoWrapper}>
                <FusionMarketsLogo width={260} height={108} />
              </View>
              <Text style={styles.brandTagline}>Trade Smarter</Text>
              <Text style={styles.brandSubtitle}>Your Gateway to Global Markets</Text>
            </View>
            
            {currentSlide < onboardingSlides.length - 1 && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Carousel */}
          <Animated.View style={[styles.carouselContainer, { opacity: fadeAnim }]}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScroll}
              style={styles.carousel}
            >
              {onboardingSlides.map((slide, index) => renderSlide(slide, index))}
            </ScrollView>
          </Animated.View>

          {/* Pagination */}
          <Animated.View style={[styles.paginationContainer, { opacity: fadeAnim }]}>
            {renderPagination()}
          </Animated.View>

          {/* Actions - Enhanced with better visual hierarchy */}
          <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
            {currentSlide === onboardingSlides.length - 1 ? (
              <View style={styles.finalActions}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
                  <LinearGradient
                    colors={[colors.logo.primary, colors.logo.secondary]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.primaryButtonText}>Get Started</Text>
                    <Icon name="arrow-forward" size={22} color={colors.text.inverse} />
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn}>
                  <Text style={styles.secondaryButtonText}>I already have an account</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <LinearGradient
                  colors={[colors.logo.primary, colors.logo.secondary]}
                  style={styles.nextButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                  <Icon name="arrow-forward" size={20} color={colors.text.inverse} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <Text style={styles.footerText}>
              Secure • Regulated • Trusted by millions
            </Text>
          </Animated.View>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[12],
    paddingBottom: spacing[8],
    minHeight: 180,
    position: 'relative',
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    marginBottom: spacing[3],
    shadowColor: colors.logo.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  brandTagline: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.logo.secondary,
    textAlign: 'center',
    marginTop: spacing[2],
    letterSpacing: 0.8,
    lineHeight: 26,
  },
  brandSubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[2],
    letterSpacing: 0.3,
    lineHeight: 18,
    opacity: 0.8,
  },
  skipButton: {
    position: 'absolute',
    top: spacing[8],
    right: spacing[6],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    minHeight: 40,
    backgroundColor: colors.background.elevated + '90',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.logo.primary + '25',
    shadowColor: colors.logo.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  skipText: {
    ...typography.styles.bodySmall,
    color: colors.logo.secondary,
    fontWeight: '600',
    lineHeight: 20,
    minHeight: 20,
  },
  carouselContainer: {
    flex: 1,
    marginTop: spacing[2],
    minHeight: 420,
  },
  carousel: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[6],
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: spacing[10],
    maxWidth: width * 0.85,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[8],
    borderWidth: 2,
    shadowColor: colors.logo.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[5],
    fontWeight: '700',
    minHeight: 44,
    lineHeight: 36,
    fontSize: typography.sizes['2xl'],
  },
  slideDescription: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing[2],
    minHeight: 52,
    maxWidth: width * 0.75,
    fontSize: typography.sizes.base,
    fontWeight: '400',
  },
  paginationContainer: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: spacing[2],
    backgroundColor: colors.text.tertiary + '50',
  },
  actionsContainer: {
    paddingHorizontal: spacing[8],
    paddingBottom: spacing[6],
    minHeight: 140,
  },
  finalActions: {
    gap: spacing[4],
    minHeight: 120,
  },
  primaryButton: {
    borderRadius: 20,
    shadowColor: colors.logo.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[8],
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    gap: spacing[3],
  },
  primaryButtonText: {
    ...typography.styles.h5,
    color: colors.text.inverse,
    fontWeight: '700',
    lineHeight: 24,
    minHeight: 24,
    fontSize: typography.sizes.lg,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: spacing[4],
    minHeight: 48,
  },
  secondaryButtonText: {
    ...typography.styles.body,
    color: colors.logo.secondary,
    fontWeight: '600',
    lineHeight: 22,
    minHeight: 22,
    fontSize: typography.sizes.base,
  },
  nextButton: {
    borderRadius: 20,
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
    borderRadius: 20,
    minHeight: 64,
    gap: spacing[3],
  },
  nextButtonText: {
    ...typography.styles.h5,
    color: colors.text.inverse,
    fontWeight: '600',
    lineHeight: 22,
    minHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingBottom: Platform.OS === 'ios' ? spacing[2] : spacing[4],
    minHeight: 40,
  },
  footerText: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
    minHeight: 18,
    paddingVertical: spacing[1],
  },
});

export default WelcomeScreen;
