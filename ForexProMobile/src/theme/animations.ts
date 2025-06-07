// Animation system for smooth interactions
export const animations = {
  // Timing functions (easing curves)
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    
    // Custom cubic bezier curves
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    swift: 'cubic-bezier(0.4, 0, 0.6, 1)',
    
    // Trading specific
    priceChange: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    chartUpdate: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Duration values (in milliseconds)
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
    slowest: 750,
    
    // Specific use cases
    micro: 100,    // Hover effects, small state changes
    quick: 200,    // Button presses, simple transitions
    moderate: 300, // Modal appearances, tab switches
    lengthy: 600,  // Page transitions, major state changes
    extended: 1000, // Loading animations, complex sequences
  },

  // Pre-configured animations
  presets: {
    // Fade animations
    fadeIn: {
      duration: 250,
      easing: 'ease-out',
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeOut: {
      duration: 200,
      easing: 'ease-in',
      from: { opacity: 1 },
      to: { opacity: 0 },
    },

    // Scale animations
    scaleIn: {
      duration: 250,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      from: { opacity: 0, transform: [{ scale: 0.8 }] },
      to: { opacity: 1, transform: [{ scale: 1 }] },
    },
    scaleOut: {
      duration: 200,
      easing: 'ease-in',
      from: { opacity: 1, transform: [{ scale: 1 }] },
      to: { opacity: 0, transform: [{ scale: 0.8 }] },
    },

    // Slide animations
    slideInUp: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      from: { opacity: 0, transform: [{ translateY: 20 }] },
      to: { opacity: 1, transform: [{ translateY: 0 }] },
    },
    slideInDown: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      from: { opacity: 0, transform: [{ translateY: -20 }] },
      to: { opacity: 1, transform: [{ translateY: 0 }] },
    },
    slideInLeft: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      from: { opacity: 0, transform: [{ translateX: -20 }] },
      to: { opacity: 1, transform: [{ translateX: 0 }] },
    },
    slideInRight: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      from: { opacity: 0, transform: [{ translateX: 20 }] },
      to: { opacity: 1, transform: [{ translateX: 0 }] },
    },

    // Button animations
    buttonPress: {
      duration: 100,
      easing: 'ease-out',
      from: { transform: [{ scale: 1 }] },
      to: { transform: [{ scale: 0.95 }] },
    },
    buttonRelease: {
      duration: 150,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      from: { transform: [{ scale: 0.95 }] },
      to: { transform: [{ scale: 1 }] },
    },

    // Trading specific animations
    priceIncrease: {
      duration: 300,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      from: { color: '#FFFFFF' },
      to: { color: '#00D4AA' },
    },
    priceDecrease: {
      duration: 300,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      from: { color: '#FFFFFF' },
      to: { color: '#FF4757' },
    },
    priceFlash: {
      duration: 150,
      easing: 'ease-in-out',
      sequence: [
        { backgroundColor: '#F7931A', opacity: 0.3 },
        { backgroundColor: 'transparent', opacity: 0 },
      ],
    },

    // Loading animations
    pulse: {
      duration: 1000,
      easing: 'ease-in-out',
      repeat: true,
      from: { opacity: 0.6 },
      to: { opacity: 1 },
    },
    spin: {
      duration: 1000,
      easing: 'linear',
      repeat: true,
      from: { transform: [{ rotate: '0deg' }] },
      to: { transform: [{ rotate: '360deg' }] },
    },

    // Modal animations
    modalSlideUp: {
      duration: 400,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      from: { 
        opacity: 0, 
        transform: [{ translateY: 100 }, { scale: 0.9 }] 
      },
      to: { 
        opacity: 1, 
        transform: [{ translateY: 0 }, { scale: 1 }] 
      },
    },
    modalSlideDown: {
      duration: 300,
      easing: 'ease-in',
      from: { 
        opacity: 1, 
        transform: [{ translateY: 0 }, { scale: 1 }] 
      },
      to: { 
        opacity: 0, 
        transform: [{ translateY: 100 }, { scale: 0.9 }] 
      },
    },
  },

  // Spring configurations for React Native Reanimated
  springs: {
    gentle: {
      damping: 20,
      stiffness: 90,
      mass: 1,
    },
    moderate: {
      damping: 15,
      stiffness: 120,
      mass: 1,
    },
    bouncy: {
      damping: 10,
      stiffness: 100,
      mass: 1,
    },
    sharp: {
      damping: 30,
      stiffness: 200,
      mass: 1,
    },
  },

  // Layout transition configurations
  layout: {
    fast: {
      duration: 200,
      type: 'timing',
      easing: 'ease-out',
    },
    normal: {
      duration: 300,
      type: 'timing',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    slow: {
      duration: 500,
      type: 'timing',
      easing: 'ease-in-out',
    },
  },
} as const;

export type Animations = typeof animations;
