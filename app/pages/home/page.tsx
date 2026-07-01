"use client";

import { useEffect, useRef, useState } from "react";
import MatchModal from "@components/match/match-modal";
import Link from "next/link";
import { getTekoData, type Player, type Match } from "@utils/fetcher";
import BirthdayCards from "@components/home/birthday-cards";
import EventCard from "@components/home/event";
import Gallery from "@components/home/gallery";
import { useIsAdmin } from "@utils/auth";

type Toast = {
  message: string;
  type: "success" | "error";
};

export default function HomeContent() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const isAdmin = useIsAdmin();

  const fabRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    getTekoData()
      .then(({ players, matches }) => {
        setPlayers(Array.isArray(players) ? players : []);
        setMatches(Array.isArray(matches) ? matches : []);
      })
      .catch((error) => console.error("Gagal memuat data pemain:", error));
  }, []);

  // Close the floating action menu when clicking outside of it
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsFabOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const safePlayers = Array.isArray(players) ? players : [];

  const handleSaveMatch = async (newMatch: Omit<Match, "id">) => {
    const id = matches.length > 0 ? Math.max(...matches.map((m) => m.id)) + 1 : 1;
    const matchWithId: Match = { id, ...newMatch };
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchWithId),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message);
      }
      setMatches((prev) => [...prev, matchWithId]);
      setIsModalOpen(false);
      showToast("Pertandingan berhasil ditambahkan.", "success");
    } catch (error) {
      console.error("Gagal menyimpan pertandingan:", error);
      showToast("Gagal menyimpan pertandingan. Coba lagi.", "error");
    }
  };

  return (
    <>
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-6 py-4 text-sm font-semibold shadow-2xl transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-500 text-slate-950 shadow-emerald-500/30"
              : "bg-red-500 text-white shadow-red-500/30"
          }`}
        >
          <span className="mr-2">{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.message}
        </div>
      )}

      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden h-52 md:h-60 mb-8">
        {/* Background layer */}
        <div className="absolute inset-0">
          {/* Court grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(16,185,129,0.10) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16,185,129,0.10) 1px, transparent 1px)
              `,
              backgroundSize: "56px 56px",
            }}
          />
          {/* Centre service lines */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-500/15" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-500/15" />
          {/* Baseline box */}
          <div
            className="absolute border border-emerald-500/10 rounded-sm"
            style={{ inset: "20% 10%" }}
          />
          {/* Ambient glow orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 left-1/5 w-64 h-64 bg-blue-500/4 rounded-full blur-2xl" />
          <div className="absolute bottom-1/4 right-1/5 w-56 h-56 bg-emerald-600/6 rounded-full blur-2xl" />
        </div>

        {/* Hero text */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
            />
            Serpong Lagoon
          </div>

          <h1
            className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 leading-none"
            style={{
              textShadow:
                "0 0 60px rgba(16,185,129,0.35), 0 0 20px rgba(16,185,129,0.15), 0 2px 8px rgba(0,0,0,0.9)",
            }}
          >
            🎾 Tenis Komedi 🎾
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium tracking-wide">
            Sedikit Kompetisi, Banyakin Haha Hihi di Lapangan
          </p>
        </div>
      </div>

      {/* ── Cards section — glass card ── */}
      <div className="px-4 md:px-8 mb-8 md:mb-12">
        <div
          className="relative rounded-2xl border border-white/6 bg-slate-900/40 p-4 md:p-6"
          style={{
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          {/* Shimmer top edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/12 to-transparent rounded-t-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-10 md:mb-0">
            <BirthdayCards players={safePlayers} />
            <EventCard />
          </div>
        </div>
      </div>

      {/* ── Photo gallery ── */}
      <Gallery />

      {/* ── Floating admin actions ── */}
      {isAdmin && (
        <div
          ref={fabRef}
          className="fixed z-40 bottom-24 right-4 md:bottom-6 md:right-6 flex flex-col items-end gap-3"
        >
          {/* Sub actions */}
          <div
            className={`flex flex-col items-end gap-3 transition-all duration-200 origin-bottom-right ${
              isFabOpen
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-95 translate-y-2 pointer-events-none"
            }`}
          >
            <Link
              href="/players/add"
              onClick={() => setIsFabOpen(false)}
              className="flex items-center gap-2 pl-4 pr-5 py-3 rounded-full font-black text-sm text-white shadow-lg shadow-blue-500/30 bg-blue-500 hover:bg-blue-400 active:scale-95 transition-all whitespace-nowrap"
            >
              <span>+</span> ATP atau WTA
            </Link>
            <button
              onClick={() => { setIsModalOpen(true); setIsFabOpen(false); }}
              className="flex items-center gap-2 pl-4 pr-5 py-3 rounded-full font-black text-sm text-white shadow-lg shadow-emerald-500/30 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>+</span> Pertandingan
            </button>
          </div>

          {/* Main toggle */}
          <button
            onClick={() => setIsFabOpen((v) => !v)}
            aria-label={isFabOpen ? "Tutup menu tambah" : "Buka menu tambah"}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-white cursor-pointer shadow-xl shadow-emerald-900/50 bg-linear-to-br from-emerald-500 to-emerald-600 transition-transform duration-200 active:scale-90 ${
              isFabOpen ? "rotate-45" : ""
            }`}
          >
            +
          </button>
        </div>
      )}

      {isModalOpen && (
        <MatchModal
          players={players}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveMatch}
        />
      )}
    </>
  );
}
