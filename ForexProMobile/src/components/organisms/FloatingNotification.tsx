import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';
import NotificationBanner from '@/components/molecules/NotificationBanner';
import { colors, typography, spacing } from '@/theme';

const { width: screenWidth } = Dimensions.get('window');

interface FloatingNotificationProps {
  maxVisible?: number;
  position?: 'top' | 'bottom';
  offset?: number;
}

const FloatingNotification: React.FC<FloatingNotificationProps> = ({
  maxVisible = 3,
  position = 'top',
  offset = 60,
}) => {
  const { notifications, markNotificationAsRead, removeNotificationById } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  const [animatedValues] = useState(() => new Map<string, Animated.Value>());

  useEffect(() => {
    // Show only unread notifications that should be displayed as floating
    const unreadNotifications = notifications
      .filter(n => !n.isRead && !n.persistent)
      .slice(0, maxVisible);
    
    setVisibleNotifications(unreadNotifications);

    // Clean up animation values for removed notifications
    const currentIds = new Set(unreadNotifications.map(n => n.id));
    for (const [id, value] of animatedValues.entries()) {
      if (!currentIds.has(id)) {
        animatedValues.delete(id);
      }
    }

    // Initialize animation values for new notifications
    unreadNotifications.forEach(notification => {
      if (!animatedValues.has(notification.id)) {
        animatedValues.set(notification.id, new Animated.Value(0));
      }
    });
  }, [notifications, maxVisible]);

  const handleNotificationPress = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    
    // Handle navigation if specified
    if (notification.actionType === 'navigate' && notification.actionTarget) {
      console.log('Navigate to:', notification.actionTarget);
    }
  };

  const handleDismiss = (notificationId: string) => {
    // Only mark as read, don't remove from store
    // This allows the notification to remain in the notification center
    markNotificationAsRead(notificationId);
  };

  const getContainerStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      left: 0,
      right: 0,
      zIndex: 1000,
    };

    if (position === 'top') {
      return {
        ...baseStyle,
        top: offset,
      };
    } else {
      return {
        ...baseStyle,
        bottom: offset,
      };
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <View style={getContainerStyle()}>
      {visibleNotifications.map((notification, index) => (
        <NotificationBanner
          key={notification.id}
          notification={notification}
          onPress={() => handleNotificationPress(notification)}
          onDismiss={() => handleDismiss(notification.id)}
          animated={true}
        />
      ))}
    </View>
  );
};

export default FloatingNotification;
