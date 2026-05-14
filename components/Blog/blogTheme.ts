export const BLOG_COLORS = {
  brown: "#3A2418",
  brown2: "#6B3F24",
  gold: "#C99A45",
  cream: "#FFF8EF",
  soft: "#F5E8D8",
  muted: "#8A7565",
  ink: "#261812",
};

export const BLOGS_PER_PAGE = 6;

export type Blog = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  description?: string;
  image?: string;
  category?: string;
  author?: { name: string; profile_image?: string };
  readingTimeText?: string;
  views?: number;
  createdAt?: string;
  published_date?: string;
  tags?: string[];
  is_popular?: boolean;
};

export const formatBlogDate = (d?: string) => {
  if (!d) return "";

  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

export const getInitials = (name?: string) =>
  (name || "HC")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
