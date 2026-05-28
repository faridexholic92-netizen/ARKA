import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthProvider";

export const metadata: Metadata = {
  title: "ARKA — Arkib Rekod Kanak-Kanak",
  description: "Platform digital untuk memantau perkembangan anak secara sistematik",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
