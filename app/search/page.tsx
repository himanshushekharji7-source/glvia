import { Metadata } from "next";
import SearchClient from "./SearchClient";

// Server-side metadata for /search page — enables Google crawling + Sitelinks Searchbox
export const metadata: Metadata = {
  title: "Find Best Salons Near You in Uttar Pradesh | glvia",
  description:
    "Search premium salons across Lucknow, Noida, Kanpur, Varanasi, Prayagraj and all UP cities. Filter by price, rating and services. Book your appointment online on glvia.",
  alternates: {
    canonical: "https://glvia.com/search",
  },
  openGraph: {
    title: "Find Best Salons Near You in Uttar Pradesh | glvia",
    description:
      "Search premium salons across Lucknow, Noida, Kanpur, Varanasi, Prayagraj and all UP cities. Filter by price, rating and services.",
    url: "https://glvia.com/search",
    siteName: "glvia",
    type: "website",
    images: [
      {
        url: "https://glvia.com/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "Search Salons in Uttar Pradesh - glvia",
      },
    ],
  },
};

export default function Page() {
  // SearchAction Schema — enables Google Sitelinks Searchbox
  const searchActionSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "glvia",
    "url": "https://glvia.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://glvia.com/search?category={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
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
        "name": "Search Salons",
        "item": "https://glvia.com/search",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchActionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SearchClient />
    </>
  );
}
