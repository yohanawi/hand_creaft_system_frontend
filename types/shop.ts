export type Product = {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  salePrice?: number;
  currency: string;
  quantity: number;
  availabilityStatus: "in_stock" | "out_of_stock" | "pre_order";
  material?: string;
  sku?: string;
  imageUrl?: string;
  description?: string;
  isFeatured?: boolean;
};

export type ViewMode = "grid" | "list";

export type ApiCategory = {
  _id: string;
  name: string;
  slug: string;
  parent?: any;
};

export type ApiProduct = {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  currency?: string;
  category?: { name: string; slug: string } | string;
  quantity?: number;
  description?: string;
  images?: string[];
  thumbnailImage?: string;
  availabilityStatus?: "in_stock" | "out_of_stock" | "pre_order";
  material?: string;
  sku?: string;
  isFeatured?: boolean;
};

export type CategoryOption = {
  label: string;
  slug: string;
};
