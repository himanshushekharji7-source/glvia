import { Metadata } from "next";
import AtTheSalonClient from "./AtTheSalonClient";

// 1. At The Salon page Metadata for Google Ranking (Step 11 Performance SEO)
export const metadata: Metadata = {
  title: "Best Salons in Uttar Pradesh | Book Premium Offline Salons - glvia",
  description: "Explore and book the best offline salons in Uttar Pradesh. Get premium hair cut, spa, skin care, and makeup deals in Lucknow, Noida, Prayagraj, and other UP cities.",
  alternates: {
    canonical: "https://glvia.com/at-the-salon",
  },
  openGraph: {
    title: "Best Salons in Uttar Pradesh | Book Premium Offline Salons - glvia",
    description: "Explore and book the best offline salons in Uttar Pradesh. Get premium hair cut, spa, skin care, and makeup deals in Lucknow, Noida, Prayagraj, and other UP cities.",
    url: "https://glvia.com/at-the-salon",
    siteName: "glvia",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "glvia Best Salons in Uttar Pradesh",
      },
    ],
  },
};

export default function Page() {
  // 2. Breadcrumb Schema for At the Salon
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
        "name": "At the Salon",
        "item": "https://glvia.com/at-the-salon"
      }
    ]
  };

  // 3. FAQ Schema for offline salon bookings UP
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "glvia ke dwara offline salon booking kaise kare?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "glvia platform par 'At the Salon' section me jakar aap Uttar Pradesh ke sabse acche premium salons ki list dekh sakte hain, unke rates compare kar sakte hain aur apne liye direct slot book kar sakte hain."
        }
      },
      {
        "@type": "Question",
        "name": "Uttar Pradesh ke kin-kin shehro me salons listed hain?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "glvia par Lucknow, Kanpur, Noida, Ghaziabad, Varanasi, Prayagraj, Gorakhpur, Agra, Bareilly aur Ayodhya samet UP ke 15+ se zyada bade shehro ke top premium beauty salons listed hain."
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
      <AtTheSalonClient />
    </>
  );
}
