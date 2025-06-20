import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import FusionMarketsLogo from '../atoms/FusionMarketsLogo';

interface FusionHeaderProps {
  title: string;
  showLogo?: boolean;
  rightActions?: React.ReactNode[];
}

const FusionHeader: React.FC<FusionHeaderProps> = ({
  title,
  showLogo = true,
  rightActions = [],
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showLogo && (
          <FusionMarketsLogo iconOnly width={28} height={28} />
        )}
        <Text style={[styles.title, !showLogo && styles.titleNoLogo]}>
          {title}
        </Text>
      </View>
      
      {rightActions.length > 0 && (
        <View style={styles.rightActions}>
          {rightActions.map((action, index) => (
            <View key={index} style={styles.actionItem}>
              {action}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.primary,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginLeft: spacing[3],
  },
  titleNoLogo: {
    marginLeft: 0,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionItem: {
    marginLeft: spacing[3],
  },
});

export default FusionHeader;
