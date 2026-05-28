import { Metadata } from "next";
import CategoriesClient from "./CategoriesClient";

// Server-side metadata for /categories page
export const metadata: Metadata = {
  title: "Salon Categories in Uttar Pradesh | Hair, Spa, Makeup & Beauty - glvia",
  description:
    "Explore beauty categories including haircuts, spa, facial, waxing, nail art and makeup salons across Uttar Pradesh. Find the perfect salon service for you on glvia.",
  alternates: {
    canonical: "https://glvia.com/categories",
  },
  openGraph: {
    title: "Salon Categories in Uttar Pradesh | Hair, Spa, Makeup & Beauty - glvia",
    description:
      "Explore beauty categories including haircuts, spa, facial, waxing, nail art and makeup salons across Uttar Pradesh.",
    url: "https://glvia.com/categories",
    siteName: "glvia",
    type: "website",
    images: [
      {
        url: "https://glvia.com/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "Salon Categories Uttar Pradesh - glvia",
      },
    ],
  },
};

export default function Page() {
  // ItemList Schema — categories as a structured list for rich snippets
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Beauty & Salon Service Categories",
    "numberOfItems": 10,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Hair Cut & Styling", "url": "https://glvia.com/search?category=hair-cut-style" },
      { "@type": "ListItem", "position": 2, "name": "Hair Colour", "url": "https://glvia.com/search?category=hair-colour" },
      { "@type": "ListItem", "position": 3, "name": "Skin Care & Facial", "url": "https://glvia.com/search?category=skin-care" },
      { "@type": "ListItem", "position": 4, "name": "Spa & Massage", "url": "https://glvia.com/search?category=spa-massage" },
      { "@type": "ListItem", "position": 5, "name": "Bridal Packages", "url": "https://glvia.com/search?category=bridal-packages" },
      { "@type": "ListItem", "position": 6, "name": "Manicure & Pedicure", "url": "https://glvia.com/search?category=mani-pedi-hygiene" },
      { "@type": "ListItem", "position": 7, "name": "Makeup", "url": "https://glvia.com/search?category=makeup" },
      { "@type": "ListItem", "position": 8, "name": "Hair Treatments", "url": "https://glvia.com/search?category=hair-treatments" },
      { "@type": "ListItem", "position": 9, "name": "Waxing & Threading", "url": "https://glvia.com/search?category=body-polishing" },
      { "@type": "ListItem", "position": 10, "name": "Nail Art", "url": "https://glvia.com/search?category=nail-art" },
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
        "name": "Categories",
        "item": "https://glvia.com/categories",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CategoriesClient />
    </>
  );
}
