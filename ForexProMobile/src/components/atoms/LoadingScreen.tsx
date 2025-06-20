import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useColors } from '@/theme';
import FusionMarketsLogo from './FusionMarketsLogo';

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
      <FusionMarketsLogo width={120} height={50} />
      <ActivityIndicator 
        size={size} 
        color={color || colors.primary[500]} 
        style={styles.spinner}
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
  spinner: {
    marginTop: 20,
  },
});

export default LoadingScreen;
