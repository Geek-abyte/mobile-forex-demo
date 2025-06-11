import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../theme';
import { useTutorial } from '../../contexts/TutorialContext';
import { TUTORIAL_SECTIONS } from '../../constants/tutorialData';

const TutorialProgress: React.FC = () => {
  const { progress, goToSection, startTutorial } = useTutorial();

  const completedCount = progress.completedSections.length;
  const totalCount = TUTORIAL_SECTIONS.length;
  const progressPercent = (completedCount / totalCount) * 100;

  const getSectionStatus = (sectionId: string) => {
    if (progress.completedSections.includes(sectionId)) {
      return 'completed';
    }
    if (progress.currentSection === sectionId) {
      return 'active';
    }
    return 'pending';
  };

  const renderSectionItem = (section: any) => {
    const status = getSectionStatus(section.id);
    
    return (
      <TouchableOpacity
        key={section.id}
        style={[
          styles.sectionItem,
          status === 'completed' && styles.completedSection,
          status === 'active' && styles.activeSection,
        ]}
        onPress={() => goToSection(section.id)}
      >
        <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
          <Ionicons
            name={section.icon}
            size={20}
            color={section.color}
          />
        </View>
        
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionTime}>{section.estimatedTime}</Text>
        </View>
        
        <View style={styles.sectionStatus}>
          {status === 'completed' && (
            <Ionicons name="checkmark-circle" size={20} color="#00D4AA" />
          )}
          {status === 'active' && (
            <Ionicons name="play-circle" size={20} color={colors.primary[500]} />
          )}
          {status === 'pending' && (
            <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tutorial Progress</Text>
        <Text style={styles.subtitle}>
          Master forex trading with our guided tutorials
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {completedCount} of {totalCount} sections completed
          </Text>
          <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
        </View>
        
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#00D4AA', '#00A085']}
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
        
        {!progress.hasCompletedTutorial && (
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={startTutorial}
          >
            <MaterialIcons name="play-arrow" size={20} color="white" />
            <Text style={styles.continueButtonText}>
              {progress.hasSeenIntro ? 'Continue Tutorial' : 'Start Tutorial'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sections List */}
      <View style={styles.sectionsList}>
        <Text style={styles.sectionsTitle}>Tutorial Sections</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {TUTORIAL_SECTIONS.map(renderSectionItem)}
        </ScrollView>
      </View>

      {progress.hasCompletedTutorial && (
        <View style={styles.completionBadge}>
          <LinearGradient
            colors={['#00D4AA', '#00A085']}
            style={styles.completionGradient}
          >
            <Ionicons name="trophy" size={24} color="white" />
            <Text style={styles.completionText}>Tutorial Completed!</Text>
            <Text style={styles.completionSubtext}>
              You're ready to explore all features
            </Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: spacing[5],
    marginBottom: spacing[4],
  },
  header: {
    marginBottom: spacing[5],
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: spacing[6],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  progressText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  progressPercent: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing[4],
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: 'white',
    marginLeft: spacing[2],
  },
  sectionsList: {
    flex: 1,
    maxHeight: 300,
  },
  sectionsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing[3],
    borderRadius: 12,
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  completedSection: {
    borderColor: '#00D4AA',
    backgroundColor: '#00D4AA10',
  },
  activeSection: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500] + '10',
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  sectionTime: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
  },
  sectionStatus: {
    marginLeft: spacing[2],
  },
  completionBadge: {
    marginTop: spacing[4],
    borderRadius: 16,
    overflow: 'hidden',
  },
  completionGradient: {
    padding: spacing[4],
    alignItems: 'center',
  },
  completionText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: 'white',
    marginTop: spacing[2],
    marginBottom: spacing[1],
  },
  completionSubtext: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});

export default TutorialProgress;
