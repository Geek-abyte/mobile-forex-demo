import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialIcons';
import { colors, typography, spacing } from '../../theme';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  gradient: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Professional Trading',
    description: 'Access real-time forex markets with institutional-grade tools and advanced charting capabilities.',
    icon: 'trending-up',
    gradient: [colors.primary[500], colors.primary[400]],
  },
  {
    id: 2,
    title: 'Smart Analytics',
    description: 'Make informed decisions with AI-powered market analysis, technical indicators, and risk management tools.',
    icon: 'analytics',
    gradient: [colors.secondary[500], colors.secondary[400]],
  },
  {
    id: 3,
    title: 'Secure & Reliable',
    description: 'Your funds and data are protected with bank-level security, encryption, and regulatory compliance.',
    icon: 'security',
    gradient: [colors.trading.profit, '#00E6B8'],
  },
  {
    id: 4,
    title: 'Start Trading',
    description: 'Join millions of traders worldwide. Get started with our demo account or fund your live account today.',
    icon: 'rocket-launch',
    gradient: [colors.primary[500], colors.secondary[500]],
  },
];

const OnboardingScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnims = useRef(onboardingSteps.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(onboardingSteps.map(() => new Animated.Value(50))).current;
  const scaleAnims = useRef(onboardingSteps.map(() => new Animated.Value(0.8))).current;

  useEffect(() => {
    // Animate current step
    const currentIndex = currentStep;
    
    Animated.parallel([
      Animated.timing(fadeAnims[currentIndex], {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnims[currentIndex], {
        toValue: 0,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnims[currentIndex], {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({ x: nextStep * width, animated: true });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      scrollViewRef.current?.scrollTo({ x: prevStep * width, animated: true });
    }
  };

  const handleSkip = () => {
    // Navigate to next screen (BiometricSetup or Login)
    console.log('Skip onboarding');
  };

  const handleGetStarted = () => {
    // Navigate to registration
    console.log('Get started');
  };

  const renderStep = (step: OnboardingStep, index: number) => (
    <View key={step.id} style={[styles.stepContainer, { width }]}>
      <Animated.View
        style={[
          styles.stepContent,
          {
            opacity: fadeAnims[index],
            transform: [
              { translateY: slideAnims[index] },
              { scale: scaleAnims[index] }
            ]
          }
        ]}
      >
        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[step.gradient[0], step.gradient[1]] as any}
            style={styles.iconGradient}
          >
            <Icon name={step.icon as any} size={80} color={colors.text.inverse} />
          </LinearGradient>
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>

        {/* Features List */}
        {index === 0 && (
          <View style={styles.featuresList}>
            {['Real-time pricing', 'Advanced charts', 'Risk management'].map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <Icon name="check-circle" size={20} color={colors.secondary[500]} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {index === 1 && (
          <View style={styles.featuresList}>
            {['Technical indicators', 'Market signals', 'Portfolio insights'].map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <Icon name="check-circle" size={20} color={colors.secondary[500]} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {index === 2 && (
          <View style={styles.featuresList}>
            {['Bank-level security', '256-bit encryption', 'Regulated platform'].map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <Icon name="check-circle" size={20} color={colors.secondary[500]} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <View style={styles.stepIndicator}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentStep ? styles.activeIndicator : styles.inactiveIndicator
                ]}
              />
            ))}
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.scrollView}
        >
          {onboardingSteps.map((step, index) => renderStep(step, index))}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
                <Icon name="arrow-back" size={20} color={colors.text.secondary} />
                <Text style={styles.secondaryButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.primaryButton, currentStep === 0 && styles.fullWidthButton]}
              onPress={currentStep === onboardingSteps.length - 1 ? handleGetStarted : handleNext}
            >
              <LinearGradient
                colors={[colors.primary[500], colors.primary[400]]}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>
                  {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                </Text>
                <Icon 
                  name={currentStep === onboardingSteps.length - 1 ? 'rocket-launch' : 'arrow-forward'} 
                  size={20} 
                  color={colors.text.inverse} 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  skipButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  skipText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
    fontWeight: typography.weights.medium,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeIndicator: {
    backgroundColor: colors.primary[500],
  },
  inactiveIndicator: {
    backgroundColor: colors.text.tertiary,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  stepContent: {
    alignItems: 'center',
    maxWidth: 350,
  },
  iconContainer: {
    marginBottom: spacing[8],
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  stepTitle: {
    fontSize: typography.sizes['3xl'],
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  stepDescription: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  featuresList: {
    gap: spacing[3],
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  featureText: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
    paddingTop: spacing[4],
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    height: 56,
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  secondaryButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fullWidthButton: {
    flex: 2,
  },
  buttonGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  primaryButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.inverse,
  },
});

export default OnboardingScreen;
