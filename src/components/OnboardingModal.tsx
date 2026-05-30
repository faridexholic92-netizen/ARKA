"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

const STEPS = [
  {
    emoji: null,
    title: "Selamat Datang ke ARKA! 🎉",
    desc: "Platform arkib digital untuk memantau perkembangan, kesihatan dan pencapaian anak anda secara sistematik.",
    cta: "Mulakan",
  },
  {
    emoji: "👶",
    title: "Tambah Profil Anak",
    desc: "Mulakan dengan menambah profil anak anda. Lengkapkan maklumat seperti nama, tarikh lahir, dan gambar.",
    cta: "Seterusnya",
  },
  {
    emoji: "📊",
    title: "Rekod & Pantau",
    desc: "Rekod pertumbuhan, kehadiran, kesihatan dan pencapaian anak. Semua data tersimpan dengan selamat.",
    cta: "Siap! Mula Sekarang",
  },
];

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem("arka-onboarded");
    if (!done) setOpen(true);
  }, []);

  function finish() {
    localStorage.setItem("arka-onboarded", "1");
    setOpen(false);
  }

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
        <button onClick={finish} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition">
          <X className="w-5 h-5" />
        </button>

        {/* Logo on step 0, emoji on others */}
        {step === 0 ? (
          <div className="flex justify-center mb-5">
            <Image src="/logo.png" alt="ARKA" width={100} height={100} className="object-contain" />
          </div>
        ) : (
          <div className="text-6xl mb-5">{current.emoji}</div>
        )}

        <h2 className="text-xl font-bold text-gray-800 mb-3">{current.title}</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">{current.desc}</p>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-6 gradient-primary" : "w-2 bg-gray-200"}`} />
          ))}
        </div>

        {isLast ? (
          <Link
            href="/children/add"
            onClick={finish}
            className="block w-full gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition text-sm"
          >
            {current.cta}
          </Link>
        ) : (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="w-full gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition text-sm"
          >
            {current.cta}
          </button>
        )}

        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="text-gray-400 text-xs mt-3 hover:text-gray-600 transition">
            ← Kembali
          </button>
        )}
      </div>
    </div>
  );
}
