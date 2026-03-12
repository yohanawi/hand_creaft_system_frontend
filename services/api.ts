import axios from "axios";

// Replace with your Express backend URL
const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request if available
let _token: string | null = null;
export const setAuthToken = (token: string | null) => {
  _token = token;
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

// ─── Orders: User ─────────────────────────────────────────────────────────────
export const placeOrder = (data: {
  items: Array<{ product: string; quantity: number }>;
  shippingAddress: {
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
  paymentMethod: "card" | "paypal" | "cod";
  customerNote?: string;
  couponCode?: string;
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

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const getCart = () => api.get("/cart");
export const addToCartAPI = (productId: string, quantity: number = 1) =>
  api.post("/cart", { productId, quantity });
export const updateCartItemAPI = (productId: string, quantity: number) =>
  api.put(`/cart/${productId}`, { quantity });
export const removeFromCartAPI = (productId: string) =>
  api.delete(`/cart/${productId}`);
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
    message?: string;
    location?: string;
    trackingNumber?: string;
    courier?: string;
    estimatedDelivery?: string;
  },
) => api.put(`/admin/orders/${id}/status`, data);

export default api;
