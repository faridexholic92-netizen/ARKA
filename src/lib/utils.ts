import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (years === 0) return `${months < 0 ? 0 : months} bulan`;
  if (months < 0) return `${years - 1} tahun ${12 + months} bulan`;
  return `${years} tahun ${months} bulan`;
}

export function calculateBMI(weight: number, height: number): number {
  const heightM = height / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
}
