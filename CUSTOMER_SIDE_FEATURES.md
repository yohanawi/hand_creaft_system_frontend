# Customer Side Feature Set

This document defines what should be available after a customer logs in to the HandCraft jewellery platform and maps that scope to the implemented frontend routes.

## Core Customer Experience

1. Customer dashboard
   - Personalized welcome area
   - Account snapshot
   - Quick links into the most-used customer actions
   - Summary cards for orders, wishlist, bag, and delivered purchases
   - Implemented in `/customer-dashboard`

2. Profile and account management
   - View and update full name, email, and phone number
   - Change password
   - Log out securely
   - Implemented in `/profile`

3. Address book
   - Add address
   - Edit address
   - Delete address
   - Set default address
   - Implemented in `/profile`

4. Orders workspace
   - View all orders
   - Filter by order status
   - Review payment state
   - Cancel eligible orders
   - Retry payment when supported
   - Implemented in `/orders`

5. Order tracking
   - Open a detailed tracking view by order number
   - Follow fulfillment progress after purchase
   - Implemented in `/order-tracking`

6. Cart and checkout flow
   - Maintain bag contents
   - Update item quantities
   - Remove items
   - Apply coupon codes
   - Choose saved or manual shipping address
   - Complete payment through supported methods
   - Implemented in `/cart` and `/checkout`

7. Wishlist
   - Save favourite handcrafted products
   - Review stock-aware wishlist items
   - Move selected products into the cart
   - Implemented in `/wishlist`

8. Support center
   - Create a support ticket
   - Review ticket history
   - Reply to support messages
   - Track ticket status
   - Implemented in `/contact` and `/support-tickets`

9. Shopping continuation
   - Resume browsing collections after login
   - Jump back into categories, deals, and product discovery
   - Implemented through `/shop` and linked public shopping routes

10. Session-aware login behavior
    - Customer login redirects to the dashboard
    - “Remember me” controls persisted login state
    - Implemented in `/login` with auth context persistence

## Design Requirements

1. Responsive layout for phone, tablet, and large-screen web views
2. NativeWind-first layout styling for the customer hub
3. Jewellery-appropriate visual direction with warm material tones and editorial typography
4. Clear call-to-action routing from dashboard to operational customer screens

## Implemented Logged-In Entry Point

- Customer login now routes regular users to `/customer-dashboard`
- Admin login still routes to `/admin`
- The dashboard aggregates:
  - profile information
  - saved addresses
  - recent orders
  - support ticket state
  - cart state
  - wishlist state

## Recommended Future Enhancements

1. Loyalty and rewards wallet
2. Product review history from the customer account area
3. Reorder shortcut for completed orders
4. Push notification preferences for delivery and support updates
5. Saved payment methods if the payment provider and backend model support them
