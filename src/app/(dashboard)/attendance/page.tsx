"use client";
import { useEffect, useState } from "react";
import { toast } from "@/components/Toast";
import { useAuthStore } from "@/store/authStore";
import { getChildren } from "@/services/childService";
import { getAttendance, addAttendance, deleteAttendance, getAttendanceStats } from "@/services/attendanceService";
import { Child, AttendanceRecord } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  status: z.enum(["present", "absent", "sick", "holiday", "half-day"]),
  attendanceDate: z.string().min(1),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const statusConfig = {
  present: { label: "Hadir", color: "bg-green-100 text-green-700", emoji: "✅" },
  absent: { label: "Tidak Hadir", color: "bg-red-100 text-red-700", emoji: "❌" },
  sick: { label: "Sakit", color: "bg-yellow-100 text-yellow-700", emoji: "🤒" },
  holiday: { label: "Cuti", color: "bg-blue-100 text-blue-700", emoji: "🏖️" },
  "half-day": { label: "Separuh Hari", color: "bg-purple-100 text-purple-700", emoji: "⏰" },
};

export default function AttendancePage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "present", attendanceDate: new Date().toISOString().split("T")[0] },
  });

  useEffect(() => {
    if (user) getChildren(user.id).then((d) => { setChildren(d); if (d.length) setSelectedChild(d[0].id); });
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      setLoading(true);
      getAttendance(selectedChild).then((d) => { setRecords(d); setLoading(false); });
    }
  }, [selectedChild]);

  const onSubmit = async (data: FormData) => {
    const rec = await addAttendance(selectedChild, data);
    setRecords((prev) => [rec, ...prev]);
    reset({ status: "present", attendanceDate: new Date().toISOString().split("T")[0] });
    setShowForm(false);
    toast.success("Rekod kehadiran disimpan! ✅");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Padam rekod ini?")) return;
    await deleteAttendance(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    toast.info("Rekod dipadam.");
  };

  const stats = getAttendanceStats(records);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rekod Kehadiran</h1>
          <p className="text-gray-500 mt-1">Pantau kehadiran anak di sekolah / taska</p>
        </div>
        {selectedChild && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Tambah Rekod
          </button>
        )}
      </div>

      {/* Child selector */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {children.map((c) => (
          <button key={c.id} onClick={() => setSelectedChild(c.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${selectedChild === c.id ? "gradient-primary text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
            {c.gender === "male" ? "👦" : "👧"} {c.fullName}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Jumlah", value: stats.total, color: "bg-gray-100 text-gray-700", emoji: "📋" },
          { label: "Hadir", value: stats.present, color: "bg-green-100 text-green-700", emoji: "✅" },
          { label: "Tidak Hadir", value: stats.absent, color: "bg-red-100 text-red-700", emoji: "❌" },
          { label: "% Kehadiran", value: `${stats.percentage}%`, color: "bg-blue-100 text-blue-700", emoji: "📊" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border p-5">
            <div className="text-xl mb-1">{s.emoji}</div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Rekod Baru</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select {...register("status")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {Object.entries(statusConfig).map(([v, c]) => <option key={v} value={v}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh</label>
              <input {...register("attendanceDate")} type="date" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
              <input {...register("notes")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nota..." />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm">Batal</button>
            <button type="submit" className="gradient-primary text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition">Simpan</button>
          </div>
        </form>
      )}

      {/* Records */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-5 border-b"><h2 className="font-semibold text-gray-700">Senarai Rekod</h2></div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuatkan...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Belum ada rekod kehadiran</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Tarikh", "Status", "Nota", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r) => {
                  const s = statusConfig[r.status];
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm text-gray-600">{formatDate(r.attendanceDate)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.emoji} {s.label}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{r.notes ?? "—"}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
