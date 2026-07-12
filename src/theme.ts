export const Colors = {
  pine: '#1E4010',
  pineMid: '#2D5C1A',
  pineLight: '#4A8C2A',
  sand: '#F5F0E8',
  warm: '#FDFAF5',
  terracotta: '#C94C1A',
  sky: '#3A82B0',
  ink: '#141210',
  muted: '#7A756D',
  border: '#E5DFD5',
  card: '#FFFFFF',
  pinFood: '#E8744A',
  pinNature: '#4CAF78',
  pinNightlife: '#7B5EA7',
  pinTip: '#F5C842',
  pinStay: '#4A90B8',
  pinCulture: '#E85A8A',
  pinEvent: '#E8744A',
  pinEveryday: '#A0896A',
};

export const TypeColors: Record<string, string> = {
  food: Colors.pinFood,
  nature: Colors.pinNature,
  nightlife: Colors.pinNightlife,
  tip: Colors.pinTip,
  stay: Colors.pinStay,
  culture: Colors.pinCulture,
  event: '#E06B2A',
  everyday: '#A0896A',
};

export const TypeBgColors: Record<string, string> = {
  food: '#FDE8DF',
  nature: '#DFF0E6',
  nightlife: '#EDE5F5',
  tip: '#FEF7DC',
  stay: '#DFF0FA',
  culture: '#FDE5EF',
  event: '#FDE8D5',
  everyday: '#F0EAE0',
};

export const TypeTextColors: Record<string, string> = {
  food: '#C94C1A',
  nature: '#2E8050',
  nightlife: '#5A3D8A',
  tip: '#8A6D0E',
  stay: '#2A6F9B',
  culture: '#C0336A',
  event: '#B85A1A',
  everyday: '#7A6550',
};

export const TypeEmojis: Record<string, string> = {
  food: '🍽',
  nature: '🌿',
  nightlife: '🌙',
  tip: '💡',
  stay: '🏨',
  culture: '🎭',
  event: '🎟',
  everyday: '✦',
};

export const MoodColors: Record<string, string> = {
  'loved it': '#4CAF78',
  'solid': '#4A90B8',
  'meh': '#F5C842',
  'skip it': '#E85A8A',
};

export const MoodEmojis: Record<string, string> = {
  'loved it': '🔥',
  'solid': '👍',
  'meh': '😐',
  'skip it': '👎',
};

export const Typography = {
  displayLarge: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -1 },
  displayMedium: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5 },
  displaySmall: { fontSize: 20, fontWeight: '700' as const },
  titleLarge: { fontSize: 18, fontWeight: '700' as const },
  titleMedium: { fontSize: 16, fontWeight: '600' as const },
  titleSmall: { fontSize: 14, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5 },
  caption: { fontSize: 10, fontWeight: '500' as const },
};

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
};

export const Radius = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 999,
};

export const pineMid = '#2D5C1A';
