export const lightTheme = {
  // Background colors
  background: '#ffffff',
  surface: '#f8f9fa',
  card: '#ffffff',
  modal: '#ffffff',
  
  // Text colors
  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textInverse: '#ffffff',
  
  // Primary colors (Main Orange Theme)
  primary: '#ff6536',        // Main orange
  primaryLight: '#ff9500',    // Lighter orange for gradients
  primaryDark: '#e55527',    // Darker orange for hover states
  primaryLighter: '#ffb347', // Even lighter for gradients
  primaryAccent: '#f97316',  // Accent orange
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  
  // Border colors
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  
  // Input colors
  input: '#f9fafb',
  inputBorder: '#d1d5db',
  inputFocused: '#e66119',
  
  // Shadow colors
  shadow: '#000000',
  shadowOpacity: 0.1,
  
  // Tab colors
  tabActive: '#e66119',
  tabInactive: '#9ca3af',
  tabBackground: '#ffffff',
  
  // Status bar
  statusBarStyle: 'dark-content',
  statusBarBackground: '#ffffff',
};

export const darkTheme = {
  // Background colors
  background: '#111827',
  surface: '#1f2937',
  card: '#374151',
  modal: '#1f2937',
  
  // Text colors
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  textInverse: '#1f2937',
  
  // Primary colors
  primary: '#e66119',
  primaryLight: '#ff6536',
  primaryDark: '#ea580c',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  
  // Border colors
  border: '#4b5563',
  borderLight: '#374151',
  
  // Input colors
  input: '#374151',
  inputBorder: '#4b5563',
  inputFocused: '#e66119',
  
  // Shadow colors
  shadow: '#000000',
  shadowOpacity: 0.3,
  
  // Tab colors
  tabActive: '#e66119',
  tabInactive: '#9ca3af',
  tabBackground: '#1f2937',
  
  // Status bar
  statusBarStyle: 'light-content',
  statusBarBackground: '#111827',
};

// Common styles that don't change between themes
export const commonStyles = {
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xl: 20,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Color constants for consistent usage throughout the app
export const COLORS = {
  // Primary Orange Palette
  PRIMARY: '#ff6536',
  PRIMARY_LIGHT: '#ff9500',
  PRIMARY_DARK: '#e55527',
  PRIMARY_LIGHTER: '#ffb347',
  PRIMARY_ACCENT: '#f97316',
  
  // Gradient combinations
  GRADIENT_PRIMARY: ['#ff6536', '#ff9500', '#ffb347'],
  GRADIENT_WARM: ['#ff6536', '#ff9500'],
  GRADIENT_SUBTLE: ['#ffb347', '#ffc97e'],
  
  // Weather colors
  WEATHER_SUN: '#FFD700',
  WEATHER_CLOUD: '#87CEEB',
  WEATHER_RAIN: '#4682B4',
  
  // Status colors
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
  
  // Neutral colors
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY_50: '#f9fafb',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  GRAY_300: '#d1d5db',
  GRAY_400: '#9ca3af',
  GRAY_500: '#6b7280',
  GRAY_600: '#4b5563',
  GRAY_700: '#374151',
  GRAY_800: '#1f2937',
  GRAY_900: '#111827',
  
  // Transparent overlays
  OVERLAY_LIGHT: 'rgba(0, 0, 0, 0.5)',
  OVERLAY_DARK: 'rgba(0, 0, 0, 0.7)',
  OVERLAY_WHITE: 'rgba(255, 255, 255, 0.8)',
};

// Style utilities for common patterns
export const STYLES = {
  // Header gradient (consistent across all screens)
  headerGradient: {
    colors: COLORS.GRADIENT_PRIMARY,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: commonStyles.borderRadius.medium,
    padding: commonStyles.spacing.md,
  },
  
  primaryButtonPressed: {
    backgroundColor: COLORS.PRIMARY_DARK,
  },
  
  // Card shadow
  cardShadow: {
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Tab bar styling
  tabBar: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 15,
  },
};

// Helper functions
export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};

// Get color with opacity
export const getColorWithOpacity = (color, opacity) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Gradient helper
export const createGradient = (colors, direction = 'horizontal') => {
  const directions = {
    horizontal: { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
    vertical: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
    diagonal: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  };
  
  return {
    colors,
    ...directions[direction],
  };
};
