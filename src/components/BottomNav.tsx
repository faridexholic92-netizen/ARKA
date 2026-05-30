"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, TrendingUp, Heart, Trophy, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard",    icon: LayoutDashboard, label: "Home" },
  { href: "/children",     icon: Users,           label: "Anak" },
  { href: "/growth",       icon: TrendingUp,      label: "Tumbesaran" },
  { href: "/health",       icon: Heart,           label: "Kesihatan" },
  { href: "/achievements", icon: Trophy,          label: "Pencapaian" },
  { href: "/stats",        icon: BarChart2,        label: "Statistik" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg print-hide">
      <div className="flex items-center justify-around px-1 py-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all",
                active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className={cn("p-1.5 rounded-xl transition-all", active ? "bg-blue-50" : "")}>
                <item.icon className={cn("w-5 h-5", active ? "stroke-[2.5px]" : "")} />
              </div>
              <span className={cn("text-[9px] font-medium", active ? "text-blue-600" : "text-gray-400")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
