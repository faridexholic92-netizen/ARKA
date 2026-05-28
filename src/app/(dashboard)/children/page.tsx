"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getChildren, deleteChild } from "@/services/childService";
import { Child } from "@/types";
import Link from "next/link";
import { Plus, Trash2, Eye, Search } from "lucide-react";
import { calculateAge } from "@/lib/utils";


export default function ChildrenPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user) getChildren(user.id).then((d) => { setChildren(d); setLoading(false); });
  }, [user]);

  const filtered = children.filter((c) =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Padam profil anak ini?")) return;
    await deleteChild(id);
    setChildren((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profil Anak</h1>
          <p className="text-gray-500 mt-1">Urus semua profil anak anda</p>
        </div>
        <Link href="/children/add" className="flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> Tambah Anak
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama anak..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Memuatkan...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-5xl mb-4">👶</div>
          <p className="text-gray-500 font-medium">Tiada profil anak ditemui</p>
          <Link href="/children/add" className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl mt-4 font-medium hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Tambah Anak
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((child) => (
            <div key={child.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover">
              <div className="h-24 gradient-primary flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-white bg-opacity-20 border-2 border-white overflow-hidden flex items-center justify-center">
                  {child.photo ? (
                    <img src={child.photo} alt={child.fullName} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-3xl">{child.gender === "male" ? "👦" : "👧"}</span>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-lg">{child.fullName}</h3>
                {child.nickname && <p className="text-gray-400 text-sm">"{child.nickname}"</p>}
                <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                  <p>🎂 {calculateAge(child.birthDate)}</p>
                  <p>⚧ {child.gender === "male" ? "Lelaki" : "Perempuan"}</p>
                  {child.bloodType && <p>🩸 Kumpulan darah: {child.bloodType}</p>}
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/children/${child.id}`} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 py-2 rounded-xl text-sm font-medium hover:bg-blue-100 transition">
                    <Eye className="w-4 h-4" /> Lihat
                  </Link>
                  <button onClick={() => handleDelete(child.id)} className="flex items-center justify-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
