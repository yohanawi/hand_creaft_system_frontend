export type Product = {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  subcategorySlug?: string;
  price: number;
  salePrice?: number;
  currency: string;
  quantity: number;
  status?: "active" | "inactive" | "archived";
  isArchived?: boolean;
  archivedAt?: string | null;
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
  status?: "active" | "inactive" | "archived";
  isArchived?: boolean;
  archivedAt?: string | null;
  category?: { name: string; slug: string } | string;
  subcategory?: { name: string; slug: string } | string;
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
