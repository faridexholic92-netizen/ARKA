"use client";
import { useEffect, useState } from "react";
import { toast } from "@/components/Toast";
import { useAuthStore } from "@/store/authStore";
import { getChildren } from "@/services/childService";
import { getAchievements, addAchievement, deleteAchievement, categoryLabels, categoryColors } from "@/services/achievementService";
import { Child, Achievement } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2),
  category: z.enum(["academic", "sports", "arts", "religion", "competition", "award"]),
  description: z.string().optional(),
  score: z.string().optional(),
  recordDate: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

const categoryEmojis: Record<string, string> = {
  academic: "📚", sports: "⚽", arts: "🎨", religion: "🌙", competition: "🏆", award: "🥇",
};

export default function AchievementsPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [records, setRecords] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: "academic", recordDate: new Date().toISOString().split("T")[0] },
  });

  useEffect(() => {
    if (user) getChildren(user.id).then((d) => { setChildren(d); if (d.length) setSelectedChild(d[0].id); });
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      setLoading(true);
      getAchievements(selectedChild).then((d) => { setRecords(d); setLoading(false); });
    }
  }, [selectedChild]);

  const onSubmit = async (data: FormData) => {
    const rec = await addAchievement(selectedChild, data);
    setRecords((prev) => [rec, ...prev]);
    reset({ category: "academic", recordDate: new Date().toISOString().split("T")[0] });
    setShowForm(false);
    toast.success("Pencapaian berjaya direkodkan! 🏆");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Padam pencapaian ini?")) return;
    await deleteAchievement(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    toast.info("Pencapaian dipadam.");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pencapaian</h1>
          <p className="text-gray-500 mt-1">Rekod kejayaan dan pencapaian anak</p>
        </div>
        {selectedChild && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Tambah Pencapaian
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

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Pencapaian Baru</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tajuk *</label>
              <input {...register("title")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Tempat 1 Pertandingan Melukis" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select {...register("category")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {Object.entries(categoryLabels).map(([v, l]) => (
                  <option key={v} value={v}>{categoryEmojis[v]} {l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Markah / Gred</label>
              <input {...register("score")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="A+, 95, Tempat 1..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh</label>
              <input {...register("recordDate")} type="date" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
              <input {...register("description")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Penerangan tambahan..." />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm">Batal</button>
            <button type="submit" className="gradient-primary text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition">Simpan</button>
          </div>
        </form>
      )}

      {/* Records */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Memuatkan...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-gray-500 font-medium">Belum ada pencapaian direkodkan</p>
          <p className="text-gray-400 text-sm mt-1">Rekod pencapaian pertama anak anda!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{categoryEmojis[r.category]}</div>
                <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600 transition p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{r.title}</h3>
              {r.description && <p className="text-gray-500 text-sm mb-2">{r.description}</p>}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[r.category]}`}>
                  {categoryLabels[r.category]}
                </span>
                {r.score && <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">⭐ {r.score}</span>}
              </div>
              <p className="text-gray-400 text-xs mt-3">{formatDate(r.recordDate)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
