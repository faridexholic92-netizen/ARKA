"use client";
import { useEffect, useState, useMemo } from "react";
import { toast } from "@/components/Toast";
import { useAuthStore } from "@/store/authStore";
import { getChildren } from "@/services/childService";
import { getAttendance, addAttendance, updateAttendanceRecord, deleteAttendance, getAttendanceStats } from "@/services/attendanceService";
import { Child, AttendanceRecord } from "@/types";
import { Plus, Trash2, Pencil, X, ArrowUpDown } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ConfirmModal } from "@/components/ConfirmModal";

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const statusConfig = {
  present:    { label: "Hadir",        color: "bg-green-100 text-green-700",   emoji: "✅" },
  absent:     { label: "Tidak Hadir",  color: "bg-red-100 text-red-700",       emoji: "❌" },
  sick:       { label: "Sakit",        color: "bg-yellow-100 text-yellow-700", emoji: "🤒" },
  holiday:    { label: "Cuti",         color: "bg-blue-100 text-blue-700",     emoji: "🏖️" },
  "half-day": { label: "Separuh Hari", color: "bg-purple-100 text-purple-700", emoji: "⏰" },
};

type Status = AttendanceRecord["status"];
const ALL_STATUSES: Status[] = ["present","absent","sick","holiday","half-day"];

const emptyForm = { status: "present" as Status, attendanceDate: new Date().toISOString().split("T")[0], notes: "" };

export default function AttendancePage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    if (user) getChildren(user.id).then((d) => { setChildren(d); if (d.length) setSelectedChild(d[0].id); });
  }, [user]);

  useEffect(() => {
    if (selectedChild) { setLoading(true); getAttendance(selectedChild).then((d) => { setRecords(d); setLoading(false); }); }
  }, [selectedChild]);

  const months = useMemo(() => {
    const monthSet: Record<string, boolean> = {};
    records.forEach((r) => { monthSet[r.attendanceDate.substring(0, 7)] = true; });
    return Object.keys(monthSet).sort((a, b) => b.localeCompare(a));
  }, [records]);

  const filtered = useMemo(() => {
    let list = [...records];
    if (filterStatus !== "all") list = list.filter((r) => r.status === filterStatus);
    if (filterMonth !== "all") list = list.filter((r) => r.attendanceDate.startsWith(filterMonth));
    list.sort((a, b) => sortOrder === "newest" ? b.attendanceDate.localeCompare(a.attendanceDate) : a.attendanceDate.localeCompare(b.attendanceDate));
    return list;
  }, [records, filterStatus, filterMonth, sortOrder]);

  const stats = useMemo(() => getAttendanceStats(records), [records]);

  function openAdd() { setEditRecord(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(r: AttendanceRecord) {
    setEditRecord(r);
    setForm({ status: r.status, attendanceDate: r.attendanceDate, notes: r.notes ?? "" });
    setShowModal(true);
  }

  async function handleSubmit() {
    if (!form.attendanceDate) return;
    setSubmitting(true);
    try {
      const data = { status: form.status, attendanceDate: form.attendanceDate, notes: form.notes || undefined };
      if (editRecord) {
        await updateAttendanceRecord(editRecord.id, data);
        setRecords((prev) => prev.map((r) => r.id === editRecord.id ? { ...r, ...data } : r));
        toast.success("Rekod kehadiran dikemaskini! ✅");
      } else {
        const rec = await addAttendance(selectedChild, data);
        setRecords((prev) => [rec, ...prev]);
        toast.success("Rekod kehadiran ditambah! 📅");
      }
      setShowModal(false);
    } finally { setSubmitting(false); }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    await deleteAttendance(confirmDelete);
    setRecords((prev) => prev.filter((r) => r.id !== confirmDelete));
    setConfirmDelete(null);
    toast.info("Rekod dipadam.");
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div><h1 className="text-2xl font-bold text-gray-800">Rekod Kehadiran</h1><p className="text-gray-500 mt-1">Pantau kehadiran anak di sekolah / tadika</p></div>
        {selectedChild && <button onClick={openAdd} className="flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition"><Plus className="w-4 h-4" /> Tambah Rekod</button>}
      </div>

      {/* Child selector */}
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

      {/* Stats */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Jumlah Hari",    value: stats.total,               emoji: "📋", color: "bg-gray-50" },
            { label: "Hadir",          value: stats.present,             emoji: "✅", color: "bg-green-50" },
            { label: "Tidak Hadir",    value: stats.absent,              emoji: "❌", color: "bg-red-50" },
            { label: "% Kehadiran",    value: `${stats.percentage}%`,   emoji: "📊", color: "bg-blue-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
              <div className="text-2xl mb-1">{s.emoji}</div>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="flex gap-2 flex-wrap">
          {([{ key: "all", label: "Semua", emoji: "📋" }, ...ALL_STATUSES.map((s) => ({ key: s, label: statusConfig[s].label, emoji: statusConfig[s].emoji }))]).map((f) => (
            <button key={f.key} onClick={() => setFilterStatus(f.key as any)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition ${filterStatus === f.key ? "gradient-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Semua Bulan</option>
          {months.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <button onClick={() => setSortOrder((s) => s === "newest" ? "oldest" : "newest")} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white hover:bg-gray-50 transition">
          <ArrowUpDown className="w-3 h-3" /> {sortOrder === "newest" ? "Terbaru" : "Terlama"}
        </button>
        <span className="text-sm text-gray-400 ml-auto">{filtered.length} rekod</span>
      </div>

      {/* Records */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Memuatkan...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-5xl mb-3">📅</div>
          <p className="text-gray-500 font-medium">Tiada rekod kehadiran</p>
          {selectedChild && <button onClick={openAdd} className="inline-flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl mt-4 font-medium hover:opacity-90 transition text-sm"><Plus className="w-4 h-4" /> Tambah Rekod</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>{["Tarikh", "Status", "Nota", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => {
                  const st = statusConfig[r.status];
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">{formatDate(r.attendanceDate)}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.emoji} {st.label}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-400">{r.notes || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition"><X className="w-5 h-5" /></button>
            <h2 className="font-bold text-gray-800 text-lg mb-5">{editRecord ? "Edit Rekod Kehadiran" : "Tambah Rekod Kehadiran"}</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Tarikh *</label>
                <input type="date" className={inputCls} value={form.attendanceDate} onChange={(e) => setForm((p) => ({ ...p, attendanceDate: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Status *</label>
                <select className={inputCls} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Status }))}>
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{statusConfig[s].emoji} {statusConfig[s].label}</option>)}
                </select>
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

      <ConfirmModal isOpen={!!confirmDelete} danger title="Padam Rekod Kehadiran?" message="Rekod ini akan dipadam secara kekal." confirmLabel="Ya, Padam" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
