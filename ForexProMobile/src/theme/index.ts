import React, { createContext, useContext } from 'react';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { animations } from './animations';

import type { ColorPalette } from './colors';
import type { Typography } from './typography';
import type { Spacing } from './spacing';
import type { Shadows } from './shadows';
import type { Animations } from './animations';

// Main theme interface
export interface Theme {
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  shadows: Shadows;
  animations: Animations;
}

// Create the theme object
export const theme: Theme = {
  colors,
  typography,
  spacing,
  shadows,
  animations,
} as const;

// Theme context
const ThemeContext = createContext<Theme>(theme);

// Theme provider component
interface ThemeProviderProps {
  children: React.ReactNode;
  customTheme?: Partial<Theme>;
}

export const ThemeProvider = ({ children, customTheme }: ThemeProviderProps) => {
  const mergedTheme = customTheme 
    ? { ...theme, ...customTheme } 
    : theme;

  return React.createElement(
    ThemeContext.Provider,
    { value: mergedTheme },
    children
  );
};

// Hook to use theme
export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hooks for specific theme parts
export const useColors = () => useTheme().colors;
export const useTypography = () => useTheme().typography;
export const useSpacing = () => useTheme().spacing;
export const useShadows = () => useTheme().shadows;
export const useThemeAnimations = () => useTheme().animations;

// Export everything
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './animations';

export default theme;
