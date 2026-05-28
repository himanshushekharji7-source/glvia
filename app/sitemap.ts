import { MetadataRoute } from "next";
import { supabase, TABLES } from "./lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://glvia.com";

  // Static pages priorities (Step 7)
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0, // Homepage Priority: 1.0
    },
    {
      url: `${baseUrl}/at-the-salon`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.95, // At The Salon Priority: 0.95
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
      priority: 0.9, // Membership Priority: 0.9
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }
  ];

  // Fetch approved salons dynamically from Supabase (Step 7)
  let salonEntries: MetadataRoute.Sitemap = [];
  try {
    const { data: approvedSalons } = await supabase
      .from(TABLES.SALONS)
      .select("id, updated_at")
      .eq("status", "approved");

    if (approvedSalons && approvedSalons.length > 0) {
      salonEntries = approvedSalons.map((salon) => ({
        url: `${baseUrl}/salon/${salon.id}`,
        lastModified: salon.updated_at ? new Date(salon.updated_at) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.85, // Salon pages priority: 0.85
      }));
    }
  } catch (err) {
    console.error("Error generating sitemap dynamically:", err);
  }

  // Combine static pages and dynamic salons
  // Excludes Profile/Admin/Auth pages like /admin, /login, /profile, /salon-owner (Step 7)
  return [...staticPages, ...salonEntries];
}
