import { Platform } from "react-native";

export const PRODUCT_PAGE_COLORS = {
  page: "#F6F0E8",
  surface: "#FFFDF9",
  surfaceMuted: "#F9F2E9",
  surfaceStrong: "#F2E4D5",
  accent: "#8B5E3C",
  accentDeep: "#593322",
  accentSoft: "#E9D1BB",
  accentTint: "#FEF6EE",
  gold: "#C79A47",
  ink: "#1F2937",
  text: "#364152",
  muted: "#6B7280",
  line: "#E7D8C9",
  success: "#166534",
  successSoft: "#DCFCE7",
  danger: "#B91C1C",
  dangerSoft: "#FEE2E2",
  white: "#FFFFFF",
  overlay: "rgba(40, 22, 14, 0.76)",
};

export const PRODUCT_PAGE_FONTS = {
  heading: "PlayfairDisplay",
  body: "Inter",
};

export const PRODUCT_PAGE_SHADOW = Platform.select({
  ios: {
    shadowColor: "#7C5233",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  android: {
    elevation: 8,
  },
  default: {
    shadowColor: "#7C5233",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
});

export const PRODUCT_PAGE_SOFT_SHADOW = Platform.select({
  ios: {
    shadowColor: "#7C5233",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  android: {
    elevation: 4,
  },
  default: {
    shadowColor: "#7C5233",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
});
