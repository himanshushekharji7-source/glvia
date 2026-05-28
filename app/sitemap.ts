import { MetadataRoute } from "next";
import { supabase, TABLES } from "./lib/supabase";
import { getAllCitySlugs } from "./lib/cityCoordinates";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://glvia.com";

  // ─── Static pages priorities ───
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/at-the-salon`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/at-home`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/membership`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ];

  // ─── Dynamic: Individual salon pages ───
  let salonEntries: MetadataRoute.Sitemap = [];
  try {
    const { data: approvedSalons } = await supabase
      .from(TABLES.SALONS)
      .select("id, updated_at, address_city")
      .eq("status", "approved");

    if (approvedSalons && approvedSalons.length > 0) {
      salonEntries = approvedSalons.map((salon) => ({
        url: `${baseUrl}/salon/${salon.id}`,
        lastModified: salon.updated_at ? new Date(salon.updated_at) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.85,
      }));
    }
  } catch (err) {
    console.error("Error generating salon sitemap entries:", err);
  }

  // ─── Dynamic: City landing pages ───
  // Combine known city slugs + any unique cities from the DB
  let cityEntries: MetadataRoute.Sitemap = [];
  try {
    const knownSlugs = getAllCitySlugs();

    // Also get cities from actual salons in DB
    const { data: dbSalons } = await supabase
      .from(TABLES.SALONS)
      .select("address_city")
      .eq("status", "approved");

    const dbCitySlugs = dbSalons
      ? dbSalons
          .map((s: any) => s.address_city?.toLowerCase().trim().replace(/\s+/g, "-"))
          .filter(Boolean)
      : [];

    const allCitySlugs = Array.from(new Set([...knownSlugs, ...dbCitySlugs]));

    cityEntries = allCitySlugs.map((citySlug) => ({
      url: `${baseUrl}/salons/${citySlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9, // City pages are high priority SEO pages
    }));
  } catch (err) {
    console.error("Error generating city sitemap entries:", err);
  }
  // ─── Dynamic: Service landing pages ───
  const KNOWN_SERVICE_SLUGS = [
    "haircut", "hair-spa", "hair-colour", "facial", "bridal-makeup",
    "waxing", "manicure-pedicure", "spa-massage", "beard-grooming",
    "makeup", "nail-art", "body-polishing",
  ];

  const serviceEntries: MetadataRoute.Sitemap = KNOWN_SERVICE_SLUGS.map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // ─── Combine all entries ───
  // Excludes: /admin, /login, /profile, /salon-owner, /checkout, /bookings, /wallet, /wishlist, /notifications
  return [...staticPages, ...cityEntries, ...serviceEntries, ...salonEntries];
}
