"use client";

import { useState, useEffect } from "react";
import { supabase, TABLES } from "../../lib/supabase";
import AdminTable from "../../components/admin/AdminTable";
import AdminFormModal from "../../components/admin/AdminFormModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

type TabType = "categories" | "packages" | "services";

export default function AtHomeContentPage() {
  const [tab, setTab] = useState<TabType>("categories");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  const tableMap: Record<TabType, string> = {
    categories: TABLES.AT_HOME_CATEGORIES,
    packages: TABLES.AT_HOME_PACKAGES,
    services: TABLES.AT_HOME_SERVICES,
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from(tableMap[tab])
      .select("*")
      .eq("gender", gender)
      .order("sort_order", { ascending: true });
    setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [tab, gender]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const getFields = () => {
    const base = [{ name: "sort_order", label: "Sort Order", type: "number" as const, placeholder: "0" }];
    switch (tab) {
      case "categories":
        return [
          { name: "name", label: "Category Name", type: "text" as const, required: true },
          { name: "image", label: "Image URL", type: "url" as const, required: true },
          ...base,
        ];
      case "packages":
        return [
          { name: "title", label: "Package Title", type: "text" as const, required: true },
          { name: "description", label: "Description", type: "textarea" as const, required: true },
          { name: "price", label: "Price (₹)", type: "number" as const, required: true },
          { name: "old_price", label: "Old Price (₹)", type: "number" as const },
          { name: "image", label: "Image URL", type: "url" as const, required: true },
          ...base,
        ];
      case "services":
        return [
          { name: "name", label: "Service Name", type: "text" as const, required: true },
          { name: "price", label: "Price (₹)", type: "number" as const, required: true },
          { name: "duration", label: "Duration", type: "text" as const, placeholder: "e.g. 30 mins" },
          { name: "prefix", label: "Prefix Text", type: "text" as const, placeholder: "e.g. Start's at" },
          { name: "options", label: "Options Text", type: "text" as const, placeholder: "e.g. 4 option" },
          { name: "image", label: "Image URL", type: "url" as const, required: true },
          ...base,
        ];
    }
  };

  const getColumns = () => {
    switch (tab) {
      case "categories":
        return [
          { key: "image", label: "Image", width: "60px", render: (v: string) => v ? <img src={v} alt="" className="w-10 h-10 rounded-lg object-cover" /> : "—" },
          { key: "name", label: "Name" },
        ];
      case "packages":
        return [
          { key: "title", label: "Title" },
          { key: "price", label: "Price", render: (v: number) => `₹${v}` },
          { key: "old_price", label: "Old Price", render: (v: number) => v ? `₹${v}` : "—" },
        ];
      case "services":
        return [
          { key: "name", label: "Name" },
          { key: "price", label: "Price", render: (v: number) => `₹${v}` },
          { key: "duration", label: "Duration" },
        ];
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ gender, sort_order: 0 });
    setModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const saveData: any = { ...form, gender };
    delete saveData.id;
    delete saveData.created_at;

    if (editing) {
      const { error } = await supabase.from(tableMap[tab]).update(saveData).eq("id", editing.id);
      if (error) showToast("Error: " + error.message);
      else showToast("Updated!");
    } else {
      const { error } = await supabase.from(tableMap[tab]).insert(saveData);
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
    const { error } = await supabase.from(tableMap[tab]).delete().eq("id", deleteTarget.id);
    if (error) showToast("Error: " + error.message);
    else showToast("Deleted!");
    setDeleting(false);
    setDeleteTarget(null);
    fetchData();
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "categories", label: "Categories", icon: "category" },
    { key: "packages", label: "Packages", icon: "inventory_2" },
    { key: "services", label: "Services", icon: "list_alt" },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-fadeInUp">{toast}</div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">At Home Content</h1>
          <p className="text-sm text-text-secondary mt-1">Manage At Home categories, packages & services</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
          <span className="material-icons-round text-[16px]">add</span>
          Add New
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.key ? "bg-pink-50 text-pink-600 border border-pink-200" : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
            }`}>
            <span className="material-icons-round text-[16px]">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Gender:</span>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {(["male", "female"] as const).map((g) => (
            <button key={g} onClick={() => setGender(g)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${gender === g ? "bg-white text-pink-600 shadow-sm" : "text-gray-500"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <AdminTable columns={getColumns()} data={data} isLoading={loading} onEdit={openEdit} onDelete={(row) => setDeleteTarget(row)} emptyMessage="No items yet." />

      <AdminFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit" : "Add"} fields={getFields()} values={form}
        onChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))} onSubmit={handleSave} isLoading={saving} submitLabel={editing ? "Update" : "Add"} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} />
    </div>
  );
}
