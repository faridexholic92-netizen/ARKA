import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="ARKA" width={80} height={80} className="object-contain opacity-40" />
        </div>
        <h1 className="text-8xl font-black text-gray-200 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-700 mb-3">Halaman Tidak Dijumpai</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Maaf, halaman yang anda cari tidak wujud atau telah dipindahkan.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition text-sm"
        >
          🏠 Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
