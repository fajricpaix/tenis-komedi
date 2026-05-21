"use client";

import { useEffect, useMemo, useState } from "react";
import HomeTab, { TeamKey } from "@components/home/tab";
import HomeTable from "@components/home/table";

type Player = {
  id: number;
  nama: string;
  gender: "Pria" | "Wanita";
};

type Match = {
  id: number;
  player1: string;
  player2: string;
  winner: string;
  setScore: string;
};

type PlayerStats = {
  matchesPlayed: number;
  wins: number;
  losses: number;
  setWin: number;
  setLose: number;
  points: number;
};

type PlayerWithStats = Player & PlayerStats;

function parseSetScore(value: string): [number, number] {
  const [home, away] = value.split("-").map((v) => Number(v.trim()));
  return Number.isFinite(home) && Number.isFinite(away) ? [home, away] : [0, 0];
}

function buildPlayerStats(players: Player[], matches: Match[]): Map<string, PlayerStats> {
  const statsByName = new Map<string, PlayerStats>();

  players.forEach((player) => {
    statsByName.set(player.nama, {
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
    stats.points = stats.wins * 10 + stats.losses * 2;
  });

  return statsByName;
}

export default function HomeContent() {
  const [activeTab, setActiveTab] = useState<TeamKey>("Pria");
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetch("/json/teko.json")
      .then((res) => res.json())
      .then((data: { players: Player[]; matches: Match[] }) => {
        setPlayers(data.players);
        setMatches(data.matches);
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
        ...(statsByName.get(player.nama) ?? {
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
      matches.filter((match) =>
        currentPlayers.some((player) => player.nama === match.player1 || player.nama === match.player2)
      ),
    [currentPlayers, matches]
  );

  const handleDelete = (id: number) => {
    setPlayers((prev) => prev.filter((player) => !(player.gender === activeTab && player.id === id)));
  };

  const handleEdit = (id: number) => {
    alert(`Edit pemain dengan ID: ${id}`);
  };

  return (
    <section className="px-6 py-10">
      {/* Tabs */}
      <HomeTab activeTab={activeTab} onSelect={setActiveTab} />

      {/* Card */}
      <HomeTable
        players={currentPlayers}
        matches={currentMatches}
        activeTab={activeTab}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}