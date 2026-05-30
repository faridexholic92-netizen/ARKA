"use client";
import { useEffect, useState, useMemo } from "react";
import { toast } from "@/components/Toast";
import { useAuthStore } from "@/store/authStore";
import { getChildren } from "@/services/childService";
import { getAchievements, addAchievement, updateAchievement, deleteAchievement, categoryLabels, categoryColors } from "@/services/achievementService";
import { Child, Achievement } from "@/types";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ConfirmModal } from "@/components/ConfirmModal";

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

type AchCat = Achievement["category"];
const ALL_CATS: AchCat[] = ["academic","sports","arts","religion","competition","award"];
const catEmojis: Record<AchCat, string> = { academic: "📚", sports: "⚽", arts: "🎨", religion: "🌙", competition: "🏆", award: "🥇" };
const emptyForm = { title: "", category: "academic" as AchCat, description: "", score: "", certificate: "", recordDate: new Date().toISOString().split("T")[0] };

export default function AchievementsPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [records, setRecords] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<Achievement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<AchCat | "all">("all");

  useEffect(() => {
    if (user) getChildren(user.id).then((d) => { setChildren(d); if (d.length) setSelectedChild(d[0].id); });
  }, [user]);

  useEffect(() => {
    if (selectedChild) { setLoading(true); getAchievements(selectedChild).then((d) => { setRecords(d); setLoading(false); }); }
  }, [selectedChild]);

  const filtered = useMemo(() => filterCat === "all" ? records : records.filter((r) => r.category === filterCat), [records, filterCat]);

  function openAdd() { setEditRecord(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(r: Achievement) {
    setEditRecord(r);
    setForm({ title: r.title, category: r.category, description: r.description ?? "", score: r.score ?? "", certificate: r.certificate ?? "", recordDate: r.recordDate });
    setShowModal(true);
  }

  async function handleSubmit() {
    if (!form.title || !form.recordDate) return;
    setSubmitting(true);
    try {
      const data = { title: form.title, category: form.category, description: form.description || undefined, score: form.score || undefined, certificate: form.certificate || undefined, recordDate: form.recordDate };
      if (editRecord) {
        await updateAchievement(editRecord.id, data);
        setRecords((prev) => prev.map((r) => r.id === editRecord.id ? { ...r, ...data } : r));
        toast.success("Pencapaian dikemaskini! ✅");
      } else {
        const rec = await addAchievement(selectedChild, data);
        setRecords((prev) => [rec, ...prev]);
        toast.success("Pencapaian ditambah! 🏆");
      }
      setShowModal(false);
    } finally { setSubmitting(false); }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    await deleteAchievement(confirmDelete);
    setRecords((prev) => prev.filter((r) => r.id !== confirmDelete));
    setConfirmDelete(null);
    toast.info("Rekod dipadam.");
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div><h1 className="text-2xl font-bold text-gray-800">Pencapaian</h1><p className="text-gray-500 mt-1">Rekod kejayaan dan pencapaian anak</p></div>
        {selectedChild && <button onClick={openAdd} className="flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition"><Plus className="w-4 h-4" /> Tambah Pencapaian</button>}
      </div>

      {children.length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {children.map((c) => (
            <button key={c.id} onClick={() => setSelectedChild(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${selectedChild === c.id ? "gradient-primary text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
              {c.gender === "male" ? "👦" : "👧"} {c.fullName}
            </button>
          ))}
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ key: "all", label: "Semua", emoji: "🌟" }, ...ALL_CATS.map((c) => ({ key: c, label: categoryLabels[c], emoji: catEmojis[c] }))].map((f) => (
          <button key={f.key} onClick={() => setFilterCat(f.key as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${filterCat === f.key ? "gradient-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Memuatkan...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-5xl mb-3">🏆</div>
          <p className="text-gray-500 font-medium">Tiada pencapaian ditemui</p>
          {selectedChild && <button onClick={openAdd} className="inline-flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl mt-4 font-medium hover:opacity-90 transition text-sm"><Plus className="w-4 h-4" /> Tambah Pencapaian</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border p-5 shadow-sm relative group">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="text-3xl">{catEmojis[r.category]}</div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setConfirmDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-bold text-gray-800 leading-snug">{r.title}</h3>
              {r.description && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{r.description}</p>}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[r.category]}`}>{categoryLabels[r.category]}</span>
                {r.score && <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">⭐ {r.score}</span>}
              </div>
              <p className="text-gray-400 text-xs mt-3">{formatDate(r.recordDate)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition"><X className="w-5 h-5" /></button>
            <h2 className="font-bold text-gray-800 text-lg mb-5">{editRecord ? "Edit Pencapaian" : "Tambah Pencapaian"}</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Tajuk Pencapaian *</label>
                <input className={inputCls} placeholder="cth: Johan Sukan Tahunan" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Kategori *</label>
                  <select className={inputCls} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as AchCat }))}>
                    {ALL_CATS.map((c) => <option key={c} value={c}>{catEmojis[c]} {categoryLabels[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tarikh *</label>
                  <input type="date" className={inputCls} value={form.recordDate} onChange={(e) => setForm((p) => ({ ...p, recordDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Markah / Tempat</label>
                <input className={inputCls} placeholder="cth: Tempat 1 / 95 markah" value={form.score} onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Penerangan</label>
                <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Cerita lebih lanjut tentang pencapaian ini..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 gradient-primary text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition">
                {submitting ? "Menyimpan..." : editRecord ? "Kemaskini" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!confirmDelete} danger title="Padam Pencapaian?" message="Rekod pencapaian ini akan dipadam secara kekal." confirmLabel="Ya, Padam" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
