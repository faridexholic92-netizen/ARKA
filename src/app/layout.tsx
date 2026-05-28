import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ARKA — Arkib Rekod Kanak-Kanak",
  description: "Platform digital untuk memantau perkembangan anak secara sistematik",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
