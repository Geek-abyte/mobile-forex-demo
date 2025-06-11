import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { useTutorial } from '../../contexts/TutorialContext';

const TutorialDevTools: React.FC = () => {
  const [showDevTools, setShowDevTools] = useState(false);
  const { 
    resetTutorial, 
    startTutorial, 
    progress, 
    goToSection 
  } = useTutorial();

  // Only show in development mode
  if (__DEV__ !== true) {
    return null;
  }

  const handleResetTutorial = () => {
    Alert.alert(
      'Reset Tutorial',
      'This will reset all tutorial progress and show the welcome screen again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetTutorial();
            Alert.alert('Tutorial Reset', 'Tutorial has been reset. You can now test the first-time user experience.');
          },
        },
      ]
    );
  };

  const handleStartTutorial = () => {
    startTutorial();
  };

  const handleShowWelcome = () => {
    resetTutorial();
    setTimeout(() => {
      startTutorial();
    }, 100);
  };

  if (!showDevTools) {
    return (
      <TouchableOpacity
        style={styles.devToggle}
        onPress={() => setShowDevTools(true)}
      >
        <Ionicons name="settings" size={16} color={colors.text.secondary} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.devPanel}>
      <View style={styles.devHeader}>
        <Text style={styles.devTitle}>Tutorial Dev Tools</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowDevTools(false)}
        >
          <Ionicons name="close" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.devContent}>
        <Text style={styles.statusText}>
          Progress: {progress.completedSections.length} sections completed
        </Text>
        <Text style={styles.statusText}>
          Has seen intro: {progress.hasSeenIntro ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.statusText}>
          Tutorial completed: {progress.hasCompletedTutorial ? 'Yes' : 'No'}
        </Text>

        <View style={styles.devActions}>
          <TouchableOpacity
            style={[styles.devButton, styles.primaryButton]}
            onPress={handleShowWelcome}
          >
            <Text style={styles.primaryButtonText}>Show Welcome</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.devButton, styles.secondaryButton]}
            onPress={handleStartTutorial}
          >
            <Text style={styles.secondaryButtonText}>Start Tutorial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.devButton, styles.dangerButton]}
            onPress={handleResetTutorial}
          >
            <Text style={styles.dangerButtonText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Quick Access:</Text>
        <TouchableOpacity
          style={styles.sectionButton}
          onPress={() => goToSection('app_overview')}
        >
          <Text style={styles.sectionButtonText}>App Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sectionButton}
          onPress={() => goToSection('dashboard_tour')}
        >
          <Text style={styles.sectionButtonText}>Dashboard Tour</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sectionButton}
          onPress={() => goToSection('trading_basics')}
        >
          <Text style={styles.sectionButtonText}>Trading Basics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  devToggle: {
    position: 'absolute',
    top: 100,
    left: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
    zIndex: 9999,
  },
  devPanel: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  devTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing[2],
  },
  devContent: {
    padding: spacing[4],
  },
  statusText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  devActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginVertical: spacing[4],
  },
  devButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
  },
  primaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  secondaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  dangerButton: {
    backgroundColor: colors.trading.loss,
  },
  dangerButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: 'white',
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  sectionButton: {
    backgroundColor: colors.background.tertiary,
    padding: spacing[2],
    borderRadius: 6,
    marginBottom: spacing[1],
  },
  sectionButtonText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
});

export default TutorialDevTools;
