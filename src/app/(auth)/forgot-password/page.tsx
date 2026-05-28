"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPassword } from "@/services/authService";

const schema = z.object({ email: z.string().email("Email tidak sah") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch {
      setError("Gagal menghantar. Semak semula email anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-2xl font-bold text-gray-800">Lupa Kata Laluan?</h1>
          <p className="text-gray-500 mt-2 text-sm">Masukkan email anda untuk menerima pautan reset</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-green-600 font-medium">Email telah dihantar!</p>
            <p className="text-gray-500 text-sm mt-2">Semak inbox anda dan ikut arahan untuk reset kata laluan.</p>
            <Link href="/login" className="mt-6 block text-blue-600 hover:underline font-medium">Kembali ke Log Masuk</Link>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="nama@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60 transition"
              >
                {loading ? "Menghantar..." : "Hantar Pautan Reset"}
              </button>
            </form>
            <p className="text-center mt-4 text-sm text-gray-500">
              <Link href="/login" className="text-blue-600 hover:underline">Kembali ke Log Masuk</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
