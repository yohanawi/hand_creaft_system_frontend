import { Platform } from "react-native";

export const CART_COLORS = {
  ink: "#2E221B",
  mocha: "#6B4A36",
  clay: "#A06A4D",
  rose: "#C77F6A",
  gold: "#C49742",
  parchment: "#F9F3EC",
  cream: "#FFFDFC",
  mist: "#F4ECE2",
  line: "#E7D7C7",
  sage: "#7A8B76",
  muted: "#7D6B5D",
  white: "#FFFFFF",
  danger: "#B44848",
  success: "#317159",
};

export const SERIF_FONT = "PlayfairDisplay";
export const SANS_FONT = "Inter";

export const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#8C6A4F",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
  },
  android: {
    elevation: 8,
  },
  default: {
    shadowColor: "#8C6A4F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
});

export const FREE_SHIPPING_THRESHOLD = 100;
