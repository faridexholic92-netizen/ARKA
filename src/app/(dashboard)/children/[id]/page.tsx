"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getChild } from "@/services/childService";
import { Child } from "@/types";
import { calculateAge, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Edit2 } from "lucide-react";
import Image from "next/image";

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChild(id).then((d) => { setChild(d); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-center py-16 text-gray-400">Memuatkan...</div>;
  if (!child) return <div className="text-center py-16 text-gray-400">Profil tidak ditemui</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/children" className="p-2 rounded-xl hover:bg-gray-100 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Profil Anak</h1>
        </div>
        <Link
          href={`/children/${id}/edit`}
          className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition"
        >
          <Edit2 className="w-4 h-4" /> Edit
        </Link>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border overflow-hidden mb-6">
        <div className="h-32 gradient-primary" />
        <div className="px-6 pb-6">
          <div className="-mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white bg-blue-100 overflow-hidden flex items-center justify-center shadow-md">
              {child.photo ? (
                <Image src={child.photo} alt={child.fullName} width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <span className="text-3xl">{child.gender === "male" ? "👦" : "👧"}</span>
              )}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">{child.fullName}</h2>
          {child.nickname && <p className="text-gray-400">"{child.nickname}"</p>}
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl border p-6 mb-4">
        <h3 className="font-semibold text-gray-700 mb-4">Maklumat Asas</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Tarikh Lahir", value: formatDate(child.birthDate) },
            { label: "Umur", value: calculateAge(child.birthDate) },
            { label: "Jantina", value: child.gender === "male" ? "Lelaki" : "Perempuan" },
            { label: "Kumpulan Darah", value: child.bloodType || "—" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-400 uppercase font-medium">{item.label}</p>
              <p className="text-gray-700 font-medium mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {child.emergencyContact && (
        <div className="bg-white rounded-2xl border p-6 mb-4">
          <h3 className="font-semibold text-gray-700 mb-4">Kenalan Kecemasan</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Nama</p>
              <p className="text-gray-700 font-medium mt-0.5">{child.emergencyContact}</p>
            </div>
            {child.emergencyPhone && (
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium">Telefon</p>
                <p className="text-gray-700 font-medium mt-0.5">{child.emergencyPhone}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {child.medicalNotes && (
        <div className="bg-white rounded-2xl border p-6 mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Nota Perubatan</h3>
          <p className="text-gray-600 text-sm">{child.medicalNotes}</p>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: "/growth", label: "📈 Perkembangan" },
          { href: "/attendance", label: "📋 Kehadiran" },
          { href: "/achievements", label: "🏆 Pencapaian" },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="bg-white border rounded-2xl p-4 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 card-hover transition">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
