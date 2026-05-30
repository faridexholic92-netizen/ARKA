"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { getChildren } from "@/services/childService";
import { getGrowthRecords } from "@/services/growthService";
import { getAttendance, getAttendanceStats } from "@/services/attendanceService";
import { getAchievements, categoryLabels } from "@/services/achievementService";
import { getHealthRecords, categoryConfig } from "@/services/healthService";
import { Child, GrowthRecord, AttendanceRecord, Achievement, HealthRecord } from "@/types";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { BarChart2 } from "lucide-react";

const COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#f97316","#06b6d4"];

export default function StatsPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const [growthMap, setGrowthMap] = useState<Record<string, GrowthRecord[]>>({});
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord[]>>({});
  const [achievementMap, setAchievementMap] = useState<Record<string, Achievement[]>>({});
  const [healthMap, setHealthMap] = useState<Record<string, HealthRecord[]>>({});

  useEffect(() => {
    if (!user) return;
    getChildren(user.id).then(async (kids) => {
      setChildren(kids);
      const gMap: Record<string, GrowthRecord[]> = {};
      const aMap: Record<string, AttendanceRecord[]> = {};
      const achMap: Record<string, Achievement[]> = {};
      const hMap: Record<string, HealthRecord[]> = {};
      await Promise.all(kids.map(async (kid) => {
        const [g, a, ach, h] = await Promise.all([getGrowthRecords(kid.id), getAttendance(kid.id), getAchievements(kid.id), getHealthRecords(kid.id)]);
        gMap[kid.id] = g; aMap[kid.id] = a; achMap[kid.id] = ach; hMap[kid.id] = h;
      }));
      setGrowthMap(gMap); setAttendanceMap(aMap); setAchievementMap(achMap); setHealthMap(hMap);
      setLoading(false);
    });
  }, [user]);

  // Growth chart — latest per child
  const growthChartData = useMemo(() =>
    children.map((c) => {
      const recs = growthMap[c.id] || [];
      const latest = recs[recs.length - 1];
      return { name: c.fullName.split(" ")[0], berat: latest?.weight ?? 0, tinggi: latest?.height ?? 0, bmi: latest?.bmi ?? 0 };
    }), [children, growthMap]);

  // Attendance monthly stats (all children combined)
  const attendanceMonthly = useMemo(() => {
    const monthMap: Record<string, { hadir: number; tidak: number; sakit: number }> = {};
    Object.values(attendanceMap).flat().forEach((r) => {
      const m = r.attendanceDate.substring(0, 7);
      if (!monthMap[m]) monthMap[m] = { hadir: 0, tidak: 0, sakit: 0 };
      if (r.status === "present") monthMap[m].hadir++;
      else if (r.status === "absent") monthMap[m].tidak++;
      else if (r.status === "sick") monthMap[m].sakit++;
    });
    return Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([m, v]) => ({ bulan: m, ...v }));
  }, [attendanceMap]);

  // Achievement by category
  const achCatData = useMemo(() => {
    const cats: Record<string, number> = {};
    Object.values(achievementMap).flat().forEach((r) => { cats[r.category] = (cats[r.category] || 0) + 1; });
    return Object.entries(cats).map(([cat, value]) => ({ name: categoryLabels[cat as Achievement["category"]] || cat, value }));
  }, [achievementMap]);

  // Health by category
  const healthCatData = useMemo(() => {
    const cats: Record<string, number> = {};
    Object.values(healthMap).flat().forEach((r) => { cats[r.category] = (cats[r.category] || 0) + 1; });
    return Object.entries(cats).map(([cat, value]) => ({ name: categoryConfig[cat as HealthRecord["category"]]?.label || cat, value }));
  }, [healthMap]);

  // Summary cards
  const totalGrowth = Object.values(growthMap).flat().length;
  const totalAttendance = Object.values(attendanceMap).flat().length;
  const totalAch = Object.values(achievementMap).flat().length;
  const totalHealth = Object.values(healthMap).flat().length;
  const avgAttendance = useMemo(() => {
    const all = Object.values(attendanceMap).flat();
    if (!all.length) return 0;
    return Math.round((all.filter((r) => r.status === "present").length / all.length) * 100);
  }, [attendanceMap]);

  if (loading) return <div className="text-center py-20 text-gray-400">Memuatkan statistik...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><BarChart2 className="w-7 h-7" /> Statistik & Analitik</h1>
        <p className="text-gray-500 mt-1">Gambaran keseluruhan data semua anak</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Jumlah Anak",     value: children.length,  emoji: "👶", color: "bg-blue-50 text-blue-700" },
          { label: "Rekod Tumbesaran", value: totalGrowth,      emoji: "📏", color: "bg-emerald-50 text-emerald-700" },
          { label: "Kehadiran (%)",    value: `${avgAttendance}%`, emoji: "📅", color: "bg-orange-50 text-orange-700" },
          { label: "Pencapaian",       value: totalAch,          emoji: "🏆", color: "bg-yellow-50 text-yellow-700" },
          { label: "Rekod Kesihatan",  value: totalHealth,       emoji: "❤️", color: "bg-rose-50 text-rose-700" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
            <div className="text-2xl mb-1">{s.emoji}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {children.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-gray-500">Tiada data untuk dipaparkan. Tambah anak dahulu.</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Growth comparison */}
          {growthChartData.some((d) => d.berat > 0) && (
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-1">📏 Perbandingan Berat & Tinggi (Terkini)</h3>
              <p className="text-xs text-gray-400 mb-5">Rekod terkini setiap anak</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={growthChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="berat" name="Berat (kg)" fill="#3b82f6" radius={[6,6,0,0]} />
                  <Bar dataKey="tinggi" name="Tinggi (cm)" fill="#10b981" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Attendance monthly */}
          {attendanceMonthly.length > 0 && (
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-1">📅 Kehadiran Bulanan (6 Bulan Lepas)</h3>
              <p className="text-xs text-gray-400 mb-5">Gabungan semua anak</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={attendanceMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hadir" name="Hadir" fill="#10b981" stackId="a" radius={[0,0,0,0]} />
                  <Bar dataKey="sakit" name="Sakit" fill="#f59e0b" stackId="a" />
                  <Bar dataKey="tidak" name="Tidak Hadir" fill="#ef4444" stackId="a" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Achievement breakdown */}
            {achCatData.length > 0 && (
              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-1">🏆 Pecahan Pencapaian</h3>
                <p className="text-xs text-gray-400 mb-5">Mengikut kategori</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={achCatData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                      {achCatData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Health breakdown */}
            {healthCatData.length > 0 && (
              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-1">❤️ Pecahan Rekod Kesihatan</h3>
                <p className="text-xs text-gray-400 mb-5">Mengikut kategori</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={healthCatData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="value" name="Rekod" radius={[0,6,6,0]}>
                      {healthCatData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Per-child attendance summary */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">📊 Ringkasan Kehadiran Per Anak</h3>
            <div className="space-y-3">
              {children.map((c) => {
                const st = getAttendanceStats(attendanceMap[c.id] || []);
                return (
                  <div key={c.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-lg">
                      {c.gender === "male" ? "👦" : "👧"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-700 truncate">{c.fullName}</p>
                        <p className="text-sm font-bold text-blue-600 flex-shrink-0 ml-2">{st.percentage}%</p>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full gradient-primary transition-all"
                          style={{ width: `${st.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{st.present} hadir daripada {st.total} hari</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
