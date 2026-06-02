"use client";

import { useMemo, useState } from "react";
import type { TeamKey } from "@components/home/tab";
import Link from "next/link";

type Player = {
  id: number;
  name: string;
  gender: "Pria" | "Wanita";
  imgUrl?: string;
};

type Match = {
  id: number;
  player1: string;
  player2: string;
  winner: string;
  setScore: string;
};

type PlayerWithStats = Player & {
  matchesPlayed: number;
  wins: number;
  losses: number;
  setWin: number;
  setLose: number;
  points: number;
};

type HomeTableProps = {
  players: PlayerWithStats[];
  matches: Match[];
  activeTab: TeamKey;
  onEdit: (id: number) => void;
};

export default function HomeTable({ players, activeTab, onEdit }: HomeTableProps) {
  const [search, setSearch] = useState("");

  const filteredPlayers = useMemo(
    () => players.filter((player) =>
      player.name.toLowerCase().includes(search.trim().toLowerCase()),
    ),
    [players, search],
  );

  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between gap-4 px-6 py-2 h-16 bg-white/3 border-b border-white/[0.07]">
        <h2 className="text-sm md:text-xl font-black text-slate-100">
          Tenis Komedi {activeTab}
        </h2>
        <input
          type="text"
          placeholder="Cari pemain..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="px-4 py-1 w-32 md:w-auto md:py-2 rounded-xl bg-slate-800 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-180 md:w-full text-sm">
          <thead>
            <tr className="bg-emerald-500/[0.07]">
              {[
                "#",
                "Nama Pemain",
                "Set",
                "Menang - Kalah",
                "Point",
                "Details",
              ].map((h) => (
                <th
                  key={h}
                  className={`px-5 py-3.5 ${h === "Nama Pemain" ? "text-left" : "text-center"} text-[0.7rem] font-extrabold uppercase text-emerald-400 border-b border-emerald-500/20 whitespace-nowrap`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-500 text-base">
                  {players.length === 0
                    ? "Tidak ada data pemain 🏜️"
                    : "Tidak ditemukan pemain dengan nama tersebut."}
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player, index) => (
                <tr
                  key={player.id}
                  className="border-b border-white/5 last:border-0 hover:bg-emerald-500/5 transition-colors duration-150"
                >
                  <td className="p-4 font-extrabold text-slate-500 text-center">
                    {index + 1}.
                  </td>
                  <td className="p-4 w-60">
                    <div className="flex items-center gap-3 font-bold text-slate-100 capitalize">
                      {player.imgUrl ? (
                        <img
                          src={player.imgUrl}
                          alt={player.name}
                          className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 shrink-0 flex items-center justify-center text-xs text-slate-400 font-bold">
                          {player.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {player.name}
                    </div>
                  </td>
                  <td className="text-center p-4 font-bold text-slate-200">
                    <span className="inline-block mb-2 text-xs">{player.setWin + player.setLose} Total Set</span>
                    <br />
                    <span className="px-2 py-1 bg-emerald-400/60 rounded">{player.setWin}</span> - <span className="px-2 py-1 bg-red-500/60 rounded">{player.setLose}</span>
                  </td>
                  <td className="text-center p-4 font-bold text-slate-200">
                    <span className="inline-block mb-2 text-xs">{player.matchesPlayed} Pertandingan</span>
                    <br />
                    <span className="px-2 py-1 bg-emerald-400/60 rounded">{player.wins}</span> - <span className="px-2 py-1 bg-red-500/60 rounded">{player.losses}</span>
                  </td>
                  <td className="text-center p-4 font-bold text-slate-400">
                    {player.points}
                  </td>
                  <td className="text-center px-5 py-4">
                    <Link
                      href={`/players/details?id=${player.id}`}
                      className="flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-green-300 text-xs font-bold tracking-wide hover:bg-green-500/20 hover:border-green-400/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-900/30 transition-all duration-150"
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
