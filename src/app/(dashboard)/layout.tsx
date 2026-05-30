"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { ToastContainer } from "@/components/Toast";
import { GlobalSearch } from "@/components/GlobalSearch";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-primary">
        <div className="text-center text-white">
          <div className="mb-4 flex justify-center">
            <Image src="/logo.png" alt="ARKA" width={100} height={100} className="object-contain animate-pulse drop-shadow-xl" />
          </div>
          <p className="text-blue-200 text-sm mt-2">Memuatkan ARKA...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="pt-16 px-4 pb-24 lg:pt-8 lg:px-8 lg:pb-8">{children}</div>
      </main>
      <BottomNav />
      <ToastContainer />
      <GlobalSearch />
    </div>
  );
}
