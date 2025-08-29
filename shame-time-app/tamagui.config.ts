import { createTamagui } from '@tamagui/core'
import { config } from '@tamagui/config/v3'

// Custom colors matching the Shame Time design system
const customColors = {
  // Primary colors from PRD
  primaryBackground: '#0F0F0F',
  primaryText: '#F5F5F5',
  
  // Accent colors
  positiveGreen: '#6CC4A1',
  neutralYellow: '#F7DC6F', 
  negativeRed: '#E55B5B',
  
  // Grayscale
  lightGray: '#BDBDBD',
  mediumGray: '#757575',
  darkGray: '#212121',
  
  // Additional dark theme colors
  cardBackground: '#1A1A1A',
  borderColor: '#333333',
}

// Extend the default config with our custom theme
const customConfig = {
  ...config,
  themes: {
    ...config.themes,
    // Override dark theme with our custom colors
    dark: {
      ...config.themes.dark,
      background: customColors.primaryBackground,
      color: customColors.primaryText,
      card: customColors.cardBackground,
      cardBackground: customColors.cardBackground,
      border: customColors.borderColor,
      borderColor: customColors.borderColor,
      
      // Accent colors for different states
      green: customColors.positiveGreen,
      yellow: customColors.neutralYellow,
      red: customColors.negativeRed,
      
      // Text variants
      placeholderColor: customColors.mediumGray,
      
      // Button variants
      primary: customColors.positiveGreen,
      secondary: customColors.mediumGray,
      danger: customColors.negativeRed,
      warning: customColors.neutralYellow,
    },
    // Set light theme to use same dark colors for consistency
    light: {
      ...config.themes.light,
      background: customColors.primaryBackground,
      color: customColors.primaryText,
      card: customColors.cardBackground,
      cardBackground: customColors.cardBackground,
      border: customColors.borderColor,
      borderColor: customColors.borderColor,
      
      // Accent colors for different states
      green: customColors.positiveGreen,
      yellow: customColors.neutralYellow,
      red: customColors.negativeRed,
      
      // Text variants
      placeholderColor: customColors.mediumGray,
      
      // Button variants
      primary: customColors.positiveGreen,
      secondary: customColors.mediumGray,
      danger: customColors.negativeRed,
      warning: customColors.neutralYellow,
    },
  },
  // Custom fonts - Inter family as specified in PRD
  fonts: {
    ...config.fonts,
    heading: {
      family: 'Inter',
      size: {
        1: 12,
        2: 14,
        3: 15,
        4: 16,
        5: 18,
        6: 20,
        7: 22,
        8: 24,
        9: 28,
        10: 32,
        11: 36,
        12: 42,
        13: 48,
        14: 54,
        15: 60,
        16: 66,
      },
      weight: {
        light: '300',
        normal: '400',
        semibold: '600',
        bold: '700',
      },
      letterSpacing: {
        1: 0,
        2: -0.25,
      },
    },
    body: {
      family: 'Inter',
      size: {
        1: 11,
        2: 12,
        3: 13,
        4: 14,
        5: 15,
        6: 16,
        7: 18,
        8: 20,
        9: 22,
        10: 24,
        11: 28,
        12: 32,
        13: 36,
        14: 42,
        15: 48,
        16: 54,
      },
      weight: {
        light: '300',
        normal: '400',
        semibold: '600',
        bold: '700',
      },
    },
  },
}

export const tamaguiConfig = createTamagui(customConfig)

export type TamaguiConfig = typeof tamaguiConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends TamaguiConfig {}
}