"use client";
import { useEffect, useState } from "react";
import { toast } from "@/components/Toast";
import { useAuthStore } from "@/store/authStore";
import { getChildren } from "@/services/childService";
import { getGrowthRecords, addGrowthRecord, deleteGrowthRecord, getBMICategory } from "@/services/growthService";
import { Child, GrowthRecord } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  weight: z.number({ coerce: true }).min(1).max(200),
  height: z.number({ coerce: true }).min(10).max(250),
  headSize: z.number({ coerce: true }).optional(),
  recordDate: z.string().min(1),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function GrowthPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { recordDate: new Date().toISOString().split("T")[0] },
  });

  useEffect(() => {
    if (user) getChildren(user.id).then((d) => { setChildren(d); if (d.length) setSelectedChild(d[0].id); });
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      setLoading(true);
      getGrowthRecords(selectedChild).then((d) => { setRecords(d); setLoading(false); });
    }
  }, [selectedChild]);

  const onSubmit = async (data: FormData) => {
    const rec = await addGrowthRecord(selectedChild, data);
    setRecords((prev) => [...prev, rec].sort((a, b) => a.recordDate.localeCompare(b.recordDate)));
    reset({ recordDate: new Date().toISOString().split("T")[0] });
    setShowForm(false);
    toast.success("Rekod perkembangan disimpan! 📏");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Padam rekod ini?")) return;
    await deleteGrowthRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    toast.info("Rekod dipadam.");
  };

  const latest = records[records.length - 1];
  const bmiInfo = latest ? getBMICategory(latest.bmi) : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Penjejak Perkembangan</h1>
          <p className="text-gray-500 mt-1">Rekod berat, tinggi dan BMI anak</p>
        </div>
        {selectedChild && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Tambah Rekod
          </button>
        )}
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

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Rekod Baru</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {[
              { name: "weight", label: "Berat (kg)", placeholder: "15.5" },
              { name: "height", label: "Tinggi (cm)", placeholder: "90" },
              { name: "headSize", label: "Lingkar Kepala (cm)", placeholder: "48" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input {...register(f.name as any, { valueAsNumber: true })} type="number" step="0.1" placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh</label>
              <input {...register("recordDate")} type="date" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
            <input {...register("notes")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nota tambahan..." />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm">Batal</button>
            <button type="submit" className="gradient-primary text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition">Simpan</button>
          </div>
        </form>
      )}

      {/* Latest stats */}
      {latest && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Berat", value: `${latest.weight} kg`, icon: "⚖️" },
            { label: "Tinggi", value: `${latest.height} cm`, icon: "📏" },
            { label: "BMI", value: latest.bmi.toString(), icon: "📊", extra: bmiInfo },
            { label: "Kepala", value: latest.headSize ? `${latest.headSize} cm` : "—", icon: "🧠" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border p-5">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
              {s.extra && <p className={`text-xs font-medium mt-1 ${s.extra.color}`}>{s.extra.label}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {records.length > 1 && (
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Carta Perkembangan
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={records}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="recordDate" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#3B82F6" name="Berat (kg)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="height" stroke="#10B981" name="Tinggi (cm)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-gray-700">Sejarah Rekod</h2>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuatkan...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Belum ada rekod perkembangan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Tarikh", "Berat (kg)", "Tinggi (cm)", "BMI", "Kepala (cm)", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...records].reverse().map((r) => {
                  const bmi = getBMICategory(r.bmi);
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm text-gray-600">{formatDate(r.recordDate)}</td>
                      <td className="px-5 py-4 text-sm font-medium">{r.weight}</td>
                      <td className="px-5 py-4 text-sm font-medium">{r.height}</td>
                      <td className="px-5 py-4 text-sm">
                        <span className={`font-medium ${bmi.color}`}>{r.bmi} ({bmi.label})</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{r.headSize ?? "—"}</td>
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
