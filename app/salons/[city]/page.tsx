import { Metadata } from "next";
import { supabase, TABLES } from "../../lib/supabase";
import { getCityData, getAllCitySlugs } from "../../lib/cityCoordinates";
import CitySalonClient from "./CitySalonClient";

interface Props {
  params: Promise<{ city: string }>;
}

// Pre-generate pages for all known UP cities at build time
export async function generateStaticParams() {
  // Start with all known city slugs
  const knownSlugs = getAllCitySlugs();

  // Also fetch any unique cities from DB that might not be in our list
  try {
    const { data: dbCities } = await supabase
      .from(TABLES.SALONS)
      .select("address_city")
      .eq("status", "approved");

    if (dbCities) {
      const dbSlugs = dbCities
        .map((s: any) => s.address_city?.toLowerCase().trim().replace(/\s+/g, "-"))
        .filter(Boolean);
      const allSlugs = Array.from(new Set([...knownSlugs, ...dbSlugs]));
      return allSlugs.map((city) => ({ city }));
    }
  } catch (err) {
    console.error("Error in generateStaticParams for city pages:", err);
  }

  return knownSlugs.map((city) => ({ city }));
}

// Fetch salons for a specific city (server-side)
async function getCitySalons(citySlug: string) {
  try {
    const cityData = getCityData(citySlug);
    const cityName = cityData?.name || citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

    const { data: salons } = await supabase
      .from(TABLES.SALONS)
      .select("id, name, images, rating, total_reviews, address_street, address_city, address_state, price_range, tags, description, contact_phone")
      .eq("status", "approved")
      .ilike("address_city", `%${cityName}%`);

    return {
      salons: salons || [],
      cityName,
      cityData,
    };
  } catch (err) {
    console.error("Error fetching city salons:", err);
    return { salons: [], cityName: citySlug, cityData: null };
  }
}

// Dynamic metadata for each city page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const { salons, cityName } = await getCitySalons(city);
  const salonCount = salons.length;

  const title = `Best Salons in ${cityName} | Premium Beauty & Hair Services - glvia`;
  const description = `Discover and book ${salonCount > 0 ? salonCount + " " : ""}premium salons in ${cityName}, Uttar Pradesh. Compare ratings, services, prices and book haircuts, spa, facial, makeup and beauty services instantly on glvia.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://glvia.com/salons/${city}`,
    },
    openGraph: {
      title,
      description,
      url: `https://glvia.com/salons/${city}`,
      siteName: "glvia",
      type: "website",
      images: [
        {
          url: "https://glvia.com/og-city.jpg",
          width: 1200,
          height: 630,
          alt: `Best Salons in ${cityName} Uttar Pradesh - glvia`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const { salons, cityName, cityData } = await getCitySalons(city);
  const salonCount = salons.length;

  const lat = cityData?.lat || 26.8467;
  const lng = cityData?.lng || 80.9462;
  const nearbyAreas = cityData?.nearbyAreas || [];

  // --- JSON-LD: LocalBusiness Schema ---
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": `glvia Premium Salons in ${cityName}`,
    "image": "https://glvia.com/og-city.jpg",
    "@id": `https://glvia.com/salons/${city}#localbusiness`,
    "url": `https://glvia.com/salons/${city}`,
    "telephone": "+919999999999",
    "priceRange": "₹99 - ₹2999",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": cityName,
      "addressRegion": "Uttar Pradesh",
      "postalCode": cityData?.pincode || "",
      "addressCountry": "IN",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": lat,
      "longitude": lng,
    },
    "areaServed": {
      "@type": "City",
      "name": cityName,
    },
    ...(salonCount > 0
      ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": (
              salons.reduce((sum: number, s: any) => sum + (Number(s.rating) || 4.5), 0) / salonCount
            ).toFixed(1),
            "reviewCount": salons.reduce((sum: number, s: any) => sum + (s.total_reviews || 0), 0) || salonCount,
          },
        }
      : {}),
  };

  // --- JSON-LD: ItemList Schema (list of salons) ---
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Best Salons in ${cityName}`,
    "numberOfItems": salonCount,
    "itemListElement": salons.slice(0, 10).map((salon: any, i: number) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": salon.name,
      "url": `https://glvia.com/salon/${salon.id}`,
    })),
  };

  // --- JSON-LD: BreadcrumbList ---
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
        "name": "Salons",
        "item": "https://glvia.com/at-the-salon",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": cityName,
        "item": `https://glvia.com/salons/${city}`,
      },
    ],
  };

  // --- JSON-LD: FAQPage ---
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `${cityName} me best salon konsa hai?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `glvia par ${cityName} ke ${salonCount > 0 ? salonCount : "top"} premium verified salons listed hain. Aap ratings, reviews aur prices compare karke apne liye best salon book kar sakte hain. Sab salons verified hain aur professional beauty services provide karte hain.`,
        },
      },
      {
        "@type": "Question",
        "name": `${cityName} me salon booking kaise kare?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `glvia app ya website par jaayein, '${cityName}' city select karein, apni pasand ki service chunein (haircut, facial, spa, bridal makeup) aur date-time select karke online booking confirm karein. Pay at Salon ka option bhi available hai.`,
        },
      },
      {
        "@type": "Question",
        "name": `${cityName} me salon ki services kitne me shuru hoti hain?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${cityName} ke premium salons par glvia ke through services ₹99 se shuru hoti hain. Haircut, beard grooming, facial, hair spa, bridal makeup aur waxing jaise services available hain. glvia Membership se har booking par 15% tak discount milta hai.`,
        },
      },
      {
        "@type": "Question",
        "name": `Kya ${cityName} me salon at home service available hai?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Haan, glvia ${cityName} me salon at home services bhi provide karta hai. Verified beauty professionals aapke ghar 30 minute ke andar pahunch jaate hain. Haircut, facial, waxing, manicure-pedicure aur bridal makeup sab ghar par available hai.`,
        },
      },
    ],
  };

  // Serialize salons for client component
  const serializedSalons = salons.map((s: any) => ({
    id: s.id,
    name: s.name,
    images: s.images || [],
    rating: Number(s.rating) || 4.5,
    totalReviews: s.total_reviews || 0,
    address: {
      street: s.address_street || "",
      city: s.address_city || "",
      state: s.address_state || "",
    },
    priceRange: s.price_range || "₹99 - ₹2999",
    tags: s.tags || ["Unisex"],
    description: s.description || "",
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Client UI for salon listings */}
      <CitySalonClient
        cityName={cityName}
        citySlug={city}
        salons={serializedSalons}
        nearbyAreas={nearbyAreas}
      />

      {/* ──── SEO Content Section (500-800 words, server rendered) ──── */}
      <section className="px-5 py-8 max-w-3xl mx-auto bg-white" id="seo-content">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          Best Salons in {cityName}, Uttar Pradesh — Book Online on glvia
        </h2>

        <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed space-y-4">
          <p>
            Looking for the <strong>best salon in {cityName}</strong>? glvia is Uttar Pradesh&apos;s premium beauty marketplace 
            where you can discover, compare, and book top-rated salons in {cityName} and nearby areas
            {nearbyAreas.length > 0 ? ` like ${nearbyAreas.slice(0, 4).join(", ")}` : ""}. Whether you need a 
            <strong> professional haircut</strong>, <strong>relaxing hair spa</strong>, <strong>premium facial</strong>, 
            <strong>bridal makeup</strong>, or <strong>grooming services</strong> — glvia connects you with verified, 
            experienced salon professionals in {cityName}.
          </p>

          <h3 className="text-lg font-bold text-slate-800 !mt-6">
            Premium Grooming &amp; Beauty Services in {cityName}
          </h3>
          <p>
            {cityName} is home to some of the finest beauty and grooming salons in Uttar Pradesh. On glvia, 
            you&apos;ll find salons offering a wide range of services including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Haircut &amp; Styling</strong> — Trendy cuts, hair styling, and beard grooming for men and women</li>
            <li><strong>Hair Spa &amp; Treatments</strong> — Deep conditioning, keratin treatment, and scalp therapy</li>
            <li><strong>Hair Colour</strong> — Global colour, highlights, balayage, and fashion colours</li>
            <li><strong>Facial &amp; Skin Care</strong> — Gold facial, diamond facial, de-tan, and anti-aging treatments</li>
            <li><strong>Bridal &amp; Party Makeup</strong> — HD makeup, airbrush makeup, and complete bridal packages</li>
            <li><strong>Waxing &amp; Threading</strong> — Full body waxing, eyebrow threading, and upper lip</li>
            <li><strong>Manicure &amp; Pedicure</strong> — Classic, spa, and gel nail treatments</li>
            <li><strong>Spa &amp; Body Massage</strong> — Swedish massage, aromatherapy, and body polishing</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 !mt-6">
            Why Book Salons on glvia in {cityName}?
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Verified Professionals</strong> — All salons are KYC-verified with experienced stylists</li>
            <li><strong>Transparent Pricing</strong> — See all service prices upfront before booking</li>
            <li><strong>Real Reviews</strong> — Read genuine customer reviews and ratings</li>
            <li><strong>Easy Online Booking</strong> — Book your appointment in just 3 taps</li>
            <li><strong>Pay at Salon</strong> — No advance payment required — pay when you visit</li>
            <li><strong>Membership Discounts</strong> — glvia Gold &amp; Silver membership gives you flat 15% off on every booking</li>
            <li><strong>Salon at Home</strong> — Can&apos;t visit? Get professional beauty services at your doorstep in 30 minutes</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 !mt-6">
            How to Book a Salon in {cityName} on glvia
          </h3>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Open <strong>glvia.com</strong> or the glvia app</li>
            <li>Browse salons in {cityName} or search by service (haircut, facial, spa, etc.)</li>
            <li>Compare prices, ratings, and reviews</li>
            <li>Select your preferred date and time</li>
            <li>Confirm your booking — that&apos;s it!</li>
          </ol>

          {nearbyAreas.length > 0 && (
            <>
              <h3 className="text-lg font-bold text-slate-800 !mt-6">
                Popular Areas for Salon Services in {cityName}
              </h3>
              <p>
                glvia salons are available across {cityName} including popular localities such as{" "}
                <strong>{nearbyAreas.join(", ")}</strong>. Whether you are in the heart of the city or in a 
                residential area, find a premium salon near you with just a few taps.
              </p>
            </>
          )}

          <h3 className="text-lg font-bold text-slate-800 !mt-6">
            Salon at Home in {cityName}
          </h3>
          <p>
            Don&apos;t want to step out? glvia also offers <strong>salon at home services in {cityName}</strong>. 
            Our verified beauty professionals come to your doorstep within 30 minutes. From haircuts and facials 
            to bridal makeup and waxing — get the full salon experience at home. Perfect for busy professionals, 
            new mothers, and anyone who prefers convenience.
          </p>

          <h3 className="text-lg font-bold text-slate-800 !mt-6">
            Save More with glvia Membership
          </h3>
          <p>
            Join <strong>glvia Gold</strong> or <strong>glvia Silver</strong> membership and enjoy flat 15% 
            discount on every salon booking in {cityName}. Whether you book at the salon or get services at home — 
            your membership discount applies everywhere. Starting at just ₹199 for 6 months!
          </p>

          <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 !mt-6">
            <p className="text-sm text-pink-800 font-semibold">
              🔍 Search for &quot;best salon in {cityName}&quot;, &quot;haircut near me {cityName}&quot;, 
              or &quot;bridal makeup {cityName}&quot; — glvia helps you find and book the perfect salon instantly!
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
