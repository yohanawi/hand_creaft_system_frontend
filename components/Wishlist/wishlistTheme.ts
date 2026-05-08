import { Platform } from "react-native";

export const WISHLIST_COLORS = {
  background: "#F6F0E8",
  surface: "#FFFDFC",
  surfaceAlt: "#FBF4EC",
  border: "#EADBCB",
  borderStrong: "#D6C0A8",
  text: "#271C18",
  textMuted: "#7A685B",
  textSoft: "#9F8D7E",
  espresso: "#4A2E24",
  cocoa: "#6F4A3B",
  caramel: "#B88258",
  champagne: "#F3E2C6",
  rose: "#E7B8AF",
  gold: "#C59B5F",
  success: "#1F7A58",
  danger: "#B44848",
  warning: "#D97706",
  white: "#FFFFFF",
};

export const WISHLIST_SERIF = "PlayfairDisplay";
export const WISHLIST_SANS = "Inter";

export const WISHLIST_CARD_SHADOW = Platform.select({
  web: {
    boxShadow: "0px 20px 50px rgba(78, 52, 38, 0.10)",
  },
  default: {
    shadowColor: "#4E3426",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
});

export const WISHLIST_PANEL_SHADOW = Platform.select({
  web: {
    boxShadow: "0px 16px 40px rgba(78, 52, 38, 0.08)",
  },
  default: {
    shadowColor: "#4E3426",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
});
