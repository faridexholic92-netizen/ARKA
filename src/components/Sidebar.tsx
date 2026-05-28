"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { logoutUser } from "@/services/authService";
import {
  LayoutDashboard, Users, TrendingUp, CalendarCheck,
  Trophy, LogOut, Menu, X, Star, Heart,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/children", icon: Users, label: "Profil Anak" },
  { href: "/growth", icon: TrendingUp, label: "Perkembangan" },
  { href: "/health", icon: Heart, label: "Kesihatan" },
  { href: "/attendance", icon: CalendarCheck, label: "Kehadiran" },
  { href: "/achievements", icon: Trophy, label: "Pencapaian" },
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">ARKA</h1>
            <p className="text-blue-300 text-xs">Arkib Rekod Kanak-Kanak</p>
          </div>
        </div>
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
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-800 text-white p-2 rounded-xl shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "lg:hidden fixed left-0 top-0 h-full w-72 gradient-primary z-50 transform transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 gradient-primary fixed h-full left-0 top-0 z-40">
        <SidebarContent />
      </aside>
    </>
  );
}
