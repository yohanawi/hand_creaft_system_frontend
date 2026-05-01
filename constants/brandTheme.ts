export const BRAND_THEME = {
  colors: {
    brown: {
      Background: "#D0B9A7",
      lightBackground: "#B5A192",
      SecondaryBackground: "#B9937B",
      DarkColor: "#714329",
      lightColor: "#B08463",
      TextPrimary: "#1C1C1C",
      TextSecondary: "#6B6B6B",
      Border: "#E5E5E5",
    },
    white: "#FFFFFF",
  },
  fontFamily: {
    heading: "PlayfairDisplay",
    body: "Inter",
  },
} as const;

export const BROWN = BRAND_THEME.colors.brown;
export const BRAND_FONTS = BRAND_THEME.fontFamily;
