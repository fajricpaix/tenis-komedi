"use client";

import { useEffect, useMemo, useState } from "react";
import HomeTab, { TeamKey } from "@components/home/tab";
import HomeTable from "@components/home/table";
import MatchModal from "@components/match/match-modal";
import MatchTable from "@components/match/match-table";
import Link from "next/link";
import { getTekoData, parseSetScore, type Player, type Match } from "../../utils/fetcher";

type PlayerStats = {
  matchesPlayed: number;
  wins: number;
  losses: number;
  setWin: number;
  setLose: number;
  points: number;
};

function buildPlayerStats(players: Player[], matches: Match[]): Map<string, PlayerStats> {
  const statsByName = new Map<string, PlayerStats>();

  players.forEach((player) => {
    statsByName.set(player.name, {
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      setWin: 0,
      setLose: 0,
      points: 0,
    });
  });

  matches.forEach((match) => {
    const [winnerScore, loserScore] = parseSetScore(match.setScore);
    const loserName = match.player1 === match.winner ? match.player2 : match.player1;

    const winnerStats = statsByName.get(match.winner);
    const loserStats = statsByName.get(loserName);

    if (winnerStats) {
      winnerStats.matchesPlayed += 1;
      winnerStats.wins += 1;
      winnerStats.setWin += winnerScore;
      winnerStats.setLose += loserScore;
    }

    if (loserStats) {
      loserStats.matchesPlayed += 1;
      loserStats.losses += 1;
      loserStats.setWin += loserScore;
      loserStats.setLose += winnerScore;
    }
  });

  statsByName.forEach((stats) => {
    stats.points = (stats.wins * 100) + (stats.losses * 30) + (stats.setWin * 10);
  });

  return statsByName;
}

export default function HomeContent() {
  const [activeTab, setActiveTab] = useState<TeamKey>("Pria");
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getTekoData()
      .then(({ players, matches }) => {
        setPlayers(players);
        setMatches(matches);
      })
      .catch((error) => {
        console.error("Gagal memuat data pemain:", error);
      });
  }, []);

  const statsByName = useMemo(() => buildPlayerStats(players, matches), [players, matches]);

  const currentPlayers = useMemo(() =>
    players
      .filter((player) => player.gender === activeTab)
      .map((player) => ({
        ...player,
        ...(statsByName.get(player.name) ?? {
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          setWin: 0,
          setLose: 0,
          points: 0,
        }),
      }))
      .sort((a, b) => b.points - a.points),
    [activeTab, players, statsByName]
  );

  const currentMatches = useMemo(
    () =>
      matches
        .filter((match) =>
          currentPlayers.some((player) => player.name === match.player1 || player.name === match.player2)
        )
        .slice(-10) // tampilkan maksimal 10 pertandingan terakhir
    ,
    [currentPlayers, matches]
  );

  const handleEdit = (id: number) => {
    alert(`Edit pemain dengan ID: ${id}`);
  };

  const handleSaveMatch = (newMatch: Match) => {
    setMatches((prev) => [...prev, newMatch]);
    setIsModalOpen(false);
  };

  return (
    <section className="px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        {/* Tabs */}
        <HomeTab activeTab={activeTab} onSelect={setActiveTab} />
        
        <div className="flex gap-x-4">
          <Link href="/players/add" className="font-black px-2 md:px-7 py-2 md:py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400">
            <span className="text-xl">+</span> Pemain
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="font-black px-2 md:px-7 py-2 md:py-2.5 cursor-pointer rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400"
          >
            <span className="text-xl">+</span> Pertandingan
          </button>
        </div>
      </div>


      <div className="flex gap-x-8">
        {/* Player Table */}
        <div className="w-3/5">
          <HomeTable
            players={currentPlayers}
            matches={currentMatches}
            activeTab={activeTab}
            onEdit={handleEdit}
          />
        </div>

        {/* Match Table */}
        <div className="w-2/5">
          <MatchTable 
            matches={currentMatches} 
            activeTab={activeTab} 
          />
        </div>
      </div>

      {isModalOpen && (
        <MatchModal 
          players={players.filter(p => p.gender === activeTab)}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveMatch}
          nextId={matches.length > 0 ? Math.max(...matches.map(m => m.id)) + 1 : 1}
        />
      )}
    </section>
  );
}