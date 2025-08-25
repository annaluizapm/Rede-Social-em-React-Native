// src/styles/theme.js

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints para responsividade
const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

// Cores do tema
const colors = {
  // Cores primárias
  primary: '#0066cc',
  primaryLight: '#e9f0f7',
  primaryDark: '#004c99',
  
  // Cores secundárias
  secondary: '#6c757d',
  secondaryLight: '#e2e3e5',
  secondaryDark: '#495057',
  
  // Cores de status
  success: '#28a745',
  danger: '#ff4d4d',
  warning: '#ffc107',
  info: '#17a2b8',
  
  // Cores neutras
  black: '#000000',
  white: '#ffffff',
  
  // Tons de cinza
  gray100: '#f8f9fa',
  gray200: '#e9ecef',
  gray300: '#dee2e6',
  gray400: '#ced4da',
  gray500: '#adb5bd',
  gray600: '#6c757d',
  gray700: '#495057',
  gray800: '#343a40',
  gray900: '#212529',
  
  // Cores de texto
  text: '#333333',
  textLight: '#666666',
  textMuted: '#888888',
  
  // Cores de fundo
  background: '#f5f5f5',
  card: '#ffffff',
  
  // Cores de borda
  border: '#e1e1e1',
  borderLight: '#f0f0f0',
};

// Tipografia
const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
};

// Espaçamento
const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Bordas
const borders = {
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 100,
  },
  width: {
    thin: 1,
    medium: 2,
    thick: 3,
  },
};

// Sombras
const shadows = {
  light: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  strong: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Estilos de layout comuns
const layout = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenPadding: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borders.radius.md,
    padding: spacing.md,
    ...shadows.medium,
    marginBottom: spacing.md,
  },
};

// Helpers para responsividade
const isSmallScreen = width < breakpoints.tablet;
const isMediumScreen = width >= breakpoints.tablet && width < breakpoints.desktop;
const isLargeScreen = width >= breakpoints.desktop;

const responsive = {
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  screenWidth: width,
  screenHeight: height,
};

// Exporta o tema completo
export default {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  layout,
  responsive,
  breakpoints,
};
