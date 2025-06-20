// Fusion Markets inspired color palette for professional trading app
export const colors = {
  // Primary brand colors - harmonizing with logo purple gradients
  primary: {
    500: '#6A4AE6', // Main purple - harmonizes with logo
    400: '#8B67EC',
    300: '#A685F2',
    200: '#C2A3F8',
    100: '#E3D1FD',
  },

  // Secondary accent colors - complementary to purple
  secondary: {
    500: '#00D4AA', // Profit green - maintains trading convention
    400: '#33DCBB',
    300: '#66E5CC',
    200: '#99EDDD',
    100: '#CCF6EE',
  },

  // Logo-inspired gradient colors for special uses
  logo: {
    primary: '#5B17B7',   // Logo primary purple
    secondary: '#982BDC', // Logo secondary purple
    tertiary: '#3922B4',  // Logo tertiary purple
    accent: '#B64AE3',    // Logo accent purple
  },

  // Background colors - darker with purple undertones
  background: {
    primary: '#0B0D1A',   // Deep dark with purple hint
    secondary: '#141729', // Slightly lighter with purple
    tertiary: '#1D1F35',  // Card/component background
    elevated: '#252842',  // Modal/elevated surfaces
  },

  // Text colors
  text: {
    primary: '#FFFFFF',   // Primary white text
    secondary: '#B7BDC6', // Secondary gray text
    tertiary: '#6B7280',  // Muted text
    inverse: '#0A0E17',   // Dark text on light backgrounds
  },

  // Trading specific colors
  trading: {
    profit: '#00D4AA',    // Green for profits/gains
    loss: '#FF4757',      // Red for losses
    warning: '#FFA726',   // Orange for warnings
    neutral: '#6B7280',   // Gray for neutral states
  },

  // Status colors
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },

  // Border colors
  border: {
    primary: '#252B3B',
    secondary: '#1E2330',
    accent: '#F7931A',
    subtle: '#374151',
  },

  // Chart colors
  chart: {
    bullish: '#00D4AA',   // Green candle
    bearish: '#FF4757',   // Red candle
    volume: '#6B7280',    // Volume bars
    grid: '#252B3B',      // Chart grid lines
    axis: '#6B7280',      // Axis text/lines
  },

  // Overlay colors
  overlay: {
    backdrop: 'rgba(10, 14, 23, 0.8)',
    card: 'rgba(37, 43, 59, 0.95)',
    blur: 'rgba(30, 35, 48, 0.6)',
  },

  // Button colors
  button: {
    primary: '#F7931A',
    primaryHover: '#E6830E',
    primaryActive: '#D4750C',
    secondary: '#252B3B',
    secondaryHover: '#2A3141',
    tertiary: 'transparent',
    disabled: '#374151',
  },

  // Input colors
  input: {
    background: '#1E2330',
    border: '#374151',
    borderFocus: '#F7931A',
    placeholder: '#6B7280',
  },
} as const;

export type ColorPalette = typeof colors;
