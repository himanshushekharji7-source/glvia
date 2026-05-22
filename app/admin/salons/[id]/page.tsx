"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import axios from "axios";
import { supabase, TABLES } from "../../../lib/supabase";
import AdminTable from "../../../components/admin/AdminTable";
import AdminFormModal from "../../../components/admin/AdminFormModal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";

type TabType = "services" | "categories" | "settings";

const serviceFields = [
  { name: "name", label: "Service Name", type: "text" as const, required: true },
  { name: "description", label: "Description", type: "textarea" as const },
  { name: "products_used", label: "Products Used (comma-separated)", type: "text" as const, placeholder: "e.g. Shampoo, Hair spa cream" },
  { name: "duration", label: "Duration (min)", type: "text" as const, placeholder: "e.g. 30" },
  { name: "price", label: "Price (₹)", type: "number" as const, required: true },
  { name: "old_price", label: "Old Price (₹)", type: "number" as const },
  { name: "category", label: "Category Name", type: "text" as const, placeholder: "e.g. Hair Cut & Style" },
  { name: "image", label: "Image URL", type: "url" as const, required: true },
  { name: "gender", label: "Gender", type: "select" as const, required: true, options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }] },
  { name: "sort_order", label: "Sort Order", type: "number" as const, placeholder: "0" },
];

const catFields = [
  { name: "name", label: "Category Name", type: "text" as const, required: true },
  { name: "image", label: "Image URL", type: "url" as const, required: true },
  { name: "gender", label: "Gender", type: "select" as const, required: true, options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }] },
  { name: "sort_order", label: "Sort Order", type: "number" as const, placeholder: "0" },
];

export default function SalonEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [salon, setSalon] = useState<any>(null);
  const [tab, setTab] = useState<TabType>("services");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");
  
  // Salon settings states
  const [salonForm, setSalonForm] = useState<any>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchSalon = async () => {
    const { data: s } = await supabase.from(TABLES.SALONS).select("*").eq("id", id).single();
    setSalon(s);
  };

  useEffect(() => {
    fetchSalon();
  }, [id]);

  useEffect(() => {
    if (salon) {
      setSalonForm({
        ...salon,
        facilities_string: salon.facilities?.join(', ') || '',
        tags_string: salon.tags?.join(', ') || '',
        featured: !!salon.featured,
        is_active: !!salon.is_active,
        google_map_url: salon.google_map_url || ''
      });
    }
  }, [salon]);

  const fetchData = async () => {
    if (tab === "settings") return;
    setLoading(true);
    const table = tab === "services" ? TABLES.SALON_SERVICES : TABLES.SALON_CATEGORIES;
    const { data: rows } = await supabase.from(table).select("*").eq("salon_id", id).eq("gender", gender).order("sort_order", { ascending: true });
    setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [tab, gender, id]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openAdd = () => {
    setEditing(null);
    setForm({ salon_id: id, gender, sort_order: 0 });
    setModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const table = tab === "services" ? TABLES.SALON_SERVICES : TABLES.SALON_CATEGORIES;
    const saveData: any = { ...form, salon_id: id };
    delete saveData.id;
    delete saveData.created_at;

    if (editing) {
      const { error } = await supabase.from(table).update(saveData).eq("id", editing.id);
      if (error) showToast("Error: " + error.message);
      else showToast("Updated!");
    } else {
      const { error } = await supabase.from(table).insert(saveData);
      if (error) showToast("Error: " + error.message);
      else showToast("Added!");
    }
    setSaving(false);
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const table = tab === "services" ? TABLES.SALON_SERVICES : TABLES.SALON_CATEGORIES;
    const { error } = await supabase.from(table).delete().eq("id", deleteTarget.id);
    if (error) showToast("Error: " + error.message);
    else showToast("Deleted!");
    setDeleting(false);
    setDeleteTarget(null);
    fetchData();
  };

  const handleRemoveGalleryImage = (index: number) => {
    const updatedImages = [...(salonForm.images || [])];
    updatedImages.splice(index, 1);
    setSalonForm((prev: any) => ({ ...prev, images: updatedImages }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append("file", file);
    
    setUploadingImage(true);
    try {
      const res = await axios.post("/api/media", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        const fileUrl = res.data.file.url;
        setSalonForm((prev: any) => ({
          ...prev,
          images: [...(prev.images || []), fileUrl]
        }));
        showToast("Image uploaded successfully!");
      } else {
        showToast("Upload failed: " + res.data.error);
      }
    } catch (error: any) {
      showToast("Upload failed: " + error.message);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSaveSettings = async () => {
    if (!salonForm.name || !salonForm.address_street || !salonForm.address_city) {
      showToast("Name, street and city are required");
      return;
    }
    setSaving(true);
    
    const facilitiesArray = salonForm.facilities_string
      ? salonForm.facilities_string.split(',').map((u: string) => u.trim()).filter(Boolean)
      : [];

    const tagsArray = salonForm.tags_string
      ? salonForm.tags_string.split(',').map((u: string) => u.trim()).filter(Boolean)
      : [];

    const updateData = {
      name: salonForm.name,
      description: salonForm.description || null,
      price_range: salonForm.price_range || null,
      contact_phone: salonForm.contact_phone || null,
      contact_email: salonForm.contact_email || null,
      address_street: salonForm.address_street,
      address_city: salonForm.address_city,
      address_state: salonForm.address_state || null,
      distance: salonForm.distance || null,
      rating: parseFloat(salonForm.rating) || 0,
      total_reviews: parseInt(salonForm.total_reviews) || 0,
      facilities: facilitiesArray,
      timings: salonForm.timings || null,
      images: salonForm.images || [],
      tags: tagsArray,
      featured: !!salonForm.featured,
      is_active: !!salonForm.is_active,
      google_map_url: salonForm.google_map_url || null
    };

    const { error } = await supabase.from(TABLES.SALONS).update(updateData).eq("id", id);
    setSaving(false);
    
    if (error) {
      showToast("Error updating salon: " + error.message);
    } else {
      showToast("Salon settings updated!");
      fetchSalon();
    }
  };

  const serviceColumns = [
    { key: "image", label: "Image", width: "60px", render: (v: string) => v ? <img src={v} alt="" className="w-10 h-10 rounded-lg object-cover" /> : "—" },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "price", label: "Price", render: (v: number) => `₹${v}` },
    { key: "old_price", label: "Old Price", render: (v: number) => v ? `₹${v}` : "—" },
    { key: "duration", label: "Duration", render: (v: string) => v ? `${v} min` : "—" },
  ];

  const catColumns = [
    { key: "image", label: "Image", width: "60px", render: (v: string) => v ? <img src={v} alt="" className="w-10 h-10 rounded-lg object-cover" /> : "—" },
    { key: "name", label: "Name" },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-fadeInUp">{toast}</div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/salons" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <span className="material-icons-round text-[18px] text-gray-600">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">{salon?.name || "Salon"}</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage services, categories & details for this salon</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["services", "categories", "settings"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab === t ? "bg-pink-50 text-pink-600 border border-pink-200" : "bg-white text-gray-500 border border-gray-100"}`}>
              {t}
            </button>
          ))}
        </div>
        {tab !== "settings" && (
          <button onClick={openAdd} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
            <span className="material-icons-round text-[16px]">add</span>Add {tab === "services" ? "Service" : "Category"}
          </button>
        )}
      </div>

      {tab === "settings" ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-text-primary">Edit Salon Info</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Salon Name *</label>
              <input type="text" value={salonForm.name || ""} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" required />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price Range</label>
              <input type="text" value={salonForm.price_range || ""} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, price_range: e.target.value }))} placeholder="e.g. ₹99 - ₹2999" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea value={salonForm.description || ""} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 h-24" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input type="text" value={salonForm.contact_phone || ""} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, contact_phone: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" value={salonForm.contact_email || ""} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, contact_email: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address *</label>
              <input type="text" value={salonForm.address_street || ""} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, address_street: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
              <input type="text" value={salonForm.address_city || ""} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, address_city: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
              <input type="text" value={salonForm.address_state || ""} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, address_state: e.target.value }))} placeholder="e.g. DL" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Google Map URL</label>
              <input type="url" value={salonForm.google_map_url || ""} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, google_map_url: e.target.value }))} placeholder="e.g. https://maps.app.goo.gl/..." className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Distance</label>
              <input type="text" value={salonForm.distance || ""} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, distance: e.target.value }))} placeholder="e.g. 6.94 km" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
              <input type="number" step="0.1" min="0" max="5" value={salonForm.rating || 0} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Total Reviews</label>
              <input type="number" value={salonForm.total_reviews || 0} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, total_reviews: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Facilities (comma separated)</label>
              <input type="text" value={salonForm.facilities_string || ""} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, facilities_string: e.target.value }))} placeholder="e.g. Waiting Chair, Washed Towel, WiFi" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Weekly Timings (e.g. 11:15 AM - 09:00 PM)</label>
              <input type="text" value={salonForm.timings || ""} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, timings: e.target.value }))} placeholder="e.g. 11:15 AM - 09:00 PM" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (comma separated)</label>
              <input type="text" value={salonForm.tags_string || ""} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, tags_string: e.target.value }))} placeholder="e.g. Premium, Trending, Bridal" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" />
            </div>

            <div className="flex gap-6 md:col-span-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!salonForm.featured} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, featured: e.target.checked }))} className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
                <span className="text-sm font-semibold text-gray-700">Featured Salon</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!salonForm.is_active} onChange={(e) => setSalonForm((prev: any) => ({ ...prev, is_active: e.target.checked }))} className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
                <span className="text-sm font-semibold text-gray-700">Active (Visible on App)</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-md font-bold text-text-primary mb-3">Portfolio / Gallery Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {salonForm.images?.map((url: string, index: number) => (
                <div key={index} className="relative group aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleRemoveGalleryImage(index)} className="absolute top-2 right-2 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform">
                    <span className="material-icons-round text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className={`btn-primary px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2 ${uploadingImage ? "opacity-50 pointer-events-none" : ""}`}>
                <span className="material-icons-round text-[16px]">{uploadingImage ? "hourglass_top" : "file_upload"}</span>
                {uploadingImage ? "Uploading..." : "Upload Image to Gallery"}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <span className="text-xs text-text-secondary">Supported: JPG, PNG, WEBP</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={handleSaveSettings} disabled={saving} className="btn-primary px-6 py-2.5">
              {saving ? "Saving..." : "Save Salon Settings"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Gender:</span>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(["male", "female"] as const).map((g) => (
                <button key={g} onClick={() => setGender(g)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${gender === g ? "bg-white text-pink-600 shadow-sm" : "text-gray-500"}`}>{g}</button>
              ))}
            </div>
          </div>

          <AdminTable columns={tab === "services" ? serviceColumns : catColumns} data={data} isLoading={loading} onEdit={openEdit} onDelete={(row) => setDeleteTarget(row)} />

          <AdminFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit" : "Add"} fields={tab === "services" ? serviceFields : catFields}
            values={form} onChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))} onSubmit={handleSave} isLoading={saving} submitLabel={editing ? "Update" : "Add"} />

          <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} />
        </>
      )}
    </div>
  );
}
