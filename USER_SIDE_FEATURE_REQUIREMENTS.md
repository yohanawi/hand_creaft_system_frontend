# HandCraft Jewelry User-Side Feature Requirements

Status: Draft based on frontend and backend code review on 2026-05-08

Scope: Customer-facing web and app experience across the Expo frontend, Express backend, and AI search service

## 1. Purpose

This document defines the requirements to bring the HandCraft Jewelry customer side to a release-ready state with working interfaces, stable business flows, and a more professional brand presentation.

This is not only a feature inventory. It is the working definition of what must function correctly before the customer experience can be considered complete.

## 2. Release Goal

The customer side is considered complete when:

1. All P0 and P1 customer journeys work end to end without blocking defects.
2. Customer-facing screens are responsive, polished, and visually consistent across mobile, tablet, and web.
3. Frontend state stays consistent with backend truth for cart, wishlist, profile, orders, support, and payment flows.
4. Error states are understandable, recoverable, and brand-consistent.
5. The customer experience reflects a premium handcrafted jewelry brand rather than a generic e-commerce template.

## 3. Current System Baseline

### Frontend stack

- Expo Router with React Native and NativeWind
- Customer routes already exist for home, shop, product detail, auth, cart, checkout, wishlist, dashboard, profile, orders, order tracking, support, blogs, and AI image search

### Backend stack

- Express with MongoDB and Mongoose
- API surface already exists for auth, address book, customer overview, products, categories, cart, wishlist, orders, payments, support, blogs, reviews, coupons, and AI search

### AI service

- Separate Python service used for image-based product discovery

## 4. Reviewed Customer Surface

| Domain                     | Frontend routes                                                                     | Backend endpoints                                                                                           | Review status                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Public home and discovery  | `/`, `/shop`, `/categories`, `/best-sellers`, `/deals`                              | `/api/products`, `/api/categories`, `/api/subcategories`                                                    | Implemented, needs UX consistency and regression testing                                  |
| Product detail and reviews | `/product-single`                                                                   | `/api/products/:slug`, `/api/products/:id/reviews`                                                          | Implemented, launch-critical                                                              |
| Authentication             | `/login`, `/register`, `/forgot-password`, `/reset-password`                        | `/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password`            | Implemented, needs production-ready recovery handling                                     |
| Cart                       | `/cart`                                                                             | `/api/cart`                                                                                                 | Implemented, high-risk because pricing, inventory, and optimistic state must stay aligned |
| Checkout and payment       | `/checkout`, `/payment-success`, `/payment-failure`                                 | `/api/orders`, `/api/coupons/validate`, `/api/payments/payhere/*`                                           | Implemented, highest priority                                                             |
| Wishlist                   | `/wishlist`                                                                         | `/api/wishlist`                                                                                             | Implemented, needs sync hardening                                                         |
| Customer workspace         | `/customer-dashboard`, `/profile`, `/orders`, `/order-tracking`, `/support-tickets` | `/api/auth/customer-overview`, `/api/auth/me`, `/api/auth/addresses`, `/api/orders/my*`, `/api/support/my*` | Implemented, launch-critical                                                              |
| Contact and support        | `/contact`, `/support-tickets`                                                      | `/api/support/tickets`, `/api/support/my*`                                                                  | Implemented                                                                               |
| Blogs and comments         | `/blogs`, `/blog-single`                                                            | `/api/blogs`, `/api/blogs/:blogId/comments`                                                                 | Implemented, secondary commerce-supporting content                                        |
| AI image search            | `/ai-search`                                                                        | `/api/ai-search/health`, `/api/ai-search/search`                                                            | Implemented, enhancement feature                                                          |

## 5. Findings From Review

### Confirmed and already fixed

1. Backend checkout defect: order creation referenced `isPayHereOrder` before initialization inside the order-building path. This could break customer checkout at runtime. The issue was fixed in `backend/src/controllers/orderController.js` on 2026-05-08.

### Open risks identified during review

1. Cart context and wishlist context use optimistic updates and swallow sync failures silently. The UI can appear successful even if the backend rejects or fails to persist a change.
2. Forgot-password is usable for development, but production readiness depends on email delivery, branded templates, and a non-manual reset experience.
3. Blog category filtering is built from the fetched page dataset, so category completeness is not guaranteed across pagination.
4. Customer-facing success criteria are not yet defined in one place, which makes it hard to verify when the user side is actually complete.

## 6. Functional Requirements

### FR-01 Public storefront and navigation

The user side must provide a complete public storefront for browsing, discovery, and trust-building before login.

Requirements:

1. Home page must expose hero merchandising, category discovery, featured products, brand story, trust signals, and social proof.
2. Global navigation must link reliably to shop, categories, best sellers, deals, blogs, about, contact, cart, wishlist, login, and profile/dashboard when authenticated.
3. Footer and legal routes must remain accessible from all customer pages.
4. Public pages must support direct deep linking.

Acceptance criteria:

1. Every public route loads without runtime error.
2. Every major CTA opens the expected page.
3. All empty and failed network states show a recovery path.

### FR-02 Catalog browsing, filtering, and search

Customers must be able to discover products through browsing, filtering, sorting, and search.

Requirements:

1. Shop page must load product and category data from the backend.
2. Filters must support at minimum category, material, and text search.
3. Sorting must support default, price ascending, and price descending.
4. Product availability and sale pricing must be visible in catalog cards.
5. Category and subcategory-based discovery must be preserved even when filters are active.

Acceptance criteria:

1. Filter changes update visible products correctly.
2. Search returns matching products only.
3. Out-of-stock or inactive products are not presented as purchasable.

### FR-03 Product detail, variants, and reviews

The product page must support informed purchase decisions.

Requirements:

1. Product detail must show images, price, sale price, material, description, stock state, SKU, category, and delivery/policy details when present.
2. Variant selection must be enforced for products that require it.
3. Quantity controls must respect available stock.
4. Add-to-cart and wishlist actions must work from the product detail page.
5. Review listing, create, update, and delete must work for authenticated customers.

Acceptance criteria:

1. Variant products cannot be added without a valid variant choice.
2. Stock validation must block overselling.
3. Review operations return immediate visual feedback.

### FR-04 Authentication and session management

Authentication must support the complete customer lifecycle.

Requirements:

1. Registration must create a customer account and open the authenticated customer flow.
2. Login must redirect regular users to `/customer-dashboard`.
3. Remember-me persistence must restore a previous authenticated session.
4. Logout must clear user, cart, and wishlist session state.
5. Forgot-password and reset-password must work end to end in development and production modes.

Acceptance criteria:

1. Customer sessions restore correctly after app reload when persistence is enabled.
2. Protected screens must block unauthorized access and route users to login.
3. Password reset must always end in a working login using the new password.

### FR-05 Cart management

The cart must remain accurate, inventory-aware, and recoverable.

Requirements:

1. Add, update quantity, remove, and clear operations must work for base products and variant products.
2. Cart totals must use sale price when applicable.
3. Shipping and tax preview must be calculated consistently with backend order logic.
4. Coupon preview must validate against the backend and clearly show discount impact.
5. Moving cart items to wishlist must preserve product identity and variant context where applicable.

Acceptance criteria:

1. UI totals match backend-accepted totals for the same cart.
2. Server rejection must be surfaced to the user instead of silently ignored.
3. Refreshing the app while authenticated must restore server cart state.

### FR-06 Wishlist management

Wishlist must support both inspiration saving and conversion back into cart.

Requirements:

1. Add and remove must work from product cards and product detail.
2. Wishlist page must show pricing, stock awareness, and quick re-entry into product detail.
3. Customers must be able to move individual or all eligible wishlist items into cart.
4. Sharing and alert preferences may remain enhancement features, but core save/remove/add-to-cart must be stable.

Acceptance criteria:

1. Wishlist state remains correct after reload for authenticated users.
2. Adding an in-stock wishlist item to cart succeeds without duplication bugs.
3. Logged-out behavior is clearly defined and not destructive.

### FR-07 Checkout and payment

Checkout is the most critical customer journey and must be fully reliable.

Requirements:

1. Checkout must require authentication.
2. Customers must be able to use a saved address or enter a manual shipping address.
3. Coupon validation must occur before order placement.
4. COD orders must complete immediately and clear the cart on success.
5. PayHere orders must create an order, open the payment session, and support success, failure, and cancellation recovery.
6. Inventory reservation and release must stay consistent across success, failure, and cancellation.

Acceptance criteria:

1. COD checkout creates a valid order and routes to success.
2. PayHere checkout creates a valid order and opens the payment flow when configured.
3. Failed payment paths still leave the customer with a recoverable order state.
4. Cart is not left in a contradictory state after payment failure, retry, or cancellation.

### FR-08 Orders and tracking

Customers must be able to understand and manage post-purchase activity.

Requirements:

1. Orders page must list customer orders with filtering and pagination.
2. Order detail and tracking must show status, payment state, shipment data, items, and tracking events.
3. Customers must be able to cancel eligible orders only in allowed pre-fulfilment states.
4. PayHere orders awaiting payment must provide a payment recovery path.

Acceptance criteria:

1. All order states render meaningful labels and actions.
2. Cancel is blocked for non-cancellable states.
3. Tracking history renders in chronological and understandable form.

### FR-09 Profile and address book

Account management must be complete from the customer workspace.

Requirements:

1. Customers must be able to update name, email, and phone.
2. Customers must be able to change password.
3. Address CRUD must support create, edit, delete, and default selection.
4. Profile updates must refresh the in-app customer context immediately.

Acceptance criteria:

1. Updated profile data persists after reload.
2. Default address selection is respected in checkout.
3. Email uniqueness and password validation errors are clearly surfaced.

### FR-10 Support and contact flow

Support must work for both anonymous and authenticated customers.

Requirements:

1. Public contact form must create a support ticket.
2. Logged-in customers must see ticket history and ticket details.
3. Customers must be able to reply to open or pending tickets.
4. Ticket status and priority must be visible.
5. Closed tickets must block new replies and communicate that state clearly.

Acceptance criteria:

1. A ticket created from contact appears in the customer ticket history when the user is authenticated.
2. Replying to a ticket updates the thread and list view.
3. Support status changes are visible after refresh.

### FR-11 Customer dashboard

The dashboard must act as a command center rather than a static welcome page.

Requirements:

1. Dashboard must show summary metrics, recent orders, support state, cart state, wishlist count, and default address.
2. All summary cards must route into the related customer workspace area.
3. Refresh must reload live customer overview data.
4. Empty states must still provide useful actions.

Acceptance criteria:

1. Counts match backend summary values.
2. Recent order and support data reflect latest activity.
3. Dashboard remains usable on narrow mobile layouts.

### FR-12 Blogs and brand content

Blogs must support brand storytelling and SEO-oriented discovery.

Requirements:

1. Blog listing must support loading, search, category filtering, and navigation to detail pages.
2. Blog detail must render article content, metadata, comments, and related posts.
3. Authenticated users must be able to comment.

Acceptance criteria:

1. Blog navigation and detail routes work from direct links.
2. Comment submission works for authenticated users and redirects unauthenticated users to login.

### FR-13 AI image search

AI image search is an enhancement but should still behave as a stable customer-facing feature when enabled.

Requirements:

1. Customers must be able to upload an image and receive similar products.
2. The UI must show AI service availability and clear failure states.
3. AI search results must route back into normal product detail and cart flows.

Acceptance criteria:

1. Health check and search flows do not fail silently.
2. AI results are actionable, not informational only.

## 7. Backend Requirements Supporting the User Side

1. All customer API routes must return predictable success and error shapes.
2. All protected routes must reject unauthorized access with consistent status codes.
3. Inventory checks must happen server-side for cart updates and order placement.
4. Payment lifecycle must preserve order and inventory integrity in every branch.
5. Customer overview aggregation must stay fast enough for dashboard refreshes.
6. Coupon validation must share the same logic in cart preview and final checkout.
7. Support ticket ownership must prevent cross-user access.

## 8. UX and Redesign Requirements

The user side should be upgraded from functional but mixed styling into a premium, cohesive jewelry storefront.

### Creative direction

1. Visual language should feel editorial, handcrafted, and premium.
2. Primary palette should stay in warm neutrals, polished gold, stone, parchment, and deep espresso tones.
3. Typography should emphasize luxury merchandising and readable long-form content.
4. Motion should be subtle and purposeful, especially around hero areas, product reveals, and dashboard transitions.

### Interface requirements

1. Home, shop, product detail, cart, checkout, dashboard, and profile must share one clear design system.
2. Cards, spacing, button treatments, icon language, and empty states must be consistent.
3. Checkout and account areas must emphasize clarity, trust, and conversion over decoration.
4. Mobile layouts must prioritize one-handed readability and clear action placement.
5. Desktop layouts must feel premium and spacious, not stretched or generic.

### Customer trust requirements

1. Pricing, shipping, delivery estimate, return policy, and payment state must always be visible in the moments customers need them.
2. Payment failure and retry states must reduce anxiety and explain what happens next.
3. Support access must remain visible during account, order, and checkout flows.

## 9. Non-Functional Requirements

1. No customer page should throw an unhandled runtime error during normal use.
2. Network failures must show recoverable feedback.
3. Customer actions must not appear successful if the backend rejects them.
4. Pages must remain responsive on current phone, tablet, and desktop breakpoints.
5. Asset URLs and uploaded media must resolve correctly from frontend to backend.
6. Authentication persistence must not leak across logout.

## 10. Priority Levels

### P0 must work before release

1. Register, login, logout, forgot password, reset password
2. Product browsing, filtering, and product detail
3. Cart add, update, remove, and clear
4. Wishlist add and remove
5. Checkout with saved and manual address
6. COD order placement
7. PayHere payment initiation, success, failure, retry, and cancellation recovery
8. Orders list, order tracking, and eligible cancellation
9. Profile update and address CRUD
10. Contact form, support ticket history, and ticket reply

### P1 should work for launch quality

1. Product reviews
2. Coupon application preview and final checkout usage
3. Dashboard summary accuracy and refresh
4. Blog browse and comment flow
5. AI image search when the service is enabled

### P2 can ship after launch if needed

1. Wishlist sharing enhancements
2. Wishlist alert preferences
3. Additional personalization such as recently viewed, reorder shortcuts, or loyalty features

## 11. QA and UAT Checklist

The project should not be called complete until these tests pass.

1. Register a new customer and verify redirect to dashboard.
2. Log out and log back in with remember-me both enabled and disabled.
3. Browse products, filter by category and material, and open product detail from multiple entry points.
4. Add a simple product to cart.
5. Add a variant product to cart and verify variant-specific quantity behavior.
6. Apply a valid coupon and an invalid coupon.
7. Complete a COD checkout with a saved address.
8. Complete a COD checkout with a manual address.
9. Start a PayHere checkout and verify success route.
10. Start a PayHere checkout and verify failure and retry route.
11. Cancel an eligible order and confirm inventory restoration.
12. Open order tracking and verify status timeline.
13. Update profile data and reload the app.
14. Create, edit, delete, and set a default address.
15. Add and remove wishlist items from both listing and product detail.
16. Move a wishlist item into cart.
17. Create a support ticket while logged out.
18. Create a support ticket while logged in and verify it appears in ticket history.
19. Reply to an open ticket and verify thread refresh.
20. Run forgot-password and reset-password end to end.
21. Post a product review as an authenticated user.
22. Open blog list, open blog detail, and post a comment as an authenticated user.
23. Run AI image search if the AI service is available.
24. Repeat the full checkout path on mobile-width web and desktop-width web.

## 12. Recommended Delivery Sequence

### Phase 1 stability

1. Fix customer-facing defects in checkout, cart sync, wishlist sync, auth recovery, and order recovery.
2. Add focused validation for backend order, payment, cart, and support flows.
3. Standardize customer-facing error handling.

### Phase 2 redesign

1. Unify design tokens, spacing, typography, and page shells.
2. Redesign the highest-impact customer pages: home, shop, product detail, cart, checkout, dashboard, profile, orders.
3. Upgrade empty, loading, and failure states.

### Phase 3 hardening

1. Run the full UAT checklist.
2. Fix responsive regressions.
3. Verify production payment and password-recovery behavior.

## 13. Definition of Completion

The customer side should be called complete only when:

1. All P0 requirements are implemented and verified.
2. All launch-critical defects are closed.
3. The redesign has been applied consistently to the core user journey.
4. UAT evidence exists for the checklist above.
5. Customer flows no longer rely on unverified assumptions or silent fallback behavior.
