export type ProductVariant = {
  _id: string;
  label?: string;
  size?: string;
  color?: string;
  style?: string;
  sku?: string;
  quantity?: number;
  price?: number;
  salePrice?: number | null;
  thumbnailImage?: string;
  isDefault?: boolean;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  thumbnailImage?: string;
  images?: string[];
  price: number;
  salePrice?: number | null;
  currency?: string;
  sku?: string;
  status?: "active" | "inactive" | "archived";
  isArchived?: boolean;
  archivedAt?: string | null;
  quantity?: number;
  availabilityStatus?: string;
  description?: string;
  color?: string;
  material?: string;
  weight?: string | number;
  tags?: string[];
  category?: { name: string; slug: string } | null;
  subcategory?: { name: string; slug: string } | null;
  isFeatured?: boolean;
  averageRating?: number;
  reviewCount?: number;
  variants?: ProductVariant[];
  deliveryEstimate?: {
    minDays?: number;
    maxDays?: number;
    label?: string;
    shipsFrom?: string;
  };
  richMedia?: {
    videos?: string[];
    view360Images?: string[];
  };
  policySurfaces?: {
    returnPolicy?: string;
    warrantyPolicy?: string;
    shippingPolicy?: string;
  };
};

export type Review = {
  _id: string;
  user: { _id: string; name: string } | string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type VariantAttribute = "size" | "color" | "style";

export type VariantChoice = {
  size: string;
  color: string;
  style: string;
};

export type MediaTab = "gallery" | "video" | "spin";

export type ProductTab = "description" | "details" | "reviews";
