import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Notification } from '@/types/notification';
import { colors, typography, spacing } from '@/theme';

interface NotificationBannerProps {
  notification: Notification;
  onPress?: () => void;
  onDismiss?: () => void;
  animated?: boolean;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onPress,
  onDismiss,
  animated = true,
}) => {
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleDismiss = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (animated) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss?.();
      });
    } else {
      onDismiss?.();
    }
  }, [animated, slideAnim, opacityAnim, onDismiss]);

  React.useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after timeout if specified
      if (notification.autoRemove && notification.timeout) {
        timeoutRef.current = setTimeout(() => {
          handleDismiss();
        }, notification.timeout);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [animated, slideAnim, opacityAnim, notification.autoRemove, notification.timeout, handleDismiss]);

  const getPriorityStyle = () => {
    switch (notification.priority) {
      case 'critical':
        return {
          backgroundColor: '#3D1B1F', // Completely solid dark red
          borderColor: colors.status.error,
          borderWidth: 2,
        };
      case 'high':
        return {
          backgroundColor: '#3D2B1A', // Completely solid dark orange
          borderColor: colors.status.warning,
          borderWidth: 2,
        };
      case 'medium':
        return {
          backgroundColor: '#1F2B3D', // Completely solid dark blue
          borderColor: colors.status.info,
          borderWidth: 2,
        };
      case 'low':
      default:
        return {
          backgroundColor: '#2A3441', // Completely solid dark gray - no transparency
          borderColor: colors.border.subtle,
          borderWidth: 1,
        };
    }
  };

  const getIconColor = () => {
    if (notification.color) return notification.color;
    
    switch (notification.priority) {
      case 'critical':
        return colors.status.error;
      case 'high':
        return colors.status.warning;
      case 'medium':
        return colors.status.info;
      case 'low':
      default:
        return colors.text.secondary;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const animatedStyle = animated
    ? {
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }
    : {};

  return (
    <Animated.View 
      style={[
        styles.container, 
        getPriorityStyle(), 
        animatedStyle
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Icon
            name={notification.icon || 'notifications'}
            size={24}
            color={getIconColor()}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(notification.timestamp)}
          </Text>
        </View>

        {!notification.isRead && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dismissButton}
        onPress={handleDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="close" size={20} color={colors.text.tertiary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: spacing[4],
    marginVertical: spacing[2],
    padding: spacing[4],
    borderRadius: 12,
    backgroundColor: '#2A3441', // Completely solid, no transparency
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  message: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing[1],
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
  },
  dismissButton: {
    padding: spacing[1],
    marginLeft: spacing[2],
  },
});

export default NotificationBanner;
