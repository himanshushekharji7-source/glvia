// ═══════════════════════════════════════════════════════════════
// PREDEFINED SERVICES — Single source of truth
// Gender → Category → Service Name (strict dropdown cascade)
// ═══════════════════════════════════════════════════════════════

export interface PredefinedCategory {
  slug: string;
  label: string;
  icon: string;
}

export interface PredefinedServiceMap {
  [categorySlug: string]: string[];
}

// ───────────────────────────────────────────────────────────────
// MALE CATEGORIES
// ───────────────────────────────────────────────────────────────
export const MALE_CATEGORIES: PredefinedCategory[] = [
  { slug: "hair-cut-style", label: "Hair Cut & Style", icon: "content_cut" },
  { slug: "skin-care", label: "Skin Care", icon: "face" },
  { slug: "hair-colour", label: "Hair Colour", icon: "palette" },
  { slug: "hair-chemical", label: "Hair Chemical", icon: "science" },
  { slug: "mani-pedi-hygiene", label: "Mani Pedi & Hygiene", icon: "back_hand" },
  { slug: "spa-massage", label: "Spa & Massage", icon: "spa" },
  { slug: "body-polishing", label: "Body Polishing", icon: "auto_awesome" },
  { slug: "hair-treatments", label: "Hair Treatments", icon: "healing" },
  { slug: "pre-groom", label: "Pre Groom", icon: "checkroom" },
  { slug: "makeup", label: "Makeup", icon: "brush" },
];

// ───────────────────────────────────────────────────────────────
// MALE SERVICES (Category slug → Service names)
// ───────────────────────────────────────────────────────────────
export const MALE_SERVICES: PredefinedServiceMap = {
  "hair-cut-style": [
    "Haircut",
    "Beard",
    "Shave",
    "Headshave",
    "Shampoo & Conditioning – Standard",
    "Shampoo & Conditioning – Premium",
    "Haircut + 15 Mins Head Massage",
    "Haircut + Beard/Shaving + 10 Minutes Head Massage",
    "Haircut + Aroma Magic Sheet Mask + 10 Minutes Head Massage",
    "Haircut + Beard + Raaga Face & Neck Detan",
  ],
  "skin-care": [
    "Eyebrows – Threading",
    "Forehead – Threading",
    "Side Locks – Threading",
    "Rica Brazilian Wax – Forehead",
    "Rica Brazilian Wax – Side Locks",
    "O3+ D-Tan",
    "Face & Neck – Raaga Detan",
    "Raaga Facial",
    "Lotus Pearl Facial",
    "VLCC Fruit Cleanup",
    "O3+ Power Brightening Facial",
    "O3+ Shine & Glow Facial",
    "Aroma Magic Vitamin C Facial",
    "Lotus Platinum Facial",
    "Raaga Platinum Facial",
    "Derma Klay HYDRA Facial",
    "Jovees Gold Facial",
    "VLCC Charcoal Facial",
    "Aroma Magic Pearl Facial",
    "Lotus Radiant Gold Facial",
    "VLCC Anti-Tan Facial",
    "Jovees Whitening Facial",
    "Raaga Anti-Aging Facial",
    "Face & Neck – Oxy Bleach",
    "Organic Harvest Skin Glow Facial",
  ],
  "hair-colour": [
    "Beard Color",
    "Roots Only Application (Own Product, Without Hair Wash)",
    "Only Application (Own Product, With Hair Wash)",
    "Root Touch-Up – Loreal / Schwarzkopf / Wella",
    "Root Touch-Up – Ammonia Free",
    "Global Color",
    "Global Highlights",
  ],
  "hair-chemical": [
    "Keratin Smoothening",
    "Rebonding",
    "Botox Treatment",
  ],
  "mani-pedi-hygiene": [
    "Cut & File – Hand",
    "Cut & File – Feet",
    "Deluxe Manicure – FYC",
    "Deluxe Manicure – Blueberry",
    "Deluxe Pedicure – FYC",
    "Deluxe Pedicure – Blueberry",
    "Bombini Manicure",
    "Sara Rose Manicure",
    "Sara Detan Manicure",
    "Bombini Pedicure",
    "Sara Rose Pedicure",
    "O3+ Bubblegum Manicure",
    "Sara Detan Pedicure",
    "O3+ Bubblegum Pedicure",
  ],
  "spa-massage": [
    "Head Massage – Olive Oil",
    "Head, Neck & Shoulder Massage – Olive Oil",
    "Foot Reflexology – Olive Oil",
    "Aroma Body Massage With Olive Oil",
    "Swedish Massage With Olive Oil",
    "Reflexology Body Massage With Olive Oil – Premium",
    "Deep Tissue Massage With Olive Oil",
  ],
  "body-polishing": [
    "Basic Body Polishing",
    "Premium Body Polishing",
    "Body Polishing With Detan",
    "Body Polishing With Bleach",
  ],
  "hair-treatments": [
    "Basic Hair Spa",
    "Hair Spa",
    "Hair Spa – Anti-Dandruff Treatment",
    "Keratin Hair Spa",
    "Botox Treatment",
    "Keratin Smoothening",
    "Rebonding",
  ],
  "pre-groom": [
    "Basic Groom Package",
    "Premium Groom Package",
    "Luxury Groom Package",
    "Pre Wedding Groom Package",
  ],
  "makeup": [
    "Basic Makeup",
    "Party Makeup",
    "Engagement Makeup",
    "Reception Makeup",
    "Groom Makeup",
    "Basic Makeup Package",
    "Luxury Glow Makeup Package",
  ],
};


// ───────────────────────────────────────────────────────────────
// FEMALE CATEGORIES
// ───────────────────────────────────────────────────────────────
export const FEMALE_CATEGORIES: PredefinedCategory[] = [
  { slug: "skin-care", label: "Skin Care", icon: "face" },
  { slug: "hair-cut-style", label: "Hair Cut & Style", icon: "content_cut" },
  { slug: "hair-colour", label: "Hair Colour", icon: "palette" },
  { slug: "hair-treatments", label: "Hair Treatments", icon: "healing" },
  { slug: "mani-pedi-hygiene", label: "Mani Pedi & Hygiene", icon: "back_hand" },
  { slug: "spa-massage", label: "Spa & Massage", icon: "spa" },
  { slug: "makeup", label: "Makeup", icon: "brush" },
  { slug: "bridal-packages", label: "Bridal Packages", icon: "diamond" },
];

// ───────────────────────────────────────────────────────────────
// FEMALE SERVICES (Category slug → Service names)
// ───────────────────────────────────────────────────────────────
export const FEMALE_SERVICES: PredefinedServiceMap = {
  "skin-care": [
    "Eyebrows – Threading",
    "Forehead – Threading",
    "Upper Lip – Threading",
    "Upperlip – Threading (Premium)",
    "Chin – Threading",
    "Side Locks – Threading",
    "Full Face – Threading",
    "Aloevera – Underarms Waxing",
    "Rica Brazilian Wax – Underarms Waxing",
    "Aloevera – Half Arms Waxing",
    "Aloevera – Full Arms + Underarms Waxing",
    "Aloevera – Half Legs Waxing",
    "Aloevera – Stomach Waxing",
    "Honey Chocolate – Half Arms Waxing",
    "Honey Chocolate – Full Arms + Underarms Waxing",
    "Aloevera – Full Legs Waxing",
    "Honey Wax – Stomach Waxing",
    "Full Face Razor",
    "Aloevera – Back Waxing",
    "Rica – Stomach Waxing",
    "Honey Chocolate – Half Legs Waxing",
    "Honey Chocolate – Full Legs Waxing",
    "Honey Chocolate – Back Waxing",
    "O3+ Detan Wax – Full Arms + Underarms",
    "O3+ Detan Wax – Stomach",
    "Rica – Back Waxing",
    "Rica – Half Legs Waxing",
    "O3+ Detan Wax – Half Legs",
    "O3+ Detan Wax – Back",
    "Aloevera – Full Arms + Underarms + Full Legs Waxing",
    "Full Face – Rica Peel Off Wax",
    "Rica Roll On Wax – Stomach",
    "Rica Roll On Wax – Full Arms + Underarms",
    "Rica Roll On Wax – Back",
    "Rica Brazilian Wax – Bikini Line Waxing",
    "Rica Roll On Wax – Half Legs",
    "Rica Full Arms + Underarms Waxing",
    "O3+ Detan Wax – Full Legs",
    "Rica – Full Legs Waxing",
    "Rica Roll On Wax – Full Legs",
    "Rica Brazilian Wax – Bikini Waxing",
    "Honey Chocolate – Full Body Waxing",
    "Aloevera – Full Body Waxing",
    "Rica – Full Body Waxing",
    "O3+ Detan Wax – Full Body",
    "Face & Neck – Oxy Bleach",
    "Face & Neck – Raaga Detan",
    "Face & Neck – FEM Bleach",
    "O3+ D-Tan",
    "VLCC Fruit Cleanup",
    "VLCC Anti-Tan Facial",
    "Aroma Magic Pearl Facial",
    "Raaga Professional Facial",
    "Lotus Herbals Pearl Facial",
    "Raaga Professional Anti-Ageing Facial Kit",
    "Lotus Herbals Radiant Gold Facial",
    "Jovees Whitening Facial",
    "Jovees Gold Facial",
    "Lotus Herbals Platinum Facial",
    "O3+ Power Brightening Facial",
    "O3+ Shine & Glow Facial",
    "Aroma Magic Vitamin C Facial",
    "Raaga Professional Platinum Facial",
    "O3+ Bridal Glow Facial",
    "Korean Glass Facial",
    "Derma Klay HYDRA Facial",
    "Full Body Polishing",
    "Full Body Polishing With Bleach",
    "Full Body Polishing With Detan",
  ],
  "hair-cut-style": [
    "Split Ends Cut",
    "Haircut Without Blowdry",
    "Hair Wash – Shampoo + Conditioning (Standard)",
    "Hair Wash – Shampoo + Conditioning (Premium)",
    "Haircut + Straightening With Iron",
    "Blow Dry",
    "Haircut + Smooth & Straight Blowdry",
    "Haircut + In-Curl/Out-Curl Blowdry",
    "Straightening With Iron",
    "Haircut + Curls/Waves With Iron",
  ],
  "hair-colour": [
    "Roots: Only Application (Own Product, Without Hair Wash)",
    "Roots: Only Application (Own Product, With Hair Wash)",
    "Root Touch-Up – Loreal / Schwarzkopf / Wella",
    "Root Touch-Up – Ammonia Free",
    "Global Hair Color – Full Coverage (Shoulder Length)",
    "Global Hair Color – Full Coverage (Medium Length)",
    "Global Hair Color – Full Coverage (Long Length)",
    "Global Hair Color Change (Shoulder Length)",
    "Global Hair Color Change (Medium Length)",
    "Global Hair Color Change (Long Length)",
    "Global Highlights (Shoulder Length)",
    "Global Highlights (Medium Length)",
    "Global Highlights (Long Length)",
    "Balayage (Shoulder Length)",
    "Balayage (Medium Length)",
    "Balayage (Long Length)",
    "Ombre Hair Color",
  ],
  "hair-treatments": [
    "Keratin Hair Spa",
    "OLAPLEX Treatment",
    "Botox – Shoulder Length",
    "Botox – Medium Length",
    "Botox – Long Length",
    "Nanoplasty – Shoulder Length",
    "Nanoplasty – Medium Length",
    "Nanoplasty – Long Length",
    "Hair Spa – Shoulder Length",
    "Hair Spa – Medium Length",
    "Hair Spa – Long Length",
    "Hair Spa – Anti-Dandruff Treatment",
    "Keratin – Shoulder Length",
    "Keratin – Medium Length",
    "Keratin – Long Length",
    "Smoothening – Shoulder Length",
    "Smoothening – Medium Length",
    "Smoothening – Long Length",
    "Rebonding – Shoulder Length",
    "Rebonding – Medium Length",
    "Rebonding – Long Length",
    "Smoothening + Keratin Treatment",
  ],
  "mani-pedi-hygiene": [
    "Cut, File & Polish – Hand",
    "Cut, File & Polish – Foot",
    "Deluxe Manicure – FYC",
    "Deluxe Manicure – Blueberry",
    "Deluxe Pedicure – FYC",
    "Deluxe Pedicure – Blueberry",
    "Bombini Manicure",
    "Sara Rose Manicure",
    "Sara Detan Manicure",
    "Bombini Pedicure",
    "Sara Rose Pedicure",
    "O3+ Bubblegum Manicure",
    "Sara Detan Pedicure",
    "O3+ Bubblegum Pedicure",
  ],
  "spa-massage": [
    "Head Massage – Olive Oil",
    "Head, Neck & Shoulder Massage – Olive Oil",
    "Foot Reflexology – Olive Oil",
    "Aroma Body Massage With Olive Oil",
    "Swedish Massage With Olive Oil",
    "Reflexology Body Massage With Olive Oil – Premium",
    "Deep Tissue Massage With Olive Oil",
  ],
  "makeup": [
    "Saree Draping",
    "Bridesmaid's Makeup",
    "Basic Makeup",
    "Basic Makeup Package",
    "Party Makeup",
    "Luxury Glow Makeup Package",
    "Reception Makeup",
    "Engagement Makeup",
    "Bridal Makeup",
  ],
  "bridal-packages": [
    "Engagement To Wedding Glam",
    "Premium Bridal Makeup – Butterfly Kiss",
    "Glow Goddess Pre-Bridal",
    "Luxury Bridal & Beauty Ritual",
    "Head-To-Toe Glow-Up",
  ],
};


// ───────────────────────────────────────────────────────────────
// Helper functions
// ───────────────────────────────────────────────────────────────

/** Get categories for a given gender */
export function getCategoriesForGender(gender: string): PredefinedCategory[] {
  return gender === "male" ? MALE_CATEGORIES : FEMALE_CATEGORIES;
}

/** Get predefined service names for a given gender + category slug */
export function getServicesForCategory(gender: string, categorySlug: string): string[] {
  const map = gender === "male" ? MALE_SERVICES : FEMALE_SERVICES;
  return map[categorySlug] || [];
}

/** Get category label from slug + gender */
export function getCategoryLabelFromSlug(slug: string, gender: string): string {
  const cats = getCategoriesForGender(gender);
  const found = cats.find(c => c.slug === slug);
  return found ? found.label : (slug || "Unassigned");
}

/** Normalize a category string to its unified slug representation */
export function normalizeCategorySlug(category: string): string {
  if (!category) return "";
  const clean = category.trim().toLowerCase();
  if (clean.includes("cut") && clean.includes("style")) return "hair-cut-style";
  if (clean.includes("skin") && clean.includes("care")) return "skin-care";
  if (clean.includes("clour") || clean.includes("colour") || clean.includes("color")) return "hair-colour";
  if (clean.includes("chemical")) return "hair-chemical";
  if (clean.includes("mani") || clean.includes("pedi") || clean.includes("hygiene")) return "mani-pedi-hygiene";
  if (clean.includes("spa") || clean.includes("massage")) return "spa-massage";
  if (clean.includes("body") && clean.includes("polishing")) return "body-polishing";
  if (clean.includes("treatments") || clean.includes("treatment")) return "hair-treatments";
  if (clean.includes("pre") && clean.includes("groom")) return "pre-groom";
  if (clean.includes("makeup")) return "makeup";
  if (clean.includes("nail") && clean.includes("art")) return "nail-art";
  if (clean.includes("bridal") && clean.includes("package")) return "bridal-packages";
  return clean.replace(/\s+/g, "-").replace(/&/g, "and").replace(/[^a-z0-9\-]/g, "");
}

/** Get predefined service image path, or fallback if not matched */
export function getPredefinedServiceImage(gender: string, category: string, serviceName: string): string {
  if (!gender || !category || !serviceName) {
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80";
  }

  const g = gender.trim().toLowerCase();
  const catSlug = normalizeCategorySlug(category);
  const svc = serviceName.trim();

  // Check if this service name exists in predefined services for this category
  const servicesList = getServicesForCategory(g, catSlug);
  const isPredefined = servicesList.some(s => s.trim().toLowerCase() === svc.toLowerCase());

  if (!isPredefined) {
    // Fallback: Category image -> Premium default fallback
    return `/categories/${g}/${catSlug}.svg`;
  }

  // Replace slashes with colons for file system compatibility
  const safeSvcName = svc.replace(/\//g, ":");

  if (g === "male") {
    let folder = "";
    if (catSlug === "hair-cut-style") folder = "hair cut and style";
    else if (catSlug === "skin-care") folder = "skin care ";
    else if (catSlug === "hair-colour" || catSlug === "hair-color") folder = "hair Color";
    else if (catSlug === "hair-chemical") folder = "hair tretment";
    else if (catSlug === "mani-pedi-hygiene") folder = "mani pedicure";
    else if (catSlug === "spa-massage") folder = "spa & massage";
    else if (catSlug === "hair-treatments") folder = "hair tretment";
    else if (catSlug === "makeup") folder = "makeup";
    else folder = catSlug;

    return `/male service/${folder}/${safeSvcName}.svg`;
  } else {
    let folder = "";
    if (catSlug === "bridal-packages") folder = "    Bridal Packages";
    else if (catSlug === "hair-cut-style") folder = "    Hair Cut & Style";
    else if (catSlug === "hair-treatments") folder = "    Hair Treatments";
    else if (catSlug === "hair-chemical") folder = "    Hair Treatments";
    else if (catSlug === "makeup") folder = "    Makeup";
    else if (catSlug === "mani-pedi-hygiene") folder = "    Mani Pedi & Hygiene";
    else if (catSlug === "spa-massage") folder = "    Spa & Massage";
    else if (catSlug === "skin-care") folder = "Skin Care";
    else if (catSlug === "hair-colour" || catSlug === "hair-color") folder = "hair color";
    else folder = catSlug;

    return `/Female Service/${folder}/${safeSvcName}.svg`;
  }
}

/** Resolve the correct service image with fallbacks: Custom -> Predefined SVG -> Category SVG -> Premium Fallback */
export function resolveServiceImage(service: { name: string; gender: string; category: string; image?: string }): string {
  if (!service) {
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80";
  }

  // 1. If service has a custom stored image that is NOT the fallback default or category SVG, use it
  if (
    service.image &&
    !service.image.includes("1560066984-138dadb4c035") &&
    !service.image.includes("/categories/")
  ) {
    // Check if it is a predefined URL or local SVG path
    if (service.image.startsWith("/") || service.image.startsWith("http")) {
      return service.image;
    }
  }

  // 2. Resolve predefined image
  const predefinedImage = getPredefinedServiceImage(service.gender, service.category, service.name);
  if (predefinedImage && !predefinedImage.includes("/categories/")) {
    return predefinedImage;
  }

  // 3. Fallback to Category SVG if available
  const catSlug = normalizeCategorySlug(service.category);
  const g = service.gender ? service.gender.trim().toLowerCase() : "female";
  if (catSlug) {
    return `/categories/${g}/${catSlug}.svg`;
  }

  // 4. Ultimate fallback
  return "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80";
}


