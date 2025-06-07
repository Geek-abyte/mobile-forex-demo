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
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

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
    accentColor: colors.primary[500],
  },
  {
    id: 2,
    icon: 'shield-checkmark',
    title: 'Secure & Regulated',
    description: 'Your funds are protected with bank-grade security and regulatory compliance.',
    accentColor: colors.secondary[500],
  },
  {
    id: 3,
    icon: 'analytics',
    title: 'Smart Analytics',
    description: 'Make informed decisions with AI-powered insights and advanced charting.',
    accentColor: colors.trading.profit,
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
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
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
        <View style={[styles.iconContainer, { backgroundColor: slide.accentColor + '20' }]}>
          <Icon name={slide.icon} size={48} color={slide.accentColor} />
        </View>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDescription}>{slide.description}</Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {onboardingSlides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === currentSlide ? colors.primary[500] : colors.text.tertiary,
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
          colors={[colors.background.primary, colors.background.secondary]}
          style={styles.gradient}
        >
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={styles.titleContainer}>
              <Text style={styles.brandName}>
                <Text style={styles.brandPrefix}>Forex</Text>
                <Text style={styles.brandSuffix}>Pro</Text>
              </Text>
              <Text style={styles.brandTagline}>Trade Smarter</Text>
            </View>
            
            {currentSlide < onboardingSlides.length - 1 && (
              <View style={styles.skipContainer}>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
              </View>
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

          {/* Actions */}
          <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
            {currentSlide === onboardingSlides.length - 1 ? (
              <View style={styles.finalActions}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
                  <LinearGradient
                    colors={[colors.primary[500], colors.primary[400]]}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>Get Started</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn}>
                  <Text style={styles.secondaryButtonText}>I already have an account</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <LinearGradient
                  colors={[colors.primary[500], colors.primary[400]]}
                  style={styles.nextButtonGradient}
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    minHeight: 100,
    position: 'relative',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  brandName: {
    textAlign: 'center',
    lineHeight: 36,
    minHeight: 40,
  },
  brandPrefix: {
    ...typography.styles.h2,
    color: colors.text.primary,
    fontWeight: '300',
    letterSpacing: 1,
    lineHeight: 36,
  },
  brandSuffix: {
    ...typography.styles.h2,
    color: colors.primary[500],
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 36,
  },
  brandTagline: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: spacing[1],
    letterSpacing: 0.5,
    lineHeight: 16,
    minHeight: 16,
  },
  skipContainer: {
    position: 'absolute',
    right: spacing[6],
    top: spacing[6],
  },
  skipButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    minHeight: 36,
    backgroundColor: colors.background.elevated + '80',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.primary[500] + '30',
  },
  skipText: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
    fontWeight: '500',
    lineHeight: 20,
    minHeight: 20,
  },
  carouselContainer: {
    flex: 1,
    marginTop: 0,
    minHeight: 400,
  },
  carousel: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: spacing[8],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
    borderWidth: 2,
    borderColor: colors.background.elevated,
  },
  slideTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[4],
    fontWeight: '600',
    minHeight: 40,
    lineHeight: 32,
  },
  slideDescription: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing[4],
    minHeight: 50,
    maxWidth: width * 0.8,
  },
  paginationContainer: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: spacing[1],
    backgroundColor: colors.text.tertiary,
  },
  actionsContainer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
    minHeight: 120,
  },
  finalActions: {
    gap: spacing[3],
    minHeight: 100,
  },
  primaryButton: {
    borderRadius: 16,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButtonText: {
    ...typography.styles.h5,
    color: colors.text.inverse,
    fontWeight: '600',
    lineHeight: 22,
    minHeight: 22,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: spacing[3],
    minHeight: 40,
  },
  secondaryButtonText: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
    fontWeight: '500',
    lineHeight: 20,
    minHeight: 20,
  },
  nextButton: {
    borderRadius: 16,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    borderRadius: 16,
    minHeight: 56,
    gap: spacing[2],
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
