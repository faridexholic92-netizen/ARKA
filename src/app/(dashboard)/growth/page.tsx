"use client";
import { useEffect, useState, useMemo } from "react";
import { toast } from "@/components/Toast";
import { useAuthStore } from "@/store/authStore";
import { getChildren } from "@/services/childService";
import { getGrowthRecords, addGrowthRecord, updateGrowthRecord, deleteGrowthRecord, getBMICategory } from "@/services/growthService";
import { Child, GrowthRecord } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Plus, Trash2, TrendingUp, Pencil, X, ArrowUpDown } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ConfirmModal } from "@/components/ConfirmModal";

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const emptyForm = { weight: "", height: "", headSize: "", recordDate: new Date().toISOString().split("T")[0], notes: "" };

export default function GrowthPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<GrowthRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filterYear, setFilterYear] = useState("all");

  useEffect(() => {
    if (user) getChildren(user.id).then((d) => { setChildren(d); if (d.length) setSelectedChild(d[0].id); });
  }, [user]);

  useEffect(() => {
    if (selectedChild) { setLoading(true); getGrowthRecords(selectedChild).then((d) => { setRecords(d); setLoading(false); }); }
  }, [selectedChild]);

  const years = useMemo(() => {
    const yearMap: Record<string, boolean> = {};
    records.forEach((r) => { yearMap[r.recordDate.substring(0, 4)] = true; });
    return Object.keys(yearMap).sort((a, b) => b.localeCompare(a));
  }, [records]);

  const filtered = useMemo(() => {
    let list = filterYear === "all" ? [...records] : records.filter((r) => r.recordDate.startsWith(filterYear));
    list.sort((a, b) => sortOrder === "newest" ? b.recordDate.localeCompare(a.recordDate) : a.recordDate.localeCompare(b.recordDate));
    return list;
  }, [records, filterYear, sortOrder]);

  const latest = useMemo(() => [...records].sort((a, b) => b.recordDate.localeCompare(a.recordDate))[0], [records]);
  const chartData = useMemo(() => [...records].sort((a, b) => a.recordDate.localeCompare(b.recordDate)), [records]);

  function openAdd() { setEditRecord(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(r: GrowthRecord) {
    setEditRecord(r);
    setForm({ weight: String(r.weight), height: String(r.height), headSize: r.headSize ? String(r.headSize) : "", recordDate: r.recordDate, notes: r.notes ?? "" });
    setShowModal(true);
  }

  async function handleSubmit() {
    if (!form.weight || !form.height || !form.recordDate) return;
    setSubmitting(true);
    try {
      const data = { weight: Number(form.weight), height: Number(form.height), headSize: form.headSize ? Number(form.headSize) : undefined, recordDate: form.recordDate, notes: form.notes || undefined };
      if (editRecord) {
        await updateGrowthRecord(editRecord.id, data);
        const bmi = Number((Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1));
        setRecords((prev) => prev.map((r) => r.id === editRecord.id ? { ...r, ...data, bmi } : r));
        toast.success("Rekod berjaya dikemaskini! ✅");
      } else {
        const rec = await addGrowthRecord(selectedChild, data);
        setRecords((prev) => [...prev, rec].sort((a, b) => a.recordDate.localeCompare(b.recordDate)));
        toast.success("Rekod perkembangan disimpan! 📏");
      }
      setShowModal(false);
    } finally { setSubmitting(false); }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    await deleteGrowthRecord(confirmDelete);
    setRecords((prev) => prev.filter((r) => r.id !== confirmDelete));
    setConfirmDelete(null);
    toast.info("Rekod dipadam.");
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div><h1 className="text-2xl font-bold text-gray-800">Penjejak Perkembangan</h1><p className="text-gray-500 mt-1">Rekod berat, tinggi dan BMI anak</p></div>
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

      {latest && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Berat", value: `${latest.weight} kg`, icon: "⚖️" },
            { label: "Tinggi", value: `${latest.height} cm`, icon: "📏" },
            { label: "BMI", value: latest.bmi.toString(), icon: "📊", extra: getBMICategory(latest.bmi) },
            { label: "Kepala", value: latest.headSize ? `${latest.headSize} cm` : "—", icon: "🧠" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
              {s.extra && <p className={`text-xs font-medium mt-0.5 ${s.extra.color}`}>{s.extra.label}</p>}
            </div>
          ))}
        </div>
      )}

      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl border p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Carta Perkembangan</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="recordDate" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#3B82F6" name="Berat (kg)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="height" stroke="#10B981" name="Tinggi (cm)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Semua Tahun</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={() => setSortOrder((s) => s === "newest" ? "oldest" : "newest")} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white hover:bg-gray-50 transition">
          <ArrowUpDown className="w-3.5 h-3.5" /> {sortOrder === "newest" ? "Terbaru Dahulu" : "Terlama Dahulu"}
        </button>
        <span className="text-sm text-gray-400 ml-auto">{filtered.length} rekod</span>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuatkan...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📏</div>
            <p className="text-gray-500 font-medium">Tiada rekod perkembangan</p>
            {selectedChild && <button onClick={openAdd} className="inline-flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl mt-4 font-medium hover:opacity-90 transition text-sm"><Plus className="w-4 h-4" /> Tambah Rekod</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>{["Tarikh", "Berat (kg)", "Tinggi (cm)", "BMI", "Kepala (cm)", "Nota", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{formatDate(r.recordDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.weight}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.height}</td>
                    <td className="px-4 py-3 text-sm"><span className={`font-medium ${getBMICategory(r.bmi).color}`}>{r.bmi}</span><span className="text-gray-400 text-xs ml-1">({getBMICategory(r.bmi).label})</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.headSize ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 max-w-[140px] truncate">{r.notes || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition"><X className="w-5 h-5" /></button>
            <h2 className="font-bold text-gray-800 text-lg mb-5">{editRecord ? "Edit Rekod" : "Tambah Rekod Baru"}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[{ key: "weight", label: "Berat (kg) *", placeholder: "15.5" }, { key: "height", label: "Tinggi (cm) *", placeholder: "90" }].map((f) => (
                  <div key={f.key}>
                    <label className={labelCls}>{f.label}</label>
                    <input type="number" step="0.1" className={inputCls} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Lingkar Kepala (cm)</label>
                  <input type="number" step="0.1" className={inputCls} placeholder="48" value={form.headSize} onChange={(e) => setForm((p) => ({ ...p, headSize: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Tarikh *</label>
                  <input type="date" className={inputCls} value={form.recordDate} onChange={(e) => setForm((p) => ({ ...p, recordDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Nota</label>
                <input className={inputCls} placeholder="Nota tambahan..." value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
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

      <ConfirmModal isOpen={!!confirmDelete} danger title="Padam Rekod?" message="Rekod ini akan dipadam secara kekal dan tidak boleh dipulihkan." confirmLabel="Ya, Padam" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
