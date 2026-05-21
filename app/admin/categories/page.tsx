"use client";

import { useState, useEffect } from "react";
import { supabase, TABLES } from "../../lib/supabase";
import AdminTable from "../../components/admin/AdminTable";
import AdminFormModal from "../../components/admin/AdminFormModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

const fields = [
  { name: "name", label: "Category Name", type: "text" as const, required: true, placeholder: "e.g. Hair" },
  { name: "slug", label: "Slug", type: "text" as const, required: true, placeholder: "e.g. hair" },
  { name: "icon", label: "Material Icon Name", type: "text" as const, required: true, placeholder: "e.g. content_cut" },
  { name: "sort_order", label: "Sort Order", type: "number" as const, placeholder: "0" },
];

const columns = [
  {
    key: "icon",
    label: "Icon",
    width: "60px",
    render: (val: string) => (
      <span className="material-icons-round text-pink-500 text-[22px]">{val}</span>
    ),
  },
  { key: "name", label: "Name" },
  { key: "slug", label: "Slug" },
  { key: "sort_order", label: "Order", width: "80px" },
];

export default function CategoriesPage() {
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
    const { data: rows } = await supabase
      .from(TABLES.CATEGORIES)
      .select("*")
      .order("sort_order", { ascending: true });
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
    setForm({ sort_order: 0 });
    setModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.icon) {
      showToast("Please fill all required fields");
      return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabase
        .from(TABLES.CATEGORIES)
        .update({ name: form.name, slug: form.slug, icon: form.icon, sort_order: form.sort_order || 0 })
        .eq("id", editing.id);
      if (error) showToast("Error: " + error.message);
      else showToast("Category updated!");
    } else {
      const { error } = await supabase
        .from(TABLES.CATEGORIES)
        .insert({ name: form.name, slug: form.slug, icon: form.icon, sort_order: form.sort_order || 0 });
      if (error) showToast("Error: " + error.message);
      else showToast("Category added!");
    }
    setSaving(false);
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from(TABLES.CATEGORIES).delete().eq("id", deleteTarget.id);
    if (error) showToast("Error: " + error.message);
    else showToast("Category deleted!");
    setDeleting(false);
    setDeleteTarget(null);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-fadeInUp">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Categories</h1>
          <p className="text-sm text-text-secondary mt-1">Manage global service categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
          <span className="material-icons-round text-[16px]">add</span>
          Add Category
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={data}
        isLoading={loading}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        emptyMessage="No categories yet. Add your first category!"
      />

      <AdminFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Category" : "Add Category"}
        fields={fields}
        values={form}
        onChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))}
        onSubmit={handleSave}
        isLoading={saving}
        submitLabel={editing ? "Update" : "Add"}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        isLoading={deleting}
      />
    </div>
  );
}
