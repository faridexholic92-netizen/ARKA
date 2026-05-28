"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import { addChild, uploadChildPhoto, updateChild } from "@/services/childService";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  fullName: z.string().min(2, "Nama minimum 2 aksara"),
  nickname: z.string().optional(),
  birthDate: z.string().min(1, "Tarikh lahir diperlukan"),
  gender: z.enum(["male", "female"]),
  bloodType: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  medicalNotes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddChildPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "male" },
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const child = await addChild(user.id, data);
      if (photoFile) {
        const url = await uploadChildPhoto(child.id, photoFile);
        await updateChild(child.id, { photo: url });
      }
      router.push("/children");
    } catch (e: any) {
      console.error("Upload error:", e);
      setError(`Gagal menyimpan: ${e?.message || "Cuba lagi."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/children" className="p-2 rounded-xl hover:bg-gray-100 transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tambah Profil Anak</h1>
          <p className="text-gray-500 text-sm mt-0.5">Isikan maklumat anak anda</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Photo */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Foto Anak</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">👶</span>
              )}
            </div>
            <label className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl cursor-pointer transition border text-sm font-medium">
              <Upload className="w-4 h-4" />
              Muat Naik Foto
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <h2 className="font-semibold text-gray-700">Maklumat Asas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penuh *</label>
              <input {...register("fullName")} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama penuh anak" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panggilan</label>
              <input {...register("nickname")} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama panggilan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Lahir *</label>
              <input {...register("birthDate")} type="date" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jantina *</label>
              <select {...register("gender")} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="male">Lelaki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kumpulan Darah</label>
              <select {...register("bloodType")} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Tidak pasti</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Emergency */}
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Kenalan Kecemasan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <input {...register("emergencyContact")} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama kenalan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Telefon</label>
              <input {...register("emergencyPhone")} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="01x-xxxxxxx" />
            </div>
          </div>
        </div>

        {/* Medical */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Nota Perubatan</h2>
          <textarea {...register("medicalNotes")} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Alahan, penyakit kronik, nota khas..." />
        </div>

        <div className="flex gap-3">
          <Link href="/children" className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-center hover:bg-gray-50 transition">
            Batal
          </Link>
          <button type="submit" disabled={loading} className="flex-1 gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60 transition">
            {loading ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </form>
    </div>
  );
}
