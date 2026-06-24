"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import HomeTab, { TeamKey } from "@components/home/tab";
import HomeTable from "@components/home/table";
import MatchModal from "@components/match/match-modal";
import MatchTable from "@components/match/match-table";
import TournamentTab, { type TournamentTabKey } from "@components/home/tournament-tab";
import TournamentTable from "@components/home/tournament-table";
import Link from "next/link";
import { getTekoData, parseSetScore, type Player, type Match } from "@utils/fetcher";
import BirthdayCards from "@components/home/birthday-cards";
import EventCard from "@components/home/event";
import { useIsAdmin } from "@utils/auth";

type PlayerStats = {
  matchesPlayed: number;
  wins: number;
  losses: number;
  setWin: number;
  setLose: number;
  points: number;
};

type Toast = {
  message: string;
  type: "success" | "error";
};

function buildPlayerStats(players: Player[] = [], matches: Match[] = []): Map<string, PlayerStats> {
  const statsByName = new Map<string, PlayerStats>();
  const playersList = Array.isArray(players) ? players : [];
  const matchesList = Array.isArray(matches) ? matches : [];

  playersList.forEach((player) => {
    statsByName.set(player.name, {
      matchesPlayed: 0, wins: 0, losses: 0,
      setWin: 0, setLose: 0, points: 0,
    });
  });

  matchesList.forEach((match) => {
    const [s1, s2] = parseSetScore(match.setScore);
    const isPlayer1Winner = match.winner === match.player1;
    const winnerScore = isPlayer1Winner ? s1 : s2;
    const loserScore = isPlayer1Winner ? s2 : s1;
    const loserName = isPlayer1Winner ? match.player2 : match.player1;
    const winnerStats = statsByName.get(match.winner);
    const loserStats = statsByName.get(loserName);

    // 3-0 → menang +6, kalah +1
    // 3-1 → menang +5, kalah +2
    // 3-2 → menang +4, kalah +3
    const winnerPoints = 6 - loserScore;
    const loserPoints = loserScore + 1;

    if (winnerStats) {
      winnerStats.matchesPlayed += 1;
      winnerStats.wins += 1;
      winnerStats.setWin += winnerScore;
      winnerStats.setLose += loserScore;
      winnerStats.points += winnerPoints;
    }
    if (loserStats) {
      loserStats.matchesPlayed += 1;
      loserStats.losses += 1;
      loserStats.setWin += loserScore;
      loserStats.setLose += winnerScore;
      loserStats.points += loserPoints;
    }
  });

  return statsByName;
}

export default function HomeContent() {
  const [activeTab, setActiveTab] = useState<TeamKey>("Pria");
  const [tournamentTab, setTournamentTab] = useState<TournamentTabKey>("ranking");
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const isAdmin = useIsAdmin();

  const heroRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

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

  // Parallax + 3D tilt scroll effect (desktop/non-touch only)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    if (prefersReducedMotion || isTouch) return;

    const handleScroll = () => {
      const y = window.scrollY;

      // Background moves at half scroll speed (further away layer)
      if (heroBgRef.current) {
        heroBgRef.current.style.transform = `translateY(${y * 0.5}px)`;
      }

      // Text moves at 20% scroll speed (mid layer)
      if (heroTextRef.current) {
        heroTextRef.current.style.transform = `translateY(${y * 0.2}px)`;
      }

      // Hero section slowly rotates away as you scroll (3D depth sensation)
      if (heroRef.current) {
        const rotateX = Math.min(y * 0.025, 10);
        heroRef.current.style.transform = `perspective(1400px) rotateX(${rotateX}deg)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const statsByName = useMemo(() => buildPlayerStats(players, matches), [players, matches]);
  const prevStatsByName = useMemo(() => buildPlayerStats(players, matches.slice(0, -1)), [players, matches]);
  const safePlayers = Array.isArray(players) ? players : [];

  const currentPlayers = useMemo(() => {
    const genderPlayers = safePlayers.filter((p) => p?.gender === activeTab);

    const withStats = genderPlayers
      .map((p) => ({
        ...p,
        ...(statsByName.get(p.name) ?? {
          matchesPlayed: 0, wins: 0, losses: 0,
          setWin: 0, setLose: 0, points: 0,
        }),
      }))
      .sort((a, b) => b.points - a.points || b.wins - a.wins);

    const prevRankMap = new Map(
      genderPlayers
        .map((p) => ({ name: p.name, ...(prevStatsByName.get(p.name) ?? { points: 0, wins: 0 }) }))
        .sort((a, b) => b.points - a.points || b.wins - a.wins)
        .map((p, i) => [p.name, i + 1])
    );

    return withStats.map((p, i) => ({
      ...p,
      rankChange: (prevRankMap.get(p.name) ?? i + 1) - (i + 1),
    }));
  }, [activeTab, safePlayers, statsByName, prevStatsByName]);

  const currentMatches = useMemo(() => {
    const safeMatches = Array.isArray(matches) ? matches : [];
    const playerNamesInTab = new Set(
      safePlayers.filter((p) => p.gender === activeTab).map((p) => p.name)
    );
    return [...safeMatches]
      .filter((m) => playerNamesInTab.has(m.player1) || playerNamesInTab.has(m.player2))
      .reverse();
  }, [matches, safePlayers, activeTab]);

  const handlePlayerDeleted = async () => {
    try {
      const { players, matches } = await getTekoData();
      setPlayers(Array.isArray(players) ? players : []);
      setMatches(Array.isArray(matches) ? matches : []);
      showToast("Pemain berhasil dihapus.", "success");
    } catch {
      showToast("Gagal memuat ulang data.", "error");
    }
  };

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

  const handleMatchDeleted = async () => {
    try {
      const { players, matches } = await getTekoData();
      setPlayers(Array.isArray(players) ? players : []);
      setMatches(Array.isArray(matches) ? matches : []);
      showToast("Pertandingan berhasil dihapus.", "success");
    } catch (error) {
      console.error("Gagal memuat ulang data:", error);
      showToast("Gagal memuat ulang data.", "error");
    }
  };

  return (
    <section className="overflow-x-hidden">
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

      {/* ── Hero Section — parallax + 3D tilt ── */}
      <div
        ref={heroRef}
        className="relative overflow-hidden h-52 md:h-72 mb-8 md:mb-14"
        style={{ transformOrigin: "center bottom" }}
      >
        {/* Parallax background layer — moves at 0.5× scroll speed */}
        <div
          ref={heroBgRef}
          className="absolute left-0 right-0"
          style={{ top: "-30%", height: "160%", willChange: "transform" }}
        >
          {/* Court grid */}
          <div
            className="absolute inset-0 bg-slate-950"
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

        {/* Top + bottom fade overlays */}
        <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-slate-950/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-slate-950 to-transparent z-10 pointer-events-none" />

        {/* Hero text — moves at 0.2× scroll speed */}
        <div
          ref={heroTextRef}
          className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4"
          style={{ willChange: "transform" }}
        >
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
            Peringkat &amp; Statistik Pemain
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

      {/* ── Controls row ── */}
      <div className="px-4 md:px-8 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <HomeTab
            activeTab={activeTab}
            onSelect={(tab) => {
              setActiveTab(tab);
              setTournamentTab("ranking");
            }}
          />
          <div className="flex items-center gap-x-3">
            {isAdmin && (
              <>
                <Link
                  href="/players/add"
                  className="font-black px-4 md:px-7 py-2 md:py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-sm"
                >
                  <span>+</span> ATP atau WTA
                </Link>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="font-black px-4 md:px-7 py-2 md:py-2.5 cursor-pointer rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-sm"
                >
                  <span>+</span> Pertandingan
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* {<TournamentTab activeTab={tournamentTab} onSelect={setTournamentTab} />} */}

      {/* ── Tables section ── */}
      <div className="px-4 md:px-8 pb-12">
        {tournamentTab === "ranking" ? (
          <div className="grid md:flex grid-cols-1 gap-10 md:gap-x-8">
            <div className="w-full md:w-3/5">
              <HomeTable
                players={currentPlayers}
                matches={currentMatches}
                activeTab={activeTab}
                onPlayerDeleted={handlePlayerDeleted}
              />
            </div>
            <div className="w-full md:w-2/5">
              <MatchTable
                matches={currentMatches}
                players={safePlayers}
                activeTab={activeTab}
                onMatchDeleted={handleMatchDeleted}
                onMatchEdited={handleMatchDeleted}
              />
            </div>
          </div>
        ) : (
          <TournamentTable
            tournamentTab={tournamentTab}
            activeGender={activeTab}
            players={safePlayers}
          />
        )}
      </div>

      {isModalOpen && (
        <MatchModal
          players={players}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveMatch}
        />
      )}
    </section>
  );
}
