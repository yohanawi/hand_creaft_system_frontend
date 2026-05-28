export type AiSearchProduct = {
  _id: string;
  slug?: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  currency?: string;
  thumbnailImage?: string;
  images?: string[];
  category?: { name?: string; slug?: string } | string | null;
  subcategory?: { name?: string; slug?: string } | string | null;
  material?: string;
  color?: string;
  availabilityStatus?: string;
  quantity?: number;
  isFeatured?: boolean;
  sku?: string;
  tags?: string[];
  averageRating?: number;
  reviewCount?: number;
};

export type AiSearchVisualMatch = {
  product: AiSearchProduct;
  score: number;
};

export type AiSuggestion = {
  id: string;
  label: string;
  query: string;
  hint: string;
  type: "phrase" | "product" | "material" | "style" | "occasion";
};

export type AiIntent = {
  headline: string;
  explanation: string;
  category?: string;
  material?: string;
  style?: string;
  occasion?: string;
  budget?: string;
  tokens: string[];
};

export type AiFilterState = {
  categories: string[];
  materials: string[];
  colors: string[];
  styles: string[];
  occasions: string[];
  handmadeTypes: string[];
  priceRange: string;
  onlyInStock: boolean;
  onlyDiscounted: boolean;
};

export type AiStyleCollection = {
  id: string;
  title: string;
  description: string;
  products: AiSearchProduct[];
};

type PriceOption = {
  id: string;
  label: string;
  min?: number;
  max?: number;
};

export const AI_PRICE_OPTIONS: PriceOption[] = [
  { id: "all", label: "Any budget" },
  { id: "under-100", label: "Under $100", max: 100 },
  { id: "100-250", label: "$100 - $250", min: 100, max: 250 },
  { id: "250-500", label: "$250 - $500", min: 250, max: 500 },
  { id: "500-plus", label: "$500+", min: 500 },
];

export const AI_STYLE_OPTIONS = [
  "Minimal",
  "Vintage",
  "Statement",
  "Bridal",
  "Artisan",
  "Classic",
];

export const AI_OCCASION_OPTIONS = [
  "Everyday",
  "Gifting",
  "Wedding",
  "Evening",
  "Celebration",
];

export const AI_CHAT_PROMPTS = [
  "Find a delicate gold gift under $250",
  "Show statement earrings for an evening look",
  "I want something bridal and handcrafted",
  "Match this image with similar rings",
];

export const AI_SOCIAL_PROOF = [
  { label: "Searches this week", value: "3.2k+" },
  { label: "AI visual matches delivered", value: "98.4%" },
  { label: "Curated artisan styles", value: "24" },
];

const STATIC_SUGGESTIONS = [
  "minimal gold necklace",
  "bridal pearl earrings",
  "statement cocktail ring",
  "gift-ready bracelet under $200",
  "vintage heirloom pendant",
  "everyday silver stack",
];

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeEntity(entity: AiSearchProduct["category"]) {
  if (!entity) return null;
  if (typeof entity === "string") {
    return { name: entity, slug: entity.toLowerCase().replace(/\s+/g, "-") };
  }
  return entity;
}

function titleize(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildDeterministicNumber(seed: string, min: number, max: number) {
  const chars = Array.from(seed || "seed");
  const total = chars.reduce(
    (sum, char, index) => sum + char.charCodeAt(0) * (index + 1),
    0,
  );
  return min + (total % (max - min + 1));
}

export function getAiSearchProductImage(product: Partial<AiSearchProduct>) {
  return (
    product.thumbnailImage ||
    product.images?.[0] ||
    "https://placehold.co/900x900/f1e5d8/5a3522?text=Maison+Piece"
  );
}

export function getAiSearchCategoryName(product: Partial<AiSearchProduct>) {
  const category = normalizeEntity(product.category ?? null);
  return category?.name || "Curated Jewelry";
}

export function getAiSearchCurrentPrice(product: Partial<AiSearchProduct>) {
  return typeof product.salePrice === "number" &&
    product.salePrice < (product.price ?? 0)
    ? product.salePrice
    : (product.price ?? 0);
}

export function getAiSearchPrice(product: Partial<AiSearchProduct>) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency || "USD",
    maximumFractionDigits: 0,
  });

  return formatter.format(getAiSearchCurrentPrice(product));
}

export function getAiSearchOriginalPrice(product: Partial<AiSearchProduct>) {
  if (
    typeof product.salePrice === "number" &&
    product.salePrice < (product.price ?? 0)
  ) {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: product.currency || "USD",
      maximumFractionDigits: 0,
    });
    return formatter.format(product.price ?? 0);
  }

  return null;
}

export function getAiSearchDiscountPercent(product: Partial<AiSearchProduct>) {
  if (
    typeof product.salePrice !== "number" ||
    typeof product.price !== "number"
  )
    return 0;
  if (product.salePrice >= product.price) return 0;
  return Math.round(
    ((product.price - product.salePrice) / product.price) * 100,
  );
}

export function getAiSearchRating(product: Partial<AiSearchProduct>) {
  if (typeof product.averageRating === "number" && product.averageRating > 0) {
    return Number(product.averageRating.toFixed(1));
  }

  return Number(
    (
      4.3 +
      buildDeterministicNumber(product._id || product.name || "rating", 0, 6) /
        10
    ).toFixed(1),
  );
}

export function getAiSearchReviewCount(product: Partial<AiSearchProduct>) {
  if (typeof product.reviewCount === "number" && product.reviewCount > 0) {
    return product.reviewCount;
  }

  return buildDeterministicNumber(
    product._id || product.name || "reviews",
    18,
    240,
  );
}

export function isAiSearchInStock(product: Partial<AiSearchProduct>) {
  if (product.availabilityStatus && product.availabilityStatus !== "in_stock")
    return false;
  if (typeof product.quantity === "number") return product.quantity > 0;
  return true;
}

export function inferAiSearchStyle(product: Partial<AiSearchProduct>) {
  const text =
    `${product.name || ""} ${product.description || ""} ${product.material || ""} ${getAiSearchCategoryName(product)}`.toLowerCase();

  if (/bridal|wedding|engagement|bride|pearl/.test(text)) return "Bridal";
  if (/vintage|heirloom|antique|victorian/.test(text)) return "Vintage";
  if (/statement|bold|cocktail|dramatic|sculpt/.test(text)) return "Statement";
  if (/minimal|minimalist|delicate|sleek|stack/.test(text)) return "Minimal";
  if (/artisan|handmade|organic|textured|hammered/.test(text)) return "Artisan";
  return "Classic";
}

export function inferAiSearchOccasion(product: Partial<AiSearchProduct>) {
  const text =
    `${product.name || ""} ${product.description || ""} ${product.tags?.join(" ") || ""}`.toLowerCase();

  if (/wedding|bridal|engagement/.test(text)) return "Wedding";
  if (/gift|romantic|anniversary|birthday/.test(text)) return "Gifting";
  if (/evening|cocktail|event|party/.test(text)) return "Evening";
  if (/celebration|festive|occasion/.test(text)) return "Celebration";
  return "Everyday";
}

export function inferAiSearchHandmadeType(product: Partial<AiSearchProduct>) {
  const text =
    `${product.name || ""} ${product.description || ""} ${product.material || ""} ${product.tags?.join(" ") || ""}`.toLowerCase();

  if (/bead|seed bead|beaded/.test(text)) return "Beadwork";
  if (/clay|ceramic|polymer/.test(text)) return "Clay craft";
  if (/wood|timber|carved/.test(text)) return "Woodwork";
  if (/wire|wrap|wrapped/.test(text)) return "Wire wrap";
  if (/woven|braid|loom|thread|textile|cord/.test(text)) return "Textile craft";
  return "Metalwork";
}

export function getAiSearchInsight(product: Partial<AiSearchProduct>) {
  if (product.isFeatured) return "Featured by stylists";
  if (getAiSearchDiscountPercent(product) > 0) return "Smart value pick";
  if (inferAiSearchStyle(product) === "Bridal")
    return "Popular for bridal edits";
  if (inferAiSearchOccasion(product) === "Gifting")
    return "Chosen often as a gift";
  return "AI match for your current taste";
}

export function normalizeAiSearchCatalog(payload: unknown): AiSearchProduct[] {
  const raw = Array.isArray(payload)
    ? payload
    : (payload as any)?.products || (payload as any)?.data || [];

  return asArray<any>(raw)
    .filter((item) => item && item._id && item.name)
    .map((item) => ({
      _id: String(item._id),
      slug: item.slug,
      name: item.name,
      description: item.description,
      price: typeof item.price === "number" ? item.price : 0,
      salePrice: typeof item.salePrice === "number" ? item.salePrice : null,
      currency: item.currency || "USD",
      thumbnailImage: item.thumbnailImage,
      images: asArray<string>(item.images),
      category: normalizeEntity(item.category ?? null),
      subcategory: normalizeEntity(item.subcategory ?? null),
      material: item.material,
      color: item.color,
      availabilityStatus: item.availabilityStatus,
      quantity: typeof item.quantity === "number" ? item.quantity : undefined,
      isFeatured: Boolean(item.isFeatured),
      sku: item.sku,
      tags: asArray<string>(item.tags),
      averageRating:
        typeof item.averageRating === "number" ? item.averageRating : undefined,
      reviewCount:
        typeof item.reviewCount === "number" ? item.reviewCount : undefined,
    }));
}

export function buildAiSearchSuggestions(
  query: string,
  catalog: AiSearchProduct[],
): AiSuggestion[] {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return STATIC_SUGGESTIONS.slice(0, 5).map((phrase, index) => ({
      id: `phrase-${index}`,
      label: titleize(phrase),
      query: phrase,
      hint: "Popular search",
      type: "phrase",
    }));
  }

  const suggestions: AiSuggestion[] = [];

  STATIC_SUGGESTIONS.filter((phrase) => phrase.includes(trimmed))
    .slice(0, 3)
    .forEach((phrase, index) => {
      suggestions.push({
        id: `phrase-${index}`,
        label: titleize(phrase),
        query: phrase,
        hint: "AI phrase suggestion",
        type: "phrase",
      });
    });

  catalog
    .filter((product) => product.name.toLowerCase().includes(trimmed))
    .slice(0, 2)
    .forEach((product) => {
      suggestions.push({
        id: `product-${product._id}`,
        label: product.name,
        query: product.name,
        hint: getAiSearchCategoryName(product),
        type: "product",
      });
    });

  AI_STYLE_OPTIONS.filter((style) => style.toLowerCase().includes(trimmed))
    .slice(0, 2)
    .forEach((style) => {
      suggestions.push({
        id: `style-${style}`,
        label: `${style} pieces`,
        query: style.toLowerCase(),
        hint: "Style cue",
        type: "style",
      });
    });

  const unique = suggestions.filter(
    (item, index, array) =>
      array.findIndex((entry) => entry.query === item.query) === index,
  );
  return unique.slice(0, 6);
}

export function parseAiSearchIntent(
  query: string,
  imageUsed: boolean,
): AiIntent {
  const trimmed = query.trim().toLowerCase();
  const tokens = trimmed.split(/\s+/).filter(Boolean);

  const category = /ring/.test(trimmed)
    ? "Rings"
    : /necklace|pendant/.test(trimmed)
      ? "Necklaces"
      : /earring/.test(trimmed)
        ? "Earrings"
        : /bracelet|bangle/.test(trimmed)
          ? "Bracelets"
          : undefined;

  const material = /gold/.test(trimmed)
    ? "Gold"
    : /silver/.test(trimmed)
      ? "Silver"
      : /pearl/.test(trimmed)
        ? "Pearl"
        : /diamond/.test(trimmed)
          ? "Diamond"
          : /rose gold/.test(trimmed)
            ? "Rose Gold"
            : undefined;

  const style = /bridal|wedding/.test(trimmed)
    ? "Bridal"
    : /vintage|heirloom/.test(trimmed)
      ? "Vintage"
      : /statement|bold|cocktail/.test(trimmed)
        ? "Statement"
        : /minimal|delicate|sleek/.test(trimmed)
          ? "Minimal"
          : /artisan|handmade|textured/.test(trimmed)
            ? "Artisan"
            : undefined;

  const occasion = /gift|anniversary|birthday/.test(trimmed)
    ? "Gifting"
    : /wedding|bridal|engagement/.test(trimmed)
      ? "Wedding"
      : /party|evening|event/.test(trimmed)
        ? "Evening"
        : /everyday|daily/.test(trimmed)
          ? "Everyday"
          : undefined;

  const budgetMatch =
    trimmed.match(/under\s*\$?(\d+)/) || trimmed.match(/below\s*\$?(\d+)/);
  const budget = budgetMatch ? `Under $${budgetMatch[1]}` : undefined;

  const focus = [style, material, category].filter(Boolean).join(" ");
  const headline =
    focus ||
    (imageUsed ? "Visual similarity search" : "Curated product discovery");

  const cues = [
    style ? `${style.toLowerCase()} styling` : null,
    material ? `${material.toLowerCase()} materials` : null,
    category ? `${category.toLowerCase()}` : null,
    occasion ? `${occasion.toLowerCase()} moments` : null,
    budget ? budget.toLowerCase() : null,
  ].filter(Boolean);

  const explanation = imageUsed
    ? `We blended your uploaded image with ${cues.length ? cues.join(", ") : "catalog styling cues"} to rank pieces that feel visually aligned.`
    : `The AI is prioritizing ${cues.length ? cues.join(", ") : "shape, finish, and occasion clues"} from your search.`;

  return {
    headline,
    explanation,
    category,
    material,
    style,
    occasion,
    budget,
    tokens,
  };
}

export function filterAiSearchProducts(
  catalog: AiSearchProduct[],
  query: string,
  filters: AiFilterState,
) {
  const intent = parseAiSearchIntent(query, false);
  const queryTokens = intent.tokens;
  const priceOption =
    AI_PRICE_OPTIONS.find((option) => option.id === filters.priceRange) ||
    AI_PRICE_OPTIONS[0];

  return catalog
    .filter((product) => {
      const currentPrice = getAiSearchCurrentPrice(product);
      const categoryName = getAiSearchCategoryName(product);
      const colorName = String(product.color || "").trim();
      const handmadeType = inferAiSearchHandmadeType(product);

      if (filters.onlyInStock && !isAiSearchInStock(product)) return false;
      if (filters.onlyDiscounted && getAiSearchDiscountPercent(product) === 0)
        return false;
      if (
        filters.categories.length &&
        !filters.categories.some(
          (value) => value.toLowerCase() === categoryName.toLowerCase(),
        )
      )
        return false;
      if (
        filters.materials.length &&
        (!product.material || !filters.materials.includes(product.material))
      )
        return false;
      if (
        filters.colors.length &&
        (!colorName || !filters.colors.includes(colorName))
      )
        return false;
      if (
        filters.styles.length &&
        !filters.styles.includes(inferAiSearchStyle(product))
      )
        return false;
      if (
        filters.occasions.length &&
        !filters.occasions.includes(inferAiSearchOccasion(product))
      )
        return false;
      if (
        filters.handmadeTypes.length &&
        !filters.handmadeTypes.includes(handmadeType)
      )
        return false;
      if (typeof priceOption.min === "number" && currentPrice < priceOption.min)
        return false;
      if (typeof priceOption.max === "number" && currentPrice > priceOption.max)
        return false;

      if (!queryTokens.length) return true;

      const haystack = [
        product.name,
        product.description,
        categoryName,
        product.material,
        colorName,
        inferAiSearchStyle(product),
        inferAiSearchOccasion(product),
        handmadeType,
        product.tags?.join(" "),
        product.sku,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return queryTokens.every((token) => haystack.includes(token));
    })
    .map((product) => {
      const categoryName = getAiSearchCategoryName(product);
      const colorName = String(product.color || "").trim();
      const handmadeType = inferAiSearchHandmadeType(product);

      const haystack = [
        product.name,
        product.description,
        categoryName,
        product.material,
        colorName,
        inferAiSearchStyle(product),
        inferAiSearchOccasion(product),
        handmadeType,
        product.tags?.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const score =
        queryTokens.reduce(
          (total, token) => total + (haystack.includes(token) ? 10 : 0),
          0,
        ) +
        (product.isFeatured ? 6 : 0) +
        (isAiSearchInStock(product) ? 4 : -8) +
        Math.min(getAiSearchDiscountPercent(product), 20) +
        Math.round(getAiSearchRating(product));

      return { product, score };
    });
}

export function sortAiSearchResults(
  results: { product: AiSearchProduct; score: number }[],
  sortBy: string,
) {
  const next = [...results];

  if (sortBy === "price-low") {
    return next.sort(
      (left, right) =>
        getAiSearchCurrentPrice(left.product) -
        getAiSearchCurrentPrice(right.product),
    );
  }

  if (sortBy === "price-high") {
    return next.sort(
      (left, right) =>
        getAiSearchCurrentPrice(right.product) -
        getAiSearchCurrentPrice(left.product),
    );
  }

  if (sortBy === "top-rated") {
    return next.sort(
      (left, right) =>
        getAiSearchRating(right.product) - getAiSearchRating(left.product),
    );
  }

  return next.sort((left, right) => right.score - left.score);
}

export function buildAiSearchRecommendations(
  catalog: AiSearchProduct[],
  results: AiSearchProduct[],
  intent: AiIntent,
) {
  const seed = results[0];
  const excluded = new Set(results.slice(0, 6).map((product) => product._id));
  const targetMaterial = intent.material || seed?.material;
  const targetStyle =
    intent.style || (seed ? inferAiSearchStyle(seed) : undefined);

  return catalog
    .filter((product) => !excluded.has(product._id))
    .map((product) => ({
      product,
      score:
        (product.isFeatured ? 8 : 0) +
        (targetMaterial && product.material === targetMaterial ? 10 : 0) +
        (targetStyle && inferAiSearchStyle(product) === targetStyle ? 8 : 0) +
        (intent.category &&
        getAiSearchCategoryName(product)
          .toLowerCase()
          .includes(intent.category.toLowerCase())
          ? 8
          : 0) +
        Math.round(getAiSearchRating(product)),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((entry) => entry.product);
}

export function buildAiSearchStyleCollections(
  catalog: AiSearchProduct[],
): AiStyleCollection[] {
  return [
    {
      id: "minimal",
      title: "Quiet Luxury",
      description: "Lean silhouettes, delicate shine, and everyday polish.",
      products: catalog
        .filter((product) => inferAiSearchStyle(product) === "Minimal")
        .slice(0, 4),
    },
    {
      id: "statement",
      title: "Statement Dressing",
      description: "Pieces that anchor an outfit and photograph beautifully.",
      products: catalog
        .filter((product) => inferAiSearchStyle(product) === "Statement")
        .slice(0, 4),
    },
    {
      id: "bridal",
      title: "Bridal Story",
      description: "Pearls, heirloom finishes, and ceremony-ready sparkle.",
      products: catalog
        .filter((product) => inferAiSearchStyle(product) === "Bridal")
        .slice(0, 4),
    },
  ].filter((collection) => collection.products.length > 0);
}

export function buildAiSearchTrending(catalog: AiSearchProduct[]) {
  return [...catalog]
    .sort((left, right) => {
      const scoreLeft =
        (left.isFeatured ? 12 : 0) +
        getAiSearchReviewCount(left) +
        getAiSearchDiscountPercent(left);
      const scoreRight =
        (right.isFeatured ? 12 : 0) +
        getAiSearchReviewCount(right) +
        getAiSearchDiscountPercent(right);
      return scoreRight - scoreLeft;
    })
    .slice(0, 5);
}

export function getAiVisualMatchLabel(score: number) {
  if (score >= 0.88) return "Exceptional match";
  if (score >= 0.74) return "Strong visual match";
  if (score >= 0.6) return "Similar silhouette";
  return "Broad inspiration match";
}

export function buildAiAssistantReply(prompt: string, intent: AiIntent) {
  const query = prompt.trim();
  if (!query) {
    return "Tell me about the piece, occasion, or finish you want and I will refine the catalog around it.";
  }

  const parts = [
    intent.style ? `${intent.style.toLowerCase()} styling` : null,
    intent.material ? `${intent.material.toLowerCase()} material cues` : null,
    intent.category ? `${intent.category.toLowerCase()}` : null,
    intent.occasion ? `${intent.occasion.toLowerCase()} dressing` : null,
    intent.budget ? intent.budget.toLowerCase() : null,
  ].filter(Boolean);

  return `I tuned the search toward ${parts.length ? parts.join(", ") : "shape, finish, and gifting cues"}. Open filters if you want to narrow materials or budget further.`;
}
