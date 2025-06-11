import React from 'react';
import { useTutorial } from '../../contexts/TutorialContext';
import WelcomeTutorial from './WelcomeTutorial';
import TutorialOverlay from './TutorialOverlay';

const TutorialManager: React.FC = () => {
  const {
    progress,
    isFirstLaunch,
    showTutorial,
    currentSection,
    currentStepIndex,
    startTutorial,
    skipTutorial,
    nextStep,
    previousStep,
    hideTutorial,
  } = useTutorial();

  // Show welcome screen if it's first launch and user hasn't seen intro
  if (isFirstLaunch && !progress.hasSeenIntro) {
    return (
      <WelcomeTutorial
        visible={true}
        onStart={startTutorial}
        onSkip={skipTutorial}
      />
    );
  }

  // Show tutorial overlay if tutorial is active
  if (showTutorial && currentSection) {
    const currentStep = currentSection.steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === currentSection.steps.length - 1;

    return (
      <TutorialOverlay
        visible={true}
        step={currentStep}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={skipTutorial}
        onClose={hideTutorial}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        currentStepNumber={currentStepIndex + 1}
        totalSteps={currentSection.steps.length}
      />
    );
  }

  return null;
};

export default TutorialManager;
