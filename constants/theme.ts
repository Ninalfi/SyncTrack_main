// constants/theme.ts
import { Platform } from "react-native";

export const Palette = {
  // Main brand colours
  primary: "#19BDE3",
  primaryDark: "#0998C0",
  primaryLight: "#DDF8FF",

  // Screenshot-inspired backgrounds
  background: "#F2F1FC",
  backgroundBlue: "#E9F9FC",
  surface: "#FFFFFF",
  surfaceSoft: "#F8FAFC",

  // Typography
  text: "#111318",
  textSecondary: "#667085",
  textMuted: "#98A2B3",
  white: "#FFFFFF",

  // Borders and dividers
  border: "#E7EAF0",
  divider: "#EEF0F4",

  // Status colours
  success: "#76C94F",
  successLight: "#ECF9E6",

  warning: "#F7B928",
  warningLight: "#FFF7DC",

  danger: "#F05252",
  dangerLight: "#FFF0F0",

  info: "#2684FF",
  infoLight: "#EAF3FF",

  // Calendar/task indicator colours
  purple: "#8B7CF6",
  orange: "#FF7A45",
  pink: "#F05C8B",
  cyan: "#25C4E8",

  // Overlay
  overlay: "rgba(17, 19, 24, 0.45)",
};

export const Colors = {
  light: {
    text: Palette.text,
    background: Palette.background,
    tint: Palette.primary,
    icon: Palette.textSecondary,
    tabIconDefault: Palette.textMuted,
    tabIconSelected: Palette.primary,
    card: Palette.surface,
    border: Palette.border,
  },

  dark: {
    text: "#F8FAFC",
    background: "#101218",
    tint: Palette.primary,
    icon: "#B8C0CC",
    tabIconDefault: "#7D8795",
    tabIconSelected: Palette.primary,
    card: "#1A1D25",
    border: "#292D38",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
  round: 999,
};

export const Typography = {
  display: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800" as const,
    color: Palette.text,
  },

  h1: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "800" as const,
    color: Palette.text,
  },

  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700" as const,
    color: Palette.text,
  },

  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700" as const,
    color: Palette.text,
  },

  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400" as const,
    color: Palette.text,
  },

  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600" as const,
    color: Palette.text,
  },

  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400" as const,
    color: Palette.textSecondary,
  },

  small: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "500" as const,
    color: Palette.textMuted,
  },
};

export const Shadow = {
  card: Platform.select({
    ios: {
      shadowColor: "#1E293B",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.09,
      shadowRadius: 18,
    },
    android: {
      elevation: 5,
    },
    default: {},
  }),

  floating: Platform.select({
    ios: {
      shadowColor: "#111827",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
    },
    android: {
      elevation: 12,
    },
    default: {},
  }),
};

export const AppTheme = {
  colors: Palette,
  spacing: Spacing,
  radius: Radius,
  typography: Typography,
  shadow: Shadow,
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },

  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },

  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});