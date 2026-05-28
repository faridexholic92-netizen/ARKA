"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getChildren } from "@/services/childService";
import { getGrowthRecords } from "@/services/growthService";
import { getAttendance, getAttendanceStats } from "@/services/attendanceService";
import { getAchievements } from "@/services/achievementService";
import { getHealthRecords } from "@/services/healthService";
import { Child } from "@/types";
import Link from "next/link";
import { Users, TrendingUp, CalendarCheck, Trophy, Plus, ArrowRight, Heart } from "lucide-react";
import { calculateAge, formatDate } from "@/lib/utils";


export default function DashboardPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ growth: 0, attendance: 0, achievements: 0, health: 0, attendancePct: 0 });

  useEffect(() => {
    if (!user) return;
    getChildren(user.id).then(async (kids) => {
      setChildren(kids);

      // fetch counts for all children in parallel
      const allStats = await Promise.all(
        kids.map(async (child) => {
          const [growth, attendance, achievements, health] = await Promise.all([
            getGrowthRecords(child.id),
            getAttendance(child.id),
            getAchievements(child.id),
            getHealthRecords(child.id),
          ]);
          const aStat = getAttendanceStats(attendance);
          return {
            growth: growth.length,
            attendance: attendance.length,
            achievements: achievements.length,
            health: health.length,
            attendancePct: aStat.percentage,
          };
        })
      );

      const totals = allStats.reduce(
        (acc, s) => ({
          growth: acc.growth + s.growth,
          attendance: acc.attendance + s.attendance,
          achievements: acc.achievements + s.achievements,
          health: acc.health + s.health,
          attendancePct: acc.attendancePct + s.attendancePct,
        }),
        { growth: 0, attendance: 0, achievements: 0, health: 0, attendancePct: 0 }
      );

      const avgPct = allStats.length > 0 ? Math.round(totals.attendancePct / allStats.length) : 0;
      setStats({ ...totals, attendancePct: avgPct });
      setLoading(false);
    });
  }, [user]);

  const statCards = [
    { label: "Jumlah Anak", value: children.length, icon: Users, color: "bg-blue-500", href: "/children" },
    { label: "Rekod Perkembangan", value: loading ? "..." : stats.growth, icon: TrendingUp, color: "bg-emerald-500", href: "/growth" },
    { label: "Kehadiran", value: loading ? "..." : `${stats.attendancePct}%`, icon: CalendarCheck, color: "bg-orange-500", href: "/attendance" },
    { label: "Pencapaian", value: loading ? "..." : stats.achievements, icon: Trophy, color: "bg-yellow-500", href: "/achievements" },
    { label: "Rekod Kesihatan", value: loading ? "..." : stats.health, icon: Heart, color: "bg-rose-500", href: "/health" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Selamat datang, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Pantau perkembangan anak anda di sini.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover cursor-pointer">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Children */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">Senarai Anak</h2>
          <Link
            href="/children/add"
            className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" /> Tambah Anak
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuatkan...</div>
        ) : children.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👶</div>
            <p className="text-gray-500 font-medium">Belum ada profil anak ditambah</p>
            <p className="text-gray-400 text-sm mt-1">Mula dengan menambah profil anak pertama anda</p>
            <Link
              href="/children/add"
              className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl mt-4 font-medium hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" /> Tambah Anak Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <Link key={child.id} href={`/children/${child.id}`}>
                <div className="border border-gray-100 rounded-2xl p-5 card-hover cursor-pointer bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden">
                      {child.photo ? (
                        <img src={child.photo} alt={child.fullName} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-2xl">{child.gender === "male" ? "👦" : "👧"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{child.fullName}</p>
                      <p className="text-gray-500 text-sm">{child.nickname && `"${child.nickname}" • `}{calculateAge(child.birthDate)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{child.gender === "male" ? "Lelaki" : "Perempuan"}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
