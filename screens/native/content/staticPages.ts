export const aboutSections = [
  {
    heading: "HandCraft story",
    body: "HandCraft is presented in the native app as a premium customer storefront for handcrafted jewellery, with the customer journey separated from the web-specific shell and back-office routes.",
  },
  {
    heading: "Why this native structure exists",
    body: "The APK now uses a dedicated screens tree so mobile product discovery, checkout, account management, and support can evolve without rewriting or disturbing the current app-folder routes used by the web version.",
  },
];

export const faqSections = [
  {
    heading: "Orders and delivery",
    body: "Customers can place COD or PayHere orders, track progress through the native orders flow, and review payment recovery when an online payment does not complete.",
  },
  {
    heading: "Account and support",
    body: "Profile updates, address book management, password changes, and support ticket conversations all continue to use the existing backend endpoints inside the new APK-oriented screens.",
  },
];

export const privacySections = [
  {
    heading: "Data usage",
    body: "The customer APK relies on the same account, order, wishlist, cart, and support data already used by the current system. Sensitive handling rules should remain aligned with your backend and deployment policies.",
  },
  {
    heading: "Session behavior",
    body: "Authentication, remembered sessions, and account data sync are driven by the existing auth context and backend APIs, now presented through a mobile-specific interface.",
  },
];

export const shippingSections = [
  {
    heading: "Checkout readiness",
    body: "Shipping addresses, delivery details, and order notes are collected by the native checkout screen and sent to the same order creation endpoint already used by the web storefront.",
  },
  {
    heading: "Tracking updates",
    body: "Customers can monitor shipment progress, payment state, and fulfilment history from the native orders and order-tracking screens without leaving the app.",
  },
];

export const termsSections = [
  {
    heading: "Customer flows",
    body: "The APK customer surface intentionally focuses on discovery, cart, checkout, account, support, and content. Seller and admin flows are not exposed through the native route overrides.",
  },
  {
    heading: "Platform continuity",
    body: "All mobile customer actions still rely on your existing backend rules, payment integration, and account state. The new separation is a routing and screen-organization change, not a backend fork.",
  },
];
