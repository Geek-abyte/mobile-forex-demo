// Shadow system for depth and elevation
export const shadows = {
  // Elevation levels
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Small elevation (cards, buttons)
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },

  // Medium elevation (modals, dropdowns)
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Large elevation (overlays, floating elements)
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },

  // Extra large elevation (main modals, drawers)
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },

  // Maximum elevation (tooltips, popups)
  '2xl': {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 13.16,
    elevation: 20,
  },

  // Component specific shadows
  components: {
    // Trading cards with subtle glow
    tradingCard: {
      shadowColor: '#F7931A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    // Profit/loss indicators
    profitGlow: {
      shadowColor: '#00D4AA',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 0,
    },

    lossGlow: {
      shadowColor: '#FF4757',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 0,
    },

    // Floating action button
    fab: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 16,
    },

    // Bottom sheet
    bottomSheet: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 8,
    },

    // Header/navigation
    header: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 4,
    },

    // Input focus state
    inputFocus: {
      shadowColor: '#F7931A',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 0,
    },

    // Button press state
    buttonPressed: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1,
      elevation: 1,
    },
  },

  // Inner shadows (for pressed states, insets)
  inner: {
    sm: {
      // Note: React Native doesn't support inner shadows natively
      // These would need to be implemented with custom components
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: -0.1,
      shadowRadius: 1,
      elevation: 0,
    },
  },
} as const;

export type Shadows = typeof shadows;
