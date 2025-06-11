import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../theme';
import { APP_OVERVIEW, QUICK_TIPS } from '../../constants/tutorialData';

const { width, height } = Dimensions.get('window');

interface WelcomeTutorialProps {
  visible: boolean;
  onStart: () => void;
  onSkip: () => void;
}

const WelcomeTutorial: React.FC<WelcomeTutorialProps> = ({
  visible,
  onStart,
  onSkip,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const renderFeatureCard = (feature: any, index: number) => (
    <Animated.View
      key={feature.id}
      style={[
        styles.featureCard,
        feature.importance === 'high' && styles.highlightCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50 + index * 10],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.featureIcon}>
        <MaterialIcons
          name={feature.icon}
          size={24}
          color={feature.importance === 'high' ? '#00D4AA' : colors.primary[500]}
        />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
      {feature.importance === 'high' && (
        <View style={styles.priorityBadge}>
          <Text style={styles.priorityText}>Essential</Text>
        </View>
      )}
    </Animated.View>
  );

  const renderQuickTip = (tip: any, index: number) => (
    <View key={tip.id} style={styles.tipCard}>
      <View style={styles.tipIcon}>
        <Ionicons name={tip.icon} size={20} color={colors.primary[500]} />
      </View>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{tip.title}</Text>
        <Text style={styles.tipDescription}>{tip.description}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#00D4AA', '#00A085']}
                style={styles.logo}
              >
                <MaterialIcons name="trending-up" size={40} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>{APP_OVERVIEW.title}</Text>
            <Text style={styles.subtitle}>{APP_OVERVIEW.description}</Text>
            
            <View style={styles.demoNotice}>
              <Ionicons name="shield-checkmark" size={24} color="#00D4AA" />
              <Text style={styles.demoNoticeText}>{APP_OVERVIEW.safetyNote}</Text>
            </View>
          </Animated.View>

          {/* Key Features */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Key Features</Text>
            <Text style={styles.sectionSubtitle}>
              Explore what makes ForexPro Mobile your complete trading companion
            </Text>
            
            <View style={styles.featuresGrid}>
              {APP_OVERVIEW.keyFeatures.map((feature, index) =>
                renderFeatureCard(feature, index)
              )}
            </View>
          </Animated.View>

          {/* Getting Started Steps */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Getting Started</Text>
            <Text style={styles.sectionSubtitle}>
              Follow these steps to make the most of your demo experience
            </Text>
            
            <View style={styles.stepsList}>
              {APP_OVERVIEW.gettingStartedSteps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Quick Tips */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Pro Tips</Text>
            <Text style={styles.sectionSubtitle}>
              Essential trading wisdom for your forex journey
            </Text>
            
            <View style={styles.tipsContainer}>
              {QUICK_TIPS.map((tip, index) => renderQuickTip(tip, index))}
            </View>
          </Animated.View>

          {/* Actions */}
          <Animated.View
            style={[
              styles.actions,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity style={styles.primaryButton} onPress={onStart}>
              <LinearGradient
                colors={['#00D4AA', '#00A085']}
                style={styles.primaryButtonGradient}
              >
                <MaterialIcons name="play-arrow" size={24} color="white" />
                <Text style={styles.primaryButtonText}>Start Tutorial</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={onSkip}>
              <Text style={styles.secondaryButtonText}>Skip & Explore</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  logoContainer: {
    marginBottom: spacing[6],
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing[6],
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D4AA20',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00D4AA40',
  },
  demoNoticeText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#00D4AA',
    marginLeft: spacing[3],
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[8],
  },
  sectionTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  sectionSubtitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing[6],
  },
  featuresGrid: {
    gap: spacing[4],
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.tertiary,
    padding: spacing[5],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  highlightCard: {
    borderColor: '#00D4AA',
    backgroundColor: colors.background.secondary,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  featureDescription: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  priorityBadge: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 12,
    marginLeft: spacing[2],
  },
  priorityText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: 'white',
  },
  stepsList: {
    gap: spacing[4],
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  stepNumberText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: 'white',
  },
  stepText: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    lineHeight: 24,
    marginTop: 4,
  },
  tipsContainer: {
    gap: spacing[3],
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.tertiary,
    padding: spacing[4],
    borderRadius: 12,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[500] + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  tipDescription: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[6],
  },
  primaryButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: 'white',
    marginLeft: spacing[2],
  },
  secondaryButton: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
});

export default WelcomeTutorial;
