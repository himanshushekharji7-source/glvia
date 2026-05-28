"use client";

import { useState, useEffect } from "react";
import { supabase, TABLES } from "../../lib/supabase";

const settingKeys = [
  { key: "app_name", label: "App Name", placeholder: "glvia" },
  { key: "referral_amount", label: "Referral Amount (₹)", placeholder: "100" },
  { key: "billu_cash_points", label: "GLVIA Cash Points", placeholder: "1000" },
  { key: "billu_cash_value", label: "Cash Points Value (₹)", placeholder: "10" },
];

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from(TABLES.SITE_SETTINGS).select("*");
      const map: Record<string, string> = {};
      (data || []).forEach((row: any) => { map[row.key] = row.value; });
      setSettings(map);
      setLoading(false);
    };
    fetch();
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSave = async () => {
    setSaving(true);
    let hasError = false;

    for (const sk of settingKeys) {
      const value = settings[sk.key] || "";
      const { error } = await supabase.from(TABLES.SITE_SETTINGS).upsert(
        { key: sk.key, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      if (error) { showToast("Error saving " + sk.label + ": " + error.message); hasError = true; break; }
    }

    if (!hasError) showToast("Settings saved!");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-3 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-fadeInUp">{toast}</div>}

      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Site Settings</h1>
        <p className="text-sm text-text-secondary mt-1">General website configuration</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 max-w-lg">
        {settingKeys.map((sk) => (
          <div key={sk.key}>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{sk.label}</label>
            <input
              type="text"
              value={settings[sk.key] || ""}
              onChange={(e) => setSettings((prev) => ({ ...prev, [sk.key]: e.target.value }))}
              placeholder={sk.placeholder}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 mt-4"
        >
          {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          <span className="material-icons-round text-[16px]">save</span>
          Save Settings
        </button>
      </div>
    </div>
  );
}
