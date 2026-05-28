import { Metadata } from "next";
import AtHomeClient from "./AtHomeClient";

// 1. At Home Page Metadata for Google Ranking (Performance SEO)
export const metadata: Metadata = {
  title: "Premium Salon at Home in Uttar Pradesh | Beauty Services - glvia",
  description: "Book professional salon at home services in Uttar Pradesh. Get verified beauty experts at your doorstep for haircuts, facials, waxing, and bridal makeup in Lucknow, Noida, Prayagraj, and more UP cities.",
  alternates: {
    canonical: "https://glvia.com/at-home",
  },
  openGraph: {
    title: "Premium Salon at Home in Uttar Pradesh | Beauty Services - glvia",
    description: "Book professional salon at home services in Uttar Pradesh. Get verified beauty experts at your doorstep for haircuts, facials, waxing, and bridal makeup in Lucknow, Noida, Prayagraj, and more UP cities.",
    url: "https://glvia.com/at-home",
    siteName: "glvia",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "glvia Premium Salon at Home Uttar Pradesh",
      },
    ],
  },
};

export default function Page() {
  // 2. Breadcrumb Schema for At Home
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://glvia.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Salon at Home",
        "item": "https://glvia.com/at-home"
      }
    ]
  };

  // 3. FAQ Schema for Home Salon UP
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Kya glvia salon at home service pure Uttar Pradesh me uplabdh hai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Haan, glvia salon at home services Lucknow, Kanpur, Prayagraj, Gorakhpur, Noida, Varanasi aur UP ke kai anya shehro me fully available hain. Humare verified professionals 30 minutes me aapke ghar pahunch jaate hain."
        }
      },
      {
        "@type": "Question",
        "name": "Ghar par salon service lene par kya safety rules follow kiye jaate hain?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Humare sabhi home beauty experts KYC-verified aur high-standard hygiene guidelines follow karte hain, jisse aapko fully safe aur premium grooming experience ghar par milta hai."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <AtHomeClient />
    </>
  );
}
