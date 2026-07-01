/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { calculateAge, type PlayerWithRank } from "@components/players/ranking-utils";

const atpRankStyle = (rank: number) => {
  if (rank === 1) return { badge: "bg-yellow-400 text-slate-900 border-yellow-300 shadow-yellow-400/40", ring: "border-yellow-400/60 shadow-yellow-400/20" };
  if (rank === 2) return { badge: "bg-slate-300 text-slate-900 border-slate-200 shadow-slate-300/40", ring: "border-slate-400/60 shadow-slate-400/20" };
  if (rank === 3) return { badge: "bg-amber-600 text-white border-amber-500 shadow-amber-600/40", ring: "border-amber-600/60 shadow-amber-600/20" };
  return { badge: "bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-sky-500/10", ring: "border-sky-500/40 shadow-sky-500/10" };
};

export function AtpDesktopGrid({ players }: { players: PlayerWithRank[] }) {
  return (
    <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {players.map((player) => {
        const { badge, ring } = atpRankStyle(player.rank);
        return (
          <Link
            key={player.id}
            href={`/players/${player.id}`}
            className="group relative bg-slate-900 border border-white/8 rounded-2xl overflow-hidden hover:border-sky-500/50 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer text-left"
          >
            <div className="h-1 w-full bg-linear-to-r from-sky-600 via-sky-400 to-cyan-400 group-hover:from-sky-400 group-hover:via-sky-300 transition-all duration-300" />

            <div className="p-5 flex flex-col items-center">
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

                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[11px] font-black border shadow-md whitespace-nowrap ${badge}`}>
                  #{player.rank}
                </div>
              </div>

              <h3 className="text-center font-black text-slate-100 capitalize leading-snug mt-1 mb-1 group-hover:text-sky-300 transition-colors line-clamp-1">
                {player.name}
              </h3>

              {player.nickname && (
                <p className="text-[11px] text-sky-400/60 italic mb-2 text-center leading-none capitalize">{player.nickname}</p>
              )}

              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-base">🇮🇩</span>
                <span className="text-[11px] text-slate-500 capitalize truncate max-w-52">{player.birthPlace}</span>
              </div>

              {player.birthDate && (
                <div className="mt-3 px-3 py-1 rounded-full flex items-center bg-sky-500/10 border border-sky-500/20 group-hover:bg-sky-500/15 transition-colors">
                  <span className="text-[11px] font-bold text-sky-400">
                    {calculateAge(player.birthDate)} tahun
                  </span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-white/5 w-full flex items-center justify-between">
                <span className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Poin</span>
                <span className="text-sm font-black text-sky-400 group-hover:text-sky-300 transition-colors tabular-nums">
                  {player.points * 100}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

const wtaRankColor = (rank: number) => {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-slate-300";
  if (rank === 3) return "text-amber-500";
  return "text-pink-400";
};

export function WtaDesktopGrid({ players }: { players: PlayerWithRank[] }) {
  return (
    <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {players.map((player) => (
        <Link
          key={player.id}
          href={`/players/${player.id}`}
          className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-white/8 hover:border-pink-500/50 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-pink-500/15 transition-all duration-300 cursor-pointer text-left"
        >
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

            <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-slate-950/50" />

            <div className="absolute top-3 left-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300/80 leading-none mb-0.5">Rank</p>
              <p className={`text-4xl font-black leading-none drop-shadow-lg ${wtaRankColor(player.rank)}`}>
                {player.rank}
              </p>
            </div>

            <div className="absolute bottom-0 inset-x-0 bg-linear-to-r from-fuchsia-950/90 via-pink-950/90 to-fuchsia-950/90 backdrop-blur-sm px-3 py-2 border-t border-pink-500/20">
              <p className="text-center text-xs font-black tracking-widest text-pink-300 uppercase">
                {player.points * 100} <span className="text-pink-500/60">Points</span>
              </p>
            </div>
          </div>

          <div className="px-3 pt-3 pb-3.5 bg-linear-to-b from-slate-900 to-slate-950">
            <h3 className="font-black text-slate-100 text-sm capitalize leading-snug group-hover:text-pink-300 transition-colors line-clamp-1">
              {player.name}
            </h3>

            {player.nickname && (
              <p className="text-[11px] text-pink-400/60 italic mt-0.5 leading-none normal-case">{player.nickname}</p>
            )}

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
        </Link>
      ))}
    </div>
  );
}
