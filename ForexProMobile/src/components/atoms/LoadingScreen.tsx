import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useColors } from '@/theme';

interface LoadingScreenProps {
  size?: 'small' | 'large';
  color?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  size = 'large', 
  color 
}) => {
  const colors = useColors();
  
  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color={color || colors.primary[500]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E17', // Using theme background color directly for now
  },
});

export default LoadingScreen;
