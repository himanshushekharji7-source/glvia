"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, TABLES } from "../../lib/supabase";
import AdminTable from "../../components/admin/AdminTable";
import AdminFormModal from "../../components/admin/AdminFormModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

const fields = [
  { name: "name", label: "Salon Name", type: "text" as const, required: true },
  { name: "description", label: "Description", type: "textarea" as const },
  { name: "images_string", label: "Image URLs (comma separated)", type: "textarea" as const, placeholder: "/uploads/media/salon1.jpg, /uploads/media/salon2.jpg" },
  { name: "address_street", label: "Street Address", type: "text" as const, required: true },
  { name: "address_city", label: "City", type: "text" as const, required: true },
  { name: "address_state", label: "State", type: "text" as const, placeholder: "e.g. DL" },
  { name: "contact_phone", label: "Phone", type: "text" as const },
  { name: "contact_email", label: "Email", type: "text" as const },
  { name: "price_range", label: "Price Range", type: "text" as const, placeholder: "e.g. ₹99 - ₹2999" },
  { name: "distance", label: "Distance", type: "text" as const, placeholder: "e.g. 6.94 km" },
  { name: "rating", label: "Rating", type: "number" as const, placeholder: "0-5" },
  { name: "total_reviews", label: "Total Reviews", type: "number" as const },
];

export default function SalonsPage() {
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
    const { data: rows } = await supabase.from(TABLES.SALONS).select("*").order("created_at", { ascending: false });
    setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ rating: 0, total_reviews: 0, featured: false, is_active: true });
    setModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({ ...row, images_string: row.images?.join(', ') || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.address_street || !form.address_city) {
      showToast("Name, street and city are required");
      return;
    }
    setSaving(true);
    const saveData: any = { ...form };
    
    if (saveData.images_string !== undefined) {
      saveData.images = saveData.images_string.split(',').map((u: string) => u.trim()).filter(Boolean);
      delete saveData.images_string;
    }
    
    delete saveData.id;
    delete saveData.created_at;

    if (editing) {
      const { error } = await supabase.from(TABLES.SALONS).update(saveData).eq("id", editing.id);
      if (error) showToast("Error: " + error.message);
      else showToast("Salon updated!");
    } else {
      const { error } = await supabase.from(TABLES.SALONS).insert(saveData);
      if (error) showToast("Error: " + error.message);
      else showToast("Salon added!");
    }
    setSaving(false);
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from(TABLES.SALONS).delete().eq("id", deleteTarget.id);
    if (error) showToast("Error: " + error.message);
    else showToast("Salon deleted!");
    setDeleting(false);
    setDeleteTarget(null);
    fetchData();
  };

  const columns = [
    { key: "name", label: "Name", render: (v: string, row: any) => (
      <Link href={`/admin/salons/${row.id}`} className="text-pink-600 font-semibold hover:underline">{v}</Link>
    )},
    { key: "address_city", label: "City" },
    { key: "rating", label: "Rating", width: "80px", render: (v: number) => (
      <span className="flex items-center gap-1 text-amber-500">
        <span className="material-icons-round text-[14px]">star</span>{v || 0}
      </span>
    )},
    { key: "distance", label: "Distance", width: "100px" },
    { key: "is_active", label: "Status", width: "80px", render: (v: boolean) => (
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${v ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
        {v ? "Active" : "Inactive"}
      </span>
    )},
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-fadeInUp">{toast}</div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Salons</h1>
          <p className="text-sm text-text-secondary mt-1">Manage all salon listings. Click a salon name to edit its services.</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
          <span className="material-icons-round text-[16px]">add</span>
          Add Salon
        </button>
      </div>

      <AdminTable columns={columns} data={data} isLoading={loading} onEdit={openEdit} onDelete={(row) => setDeleteTarget(row)} emptyMessage="No salons yet." />

      <AdminFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Salon" : "Add Salon"} fields={fields} values={form}
        onChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))} onSubmit={handleSave} isLoading={saving} submitLabel={editing ? "Update" : "Add"}>
        {/* Extra toggle for featured/active */}
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured || false} onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))} className="w-4 h-4 accent-pink-500" />
            <span className="text-sm text-gray-700 font-medium">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active !== false} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))} className="w-4 h-4 accent-green-500" />
            <span className="text-sm text-gray-700 font-medium">Active</span>
          </label>
        </div>
      </AdminFormModal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Salon"
        message={`Delete "${deleteTarget?.name}" and all its services? This cannot be undone.`} isLoading={deleting} />
    </div>
  );
}
