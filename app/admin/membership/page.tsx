"use client";

import { useState, useEffect } from "react";
import { supabase, TABLES } from "../../lib/supabase";
import AdminTable from "../../components/admin/AdminTable";
import AdminFormModal from "../../components/admin/AdminFormModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

const fields = [
  { name: "name", label: "Plan Name", type: "text" as const, required: true, placeholder: "e.g. GLIVAJI GOLD" },
  { name: "duration", label: "Duration", type: "text" as const, required: true, placeholder: "e.g. (12 Months)" },
  { name: "price", label: "Price (₹)", type: "number" as const, required: true },
  { name: "discount", label: "Discount Text", type: "text" as const, placeholder: "e.g. 15% off" },
  { name: "sort_order", label: "Sort Order", type: "number" as const, placeholder: "0" },
];

const columns = [
  { key: "name", label: "Plan Name" },
  { key: "duration", label: "Duration" },
  { key: "price", label: "Price", render: (v: number) => `₹${v}` },
  { key: "discount", label: "Discount" },
];

export default function MembershipPage() {
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
    const { data: rows } = await supabase.from(TABLES.MEMBERSHIP_PLANS).select("*").order("sort_order", { ascending: true });
    setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openAdd = () => { setEditing(null); setForm({ sort_order: 0 }); setModalOpen(true); };
  const openEdit = (row: any) => { setEditing(row); setForm({ ...row }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.duration || !form.price) { showToast("Fill required fields"); return; }
    setSaving(true);
    const saveData: any = { ...form }; delete saveData.id; delete saveData.created_at;
    if (editing) {
      const { error } = await supabase.from(TABLES.MEMBERSHIP_PLANS).update(saveData).eq("id", editing.id);
      if (error) showToast("Error: " + error.message); else showToast("Updated!");
    } else {
      const { error } = await supabase.from(TABLES.MEMBERSHIP_PLANS).insert(saveData);
      if (error) showToast("Error: " + error.message); else showToast("Added!");
    }
    setSaving(false); setModalOpen(false); fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return; setDeleting(true);
    const { error } = await supabase.from(TABLES.MEMBERSHIP_PLANS).delete().eq("id", deleteTarget.id);
    if (error) showToast("Error: " + error.message); else showToast("Deleted!");
    setDeleting(false); setDeleteTarget(null); fetchData();
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-fadeInUp">{toast}</div>}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Membership Plans</h1>
          <p className="text-sm text-text-secondary mt-1">Manage membership plan offerings</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
          <span className="material-icons-round text-[16px]">add</span>Add Plan
        </button>
      </div>
      <AdminTable columns={columns} data={data} isLoading={loading} onEdit={openEdit} onDelete={(row) => setDeleteTarget(row)} emptyMessage="No plans yet." />
      <AdminFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Plan" : "Add Plan"} fields={fields} values={form}
        onChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))} onSubmit={handleSave} isLoading={saving} submitLabel={editing ? "Update" : "Add"} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} />
    </div>
  );
}
