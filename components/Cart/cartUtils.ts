import { CartItem } from "@/context/CartContext";
import { WishlistProduct } from "@/context/WishlistContext";
import { getAssetUrl } from "@/services/api";
import { FREE_SHIPPING_THRESHOLD } from "./cartTheme";

export type CartCustomization = {
  engraving: boolean;
  notes: string;
};

export type CartRecommendation = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  route: "/shop" | "/categories" | "/deals";
};

export const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export const getCartItemKey = (
  item: Pick<CartItem, "product" | "selectedVariant">,
) => `${item.product}:${item.selectedVariant?.variantId || "base"}`;

export const getCartItemImageUri = (asset?: string) =>
  getAssetUrl(asset) || asset || "";

export const getUnitPrice = (item: CartItem) =>
  item.salePrice !== null && item.salePrice < item.price
    ? item.salePrice
    : item.price;

export const hasDiscount = (item: CartItem) =>
  item.salePrice !== null && item.salePrice < item.price;

const extractMaterialToken = (item: CartItem) => {
  const source = [
    item.selectedVariant?.style,
    item.selectedVariant?.label,
    item.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (source.includes("gold")) return "Gold";
  if (source.includes("silver")) return "Silver";
  if (source.includes("platinum")) return "Platinum";
  if (source.includes("pearl")) return "Pearl";
  if (source.includes("diamond")) return "Diamond";
  if (source.includes("gem")) return "Gemstone";
  return item.selectedVariant?.style || "Handcrafted finish";
};

export const getMaterialLabel = (item: CartItem) => extractMaterialToken(item);

export const getSizeLabel = (item: CartItem) =>
  item.selectedVariant?.size || "Made to order";

export const getVariantLabel = (item: CartItem) => {
  const label = item.selectedVariant?.label?.trim();
  if (label) return label;

  const parts = [
    item.selectedVariant?.size,
    item.selectedVariant?.color,
    item.selectedVariant?.style,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(" / ") : "Signature atelier selection";
};

export const toWishlistProduct = (item: CartItem): WishlistProduct => ({
  _id: item.product,
  name: item.name,
  thumbnailImage: item.thumbnailImage,
  price: item.price,
  salePrice: item.salePrice,
  sku: item.sku,
});

export const freeShippingRemainder = (subtotal: number) =>
  Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

export const estimateDeliveryLabel = (itemCount: number) =>
  itemCount > 2
    ? "Estimated delivery in 3-5 business days"
    : "Estimated delivery in 2-4 business days";

export const buildRecommendations = (
  items: CartItem[],
): CartRecommendation[] => {
  const seed = items
    .map((item) =>
      `${item.name} ${item.selectedVariant?.label || ""}`.toLowerCase(),
    )
    .join(" ");
  const ideas: CartRecommendation[] = [];

  if (seed.includes("ring")) {
    ideas.push({
      id: "pair-necklace",
      title: "Pair it with a pendant necklace",
      subtitle: "Layered styling",
      description:
        "Balance your ring stack with a fine pendant or gemstone collar.",
      route: "/shop",
    });
  }

  if (seed.includes("necklace")) {
    ideas.push({
      id: "add-earrings",
      title: "Complete the look with earrings",
      subtitle: "Matching shine",
      description:
        "Studs and drop sets keep the collection cohesive without overpowering it.",
      route: "/categories",
    });
  }

  if (seed.includes("bracelet")) {
    ideas.push({
      id: "bracelet-stack",
      title: "Build a bracelet stack",
      subtitle: "Gift-ready pairing",
      description:
        "Mix in a delicate cuff or chain for a richer handcrafted set.",
      route: "/deals",
    });
  }

  while (ideas.length < 3) {
    const fallbacks: CartRecommendation[] = [
      {
        id: "gift-edit",
        title: "Explore the gift edit",
        subtitle: "Curated bundles",
        description:
          "Find bundled pairings designed for anniversaries, birthdays, and keepsake gifting.",
        route: "/deals",
      },
      {
        id: "atelier-classics",
        title: "Browse atelier classics",
        subtitle: "Signature essentials",
        description:
          "Discover timeless chains, hoops, and stone accents that work with any cart.",
        route: "/shop",
      },
      {
        id: "stone-story",
        title: "Shop by stone and finish",
        subtitle: "Material-led discovery",
        description:
          "Refine the collection by gemstone tone, metal finish, and occasion.",
        route: "/categories",
      },
    ];

    const next = fallbacks.find(
      (candidate) => !ideas.some((idea) => idea.id === candidate.id),
    );
    if (!next) break;
    ideas.push(next);
  }

  return ideas.slice(0, 3);
};

export const getCustomizationSummary = (customization: CartCustomization) => ({
  engravingLabel: customization.engraving ? "Yes" : "No",
  notesLabel: customization.notes.trim() || "No special requests added yet.",
});
