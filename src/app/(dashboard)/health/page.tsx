"use client";
import { useEffect, useState, useMemo } from "react";
import { toast } from "@/components/Toast";
import { useAuthStore } from "@/store/authStore";
import { getChildren } from "@/services/childService";
import { getHealthRecords, addHealthRecord, deleteHealthRecord, categoryConfig } from "@/services/healthService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Child, HealthRecord, HealthCategory } from "@/types";
import { Plus, Trash2, Pencil, X, Bell, ArrowUpDown } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ConfirmModal } from "@/components/ConfirmModal";

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const ALL_CATS: HealthCategory[] = ["clinic","vaccination","medication","allergy","dental","eye","hospital"];
const emptyForm = { category: "clinic" as HealthCategory, title: "", description: "", hospital: "", doctor: "", medication: "", nextAppointment: "", recordDate: new Date().toISOString().split("T")[0] };

export default function HealthPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<HealthRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [catFilter, setCatFilter] = useState<HealthCategory | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    if (user) getChildren(user.id).then((d) => { setChildren(d); if (d.length) setSelectedChild(d[0].id); });
  }, [user]);

  useEffect(() => {
    if (selectedChild) { setLoading(true); getHealthRecords(selectedChild).then((d) => { setRecords(d); setLoading(false); }); }
  }, [selectedChild]);

  const upcomingCount = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0);
    const limit = new Date(now.getTime() + 30 * 86400000);
    return records.filter((r) => { if (!r.nextAppointment) return false; const d = new Date(r.nextAppointment); return d >= now && d <= limit; }).length;
  }, [records]);

  const filtered = useMemo(() => {
    let list = catFilter === "all" ? [...records] : records.filter((r) => r.category === catFilter);
    list.sort((a, b) => sortOrder === "newest" ? b.recordDate.localeCompare(a.recordDate) : a.recordDate.localeCompare(b.recordDate));
    return list;
  }, [records, catFilter, sortOrder]);

  function openAdd() { setEditRecord(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(r: HealthRecord) {
    setEditRecord(r);
    setForm({ category: r.category, title: r.title, description: r.description ?? "", hospital: r.hospital ?? "", doctor: r.doctor ?? "", medication: r.medication ?? "", nextAppointment: r.nextAppointment ?? "", recordDate: r.recordDate });
    setShowModal(true);
  }

  async function handleSubmit() {
    if (!form.title || !form.recordDate) return;
    setSubmitting(true);
    try {
      const data = { category: form.category, title: form.title, description: form.description || undefined, hospital: form.hospital || undefined, doctor: form.doctor || undefined, medication: form.medication || undefined, nextAppointment: form.nextAppointment || undefined, recordDate: form.recordDate };
      if (editRecord) {
        await updateDoc(doc(db, "healthRecords", editRecord.id), data);
        setRecords((prev) => prev.map((r) => r.id === editRecord.id ? { ...r, ...data } : r));
        toast.success("Rekod kesihatan dikemaskini! ✅");
      } else {
        const rec = await addHealthRecord(selectedChild, data);
        setRecords((prev) => [rec, ...prev]);
        toast.success("Rekod kesihatan ditambah! ❤️");
      }
      setShowModal(false);
    } finally { setSubmitting(false); }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    await deleteHealthRecord(confirmDelete);
    setRecords((prev) => prev.filter((r) => r.id !== confirmDelete));
    setConfirmDelete(null);
    toast.info("Rekod dipadam.");
  }

  const FormBody = () => (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Kategori *</label>
        <select className={inputCls} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as HealthCategory }))}>
          {ALL_CATS.map((c) => <option key={c} value={c}>{categoryConfig[c].emoji} {categoryConfig[c].label}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Tajuk *</label>
        <input className={inputCls} placeholder="cth: Vaksin MMR" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Hospital / Klinik</label><input className={inputCls} placeholder="Nama hospital" value={form.hospital} onChange={(e) => setForm((p) => ({ ...p, hospital: e.target.value }))} /></div>
        <div><label className={labelCls}>Doktor</label><input className={inputCls} placeholder="Nama doktor" value={form.doctor} onChange={(e) => setForm((p) => ({ ...p, doctor: e.target.value }))} /></div>
      </div>
      <div><label className={labelCls}>Ubat / Dos</label><input className={inputCls} placeholder="Nama ubat" value={form.medication} onChange={(e) => setForm((p) => ({ ...p, medication: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Tarikh Rekod *</label><input type="date" className={inputCls} value={form.recordDate} onChange={(e) => setForm((p) => ({ ...p, recordDate: e.target.value }))} /></div>
        <div><label className={labelCls}>Temujanji Akan Datang</label><input type="date" className={inputCls} value={form.nextAppointment} onChange={(e) => setForm((p) => ({ ...p, nextAppointment: e.target.value }))} /></div>
      </div>
      <div><label className={labelCls}>Penerangan</label><textarea className={`${inputCls} resize-none`} rows={3} placeholder="Nota tambahan..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div><h1 className="text-2xl font-bold text-gray-800">Rekod Kesihatan</h1><p className="text-gray-500 mt-1">Jejak kesihatan dan rawatan anak</p></div>
        {selectedChild && <button onClick={openAdd} className="flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition"><Plus className="w-4 h-4" /> Tambah Rekod</button>}
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

      {/* Upcoming appointments banner */}
      {upcomingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Bell className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-yellow-800 text-sm font-medium">🔔 {upcomingCount} temujanji akan datang dalam 30 hari</p>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {[{ key: "all", label: "Semua", emoji: "📋" }, ...ALL_CATS.map((c) => ({ key: c, label: categoryConfig[c].label, emoji: categoryConfig[c].emoji }))].map((f) => (
          <button key={f.key} onClick={() => setCatFilter(f.key as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${catFilter === f.key ? "gradient-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {f.emoji} {f.label}
          </button>
        ))}
        <button onClick={() => setSortOrder((s) => s === "newest" ? "oldest" : "newest")} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs bg-white hover:bg-gray-50 transition ml-auto">
          <ArrowUpDown className="w-3 h-3" /> {sortOrder === "newest" ? "Terbaru" : "Terlama"}
        </button>
      </div>

      {/* Records */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Memuatkan...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-5xl mb-3">❤️</div>
          <p className="text-gray-500 font-medium">Tiada rekod kesihatan</p>
          {selectedChild && <button onClick={openAdd} className="inline-flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl mt-4 font-medium hover:opacity-90 transition text-sm"><Plus className="w-4 h-4" /> Tambah Rekod</button>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const cat = categoryConfig[r.category];
            const isUpcoming = r.nextAppointment && (() => { const now = new Date(); now.setHours(0,0,0,0); const d = new Date(r.nextAppointment!); return d >= now && d <= new Date(now.getTime() + 30*86400000); })();
            return (
              <div key={r.id} className="bg-white rounded-2xl border p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gray-50 border flex items-center justify-center text-xl flex-shrink-0">{cat.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800">{r.title}</h4>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${cat.color}`}>{cat.label}</span>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>📅 {formatDate(r.recordDate)}</span>
                      {r.hospital && <span>🏥 {r.hospital}</span>}
                      {r.doctor && <span>👨‍⚕️ {r.doctor}</span>}
                    </div>
                    {r.nextAppointment && (
                      <div className={`mt-2 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${isUpcoming ? "bg-yellow-100 text-yellow-700" : "bg-blue-50 text-blue-700"}`}>
                        {isUpcoming ? "🔔" : "🗓️"} Temujanji: {formatDate(r.nextAppointment)}
                      </div>
                    )}
                    {r.description && <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{r.description}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition"><X className="w-5 h-5" /></button>
            <h2 className="font-bold text-gray-800 text-lg mb-5">{editRecord ? "Edit Rekod Kesihatan" : "Tambah Rekod Kesihatan"}</h2>
            <FormBody />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 gradient-primary text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition">
                {submitting ? "Menyimpan..." : editRecord ? "Kemaskini" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!confirmDelete} danger title="Padam Rekod Kesihatan?" message="Rekod ini akan dipadam secara kekal." confirmLabel="Ya, Padam" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
