import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TutorialProgress, TutorialSection } from '../types/tutorial';
import { TUTORIAL_SECTIONS } from '../constants/tutorialData';

interface TutorialContextType {
  progress: TutorialProgress;
  isFirstLaunch: boolean;
  showTutorial: boolean;
  currentSection: TutorialSection | null;
  currentStepIndex: number;
  startTutorial: () => void;
  skipTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToSection: (sectionId: string) => void;
  markSectionComplete: (sectionId: string) => void;
  markStepComplete: (stepId: string) => void;
  resetTutorial: () => void;
  hideTutorial: () => void;
  showTutorialForScreen: (screenName: string) => void;
}

const defaultProgress: TutorialProgress = {
  currentSection: null,
  currentStep: 0,
  completedSections: [],
  completedSteps: [],
  hasSeenIntro: false,
  hasCompletedTutorial: false,
  lastActiveDate: new Date().toISOString(),
};

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const TUTORIAL_STORAGE_KEY = '@forex_tutorial_progress';
const FIRST_LAUNCH_KEY = '@forex_first_launch';

interface TutorialProviderProps {
  children: ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [progress, setProgress] = useState<TutorialProgress>(defaultProgress);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentSection, setCurrentSection] = useState<TutorialSection | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    loadTutorialState();
  }, []);

  const loadTutorialState = async () => {
    try {
      // Check if it's first launch
      const hasLaunchedBefore = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
      const isFirst = !hasLaunchedBefore;
      setIsFirstLaunch(isFirst);

      // Load tutorial progress
      const savedProgress = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        setProgress(parsedProgress);

        // If there's an active section, restore it
        if (parsedProgress.currentSection) {
          const section = TUTORIAL_SECTIONS.find(s => s.id === parsedProgress.currentSection);
          if (section) {
            setCurrentSection(section);
            setCurrentStepIndex(parsedProgress.currentStep);
          }
        }
      }

      // Show tutorial if it's first launch and tutorial hasn't been completed
      if (isFirst && (!savedProgress || !JSON.parse(savedProgress || '{}').hasCompletedTutorial)) {
        setShowTutorial(true);
        startTutorial();
      }

      // Mark as launched
      if (isFirst) {
        await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
      }
    } catch (error) {
      console.error('Error loading tutorial state:', error);
    }
  };

  const saveProgress = async (newProgress: TutorialProgress) => {
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Error saving tutorial progress:', error);
    }
  };

  const startTutorial = () => {
    const firstSection = TUTORIAL_SECTIONS.find(s => s.isRequired) || TUTORIAL_SECTIONS[0];
    setCurrentSection(firstSection);
    setCurrentStepIndex(0);
    setShowTutorial(true);

    const newProgress = {
      ...progress,
      currentSection: firstSection.id,
      currentStep: 0,
      hasSeenIntro: true,
      lastActiveDate: new Date().toISOString(),
    };
    saveProgress(newProgress);
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    const newProgress = {
      ...progress,
      hasSeenIntro: true,
      hasCompletedTutorial: true,
      currentSection: null,
      lastActiveDate: new Date().toISOString(),
    };
    saveProgress(newProgress);
  };

  const nextStep = () => {
    if (!currentSection) return;

    const nextStepIndex = currentStepIndex + 1;
    
    if (nextStepIndex < currentSection.steps.length) {
      // Move to next step in current section
      setCurrentStepIndex(nextStepIndex);
      const newProgress = {
        ...progress,
        currentStep: nextStepIndex,
        completedSteps: [...progress.completedSteps, currentSection.steps[currentStepIndex].id],
        lastActiveDate: new Date().toISOString(),
      };
      saveProgress(newProgress);
    } else {
      // Section completed, move to next section
      markSectionComplete(currentSection.id);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      const newStepIndex = currentStepIndex - 1;
      setCurrentStepIndex(newStepIndex);
      const newProgress = {
        ...progress,
        currentStep: newStepIndex,
        lastActiveDate: new Date().toISOString(),
      };
      saveProgress(newProgress);
    }
  };

  const goToSection = (sectionId: string) => {
    const section = TUTORIAL_SECTIONS.find(s => s.id === sectionId);
    if (section) {
      setCurrentSection(section);
      setCurrentStepIndex(0);
      setShowTutorial(true);
      
      const newProgress = {
        ...progress,
        currentSection: sectionId,
        currentStep: 0,
        lastActiveDate: new Date().toISOString(),
      };
      saveProgress(newProgress);
    }
  };

  const markSectionComplete = (sectionId: string) => {
    const completedSections = [...progress.completedSections];
    if (!completedSections.includes(sectionId)) {
      completedSections.push(sectionId);
    }

    // Find next required section
    const nextSection = TUTORIAL_SECTIONS.find(
      s => s.isRequired && !completedSections.includes(s.id)
    );

    if (nextSection) {
      // Move to next required section
      setCurrentSection(nextSection);
      setCurrentStepIndex(0);
      const newProgress = {
        ...progress,
        completedSections,
        currentSection: nextSection.id,
        currentStep: 0,
        lastActiveDate: new Date().toISOString(),
      };
      saveProgress(newProgress);
    } else {
      // All required sections completed
      const allRequired = TUTORIAL_SECTIONS.filter(s => s.isRequired);
      const allCompleted = allRequired.every(s => completedSections.includes(s.id));
      
      if (allCompleted) {
        setShowTutorial(false);
        setCurrentSection(null);
        const newProgress = {
          ...progress,
          completedSections,
          hasCompletedTutorial: true,
          currentSection: null,
          lastActiveDate: new Date().toISOString(),
        };
        saveProgress(newProgress);
      }
    }
  };

  const markStepComplete = (stepId: string) => {
    if (!progress.completedSteps.includes(stepId)) {
      const newProgress = {
        ...progress,
        completedSteps: [...progress.completedSteps, stepId],
        lastActiveDate: new Date().toISOString(),
      };
      saveProgress(newProgress);
    }
  };

  const resetTutorial = () => {
    setProgress(defaultProgress);
    setCurrentSection(null);
    setCurrentStepIndex(0);
    setShowTutorial(false);
    AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY);
  };

  const hideTutorial = () => {
    setShowTutorial(false);
  };

  const showTutorialForScreen = (screenName: string) => {
    // Map screen names to section IDs
    const screenToSectionMap: { [key: string]: string } = {
      'Dashboard': 'key_features',
      'Market': 'key_features', 
      'Trading': 'key_features',
      'Wallet': 'wallet_management',
      'P2P': 'p2p_trading',
      'Analytics': 'analytics_insights'
    };

    const sectionId = screenToSectionMap[screenName];
    if (sectionId) {
      const section = TUTORIAL_SECTIONS.find(s => s.id === sectionId);
      if (section) {
        // Find the specific step for this screen within the section
        const screenStepIndex = section.steps.findIndex(step => 
          step.targetScreen === screenName
        );
        
        if (screenStepIndex >= 0) {
          // Start tutorial at the specific step for this screen
          setCurrentSection(section);
          setCurrentStepIndex(screenStepIndex);
          setShowTutorial(true);
          
          const newProgress = {
            ...progress,
            currentSection: section.id,
            currentStep: screenStepIndex,
            hasSeenIntro: true,
            lastActiveDate: new Date().toISOString(),
          };
          saveProgress(newProgress);
        } else {
          // If no specific step, start from beginning of section
          goToSection(sectionId);
        }
      }
    } else {
      // If no specific section, show the general quick start
      goToSection('quick_start');
    }
  };

  const value: TutorialContextType = {
    progress,
    isFirstLaunch,
    showTutorial,
    currentSection,
    currentStepIndex,
    startTutorial,
    skipTutorial,
    nextStep,
    previousStep,
    goToSection,
    markSectionComplete,
    markStepComplete,
    resetTutorial,
    hideTutorial,
    showTutorialForScreen,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = (): TutorialContextType => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
