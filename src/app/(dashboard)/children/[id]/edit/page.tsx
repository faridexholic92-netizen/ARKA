"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getChild, updateChild, uploadChildPhoto } from "@/services/childService";
import { toast } from "@/components/Toast";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

const STATES = ["Johor","Kedah","Kelantan","Melaka","Negeri Sembilan","Pahang","Perak","Perlis","Pulau Pinang","Sabah","Sarawak","Selangor","Terengganu","W.P. Kuala Lumpur","W.P. Labuan","W.P. Putrajaya"];
const RACES = ["Melayu","Cina","India","Iban","Kadazan","Bajau","Murut","Orang Asli","Lain-lain"];
const RELIGIONS = ["Islam","Kristian","Buddha","Hindu","Sikh","Tiada"];

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const schema = z.object({
  fullName: z.string().min(2, "Nama minimum 2 aksara"),
  nickname: z.string().optional(),
  birthDate: z.string().min(1, "Tarikh lahir diperlukan"),
  gender: z.enum(["male", "female"]),
  bloodType: z.string().optional(),
  icNumber: z.string().optional(),
  birthCertNo: z.string().optional(),
  passportNo: z.string().optional(),
  birthPlace: z.string().optional(),
  nationality: z.string().optional(),
  race: z.string().optional(),
  religion: z.string().optional(),
  address: z.string().optional(),
  postcode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  schoolName: z.string().optional(),
  schoolYear: z.string().optional(),
  schoolClass: z.string().optional(),
  fatherName: z.string().optional(),
  fatherIc: z.string().optional(),
  fatherPhone: z.string().optional(),
  fatherJob: z.string().optional(),
  motherName: z.string().optional(),
  motherIc: z.string().optional(),
  motherPhone: z.string().optional(),
  motherJob: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  medicalNotes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditChildPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    getChild(id).then((child) => {
      if (child) {
        reset({
          fullName: child.fullName,
          nickname: child.nickname || "",
          birthDate: child.birthDate,
          gender: child.gender,
          bloodType: child.bloodType || "",
          icNumber: child.icNumber || "",
          birthCertNo: child.birthCertNo || "",
          passportNo: child.passportNo || "",
          birthPlace: child.birthPlace || "",
          nationality: child.nationality || "Malaysia",
          race: child.race || "",
          religion: child.religion || "",
          address: child.address || "",
          postcode: child.postcode || "",
          city: child.city || "",
          state: child.state || "",
          schoolName: child.schoolName || "",
          schoolYear: child.schoolYear || "",
          schoolClass: child.schoolClass || "",
          fatherName: child.fatherName || "",
          fatherIc: child.fatherIc || "",
          fatherPhone: child.fatherPhone || "",
          fatherJob: child.fatherJob || "",
          motherName: child.motherName || "",
          motherIc: child.motherIc || "",
          motherPhone: child.motherPhone || "",
          motherJob: child.motherJob || "",
          emergencyContact: child.emergencyContact || "",
          emergencyPhone: child.emergencyPhone || "",
          medicalNotes: child.medicalNotes || "",
        });
        if (child.photo) setPhotoPreview(child.photo);
      }
      setFetchLoading(false);
    });
  }, [id, reset]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      await updateChild(id, data);
      if (photoFile) {
        const url = await uploadChildPhoto(id, photoFile);
        await updateChild(id, { photo: url });
      }
      toast.success("Profil berjaya dikemaskini! ✅");
      setTimeout(() => router.push(`/children/${id}`), 1000);
    } catch {
      setError("Gagal kemaskini. Cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="text-center py-16 text-gray-400">Memuatkan...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/children/${id}`} className="p-2 rounded-xl hover:bg-gray-100 transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Profil Anak</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kemaskini maklumat anak anda</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* FOTO */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-semibold text-gray-700 mb-4">📷 Foto Anak</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
              {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-4xl">👶</span>}
            </div>
            <label className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl cursor-pointer transition border text-sm font-medium">
              <Upload className="w-4 h-4" /> Tukar Foto
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          </div>
        </div>

        {/* MAKLUMAT ASAS */}
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <h2 className="font-semibold text-gray-700">👤 Maklumat Asas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nama Penuh *</label>
              <input {...register("fullName")} className={inputCls} />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Nama Panggilan</label>
              <input {...register("nickname")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tarikh Lahir *</label>
              <input {...register("birthDate")} type="date" className={inputCls} />
              {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Jantina *</label>
              <select {...register("gender")} className={inputCls}>
                <option value="male">Lelaki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Kumpulan Darah</label>
              <select {...register("bloodType")} className={inputCls}>
                <option value="">Tidak pasti</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* MAKLUMAT RASMI */}
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <h2 className="font-semibold text-gray-700">🪪 Maklumat Rasmi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>No. MyKid / No. Kad Pengenalan</label>
              <input {...register("icNumber")} className={inputCls} placeholder="000000-00-0000" maxLength={14} />
            </div>
            <div>
              <label className={labelCls}>No. Sijil Kelahiran</label>
              <input {...register("birthCertNo")} className={inputCls} placeholder="cth: B-00000000" />
            </div>
            <div>
              <label className={labelCls}>No. Passport (jika ada)</label>
              <input {...register("passportNo")} className={inputCls} placeholder="A00000000" />
            </div>
            <div>
              <label className={labelCls}>Tempat Lahir</label>
              <input {...register("birthPlace")} className={inputCls} placeholder="cth: Hospital KL" />
            </div>
            <div>
              <label className={labelCls}>Kerakyatan</label>
              <input {...register("nationality")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Bangsa</label>
              <select {...register("race")} className={inputCls}>
                <option value="">Pilih bangsa</option>
                {RACES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Agama</label>
              <select {...register("religion")} className={inputCls}>
                <option value="">Pilih agama</option>
                {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ALAMAT */}
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <h2 className="font-semibold text-gray-700">🏠 Alamat</h2>
          <div>
            <label className={labelCls}>Alamat Penuh</label>
            <textarea {...register("address")} rows={3} className={`${inputCls} resize-none`} placeholder="No. rumah, jalan, taman..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Poskod</label>
              <input {...register("postcode")} className={inputCls} placeholder="00000" maxLength={5} />
            </div>
            <div>
              <label className={labelCls}>Bandar</label>
              <input {...register("city")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Negeri</label>
              <select {...register("state")} className={inputCls}>
                <option value="">Pilih negeri</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* MAKLUMAT SEKOLAH */}
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <h2 className="font-semibold text-gray-700">🏫 Maklumat Sekolah / Tadika</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className={labelCls}>Nama Sekolah / Tadika</label>
              <input {...register("schoolName")} className={inputCls} placeholder="cth: SK Taman Jaya" />
            </div>
            <div>
              <label className={labelCls}>Darjah / Tahun</label>
              <input {...register("schoolYear")} className={inputCls} placeholder="cth: Darjah 1" />
            </div>
            <div>
              <label className={labelCls}>Kelas</label>
              <input {...register("schoolClass")} className={inputCls} placeholder="cth: Kelas Amanah" />
            </div>
          </div>
        </div>

        {/* MAKLUMAT BAPA */}
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <h2 className="font-semibold text-gray-700">👨 Maklumat Bapa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nama Penuh</label>
              <input {...register("fatherName")} className={inputCls} placeholder="Nama bapa" />
            </div>
            <div>
              <label className={labelCls}>No. Kad Pengenalan</label>
              <input {...register("fatherIc")} className={inputCls} placeholder="000000-00-0000" maxLength={14} />
            </div>
            <div>
              <label className={labelCls}>No. Telefon</label>
              <input {...register("fatherPhone")} className={inputCls} placeholder="01x-xxxxxxx" />
            </div>
            <div>
              <label className={labelCls}>Pekerjaan</label>
              <input {...register("fatherJob")} className={inputCls} placeholder="cth: Jurutera" />
            </div>
          </div>
        </div>

        {/* MAKLUMAT IBU */}
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <h2 className="font-semibold text-gray-700">👩 Maklumat Ibu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nama Penuh</label>
              <input {...register("motherName")} className={inputCls} placeholder="Nama ibu" />
            </div>
            <div>
              <label className={labelCls}>No. Kad Pengenalan</label>
              <input {...register("motherIc")} className={inputCls} placeholder="000000-00-0000" maxLength={14} />
            </div>
            <div>
              <label className={labelCls}>No. Telefon</label>
              <input {...register("motherPhone")} className={inputCls} placeholder="01x-xxxxxxx" />
            </div>
            <div>
              <label className={labelCls}>Pekerjaan</label>
              <input {...register("motherJob")} className={inputCls} placeholder="cth: Guru" />
            </div>
          </div>
        </div>

        {/* KENALAN KECEMASAN */}
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">🚨 Kenalan Kecemasan</h2>
          <p className="text-xs text-gray-400">Selain ibu bapa — cth: datuk, nenek, adik-beradik</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nama</label>
              <input {...register("emergencyContact")} className={inputCls} placeholder="Nama kenalan" />
            </div>
            <div>
              <label className={labelCls}>No. Telefon</label>
              <input {...register("emergencyPhone")} className={inputCls} placeholder="01x-xxxxxxx" />
            </div>
          </div>
        </div>

        {/* NOTA PERUBATAN */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-semibold text-gray-700 mb-4">📋 Nota Perubatan</h2>
          <textarea {...register("medicalNotes")} rows={3} className={`${inputCls} resize-none`} placeholder="Alahan, penyakit kronik, nota khas..." />
        </div>

        <div className="flex gap-3 pb-4">
          <Link href={`/children/${id}`} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-center hover:bg-gray-50 transition">
            Batal
          </Link>
          <button type="submit" disabled={loading} className="flex-1 gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60 transition">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
