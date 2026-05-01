import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const normalizeBaseUrl = (value: string) => {
  const trimmed = value.trim().replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const getHostFromUri = (value?: string | null) =>
  String(value || "")
    .split(":")[0]
    .trim();

const getExpoDevHost = () => {
  const candidates = [
    Constants.expoConfig?.hostUri,
    (Constants as any).expoGoConfig?.debuggerHost,
    (Constants as any).manifest2?.extra?.expoClient?.hostUri,
    (Constants as any).manifest?.debuggerHost,
  ];

  return (
    candidates
      .map(getHostFromUri)
      .find((host) => !!host && host !== "localhost") || ""
  );
};

const getWebHost = () => {
  if (typeof window === "undefined") {
    return "localhost";
  }

  const hostname = window.location.hostname?.trim();
  return hostname || "localhost";
};

const getApiUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
  if (configuredUrl?.trim()) {
    return normalizeBaseUrl(configuredUrl);
  }

  if (Platform.OS === "web") {
    return `http://${getWebHost()}:5000/api`;
  }

  const expoHost = getExpoDevHost();

  if (expoHost) {
    return `http://${expoHost}:5000/api`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000/api";
  }

  return "http://localhost:5000/api";
};

export const API_URL = getApiUrl();
export const API_ORIGIN = API_URL.replace(/\/api$/, "");

export const getAssetUrl = (value?: string | null) => {
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }

  const normalized = raw.replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `${API_ORIGIN}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request if available
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// ─── Auth ───────────────────────────────────────────────────────────────────
export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) => api.post("/auth/register", data);

export const loginUser = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

export const getMyProfile = () => api.get("/auth/me");
export const getCustomerOverview = () => api.get("/auth/customer-overview");
export const updateMyProfile = (data: {
  name?: string;
  email?: string;
  phone?: string;
}) => api.put("/auth/me", data);
export const changeMyPassword = (data: {
  currentPassword: string;
  newPassword: string;
}) => api.put("/auth/change-password", data);
export const forgotPassword = (data: { email: string }) =>
  api.post("/auth/forgot-password", data);
export const resetPassword = (data: { token: string; newPassword: string }) =>
  api.post("/auth/reset-password", data);

export const getAddresses = () => api.get("/auth/addresses");
export const addAddress = (data: any) => api.post("/auth/addresses", data);
export const updateAddress = (id: string, data: any) =>
  api.put(`/auth/addresses/${id}`, data);
export const deleteAddress = (id: string) =>
  api.delete(`/auth/addresses/${id}`);
export const setDefaultAddress = (id: string) =>
  api.patch(`/auth/addresses/${id}/default`);

// ─── Admin: Stats ────────────────────────────────────────────────────────────
export const getAdminStats = () => api.get("/admin/stats");
export const getAdminInventoryOverview = () =>
  api.get("/admin/inventory/overview");
export const getAdminStockMovements = (params?: {
  page?: number;
  limit?: number;
  productId?: string;
  type?: string;
  search?: string;
}) => api.get("/admin/inventory/movements", { params });
export const restockAdminProduct = (
  id: string,
  data: { quantity: number; note?: string },
) => api.post(`/admin/inventory/products/${id}/restock`, data);
export const adjustAdminProductStock = (
  id: string,
  data: { quantityDelta: number; reason?: string; note?: string },
) => api.post(`/admin/inventory/products/${id}/adjust`, data);
export const getAdminPaymentOverview = () =>
  api.get("/admin/payments/overview");
export const getAdminSupportTickets = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}) => api.get("/admin/support/tickets", { params });
export const getAdminSupportTicketStats = () =>
  api.get("/admin/support/tickets/stats");
export const getAdminSupportTicketById = (id: string) =>
  api.get(`/admin/support/tickets/${id}`);
export const updateAdminSupportTicket = (
  id: string,
  data: {
    status?: string;
    priority?: string;
    category?: string;
    adminAssigneeId?: string;
    tags?: string[];
  },
) => api.put(`/admin/support/tickets/${id}`, data);
export const replyAdminSupportTicket = (
  id: string,
  data: {
    message: string;
    status?: string;
  },
) => api.post(`/admin/support/tickets/${id}/reply`, data);
export const getAdminWishlistInsights = () =>
  api.get("/admin/wishlist/insights");

// ─── Admin: Users ────────────────────────────────────────────────────────────
export const getAdminUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) => api.get("/admin/users", { params });
export const getAdminUserById = (id: string) => api.get(`/admin/users/${id}`);
export const updateAdminUser = (id: string, data: any) =>
  api.put(`/admin/users/${id}`, data);
export const deleteAdminUser = (id: string) => api.delete(`/admin/users/${id}`);

// ─── Admin: Products ─────────────────────────────────────────────────────────
export const getProducts = (params?: any) => api.get("/products", { params });
export const createProduct = (data: any) => api.post("/products", data);
export const updateProduct = (id: string, data: any) =>
  api.put(`/products/${id}`, data);
export const deleteProduct = (id: string) => api.delete(`/products/${id}`);
export const uploadProductImages = (data: FormData) =>
  api.post("/products/upload-images", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ─── Admin: Categories ───────────────────────────────────────────────────────
export const getCategories = () => api.get("/categories");
export const createCategory = (data: any) => api.post("/categories", data);
export const updateCategory = (id: string, data: any) =>
  api.put(`/categories/${id}`, data);
export const deleteCategory = (id: string) => api.delete(`/categories/${id}`);

// ─── Admin: Subcategories ─────────────────────────────────────────────────────
export const getSubcategories = (params?: { category?: string }) =>
  api.get("/subcategories", { params });
export const createSubcategory = (data: any) =>
  api.post("/subcategories", data);
export const updateSubcategory = (id: string, data: any) =>
  api.put(`/subcategories/${id}`, data);
export const deleteSubcategory = (id: string) =>
  api.delete(`/subcategories/${id}`);

// ─── Admin: Blogs ─────────────────────────────────────────────────────────────
export const getBlogs = (params?: any) => api.get("/blogs", { params });
export const createBlog = (data: FormData) =>
  api.post("/blogs", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateBlog = (id: string, data: FormData) =>
  api.put(`/blogs/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteBlog = (id: string) => api.delete(`/blogs/${id}`);

// ─── Blogs (public) ─────────────────────────────────────────────────────────
export const getBlogBySlug = (slug: string) => api.get(`/blogs/${slug}`);
export const getBlogComments = (blogId: string) =>
  api.get(`/blogs/${blogId}/comments`);
export const createBlogComment = (blogId: string, data: { comment: string }) =>
  api.post(`/blogs/${blogId}/comments`, data);
export const toggleLikeBlogComment = (blogId: string, commentId: string) =>
  api.post(`/blogs/${blogId}/comments/${commentId}/like`);
export const deleteBlogComment = (blogId: string, commentId: string) =>
  api.delete(`/blogs/${blogId}/comments/${commentId}`);

// ─── Orders: User ─────────────────────────────────────────────────────────────
export const placeOrder = (data: {
  items: {
    product: string;
    quantity: number;
    variantId?: string;
    selectedVariant?: {
      variantId?: string;
      label?: string;
      size?: string;
      color?: string;
      style?: string;
      sku?: string;
    };
  }[];
  shippingAddress?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  addressId?: string;
  paymentMethod: "payhere" | "cod";
  customerNote?: string;
  couponCode?: string;
  returnUrl?: string;
  cancelUrl?: string;
}) => api.post("/orders", data);

export const getMyOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => api.get("/orders/my", { params });

export const getMyOrderById = (id: string) => api.get(`/orders/my/${id}`);

export const trackOrder = (orderNumber: string) =>
  api.get(`/orders/track/${orderNumber}`);

export const cancelMyOrder = (id: string) =>
  api.patch(`/orders/my/${id}/cancel`);

export const initiatePayHerePayment = (data: {
  orderId: string;
  returnUrl: string;
  cancelUrl: string;
}) => api.post("/payments/payhere/initiate", data);

export const cancelPayHereOrder = (orderId: string) =>
  api.post(`/payments/payhere/orders/${orderId}/cancel`);

// ─── Support: Customer / Public ─────────────────────────────────────────────
export const createSupportTicket = (data: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  message: string;
  category?:
    | "order"
    | "payment"
    | "shipping"
    | "product"
    | "technical"
    | "account"
    | "general";
  priority?: "low" | "normal" | "high" | "urgent";
  source?: "contact_form" | "profile" | "order_help" | "admin_created";
}) => api.post("/support/tickets", data);

export const getMySupportTickets = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => api.get("/support/my", { params });

export const getMySupportTicketById = (id: string) =>
  api.get(`/support/my/${id}`);

export const replyMySupportTicket = (id: string, data: { message: string }) =>
  api.post(`/support/my/${id}/messages`, data);

// ─── AI Search ───────────────────────────────────────────────────────────────
export const getAiServiceHealth = () => api.get("/ai-search/health");
export const searchProductsByImage = (data: FormData) =>
  api.post("/ai-search/search", data, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
export const getAiIndexStatus = () => api.get("/ai-search/index-status");
export const indexAiProduct = (id: string) =>
  api.post(`/ai-search/index/${id}`);
export const indexAllAiProducts = () => api.post("/ai-search/index-all");

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const getCart = () => api.get("/cart");
export const addToCartAPI = (
  productId: string,
  quantity: number = 1,
  variantId?: string,
) => api.post("/cart", { productId, quantity, variantId });
export const updateCartItemAPI = (
  productId: string,
  quantity: number,
  variantId?: string,
) => api.put(`/cart/${productId}`, { quantity, variantId });
export const removeFromCartAPI = (productId: string, variantId?: string) =>
  api.delete(`/cart/${productId}`, { params: { variantId } });
export const clearCartAPI = () => api.delete("/cart");

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const getWishlist = () => api.get("/wishlist");
export const toggleWishlistAPI = (productId: string) =>
  api.post(`/wishlist/${productId}`);
export const removeFromWishlistAPI = (productId: string) =>
  api.delete(`/wishlist/${productId}`);

// ─── Single Product ───────────────────────────────────────────────────────────
export const getProductById = (id: string) => api.get(`/products/${id}`);
export const getProductReviews = (id: string) =>
  api.get(`/products/${id}/reviews`);
export const createProductReview = (
  id: string,
  data: { rating: number; comment?: string },
) => api.post(`/products/${id}/reviews`, data);
export const updateProductReview = (
  id: string,
  reviewId: string,
  data: { rating: number; comment?: string },
) => api.put(`/products/${id}/reviews/${reviewId}`, data);
export const deleteProductReview = (id: string, reviewId: string) =>
  api.delete(`/products/${id}/reviews/${reviewId}`);

export const validateCoupon = (data: { code: string; subtotal: number }) =>
  api.post("/coupons/validate", data);

export const getAdminCoupons = () => api.get("/admin/coupons");
export const createAdminCoupon = (data: any) =>
  api.post("/admin/coupons", data);
export const updateAdminCoupon = (id: string, data: any) =>
  api.put(`/admin/coupons/${id}`, data);
export const deleteAdminCoupon = (id: string) =>
  api.delete(`/admin/coupons/${id}`);

// ─── Orders: Admin ────────────────────────────────────────────────────────────
export const adminGetOrders = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => api.get("/admin/orders", { params });

export const adminGetOrderStats = () => api.get("/admin/orders/stats");

export const adminGetOrderById = (id: string) => api.get(`/admin/orders/${id}`);

export const adminUpdateOrderStatus = (
  id: string,
  data: {
    status: string;
    paymentStatus?: string;
    message?: string;
    location?: string;
    trackingNumber?: string;
    courier?: string;
    estimatedDelivery?: string;
    adminNote?: string;
  },
) => api.put(`/admin/orders/${id}/status`, data);

export default api;
