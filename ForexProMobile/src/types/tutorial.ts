export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetScreen?: string;
  targetElement?: string;
  position: 'top' | 'bottom' | 'center' | 'left' | 'right';
  icon?: string;
  action?: 'tap' | 'swipe' | 'scroll' | 'none';
  actionDescription?: string;
}

export interface TutorialSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  estimatedTime: string;
  steps: TutorialStep[];
  isRequired: boolean;
}

export interface TutorialProgress {
  currentSection: string | null;
  currentStep: number;
  completedSections: string[];
  completedSteps: string[];
  hasSeenIntro: boolean;
  hasCompletedTutorial: boolean;
  lastActiveDate: string;
}

export interface FeatureHighlight {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetScreen: string;
  importance: 'high' | 'medium' | 'low';
}

export interface AppOverview {
  title: string;
  description: string;
  keyFeatures: FeatureHighlight[];
  gettingStartedSteps: string[];
  safetyNote: string;
}
