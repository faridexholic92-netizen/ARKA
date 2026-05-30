"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  email: z.string().email("Email tidak sah"),
  password: z.string().min(6, "Kata laluan minimum 6 aksara"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
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
      const user = await loginUser(data.email, data.password);
      setUser(user);
      router.push("/dashboard");
    } catch (e: any) {
      setError("Email atau kata laluan tidak sah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-center items-center text-white p-12">
        <div className="mb-6">
          <Image src="/logo.png" alt="ARKA Logo" width={160} height={160} className="object-contain drop-shadow-xl" />
        </div>
        <h1 className="text-5xl font-bold mb-3">ARKA</h1>
        <p className="text-xl text-blue-200 text-center max-w-sm">
          Arkib Rekod Kanak-Kanak
        </p>
        <p className="text-blue-300 text-center max-w-sm mt-4 text-sm leading-relaxed">
          Platform digital untuk memantau pertumbuhan dan perkembangan anak anda secara sistematik.
        </p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Image src="/logo.png" alt="ARKA Logo" width={90} height={90} className="object-contain mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-blue-800">ARKA</h1>
            <p className="text-gray-500 text-sm">Arkib Rekod Kanak-Kanak</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang</h2>
          <p className="text-gray-500 mb-8">Log masuk ke akaun anda</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="nama@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Laluan</label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Lupa kata laluan?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Log Masuk"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Belum ada akaun?{" "}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
