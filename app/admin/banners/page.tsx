"use client";

import { useState, useEffect } from "react";
import { supabase, TABLES } from "../../lib/supabase";
import AdminTable from "../../components/admin/AdminTable";
import AdminFormModal from "../../components/admin/AdminFormModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

const fields = [
  { name: "title", label: "Banner Title", type: "text" as const, required: true },
  { name: "description", label: "Description", type: "textarea" as const, required: true },
  { name: "icon_name", label: "Material Icon Name", type: "text" as const, required: true, placeholder: "e.g. verified_user" },
  { name: "sort_order", label: "Sort Order", type: "number" as const, placeholder: "0" },
];

const columns = [
  { key: "icon_name", label: "Icon", width: "60px", render: (v: string) => <span className="material-icons-round text-blue-500 text-[22px]">{v}</span> },
  { key: "title", label: "Title" },
  { key: "description", label: "Description", render: (v: string) => <span className="text-gray-500 text-xs line-clamp-2">{v}</span> },
];

export default function BannersPage() {
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
    const { data: rows } = await supabase.from(TABLES.TRUST_BANNERS).select("*").order("sort_order", { ascending: true });
    setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const openAdd = () => { setEditing(null); setForm({ sort_order: 0, icon_name: "verified" }); setModalOpen(true); };
  const openEdit = (row: any) => { setEditing(row); setForm({ ...row }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.icon_name) { showToast("Fill required fields"); return; }
    setSaving(true);
    const saveData: any = { ...form }; delete saveData.id; delete saveData.created_at;
    if (editing) {
      const { error } = await supabase.from(TABLES.TRUST_BANNERS).update(saveData).eq("id", editing.id);
      if (error) showToast("Error: " + error.message); else showToast("Updated!");
    } else {
      const { error } = await supabase.from(TABLES.TRUST_BANNERS).insert(saveData);
      if (error) showToast("Error: " + error.message); else showToast("Added!");
    }
    setSaving(false); setModalOpen(false); fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return; setDeleting(true);
    const { error } = await supabase.from(TABLES.TRUST_BANNERS).delete().eq("id", deleteTarget.id);
    if (error) showToast("Error: " + error.message); else showToast("Deleted!");
    setDeleting(false); setDeleteTarget(null); fetchData();
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-fadeInUp">{toast}</div>}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Banners & Trust Badges</h1>
          <p className="text-sm text-text-secondary mt-1">Manage trust banners shown on the homepage</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
          <span className="material-icons-round text-[16px]">add</span>Add Banner
        </button>
      </div>
      <AdminTable columns={columns} data={data} isLoading={loading} onEdit={openEdit} onDelete={(row) => setDeleteTarget(row)} emptyMessage="No banners yet." />
      <AdminFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Banner" : "Add Banner"} fields={fields} values={form}
        onChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))} onSubmit={handleSave} isLoading={saving} submitLabel={editing ? "Update" : "Add"} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} />
    </div>
  );
}
