import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationCenter from '@/components/organisms/NotificationCenter';
import { colors, spacing } from '@/theme';

interface NotificationBellProps {
  size?: number;
  color?: string;
  showBadge?: boolean;
  onPress?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  size = 24,
  color = colors.text.primary,
  showBadge = true,
  onPress,
}) => {
  const { unreadCount } = useNotifications();
  const [showModal, setShowModal] = useState(false);
  const [bellAnimation] = useState(new Animated.Value(0));

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setShowModal(true);
    }

    // Animate bell shake if there are unread notifications
    if (unreadCount > 0) {
      Animated.sequence([
        Animated.timing(bellAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellAnimation, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const bellRotation = bellAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'],
  });

  const getBadgeCount = () => {
    if (unreadCount > 99) return '99+';
    return unreadCount.toString();
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ rotate: bellRotation }] },
          ]}
        >
          <Icon
            name={unreadCount > 0 ? 'notifications' : 'notifications-none'}
            size={size}
            color={color}
          />
        </Animated.View>
        
        {showBadge && unreadCount > 0 && (
          <View style={styles.badge}>
            <View style={styles.badgeContent}>
              {unreadCount <= 99 && (
                <View style={styles.badgeText}>
                  <Icon
                    name="circle"
                    size={Math.min(16, Math.max(8, unreadCount.toString().length * 6))}
                    color={colors.status.error}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <NotificationCenter onClose={handleCloseModal} />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: spacing[2],
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: spacing[1],
    right: spacing[1],
    minWidth: 16,
    minHeight: 16,
    borderRadius: 8,
    backgroundColor: colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  badgeContent: {
    paddingHorizontal: 2,
  },
  badgeText: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NotificationBell;
