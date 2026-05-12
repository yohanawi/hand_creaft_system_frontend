# Frontend Developer Guide

> Handcrafted Jewelry E-Commerce Platform — React Native / Expo App

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Environment Configuration](#environment-configuration)
6. [Running the Project](#running-the-project)
7. [Project Structure](#project-structure)
8. [Architecture](#architecture)
9. [Common Development Tasks](#common-development-tasks)
10. [Linting](#linting)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The frontend is a cross-platform React Native application built with Expo. It runs on **iOS**, **Android**, and **Web** from a single codebase. The app covers:

- **Customer Experience** — Home, shop, product detail, cart, checkout, wishlist, order tracking
- **AI Image Search** — Upload a photo to find visually similar jewelry
- **Account Management** — Profile, addresses, order history, support tickets
- **Seller Dashboard** — Product management, order fulfillment, inventory, payouts, analytics
- **Admin Panel** — Full platform management (users, products, orders, payments, blogs, coupons, inventory, support, activity logs)
- **Blog** — Content pages with comments
- **Static Pages** — About, contact, FAQ, policies

---

## Tech Stack

| Technology                   | Version | Purpose                            |
| ---------------------------- | ------- | ---------------------------------- |
| React Native                 | 0.81.5  | Cross-platform UI framework        |
| React                        | 19.1.0  | UI library                         |
| Expo SDK                     | 54      | Native module ecosystem            |
| Expo Router                  | 6       | File-based navigation              |
| TypeScript                   | 5.9     | Type safety                        |
| NativeWind                   | 4       | Tailwind CSS for React Native      |
| Tailwind CSS                 | 3.4     | Utility-first CSS (via NativeWind) |
| Axios                        | 1.x     | HTTP client                        |
| AsyncStorage                 | 2.x     | Persistent local storage           |
| React Navigation             | 7.x     | Navigation primitives              |
| Lucide React Native          | 0.575   | Icon library                       |
| Expo Vector Icons            | 15      | Additional icons                   |
| React Native Reanimated      | 4.x     | Animations                         |
| React Native Gesture Handler | 2.x     | Touch gestures                     |
| Expo Image                   | 3.x     | Optimized image component          |
| Expo Image Picker            | 17.x    | Camera / gallery access            |
| Expo Linear Gradient         | 15.x    | Gradient backgrounds               |
| Expo Haptics                 | 15.x    | Haptic feedback                    |
| Expo AV                      | 16.x    | Audio/video                        |
| Expo Clipboard               | 55.x    | Clipboard access                   |
| Inter + Playfair Display     | —       | Google Fonts                       |

---

## Prerequisites

- **Node.js** 18 or higher — [nodejs.org](https://nodejs.org)
- **npm** 9 or higher
- **Expo Go** app on your physical device (iOS or Android) — for quick testing
- **Android Studio** — for Android emulator
- **Xcode** (macOS only) — for iOS simulator
- The **backend** server running (see backend developer guide)

---

## Installation

```bash
cd "d:\Final Projects\E-Commerce Platform\System\frontend"
npm install
```

---

## Environment Configuration

Create a `.env` file in the frontend root to configure the backend URL:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

> **Important:** Replace `192.168.1.100` with your machine's actual local IP address when testing on a physical device.

### How the API URL is resolved

If `EXPO_PUBLIC_API_URL` is not set, the app auto-detects the backend URL:

| Platform                  | Auto-detected URL                        |
| ------------------------- | ---------------------------------------- |
| Web browser               | `http://<current hostname>:5000/api`     |
| Android emulator          | `http://10.0.2.2:5000/api`               |
| Physical device (Expo Go) | `http://<Expo dev server host>:5000/api` |
| Fallback                  | `http://localhost:5000/api`              |

For **physical device testing**, always set `EXPO_PUBLIC_API_URL` explicitly.

---

## Running the Project

### Start the Expo dev server

```bash
npm start
```

This opens the Expo CLI with options to open on Android, iOS, or web. Scan the QR code with Expo Go on your phone.

### Open on specific platforms

```bash
# Android emulator (must be running)
npm run android

# iOS simulator (macOS only, Xcode required)
npm run ios

# Web browser
npm run web
```

### Clear Metro cache (if you have bundler issues)

```bash
npx expo start --clear
```

---

## Project Structure

```
frontend/
├── app/                         ← All screens (Expo Router file-based routing)
│   ├── _layout.tsx              ← Root layout — wraps app in all providers
│   ├── index.tsx                ← Home screen
│   ├── login.tsx                ← Login
│   ├── register.tsx             ← Registration
│   ├── forgot-password.tsx      ← Forgot password
│   ├── reset-password.tsx       ← Reset password
│   ├── shop.tsx                 ← Product listing / shop
│   ├── product-single.tsx       ← Product detail
│   ├── categories.tsx           ← Category browser
│   ├── cart.tsx                 ← Shopping cart
│   ├── checkout.tsx             ← Checkout flow
│   ├── wishlist.tsx             ← Wishlist
│   ├── orders.tsx               ← Order history
│   ├── order-tracking.tsx       ← Track an order
│   ├── customer-dashboard.tsx   ← Customer account overview
│   ├── profile.tsx              ← Edit profile
│   ├── ai-search.tsx            ← AI image search
│   ├── blogs.tsx                ← Blog listing
│   ├── blog-single.tsx          ← Blog post detail
│   ├── deals.tsx                ← Deals / promotions
│   ├── best-sellers.tsx         ← Best sellers
│   ├── support-tickets.tsx      ← Customer support
│   ├── about.tsx                ← About page
│   ├── contact.tsx              ← Contact page
│   ├── help-faq.tsx             ← FAQ
│   ├── privacy-policy.tsx       ← Privacy policy
│   ├── terms-conditions.tsx     ← Terms & conditions
│   ├── shipping-policy.tsx      ← Shipping policy
│   ├── payment-success.tsx      ← Payment success callback
│   ├── payment-failure.tsx      ← Payment failure callback
│   ├── admin/                   ← Admin panel (role-gated)
│   │   ├── _layout.tsx
│   │   ├── index.tsx            ← Admin dashboard
│   │   ├── users.tsx
│   │   ├── sellers.tsx
│   │   ├── products.tsx
│   │   ├── categories.tsx
│   │   ├── subcategories.tsx
│   │   ├── orders.tsx
│   │   ├── payments.tsx
│   │   ├── coupons.tsx
│   │   ├── blogs.tsx
│   │   ├── inventory.tsx
│   │   ├── seller-payouts.tsx
│   │   ├── support.tsx
│   │   ├── activity-logs.tsx
│   │   ├── ai-search.tsx
│   │   └── wishlist-insights.tsx
│   └── seller/                  ← Seller dashboard (role-gated)
│       ├── _layout.tsx
│       ├── index.tsx            ← Seller dashboard
│       ├── products.tsx
│       ├── orders.tsx
│       ├── inventory.tsx
│       ├── payouts.tsx
│       ├── analytics.tsx
│       └── profile.tsx
│
├── components/                  ← Reusable UI components
│   ├── Common/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── InfoPageTemplate.tsx
│   ├── Home/
│   │   ├── HeroSection.tsx
│   │   ├── BestSellersSection.tsx
│   │   ├── CategorySection.tsx
│   │   ├── BlogSection.tsx
│   │   ├── FeatuerSection.tsx
│   │   ├── FlashSaleBanner.tsx
│   │   ├── PopularProducts.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── AboutBrandSection.tsx
│   │   └── InstagramGallerySection.tsx
│   ├── Shop/
│   │   ├── ProductCard.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── CategoryChips.tsx
│   │   ├── HeroSection_shop.tsx
│   │   └── ShopTopBar.tsx
│   ├── Cart/
│   │   ├── CartItemCard.tsx
│   │   ├── CartSummarySidebar.tsx
│   │   ├── CartHeader.tsx
│   │   ├── CartEmptyState.tsx
│   │   ├── CartSupportSections.tsx
│   │   ├── cartTheme.ts
│   │   └── cartUtils.ts
│   ├── Wishlist/
│   │   ├── WishlistItemCard.tsx
│   │   ├── WishlistSharePanel.tsx
│   │   ├── WishlistHeader.tsx
│   │   ├── WishlistEmptyState.tsx
│   │   ├── WishlistQuickViewModal.tsx
│   │   ├── WishlistRecommendationCard.tsx
│   │   ├── WishlistSectionHeader.tsx
│   │   ├── WishlistTrustSignals.tsx
│   │   ├── wishlistTheme.ts
│   │   └── wishlistUtils.ts
│   ├── AISearch/
│   │   ├── AISearchHero.tsx
│   │   ├── AISearchProductCard.tsx
│   │   ├── AISearchFilterPanel.tsx
│   │   ├── AISearchAssistantPanel.tsx
│   │   ├── AISearchIntentPanel.tsx
│   │   ├── AISearchQuickActionsBar.tsx
│   │   ├── AISearchQuickViewModal.tsx
│   │   ├── AISearchSectionHeader.tsx
│   │   ├── AISearchSocialProof.tsx
│   │   ├── AISearchSuggestionStrip.tsx
│   │   ├── aiSearchTheme.ts
│   │   └── aiSearchUtils.ts
│   ├── Categories/
│   │   ├── CategoryCard.tsx
│   │   ├── CategoryHero.tsx
│   │   ├── CategorySectionIntro.tsx
│   │   ├── CategorySkeleton.tsx
│   │   ├── CategoryStatePanel.tsx
│   │   ├── CategoryStatsBar.tsx
│   │   ├── CTA_Category.tsx
│   │   └── useCategoryLayout.ts
│   ├── About/
│   ├── Contact/
│   ├── Customer/
│   ├── admin/
│   │   └── AnalyticsCharts.tsx
│   ├── ui/
│   │   ├── blog_card.tsx
│   │   ├── collapsible.tsx
│   │   ├── icon-symbol.tsx
│   │   ├── icon-symbol.ios.tsx
│   │   └── news-letter.tsx
│   ├── AIImageSearch.tsx
│   ├── ContactSection.tsx
│   └── PageShell.tsx
│
├── context/
│   ├── AuthContext.tsx          ← JWT auth, session persistence, role checks
│   ├── CartContext.tsx          ← Cart state
│   ├── WishlistContext.tsx      ← Wishlist state
│   └── ToastContext.tsx         ← Toast notifications
│
├── services/
│   └── api.ts                   ← Axios instance + all API call functions
│
├── constants/
│   ├── theme.ts                 ← Base design tokens
│   ├── brandTheme.ts            ← Brand colors and typography
│   ├── adminTheme.ts            ← Admin panel theme
│   ├── sellerTheme.ts           ← Seller dashboard theme
│   ├── shopTheme.ts             ← Shop theme
│   └── infoPageContent.ts       ← Static content for info pages
│
├── hooks/
│   ├── useProtectedRoute.ts     ← Redirect unauthenticated users
│   ├── useHeaderScroll.ts       ← Animated header on scroll
│   ├── use-color-scheme.ts      ← Dark/light mode detection
│   └── use-theme-color.ts       ← Theme-aware color helper
│
├── types/
│   └── shop.ts                  ← TypeScript types for shop domain
│
├── utils/
│   └── shopHelpers.ts           ← Utility functions for shop logic
│
├── Data/
│   ├── blog-data.ts             ← Static blog data
│   └── product-data.ts          ← Static product data
│
├── assets/images/               ← App icons, splash screen, images
├── app.json                     ← Expo app configuration
├── babel.config.js
├── tailwind.config.js           ← Tailwind / NativeWind config
├── tsconfig.json
├── metro.config.js
└── global.css                   ← Global CSS (NativeWind)
```

---

## Architecture

### Routing (Expo Router)

Expo Router uses the `app/` directory for **file-based routing** — similar to Next.js. Each `.tsx` file becomes a route automatically.

| File                      | Route              |
| ------------------------- | ------------------ |
| `app/index.tsx`           | `/`                |
| `app/shop.tsx`            | `/shop`            |
| `app/product-single.tsx`  | `/product-single`  |
| `app/admin/index.tsx`     | `/admin`           |
| `app/admin/users.tsx`     | `/admin/users`     |
| `app/seller/products.tsx` | `/seller/products` |

**Navigating between screens:**

```tsx
import { router } from "expo-router";

// Push a new screen
router.push("/shop");

// Push with params
router.push({ pathname: "/product-single", params: { id: product._id } });

// Replace current screen
router.replace("/login");

// Go back
router.back();
```

**Reading route params:**

```tsx
import { useLocalSearchParams } from "expo-router";

const { id } = useLocalSearchParams<{ id: string }>();
```

### Authentication (AuthContext)

`AuthContext` manages the full authentication lifecycle. Wrap your component tree with `AuthProvider` (already done in `app/_layout.tsx`).

```tsx
import { useAuth } from "@/context/AuthContext";

const { user, isAdmin, isSeller, userToken, login, logout, validateSession } =
  useAuth();
```

**Key behaviors:**

- Token is persisted in `AsyncStorage` under `auth_token`
- User data is cached under `auth_user`
- `setAuthToken(token)` attaches `Authorization: Bearer <token>` to all Axios requests automatically
- A `401` response from the API triggers automatic logout
- `isAdmin` and `isSeller` are computed booleans derived from `user.role`

**Login flow:**

```tsx
import { loginUser } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const { login } = useAuth();

const handleLogin = async () => {
  const { data } = await loginUser({ email, password });
  login(data.token, data.user); // persists to AsyncStorage
};
```

### API Layer (services/api.ts)

All API calls go through a single Axios instance in `services/api.ts`. The base URL is auto-detected based on the platform.

**Using API functions:**

```tsx
import { getProducts, addToCartAPI, getMyOrders } from "@/services/api";

// Fetch products with filters
const { data } = await getProducts({ page: 1, limit: 20, category: "rings" });

// Add to cart
await addToCartAPI(productId, 1, variantId);

// Get orders
const { data: orders } = await getMyOrders({ page: 1, status: "pending" });
```

**Error handling:**

```tsx
import { getApiErrorMessage } from "@/services/api";

try {
  await someApiCall();
} catch (error) {
  const message = getApiErrorMessage(error); // human-readable error string
  showToast(message);
}
```

**Building asset URLs:**

```tsx
import { getAssetUrl } from "@/services/api";

// Converts relative paths like "/uploads/image.jpg" to full URLs
const imageUrl = getAssetUrl(product.images[0]);
```

### Styling (NativeWind + Tailwind)

NativeWind lets you use Tailwind utility classes directly on React Native components:

```tsx
<View className="flex-1 bg-white px-4 py-6">
  <Text className="text-2xl font-bold text-gray-900 mb-2">
    Handcrafted Rings
  </Text>
  <Text className="text-base text-gray-500">Discover our collection</Text>
</View>
```

**Custom theme tokens** are defined in `constants/`. Use them for brand-consistent colors:

```tsx
import { brandTheme } from '@/constants/brandTheme';

<View style={{ backgroundColor: brandTheme.primary }}>
```

**Fonts** (Inter + Playfair Display) are loaded via `@expo-google-fonts` in `app/_layout.tsx`.

### State Management

Global state is managed through React Context:

| Context           | Purpose                        |
| ----------------- | ------------------------------ |
| `AuthContext`     | User session, JWT token, role  |
| `CartContext`     | Cart items, quantities, totals |
| `WishlistContext` | Wishlist items                 |
| `ToastContext`    | Toast notification queue       |

---

## Common Development Tasks

### Adding a New Screen

Create a file in `app/`. For example, `app/new-arrivals.tsx`:

```tsx
import { View, Text, ScrollView } from "react-native";
import { Stack } from "expo-router";

export default function NewArrivalsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Arrivals" }} />
      <ScrollView className="flex-1 bg-white">
        <View className="p-4">
          <Text className="text-2xl font-bold">New Arrivals</Text>
        </View>
      </ScrollView>
    </>
  );
}
```

Navigate to it from anywhere:

```tsx
router.push("/new-arrivals");
```

### Adding a New API Function

Open `services/api.ts` and add your function:

```ts
// Fetch new arrivals
export const getNewArrivals = (params?: { limit?: number }) =>
  api.get("/products/new-arrivals", { params });
```

### Protecting a Route (Redirect if Not Logged In)

```tsx
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function MyProtectedScreen() {
  useProtectedRoute(); // redirects to /login if not authenticated

  return <View>...</View>;
}
```

### Protecting a Route by Role

```tsx
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useEffect } from "react";

export default function AdminOnlyScreen() {
  const { isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, isLoading]);

  if (isLoading) return null;
  return <View>...</View>;
}
```

### Adding a New Reusable Component

Create it in the appropriate `components/` subfolder. Follow the existing pattern:

```
components/MyFeature/
  MyFeatureCard.tsx       ← Main component
  MyFeatureHeader.tsx     ← Sub-component
  myFeatureTheme.ts       ← Theme constants for this feature
  myFeatureUtils.ts       ← Utility functions
```

### Showing a Toast Notification

```tsx
import { useToast } from "@/context/ToastContext";

const { showToast } = useToast();

showToast("Item added to cart!");
showToast("Something went wrong", "error");
```

### Using the Cart

```tsx
import { useCart } from "@/context/CartContext";

const { cartItems, addToCart, removeFromCart, cartTotal } = useCart();

await addToCart(productId, 1, variantId);
```

### Picking an Image (for AI Search or Profile)

```tsx
import * as ImagePicker from "expo-image-picker";

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (!result.canceled) {
    const uri = result.assets[0].uri;
    // use uri...
  }
};
```

---

## Linting

```bash
npm run lint
```

This runs ESLint with the Expo config. Fix issues before committing.

---

## Troubleshooting

### "Network request failed" on physical device

Set `EXPO_PUBLIC_API_URL` in your `.env` to your machine's LAN IP:

```
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

Find your IP with `ipconfig` (Windows) or `ifconfig` (macOS/Linux).

### Metro bundler cache issues / stale code

```bash
npx expo start --clear
```

### NativeWind styles not applying

1. Check `tailwind.config.js` — the `content` array must include your file paths
2. Restart Metro after any config change
3. Make sure `global.css` is imported in `app/_layout.tsx`

### Fonts not loading / text looks wrong

Fonts are loaded asynchronously in `app/_layout.tsx`. If you see a flash of unstyled text, check that `useFonts()` is awaited before rendering the app.

### Android emulator can't reach the backend

The emulator uses `10.0.2.2` to reach `localhost` on your host machine. This is handled automatically. If it still fails, check that the backend is running and not blocked by a firewall.

### iOS simulator can't reach the backend

Use `localhost` or your machine's LAN IP. Set `EXPO_PUBLIC_API_URL=http://localhost:5000` for simulator testing.

### Expo Router not finding a screen

- File names must match the route exactly (case-sensitive on macOS/Linux)
- The file must export a **default** React component
- Restart Metro after adding new files

### `useAuth must be used within AuthProvider`

Make sure the component is rendered inside `AuthProvider`. This is set up in `app/_layout.tsx` — if you see this error, check that your screen is within the router's layout tree.

### TypeScript errors after adding new files

Run `npx tsc --noEmit` to check for type errors. The `tsconfig.json` uses path aliases (`@/` maps to the project root).
