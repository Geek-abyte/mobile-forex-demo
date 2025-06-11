import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface TutorialHintProps {
  visible: boolean;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  onDismiss: () => void;
  onLearnMore?: () => void;
}

const TutorialHint: React.FC<TutorialHintProps> = ({
  visible,
  title,
  description,
  position = 'bottom',
  onDismiss,
  onLearnMore,
}) => {
  if (!visible) return null;

  const getPositionStyles = (): any => {
    switch (position) {
      case 'top':
        return { top: 60, left: 20, right: 20 };
      case 'bottom':
        return { bottom: 100, left: 20, right: 20 };
      case 'left':
        return { left: 20, top: '50%' as any, width: 300 };
      case 'right':
        return { right: 20, top: '50%' as any, width: 300 };
      default:
        return { bottom: 100, left: 20, right: 20 };
    }
  };

  return (
    <View style={[styles.container, getPositionStyles()]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="bulb" size={16} color={colors.primary[500]} />
            <Text style={styles.title}>{title}</Text>
          </View>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
          >
            <Ionicons name="close" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.description}>{description}</Text>
        
        {onLearnMore && (
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={onLearnMore}
          >
            <Text style={styles.learnMoreText}>Learn More</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary[500]} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Pointer based on position */}
      {position === 'bottom' && <View style={styles.pointerTop} />}
      {position === 'top' && <View style={styles.pointerBottom} />}
      {position === 'left' && <View style={styles.pointerRight} />}
      {position === 'right' && <View style={styles.pointerLeft} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  content: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing[2],
  },
  dismissButton: {
    padding: spacing[1],
  },
  description: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary[500],
    marginRight: spacing[1],
  },
  pointerTop: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.background.secondary,
  },
  pointerBottom: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.background.secondary,
  },
  pointerLeft: {
    position: 'absolute',
    left: -8,
    top: '50%',
    marginTop: -8,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: colors.background.secondary,
  },
  pointerRight: {
    position: 'absolute',
    right: -8,
    top: '50%',
    marginTop: -8,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.background.secondary,
  },
});

export default TutorialHint;
