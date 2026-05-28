"use client";
import { useThemeStore, Theme } from "@/store/themeStore";
import { Palette } from "lucide-react";
import { useState } from "react";

const themes: { id: Theme; label: string; from: string; to: string }[] = [
  { id: "blue",    label: "Ocean",   from: "#1d4ed8", to: "#1e40af" },
  { id: "emerald", label: "Forest",  from: "#059669", to: "#047857" },
  { id: "purple",  label: "Purple",  from: "#7c3aed", to: "#6d28d9" },
  { id: "rose",    label: "Rose",    from: "#e11d48", to: "#be123c" },
  { id: "orange",  label: "Sunset",  from: "#ea580c", to: "#c2410c" },
  { id: "dark",    label: "Dark",    from: "#1e293b", to: "#0f172a" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-blue-200 hover:text-white text-sm px-2 py-2 rounded-lg hover:bg-blue-700 transition w-full"
      >
        <Palette className="w-4 h-4" />
        Tema
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border p-3 z-20 w-52">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-1">Pilih Tema</p>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setOpen(false); }}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition ${theme === t.id ? "ring-2 ring-offset-1 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div
                    className="w-8 h-8 rounded-lg shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                  />
                  <span className="text-xs text-gray-600 font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
