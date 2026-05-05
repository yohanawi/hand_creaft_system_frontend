import { useWindowDimensions } from "react-native";

export default function useCategoryLayout() {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const isTablet = width >= 768 && width < 1180;
  const isDesktop = width >= 1180;

  const horizontalPadding =
    width < 420 ? 14 : width < 768 ? 16 : width < 1180 ? 24 : 32;
  const maxContentWidth = 1240;
  const cardWidth = isCompact ? "100%" : isTablet ? "48.6%" : "31.8%";

  return {
    width,
    isCompact,
    isTablet,
    isDesktop,
    horizontalPadding,
    maxContentWidth,
    cardWidth,
  };
}
