"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) router.replace("/dashboard");
      else router.replace("/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🌟</div>
        <h1 className="text-3xl font-bold">ARKA</h1>
        <p className="text-blue-200 mt-2">Memuatkan...</p>
      </div>
    </div>
  );
}
