"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { logoutUser } from "@/services/authService";
import {
  LayoutDashboard, Users, TrendingUp, CalendarCheck,
  Trophy, LogOut, Menu, X, Heart, Search, BarChart2,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useState } from "react";
import Image from "next/image";

const navItems = [
  { href: "/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { href: "/children",     icon: Users,           label: "Profil Anak" },
  { href: "/growth",       icon: TrendingUp,      label: "Perkembangan" },
  { href: "/health",       icon: Heart,           label: "Kesihatan" },
  { href: "/attendance",   icon: CalendarCheck,   label: "Kehadiran" },
  { href: "/achievements", icon: Trophy,          label: "Pencapaian" },
  { href: "/stats",        icon: BarChart2,        label: "Statistik" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    logout();
    router.push("/login");
  };

  function openSearch() {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
            <Image src="/logo.png" alt="ARKA Logo" width={48} height={48} className="object-contain" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">ARKA</h1>
            <p className="text-blue-300 text-xs">Arkib Rekod Kanak-Kanak</p>
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={openSearch}
          className="mt-3 w-full flex items-center gap-2 bg-white/10 hover:bg-white/20 text-blue-200 px-3 py-2 rounded-xl text-xs transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Cari...</span>
          <kbd className="ml-auto bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                active
                  ? "bg-white text-blue-800 shadow-md"
                  : "text-blue-100 hover:bg-blue-700 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-blue-700">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-blue-300 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
        <ThemeSwitcher />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-blue-200 hover:text-white text-sm px-2 py-2 rounded-lg hover:bg-blue-700 transition w-full"
        >
          <LogOut className="w-4 h-4" />
          Log Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-800 text-white p-2 rounded-xl shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "lg:hidden fixed left-0 top-0 h-full w-72 gradient-primary z-50 transform transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      <aside className="hidden lg:flex lg:flex-col lg:w-64 gradient-primary fixed h-full left-0 top-0 z-40">
        <SidebarContent />
      </aside>
    </>
  );
}
