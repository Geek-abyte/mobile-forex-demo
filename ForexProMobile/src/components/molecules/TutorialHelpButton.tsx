import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../theme';
import { useTutorial } from '../../contexts/TutorialContext';
import { TUTORIAL_SECTIONS } from '../../constants/tutorialData';

const { width } = Dimensions.get('window');

interface TutorialHelpButtonProps {
  screenName?: string;
  position?: 'floating' | 'header';
  size?: 'small' | 'medium' | 'large';
}

const TutorialHelpButton: React.FC<TutorialHelpButtonProps> = ({
  screenName,
  position = 'floating',
  size = 'medium',
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { goToSection, showTutorialForScreen, progress } = useTutorial();

  const handleOpenTutorial = () => {
    if (screenName) {
      // Provide immediate feedback for screen-specific help
      showTutorialForScreen(screenName);
    } else {
      setShowMenu(true);
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    goToSection(sectionId);
    setShowMenu(false);
  };

  const getSectionProgress = (sectionId: string) => {
    if (progress.completedSections.includes(sectionId)) {
      return 'completed';
    }
    if (progress.currentSection === sectionId) {
      return 'active';
    }
    return 'pending';
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small': return 40;
      case 'large': return 56;
      default: return 48;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 28;
      default: return 24;
    }
  };

  const renderSectionItem = (section: any) => {
    const sectionProgress = getSectionProgress(section.id);
    
    return (
      <TouchableOpacity
        key={section.id}
        style={[
          styles.sectionItem,
          sectionProgress === 'completed' && styles.completedSection,
          sectionProgress === 'active' && styles.activeSection,
        ]}
        onPress={() => handleSectionSelect(section.id)}
      >
        <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
          <Ionicons
            name={section.icon}
            size={24}
            color={section.color}
          />
        </View>
        
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionDescription}>{section.description}</Text>
          <View style={styles.sectionMeta}>
            <Text style={styles.sectionTime}>{section.estimatedTime}</Text>
            {section.isRequired && (
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>Required</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.sectionStatus}>
          {sectionProgress === 'completed' && (
            <Ionicons name="checkmark-circle" size={24} color="#00D4AA" />
          )}
          {sectionProgress === 'active' && (
            <Ionicons name="play-circle" size={24} color={colors.primary[500]} />
          )}
          {sectionProgress === 'pending' && (
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (position === 'floating') {
    return (
      <>
        <TouchableOpacity
          style={[
            styles.floatingButton,
            { width: getButtonSize(), height: getButtonSize() }
          ]}
          onPress={handleOpenTutorial}
        >
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.floatingGradient}
          >
            <Ionicons name="help" size={getIconSize()} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        <Modal
          visible={showMenu}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowMenu(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tutorial Sections</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMenu(false)}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.sectionsContainer}>
              <Text style={styles.sectionsSubtitle}>
                Choose a section to learn about specific features
              </Text>
              
              {TUTORIAL_SECTIONS.map(renderSectionItem)}
            </ScrollView>
          </View>
        </Modal>
      </>
    );
  }

  // Header button style
  return (
    <TouchableOpacity
      style={[
        styles.headerButton,
        { width: getButtonSize(), height: getButtonSize() }
      ]}
      onPress={handleOpenTutorial}
    >
      <Ionicons name="help-circle" size={getIconSize()} color={colors.primary[500]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 1000,
  },
  floatingGradient: {
    flex: 1,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.background.tertiary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing[2],
  },
  sectionsContainer: {
    flex: 1,
    padding: spacing[6],
  },
  sectionsSubtitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    marginBottom: spacing[6],
    lineHeight: 24,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing[4],
    borderRadius: 16,
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.primary,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  sectionDescription: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing[2],
  },
  sectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTime: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginRight: spacing[3],
  },
  requiredBadge: {
    backgroundColor: colors.status.warning,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 8,
  },
  requiredText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: 'white',
  },
  sectionStatus: {
    marginLeft: spacing[3],
  },
});

export default TutorialHelpButton;
