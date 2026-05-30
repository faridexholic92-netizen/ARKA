"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { getChildren } from "@/services/childService";
import { getHealthRecords } from "@/services/healthService";
import { getAchievements } from "@/services/achievementService";
import { Child, HealthRecord, Achievement } from "@/types";
import { Search, X, Users, Heart, Trophy } from "lucide-react";
import Link from "next/link";

interface Result {
  type: "child" | "health" | "achievement";
  id: string;
  title: string;
  sub: string;
  href: string;
  icon: React.ReactNode;
}

export function GlobalSearch() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [allHealth, setAllHealth] = useState<HealthRecord[]>([]);
  const [allAch, setAllAch] = useState<Achievement[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Load all data once
  useEffect(() => {
    if (!open || loaded || !user) return;
    getChildren(user.id).then(async (kids) => {
      setAllChildren(kids);
      const healthAll: HealthRecord[] = [];
      const achAll: Achievement[] = [];
      await Promise.all(kids.map(async (kid) => {
        const [h, a] = await Promise.all([getHealthRecords(kid.id), getAchievements(kid.id)]);
        healthAll.push(...h);
        achAll.push(...a);
      }));
      setAllHealth(healthAll);
      setAllAch(achAll);
      setLoaded(true);
    });
  }, [open, loaded, user]);

  // Search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const res: Result[] = [];

    allChildren.forEach((c) => {
      if (c.fullName.toLowerCase().includes(q) || c.nickname?.toLowerCase().includes(q)) {
        res.push({ type: "child", id: c.id, title: c.fullName, sub: c.nickname ? `"${c.nickname}"` : "Profil Anak", href: `/children/${c.id}`, icon: <Users className="w-4 h-4 text-blue-500" /> });
      }
    });
    allHealth.forEach((r) => {
      if (r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)) {
        res.push({ type: "health", id: r.id, title: r.title, sub: "Rekod Kesihatan", href: `/health`, icon: <Heart className="w-4 h-4 text-rose-500" /> });
      }
    });
    allAch.forEach((r) => {
      if (r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)) {
        res.push({ type: "achievement", id: r.id, title: r.title, sub: "Pencapaian", href: `/achievements`, icon: <Trophy className="w-4 h-4 text-yellow-500" /> });
      }
    });
    setResults(res.slice(0, 8));
  }, [query, allChildren, allHealth, allAch]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-start justify-center pt-[15vh] p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Cari nama anak, rekod kesihatan, pencapaian..."
            className="flex-1 outline-none text-gray-700 placeholder:text-gray-400 bg-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && <button onClick={() => setQuery("")} className="text-gray-300 hover:text-gray-500"><X className="w-4 h-4" /></button>}
          <kbd className="hidden sm:flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query && results.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">Tiada keputusan untuk "{query}"</div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((r) => (
                <li key={`${r.type}-${r.id}`}>
                  <Link href={r.href} onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">{r.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                      <p className="text-xs text-gray-400">{r.sub}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Taip untuk mencari...</p>
              <p className="text-xs mt-1 text-gray-300">Cari nama anak, rekod, pencapaian</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-gray-50 px-4 py-2.5 flex items-center gap-3">
          <span className="text-xs text-gray-400">Pintasan: <kbd className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">Ctrl+K</kbd></span>
          {results.length > 0 && <span className="text-xs text-gray-400 ml-auto">{results.length} keputusan</span>}
        </div>
      </div>
    </div>
  );
}
