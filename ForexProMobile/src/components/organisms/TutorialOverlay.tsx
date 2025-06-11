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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { useTutorial } from '../../contexts/TutorialContext';
import { TutorialStep } from '../../types/tutorial';

const { width, height } = Dimensions.get('window');

interface TutorialOverlayProps {
  visible: boolean;
  step?: TutorialStep;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onClose: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStepNumber: number;
  totalSteps: number;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  visible,
  step,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  isFirstStep,
  isLastStep,
  currentStepNumber,
  totalSteps,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!step) return null;

  const getContentPosition = () => {
    switch (step.position) {
      case 'top':
        return { top: 100 };
      case 'bottom':
        return { bottom: 150 };
      case 'left':
        return { left: 20, top: height / 2 - 100 };
      case 'right':
        return { right: 20, top: height / 2 - 100 };
      default:
        return { top: height / 2 - 150 };
    }
  };

  const renderActionHint = () => {
    if (!step.action || step.action === 'none') return null;

    const getActionIcon = (): keyof typeof Ionicons.glyphMap => {
      switch (step.action) {
        case 'tap': return 'finger-print';
        case 'swipe': return 'swap-horizontal';
        case 'scroll': return 'list';
        default: return 'hand-left';
      }
    };

    const getActionColor = () => {
      switch (step.action) {
        case 'tap': return '#00D4AA';
        case 'swipe': return '#4F46E5';
        case 'scroll': return '#7C3AED';
        default: return colors.primary[500];
      }
    };

    return (
      <View style={[styles.actionHint, { backgroundColor: getActionColor() + '20' }]}>
        <Ionicons name={getActionIcon()} size={20} color={getActionColor()} />
        <Text style={[styles.actionText, { color: getActionColor() }]}>
          {step.actionDescription}
        </Text>
      </View>
    );
  };

  const renderHighlight = () => {
    // Removed misleading "Look here!" indicator
    // Tutorial steps now focus on clear descriptions instead
    return null;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.contentContainer,
              getContentPosition(),
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {step.icon && (
                  <View style={styles.iconContainer}>
                    <Ionicons name={step.icon as any} size={24} color="white" />
                  </View>
                )}
                <View>
                  <Text style={styles.stepCounter}>
                    Step {currentStepNumber} of {totalSteps}
                  </Text>
                  <Text style={styles.title}>{step.title}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.description}>{step.description}</Text>
              {renderActionHint()}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <View style={styles.leftActions}>
                {!isFirstStep && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onPrevious}
                  >
                    <Ionicons name="chevron-back" size={20} color={colors.primary[500]} />
                    <Text style={styles.secondaryButtonText}>Previous</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.rightActions}>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={onSkip}
                >
                  <Text style={styles.skipButtonText}>Skip Tutorial</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onNext}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLastStep ? 'Finish' : 'Next'}
                  </Text>
                  {!isLastStep && (
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  contentContainer: {
    position: 'absolute',
    width: width - 40,
    maxWidth: 350,
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing[6],
    paddingBottom: spacing[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  stepCounter: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: 24,
  },
  closeButton: {
    padding: 8,
    marginTop: -8,
    marginRight: -8,
  },
  content: {
    maxHeight: 200,
    paddingHorizontal: spacing[6],
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
    fontWeight: typography.weights.regular,
    marginBottom: spacing[4],
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500] + '20',
    padding: spacing[3],
    borderRadius: 12,
    marginTop: spacing[2],
  },
  actionText: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: typography.weights.medium,
    marginLeft: spacing[2],
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[6],
    paddingTop: spacing[4],
  },
  leftActions: {
    flex: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: 12,
    marginLeft: spacing[3],
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: typography.weights.semibold,
    color: 'white',
    marginRight: spacing[1],
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: typography.weights.medium,
    color: colors.primary[500],
    marginLeft: spacing[1],
  },
  skipButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
});

export default TutorialOverlay;
