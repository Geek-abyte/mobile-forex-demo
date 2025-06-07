// Typography system for professional trading app
export const typography = {
  // Font families
  fonts: {
    primary: 'System', // Default system font
    monospace: 'Courier New', // For numbers, prices, etc.
    display: 'System', // For headings
  },

  // Font weights
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  // Line heights
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },

  // Text styles for common use cases
  styles: {
    // Headings
    h1: {
      fontSize: 36,
      lineHeight: 1.25,
      fontWeight: '700' as const,
      letterSpacing: -0.025,
    },
    h2: {
      fontSize: 30,
      lineHeight: 1.25,
      fontWeight: '600' as const,
      letterSpacing: -0.025,
    },
    h3: {
      fontSize: 24,
      lineHeight: 1.375,
      fontWeight: '600' as const,
    },
    h4: {
      fontSize: 20,
      lineHeight: 1.375,
      fontWeight: '600' as const,
    },
    h5: {
      fontSize: 18,
      lineHeight: 1.375,
      fontWeight: '500' as const,
    },
    h6: {
      fontSize: 16,
      lineHeight: 1.375,
      fontWeight: '500' as const,
    },

    // Body text
    body: {
      fontSize: 16,
      lineHeight: 1.5,
      fontWeight: '400' as const,
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 1.5,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 12,
      lineHeight: 1.5,
      fontWeight: '400' as const,
    },

    // Trading specific
    price: {
      fontSize: 18,
      lineHeight: 1.25,
      fontWeight: '600' as const,
      fontFamily: 'Courier New',
      letterSpacing: 0.025,
    },
    priceSmall: {
      fontSize: 14,
      lineHeight: 1.25,
      fontWeight: '500' as const,
      fontFamily: 'Courier New',
      letterSpacing: 0.025,
    },
    percentage: {
      fontSize: 16,
      lineHeight: 1.25,
      fontWeight: '600' as const,
      fontFamily: 'Courier New',
    },

    // Buttons
    buttonLarge: {
      fontSize: 18,
      lineHeight: 1.25,
      fontWeight: '600' as const,
      letterSpacing: 0.025,
    },
    button: {
      fontSize: 16,
      lineHeight: 1.25,
      fontWeight: '500' as const,
      letterSpacing: 0.025,
    },
    buttonSmall: {
      fontSize: 14,
      lineHeight: 1.25,
      fontWeight: '500' as const,
      letterSpacing: 0.025,
    },

    // Labels and inputs
    label: {
      fontSize: 14,
      lineHeight: 1.375,
      fontWeight: '500' as const,
    },
    input: {
      fontSize: 16,
      lineHeight: 1.5,
      fontWeight: '400' as const,
    },
    placeholder: {
      fontSize: 16,
      lineHeight: 1.5,
      fontWeight: '400' as const,
    },

    // Special text
    overline: {
      fontSize: 12,
      lineHeight: 1.25,
      fontWeight: '600' as const,
      letterSpacing: 0.1,
      textTransform: 'uppercase' as const,
    },
    link: {
      fontSize: 16,
      lineHeight: 1.5,
      fontWeight: '500' as const,
      textDecorationLine: 'underline' as const,
    },
  },
} as const;

export type Typography = typeof typography;
