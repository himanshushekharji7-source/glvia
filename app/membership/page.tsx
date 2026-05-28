import { Metadata } from "next";
import MembershipClient from "./MembershipClient";

// Server-side metadata for /membership page — high conversion SEO page
export const metadata: Metadata = {
  title: "glvia Membership | Save on Every Salon Booking",
  description:
    "Join GLVIA Gold or Silver membership and save on salon bookings with premium discounts across Uttar Pradesh. Flat 15% off on every salon visit and home service. Starting ₹199.",
  alternates: {
    canonical: "https://glvia.com/membership",
  },
  openGraph: {
    title: "glvia Membership | Save on Every Salon Booking",
    description:
      "Join GLVIA Gold or Silver membership and save on salon bookings with premium discounts across Uttar Pradesh. Flat 15% off on every salon visit.",
    url: "https://glvia.com/membership",
    siteName: "glvia",
    type: "website",
    images: [
      {
        url: "https://glvia.com/og-membership.jpg",
        width: 1200,
        height: 630,
        alt: "glvia Gold & Silver Membership Plans",
      },
    ],
  },
};

export default function Page() {
  // Product + Offer Schema for membership plans
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "glvia Membership Plans",
    "description": "Premium beauty salon membership plans with flat discounts on every booking across Uttar Pradesh.",
    "brand": {
      "@type": "Brand",
      "name": "glvia",
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "GLIVAJI GOLD Membership",
        "price": "299",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": "https://glvia.com/membership",
        "description": "12 Month Unisex Plan — Flat 15% OFF on every salon booking",
        "validFrom": new Date().toISOString().split("T")[0],
      },
      {
        "@type": "Offer",
        "name": "GLIVAJI SILVER Membership",
        "price": "199",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": "https://glvia.com/membership",
        "description": "6 Month Unisex Plan — Flat 15% OFF on every salon booking",
        "validFrom": new Date().toISOString().split("T")[0],
      },
    ],
  };

  // FAQ Schema for membership-related queries
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "glvia membership kaise kaam karta hai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "glvia Gold ya Silver membership lene ke baad aapko har salon booking par flat 15% discount milta hai. Yeh discount salon visit aur home service dono par applicable hai. Gold plan 12 months ka hai (₹299) aur Silver plan 6 months ka hai (₹199).",
        },
      },
      {
        "@type": "Question",
        "name": "glvia membership ka discount kahan-kahan milta hai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "glvia membership ka 15% discount Uttar Pradesh ke sabhi listed salons par milta hai — chahe aap salon jaayein ya ghar par home service lein. Lucknow, Kanpur, Noida, Varanasi aur sabhi UP cities me yeh discount valid hai.",
        },
      },
      {
        "@type": "Question",
        "name": "Gold aur Silver membership me kya fark hai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Gold membership 12 months ke liye ₹299 me milta hai aur Silver membership 6 months ke liye ₹199 me. Dono me same flat 15% discount milta hai har booking par.",
        },
      },
    ],
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://glvia.com",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Membership Plans",
        "item": "https://glvia.com/membership",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <MembershipClient />
    </>
  );
}
