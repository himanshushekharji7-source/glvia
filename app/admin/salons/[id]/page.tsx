"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase, TABLES } from "../../../lib/supabase";
import AdminTable from "../../../components/admin/AdminTable";
import AdminFormModal from "../../../components/admin/AdminFormModal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";

type TabType = "services" | "categories";

const serviceFields = [
  { name: "name", label: "Service Name", type: "text" as const, required: true },
  { name: "description", label: "Description", type: "textarea" as const },
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

  useEffect(() => {
    const fetchSalon = async () => {
      const { data: s } = await supabase.from(TABLES.SALONS).select("*").eq("id", id).single();
      setSalon(s);
    };
    fetchSalon();
  }, [id]);

  const fetchData = async () => {
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
          <p className="text-sm text-text-secondary mt-0.5">Manage services & categories for this salon</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["services", "categories"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab === t ? "bg-pink-50 text-pink-600 border border-pink-200" : "bg-white text-gray-500 border border-gray-100"}`}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={openAdd} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
          <span className="material-icons-round text-[16px]">add</span>Add {tab === "services" ? "Service" : "Category"}
        </button>
      </div>

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
    </div>
  );
}
