// Spacing system for consistent layout
export const spacing = {
  // Base unit: 4px
  // Following 8pt grid system for mobile design
  
  // Basic spacing scale
  0: 0,
  1: 4,    // 4px
  2: 8,    // 8px
  3: 12,   // 12px
  4: 16,   // 16px
  5: 20,   // 20px
  6: 24,   // 24px
  7: 28,   // 28px
  8: 32,   // 32px
  9: 36,   // 36px
  10: 40,  // 40px
  12: 48,  // 48px
  14: 56,  // 56px
  16: 64,  // 64px
  20: 80,  // 80px
  24: 96,  // 96px
  28: 112, // 112px
  32: 128, // 128px
  36: 144, // 144px
  40: 160, // 160px
  44: 176, // 176px
  48: 192, // 192px
  52: 208, // 208px
  56: 224, // 224px
  60: 240, // 240px
  64: 256, // 256px
  72: 288, // 288px
  80: 320, // 320px
  96: 384, // 384px

  // Semantic spacing for common use cases
  semantic: {
    // Container padding
    containerPadding: 16,
    containerPaddingLarge: 24,
    
    // Card spacing
    cardPadding: 16,
    cardPaddingLarge: 20,
    cardGap: 12,
    
    // List spacing
    listItemSpacing: 12,
    listSectionSpacing: 20,
    
    // Button spacing
    buttonPadding: 16,
    buttonPaddingSmall: 12,
    buttonPaddingLarge: 20,
    buttonGap: 8,
    
    // Input spacing
    inputPadding: 16,
    inputVerticalPadding: 12,
    inputGap: 8,
    
    // Navigation spacing
    tabBarHeight: 60,
    headerHeight: 56,
    
    // Modal spacing
    modalPadding: 20,
    modalMargin: 20,
    
    // Form spacing
    formFieldSpacing: 16,
    formSectionSpacing: 24,
    
    // Trading specific
    tradingCardSpacing: 12,
    priceRowSpacing: 8,
    chartPadding: 16,
  },

  // Component specific spacing
  components: {
    button: {
      horizontal: 16,
      vertical: 12,
      gap: 8,
    },
    card: {
      padding: 16,
      gap: 12,
      margin: 8,
    },
    list: {
      itemPadding: 16,
      itemGap: 8,
      sectionGap: 20,
    },
    input: {
      padding: 16,
      verticalPadding: 12,
      gap: 8,
    },
    modal: {
      padding: 20,
      margin: 20,
      gap: 16,
    },
    trading: {
      cardPadding: 12,
      priceGap: 4,
      buttonGap: 8,
      sectionGap: 16,
    },
  },

  // Border radius values
  radius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  // Common border radius use cases
  radiusSemantics: {
    button: 8,
    card: 12,
    input: 8,
    modal: 16,
    avatar: 9999,
    badge: 16,
    tab: 8,
  },
} as const;

export type Spacing = typeof spacing;
