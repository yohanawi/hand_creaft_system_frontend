import { COLORS } from "@/constants/shopTheme";

export const discount = (orig: number, curr: number): number =>
  Math.round(((orig - curr) / orig) * 100);

export const badgeColor = (badge: string): string => {
  const map: Record<string, string> = {
    "Best Seller": COLORS.badge.bestSeller,
    "Hot Deal": COLORS.badge.hotDeal,
    New: COLORS.badge.new,
    Sale: COLORS.badge.sale,
    Trending: COLORS.badge.trending,
    "Pro Choice": COLORS.badge.proChoice,
    Featured: COLORS.badge.featured,
  };
  return map[badge] ?? COLORS.primary;
};
