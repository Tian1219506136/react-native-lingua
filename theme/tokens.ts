// NOTE: color values duplicated in global.css @theme (for className usage).
// When changing a color that exists in both files, update BOTH.
export const colors = {
  primary: {
    purple: "#6C4EF5",
    deepPurple: "#5B3BF6",
    blue: "#4D8BFF",
    green: "#21C16B",
    heroPurpleEnd: "#7C4DFF",
    heroPurpleStart: "#643CF6",
  },
  semantic: {
    success: "#21C16B",
    warning: "#FFC800",
    streak: "#FF8A00",
    error: "#FF4D4F",
    info: "#4D8BFF",
  },
  neutral: {
    textPrimary: "#0D132B",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    surface: "#F6F7FB",
    background: "#FFFFFF",
    cream: "#FFF7EE",
    goalTrack: "#FFE4C6",
    planGreen: "#F4FCEB",
    softPurple: "#F2EFFF",
    cardShadow: "#0D132B",
    lessonIconBg: "#F2EFFF",
    lessonPage: "#FBFCFF",
    tabMuted: "#EEF0F8",
    trackBorder: "#EEF0F6",
    audioStage: "#D9D1CA",
    audioStageSoft: "#F1ECE8",
    audioOverlay: "#BDB7B4",
    audioControl: "#FBFBFF",
    audioDivider: "#ECECF5",
  },
  lesson: {
    completed: "#20C933",
    audioGood: "#175CFF",
    audioGreat: "#4D2FFF",
    audioEnd: "#FF3B3F",
  },
} as const;

export const fonts = {
  family: {
    regular: "Poppins",
    medium: "Poppins-Medium",
    semiBold: "Poppins-SemiBold",
    bold: "Poppins-Bold",
  },
  assets: {
    regular: require("@/assets/fonts/Poppins-Regular.ttf"),
    medium: require("@/assets/fonts/Poppins-Medium.ttf"),
    semiBold: require("@/assets/fonts/Poppins-SemiBold.ttf"),
    bold: require("@/assets/fonts/Poppins-Bold.ttf"),
  },
} as const;

export const typography = {
  h1: {
    size: 32,
    lineHeight: 38.4,
    weight: "700",
    family: fonts.family.bold,
    usage: "Page / Screen Title",
  },
  h2: {
    size: 24,
    lineHeight: 31.2,
    weight: "600",
    family: fonts.family.semiBold,
    usage: "Section Title",
  },
  h3: {
    size: 20,
    lineHeight: 26,
    weight: "600",
    family: fonts.family.semiBold,
    usage: "Card / Module Title",
  },
  h4: {
    size: 16,
    lineHeight: 22.4,
    weight: "500",
    family: fonts.family.medium,
    usage: "Subheading",
  },
  bodyLarge: {
    size: 16,
    lineHeight: 25.6,
    weight: "400",
    family: fonts.family.regular,
    usage: "Important content",
  },
  bodyMedium: {
    size: 14,
    lineHeight: 22.4,
    weight: "400",
    family: fonts.family.regular,
    usage: "Body text",
  },
  bodySmall: {
    size: 13,
    lineHeight: 20.8,
    weight: "400",
    family: fonts.family.regular,
    usage: "Supporting text",
  },
  caption: {
    size: 11,
    lineHeight: 15.4,
    weight: "400",
    family: fonts.family.regular,
    usage: "Labels, meta text",
  },
} as const;

export const radii = {
  card: 14,
  swatch: 9,
} as const;

export const designTokens = {
  colors,
  fonts,
  typography,
  radii,
} as const;
