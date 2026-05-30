"use client";
import { useEffect } from "react";
import Image from "next/image";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="ARKA" width={80} height={80} className="object-contain opacity-40" />
        </div>
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-700 mb-3">Oops! Ada Masalah</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Terjadi ralat yang tidak dijangka. Sila cuba semula atau hubungi sokongan.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition text-sm"
          >
            🔄 Cuba Semula
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
          >
            🏠 Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
