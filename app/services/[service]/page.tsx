import { Metadata } from "next";
import { supabase, TABLES } from "../../lib/supabase";
import ServiceClient from "./ServiceClient";

interface Props {
  params: Promise<{ service: string }>;
}

// ─── Known service types for pre-rendering ───
const KNOWN_SERVICES = [
  { slug: "haircut", name: "Haircut & Styling", icon: "content_cut" },
  { slug: "hair-spa", name: "Hair Spa & Treatment", icon: "spa" },
  { slug: "hair-colour", name: "Hair Colour", icon: "palette" },
  { slug: "facial", name: "Facial & Skin Care", icon: "face_retouching_natural" },
  { slug: "bridal-makeup", name: "Bridal Makeup", icon: "celebration" },
  { slug: "waxing", name: "Waxing & Threading", icon: "auto_fix_high" },
  { slug: "manicure-pedicure", name: "Manicure & Pedicure", icon: "back_hand" },
  { slug: "spa-massage", name: "Spa & Body Massage", icon: "self_improvement" },
  { slug: "beard-grooming", name: "Beard Grooming", icon: "face" },
  { slug: "makeup", name: "Makeup", icon: "brush" },
  { slug: "nail-art", name: "Nail Art", icon: "diamond" },
  { slug: "body-polishing", name: "Body Polishing", icon: "water_drop" },
];

function getServiceInfo(slug: string) {
  const known = KNOWN_SERVICES.find((s) => s.slug === slug);
  if (known) return known;
  // Fallback: generate name from slug
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { slug, name, icon: "spa" };
}

export async function generateStaticParams() {
  // Pre-generate all known service slugs
  const staticSlugs = KNOWN_SERVICES.map((s) => ({ service: s.slug }));

  // Also fetch unique service names from DB
  try {
    const { data: dbServices } = await supabase
      .from(TABLES.SALON_SERVICES)
      .select("name");

    if (dbServices) {
      const dbSlugs = Array.from(
        new Set(
          dbServices.map((s: any) =>
            s.name
              ?.toLowerCase()
              .trim()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
          )
        )
      )
        .filter(Boolean)
        .map((slug) => ({ service: slug as string }));

      // Merge without duplicates
      const allSlugs = new Map<string, { service: string }>();
      [...staticSlugs, ...dbSlugs].forEach((item) => allSlugs.set(item.service, item));
      return Array.from(allSlugs.values());
    }
  } catch (err) {
    console.error("Error in generateStaticParams for services:", err);
  }

  return staticSlugs;
}

// Fetch salons offering this service
async function getServiceSalons(serviceSlug: string) {
  const serviceInfo = getServiceInfo(serviceSlug);

  try {
    // Find salon IDs that offer this service
    const { data: serviceRows } = await supabase
      .from(TABLES.SALON_SERVICES)
      .select("salon_id, price, name")
      .ilike("name", `%${serviceInfo.name.split(" ")[0]}%`);

    if (!serviceRows || serviceRows.length === 0) {
      return { salons: [], serviceInfo, minPrice: 99 };
    }

    const salonIds = Array.from(new Set(serviceRows.map((r: any) => r.salon_id)));
    const prices = serviceRows.map((r: any) => Number(r.price)).filter(Boolean);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 99;

    // Fetch salon details
    const { data: salons } = await supabase
      .from(TABLES.SALONS)
      .select("id, name, images, rating, total_reviews, address_street, address_city, address_state, price_range, tags, description")
      .eq("status", "approved")
      .in("id", salonIds);

    return { salons: salons || [], serviceInfo, minPrice };
  } catch (err) {
    console.error("Error fetching service salons:", err);
    return { salons: [], serviceInfo, minPrice: 99 };
  }
}

// Dynamic Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service } = await params;
  const { salons, serviceInfo, minPrice } = await getServiceSalons(service);

  const title = `Best ${serviceInfo.name} Services in Uttar Pradesh | glvia`;
  const description = `Find top-rated salons for ${serviceInfo.name} in Uttar Pradesh. Compare prices starting ₹${minPrice}, read reviews and book ${serviceInfo.name.toLowerCase()} appointments online on glvia.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://glvia.com/services/${service}`,
    },
    openGraph: {
      title,
      description,
      url: `https://glvia.com/services/${service}`,
      siteName: "glvia",
      type: "website",
      images: [
        {
          url: "https://glvia.com/og-home.jpg",
          width: 1200,
          height: 630,
          alt: `${serviceInfo.name} Services in Uttar Pradesh - glvia`,
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

export default async function ServicePage({ params }: Props) {
  const { service } = await params;
  const { salons, serviceInfo, minPrice } = await getServiceSalons(service);
  const salonCount = salons.length;

  // ─── JSON-LD: Service Schema ───
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${serviceInfo.name} Services`,
    "description": `Premium ${serviceInfo.name.toLowerCase()} services at verified salons across Uttar Pradesh. Book online on glvia.`,
    "provider": {
      "@type": "Organization",
      "name": "glvia",
      "url": "https://glvia.com",
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "Uttar Pradesh",
    },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": minPrice.toString(),
      "highPrice": "4999",
      "priceCurrency": "INR",
      "offerCount": salonCount,
    },
  };

  // ─── JSON-LD: ItemList (salons offering this service) ───
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Best ${serviceInfo.name} Salons in Uttar Pradesh`,
    "numberOfItems": salonCount,
    "itemListElement": salons.slice(0, 10).map((salon: any, i: number) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": salon.name,
      "url": `https://glvia.com/salon/${salon.id}`,
    })),
  };

  // ─── JSON-LD: Breadcrumb ───
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://glvia.com" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://glvia.com/categories" },
      { "@type": "ListItem", "position": 3, "name": serviceInfo.name, "item": `https://glvia.com/services/${service}` },
    ],
  };

  // ─── JSON-LD: FAQ ───
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Uttar Pradesh me ${serviceInfo.name.toLowerCase()} ki price kitni hai?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `glvia par Uttar Pradesh me ${serviceInfo.name.toLowerCase()} services ki shuruat ₹${minPrice} se hoti hai. Verified premium salons me experienced professionals aapko best quality service dete hain.`,
        },
      },
      {
        "@type": "Question",
        "name": `Best ${serviceInfo.name.toLowerCase()} salon kaise dhunde?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `glvia par ${salonCount > 0 ? salonCount : "kayi"} verified salons ${serviceInfo.name.toLowerCase()} service ke liye listed hain. Aap ratings compare kar sakte hain, reviews padh sakte hain aur apne nearest salon me online booking kar sakte hain.`,
        },
      },
      {
        "@type": "Question",
        "name": `Kya ${serviceInfo.name.toLowerCase()} ghar par bhi mil sakti hai?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Haan! glvia ki 'Salon at Home' service ke through aap ${serviceInfo.name.toLowerCase()} ghar baithe book kar sakte hain. Verified professional 30 minute me aapke ghar pahunch jaata hai.`,
        },
      },
    ],
  };

  // Serialize salons for client
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
    priceRange: s.price_range || `₹${minPrice} - ₹2999`,
    tags: s.tags || ["Unisex"],
    description: s.description || "",
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <ServiceClient
        serviceName={serviceInfo.name}
        serviceSlug={service}
        serviceIcon={serviceInfo.icon}
        salons={serializedSalons}
        minPrice={minPrice}
      />

      {/* ──── SEO Content Section ──── */}
      <section className="px-5 py-8 max-w-3xl mx-auto bg-white" id="seo-content-service">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          Best {serviceInfo.name} Services in Uttar Pradesh — Book on glvia
        </h2>

        <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed space-y-4">
          <p>
            Looking for the <strong>best {serviceInfo.name.toLowerCase()} services near you</strong>? 
            glvia brings you {salonCount > 0 ? salonCount : "top"} verified salons in Uttar Pradesh offering 
            premium {serviceInfo.name.toLowerCase()} services. Whether you&apos;re in Lucknow, Kanpur, Noida, 
            Varanasi, or any UP city — book your {serviceInfo.name.toLowerCase()} appointment online in seconds.
          </p>

          <h3 className="text-lg font-bold text-slate-800 !mt-6">
            Why Choose glvia for {serviceInfo.name}?
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Verified &amp; Experienced Professionals</strong> — All stylists are trained and KYC-verified</li>
            <li><strong>Prices Starting ₹{minPrice}</strong> — Affordable premium services with transparent pricing</li>
            <li><strong>Real Customer Reviews</strong> — Read genuine ratings before you book</li>
            <li><strong>Online Booking</strong> — Book in 3 taps, no waiting or calling needed</li>
            <li><strong>At Home Option</strong> — Get {serviceInfo.name.toLowerCase()} at your doorstep in 30 minutes</li>
            <li><strong>Membership Savings</strong> — glvia Gold/Silver members save 15% on every booking</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 !mt-6">
            Popular Cities for {serviceInfo.name}
          </h3>
          <p>
            Book premium {serviceInfo.name.toLowerCase()} services in{" "}
            <strong>Lucknow, Kanpur, Noida, Varanasi, Prayagraj, Agra, Gorakhpur, Ghaziabad, 
            Bareilly, Meerut, Ballia, Jhansi, Aligarh, Ayodhya</strong> and more UP cities on glvia.
          </p>

          <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 !mt-6">
            <p className="text-sm text-pink-800 font-semibold">
              🔍 Search for &quot;{serviceInfo.name.toLowerCase()} near me&quot; or &quot;best {serviceInfo.name.toLowerCase()} salon&quot; 
              — glvia helps you find and book the perfect salon instantly!
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
