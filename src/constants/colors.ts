export const Colors = {
  primary: '#4B2E2B', // Espresso brown
  secondary: '#F5E9DD', // Latte cream
  accent: '#DCC1A1', // Light beige
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: {
    50: '#F9F9F9',
    100: '#F3F3F3',
    200: '#E6E6E6',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  success: '#059669',
  error: '#DC2626',
  warning: '#D97706',
};

export const Shadows = {
  small: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};