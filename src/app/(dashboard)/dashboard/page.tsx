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
import { Users, TrendingUp, CalendarCheck, Trophy, Plus, ArrowRight, Heart, UserRound } from "lucide-react";
import { calculateAge } from "@/lib/utils";
import { OnboardingModal } from "@/components/OnboardingModal";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Selamat Pagi", emoji: "☀️" };
  if (h < 15) return { text: "Selamat Tengahari", emoji: "🌤️" };
  if (h < 19) return { text: "Selamat Petang", emoji: "🌇" };
  return { text: "Selamat Malam", emoji: "🌙" };
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded-xl w-48 mb-2" />
      <div className="h-4 bg-gray-100 rounded-xl w-64" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ growth: 0, attendance: 0, achievements: 0, health: 0, attendancePct: 0 });
  const greeting = getGreeting();

  useEffect(() => {
    if (!user) return;
    getChildren(user.id).then(async (kids) => {
      setChildren(kids);
      const allStats = await Promise.all(
        kids.map(async (child) => {
          const [growth, attendance, achievements, health] = await Promise.all([
            getGrowthRecords(child.id),
            getAttendance(child.id),
            getAchievements(child.id),
            getHealthRecords(child.id),
          ]);
          const aStat = getAttendanceStats(attendance);
          return { growth: growth.length, attendance: attendance.length, achievements: achievements.length, health: health.length, attendancePct: aStat.percentage };
        })
      );
      const totals = allStats.reduce(
        (acc, s) => ({ growth: acc.growth + s.growth, attendance: acc.attendance + s.attendance, achievements: acc.achievements + s.achievements, health: acc.health + s.health, attendancePct: acc.attendancePct + s.attendancePct }),
        { growth: 0, attendance: 0, achievements: 0, health: 0, attendancePct: 0 }
      );
      const avgPct = allStats.length > 0 ? Math.round(totals.attendancePct / allStats.length) : 0;
      setStats({ ...totals, attendancePct: avgPct });
      setLoading(false);
    });
  }, [user]);

  const statCards = [
    { label: "Jumlah Anak",       value: children.length,                      icon: Users,         color: "bg-blue-500",    href: "/children" },
    { label: "Rekod Tumbesaran",   value: loading ? "..." : stats.growth,       icon: TrendingUp,    color: "bg-emerald-500", href: "/growth" },
    { label: "Kehadiran",          value: loading ? "..." : `${stats.attendancePct}%`, icon: CalendarCheck, color: "bg-orange-500",  href: "/attendance" },
    { label: "Pencapaian",         value: loading ? "..." : stats.achievements, icon: Trophy,        color: "bg-yellow-500",  href: "/achievements" },
    { label: "Rekod Kesihatan",    value: loading ? "..." : stats.health,       icon: Heart,         color: "bg-rose-500",    href: "/health" },
  ];

  return (
    <div>
      {/* Onboarding — only shows for new users */}
      {!loading && children.length === 0 && <OnboardingModal />}

      {/* Greeting */}
      <div className="mb-6">
        {loading ? <Skeleton /> : (
          <>
            <h1 className="text-2xl font-bold text-gray-800">
              {greeting.text}, {user?.name?.split(" ")[0]}! {greeting.emoji}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {children.length === 0
                ? "Mulakan dengan menambah profil anak pertama anda."
                : `Anda memantau ${children.length} anak. Teruskan kerja yang baik!`}
            </p>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover cursor-pointer">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Children */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800">Senarai Anak</h2>
          <Link href="/children/add" className="flex items-center gap-1.5 gradient-primary text-white px-3.5 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Tambah
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-2xl">
                <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : children.length === 0 ? (
          <div className="text-center py-10">
            <div className="flex justify-center mb-3"><div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center"><UserRound className="w-7 h-7 text-gray-400" /></div></div>
            <p className="text-gray-500 font-medium">Belum ada profil anak</p>
            <p className="text-gray-400 text-sm mt-1">Tambah profil anak pertama anda</p>
            <Link href="/children/add" className="inline-flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl mt-4 font-medium hover:opacity-90 transition text-sm">
              <Plus className="w-4 h-4" /> Tambah Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {children.map((child) => (
              <Link key={child.id} href={`/children/${child.id}`}>
                <div className="border border-gray-100 rounded-2xl p-4 card-hover cursor-pointer flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {child.photo
                      ? <img src={child.photo} alt={child.fullName} className="object-cover w-full h-full" />
                      : <span className="text-2xl">{child.gender === "male" ? "👦" : "👧"}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{child.fullName}</p>
                    <p className="text-gray-500 text-sm">{child.nickname ? `"${child.nickname}" · ` : ""}{calculateAge(child.birthDate)}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
