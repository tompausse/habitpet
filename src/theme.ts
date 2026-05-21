export const Colors = {
  // App background (dark space-like)
  bgDeep: '#2A1E5C',
  bgMid: '#5B3E96',
  bgLight: '#C56B8E',

  // Sheet / cards
  sheet: '#F8F7FC',
  card: '#FFFFFF',
  cardBorder: '#EEECF5',

  // Text
  ink: '#1D1B2E',
  inkMid: '#6B6882',
  inkLight: '#B0ADC5',

  // Brand / accent
  mint: '#37E0B0',
  mintDeep: '#13B98C',
  mintLight: '#A0FFE0',

  // Streak flame
  flame: '#FF6B35',
  flameLight: '#FFB35E',

  // Alert / health
  danger: '#FF4466',
  warning: '#FFB335',
  success: '#37E0B0',

  // Freeze / ice
  freeze: '#7EC8FF',

  // Glass pill (over dark bg)
  glass: 'rgba(255,255,255,0.14)',
  glassBorder: 'rgba(255,255,255,0.28)',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 34,
  full: 9999,
};

export const Font = {
  regular: undefined as undefined, // system font
  weight: {
    normal: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};
