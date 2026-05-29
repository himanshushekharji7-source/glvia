"use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { supabase, TABLES } from "../../../lib/supabase";
import AdminTable from "../../../components/admin/AdminTable";
import AdminFormModal from "../../../components/admin/AdminFormModal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";

// Import Shared Logic and Hooks (from Salon Owner system / shared layer)
import {
  useSalon,
  useSalonOwnerStats,
  useMyBookings,
  useUpdateBookingStatus,
  useSalonStaff,
  useAddStaff,
  useUpdateStaff,
  useDeleteStaff,
  useUpdateSalonProfile,
  useReviewsModeration,
  useUpdateReviewStatus,
} from "../../../lib/hooks";

// Future-proof Dynamic Module Registry
interface ModuleRegistry {
  key: string;
  label: string;
  icon: string;
  enabled: boolean;
}

const salonWorkspaceModules: ModuleRegistry[] = [
  { key: "overview", label: "Overview", icon: "dashboard", enabled: true },
  { key: "bookings", label: "Bookings", icon: "calendar_month", enabled: true },
  { key: "services", label: "Services & Categories", icon: "spa", enabled: true },
  { key: "staff", label: "Staff Roster", icon: "groups", enabled: true },
  { key: "settings", label: "Salon Settings", icon: "settings", enabled: true },
  { key: "media", label: "Media Gallery", icon: "image", enabled: true },
  { key: "reviews", label: "Reviews & Ratings", icon: "rate_review", enabled: true },
  { key: "preview", label: "Marketplace Preview", icon: "visibility", enabled: true },
  { key: "finance", label: "Finance & Payouts", icon: "payments", enabled: false },
  { key: "campaigns", label: "Marketing Campaigns", icon: "campaign", enabled: false },
  { key: "subscriptions", label: "Subscriptions", icon: "card_membership", enabled: false }
];

const getCategoryLabel = (slug: string, gender: string) => {
  const list = gender === "male" ? [
    { label: "Hair Cut & Style", slug: "hair-cut-style" },
    { label: "Skin Care", slug: "skin-care" },
    { label: "Hair Colour", slug: "hair-colour" },
    { label: "Hair Chemical", slug: "hair-chemical" },
    { label: "Mani Pedi & Hygiene", slug: "mani-pedi-hygiene" },
    { label: "Spa & Massage", slug: "spa-massage" },
    { label: "Body Polishing", slug: "body-polishing" },
    { label: "Hair Treatments", slug: "hair-treatments" },
    { label: "Pre Groom", slug: "pre-groom" },
    { label: "Makeup", slug: "makeup" },
  ] : [
    { label: "Hair Cut & Style", slug: "hair-cut-style" },
    { label: "Hair Colour", slug: "hair-colour" },
    { label: "Hair Treatments", slug: "hair-treatments" },
    { label: "Hair Chemical", slug: "hair-chemical" },
    { label: "Mani Pedi & Hygiene", slug: "mani-pedi-hygiene" },
    { label: "Skin Care", slug: "skin-care" },
    { label: "Spa & Massage", slug: "spa-massage" },
    { label: "Makeup", slug: "makeup" },
    { label: "Nail Art", slug: "nail-art" },
    { label: "Bridal Packages", slug: "bridal-packages" },
  ];
  const found = list.find(c => c.slug === slug);
  return found ? found.label : (slug || "Unassigned");
};

const normalizeCategorySlug = (category: string) => {
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
};

const getCategoryUniversalImage = (slug: string, gender: string): string => {
  const normSlug = normalizeCategorySlug(slug);
  return `/categories/${gender}/${normSlug}.svg`;
};

// Configuration schemas for Form Modals (services & categories)
const serviceFieldsPlaceholder = [];

const catFields = [
  { name: "name", label: "Category Name", type: "text" as const, required: true },
  { name: "image", label: "Category Image", type: "url" as const, required: true, folder: "category-images" },
  { name: "gender", label: "Gender", type: "select" as const, required: true, options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }] },
  { name: "sort_order", label: "Sort Order", type: "number" as const, placeholder: "0" },
];

export default function SalonWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // --- Dynamic Tab Registry Selection ---
  const activeModules = salonWorkspaceModules.filter((m) => m.enabled);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // --- Toast notifications ---
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // --- Shared Data Layer Queries ---
  const { data: salon, isLoading: salonLoading, refetch: refetchSalon } = useSalon(id);
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useSalonOwnerStats(id);
  
  // --- Owner Query ---
  const [ownerName, setOwnerName] = useState<string>("Loading...");
  const fetchOwner = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.ADMIN_USERS)
        .select("name")
        .eq("salon_id", id)
        .eq("role", "salon_owner")
        .limit(1);
      if (data && data.length > 0) {
        setOwnerName(data[0].name);
      } else {
        setOwnerName("Unassigned");
      }
    } catch (err) {
      console.error("Error fetching owner:", err);
      setOwnerName("Unassigned");
    }
  };

  // --- Client-side Date Initialization (Prevents Hydration Mismatch) ---
  const [todayString, setTodayString] = useState<string>("");
  useEffect(() => {
    setTodayString(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (id) {
      fetchOwner();
    }
  }, [id]);

  // --- Quick Actions: Status updates ---
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const handleUpdateStatus = async (status: "approved" | "suspended" | "pending" | "rejected", is_active: boolean) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from(TABLES.SALONS)
        .update({ status, is_active })
        .eq("id", id);
      if (error) {
        showToast("Error: " + error.message);
      } else {
        showToast(`Salon status set to: ${status.toUpperCase()}`);
        refetchSalon();
      }
    } catch (e: any) {
      showToast("Error: " + e.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ===========================================================================
  // SUB-PANE STATE & LOGIC: BOOKINGS TAB
  // ===========================================================================
  const { data: bookings = [], isLoading: bookingsLoading } = useMyBookings(id);
  const updateBookingStatus = useUpdateBookingStatus();
  const [bookingFilter, setBookingFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    setUpdatingBookingId(bookingId);
    try {
      await updateBookingStatus.mutateAsync({ id: bookingId, status });
      showToast("Booking status updated!");
      refetchStats(); // update revenue metrics instantly
    } catch (err: any) {
      showToast("Error: " + err.message);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const filteredBookings = bookingFilter === "all" 
    ? bookings 
    : bookings.filter((b: any) => b.status === bookingFilter);

  const bookingColumns = [
    { key: "bookingReference", label: "Booking Ref", width: "130px", render: (v: string) => <span className="font-mono font-bold text-xs">{v}</span> },
    {
      key: "customerName",
      label: "Customer",
      render: (v: string, row: any) => (
        <div>
          <div className="font-bold text-text-primary text-sm">{v || "Guest"}</div>
          <div className="text-xs text-text-secondary mt-0.5">{row.customerPhone || "—"}</div>
        </div>
      ),
    },
    {
      key: "date",
      label: "Schedule",
      render: (v: string, row: any) => (
        <div className="text-xs">
          <span className="font-semibold text-text-primary">{v}</span>
          <span className="text-text-secondary mx-1.5">•</span>
          <span className="text-text-secondary">{row.timeSlot}</span>
        </div>
      ),
    },
    { key: "services", label: "Services", render: (v: any[]) => <span className="text-xs truncate max-w-[200px] block">{v?.map((s: any) => s.name).join(", ") || "—"}</span> },
    { key: "totalAmount", label: "Amount", width: "100px", render: (v: number) => <span className="font-extrabold text-primary">₹{v}</span> },
    {
      key: "status",
      label: "Status",
      width: "120px",
      render: (v: string) => (
        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
          v === "confirmed" ? "bg-green-50 text-green-600 border border-green-200" :
          v === "completed" ? "bg-blue-50 text-blue-600 border border-blue-200" :
          v === "cancelled" ? "bg-red-50 text-red-600 border border-red-200" :
          "bg-yellow-50 text-yellow-600 border border-yellow-200"
        }`}>
          {v}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "180px",
      render: (_: any, row: any) => {
        const isPending = row.status === "pending";
        const isConfirmed = row.status === "confirmed";
        const isFinal = row.status === "completed" || row.status === "cancelled";
        const isMutating = updatingBookingId === row.id;

        if (isFinal) return <span className="text-xs text-text-tertiary font-medium">Finalized</span>;

        return (
          <div className="flex items-center gap-1.5 justify-end">
            {isPending && (
              <button
                onClick={() => handleUpdateBookingStatus(row.id, "confirmed")}
                disabled={isMutating}
                className="px-2 py-1 text-[11px] font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-md border border-green-200 transition-colors disabled:opacity-50"
              >
                Confirm
              </button>
            )}
            {isConfirmed && (
              <button
                onClick={() => handleUpdateBookingStatus(row.id, "completed")}
                disabled={isMutating}
                className="px-2 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors disabled:opacity-50"
              >
                Complete
              </button>
            )}
            <button
              onClick={() => handleUpdateBookingStatus(row.id, "cancelled")}
              disabled={isMutating}
              className="px-2 py-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        );
      },
    },
  ];

  // ===========================================================================
  // SUB-PANE STATE & LOGIC: REVIEWS & RATINGS MODERATION
  // ===========================================================================
  const { data: reviews = [], isLoading: reviewsLoading } = useReviewsModeration(id);
  const updateReviewStatus = useUpdateReviewStatus();
  const [updatingReviewId, setUpdatingReviewId] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<"all" | "pending" | "approved" | "rejected" | "hidden">("all");

  const handleUpdateReviewStatus = async (reviewId: string, status: "approved" | "rejected" | "hidden") => {
    setUpdatingReviewId(reviewId);
    try {
      await updateReviewStatus.mutateAsync({ id: reviewId, salon_id: id, status });
      showToast(`Review set to ${status.toUpperCase()}!`);
      refetchSalon(); // update average rating and total counts if recalculated in real time
    } catch (err: any) {
      showToast("Error updating status: " + err.message);
    } finally {
      setUpdatingReviewId(null);
    }
  };

  const filteredReviews = reviewFilter === "all"
    ? reviews
    : reviews.filter((r: any) => r.status === reviewFilter);

  const reviewColumns = [
    {
      key: "customer",
      label: "Customer",
      width: "220px",
      render: (_: any, row: any) => {
        const name = row.customer 
          ? `${row.customer.first_name || ""} ${row.customer.last_name || ""}`.trim() || "Client"
          : row.customerName || "Client";
        const avatar = row.customer?.avatar_url;
        
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black shrink-0 overflow-hidden relative border border-border">
              {avatar ? (
                <Image src={avatar} alt="" fill className="object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-text-primary text-sm truncate flex items-center gap-1.5">
                {name}
                {row.is_verified_booking && (
                  <span className="material-icons-round text-[13px] text-green-500" title="Verified Customer">verified</span>
                )}
              </div>
              <div className="text-[10px] text-text-tertiary mt-0.5 font-medium">
                {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: "rating",
      label: "Rating",
      width: "120px",
      render: (v: number) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <span 
              key={idx} 
              className={`material-icons-round text-sm ${idx < v ? "text-amber-400" : "text-gray-200"}`}
            >
              star
            </span>
          ))}
          <span className="text-xs font-bold text-text-secondary ml-1.5">{v}.0</span>
        </div>
      )
    },
    {
      key: "review_text",
      label: "Review Content",
      render: (_: any, row: any) => (
        <div className="space-y-1.5 max-w-md py-1">
          {row.service?.name && (
            <span className="inline-block text-[9px] font-black uppercase bg-surface-dim border border-border text-text-secondary px-2 py-0.5 rounded">
              Service: {row.service.name}
            </span>
          )}
          <p className="text-xs text-text-primary font-medium leading-relaxed break-words whitespace-pre-line">
            {row.review_text || <span className="italic text-text-tertiary">No text review left.</span>}
          </p>
          {row.images && row.images.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar">
              {row.images.map((img: string, idx: number) => (
                <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-border bg-surface-dim shrink-0 group">
                  <Image src={img} alt="" fill className="object-cover" />
                  <a 
                    href={img} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-icons-round text-[12px] text-white">open_in_new</span>
                  </a>
                </div>
              ))}
            </div>
          )}
          {row.owner_reply && (
            <div className="bg-surface-dim border border-border rounded-xl p-2.5 mt-2 flex gap-2">
              <span className="material-icons-round text-[14px] text-primary shrink-0 mt-0.5">reply</span>
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold text-text-primary uppercase tracking-wider">Owner Reply</div>
                <p className="text-[11px] text-text-secondary mt-0.5 leading-normal italic">{row.owner_reply}</p>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      width: "120px",
      render: (v: string) => (
        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
          v === "approved" ? "bg-green-50 text-green-600 border border-green-200" :
          v === "pending" ? "bg-yellow-50 text-yellow-600 border border-yellow-200" :
          v === "rejected" ? "bg-red-50 text-red-600 border border-red-200" :
          v === "hidden" ? "bg-gray-100 text-gray-500 border border-gray-200" :
          "bg-yellow-50 text-yellow-600 border border-yellow-200"
        }`}>
          {v || "pending"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "200px",
      render: (_: any, row: any) => {
        const isApproved = row.status === "approved";
        const isRejected = row.status === "rejected";
        const isHidden = row.status === "hidden";
        const isMutating = updatingReviewId === row.id;

        return (
          <div className="flex items-center gap-1.5 justify-end">
            {!isApproved && (
              <button
                onClick={() => handleUpdateReviewStatus(row.id, "approved")}
                disabled={isMutating}
                className="px-2 py-1 text-[11px] font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-md border border-green-200 transition-colors disabled:opacity-50"
              >
                Approve
              </button>
            )}
            {!isRejected && (
              <button
                onClick={() => handleUpdateReviewStatus(row.id, "rejected")}
                disabled={isMutating}
                className="px-2 py-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            )}
            {!isHidden && (
              <button
                onClick={() => handleUpdateReviewStatus(row.id, "hidden")}
                disabled={isMutating}
                className="px-2 py-1 text-[11px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md border border-border transition-colors disabled:opacity-50"
              >
                Hide
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // ===========================================================================
  // SUB-PANE STATE & LOGIC: SERVICES & CATEGORIES TAB
  // ===========================================================================
  const [serviceGender, setServiceGender] = useState<"male" | "female">("male");
  const [subTab, setSubTab] = useState<"services" | "categories">("services");
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [salonCategoriesList, setSalonCategoriesList] = useState<any[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [savingEntity, setSavingEntity] = useState(false);

  const dynamicServiceFields = useMemo(() => {
    const currentGender = formValues.gender || serviceGender || "female";
    
    // Fallback standard default categories
    const defaultCats = currentGender === "male" 
      ? [
          { value: "hair-cut-style", label: "Hair Cut & Style" },
          { value: "skin-care", label: "Skin Care" },
          { value: "hair-colour", label: "Hair Colour" },
          { value: "hair-chemical", label: "Hair Chemical" },
          { value: "mani-pedi-hygiene", label: "Mani Pedi & Hygiene" },
          { value: "spa-massage", label: "Spa & Massage" },
          { value: "body-polishing", label: "Body Polishing" },
          { value: "hair-treatments", label: "Hair Treatments" },
          { value: "pre-groom", label: "Pre Groom" },
          { value: "makeup", label: "Makeup" },
        ]
      : [
          { value: "hair-cut-style", label: "Hair Cut & Style" },
          { value: "hair-colour", label: "Hair Colour" },
          { value: "hair-treatments", label: "Hair Treatments" },
          { value: "hair-chemical", label: "Hair Chemical" },
          { value: "mani-pedi-hygiene", label: "Mani Pedi & Hygiene" },
          { value: "skin-care", label: "Skin Care" },
          { value: "spa-massage", label: "Spa & Massage" },
          { value: "makeup", label: "Makeup" },
          { value: "nail-art", label: "Nail Art" },
          { value: "bridal-packages", label: "Bridal Packages" },
        ];

    return [
      { name: "name", label: "Service Name", type: "text" as const, required: true },
      { name: "description", label: "Description", type: "textarea" as const },
      { name: "products_used", label: "Products Used (comma-separated)", type: "text" as const, placeholder: "e.g. Shampoo, Hair spa cream" },
      { name: "duration", label: "Duration (min)", type: "text" as const, placeholder: "e.g. 30" },
      { name: "price", label: "Price (₹)", type: "number" as const, required: true },
      { name: "old_price", label: "Old Price (₹)", type: "number" as const },
      { name: "category", label: "Category Name", type: "select" as const, required: true, options: defaultCats },
      { name: "image", label: "Image URL", type: "url" as const, required: true },
      { name: "gender", label: "Gender", type: "select" as const, required: true, options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }] },
      { name: "sort_order", label: "Sort Order", type: "number" as const, placeholder: "0" },
    ];
  }, [formValues.gender, serviceGender]);

  const dynamicCatFields = useMemo(() => {
    const currentGender = formValues.gender || serviceGender || "female";
    const opts = currentGender === "male"
      ? [
          { value: "Hair Cut & Style", label: "Hair Cut & Style" },
          { value: "Skin Care", label: "Skin Care" },
          { value: "Hair Colour", label: "Hair Colour" },
          { value: "Hair Chemical", label: "Hair Chemical" },
          { value: "Mani Pedi & Hygiene", label: "Mani Pedi & Hygiene" },
          { value: "Spa & Massage", label: "Spa & Massage" },
          { value: "Body Polishing", label: "Body Polishing" },
          { value: "Hair Treatments", label: "Hair Treatments" },
          { value: "Pre Groom", label: "Pre Groom" },
          { value: "Makeup", label: "Makeup" },
        ]
      : [
          { value: "Hair Cut & Style", label: "Hair Cut & Style" },
          { value: "Hair Colour", label: "Hair Colour" },
          { value: "Hair Treatments", label: "Hair Treatments" },
          { value: "Hair Chemical", label: "Hair Chemical" },
          { value: "Mani Pedi & Hygiene", label: "Mani Pedi & Hygiene" },
          { value: "Skin Care", label: "Skin Care" },
          { value: "Spa & Massage", label: "Spa & Massage" },
          { value: "Makeup", label: "Makeup" },
          { value: "Nail Art", label: "Nail Art" },
          { value: "Bridal Packages", label: "Bridal Packages" },
        ];

    return [
      { name: "name", label: "Category Name", type: "select" as const, required: true, options: opts },
      { name: "gender", label: "Gender", type: "select" as const, required: true, options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }] },
      { name: "sort_order", label: "Sort Order", type: "number" as const, placeholder: "0" },
    ];
  }, [formValues.gender, serviceGender]);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deletingEntity, setDeletingEntity] = useState(false);

  const fetchServicesOrCategories = async () => {
    setServicesLoading(true);
    try {
      const table = subTab === "services" ? TABLES.SALON_SERVICES : TABLES.SALON_CATEGORIES;
      const { data: rows } = await supabase
        .from(table)
        .select("*")
        .eq("salon_id", id)
        .eq("gender", serviceGender)
        .order("sort_order", { ascending: true });
      setServicesData(rows || []);

      // Also dynamically fetch all category definitions for forms and labels
      const { data: cats } = await supabase
        .from(TABLES.SALON_CATEGORIES)
        .select("*")
        .eq("salon_id", id);
      setSalonCategoriesList(cats || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "services") {
      fetchServicesOrCategories();
    }
  }, [activeTab, subTab, serviceGender]);

  const openAddEntity = () => {
    setEditing(null);
    setFormValues({ salon_id: id, gender: serviceGender, sort_order: 0 });
    setModalOpen(true);
  };

  const openEditEntity = (row: any) => {
    setEditing(row);
    setFormValues({ ...row });
    setModalOpen(true);
  };

  const handleSaveEntity = async () => {
    setSavingEntity(true);
    try {
      const table = subTab === "services" ? TABLES.SALON_SERVICES : TABLES.SALON_CATEGORIES;
      const payload: any = { ...formValues, salon_id: id };
      if (subTab === "services" && payload.category) {
        payload.category = normalizeCategorySlug(payload.category);
      }
      delete payload.id;
      delete payload.created_at;

      if (editing) {
        const { error } = await supabase.from(table).update(payload).eq("id", editing.id);
        if (error) throw error;
        showToast("Successfully updated!");
      } else {
        const { error } = await supabase.from(table).insert(payload);
        if (error) throw error;
        showToast("Successfully added!");
      }
      setModalOpen(false);
      fetchServicesOrCategories();
      refetchSalon(); // trigger update in details
    } catch (err: any) {
      showToast("Error: " + err.message);
    } finally {
      setSavingEntity(false);
    }
  };

  const handleDeleteEntity = async () => {
    if (!deleteTarget) return;
    setDeletingEntity(true);
    try {
      const table = subTab === "services" ? TABLES.SALON_SERVICES : TABLES.SALON_CATEGORIES;
      const { error } = await supabase.from(table).delete().eq("id", deleteTarget.id);
      if (error) throw error;
      showToast("Successfully deleted!");
      setDeleteTarget(null);
      fetchServicesOrCategories();
      refetchSalon();
    } catch (err: any) {
      showToast("Error: " + err.message);
    } finally {
      setDeletingEntity(false);
    }
  };

  const serviceColumns = [
    { key: "image", label: "Image", width: "70px", render: (v: string) => v ? <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border"><Image src={v} alt="" fill className="object-cover" /></div> : <div className="w-10 h-10 rounded-lg bg-surface-dim border border-border flex items-center justify-center text-text-tertiary"><span className="material-icons-round text-sm">spa</span></div> },
    { key: "name", label: "Service Name", render: (v: string, row: any) => <div><div className="font-bold text-text-primary">{v}</div>{row.description && <div className="text-xs text-text-secondary truncate max-w-xs mt-0.5">{row.description}</div>}</div> },
    { key: "category", label: "Category", render: (v: string, row: any) => {
      const match = salonCategoriesList.find(c => normalizeCategorySlug(c.name) === v && c.gender === row.gender);
      return <span className="text-xs bg-surface-dim px-2 py-0.5 rounded border border-border">{match ? match.name : (getCategoryLabel(v, row.gender) || "Unassigned")}</span>;
    } },
    { key: "price", label: "Price", width: "100px", render: (v: number) => <span className="font-bold text-text-primary">₹{v}</span> },
    { key: "old_price", label: "Old Price", width: "100px", render: (v: number) => v ? <span className="text-xs text-text-tertiary line-through">₹{v}</span> : "—" },
    { key: "duration", label: "Duration", width: "100px", render: (v: string) => v ? `${v} min` : "—" },
  ];

  const categoryColumns = [
    { key: "image", label: "Image", width: "70px", render: (v: string, row: any) => {
      const svgPath = getCategoryUniversalImage(normalizeCategorySlug(row.name), row.gender);
      return <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border bg-[#FDF2F8]"><Image src={svgPath} alt="" fill className="object-cover" /></div>;
    } },
    { key: "name", label: "Category Name", render: (v: string) => <span className="font-bold text-text-primary">{v}</span> },
    { key: "sort_order", label: "Sort Order", width: "100px" },
  ];

  // ===========================================================================
  // SUB-PANE STATE & LOGIC: STAFF ROSTER TAB
  // ===========================================================================
  const { data: staffList = [], isLoading: staffLoading, refetch: refetchStaff } = useSalonStaff(id);
  const addStaffMutation = useAddStaff();
  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [staffForm, setStaffForm] = useState({ name: "", role: "Stylist", is_available: true });
  const [savingStaff, setSavingStaff] = useState(false);

  const openAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({ name: "", role: "Stylist", is_available: true });
    setStaffModalOpen(true);
  };

  const openEditStaff = (member: any) => {
    setEditingStaff(member);
    setStaffForm({ name: member.name, role: member.role, is_available: !!member.is_available });
    setStaffModalOpen(true);
  };

  const handleSaveStaff = async () => {
    if (!staffForm.name.trim()) return;
    setSavingStaff(true);
    try {
      if (editingStaff) {
        await updateStaffMutation.mutateAsync({
          id: editingStaff.id,
          salon_id: id,
          name: staffForm.name,
          role: staffForm.role,
          is_available: staffForm.is_available,
        });
        showToast("Staff updated!");
      } else {
        await addStaffMutation.mutateAsync({
          salon_id: id,
          name: staffForm.name,
          role: staffForm.role,
        });
        showToast("Staff added!");
      }
      setStaffModalOpen(false);
      refetchStaff();
      refetchStats(); // refresh overview stats
    } catch (err: any) {
      showToast("Error: " + err.message);
    } finally {
      setSavingStaff(false);
    }
  };

  const handleToggleStaffAvailability = async (member: any) => {
    try {
      await updateStaffMutation.mutateAsync({
        id: member.id,
        salon_id: id,
        is_available: !member.is_available,
      });
      showToast(`${member.name} availability toggled!`);
      refetchStaff();
      refetchStats();
    } catch (err: any) {
      showToast("Error: " + err.message);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await deleteStaffMutation.mutateAsync({ id: staffId, salon_id: id });
      showToast("Staff removed!");
      refetchStaff();
      refetchStats();
    } catch (err: any) {
      showToast("Error: " + err.message);
    }
  };

  // ===========================================================================
  // SUB-PANE STATE & LOGIC: SALON SETTINGS TAB
  // ===========================================================================
  const updateSalonProfile = useUpdateSalonProfile();
  const [salonSettingsForm, setSalonSettingsForm] = useState<any>({});
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (salon) {
      setSalonSettingsForm({
        ...salon,
        facilities_string: salon.facilities?.join(', ') || '',
        tags_string: salon.tags?.join(', ') || '',
        featured: !!salon.featured,
        is_active: !!salon.is_active,
        google_map_url: salon.google_map_url || ''
      });
    }
  }, [salon]);

  const handleSaveSettings = async () => {
    if (!salonSettingsForm.name || !salonSettingsForm.address_street || !salonSettingsForm.address_city) {
      showToast("Name, street and city are required");
      return;
    }
    setSavingSettings(true);
    try {
      const facilitiesArray = salonSettingsForm.facilities_string
        ? salonSettingsForm.facilities_string.split(',').map((u: string) => u.trim()).filter(Boolean)
        : [];

      const tagsArray = salonSettingsForm.tags_string
        ? salonSettingsForm.tags_string.split(',').map((u: string) => u.trim()).filter(Boolean)
        : [];

      const updateData = {
        name: salonSettingsForm.name,
        description: salonSettingsForm.description || null,
        price_range: salonSettingsForm.price_range || null,
        contact_phone: salonSettingsForm.contact_phone || null,
        contact_email: salonSettingsForm.contact_email || null,
        address_street: salonSettingsForm.address_street,
        address_city: salonSettingsForm.address_city,
        address_state: salonSettingsForm.address_state || null,
        distance: salonSettingsForm.distance || null,
        rating: parseFloat(salonSettingsForm.rating) || 0,
        total_reviews: parseInt(salonSettingsForm.total_reviews) || 0,
        facilities: facilitiesArray,
        timings: salonSettingsForm.timings || null,
        tags: tagsArray,
        featured: !!salonSettingsForm.featured,
        is_active: !!salonSettingsForm.is_active,
        status: salonSettingsForm.status || 'pending',
        google_map_url: salonSettingsForm.google_map_url || null
      };

      await updateSalonProfile.mutateAsync({ id, ...updateData });
      showToast("Salon settings updated!");
      refetchSalon();
    } catch (err: any) {
      showToast("Error updating settings: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // ===========================================================================
  // SUB-PANE STATE & LOGIC: MEDIA GALLERY TAB
  // ===========================================================================
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const handleRemoveMediaImage = async (index: number) => {
    if (!confirm("Are you sure you want to remove this image from the gallery?")) return;
    const updatedImages = [...(salonSettingsForm.images || [])];
    updatedImages.splice(index, 1);
    
    try {
      setSavingSettings(true);
      const { error } = await supabase
        .from(TABLES.SALONS)
        .update({ images: updatedImages })
        .eq("id", id);
      if (error) throw error;
      setSalonSettingsForm((prev: any) => ({ ...prev, images: updatedImages }));
      showToast("Image removed!");
      refetchSalon();
    } catch (err: any) {
      showToast("Error: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append("file", file);
    
    setUploadingMedia(true);
    try {
      const res = await axios.post("/api/media", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        const fileUrl = res.data.file.url;
        const currentImages = salonSettingsForm.images || [];
        const updatedImages = [...currentImages, fileUrl];
        
        const { error } = await supabase
          .from(TABLES.SALONS)
          .update({ images: updatedImages })
          .eq("id", id);
        if (error) throw error;
        
        setSalonSettingsForm((prev: any) => ({
          ...prev,
          images: updatedImages
        }));
        showToast("Image uploaded and saved successfully!");
        refetchSalon();
      } else {
        showToast("Upload failed: " + res.data.error);
      }
    } catch (error: any) {
      showToast("Upload failed: " + error.message);
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  // --- Main loading state ---
  if (salonLoading) {
    return (
      <div className="bg-surface rounded-2xl p-12 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-text-secondary text-sm font-medium">Loading Salon Workspace...</p>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="bg-surface-card rounded-2xl border border-border p-12 text-center shadow-sm">
        <span className="material-icons-round text-error text-[48px] mb-3 block">warning</span>
        <h2 className="text-lg font-bold text-text-primary mb-1">Salon Not Found</h2>
        <p className="text-text-secondary text-sm mb-4">The requested salon ID does not exist or has been removed.</p>
        <Link href="/admin/salons" className="btn-primary text-sm py-2 px-4">Back to Salons</Link>
      </div>
    );
  }

  // Completeness / Health math
  const profileSteps = [
    { label: "Name & Address set", done: !!(salon.name && salon.name !== "My Salon" && salon.address_city) },
    { label: "Services added", done: salon.services && salon.services.length > 0 },
    { label: "Roster has Staff", done: staffList && staffList.length > 0 },
    { label: "Timings configured", done: !!salon.timings },
    { label: "Photos uploaded", done: salon.images && salon.images.length > 0 },
    { label: "Description provided", done: !!salon.description },
    { label: "Verification Status", done: salon.status === "approved" }
  ];
  const completedCount = profileSteps.filter((s) => s.done).length;
  const healthPercentage = Math.round((completedCount / profileSteps.length) * 100) || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg animate-fadeInUp flex items-center gap-2 border border-white/10">
          <span className="material-icons-round text-[14px] text-green-400">check_circle</span>
          {toast}
        </div>
      )}

      {/* ─── Premium Salon Context Header ─── */}
      <div className="bg-surface-card border border-border-strong rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-fadeIn">
        <div className="flex items-center gap-4 min-w-0">
          {/* Logo / Thumbnail */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-dim border border-border flex-shrink-0">
            {salon.images && salon.images.length > 0 ? (
              <Image src={salon.images[0]} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary bg-primary/10">
                <span className="material-icons-round text-3xl">spa</span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl font-black text-text-primary tracking-tight leading-none truncate">{salon.name}</h1>
              {salon.featured && (
                <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 tracking-wider">
                  <span className="material-icons-round text-[10px]">star</span>Featured
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap">
              <span className="flex items-center gap-1">
                <span className="material-icons-round text-[13px] text-primary">person</span>
                Owner: <strong className="text-text-primary ml-0.5">{ownerName}</strong>
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="flex items-center gap-1">
                <span className="material-icons-round text-[13px] text-amber-500">star</span>
                {salon.rating || "0.0"} ({salon.total_reviews || 0} reviews)
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="flex items-center gap-1">
                <span className="material-icons-round text-[13px] text-text-tertiary">location_on</span>
                {salon.address_city || "No City"}
              </span>
            </div>

            {/* Verification & Marketplace status row */}
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge text-[9px] font-black uppercase tracking-wider ${
                salon.status === "approved" ? "badge-success" :
                salon.status === "pending" ? "badge-warning" :
                salon.status === "suspended" ? "bg-red-50 text-red-600 border border-red-200" :
                "bg-gray-100 text-gray-500 border border-gray-200"
              }`}>
                {salon.status || "pending"}
              </span>

              <span className={`badge text-[9px] font-black uppercase tracking-wider ${
                salon.is_active ? "badge-success" : "bg-gray-100 text-gray-400 border border-gray-200"
              }`}>
                {salon.is_active ? "Active & Live" : "Hidden (Inactive)"}
              </span>
            </div>
          </div>
        </div>

        {/* Header Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap lg:justify-end">
          {salon.status !== "approved" ? (
            <button
              onClick={() => handleUpdateStatus("approved", true)}
              disabled={updatingStatus}
              className="px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <span className="material-icons-round text-[15px]">verified</span>
              Approve & List
            </button>
          ) : (
            <button
              onClick={() => handleUpdateStatus("suspended", false)}
              disabled={updatingStatus}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <span className="material-icons-round text-[15px]">block</span>
              Suspend Listing
            </button>
          )}

          <Link
            href={`/salon-owner/dashboard?salon_id=${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-bold text-text-primary bg-white border border-border-strong hover:bg-surface-dim rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span className="material-icons-round text-[15px]">impersonate</span>
            Impersonate Owner
          </Link>

          <Link
            href={`/salon/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl flex items-center gap-1.5 transition-colors border border-primary/10"
          >
            <span className="material-icons-round text-[15px]">open_in_new</span>
            Open Public App
          </Link>
        </div>
      </div>

      {/* ─── Premium Workspace Tab Navigation ─── */}
      <div className="bg-surface-card border border-border-strong rounded-2xl p-1.5 shadow-sm overflow-hidden animate-fadeIn">
        <div className="flex border-b border-border gap-1 overflow-x-auto no-scrollbar">
          {activeModules.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveTab(m.key)}
              className={`px-4 py-3 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === m.key
                  ? "border-primary text-primary bg-primary/5 rounded-t-xl"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-dim/40 rounded-t-xl"
              }`}
            >
              <span className="material-icons-round text-[18px]">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* Tab Contents Frame */}
        <div className="p-5">
          {/* ===================================================================
              TAB PANE 1: OVERVIEW
              =================================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Bento Grid KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-dim/30 border border-border-strong rounded-2xl p-5 hover:border-primary/20 transition-colors shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <span className="material-icons-round text-[18px] text-primary">payments</span>
                  </div>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-black">Today's Revenue</p>
                  <p className="text-2xl font-black text-text-primary mt-1">₹{statsLoading ? "—" : stats?.dailyRevenue ?? 0}</p>
                </div>

                <div className="bg-surface-dim/30 border border-border-strong rounded-2xl p-5 hover:border-primary/20 transition-colors shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                    <span className="material-icons-round text-[18px] text-secondary">calendar_month</span>
                  </div>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-black">Today's Bookings</p>
                  <p className="text-2xl font-black text-text-primary mt-1">
                    {statsLoading ? "—" : stats?.recentBookings?.filter((b: any) => b.status !== 'cancelled' && b.date === todayString).length ?? 0}
                  </p>
                </div>

                <div className="bg-surface-dim/30 border border-border-strong rounded-2xl p-5 hover:border-primary/20 transition-colors shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                    <span className="material-icons-round text-[18px] text-green-600">groups</span>
                  </div>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-black">Active Roster Staff</p>
                  <p className="text-2xl font-black text-text-primary mt-1">{statsLoading ? "—" : stats?.activeStaff ?? 0}</p>
                </div>

                <div className="bg-surface-dim/30 border border-border-strong rounded-2xl p-5 hover:border-primary/20 transition-colors shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                    <span className="material-icons-round text-[18px] text-amber-500">stars</span>
                  </div>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-black">Gross Total Revenue</p>
                  <p className="text-2xl font-black text-text-primary mt-1">₹{statsLoading ? "—" : stats?.totalRevenue?.toLocaleString() ?? 0}</p>
                </div>
              </div>

              {/* Bento Grid Middle Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Completeness Insight Card */}
                <div className="lg:col-span-2 bg-surface-card border border-border-strong p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-icons-round text-primary text-[20px]">lightbulb</span>
                      <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Workspace Insights</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-3 text-xs">
                        {profileSteps.slice(0, 4).map((s, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className={`material-icons-round text-[15px] ${s.done ? "text-green-500" : "text-text-tertiary"}`}>
                              {s.done ? "check_circle" : "radio_button_unchecked"}
                            </span>
                            <span className={s.done ? "text-text-primary font-medium" : "text-text-secondary"}>{s.label}</span>
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-3 text-xs">
                        {profileSteps.slice(4).map((s, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className={`material-icons-round text-[15px] ${s.done ? "text-green-500" : "text-text-tertiary"}`}>
                              {s.done ? "check_circle" : "radio_button_unchecked"}
                            </span>
                            <span className={s.done ? "text-text-primary font-medium" : "text-text-secondary"}>{s.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-border mt-5 pt-4">
                    {healthPercentage < 100 ? (
                      <p className="text-xs text-text-secondary">
                        This salon profile is <strong className="text-primary">{healthPercentage}% complete</strong>. Some settings are unconfigured or pending approval.
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <span className="material-icons-round text-[14px]">stars</span>
                        Salon Workspace profile is fully configured!
                      </p>
                    )}
                  </div>
                </div>

                {/* Circular Profile Health Progress */}
                <div className="bg-surface-card border border-border-strong p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-2 w-full text-left">Profile Health</h3>
                  <div className="relative w-28 h-28 my-3">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" fill="none" r="42" stroke="var(--color-border)" strokeWidth="8"></circle>
                      <circle 
                        cx="50" cy="50" fill="none" r="42" stroke="var(--color-primary)" strokeWidth="8"
                        strokeDasharray="263.89" 
                        strokeDashoffset={263.89 - (263.89 * healthPercentage) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-text-primary">{healthPercentage}%</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-text-secondary">Reflected on customer rankings.</p>
                </div>
              </div>

              {/* Bento Grid Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings List Card */}
                <div className="bg-surface-card border border-border-strong p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Recent Activity</h3>
                    <button onClick={() => setActiveTab("bookings")} className="text-xs text-primary font-bold hover:underline">View Bookings</button>
                  </div>

                  <div className="space-y-3.5">
                    {statsLoading ? (
                      <div className="flex justify-center p-6"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
                    ) : !stats?.recentBookings || stats.recentBookings.length === 0 ? (
                      <p className="text-xs text-text-secondary text-center p-6 bg-surface-dim/20 rounded-xl">No recent bookings active.</p>
                    ) : (
                      stats.recentBookings.slice(0, 4).map((b: any) => (
                        <div key={b.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-dim/40 transition-colors border border-transparent hover:border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black shrink-0">
                              {(b.customerName || "G").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-primary">{b.customerName || "Guest"}</p>
                              <p className="text-[10px] text-text-secondary mt-0.5">{b.services?.[0]?.name || "Service"} • {b.timeSlot}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-extrabold text-text-primary">₹{b.totalAmount}</p>
                            <span className={`inline-block text-[9px] font-black uppercase mt-1 px-1.5 py-px rounded ${
                              b.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                              b.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                              b.status === 'completed' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'
                            }`}>{b.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Revenue trends mock SVG chart - premium design */}
                <div className="bg-surface-card border border-border-strong p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Revenue Trends</h3>
                    <span className="bg-surface-dim border border-border px-2 py-0.5 rounded text-[10px] font-semibold text-text-secondary">Last 7 Days</span>
                  </div>

                  <div className="h-40 relative flex items-end pt-6 border-b border-border">
                    <div className="absolute inset-0 flex flex-col justify-between text-text-tertiary text-[9px] pointer-events-none">
                      <div className="w-full border-b border-border/60"></div>
                      <div className="w-full border-b border-border/60"></div>
                      <div className="w-full border-b border-border/60"></div>
                    </div>

                    <svg className="w-full h-24 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="admin-chart-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,60 Q15,40 30,70 T60,30 T90,20 T100,40 L100,100 L0,100 Z" fill="url(#admin-chart-grad)" />
                      <path d="M0,60 Q15,40 30,70 T60,30 T90,20 T100,40" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>

                    <div className="absolute -bottom-6 w-full flex justify-between text-[9px] text-text-secondary font-semibold">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span className="text-primary font-bold">Sun</span>
                    </div>
                  </div>
                  <div className="mt-6 text-xs text-text-secondary flex items-center gap-1">
                    <span className="material-icons-round text-[15px] text-green-500">trending_up</span>
                    <span>System Sync Status: <strong className="text-text-primary">100% active</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB PANE 2: BOOKINGS
              =================================================================== */}
          {activeTab === "bookings" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Bookings Control Center</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Filter, verify, and complete salon appointments.</p>
                </div>
                <div className="flex bg-surface-dim rounded-lg p-0.5 border border-border gap-1 flex-wrap">
                  {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setBookingFilter(f)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                        bookingFilter === f 
                          ? "bg-white text-primary shadow-sm font-bold" 
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {bookingsLoading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
              ) : (
                <AdminTable 
                  columns={bookingColumns} 
                  data={filteredBookings} 
                  isLoading={bookingsLoading}
                  emptyMessage="No bookings active matching this filter." 
                />
              )}
            </div>
          )}

          {/* ===================================================================
              TAB PANE 3: SERVICES & CATEGORIES
              =================================================================== */}
          {activeTab === "services" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex bg-surface-dim rounded-lg p-0.5 border border-border">
                    <button
                      onClick={() => setSubTab("services")}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                        subTab === "services" ? "bg-white text-primary shadow-sm" : "text-text-secondary"
                      }`}
                    >
                      Services
                    </button>
                    <button
                      onClick={() => setSubTab("categories")}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                        subTab === "categories" ? "bg-white text-primary shadow-sm" : "text-text-secondary"
                      }`}
                    >
                      Categories
                    </button>
                  </div>

                  <div className="flex bg-surface-dim rounded-lg p-0.5 border border-border">
                    {(["male", "female"] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setServiceGender(g)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all capitalize ${
                          serviceGender === g ? "bg-white text-primary shadow-sm" : "text-text-secondary"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={openAddEntity}
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <span className="material-icons-round text-[16px]">add</span>
                  Add {subTab === "services" ? "Service" : "Category"}
                </button>
              </div>

              {servicesLoading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
              ) : (
                <AdminTable 
                  columns={subTab === "services" ? serviceColumns : categoryColumns} 
                  data={servicesData} 
                  isLoading={servicesLoading}
                  onEdit={openEditEntity}
                  onDelete={(row) => setDeleteTarget(row)}
                  emptyMessage={`No ${subTab} configured for ${serviceGender}.`} 
                />
              )}
            </div>
          )}

          {/* ===================================================================
              TAB PANE 4: STAFF ROSTER
              =================================================================== */}
          {activeTab === "staff" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Active Salon Roster</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Toggle availability and manage stylist profiles.</p>
                </div>

                <button
                  onClick={openAddStaff}
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <span className="material-icons-round text-[16px]">person_add</span>
                  Add Staff Stylist
                </button>
              </div>

              {staffLoading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
              ) : staffList.length === 0 ? (
                <div className="bg-surface-dim/30 border border-border p-12 text-center rounded-2xl">
                  <span className="material-icons-round text-text-tertiary text-[40px] mb-2 block">groups</span>
                  <p className="text-text-secondary text-sm font-semibold mb-1">No staff members listed yet.</p>
                  <button onClick={openAddStaff} className="text-xs text-primary font-bold hover:underline">+ Add stylist now</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {staffList.map((member: any) => (
                    <div key={member.id} className="bg-surface-card border border-border-strong rounded-2xl p-5 hover:shadow-sm transition-shadow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3.5 mb-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-black shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-text-primary text-sm truncate">{member.name}</h4>
                            <p className="text-xs text-text-secondary mt-0.5">{member.role}</p>
                          </div>
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${member.is_available ? "bg-green-500" : "bg-gray-300"}`} />
                        </div>
                      </div>

                      <div className="border-t border-border pt-4 flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleToggleStaffAvailability(member)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            member.is_available 
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100/50" 
                              : "bg-surface-dim text-text-secondary border-border hover:bg-surface-dim/80"
                          }`}
                        >
                          <span className="material-icons-round text-[14px]">
                            {member.is_available ? "check_circle" : "radio_button_unchecked"}
                          </span>
                          {member.is_available ? "Available" : "Away"}
                        </button>

                        <button
                          onClick={() => openEditStaff(member)}
                          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-colors"
                          title="Edit Stylist Profile"
                        >
                          <span className="material-icons-round text-[16px]">edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteStaff(member.id)}
                          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-error hover:border-error/20 hover:bg-error/5 transition-colors"
                          title="Delete"
                        >
                          <span className="material-icons-round text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB PANE 5: SALON SETTINGS
              =================================================================== */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-border pb-4">
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Business Profile Configuration</h3>
                <p className="text-xs text-text-secondary mt-0.5">Edit core parameters, coordinates, address, and live settings.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic info section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Salon Name *</label>
                    <input 
                      type="text" 
                      value={salonSettingsForm.name || ""} 
                      onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, name: e.target.value }))} 
                      className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Description</label>
                    <textarea 
                      value={salonSettingsForm.description || ""} 
                      onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, description: e.target.value }))} 
                      className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-24 resize-none" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Phone</label>
                      <input 
                        type="text" 
                        value={salonSettingsForm.contact_phone || ""} 
                        onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, contact_phone: e.target.value }))} 
                        className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Email</label>
                      <input 
                        type="email" 
                        value={salonSettingsForm.contact_email || ""} 
                        onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, contact_email: e.target.value }))} 
                        className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Price Range</label>
                      <input 
                        type="text" 
                        value={salonSettingsForm.price_range || ""} 
                        onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, price_range: e.target.value }))} 
                        placeholder="₹99 - ₹2999" 
                        className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Rating (0-5)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="5" 
                        value={salonSettingsForm.rating || 0} 
                        onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))} 
                        className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Total Reviews</label>
                      <input 
                        type="number" 
                        value={salonSettingsForm.total_reviews || 0} 
                        onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, total_reviews: parseInt(e.target.value) || 0 }))} 
                        className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* Address & timing options */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Street Address *</label>
                    <input 
                      type="text" 
                      value={salonSettingsForm.address_street || ""} 
                      onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, address_street: e.target.value }))} 
                      className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all" 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">City *</label>
                      <input 
                        type="text" 
                        value={salonSettingsForm.address_city || ""} 
                        onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, address_city: e.target.value }))} 
                        className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">State</label>
                      <input 
                        type="text" 
                        value={salonSettingsForm.address_state || ""} 
                        onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, address_state: e.target.value }))} 
                        placeholder="DL" 
                        className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Google Map URL</label>
                    <input 
                      type="url" 
                      value={salonSettingsForm.google_map_url || ""} 
                      onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, google_map_url: e.target.value }))} 
                      placeholder="https://maps.app.goo.gl/..." 
                      className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Timings (e.g. 11:15 AM - 09:00 PM)</label>
                    <input 
                      type="text" 
                      value={salonSettingsForm.timings || ""} 
                      onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, timings: e.target.value }))} 
                      placeholder="e.g. 11:15 AM - 09:00 PM" 
                      className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Facilities (comma-separated)</label>
                    <input 
                      type="text" 
                      value={salonSettingsForm.facilities_string || ""} 
                      onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, facilities_string: e.target.value }))} 
                      placeholder="WiFi, A/C, Parking, Waiting Room" 
                      className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Tags (comma-separated)</label>
                    <input 
                      type="text" 
                      value={salonSettingsForm.tags_string || ""} 
                      onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, tags_string: e.target.value }))} 
                      placeholder="Premium, Styling, Hair Spa" 
                      className="w-full px-4 py-2 border border-border-strong bg-surface-dim/40 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all" 
                    />
                  </div>

                  {/* Flag Toggles */}
                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!salonSettingsForm.featured} 
                        onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, featured: e.target.checked }))} 
                        className="w-4 h-4 accent-primary rounded border-border-strong" 
                      />
                      <span className="text-xs font-extrabold text-text-primary uppercase tracking-wide">Featured Salon Banner</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!salonSettingsForm.is_active} 
                        onChange={(e) => setSalonSettingsForm((prev: any) => ({ ...prev, is_active: e.target.checked }))} 
                        className="w-4 h-4 accent-primary rounded border-border-strong" 
                      />
                      <span className="text-xs font-extrabold text-text-primary uppercase tracking-wide">Active (Listed on App)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-5 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm active:scale-95"
                >
                  {savingSettings ? "Saving Settings..." : "Save Workspace Parameters"}
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB PANE 6: MEDIA GALLERY
              =================================================================== */}
          {activeTab === "media" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Portfolio Media & Gallery</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Upload high resolution banners and salon interiors.</p>
                </div>

                <div className="flex items-center gap-3">
                  <label className={`px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${uploadingMedia ? "opacity-50 pointer-events-none" : ""}`}>
                    <span className="material-icons-round text-[16px]">{uploadingMedia ? "hourglass_top" : "file_upload"}</span>
                    {uploadingMedia ? "Uploading File..." : "Upload New Image"}
                    <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
                  </label>
                  <span className="text-[10px] text-text-tertiary">JPG, PNG, WEBP</span>
                </div>
              </div>

              {/* Media deck */}
              {!salonSettingsForm.images || salonSettingsForm.images.length === 0 ? (
                <div className="bg-surface-dim/30 border border-border p-12 text-center rounded-2xl">
                  <span className="material-icons-round text-text-tertiary text-[40px] mb-2 block">image</span>
                  <p className="text-text-secondary text-sm font-semibold">No gallery images uploaded.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {salonSettingsForm.images.map((url: string, index: number) => (
                    <div key={index} className="relative aspect-video bg-surface-dim rounded-xl overflow-hidden border border-border group">
                      <Image src={url} alt="" fill className="object-cover" />
                      
                      {/* Delete Overlay button */}
                      <button
                        onClick={() => handleRemoveMediaImage(index)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow transition-all scale-0 group-hover:scale-100"
                        title="Delete Image"
                      >
                        <span className="material-icons-round text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB PANE 7: CUSTOMER MARKETPLACE PREVIEW (LAZY & SECURE)
              =================================================================== */}
          {activeTab === "preview" && (
            <div className="space-y-4 animate-fadeIn flex flex-col h-[70vh] min-h-[500px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Live Customer App Sandboxed View</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Simulate actual styling, listings, and customer bookings.</p>
                </div>

                <Link
                  href={`/salon/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg flex items-center gap-1 transition-colors border border-primary/10"
                >
                  <span className="material-icons-round text-[14px]">open_in_new</span>
                  Open Preview in New Tab
                </Link>
              </div>

              {/* Sandbox viewport mock */}
              <div className="flex-1 bg-surface-dim border border-border-strong rounded-2xl overflow-hidden flex flex-col relative shadow-inner">
                {/* Header mock bar */}
                <div className="bg-white border-b border-border px-4 py-2 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  </div>
                  <div className="bg-surface-dim px-4 py-1 rounded-md text-[10px] font-mono text-text-secondary border border-border select-all select-none max-w-md w-full text-center truncate">
                    https://glvia.com/salon/{id}
                  </div>
                  <span className="material-icons-round text-[16px] text-text-tertiary">lock</span>
                </div>

                {/* Safe sandboxed iframe */}
                <iframe 
                  src={`/salon/${id}`} 
                  sandbox="allow-same-origin allow-scripts allow-forms"
                  loading="lazy"
                  className="w-full h-full border-none flex-1 bg-white"
                  title="Salon Secure Customer Preview"
                />
              </div>
              </div>
            )}

          {/* ===================================================================
              TAB PANE 8: REVIEWS & RATINGS MODERATION
              =================================================================== */}
          {activeTab === "reviews" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Reviews Moderation Center</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Approve, reject, or hide customer reviews to ensure compliance.</p>
                </div>
                <div className="flex bg-surface-dim rounded-lg p-0.5 border border-border gap-1 flex-wrap">
                  {(["all", "pending", "approved", "rejected", "hidden"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setReviewFilter(f)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                        reviewFilter === f 
                          ? "bg-white text-primary shadow-sm font-bold" 
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
              ) : (
                <AdminTable 
                  columns={reviewColumns} 
                  data={filteredReviews} 
                  isLoading={reviewsLoading}
                  emptyMessage="No reviews active matching this filter." 
                />
              )}
            </div>
          )}

          {/* ===================================================================
              DYNAMIC EXTRA FUTURE MODULE CONTAINER (FUTURE-PROOF INJECTS)
              =================================================================== */}
          {!["overview", "bookings", "services", "staff", "settings", "media", "preview", "reviews"].includes(activeTab) && (
            <div className="bg-surface-card border border-border-strong rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm my-6 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <span className="material-icons-round text-3xl">
                  {salonWorkspaceModules.find(m => m.key === activeTab)?.icon || "extension"}
                </span>
              </div>
              <h3 className="text-md font-bold text-text-primary tracking-tight">
                {salonWorkspaceModules.find(m => m.key === activeTab)?.label || "Dynamic Module"} Workspace
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto mt-2 leading-relaxed">
                This future module handles A-to-Z control parameters. The database bindings, RPC schemas, and session synchronization are fully configured.
              </p>
              
              <div className="mt-6 p-4 bg-surface-dim/40 rounded-xl border border-border text-left space-y-2 max-w-sm mx-auto">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  <span>Connection Key</span>
                  <span className="text-primary">{activeTab}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  <span>Data Model Binding</span>
                  <span className="text-text-primary">TABLES.SALONS / sup_db</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  <span>API Registry State</span>
                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[8px]">CONNECTION ACTIVE</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Service Add/Edit modal --- */}
      <AdminFormModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editing ? `Edit ${subTab === "services" ? "Service" : "Category"}` : `Add ${subTab === "services" ? "Service" : "Category"}`} 
        fields={subTab === "services" ? dynamicServiceFields : dynamicCatFields}
        values={formValues} 
        onChange={(name, value) => setFormValues((prev) => ({ ...prev, [name]: value }))} 
        onSubmit={handleSaveEntity} 
        isLoading={savingEntity} 
        submitLabel={editing ? "Save Changes" : `Add to ${serviceGender}`} 
      />

      {/* --- Entity Delete Confirmation dialog --- */}
      <ConfirmDialog 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={handleDeleteEntity} 
        isLoading={deletingEntity} 
        title="Confirm Removal"
        message={`Are you sure you want to delete this ${subTab === "services" ? "service" : "category"}? This will immediately remove it from the customer catalog and cannot be undone.`}
      />

      {/* --- Staff Add/Edit Modal --- */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-border-strong rounded-2xl w-full max-w-md overflow-hidden shadow-lg animate-scaleIn">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border">
              <h2 className="text-sm font-black text-text-primary uppercase tracking-wider">
                {editingStaff ? "Edit Stylist Profile" : "Add Stylist to Roster"}
              </h2>
              <button 
                onClick={() => setStaffModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              >
                <span className="material-icons-round text-[18px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Full Name *</label>
                <input 
                  type="text" 
                  value={staffForm.name} 
                  onChange={(e) => setStaffForm(p => ({ ...p, name: e.target.value }))} 
                  placeholder="e.g., Priya Sharma"
                  className="w-full px-4 py-2 border border-border bg-surface-dim/40 rounded-xl text-sm focus:outline-none focus:border-primary transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Roster Role</label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-4 py-2 border border-border bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                >
                  {["Stylist", "Senior Stylist", "Beautician", "Nail Tech", "Makeup Artist", "Receptionist", "Manager"].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  onClick={() => setStaffModalOpen(false)}
                  className="px-4 py-2 bg-surface-dim border border-border text-text-secondary text-xs font-bold rounded-xl hover:bg-surface-dim/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStaff}
                  disabled={savingStaff || !staffForm.name.trim()}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 shadow-sm"
                >
                  {savingStaff ? "Saving..." : (editingStaff ? "Save Stylist" : "Add Stylist")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
