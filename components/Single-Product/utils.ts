import { getAssetUrl } from "@/services/api";

import {
  Product,
  ProductVariant,
  VariantChoice,
} from "@/components/Single-Product/types";

export const imageUri = (asset?: string) => getAssetUrl(asset) || undefined;

export const normalizeVariantLabel = (variant?: ProductVariant | null) =>
  String(
    variant?.label ||
      [variant?.size, variant?.color, variant?.style]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .join(" / "),
  ).trim();

export const normalizeChoiceFromVariant = (
  variant?: ProductVariant | null,
): VariantChoice => ({
  size: String(variant?.size || ""),
  color: String(variant?.color || ""),
  style: String(variant?.style || ""),
});

export const matchesChoice = (variant: ProductVariant, choice: VariantChoice) =>
  (!choice.size || variant.size === choice.size) &&
  (!choice.color || variant.color === choice.color) &&
  (!choice.style || variant.style === choice.style);

export const buildDeliveryEstimateLabel = (
  deliveryEstimate?: Product["deliveryEstimate"],
) => {
  const minDays = Number(deliveryEstimate?.minDays || 0);
  const maxDays = Number(deliveryEstimate?.maxDays || 0);

  if (deliveryEstimate?.label) {
    return deliveryEstimate.label;
  }

  if (minDays > 0 && maxDays > 0) {
    return `${minDays}-${maxDays} business days`;
  }

  if (minDays > 0) {
    return `${minDays} business day${minDays === 1 ? "" : "s"}`;
  }

  return "Standard delivery timeline available at checkout";
};

export const isLikelyColorValue = (value?: string) => {
  if (!value) {
    return false;
  }

  return (
    /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value) ||
    /^(rgb|hsl)a?\(/i.test(value) ||
    /^[a-z]+$/i.test(value)
  );
};

export const formatCurrency = (amount: number, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
};

export const getDiscountPercent = (
  originalPrice: number,
  salePrice?: number | null,
) => {
  if (
    typeof salePrice !== "number" ||
    salePrice >= originalPrice ||
    originalPrice <= 0
  ) {
    return 0;
  }

  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};
