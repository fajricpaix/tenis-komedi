"use client";

import { useEffect, useMemo, useState } from "react";
import HomeTab, { TeamKey } from "@components/home/tab";
import HomeTable from "@components/home/table";
import MatchModal from "@components/match/match-modal";
import MatchTable from "@components/match/match-table";
import TournamentTab, { type TournamentTabKey } from "@components/home/tournament-tab";
import TournamentTable from "@components/home/tournament-table";
import Link from "next/link";
import { getTekoData, parseSetScore, type Player, type Match } from "../utils/fetcher";
import BirthdayCards from "@components/home/birthday-cards";
import EventCard from "@components/home/event";

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
    const [winnerScore, loserScore] = parseSetScore(match.setScore);
    const loserName = match.player1 === match.winner ? match.player2 : match.player1;
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

  const statsByName = useMemo(() => buildPlayerStats(players, matches), [players, matches]);
  const safePlayers = Array.isArray(players) ? players : [];

  const currentPlayers = useMemo(() =>
    safePlayers
      .filter((p) => p?.gender === activeTab)
      .map((p) => ({
        ...p,
        ...(statsByName.get(p.name) ?? {
          matchesPlayed: 0, wins: 0, losses: 0,
          setWin: 0, setLose: 0, points: 0,
        }),
      }))
      .sort((a, b) => b.points - a.points || b.wins - a.wins),
    [activeTab, safePlayers, statsByName]
  );

  const currentMatches = useMemo(() => {
    const safeMatches = Array.isArray(matches) ? matches : [];
    const playerNamesInTab = new Set(
      safePlayers.filter((p) => p.gender === activeTab).map((p) => p.name)
    );
    return [...safeMatches]
      .filter((m) => playerNamesInTab.has(m.player1) || playerNamesInTab.has(m.player2))
      .reverse()
      .slice(0, 20);
  }, [matches, safePlayers, activeTab]);

  const handleEdit = (id: number) => alert(`Edit pemain dengan ID: ${id}`);

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
    // Refetch data setelah pertandingan dihapus
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
    <section className="p-4 md:py-8">

      <div className="flex flex-col md:flex-row justify-betweengap-6 md:gap-10 md:mb-8">
        <BirthdayCards players={safePlayers} />
        <EventCard />
      </div>

      <div className="flex flex-row md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6">
        <HomeTab
          activeTab={activeTab}
          onSelect={(tab) => { setActiveTab(tab); setTournamentTab("ranking"); }}
        />
        <div className="flex gap-x-4">
          {/* <Link
            href="/players/add"
            className="font-black px-4 md:px-7 py-1 md:py-2.5 rounded-xl md:rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400"
          >
            <span className="text-sm md:text-xl">+</span> Pemain
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="font-black px-4 md:px-7 py-1 md:py-2.5 cursor-pointer rounded-xl md:rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400"
          >
            <span className="text-sm md:text-xl">+</span> Pertandingan
          </button> */}
          <Link
            href="/matches"
            className="font-black flex items-center justify-center gap-2 text-emerald-400 hover:text-emerald-300 uppercase text-xs underline italic"
          >
            Lihat Semua <br className="block md:hidden"/> Pertandingan
          </Link>
        </div>
      </div>

      <TournamentTab activeTab={tournamentTab} onSelect={setTournamentTab} />

      {toast && (
        <div
          className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-6 py-4 text-sm font-semibold shadow-2xl transition-all duration-300 ${toast.type === "success"
            ? "bg-emerald-500 text-slate-950 shadow-emerald-500/30"
            : "bg-red-500 text-white shadow-red-500/30"
          }`}
        >
          <span className="mr-2">{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.message}
        </div>
      )}

      {tournamentTab === "ranking" ? (
        <div className="grid md:flex grid-cols-1 gap-10 md:gap-x-8">
          <div className="w-full md:w-3/5">
            <HomeTable
              players={currentPlayers}
              matches={currentMatches}
              activeTab={activeTab}
              onEdit={handleEdit}
            />
          </div>
          <div className="w-full md:w-2/5">
            <MatchTable matches={currentMatches} activeTab={activeTab} onMatchDeleted={handleMatchDeleted} />

            <div className="py-3 mt-2 text-xs text-right text-slate-500">
              <Link
                href="/matches"
                className="text-emerald-300 hover:text-white transition-colors duration-150 text-xs font-semibold uppercase tracking-wide underline">
                  Lihat Semua Pertandingan
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <TournamentTable
          tournamentTab={tournamentTab}
          activeGender={activeTab}
          players={safePlayers}
        />
      )}

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