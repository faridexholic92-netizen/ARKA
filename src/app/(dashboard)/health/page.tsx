"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getChildren } from "@/services/childService";
import { getHealthRecords, addHealthRecord, deleteHealthRecord, categoryConfig } from "@/services/healthService";
import { Child, HealthRecord, HealthCategory } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  category: z.enum(["clinic", "vaccination", "medication", "allergy", "dental", "eye", "hospital"]),
  title: z.string().min(2, "Tajuk minimum 2 aksara"),
  description: z.string().optional(),
  hospital: z.string().optional(),
  doctor: z.string().optional(),
  medication: z.string().optional(),
  nextAppointment: z.string().optional(),
  recordDate: z.string().min(1, "Tarikh diperlukan"),
});
type FormData = z.infer<typeof schema>;

export default function HealthPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState<HealthCategory | "all">("all");

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: "clinic", recordDate: new Date().toISOString().split("T")[0] },
  });

  const watchCategory = watch("category");

  useEffect(() => {
    if (user) getChildren(user.id).then((d) => { setChildren(d); if (d.length) setSelectedChild(d[0].id); });
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      setLoading(true);
      getHealthRecords(selectedChild).then((d) => { setRecords(d); setLoading(false); });
    }
  }, [selectedChild]);

  const onSubmit = async (data: FormData) => {
    const rec = await addHealthRecord(selectedChild, data);
    setRecords((prev) => [rec, ...prev]);
    reset({ category: "clinic", recordDate: new Date().toISOString().split("T")[0] });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Padam rekod ini?")) return;
    await deleteHealthRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const filtered = filterCat === "all" ? records : records.filter((r) => r.category === filterCat);

  const categoryCounts = records.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rekod Kesihatan</h1>
          <p className="text-gray-500 mt-1">Pantau kesihatan anak secara lengkap</p>
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

      {/* Category filter */}
      {records.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setFilterCat("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filterCat === "all" ? "gradient-primary text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
            Semua ({records.length})
          </button>
          {(Object.keys(categoryConfig) as HealthCategory[]).filter((cat) => categoryCounts[cat]).map((cat) => (
            <button key={cat} onClick={() => setFilterCat(filterCat === cat ? "all" : cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filterCat === cat ? "gradient-primary text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
              {categoryConfig[cat].emoji} {categoryConfig[cat].label} ({categoryCounts[cat]})
            </button>
          ))}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Rekod Kesihatan Baru</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select {...register("category")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {(Object.keys(categoryConfig) as HealthCategory[]).map((cat) => (
                  <option key={cat} value={cat}>{categoryConfig[cat].emoji} {categoryConfig[cat].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tajuk *</label>
              <input {...register("title")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  watchCategory === "vaccination" ? "Cth: Vaksin MMR dos 1" :
                  watchCategory === "allergy" ? "Cth: Alahan debu" :
                  "Cth: Demam — Klinik Desa"
                } />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh</label>
              <input {...register("recordDate")} type="date" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Klinik</label>
              <input {...register("hospital")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Klinik Kesihatan / Hospital" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doktor</label>
              <input {...register("doctor")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama doktor" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubat / Rawatan</label>
              <input {...register("medication")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ubat yang diberikan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temujanji Seterusnya</label>
              <input {...register("nextAppointment")} type="date" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota / Keterangan</label>
              <input {...register("description")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nota tambahan..." />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm">Batal</button>
            <button type="submit" disabled={isSubmitting} className="gradient-primary text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition disabled:opacity-60">
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      )}

      {/* Records */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Memuatkan...</div>
      ) : children.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-5xl mb-4">👶</div>
          <p className="text-gray-500 font-medium">Tambah profil anak dahulu</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-5xl mb-4">❤️</div>
          <p className="text-gray-500 font-medium">Belum ada rekod kesihatan</p>
          <p className="text-gray-400 text-sm mt-1">Tambah rekod pertama anak anda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const cat = categoryConfig[r.category];
            return (
              <div key={r.id} className="bg-white rounded-2xl border p-5 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border flex items-center justify-center text-2xl flex-shrink-0">
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-gray-800">{r.title}</h3>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${cat.color}`}>{cat.label}</span>
                      </div>
                      <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600 transition p-1 flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>📅 {formatDate(r.recordDate)}</span>
                      {r.hospital && <span>🏥 {r.hospital}</span>}
                      {r.doctor && <span>👨‍⚕️ Dr. {r.doctor}</span>}
                      {r.medication && <span>💊 {r.medication}</span>}
                    </div>
                    {r.description && <p className="text-gray-400 text-sm mt-1">{r.description}</p>}
                    {r.nextAppointment && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                        🗓️ Temujanji: {formatDate(r.nextAppointment)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
