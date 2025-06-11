import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AppNavigator from '@/navigation/AppNavigator';
import FloatingNotification from '@/components/organisms/FloatingNotification';
import NotificationIntegration from '@/services/notificationIntegration';
import { notificationManager } from '@/services/notificationManager';
import { useAppSelector } from '@/store/hooks';

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

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

  return (
    <View style={styles.container}>
      <AppNavigator />
      {/* Only show floating notifications when user is authenticated */}
      {isAuthenticated && (
        <FloatingNotification position="top" maxVisible={1} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainApp;
