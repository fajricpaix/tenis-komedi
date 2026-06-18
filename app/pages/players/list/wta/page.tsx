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
  const genderPlayers = players.filter((p) => p.gender === "Wanita");
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

const rankBadge = (rank: number) => {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-slate-300";
  if (rank === 3) return "text-amber-500";
  return "text-pink-400";
};

const rankMobileBadge = (rank: number) => {
  if (rank === 1) return "bg-yellow-400/20 text-yellow-400 border-yellow-400/40";
  if (rank === 2) return "bg-slate-400/20 text-slate-300 border-slate-400/40";
  if (rank === 3) return "bg-amber-700/20 text-amber-500 border-amber-700/40";
  return "bg-pink-500/15 text-pink-400 border-pink-500/40";
};

export default function WtaRankingPage() {
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
    <div className="px-4 py-6 max-w-7xl mx-auto">

      {/* Page Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-1 h-9 rounded-full bg-linear-to-b from-pink-400 to-fuchsia-600" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-pink-400 tracking-wide">WTA Ranking</h1>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{rankedPlayers.length} pemain terdaftar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Poin */}
      <details className="mb-6 group rounded-2xl border border-pink-500/20 bg-pink-500/5 overflow-hidden">
        <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none list-none">
          <div className="flex items-center gap-2">
            <span className="text-pink-400 text-sm">ℹ️</span>
            <span className="text-xs font-black uppercase tracking-widest text-pink-400">Cara Perhitungan Poin</span>
          </div>
          <svg className="w-4 h-4 text-pink-400/60 transition-transform duration-200 group-open:rotate-180"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>

        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            Poin diperoleh dari hasil setiap pertandingan dalam turnamen, kemudian dikalikan <span className="font-bold text-pink-300">× 100</span>.
          </p>

          <div className="rounded-xl overflow-hidden border border-pink-500/15">
            <div className="grid grid-cols-3 bg-pink-500/10 px-4 py-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Hasil Set</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 text-center">Poin Menang</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 text-right">Poin Kalah</span>
            </div>
            {[
              { set: "3 – 0", win: 600, lose: 100 },
              { set: "3 – 1", win: 500, lose: 200 },
              { set: "3 – 2", win: 400, lose: 300 },
            ].map((row) => (
              <div key={row.set} className="grid grid-cols-3 px-4 py-2.5 border-t border-pink-500/10 bg-slate-900/40">
                <span className="text-xs font-bold text-slate-300">{row.set}</span>
                <span className="text-xs font-black text-pink-400 text-center">+{row.win}</span>
                <span className="text-xs font-bold text-slate-500 text-right">+{row.lose}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-600 italic">
            Semakin besar selisih set, semakin banyak poin yang didapat pemenang.
          </p>
        </div>
      </details>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-pink-400/30 border-t-pink-400 animate-spin" />
          <p className="text-slate-500 text-sm">Memuat data pemain...</p>
        </div>
      ) : rankedPlayers.length === 0 ? (
        <div className="text-center py-20 text-slate-500">Belum ada data pemain wanita 🏜️</div>
      ) : (
        <>
          {/* ── Race to Champions {new Date().getFullYear()} ─────────────────────────── */}
          <div className="mb-7 rounded-2xl border border-pink-500/20 bg-pink-500/5 overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-pink-500/10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-0.5">🏁 Race to Champions {new Date().getFullYear()}</p>
                <p className="text-xs text-slate-400">4 besar akan adu kekuatan memperebutkan gelar</p>
              </div>
              <span className="shrink-0 text-xs font-black text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                🏆 PALING KOMEDI
              </span>
            </div>

            {/* 8 pemain */}
            <div className="p-4 grid grid-cols-4 gap-x-2 gap-y-4">
              {rankedPlayers.slice(0, 4).map((player) => (
                <div key={player.id} className="flex flex-col items-center gap-1">
                  <div className="relative">
                    {player.imgUrl ? (
                      <img src={player.imgUrl} alt={player.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-pink-500/40 shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-pink-500/10 border-2 border-pink-500/30 flex items-center justify-center">
                        <span className="text-pink-400 font-black text-base">{player.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-slate-950 bg-pink-500 text-white`}>
                      {player.rank}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-300 capitalize text-center truncate w-full leading-tight px-1">
                    {player.name}
                  </p>
                  <p className="text-[10px] font-black text-pink-400 tabular-nums">{(player.points * 100).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── MOBILE: Table ────────────────────────────────────── */}
          <div className="md:hidden rounded-2xl overflow-hidden border border-white/8 bg-slate-900/60 shadow-xl">
            {/* Header */}
            <div className="grid grid-cols-[48px_1fr_56px] gap-2 px-4 py-3 bg-pink-500/10 border-b border-pink-500/20">
              <span className="text-[11px] font-black uppercase tracking-widest text-pink-400 text-center">#</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-pink-400">Nama</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-pink-400 text-right">Points</span>
            </div>

            {rankedPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => setDetailPlayerId(player.id)}
                className="w-full grid grid-cols-[48px_1fr_56px] gap-2 items-center px-4 py-3.5 border-b border-white/5 last:border-0 hover:bg-pink-500/5 active:bg-pink-500/8 transition-colors text-left"
              >
                {/* Rank */}
                <div className="flex justify-center">
                  <span className={`min-w-7 h-7 px-1.5 rounded-full flex items-center justify-center text-xs font-black border shadow-sm ${rankMobileBadge(player.rank)}`}>
                    {player.rank}
                  </span>
                </div>

                {/* Nama */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {player.imgUrl ? (
                    <img src={player.imgUrl} alt={player.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-pink-500/40 shrink-0 shadow-md shadow-pink-500/10"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-pink-500/10 border-2 border-pink-500/30 flex items-center justify-center shrink-0">
                      <span className="text-pink-400 font-black text-sm">{player.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-100 capitalize leading-tight truncate line-clamp-1">{player.name}</p>
                    {player.nickname && (
                      <p className="text-[11px] text-pink-400/60 italic leading-none mt-0.5 truncate capitalize">{player.nickname}</p>
                    )}
                  </div>
                </div>

                {/* Points */}
                <p className="text-right font-bold text-slate-300 text-sm tabular-nums">
                  {player.points * 100}
                </p>
              </button>
            ))}
          </div>

          {/* ── DESKTOP: Cards Grid ───────────────────────────────── */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {rankedPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => setDetailPlayerId(player.id)}
                className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-white/8 hover:border-pink-500/50 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-pink-500/15 transition-all duration-300 cursor-pointer text-left"
              >
                {/* Photo area — portrait fill */}
                <div className="relative w-full aspect-3/4 overflow-hidden bg-slate-800">
                  {player.imgUrl ? (
                    <img
                      src={player.imgUrl}
                      alt={player.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-b from-fuchsia-950 to-slate-900 gap-3">
                      <div className="w-20 h-20 rounded-full bg-pink-500/10 border-2 border-pink-500/30 flex items-center justify-center">
                        <span className="text-pink-400 font-black text-4xl">{player.name.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                  )}

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-slate-950/50" />

                  {/* Rank — top left */}
                  <div className="absolute top-3 left-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300/80 leading-none mb-0.5">Rank</p>
                    <p className={`text-4xl font-black leading-none drop-shadow-lg ${rankBadge(player.rank)}`}>
                      {player.rank}
                    </p>
                  </div>

                  {/* Points bar — bottom of photo */}
                  <div className="absolute bottom-0 inset-x-0 bg-linear-to-r from-fuchsia-950/90 via-pink-950/90 to-fuchsia-950/90 backdrop-blur-sm px-3 py-2 border-t border-pink-500/20">
                    <p className="text-center text-xs font-black tracking-widest text-pink-300 uppercase">
                      {player.points * 100} <span className="text-pink-500/60">Points</span>
                    </p>
                  </div>
                </div>

                {/* Info area */}
                <div className="px-3 pt-3 pb-3.5 bg-linear-to-b from-slate-900 to-slate-950">
                  {/* Name */}
                  <h3 className="font-black text-slate-100 text-sm capitalize leading-snug group-hover:text-pink-300 transition-colors line-clamp-1">
                    {player.name}
                  </h3>

                  {/* Nickname */}
                  {player.nickname && (
                    <p className="text-[11px] text-pink-400/60 italic mt-0.5 leading-none normal-case">{player.nickname}</p>
                  )}

                  {/* Flag + age row */}
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🇮🇩</span>
                      <span className="text-[11px] text-slate-500 capitalize truncate">{player.birthPlace}</span>
                    </div>
                    {player.birthDate && (
                      <span className="text-[11px] font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">
                        {calculateAge(player.birthDate)} th
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
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
