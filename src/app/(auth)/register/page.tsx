"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerUser } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  name: z.string().min(2, "Nama minimum 2 aksara"),
  email: z.string().email("Email tidak sah"),
  password: z.string().min(6, "Kata laluan minimum 6 aksara"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Kata laluan tidak sepadan",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const user = await registerUser(data.name, data.email, data.password);
      setUser(user);
      router.push("/dashboard");
    } catch (e: any) {
      if (e.code === "auth/email-already-in-use") setError("Email sudah digunakan");
      else setError("Gagal mendaftar. Cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-center items-center text-white p-12">
        <div className="mb-6">
          <Image src="/logo.png" alt="ARKA Logo" width={160} height={160} className="object-contain drop-shadow-xl" />
        </div>
        <h1 className="text-5xl font-bold mb-3">ARKA</h1>
        <p className="text-blue-200 text-center max-w-sm text-xl">Mula perjalanan digital anak anda hari ini.</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Image src="/logo.png" alt="ARKA Logo" width={90} height={90} className="object-contain mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-blue-800">ARKA</h1>
            <p className="text-gray-500 text-sm">Arkib Rekod Kanak-Kanak</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Buat Akaun Baru</h2>
          <p className="text-gray-500 mb-8">Daftar sebagai ibu bapa / penjaga</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {[
              { name: "name",            label: "Nama Penuh",         type: "text",     placeholder: "Nama anda" },
              { name: "email",           label: "Email",              type: "email",    placeholder: "nama@email.com" },
              { name: "password",        label: "Kata Laluan",        type: "password", placeholder: "••••••••" },
              { name: "confirmPassword", label: "Sahkan Kata Laluan", type: "password", placeholder: "••••••••" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  {...register(field.name as any)}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {errors[field.name as keyof FormData] && (
                  <p className="text-red-500 text-xs mt-1">{errors[field.name as keyof FormData]?.message}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Sudah ada akaun?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Log Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
