"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { getTekoData, parseSetScore, type Player, type Match } from "@utils/fetcher";
import PlayerDetailModal from "@components/players/players-detail-modal";

function calculateAge(dateStr: string): number {
  const today = new Date();
  const d = new Date(dateStr);
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

type PlayerWithRank = Player & {
  rank: number;
  points: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  setWin: number;
  setLose: number;
};

function buildRankedPlayers(players: Player[], matches: Match[]): PlayerWithRank[] {
  const genderPlayers = players.filter((p) => p.gender === "Pria");
  const statsMap = new Map<string, Omit<PlayerWithRank, keyof Player | "rank">>();

  genderPlayers.forEach((p) => {
    statsMap.set(p.name, { wins: 0, losses: 0, setWin: 0, setLose: 0, points: 0, matchesPlayed: 0 });
  });

  matches.forEach((match) => {
    const [s1, s2] = parseSetScore(match.setScore);
    const isP1Win = match.winner === match.player1;
    const winnerScore = isP1Win ? s1 : s2;
    const loserScore = isP1Win ? s2 : s1;
    const loserName = isP1Win ? match.player2 : match.player1;

    const ws = statsMap.get(match.winner);
    const ls = statsMap.get(loserName);
    if (ws) { ws.matchesPlayed++; ws.wins++; ws.setWin += winnerScore; ws.setLose += loserScore; ws.points += 6 - loserScore; }
    if (ls) { ls.matchesPlayed++; ls.losses++; ls.setWin += loserScore; ls.setLose += winnerScore; ls.points += loserScore + 1; }
  });

  return genderPlayers
    .map((p) => ({ ...p, rank: 0, ...(statsMap.get(p.name) ?? { wins: 0, losses: 0, setWin: 0, setLose: 0, points: 0, matchesPlayed: 0 }) }))
    .sort((a, b) => b.points - a.points || b.wins - a.wins)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

const rankStyle = (rank: number) => {
  if (rank === 1) return { badge: "bg-yellow-400 text-slate-900 border-yellow-300 shadow-yellow-400/40", ring: "border-yellow-400/60 shadow-yellow-400/20" };
  if (rank === 2) return { badge: "bg-slate-300 text-slate-900 border-slate-200 shadow-slate-300/40", ring: "border-slate-400/60 shadow-slate-400/20" };
  if (rank === 3) return { badge: "bg-amber-600 text-white border-amber-500 shadow-amber-600/40", ring: "border-amber-600/60 shadow-amber-600/20" };
  return { badge: "bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-sky-500/10", ring: "border-sky-500/40 shadow-sky-500/10" };
};

export default function AtpRankingPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailPlayerId, setDetailPlayerId] = useState<number | null>(null);

  useEffect(() => {
    getTekoData()
      .then(({ players, matches }) => {
        setPlayers(Array.isArray(players) ? players : []);
        setMatches(Array.isArray(matches) ? matches : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const rankedPlayers = useMemo(() => buildRankedPlayers(players, matches), [players, matches]);

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">

      {/* Page Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-1 h-9 rounded-full bg-linear-to-b from-sky-400 to-sky-600" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-sky-400 tracking-wide">ATP Ranking</h1>
              </div>
              <p className="text-xs font-semibold mt-0.5">Aku Teko Pria · {rankedPlayers.length} Pria</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-sky-400/30 border-t-sky-400 animate-spin" />
          <p className="text-slate-500 text-sm">Memuat data pemain...</p>
        </div>
      ) : rankedPlayers.length === 0 ? (
        <div className="text-center py-20 text-slate-500">Belum ada data pemain pria 🏜️</div>
      ) : (
        <>
          {/* ── MOBILE: Table ────────────────────────────────────── */}
          <div className="md:hidden rounded-2xl overflow-hidden border border-white/8 bg-slate-900/60 shadow-xl">
            {/* Table header */}
            <div className="grid grid-cols-[48px_1fr_56px] gap-2 px-4 py-3 bg-sky-500/10 border-b border-sky-500/20">
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-400 text-center">#</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-400">Nama</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-400 text-right">Points</span>
            </div>

            {rankedPlayers.map((player) => {
              const { badge } = rankStyle(player.rank);
              return (
                <button
                  key={player.id}
                  onClick={() => setDetailPlayerId(player.id)}
                  className="w-full grid grid-cols-[48px_1fr_56px] gap-2 items-center px-4 py-3.5 border-b border-white/5 last:border-0 hover:bg-sky-500/5 active:bg-sky-500/8 transition-colors text-left"
                >
                  {/* Rank */}
                  <div className="flex justify-center">
                    <span className={`min-w-7 h-7 px-1.5 rounded-full flex items-center justify-center text-xs font-black border shadow-sm ${badge}`}>
                      {player.rank}
                    </span>
                  </div>

                  {/* Nama */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {player.imgUrl ? (
                      <img src={player.imgUrl} alt={player.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-sky-500/40 shrink-0 shadow-md shadow-sky-500/10"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-sky-500/10 border-2 border-sky-500/30 flex items-center justify-center shrink-0">
                        <span className="text-sky-400 font-black text-sm">{player.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-100 capitalize leading-tight truncate">{player.name}</p>
                      {player.nickname && (
                        <p className="text-[11px] text-sky-400/60 italic leading-none mt-0.5 truncate capitalize">{player.nickname}</p>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <p className="text-right font-bold text-slate-300 text-sm tabular-nums">
                    {player.points * 100}
                  </p>
                </button>
              );
            })}
          </div>

          {/* ── DESKTOP: Cards Grid ───────────────────────────────── */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {rankedPlayers.map((player) => {
              const { badge, ring } = rankStyle(player.rank);
              return (
                <button
                  key={player.id}
                  onClick={() => setDetailPlayerId(player.id)}
                  className="group relative bg-slate-900 border border-white/8 rounded-2xl overflow-hidden hover:border-sky-500/50 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer text-left"
                >
                  {/* Top gradient bar */}
                  <div className="h-1 w-full bg-linear-to-r from-sky-600 via-sky-400 to-cyan-400 group-hover:from-sky-400 group-hover:via-sky-300 transition-all duration-300" />

                  <div className="p-5 flex flex-col items-center">
                    {/* Photo circle */}
                    <div className="relative mb-5">
                      <div className={`w-22 h-22 rounded-full overflow-hidden border-[3px] shadow-lg transition-all duration-300 group-hover:scale-105 ${ring}`}>
                        {player.imgUrl ? (
                          <img src={player.imgUrl} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-sky-500/10 flex items-center justify-center">
                            <span className="text-sky-400 font-black text-3xl">{player.name.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                      </div>

                      {/* Rank badge overlapping bottom of circle */}
                      <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[11px] font-black border shadow-md whitespace-nowrap ${badge}`}>
                        #{player.rank}
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-center font-black text-slate-100 capitalize leading-snug mt-1 mb-1 group-hover:text-sky-300 transition-colors max-h-6 overflow-hidden">
                      {player.name}
                    </h3>

                    {/* Nickname */}
                    {player.nickname && (
                      <p className="text-[11px] text-sky-400/60 italic mb-2 text-center leading-none capitalize">{player.nickname}</p>
                    )}

                    {/* Flag + birthPlace */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-base">🇮🇩</span>
                      <span className="text-[11px] text-slate-500 capitalize truncate max-w-52">{player.birthPlace}</span>
                    </div>

                    {/* Age chip */}
                    {player.birthDate && (
                      <div className="mt-3 px-3 py-1 rounded-full flex items-center bg-sky-500/10 border border-sky-500/20 group-hover:bg-sky-500/15 transition-colors">
                        <span className="text-[11px] font-bold text-sky-400">
                          {calculateAge(player.birthDate)} tahun
                        </span>
                      </div>
                    )}

                    {/* Points row */}
                    <div className="mt-3 pt-3 border-t border-white/5 w-full flex items-center justify-between">
                      <span className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Poin</span>
                      <span className="text-sm font-black text-sky-400 group-hover:text-sky-300 transition-colors tabular-nums">
                        {player.points * 100}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {detailPlayerId !== null && (
        <PlayerDetailModal
          playerId={detailPlayerId}
          onClose={() => setDetailPlayerId(null)}
        />
      )}
    </div>
  );
}
