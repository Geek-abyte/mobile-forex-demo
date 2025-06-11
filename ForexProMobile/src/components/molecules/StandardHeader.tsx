import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';

interface StandardHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightActions?: React.ReactNode[];
  variant?: 'standard' | 'centered';
  onBackPress?: () => void;
}

const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  rightActions = [],
  variant = 'standard',
  onBackPress,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const renderBackButton = () => {
    if (!showBackButton) return null;

    return (
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>
    );
  };

  const renderTitle = () => {
    if (variant === 'centered') {
      return (
        <View style={styles.centeredTitleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      );
    }

    return (
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    );
  };

  const renderRightActions = () => {
    if (rightActions.length === 0) {
      return showBackButton ? <View style={styles.placeholder} /> : null;
    }

    return (
      <View style={styles.rightActions}>
        {rightActions.map((action, index) => (
          <View key={index} style={styles.actionItem}>
            {action}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderBackButton()}
      {renderTitle()}
      {renderRightActions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  titleContainer: {
    flex: 1,
  },
  centeredTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionItem: {
    marginLeft: spacing[2],
  },
  placeholder: {
    width: 40,
  },
});

export default StandardHeader;
