import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AppNavigator from '@/navigation/AppNavigator';
import FloatingNotification from '@/components/organisms/FloatingNotification';
import TutorialManager from '@/components/organisms/TutorialManager';
import TutorialDevTools from '@/components/molecules/TutorialDevTools';
import { TutorialProvider } from '@/contexts/TutorialContext';
import NotificationIntegration from '@/services/notificationIntegration';
import { notificationManager } from '@/services/notificationManager';
import { useAppSelector } from '@/store/hooks';
import SplashScreen from '@/components/SplashScreen';

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [showSplash, setShowSplash] = useState(true);

  // Initialize notification manager once on app start
  useEffect(() => {
    notificationManager.initialize();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isAuthenticated) {
      // Start notification simulation only when user is logged in
      timer = setTimeout(() => {
        NotificationIntegration.startDemoNotifications();
      }, 3000); // Start after 3 seconds of being logged in
    } else {
      // Stop notifications when user is not logged in
      NotificationIntegration.stopDemoNotifications();
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      // Clean up simulations when authentication state changes
      NotificationIntegration.stopDemoNotifications();
    };
  }, [isAuthenticated]); // React to authentication state changes

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Render splash screen or main app based on state
  return (
    <>
      {showSplash ? (
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      ) : (
        <TutorialProvider>
          <View style={styles.container}>
            <AppNavigator />
            {/* Only show floating notifications when user is authenticated */}
            {isAuthenticated && (
              <FloatingNotification position="top" maxVisible={1} />
            )}
            {/* Tutorial system - only shows when authenticated */}
            {isAuthenticated && <TutorialManager />}
            {/* Development tools for testing tutorial */}
            {isAuthenticated && <TutorialDevTools />}
          </View>
        </TutorialProvider>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainApp;
