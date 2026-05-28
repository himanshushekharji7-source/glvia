import { Metadata } from "next";
import HomePageClient from "./HomePageClient";

// 1. Homepage Metadata for Google Ranking
export const metadata: Metadata = {
  title: "Premium Salon Booking in Uttar Pradesh | Hair, Spa & Beauty | glvia",
  description: "Book premium salons in Uttar Pradesh with glvia. Discover trusted salons for haircut, beauty, spa, bridal makeup, skin care, and grooming near you.",
  alternates: {
    canonical: "https://glvia.com",
  },
  openGraph: {
    title: "Premium Salon Booking in Uttar Pradesh | Hair, Spa & Beauty | glvia",
    description: "Book premium salons in Uttar Pradesh with glvia. Discover trusted salons for haircut, beauty, spa, bridal makeup, skin care, and grooming near you.",
    url: "https://glvia.com",
    siteName: "glvia",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "glvia Premium Salon Booking Uttar Pradesh",
      },
    ],
  },
};

export default function Page() {
  // 2. Aggregate LocalBusiness Structured Schema for Uttar Pradesh cities (Step 2 & 5)
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": "glvia Premium Salon Booking",
    "image": "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    "@id": "https://glvia.com/#localbusiness",
    "url": "https://glvia.com",
    "telephone": "+919999999999",
    "priceRange": "₹99 - ₹2999",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lucknow",
      "addressRegion": "Uttar Pradesh",
      "addressCountry": "IN"
    },
    "areaServed": [
      { "@type": "AdministrativeArea", "name": "Uttar Pradesh" },
      { "@type": "City", "name": "Lucknow" },
      { "@type": "City", "name": "Kanpur" },
      { "@type": "City", "name": "Noida" },
      { "@type": "City", "name": "Ghaziabad" },
      { "@type": "City", "name": "Varanasi" },
      { "@type": "City", "name": "Prayagraj" },
      { "@type": "City", "name": "Agra" },
      { "@type": "City", "name": "Gorakhpur" },
      { "@type": "City", "name": "Bareilly" },
      { "@type": "City", "name": "Meerut" },
      { "@type": "City", "name": "Jhansi" },
      { "@type": "City", "name": "Aligarh" },
      { "@type": "City", "name": "Ayodhya" },
      { "@type": "City", "name": "Mathura" },
      { "@type": "City", "name": "Ballia" }
    ],
    // Fallback coordinates for Lucknow/UP (Step 6)
    // TODO: replace with DB coordinates once available
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 26.8467,
      "longitude": 80.9462
    }
  };

  // 3. FAQPage Schema for direct Search rich snippets (Step 5)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Uttar Pradesh me premium salon booking kaise kare?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "glvia platform ke dwara aap Uttar Pradesh (Lucknow, Noida, Kanpur, Prayagraj, Ballia aur anya shehro) me sabse acche premium salons aur home salon services ko online asaani se book kar sakte hain."
        }
      },
      {
        "@type": "Question",
        "name": "glvia par kaun si beauty services milti hain?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "glvia par aapko Haircut, Beard grooming, Head massage, Waxing, Threading, Pedicure, Manicure, Bridal Makeup aur special Salon Packages milti hain."
        }
      },
      {
        "@type": "Question",
        "name": "Kya glvia par verified salons aur discount deals milti hain?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Haan, glvia par sabhi premium salons KYC-verified aur experienced hote hain. Saath hi aapko glvia Gold aur Silver membership ke dwara har booking par flat 15% discount milta hai."
        }
      }
    ]
  };

  // 4. Breadcrumb Schema for search engine indexing (Step 5)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://glvia.com"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <HomePageClient />
    </>
  );
}
