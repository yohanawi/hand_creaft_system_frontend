import { WishlistProduct } from "@/context/WishlistContext";
import { getAssetUrl } from "@/services/api";

export type WishlistVariant = {
  _id: string;
  label?: string;
  size?: string;
  color?: string;
  style?: string;
  quantity?: number;
  price?: number;
  salePrice?: number | null;
  thumbnailImage?: string;
};

export type WishlistDetailProduct = WishlistProduct & {
  images?: string[];
  description?: string;
  material?: string;
  tags?: string[];
  variants?: WishlistVariant[];
  averageRating?: number;
  reviewCount?: number;
  style?: string;
  createdAt?: string;
  isFeatured?: boolean;
};

export const TRUST_SIGNALS = [
  {
    icon: "shield",
    title: "Authentic handcrafted pieces",
    description:
      "Small-batch jewelry finished with artisan detail and verified materials.",
  },
  {
    icon: "lock",
    title: "Secure checkout",
    description:
      "Protected payment flow for high-value purchases and gift orders.",
  },
  {
    icon: "refresh-ccw",
    title: "Easy returns",
    description:
      "A friendly return window if the piece needs a different fit or feel.",
  },
] as const;

export const CURATED_WISHLIST_RECOMMENDATIONS: WishlistDetailProduct[] = [
  {
    _id: "wishlist-rec-1",
    name: "Celeste Layered Necklace",
    price: 280,
    salePrice: 232,
    thumbnailImage:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80",
    category: { name: "Necklaces", slug: "necklaces" },
    quantity: 5,
    availabilityStatus: "in_stock",
    material: "Gemstone",
    description:
      "A hand-finished pendant designed to layer with heirloom rings.",
    tags: ["handmade", "layering", "limited"],
    isFeatured: true,
  },
  {
    _id: "wishlist-rec-2",
    name: "Noor Pearl Drops",
    price: 210,
    salePrice: 168,
    thumbnailImage:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
    category: { name: "Earrings", slug: "earrings" },
    quantity: 3,
    availabilityStatus: "in_stock",
    material: "Gemstone",
    description:
      "Elegant drops with bridal polish and a softly luminous finish.",
    tags: ["handmade", "bridal", "gemstone"],
  },
  {
    _id: "wishlist-rec-3",
    name: "Heirloom Signet Ring",
    price: 265,
    salePrice: 209,
    thumbnailImage:
      "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=900&q=80",
    category: { name: "Rings", slug: "rings" },
    quantity: 2,
    availabilityStatus: "in_stock",
    material: "Silver",
    description: "Personalized signet styling with artisan engraving details.",
    tags: ["handmade", "signet", "limited"],
  },
  {
    _id: "wishlist-rec-4",
    name: "Crescent Cuff Bracelet",
    price: 230,
    salePrice: 179,
    thumbnailImage:
      "https://images.unsplash.com/photo-1619119069152-a2b331eb392a?auto=format&fit=crop&w=900&q=80",
    category: { name: "Bracelets", slug: "bracelets" },
    quantity: 4,
    availabilityStatus: "in_stock",
    material: "Gold",
    description: "Sculpted bracelet with satin polish and a gift-ready clasp.",
    tags: ["handmade", "gold", "minimal"],
  },
  {
    _id: "wishlist-rec-5",
    name: "Aurora Halo Ring",
    price: 320,
    salePrice: 249,
    thumbnailImage:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
    category: { name: "Rings", slug: "rings" },
    quantity: 1,
    availabilityStatus: "in_stock",
    material: "Gold",
    description:
      "Hand-set halo ring with warm gold detailing and atelier sparkle.",
    tags: ["handmade", "bridal", "gemstone", "limited"],
    isFeatured: true,
  },
  {
    _id: "wishlist-rec-6",
    name: "Lustre Drop Earrings",
    price: 190,
    salePrice: 145,
    thumbnailImage:
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=900&q=80",
    category: { name: "Earrings", slug: "earrings" },
    quantity: 6,
    availabilityStatus: "in_stock",
    material: "Silver",
    description: "Statement drops with soft movement and polished edges.",
    tags: ["handmade", "silver", "drop"],
  },
];

const CATEGORY_SIZE_GUIDE: Record<string, string[]> = {
  rings: ["US 5", "US 6", "US 7"],
  necklaces: ["16 in", "18 in", "20 in"],
  bracelets: ["Small", "Medium", "Large"],
  earrings: ["One size"],
};

const firstDefinedText = (...values: (string | undefined | null)[]) =>
  values.map((value) => String(value || "").trim()).find(Boolean) || "";

export const getWishlistImageUri = (
  product?: Partial<WishlistDetailProduct> | null,
) => {
  const image = firstDefinedText(product?.thumbnailImage, product?.images?.[0]);
  return image ? getAssetUrl(image) || image : null;
};

export const getWishlistCategoryName = (
  product?: Partial<WishlistDetailProduct> | null,
) => {
  const category = product?.category;
  if (category && typeof category === "object") {
    return String(category.name || "").trim();
  }
  return String(category || "").trim();
};

export const isWishlistItemInStock = (
  product?: Partial<WishlistDetailProduct> | null,
) =>
  String(product?.availabilityStatus || "").toLowerCase() !== "out_of_stock" &&
  Number(product?.quantity ?? 0) > 0;

export const hasWishlistDiscount = (
  product?: Partial<WishlistDetailProduct> | null,
) => {
  const price = Number(product?.price || 0);
  const salePrice = Number(product?.salePrice ?? 0);
  return salePrice > 0 && salePrice < price;
};

export const getWishlistDisplayPrice = (
  product?: Partial<WishlistDetailProduct> | null,
) =>
  hasWishlistDiscount(product)
    ? Number(product?.salePrice || 0)
    : Number(product?.price || 0);

export const getWishlistDiscountPercent = (
  product?: Partial<WishlistDetailProduct> | null,
) => {
  const price = Number(product?.price || 0);
  const salePrice = Number(product?.salePrice ?? 0);
  if (!price || !salePrice || salePrice >= price) {
    return 0;
  }
  return Math.round(((price - salePrice) / price) * 100);
};

const inferMaterialFromTags = (tags: string[]) => {
  const lowered = tags.map((tag) => tag.toLowerCase());
  if (lowered.some((tag) => tag.includes("gold"))) {
    return "Gold";
  }
  if (lowered.some((tag) => tag.includes("silver"))) {
    return "Silver";
  }
  if (
    lowered.some(
      (tag) =>
        tag.includes("gem") || tag.includes("pearl") || tag.includes("stone"),
    )
  ) {
    return "Gemstone";
  }
  return "";
};

export const getWishlistMaterial = (
  product?: Partial<WishlistDetailProduct> | null,
) => {
  const material = firstDefinedText(product?.material);
  if (material) {
    return material;
  }

  const tagMatch = inferMaterialFromTags(
    Array.isArray(product?.tags) ? product?.tags : [],
  );
  if (tagMatch) {
    return tagMatch;
  }

  const category = getWishlistCategoryName(product).toLowerCase();
  if (category.includes("ring") || category.includes("bracelet")) {
    return "Gold";
  }
  if (category.includes("earring")) {
    return "Silver";
  }
  return "Gemstone";
};

export const getWishlistShortDescription = (
  product?: Partial<WishlistDetailProduct> | null,
) => {
  const description = firstDefinedText(product?.description);
  if (description) {
    return description;
  }

  const category = getWishlistCategoryName(product) || "piece";
  const material = getWishlistMaterial(product).toLowerCase();
  return `A handcrafted ${category.toLowerCase()} finished with ${material} detail and gift-worthy presence.`;
};

export const getWishlistBadge = (
  product?: Partial<WishlistDetailProduct> | null,
) => {
  const tags = Array.isArray(product?.tags)
    ? product?.tags.map((tag) => tag.toLowerCase())
    : [];
  if (
    tags.some((tag) => tag.includes("limited")) ||
    Number(product?.quantity ?? 0) <= 3
  ) {
    return "Limited Edition";
  }
  return "Handmade";
};

export const getWishlistStockLabel = (
  product?: Partial<WishlistDetailProduct> | null,
) => {
  const quantity = Number(product?.quantity ?? 0);
  if (
    String(product?.availabilityStatus || "").toLowerCase() ===
      "out_of_stock" ||
    quantity <= 0
  ) {
    return "Back in stock alert available";
  }
  if (quantity <= 3) {
    return `Only ${quantity} left`;
  }
  if (quantity <= 8) {
    return `${quantity} ready to ship`;
  }
  return "Made in small batches";
};

export const getWishlistSizeOptions = (
  product?: Partial<WishlistDetailProduct> | null,
) => {
  const sizes = Array.from(
    new Set(
      (product?.variants || [])
        .map((variant) => String(variant.size || variant.label || "").trim())
        .filter(Boolean),
    ),
  );

  if (sizes.length > 0) {
    return sizes;
  }

  const categorySlug = getWishlistCategoryName(product).toLowerCase();
  const matchedKey = Object.keys(CATEGORY_SIZE_GUIDE).find(
    (key) =>
      categorySlug.includes(key.slice(0, -1)) || categorySlug.includes(key),
  );
  return matchedKey ? CATEGORY_SIZE_GUIDE[matchedKey] : ["Made to order"];
};

export const normalizeWishlistCatalog = (
  payload: any,
): WishlistDetailProduct[] => {
  const rawItems = Array.isArray(payload?.products)
    ? payload.products
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

  return rawItems
    .map((item: any) => ({
      _id: String(item?._id || item?.id || ""),
      name: String(item?.name || "Untitled piece"),
      thumbnailImage: item?.thumbnailImage,
      images: Array.isArray(item?.images) ? item.images : [],
      price: Number(item?.price || 0),
      salePrice: item?.salePrice ?? null,
      sku: item?.sku,
      availabilityStatus: item?.availabilityStatus,
      quantity: Number(item?.quantity ?? 0),
      category: item?.category,
      description: item?.description,
      material: item?.material,
      tags: Array.isArray(item?.tags) ? item.tags : [],
      variants: Array.isArray(item?.variants) ? item.variants : [],
      averageRating: Number(item?.averageRating || 0),
      reviewCount: Number(item?.reviewCount || 0),
      style: item?.style,
      createdAt: item?.createdAt,
      isFeatured: Boolean(item?.isFeatured),
    }))
    .filter((item) => item._id);
};

const productScore = (
  candidate: WishlistDetailProduct,
  items: WishlistDetailProduct[],
) => {
  const wishlistIds = new Set(items.map((item) => item._id));
  if (wishlistIds.has(candidate._id)) {
    return -1;
  }

  const categoryMatches = items.some(
    (item) =>
      getWishlistCategoryName(item).toLowerCase() ===
      getWishlistCategoryName(candidate).toLowerCase(),
  );
  const materialMatches = items.some(
    (item) =>
      getWishlistMaterial(item).toLowerCase() ===
      getWishlistMaterial(candidate).toLowerCase(),
  );
  const itemTags = new Set(
    items.flatMap((item) => item.tags || []).map((tag) => tag.toLowerCase()),
  );
  const sharedTags = (candidate.tags || []).filter((tag) =>
    itemTags.has(tag.toLowerCase()),
  ).length;

  return (
    (categoryMatches ? 4 : 0) +
    (materialMatches ? 3 : 0) +
    sharedTags * 2 +
    (candidate.isFeatured ? 1 : 0) +
    (hasWishlistDiscount(candidate) ? 1 : 0)
  );
};

export const buildRecommendedProducts = (
  catalog: WishlistDetailProduct[],
  items: WishlistDetailProduct[],
  limit = 4,
) => {
  const source =
    catalog.length > 0 ? catalog : CURATED_WISHLIST_RECOMMENDATIONS;
  return [...source]
    .map((product) => ({ product, score: productScore(product, items) }))
    .filter((entry) => entry.score >= 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        getWishlistDiscountPercent(right.product) -
          getWishlistDiscountPercent(left.product),
    )
    .slice(0, limit)
    .map((entry) => entry.product);
};

export const buildSaleHighlights = (
  items: WishlistDetailProduct[],
  recommendations: WishlistDetailProduct[],
  limit = 3,
) => {
  const discountedWishlist = items.filter((item) => hasWishlistDiscount(item));
  if (discountedWishlist.length > 0) {
    return discountedWishlist.slice(0, limit);
  }

  return recommendations
    .filter((item) => hasWishlistDiscount(item))
    .slice(0, limit);
};

export const buildWishlistShareMessage = (items: WishlistDetailProduct[]) => {
  const featuredNames = items
    .slice(0, 3)
    .map((item) => item.name)
    .join(", ");
  if (!featuredNames) {
    return "Explore this handcrafted jewelry wishlist.";
  }

  return `My handcrafted jewelry wishlist currently includes ${featuredNames}. Take a look:`;
};
