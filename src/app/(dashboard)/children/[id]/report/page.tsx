"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getChild } from "@/services/childService";
import { getGrowthRecords, getBMICategory } from "@/services/growthService";
import { getAttendance, getAttendanceStats } from "@/services/attendanceService";
import { getAchievements, categoryLabels } from "@/services/achievementService";
import { getHealthRecords, categoryConfig } from "@/services/healthService";
import { Child, GrowthRecord, AttendanceRecord, Achievement, HealthRecord } from "@/types";
import { calculateAge, formatDate } from "@/lib/utils";
import { ArrowLeft, Download, Printer } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);

  const [child, setChild] = useState<Child | null>(null);
  const [growth, setGrowth] = useState<GrowthRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [health, setHealth] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      getChild(id),
      getGrowthRecords(id),
      getAttendance(id),
      getAchievements(id),
      getHealthRecords(id),
    ]).then(([c, g, a, ach, h]) => {
      setChild(c); setGrowth(g); setAttendance(a); setAchievements(ach); setHealth(h);
      setLoading(false);
    });
  }, [id]);

  async function handlePDF() {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      const pageH = pdf.internal.pageSize.getHeight();
      let pos = 0;
      while (pos < pdfH) {
        pdf.addImage(imgData, "PNG", 0, -pos, pdfW, pdfH);
        pos += pageH;
        if (pos < pdfH) pdf.addPage();
      }
      pdf.save(`ARKA_${child?.fullName?.replace(/\s+/g, "_")}_Laporan.pdf`);
    } finally { setExporting(false); }
  }

  function handlePrint() { window.print(); }

  if (loading) return <div className="text-center py-20 text-gray-400">Menyediakan laporan...</div>;
  if (!child) return <div className="text-center py-20 text-gray-400">Profil tidak ditemui</div>;

  const latestGrowth = growth[growth.length - 1];
  const aStat = getAttendanceStats(attendance);
  const today = new Date().toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="max-w-3xl mx-auto">
      {/* Action bar — hidden on print */}
      <div className="print-hide flex items-center justify-between mb-6">
        <Link href={`/children/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            <Printer className="w-4 h-4" /> Cetak
          </button>
          <button onClick={handlePDF} disabled={exporting} className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-60 transition">
            <Download className="w-4 h-4" /> {exporting ? "Menyediakan..." : "Muat Turun PDF"}
          </button>
        </div>
      </div>

      {/* ── REPORT CONTENT ── */}
      <div ref={reportRef} className="bg-white p-8 rounded-2xl border shadow-sm space-y-8 print-full">

        {/* Report Header */}
        <div className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="ARKA" width={56} height={56} className="object-contain" />
            <div>
              <h1 className="text-xl font-black text-gray-800">ARKA</h1>
              <p className="text-xs text-gray-500">Arkib Rekod Kanak-Kanak</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Laporan Profil Anak</p>
            <p className="text-xs text-gray-400">Dijana: {today}</p>
          </div>
        </div>

        {/* Child Profile */}
        <div className="print-avoid-break">
          <h2 className="text-base font-bold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">👤 Maklumat Anak</h2>
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-50 flex items-center justify-center flex-shrink-0">
              {child.photo ? <img src={child.photo} alt={child.fullName} className="w-full h-full object-cover" /> : <span className="text-3xl">{child.gender === "male" ? "👦" : "👧"}</span>}
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 flex-1">
              {[
                { label: "Nama Penuh", value: child.fullName },
                { label: "Nama Panggilan", value: child.nickname },
                { label: "Tarikh Lahir", value: formatDate(child.birthDate) },
                { label: "Umur", value: calculateAge(child.birthDate) },
                { label: "Jantina", value: child.gender === "male" ? "Lelaki" : "Perempuan" },
                { label: "Kumpulan Darah", value: child.bloodType },
                { label: "No. MyKid / IC", value: child.icNumber },
                { label: "No. Sijil Kelahiran", value: child.birthCertNo },
                { label: "Bangsa", value: child.race },
                { label: "Agama", value: child.religion },
                { label: "Kerakyatan", value: child.nationality },
                { label: "Tempat Lahir", value: child.birthPlace },
              ].filter((f) => f.value).map((f) => (
                <div key={f.label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{f.label}</p>
                  <p className="text-sm font-medium text-gray-700">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          {(child.address || child.city || child.state) && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Alamat</p>
              <p className="text-sm text-gray-700">{[child.address, child.postcode && child.city ? `${child.postcode} ${child.city}` : (child.city || child.postcode), child.state].filter(Boolean).join(", ")}</p>
            </div>
          )}
        </div>

        {/* School */}
        {(child.schoolName || child.schoolYear) && (
          <div className="print-avoid-break">
            <h2 className="text-base font-bold text-gray-700 mb-3 border-l-4 border-purple-500 pl-3">🏫 Maklumat Sekolah</h2>
            <div className="grid grid-cols-3 gap-4">
              {[{ label: "Nama Sekolah", value: child.schoolName }, { label: "Darjah / Tahun", value: child.schoolYear }, { label: "Kelas", value: child.schoolClass }].filter((f) => f.value).map((f) => (
                <div key={f.label}><p className="text-xs text-gray-400 uppercase">{f.label}</p><p className="text-sm font-medium text-gray-700">{f.value}</p></div>
              ))}
            </div>
          </div>
        )}

        {/* Parents */}
        {(child.fatherName || child.motherName) && (
          <div className="print-avoid-break">
            <h2 className="text-base font-bold text-gray-700 mb-3 border-l-4 border-green-500 pl-3">👨‍👩 Maklumat Ibu Bapa</h2>
            <div className="grid grid-cols-2 gap-6">
              {child.fatherName && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">BAPA</p>
                  {[{ label: "Nama", value: child.fatherName }, { label: "No. IC", value: child.fatherIc }, { label: "Telefon", value: child.fatherPhone }, { label: "Pekerjaan", value: child.fatherJob }].filter((f) => f.value).map((f) => (
                    <div key={f.label} className="mb-1"><span className="text-xs text-gray-400">{f.label}: </span><span className="text-sm text-gray-700">{f.value}</span></div>
                  ))}
                </div>
              )}
              {child.motherName && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">IBU</p>
                  {[{ label: "Nama", value: child.motherName }, { label: "No. IC", value: child.motherIc }, { label: "Telefon", value: child.motherPhone }, { label: "Pekerjaan", value: child.motherJob }].filter((f) => f.value).map((f) => (
                    <div key={f.label} className="mb-1"><span className="text-xs text-gray-400">{f.label}: </span><span className="text-sm text-gray-700">{f.value}</span></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Growth */}
        <div className="print-avoid-break">
          <h2 className="text-base font-bold text-gray-700 mb-3 border-l-4 border-emerald-500 pl-3">📏 Rekod Pertumbuhan</h2>
          {latestGrowth ? (
            <>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Berat", value: `${latestGrowth.weight} kg` },
                  { label: "Tinggi", value: `${latestGrowth.height} cm` },
                  { label: "BMI", value: `${latestGrowth.bmi} (${getBMICategory(latestGrowth.bmi).label})` },
                  { label: "Kepala", value: latestGrowth.headSize ? `${latestGrowth.headSize} cm` : "—" },
                ].map((s) => (
                  <div key={s.label} className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-emerald-700">{s.value}</p>
                    <p className="text-xs text-emerald-600">{s.label}</p>
                  </div>
                ))}
              </div>
              {growth.length > 0 && (
                <table className="w-full text-xs border border-gray-100 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50"><tr>{["Tarikh","Berat (kg)","Tinggi (cm)","BMI"].map((h) => <th key={h} className="px-3 py-2 text-left text-gray-500">{h}</th>)}</tr></thead>
                  <tbody>{[...growth].reverse().slice(0, 5).map((r) => <tr key={r.id} className="border-t"><td className="px-3 py-2">{formatDate(r.recordDate)}</td><td className="px-3 py-2">{r.weight}</td><td className="px-3 py-2">{r.height}</td><td className="px-3 py-2">{r.bmi}</td></tr>)}</tbody>
                </table>
              )}
            </>
          ) : <p className="text-sm text-gray-400">Tiada rekod pertumbuhan</p>}
        </div>

        {/* Attendance */}
        <div className="print-avoid-break">
          <h2 className="text-base font-bold text-gray-700 mb-3 border-l-4 border-orange-500 pl-3">📅 Ringkasan Kehadiran</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Jumlah", value: aStat.total },
              { label: "Hadir", value: aStat.present },
              { label: "Tidak Hadir", value: aStat.absent },
              { label: "% Kehadiran", value: `${aStat.percentage}%` },
            ].map((s) => (
              <div key={s.label} className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-orange-700">{s.value}</p>
                <p className="text-xs text-orange-600">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Health */}
        {health.length > 0 && (
          <div className="print-avoid-break">
            <h2 className="text-base font-bold text-gray-700 mb-3 border-l-4 border-rose-500 pl-3">❤️ Rekod Kesihatan ({health.length} rekod)</h2>
            <div className="space-y-2">
              {health.slice(0, 5).map((r) => {
                const cat = categoryConfig[r.category];
                return (
                  <div key={r.id} className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl">
                    <span className="text-lg">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{r.title}</p>
                      <p className="text-xs text-gray-400">{cat.label} · {formatDate(r.recordDate)}</p>
                    </div>
                  </div>
                );
              })}
              {health.length > 5 && <p className="text-xs text-gray-400 text-center">+{health.length - 5} rekod lagi</p>}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="print-avoid-break">
            <h2 className="text-base font-bold text-gray-700 mb-3 border-l-4 border-yellow-500 pl-3">🏆 Pencapaian ({achievements.length} rekod)</h2>
            <div className="grid grid-cols-2 gap-2">
              {achievements.slice(0, 6).map((r) => (
                <div key={r.id} className="p-3 bg-yellow-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-700">{r.title}</p>
                  <p className="text-xs text-gray-400">{categoryLabels[r.category]} · {formatDate(r.recordDate)}</p>
                  {r.score && <p className="text-xs text-yellow-600 mt-0.5">⭐ {r.score}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical notes */}
        {child.medicalNotes && (
          <div className="print-avoid-break">
            <h2 className="text-base font-bold text-gray-700 mb-3 border-l-4 border-gray-400 pl-3">📋 Nota Perubatan</h2>
            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed">{child.medicalNotes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-4 text-center">
          <p className="text-xs text-gray-400">Dijana oleh ARKA — Arkib Rekod Kanak-Kanak · {today}</p>
        </div>
      </div>
    </div>
  );
}
