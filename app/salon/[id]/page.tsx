import { Metadata } from "next";
import { supabase, TABLES } from "../../lib/supabase";
import { getCityCoordinates } from "../../lib/cityCoordinates";
import SalonDetailClient from "./SalonDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

// Fetch helper on the server side (Step 11 Performance SEO)
async function getSalon(id: string) {
  try {
    const { data: dbSalon } = await supabase
      .from(TABLES.SALONS)
      .select('*')
      .eq('id', id)
      .single();
    
    if (!dbSalon) return null;

    // Fetch dynamic services to calculate starting price and fetch key services names (Step 5)
    const { data: dbSvcs } = await supabase
      .from(TABLES.SALON_SERVICES)
      .select('price, name')
      .eq('salon_id', id);

    const prices = dbSvcs ? dbSvcs.map((s: any) => Number(s.price)) : [];
    const startingPrice = prices.length > 0 ? Math.min(...prices) : 99;

    // Retrieve unique service names to list as search intent keywords (Step 5)
    const uniqueServiceNames = dbSvcs
      ? Array.from(new Set(dbSvcs.map((s: any) => s.name))).slice(0, 5)
      : [];

    const defaultKeywords = ["haircut", "bridal makeup", "hair spa", "facial", "skin care"];
    const serviceKeywords = uniqueServiceNames.length > 0 
      ? uniqueServiceNames.join(", ") 
      : defaultKeywords.join(", ");

    return {
      ...dbSalon,
      startingPrice,
      serviceKeywords
    };
  } catch (err) {
    console.error("Error fetching salon on server:", err);
    return null;
  }
}

// Generate dynamic metadata for Google crawlers (Step 4 & 5)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const salon = await getSalon(id);

  if (!salon) {
    return {
      title: "Salon Not Found — glvia",
    };
  }

  const city = salon.address_city || "Uttar Pradesh";
  const title = `${salon.name} | Best Salon in ${city}, Uttar Pradesh | Book Online - glvia`;
  const description = `Book appointments at ${salon.name} in ${city}, Uttar Pradesh for ${salon.serviceKeywords} and premium beauty services. Explore prices, reviews, and timings on glvia.`;
  // Dynamic OpenGraph image with fallback support (Step 3)
  const ogImage = salon.images?.[0] || "https://glvia.com/og-default.jpg";

  return {
    title,
    description,
    alternates: {
      canonical: `https://glvia.com/salon/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://glvia.com/salon/${id}`,
      siteName: "glvia",
      images: [{ url: ogImage }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const salon = await getSalon(id);

  if (!salon) {
    return <SalonDetailClient />;
  }

  const city = salon.address_city || "Uttar Pradesh";
  const state = salon.address_state || "UP";
  const street = salon.address_street || "";
  const ratingValue = Number(salon.rating) || 4.5;
  const reviewCount = Number(salon.total_reviews) || 10;
  
  // Dynamic city-based GPS coordinates (no more hardcoded Lucknow for all salons)
  const { lat, lng } = getCityCoordinates(city);

  // JSON-LD BeautySalon + LocalBusiness Schema combined (Step 4 & 5)
  const salonSchema = {
    "@context": "https://schema.org",
    "@type": ["BeautySalon", "LocalBusiness"],
    "name": salon.name,
    "image": salon.images || ["https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f"],
    "@id": `https://glvia.com/salon/${id}#beautysalon`,
    "url": `https://glvia.com/salon/${id}`,
    "telephone": salon.contact_phone || "+919999999999",
    "priceRange": salon.price_range || `₹${salon.startingPrice} - ₹2999`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": street,
      "addressLocality": city,
      "addressRegion": state,
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": lat,
      "longitude": lng
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "reviewCount": reviewCount
    }
  };

  // Breadcrumb Schema for search engine indexing (Step 5)
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
        "name": "Salons",
        "item": "https://glvia.com/search"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": salon.name,
        "item": `https://glvia.com/salon/${id}`
      }
    ]
  };

  // FAQ Schema for search snippets (Step 5)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Kya ${salon.name} par online appointment book kar sakte hain?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Haan, glvia platform ke dwara aap ${salon.name} in ${city} ke liye online slot book kar sakte hain aur 'Pay at Salon' ka vikalp chun sakte hain.`
        }
      },
      {
        "@type": "Question",
        "name": `${salon.name} me services ki shuruat kitne se hoti hai?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `glvia par ${salon.name} me beauty aur hair services ₹${salon.startingPrice} se shuru hoti hain.`
        }
      },
      {
        "@type": "Question",
        "name": `${salon.name} ka opening time aur rating kya hai?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${salon.name} ki verified customer rating ${ratingValue}★ hai. Yeh subah 9:00 AM se shaam 8:00 PM tak khula rehta hai.`
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(salonSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SalonDetailClient />
    </>
  );
}
