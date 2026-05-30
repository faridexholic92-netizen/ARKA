"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getChild } from "@/services/childService";
import { getGrowthRecords, getBMICategory } from "@/services/growthService";
import { getAttendance, getAttendanceStats } from "@/services/attendanceService";
import { getAchievements, categoryLabels, categoryColors } from "@/services/achievementService";
import { getHealthRecords, categoryConfig } from "@/services/healthService";
import { Child, GrowthRecord, AttendanceRecord, Achievement, HealthRecord } from "@/types";
import { calculateAge, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Edit2, TrendingUp, CalendarCheck, Trophy, Heart, User } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Tab = "info" | "growth" | "health" | "attendance" | "achievements";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "info", label: "Profil", icon: <User className="w-4 h-4" /> },
  { id: "growth", label: "Perkembangan", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "health", label: "Kesihatan", icon: <Heart className="w-4 h-4" /> },
  { id: "attendance", label: "Kehadiran", icon: <CalendarCheck className="w-4 h-4" /> },
  { id: "achievements", label: "Pencapaian", icon: <Trophy className="w-4 h-4" /> },
];

const statusConfig = {
  present:   { label: "Hadir",         color: "bg-green-100 text-green-700",   emoji: "✅" },
  absent:    { label: "Tidak Hadir",   color: "bg-red-100 text-red-700",       emoji: "❌" },
  sick:      { label: "Sakit",         color: "bg-yellow-100 text-yellow-700", emoji: "🤒" },
  holiday:   { label: "Cuti",          color: "bg-blue-100 text-blue-700",     emoji: "🏖️" },
  "half-day":{ label: "Separuh Hari",  color: "bg-purple-100 text-purple-700", emoji: "⏰" },
};

const categoryEmojis: Record<string, string> = {
  academic: "📚", sports: "⚽", arts: "🎨", religion: "🌙", competition: "🏆", award: "🥇",
};

function InfoRow({ label, value, href }: { label: string; value?: string; href?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase font-medium tracking-wide">{label}</p>
      {href ? (
        <a href={href} className="text-blue-600 font-medium mt-0.5 block">{value}</a>
      ) : (
        <p className="text-gray-700 font-medium mt-0.5">{value}</p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border p-6">
      <h3 className="font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [loadingChild, setLoadingChild] = useState(true);

  const [growth, setGrowth] = useState<GrowthRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    getChild(id).then((d) => { setChild(d); setLoadingChild(false); });
  }, [id]);

  useEffect(() => {
    if (!child || dataLoaded) return;
    Promise.all([
      getGrowthRecords(child.id),
      getAttendance(child.id),
      getAchievements(child.id),
      getHealthRecords(child.id),
    ]).then(([g, a, ach, h]) => {
      setGrowth(g);
      setAttendance(a);
      setAchievements(ach);
      setHealthRecords(h);
      setDataLoaded(true);
    });
  }, [child, dataLoaded]);

  if (loadingChild) return <div className="text-center py-16 text-gray-400">Memuatkan...</div>;
  if (!child) return <div className="text-center py-16 text-gray-400">Profil tidak ditemui</div>;

  const latestGrowth = growth[growth.length - 1];
  const aStat = getAttendanceStats(attendance);

  const fullAddress = [child.address, child.postcode && child.city ? `${child.postcode} ${child.city}` : (child.postcode || child.city), child.state].filter(Boolean).join(", ");

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/children" className="p-2 rounded-xl hover:bg-gray-100 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Profil Anak</h1>
        </div>
        <Link href={`/children/${id}/edit`} className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition">
          <Edit2 className="w-4 h-4" /> Edit
        </Link>
      </div>

      {/* Profile Hero */}
      <div className="bg-white rounded-2xl border overflow-hidden mb-4">
        <div className="h-24 gradient-primary" />
        <div className="px-5 pb-5">
          <div className="-mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white bg-blue-100 overflow-hidden flex items-center justify-center shadow-md">
              {child.photo
                ? <img src={child.photo} alt={child.fullName} className="object-cover w-full h-full" />
                : <span className="text-3xl">{child.gender === "male" ? "👦" : "👧"}</span>}
            </div>
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 leading-snug">{child.fullName}</h2>
            {child.nickname && <p className="text-gray-400 text-sm mt-0.5">"{child.nickname}"</p>}
            {child.icNumber && (
              <p className="text-gray-500 text-sm mt-1 font-mono">🪪 {child.icNumber}</p>
            )}
          </div>
          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Rekod",       value: growth.length,             color: "text-emerald-600" },
              { label: "Kehadiran",   value: `${aStat.percentage}%`,   color: "text-orange-500" },
              { label: "Pencapaian",  value: achievements.length,       color: "text-yellow-500" },
              { label: "Kesihatan",   value: healthRecords.length,      color: "text-rose-500" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-2xl border p-1.5 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id ? "gradient-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: PROFIL ── */}
      {activeTab === "info" && (
        <div className="space-y-4">

          {/* Maklumat Asas */}
          <Section title="👤 Maklumat Asas">
            <InfoRow label="Tarikh Lahir" value={formatDate(child.birthDate)} />
            <InfoRow label="Umur" value={calculateAge(child.birthDate)} />
            <InfoRow label="Jantina" value={child.gender === "male" ? "Lelaki" : "Perempuan"} />
            <InfoRow label="Kumpulan Darah" value={child.bloodType} />
          </Section>

          {/* Maklumat Rasmi */}
          {(child.icNumber || child.birthCertNo || child.passportNo || child.birthPlace || child.nationality || child.race || child.religion) && (
            <Section title="🪪 Maklumat Rasmi">
              <InfoRow label="No. MyKid / IC" value={child.icNumber} />
              <InfoRow label="No. Sijil Kelahiran" value={child.birthCertNo} />
              <InfoRow label="No. Passport" value={child.passportNo} />
              <InfoRow label="Tempat Lahir" value={child.birthPlace} />
              <InfoRow label="Kerakyatan" value={child.nationality} />
              <InfoRow label="Bangsa" value={child.race} />
              <InfoRow label="Agama" value={child.religion} />
            </Section>
          )}

          {/* Alamat */}
          {fullAddress && (
            <div className="bg-white rounded-2xl border p-6">
              <h3 className="font-semibold text-gray-700 mb-4">🏠 Alamat</h3>
              <p className="text-gray-700 font-medium leading-relaxed">{fullAddress}</p>
            </div>
          )}

          {/* Sekolah */}
          {(child.schoolName || child.schoolYear || child.schoolClass) && (
            <Section title="🏫 Sekolah / Tadika">
              <div className="col-span-2">
                <InfoRow label="Nama Sekolah" value={child.schoolName} />
              </div>
              <InfoRow label="Darjah / Tahun" value={child.schoolYear} />
              <InfoRow label="Kelas" value={child.schoolClass} />
            </Section>
          )}

          {/* Maklumat Bapa */}
          {(child.fatherName || child.fatherIc || child.fatherPhone || child.fatherJob) && (
            <Section title="👨 Maklumat Bapa">
              <div className="col-span-2">
                <InfoRow label="Nama" value={child.fatherName} />
              </div>
              <InfoRow label="No. Kad Pengenalan" value={child.fatherIc} />
              <InfoRow label="Pekerjaan" value={child.fatherJob} />
              <InfoRow label="No. Telefon" value={child.fatherPhone} href={child.fatherPhone ? `tel:${child.fatherPhone}` : undefined} />
            </Section>
          )}

          {/* Maklumat Ibu */}
          {(child.motherName || child.motherIc || child.motherPhone || child.motherJob) && (
            <Section title="👩 Maklumat Ibu">
              <div className="col-span-2">
                <InfoRow label="Nama" value={child.motherName} />
              </div>
              <InfoRow label="No. Kad Pengenalan" value={child.motherIc} />
              <InfoRow label="Pekerjaan" value={child.motherJob} />
              <InfoRow label="No. Telefon" value={child.motherPhone} href={child.motherPhone ? `tel:${child.motherPhone}` : undefined} />
            </Section>
          )}

          {/* Kenalan Kecemasan */}
          {(child.emergencyContact || child.emergencyPhone) && (
            <Section title="🚨 Kenalan Kecemasan">
              <InfoRow label="Nama" value={child.emergencyContact} />
              <InfoRow label="Telefon" value={child.emergencyPhone} href={child.emergencyPhone ? `tel:${child.emergencyPhone}` : undefined} />
            </Section>
          )}

          {/* Nota Perubatan */}
          {child.medicalNotes && (
            <div className="bg-white rounded-2xl border p-6">
              <h3 className="font-semibold text-gray-700 mb-2">📋 Nota Perubatan</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{child.medicalNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: PERKEMBANGAN ── */}
      {activeTab === "growth" && (
        <div className="space-y-4">
          {!dataLoaded ? (
            <div className="text-center py-12 text-gray-400">Memuatkan...</div>
          ) : growth.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border">
              <div className="text-5xl mb-4">📏</div>
              <p className="text-gray-500 font-medium">Belum ada rekod perkembangan</p>
              <Link href="/growth" className="inline-flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl mt-4 text-sm font-medium hover:opacity-90 transition">
                Tambah Rekod
              </Link>
            </div>
          ) : (
            <>
              {latestGrowth && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Berat",  value: `${latestGrowth.weight} kg`, icon: "⚖️" },
                    { label: "Tinggi", value: `${latestGrowth.height} cm`, icon: "📏" },
                    { label: "BMI",    value: latestGrowth.bmi.toString(), icon: "📊" },
                    { label: "Kepala", value: latestGrowth.headSize ? `${latestGrowth.headSize} cm` : "—", icon: "🧠" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border p-4 text-center">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <p className="text-xl font-bold text-gray-800">{s.value}</p>
                      <p className="text-sm text-gray-500">{s.label}</p>
                      {s.label === "BMI" && (
                        <p className={`text-xs font-medium mt-0.5 ${getBMICategory(latestGrowth.bmi).color}`}>
                          {getBMICategory(latestGrowth.bmi).label}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {growth.length > 1 && (
                <div className="bg-white rounded-2xl border p-5">
                  <h3 className="font-semibold text-gray-700 mb-4">Carta Perkembangan</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={growth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="recordDate" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#3B82F6" name="Berat (kg)" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="height" stroke="#10B981" name="Tinggi (cm)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-white rounded-2xl border overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-700">Sejarah Rekod</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>{["Tarikh","Berat","Tinggi","BMI"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[...growth].reverse().map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(r.recordDate)}</td>
                          <td className="px-4 py-3 text-sm font-medium">{r.weight} kg</td>
                          <td className="px-4 py-3 text-sm font-medium">{r.height} cm</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`font-medium ${getBMICategory(r.bmi).color}`}>{r.bmi}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: KESIHATAN ── */}
      {activeTab === "health" && (
        <div className="space-y-3">
          {!dataLoaded ? (
            <div className="text-center py-12 text-gray-400">Memuatkan...</div>
          ) : healthRecords.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border">
              <div className="text-5xl mb-4">❤️</div>
              <p className="text-gray-500 font-medium">Belum ada rekod kesihatan</p>
              <Link href="/health" className="inline-flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl mt-4 text-sm font-medium hover:opacity-90 transition">
                Tambah Rekod
              </Link>
            </div>
          ) : healthRecords.map((r) => {
            const cat = categoryConfig[r.category];
            return (
              <div key={r.id} className="bg-white rounded-2xl border p-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gray-50 border flex items-center justify-center text-xl flex-shrink-0">{cat.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800">{r.title}</h4>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${cat.color}`}>{cat.label}</span>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>📅 {formatDate(r.recordDate)}</span>
                      {r.hospital && <span>🏥 {r.hospital}</span>}
                      {r.doctor && <span>👨‍⚕️ {r.doctor}</span>}
                    </div>
                    {r.nextAppointment && (
                      <div className="mt-1.5 inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                        🗓️ Temujanji: {formatDate(r.nextAppointment)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB: KEHADIRAN ── */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          {!dataLoaded ? (
            <div className="text-center py-12 text-gray-400">Memuatkan...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Jumlah",       value: aStat.total,               emoji: "📋" },
                  { label: "Hadir",        value: aStat.present,             emoji: "✅" },
                  { label: "Tidak Hadir",  value: aStat.absent,              emoji: "❌" },
                  { label: "% Kehadiran",  value: `${aStat.percentage}%`,   emoji: "📊" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border p-4 text-center">
                    <div className="text-xl mb-1">{s.emoji}</div>
                    <p className="text-xl font-bold text-gray-800">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
              {attendance.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border">
                  <p className="text-gray-400">Belum ada rekod kehadiran</p>
                  <Link href="/attendance" className="inline-flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl mt-4 text-sm font-medium hover:opacity-90 transition">
                    Tambah Rekod
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>{["Tarikh","Status","Nota"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {attendance.slice(0, 20).map((r) => {
                          const st = statusConfig[r.status];
                          return (
                            <tr key={r.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-600">{formatDate(r.attendanceDate)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.emoji} {st.label}</span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-400">{r.notes || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB: PENCAPAIAN ── */}
      {activeTab === "achievements" && (
        <div>
          {!dataLoaded ? (
            <div className="text-center py-12 text-gray-400">Memuatkan...</div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-gray-500 font-medium">Belum ada pencapaian</p>
              <Link href="/achievements" className="inline-flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl mt-4 text-sm font-medium hover:opacity-90 transition">
                Tambah Pencapaian
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border p-5">
                  <div className="text-3xl mb-2">{categoryEmojis[r.category]}</div>
                  <h3 className="font-bold text-gray-800">{r.title}</h3>
                  {r.description && <p className="text-gray-500 text-sm mt-1">{r.description}</p>}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[r.category]}`}>{categoryLabels[r.category]}</span>
                    {r.score && <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">⭐ {r.score}</span>}
                  </div>
                  <p className="text-gray-400 text-xs mt-3">{formatDate(r.recordDate)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
