import type { InfoPageContent } from "@/components/Common/InfoPageTemplate";

export const termsPageContent: InfoPageContent = {
  eyebrow: "SERVICE TERMS",
  title: "Terms & Conditions",
  subtitle:
    "These terms explain how the storefront, your account, payments, delivery, returns, and dispute handling work when you use the platform.",
  lastUpdated: "May 5, 2026",
  icon: "file-text",
  gradient: ["#2F1B14", "#6B3A21", "#B57A48"],
  stats: [
    { label: "Account age", value: "18+" },
    { label: "Return window", value: "30 days" },
    { label: "Support hours", value: "6 days" },
  ],
  intro: [
    "Using the platform means you agree to the rules described here. They exist to set clear expectations for shoppers, protect the business from abuse, and make the checkout experience predictable.",
    "The terms apply whether you are browsing casually, placing an order, writing a review, or contacting support. If you do not agree with them, the correct action is to stop using the service.",
  ],
  calloutTitle: "Use of the service creates a binding agreement.",
  calloutText:
    "Once you continue browsing, create an account, or place an order, these terms govern that activity unless a separate written agreement overrides them.",
  sections: [
    {
      id: "acceptance",
      title: "Acceptance and Eligibility",
      body: [
        "You must be legally able to enter a contract in your jurisdiction to use the service. If you use the platform on behalf of a company or another person, you confirm you have authority to do so.",
      ],
      bullets: [
        "You agree to provide accurate information when you register, order, or request support.",
        "You must not create accounts with false details or use someone else’s account without permission.",
        "We may refuse or suspend service if your use creates legal, fraud, or operational risk.",
      ],
    },
    {
      id: "catalog",
      title: "Catalog, Pricing, and Availability",
      body: [
        "We work to keep descriptions, prices, images, and inventory accurate, but listings can change without notice. Availability is not guaranteed until an order has been accepted and processed.",
      ],
      bullets: [
        "Product colors and scale may appear different across devices.",
        "Pricing errors may be corrected before or after order submission if required by law.",
        "We may limit quantities, discontinue items, or restrict promotions at any time.",
      ],
      note: "If an item becomes unavailable after purchase, the usual remedy is cancellation, refund, or a substitute only if you approve it.",
    },
    {
      id: "payments",
      title: "Payments and Billing Responsibility",
      body: [
        "Payment is due when you place the order, using one of the supported payment methods. By submitting payment details, you confirm you are authorized to use them and that the billing information is correct.",
      ],
      bullets: [
        "Taxes, duties, shipping fees, or handling charges may apply depending on location and order type.",
        "Promotional pricing only applies during the published offer period and under its stated conditions.",
        "Chargeback abuse or payment fraud can lead to account suspension and order restrictions.",
      ],
    },
    {
      id: "shipping",
      title: "Shipping, Delivery, and Risk Transfer",
      body: [
        "Shipping estimates are targets, not guarantees. Delivery timing depends on carrier performance, customs clearance, weather, location, and payment verification.",
      ],
      bullets: [
        "Risk of loss may transfer according to the shipping method and applicable law once the order is handed to the carrier.",
        "International customers are responsible for import duties, taxes, and customs-related delays unless the checkout flow says otherwise.",
        "Incorrect addresses, refused deliveries, or repeated failed delivery attempts can create extra charges or return delays.",
      ],
    },
    {
      id: "returns",
      title: "Returns, Refunds, and User Conduct",
      body: [
        "Returns are governed by the published return policy and any product-specific exclusions. Refunds are usually sent back to the original payment method after inspection and approval.",
        "You also agree not to misuse the site, interfere with its operation, scrape data without permission, upload harmful content, or engage in fraud, harassment, or unlawful conduct.",
      ],
      bullets: [
        "Custom, personalized, final-sale, or damaged-after-delivery items may be ineligible for return.",
        "Original shipping fees are generally non-refundable unless the item was defective or sent incorrectly.",
        "Violation of the conduct rules may result in account closure, content removal, order cancellation, or legal action.",
      ],
    },
    {
      id: "liability",
      title: "Intellectual Property, Liability, and Disputes",
      body: [
        "All store content, including copy, images, branding, and software, remains protected by intellectual property law. You may not reproduce or reuse that material without permission.",
        "To the maximum extent allowed by law, liability is limited to the amount paid for the relevant product or service, and certain indirect or consequential damages are excluded.",
      ],
      bullets: [
        "User-submitted reviews or media may be used under a non-exclusive license needed to operate and promote the service.",
        "Disputes should first be raised informally through support before escalation to court or arbitration if the policy requires it.",
        "These terms may be updated, and continued use after updates means you accept the revised version.",
      ],
    },
  ],
  highlights: [
    {
      icon: "user-check",
      title: "Account Responsibility",
      description:
        "You are responsible for activity under your account and for keeping credentials secure.",
    },
    {
      icon: "credit-card",
      title: "Payment Due at Checkout",
      description:
        "Orders require valid payment authorization before processing can begin.",
    },
    {
      icon: "refresh-cw",
      title: "Returns Follow Policy",
      description:
        "Refund timing and eligibility depend on the specific return rules and item condition.",
    },
    {
      icon: "shield",
      title: "Limited Liability",
      description:
        "The service limits legal exposure as permitted by law and reserves the right to restrict abusive use.",
    },
  ],
  links: [
    {
      title: "Privacy Policy",
      description:
        "See how personal data is collected, used, stored, and shared across the platform.",
      route: "/privacy-policy",
      icon: "shield",
    },
    {
      title: "Help & FAQ",
      description:
        "Get practical answers about orders, payments, accounts, and support.",
      route: "/help-faq",
      icon: "help-circle",
    },
    {
      title: "Shipping Policy",
      description:
        "Review processing, delivery windows, tracking, and international shipping rules.",
      route: "/shipping-policy",
      icon: "truck",
    },
  ],
  footerTitle: "Questions about the rules before you buy?",
  footerText:
    "Review the related policy pages first, then contact support if you need help interpreting delivery, returns, or account obligations for a specific order.",
};

export const privacyPageContent: InfoPageContent = {
  eyebrow: "DATA & PRIVACY",
  title: "Privacy Policy",
  subtitle:
    "This page explains what personal data is collected, why it is processed, how it is protected, and the controls you have over it.",
  lastUpdated: "May 5, 2026",
  icon: "shield",
  gradient: ["#2A201C", "#6C4A35", "#D0A37C"],
  stats: [
    { label: "Security layers", value: "Multi-step" },
    { label: "Marketing control", value: "Opt-out" },
    { label: "Data rights", value: "Access" },
  ],
  intro: [
    "Privacy matters because every order, support request, and account action creates information that needs to be handled responsibly. This policy defines the platform’s commitments around that data.",
    "The exact rights available to you can depend on where you live, but the platform is designed around basic principles of transparency, data minimization, access control, and security.",
  ],
  calloutTitle:
    "We collect only what is needed to operate and improve the service.",
  calloutText:
    "That includes order data, account details, support communications, device information, and limited marketing preferences, but not a blanket license to do anything with your data.",
  sections: [
    {
      id: "collect",
      title: "What We Collect",
      body: [
        "Information is collected when you create an account, place an order, contact support, subscribe to updates, browse the storefront, or interact with tools such as carts, wishlists, or saved preferences.",
      ],
      bullets: [
        "Identity and contact details such as your name, email address, phone number, and shipping or billing addresses.",
        "Transaction records including purchases, payment status, refunds, and delivery information.",
        "Technical and usage data such as IP address, device type, browser, operating system, referral source, and engagement behavior.",
        "Support and communication data including messages, tickets, and order-related correspondence.",
      ],
    },
    {
      id: "use",
      title: "Why We Use the Data",
      body: [
        "Collected information is used to process orders, maintain accounts, provide support, improve product discovery, prevent fraud, meet legal obligations, and communicate relevant updates.",
      ],
      bullets: [
        "To fulfill purchases, confirm payments, ship orders, and resolve returns or disputes.",
        "To personalize product suggestions, checkout defaults, and account experiences where appropriate.",
        "To send transactional notifications, service announcements, and marketing messages when lawful and permitted.",
        "To monitor performance, diagnose issues, and strengthen platform security.",
      ],
    },
    {
      id: "sharing",
      title: "Sharing and Service Providers",
      body: [
        "Data may be shared with trusted third parties only when necessary to operate the business or comply with the law. Examples include payment processors, delivery carriers, analytics tools, customer support systems, and legal or regulatory authorities.",
      ],
      bullets: [
        "We do not sell personal information for third-party marketing purposes.",
        "Service providers should receive only the data needed for their task.",
        "Business transfers such as mergers or acquisitions can include customer data as part of the assets involved.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies, Tracking, and Preferences",
      body: [
        "Cookies and similar technologies support session persistence, checkout continuity, product preferences, analytics, and limited marketing measurement.",
      ],
      bullets: [
        "Essential cookies keep the site functional and are usually required for core account and cart features.",
        "Performance cookies help measure how visitors move through the storefront so weak flows can be improved.",
        "Preference cookies remember choices such as saved items, region, or interface behavior where supported.",
        "You can control many cookies through browser settings, though some functionality may degrade if they are disabled.",
      ],
    },
    {
      id: "security",
      title: "Security, Retention, and International Transfers",
      body: [
        "Reasonable technical and organizational safeguards are used to protect data in transit and at rest. No system can promise absolute security, but the platform aims to reduce unnecessary exposure through restricted access and ongoing maintenance.",
      ],
      bullets: [
        "Retention periods depend on legal, accounting, operational, and dispute-resolution needs.",
        "Data may be transferred internationally when infrastructure or service providers operate across borders.",
        "When data is no longer required, it should be deleted, anonymized, or otherwise handled according to policy and law.",
      ],
      note: "If you suspect misuse of your data or unauthorized account access, contact support immediately so the issue can be investigated.",
    },
    {
      id: "rights",
      title: "Your Rights and Contact Options",
      body: [
        "Depending on jurisdiction, you may have rights to request access, correction, deletion, portability, restriction, or objection regarding your personal information.",
      ],
      bullets: [
        "Marketing messages can usually be stopped through unsubscribe links or account preference changes.",
        "Children’s data is not knowingly collected where the service is not intended for children.",
        "If the policy changes materially, updates should be posted clearly and may also be communicated directly when required.",
      ],
    },
  ],
  highlights: [
    {
      icon: "lock",
      title: "Security by Design",
      description:
        "Access controls, secure transport, and infrastructure safeguards reduce unnecessary exposure.",
    },
    {
      icon: "users",
      title: "No Data Selling",
      description:
        "Personal information is not sold to outside marketers as part of the business model.",
    },
    {
      icon: "sliders",
      title: "Preference Control",
      description:
        "You can update many communication and cookie choices through account or browser settings.",
    },
    {
      icon: "bell",
      title: "Change Transparency",
      description:
        "Material policy changes should be surfaced clearly so you can review them before continued use.",
    },
  ],
  links: [
    {
      title: "Terms & Conditions",
      description:
        "Read the rules governing purchases, accounts, payments, and acceptable use.",
      route: "/terms-conditions",
      icon: "file-text",
    },
    {
      title: "Help & FAQ",
      description:
        "Find operational answers about support, orders, and account recovery.",
      route: "/help-faq",
      icon: "help-circle",
    },
    {
      title: "Shipping Policy",
      description:
        "See how delivery timing, tracking, address issues, and customs handling are managed.",
      route: "/shipping-policy",
      icon: "truck",
    },
  ],
  footerTitle: "Need a practical answer, not just policy language?",
  footerText:
    "Use the support and shipping pages for operational questions, then come back to this policy when you need the formal explanation of how data handling works.",
};

export const helpFaqPageContent: InfoPageContent = {
  eyebrow: "CUSTOMER SUPPORT",
  title: "Help & FAQ",
  subtitle:
    "A practical support hub for the questions customers ask most often about orders, accounts, shipping, payments, returns, and storefront behavior.",
  lastUpdated: "May 5, 2026",
  icon: "help-circle",
  gradient: ["#241E1B", "#6B4F3B", "#D3AE86"],
  stats: [
    { label: "Typical replies", value: "24h" },
    { label: "Support channels", value: "3" },
    { label: "Return help", value: "Guided" },
  ],
  intro: [
    "Support works best when customers can answer routine questions immediately and escalate only the issues that genuinely need a person. This page is built for that fast first pass.",
    "It covers the most common checkout, delivery, account, refund, and technical questions, while still pointing you to the right next page if you need formal policy detail.",
  ],
  calloutTitle: "Start here before opening a ticket.",
  calloutText:
    "Many issues such as shipping progress, order confirmation timing, account sign-in problems, and return eligibility can be resolved faster through the guidance below.",
  sections: [
    {
      id: "support-channels",
      title: "How to Get Help Fast",
      body: [
        "Choose the support path that matches the issue. Order-specific questions are easier to resolve when you include the order number, account email, and a clear description of the problem.",
      ],
      bullets: [
        "Use account or order history pages first for live status, saved details, and past purchases.",
        "Use the contact or support ticket flow for delivery exceptions, damaged items, payment issues, or product concerns.",
        "For legal or data questions, review the policy pages before contacting support so the request is more precise.",
      ],
    },
    {
      id: "order-help",
      title: "Orders, Payments, and Returns",
      body: [
        "Orders usually move through confirmation, payment review, preparation, shipment, and delivery. A delay at any stage can be caused by stock availability, payment verification, address issues, or carrier events.",
      ],
      bullets: [
        "If your payment appears to fail, verify card details, available funds, and any bank authentication prompts before retrying.",
        "If you need to change an order, contact support quickly because edits are often limited once fulfillment begins.",
        "Return requests usually require the item to be unused, within the published window, and in eligible condition.",
      ],
    },
    {
      id: "account-help",
      title: "Accounts, Sign-In, and Saved Data",
      body: [
        "Account problems often come from outdated passwords, sign-in with the wrong email address, or confusion between guest checkout and a registered account.",
      ],
      bullets: [
        "Use password recovery first if you cannot sign in.",
        "Check whether the order was placed as a guest before expecting it inside your customer dashboard.",
        "Saved carts, wishlists, and preferences may vary across browsers or devices if you are not signed in consistently.",
      ],
    },
    {
      id: "delivery-help",
      title: "Shipping and Delivery Problems",
      body: [
        "Delivery questions are easiest to solve when you know whether the issue is still inside internal processing or already with the carrier.",
      ],
      bullets: [
        "If tracking is not active yet, the package may still be waiting for handoff or the carrier may not have scanned it.",
        "If the address was entered incorrectly, contact support immediately because rerouting is not always possible.",
        "For customs delays or import fees, international orders may require action from the recipient depending on destination rules.",
      ],
    },
  ],
  highlights: [
    {
      icon: "message-circle",
      title: "Ticket-Based Support",
      description:
        "Structured support messages keep order issues easier to track, update, and resolve.",
    },
    {
      icon: "clock",
      title: "Fast First Answers",
      description:
        "Common order, payment, and shipping questions should be answerable without waiting on a reply.",
    },
    {
      icon: "package",
      title: "Order Context Matters",
      description:
        "Including order identifiers and account details usually shortens resolution time.",
    },
  ],
  faqs: [
    {
      question: "How do I track my order after checkout?",
      answer:
        "Use the order tracking page or the tracking link sent after shipment. If tracking has not appeared yet, the order may still be processing or waiting for the carrier’s first scan.",
    },
    {
      question: "My payment failed. What should I do next?",
      answer:
        "Confirm the card details, billing information, available funds, and any bank verification step. If the failure continues, try a different payment method or contact support with the time of the attempt.",
    },
    {
      question: "Can I change or cancel my order?",
      answer:
        "Possibly, but only before fulfillment has progressed too far. Contact support immediately with the order number and requested change so the team can confirm whether it is still possible.",
    },
    {
      question: "I placed a guest order. Can it appear in my account later?",
      answer:
        "That depends on the platform workflow and whether support can safely match the order to your registered email. Provide the order confirmation details when asking for help.",
    },
    {
      question: "What if my package says delivered but I do not have it?",
      answer:
        "First check nearby safe locations, building reception, and household members. Then verify the delivery timestamp and carrier note. If it is still missing, contact support promptly so carrier investigation steps can begin.",
    },
    {
      question: "How do returns and refunds usually work?",
      answer:
        "Return eligibility depends on product condition, the return window, and any exclusions such as final-sale or personalized items. Once the return is approved and received, refunds are typically sent back to the original payment method.",
    },
  ],
  links: [
    {
      title: "Shipping Policy",
      description:
        "Dive deeper into delivery timing, processing windows, and international shipping expectations.",
      route: "/shipping-policy",
      icon: "truck",
    },
    {
      title: "Terms & Conditions",
      description:
        "See the formal rules that govern orders, payments, and acceptable use.",
      route: "/terms-conditions",
      icon: "file-text",
    },
    {
      title: "Privacy Policy",
      description:
        "Understand how account, support, and checkout data is handled.",
      route: "/privacy-policy",
      icon: "shield",
    },
  ],
  footerTitle: "Still stuck after reading the FAQ?",
  footerText:
    "Use the contact and support flows with your order details, account email, screenshots, and the exact issue. Good context is the fastest way to get a useful answer.",
};

export const shippingPolicyPageContent: InfoPageContent = {
  eyebrow: "DELIVERY RULES",
  title: "Shipping Policy",
  subtitle:
    "This page explains order processing, dispatch timing, delivery estimates, tracking behavior, address problems, and international shipping expectations.",
  lastUpdated: "May 5, 2026",
  icon: "truck",
  gradient: ["#231A16", "#5D4332", "#C89C74"],
  stats: [
    { label: "Processing", value: "1-3 days" },
    { label: "Tracking", value: "Included" },
    { label: "Global reach", value: "International" },
  ],
  intro: [
    "Shipping is not just transit time. It includes order review, payment confirmation, packing, carrier handoff, route scanning, and sometimes customs clearance.",
    "This policy helps set realistic expectations so customers can separate internal processing delays from carrier-side or destination-side delays.",
  ],
  calloutTitle:
    "Delivery estimates begin after processing, not at payment click.",
  calloutText:
    "A customer can pay successfully and still wait through review, preparation, or stock handling before the shipment moves into carrier tracking.",
  sections: [
    {
      id: "processing",
      title: "Order Processing and Dispatch",
      body: [
        "Orders are usually processed in the order they are received, subject to stock checks, payment confirmation, fraud screening, and business-day schedules.",
      ],
      bullets: [
        "Processing time can increase during promotions, holidays, launches, or high-volume periods.",
        "Orders with address issues, item availability problems, or payment verification may be delayed until the issue is resolved.",
        "An order is not considered shipped until it has been packed and handed to the carrier.",
      ],
    },
    {
      id: "methods",
      title: "Shipping Methods and Estimates",
      body: [
        "The shipping methods shown at checkout depend on destination, cart contents, and carrier availability. Estimates are based on normal operations and should not be treated as guarantees unless explicitly stated.",
      ],
      bullets: [
        "Standard methods usually cost less but take longer in transit.",
        "Express options may be faster, but they still depend on successful processing and carrier conditions.",
        "Remote destinations, severe weather, or regional disruptions can extend expected transit time.",
      ],
    },
    {
      id: "tracking",
      title: "Tracking Updates and Delivery Events",
      body: [
        "Tracking is typically shared once the carrier accepts the shipment. A period with no updates does not always mean the package is lost; some routes batch scans or update only at key checkpoints.",
      ],
      bullets: [
        "Tracking links may take time to activate after label creation.",
        "Carrier scans can lag behind real movement during peak periods.",
        "Marked-as-delivered packages should be checked with nearby safe locations, reception desks, and other household members first.",
      ],
    },
    {
      id: "international",
      title: "International Shipping and Customs",
      body: [
        "International orders may pass through customs or border inspection. That creates variables outside the store’s direct control, including duties, taxes, clearance delays, and recipient action requirements.",
      ],
      bullets: [
        "Customers are generally responsible for import duties, local taxes, and customs fees unless checkout states otherwise.",
        "Refused customs payments or incomplete import information can cause returns, abandonment, or extra charges.",
        "Transit estimates for international orders should always allow for customs-related variance.",
      ],
      note: "If your destination has strict import rules, check them before purchase instead of assuming the store or carrier can override them later.",
    },
    {
      id: "address",
      title: "Address Accuracy, Failed Delivery, and Lost Packages",
      body: [
        "Customers must provide complete and accurate delivery details. Incorrect addresses can delay, redirect, or invalidate a shipment depending on carrier rules and timing.",
      ],
      bullets: [
        "If you notice an address problem after ordering, contact support immediately; changes are easiest before dispatch.",
        "Repeated failed delivery attempts or refusal at the door may trigger return-to-sender handling and additional fees.",
        "Lost or stolen package investigations depend on carrier evidence, timing, and the delivery record available.",
      ],
    },
  ],
  highlights: [
    {
      icon: "package",
      title: "Processing Comes First",
      description:
        "Shipping time starts only after order review, packing, and carrier handoff are complete.",
    },
    {
      icon: "map-pin",
      title: "Address Quality Matters",
      description:
        "Accurate addresses reduce the biggest avoidable source of delivery issues.",
    },
    {
      icon: "globe",
      title: "International Variance",
      description:
        "Customs and destination-country rules can affect both timing and final delivered cost.",
    },
  ],
  links: [
    {
      title: "Help & FAQ",
      description:
        "Get action-oriented answers for delayed tracking, guest orders, payments, and support requests.",
      route: "/help-faq",
      icon: "help-circle",
    },
    {
      title: "Terms & Conditions",
      description:
        "Review the formal rules around orders, payments, returns, and service limits.",
      route: "/terms-conditions",
      icon: "file-text",
    },
    {
      title: "Privacy Policy",
      description:
        "Understand how shipping and support data is stored and used during fulfillment.",
      route: "/privacy-policy",
      icon: "shield",
    },
  ],
  footerTitle: "Shipping issue in progress right now?",
  footerText:
    "Check whether the problem is pre-dispatch, in transit, at customs, or marked delivered. That distinction determines the fastest next step and the right support evidence to include.",
};
