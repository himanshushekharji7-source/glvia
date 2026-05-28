import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://glvia.com";

  return {
    rules: {
      userAgent: "*",
      // Hardened Rules: Whitelist public booking paths (Step 8)
      allow: [
        "/",
        "/salon/",
        "/salons/",
        "/services/",
        "/at-the-salon",
        "/at-home",
        "/categories",
        "/membership",
        "/search"
      ],
      // Harden URLs: Disallow private/admin/auth/checkout/api endpoints (Step 8)
      disallow: [
        "/admin/",
        "/profile/",
        "/salon-owner/",
        "/api/",
        "/login",
        "/checkout",
        "/booking-confirmed",
        "/verify",
        "/bookings",
        "/wallet",
        "/wishlist",
        "/notifications"
      ]
    },
    // Reference clean, absolute canonical domain sitemap (Step 1)
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
