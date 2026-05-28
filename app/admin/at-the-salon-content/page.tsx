"use client";

import { useState, useEffect } from "react";
import { supabase, TABLES } from "../../lib/supabase";
import AdminTable from "../../components/admin/AdminTable";
import AdminFormModal from "../../components/admin/AdminFormModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import Image from "next/image";

// Form Modal configuration
const fields = [
  { name: "title", label: "Banner Title", type: "text" as const, required: true, placeholder: "e.g., GO GO!" },
  { name: "subtitle", label: "Subtitle", type: "text" as const, required: true, placeholder: "e.g., GIVE ONE AND GET ONE" },
  { name: "cta", label: "CTA Button / Badge Text", type: "text" as const, required: true, placeholder: "e.g., FREE HAIRCUT" },
  { name: "image", label: "Banner Image URL", type: "url" as const, required: true },
  { 
    name: "target_gender", 
    label: "Target Gender", 
    type: "select" as const, 
    required: true, 
    options: [
      { value: "all", label: "All Unisex" },
      { value: "male", label: "Male Only" },
      { value: "female", label: "Female Only" }
    ] 
  },
  { 
    name: "active_status", 
    label: "Active Status", 
    type: "select" as const, 
    required: true, 
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" }
    ] 
  },
  { name: "expiry", label: "Expiry Date (YYYY-MM-DD)", type: "text" as const, required: true, placeholder: "e.g., 2026-12-31" },
];

const columns = [
  { 
    key: "image", 
    label: "Image", 
    width: "80px", 
    render: (v: string) => v ? (
      <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
        <Image src={v} alt="" fill className="object-cover" />
      </div>
    ) : (
      <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
        <span className="material-icons-round text-sm">image</span>
      </div>
    )
  },
  { 
    key: "title", 
    label: "Details", 
    render: (v: string, row: any) => (
      <div>
        <div className="font-bold text-gray-900 text-sm">{v}</div>
        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{row.subtitle}</div>
      </div>
    )
  },
  { 
    key: "cta", 
    label: "CTA Badge", 
    render: (v: string) => <span className="bg-pink-50 text-pink-700 font-extrabold text-[10px] px-2 py-0.5 rounded border border-pink-200 uppercase tracking-wider">{v}</span> 
  },
  { 
    key: "target_gender", 
    label: "Gender", 
    width: "120px",
    render: (v: string) => <span className="capitalize text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">{v === "all" ? "All Unisex" : v}</span> 
  },
  { 
    key: "active_status", 
    label: "Status", 
    width: "100px",
    render: (v: string) => (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
        v === "active" 
          ? "bg-green-50 text-green-700 border-green-200" 
          : "bg-red-50 text-red-700 border-red-200"
      }`}>
        {v}
      </span>
    )
  },
  { 
    key: "expiry", 
    label: "Expiry", 
    width: "120px",
    render: (v: string) => <span className="font-mono text-xs text-gray-500">{v}</span> 
  },
];

export default function AtTheSalonContentPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: row, error } = await supabase
        .from(TABLES.SITE_SETTINGS)
        .select("value")
        .eq("key", "at_the_salon_banners")
        .single();

      if (row?.value) {
        const parsed = JSON.parse(row.value);
        setData(Array.isArray(parsed) ? parsed : []);
      } else {
        // No banners configured yet, use fallback or leave empty
        setData([]);
      }
    } catch (err) {
      console.error("Error loading at the salon banners:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ 
      title: "", 
      subtitle: "", 
      cta: "", 
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80", 
      target_gender: "all", 
      active_status: "active", 
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // default 30 days
    });
    setModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.subtitle || !form.cta || !form.image || !form.target_gender || !form.active_status || !form.expiry) {
      showToast("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      let updatedData = [];
      const itemToSave = { ...form };
      
      if (editing) {
        // Update existing banner by ID
        updatedData = data.map((item) => (item.id === editing.id ? { ...itemToSave } : item));
      } else {
        // Create new banner with a random ID
        const newBanner = {
          ...itemToSave,
          id: "banner_" + Math.random().toString(36).substr(2, 9),
        };
        updatedData = [...data, newBanner];
      }

      // Upsert into Supabase site_settings
      const jsonValue = JSON.stringify(updatedData);
      
      // Try to select first to see if key exists
      const { data: existingRow } = await supabase
        .from(TABLES.SITE_SETTINGS)
        .select("id")
        .eq("key", "at_the_salon_banners")
        .single();

      if (existingRow?.id) {
        const { error } = await supabase
          .from(TABLES.SITE_SETTINGS)
          .update({ value: jsonValue })
          .eq("id", existingRow.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(TABLES.SITE_SETTINGS)
          .insert({ key: "at_the_salon_banners", value: jsonValue });
        if (error) throw error;
      }

      showToast(editing ? "Banner updated!" : "New banner added!");
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const updatedData = data.filter((item) => item.id !== deleteTarget.id);
      const jsonValue = JSON.stringify(updatedData);

      const { data: existingRow } = await supabase
        .from(TABLES.SITE_SETTINGS)
        .select("id")
        .eq("key", "at_the_salon_banners")
        .single();

      if (existingRow?.id) {
        const { error } = await supabase
          .from(TABLES.SITE_SETTINGS)
          .update({ value: jsonValue })
          .eq("id", existingRow.id);
        if (error) throw error;
      }

      showToast("Banner deleted successfully.");
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      showToast("Error deleting banner: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg animate-fadeInUp border border-white/10 flex items-center gap-2">
          <span className="material-icons-round text-green-400 text-sm">check_circle</span>
          {toast}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">At The Salon Content</h1>
          <p className="text-sm text-text-secondary mt-1">Manage luxury promotional banners for the salon catalog page</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
          <span className="material-icons-round text-[16px]">add</span>Add Banner
        </button>
      </div>

      <AdminTable 
        columns={columns} 
        data={data} 
        isLoading={loading} 
        onEdit={openEdit} 
        onDelete={(row) => setDeleteTarget(row)} 
        emptyMessage="No promotional banners configured yet." 
      />

      <AdminFormModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editing ? "Edit Salon Banner" : "Add Salon Banner"} 
        fields={fields} 
        values={form}
        onChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))} 
        onSubmit={handleSave} 
        isLoading={saving} 
        submitLabel={editing ? "Save Changes" : "Create Banner"} 
      />

      <ConfirmDialog 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={handleDelete} 
        isLoading={deleting} 
        title="Confirm Removal"
        message="Are you sure you want to delete this promotional banner? This change takes effect immediately on the consumer app catalog page."
      />
    </div>
  );
}
