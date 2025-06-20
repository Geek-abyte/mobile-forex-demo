import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import FusionMarketsLogo from '../../components/atoms/FusionMarketsLogo';

const { width: screenWidth } = Dimensions.get('window');

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

interface OnboardingSlide {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    icon: 'trending-up-outline',
    title: 'Professional Trading',
    subtitle: 'Made Simple',
    description: 'Execute trades with institutional-grade tools designed for both beginners and professionals.',
  },
  {
    id: 2,
    icon: 'shield-checkmark-outline',
    title: 'Bank-Level Security',
    subtitle: 'Your Safety First',
    description: 'Advanced encryption and regulatory compliance ensure your funds and data are protected.',
  },
  {
    id: 3,
    icon: 'analytics-outline',
    title: 'Advanced Analytics',
    subtitle: 'Data-Driven Decisions',
    description: 'Real-time market data, professional charts, and AI-powered insights at your fingertips.',
  },
  {
    id: 4,
    icon: 'rocket-outline',
    title: 'Start Trading',
    subtitle: 'Join Thousands of Traders',
    description: 'Ready to begin your trading journey? Create your account and start with our demo trading.',
  },
];

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * screenWidth,
        animated: true,
      });
    } else {
      // Last slide - navigate to registration
      navigation.navigate('Register');
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
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (slideIndex !== currentSlide && slideIndex >= 0 && slideIndex < onboardingSlides.length) {
      setCurrentSlide(slideIndex);
    }
  };

  const renderSlide = (slide: OnboardingSlide, index: number) => {
    return (
      <View key={slide.id} style={styles.slide}>
        <View style={styles.slideContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon name={slide.icon} size={56} color={colors.primary[400]} />
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            <Text style={styles.slideDescription}>{slide.description}</Text>
          </View>
        </View>
      </View>
    );
  };

  const isLastSlide = currentSlide === onboardingSlides.length - 1;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <FusionMarketsLogo width={100} height={32} />
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Slides */}
          <Animated.View style={[styles.slidesContainer, { opacity: fadeAnim }]}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              style={styles.scrollView}
            >
              {onboardingSlides.map((slide, index) => renderSlide(slide, index))}
            </ScrollView>
          </Animated.View>

          {/* Pagination */}
          <Animated.View style={[styles.paginationContainer, { opacity: fadeAnim }]}>
            {onboardingSlides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    opacity: index === currentSlide ? 1 : 0.3,
                    backgroundColor: colors.primary[index === currentSlide ? 400 : 300],
                  },
                ]}
              />
            ))}
          </Animated.View>

          {/* Bottom Actions */}
          <Animated.View style={[styles.bottomContainer, { opacity: fadeAnim }]}>
            {isLastSlide ? (
              <View style={styles.finalActions}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn}>
                  <Text style={styles.secondaryButtonText}>I already have an account</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Continue</Text>
                <Icon name="chevron-forward" size={20} color={colors.text.primary} />
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
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6], // 24px
    paddingVertical: spacing[4], // 16px
  },
  skipButton: {
    paddingHorizontal: spacing[4], // 16px
    paddingVertical: spacing[2], // 8px
  },
  skipText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  slidesContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[8], // 32px
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[400],
    marginBottom: spacing[12], // 48px
    shadowColor: colors.primary[400],
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  contentContainer: {
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: typography.sizes['4xl'], // 36px
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2], // 8px
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: typography.sizes['2xl'], // 24px
    fontWeight: typography.weights.medium,
    color: colors.primary[400],
    textAlign: 'center',
    marginBottom: spacing[6], // 24px
  },
  slideDescription: {
    fontSize: typography.sizes.lg, // 18px
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing[8], // 32px
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[6], // 24px
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: spacing[1], // 4px
  },
  bottomContainer: {
    paddingHorizontal: spacing[6], // 24px
    paddingBottom: spacing[8], // 32px
  },
  finalActions: {
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingVertical: spacing[4], // 16px
    paddingHorizontal: spacing[8], // 32px
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4], // 16px
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  },
  secondaryButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    paddingVertical: spacing[4], // 16px
    paddingHorizontal: spacing[8], // 32px
    borderWidth: 1,
    borderColor: colors.primary[400],
  },
  nextButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginRight: spacing[2], // 8px
  },
});

export default WelcomeScreen;
