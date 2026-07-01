/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { PlayerWithRank } from "@components/players/ranking-utils";

type Accent = "sky" | "pink";

type Props = { players: PlayerWithRank[]; accent: Accent };

const RANK_BADGE: Record<Accent, (rank: number) => string> = {
  sky: (rank) => {
    if (rank === 1) return "bg-yellow-400 text-slate-900 border-yellow-300 shadow-yellow-400/40";
    if (rank === 2) return "bg-slate-300 text-slate-900 border-slate-200 shadow-slate-300/40";
    if (rank === 3) return "bg-amber-600 text-white border-amber-500 shadow-amber-600/40";
    return "bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-sky-500/10";
  },
  pink: (rank) => {
    if (rank === 1) return "bg-yellow-400/20 text-yellow-400 border-yellow-400/40";
    if (rank === 2) return "bg-slate-400/20 text-slate-300 border-slate-400/40";
    if (rank === 3) return "bg-amber-700/20 text-amber-500 border-amber-700/40";
    return "bg-pink-500/15 text-pink-400 border-pink-500/40";
  },
};

const ACCENT: Record<Accent, {
  headerBg: string; headerBorder: string; headerText: string; hover: string;
  avatarBorder: string; avatarBg: string; avatarText: string; nickname: string;
}> = {
  sky: {
    headerBg: "bg-sky-500/10", headerBorder: "border-sky-500/20", headerText: "text-sky-400",
    hover: "hover:bg-sky-500/5 active:bg-sky-500/8",
    avatarBorder: "border-sky-500/40 shadow-sky-500/10", avatarBg: "bg-sky-500/10 border-sky-500/30", avatarText: "text-sky-400",
    nickname: "text-sky-400/60",
  },
  pink: {
    headerBg: "bg-pink-500/10", headerBorder: "border-pink-500/20", headerText: "text-pink-400",
    hover: "hover:bg-pink-500/5 active:bg-pink-500/8",
    avatarBorder: "border-pink-500/40 shadow-pink-500/10", avatarBg: "bg-pink-500/10 border-pink-500/30", avatarText: "text-pink-400",
    nickname: "text-pink-400/60",
  },
};

export default function RankingMobileList({ players, accent }: Props) {
  const c = ACCENT[accent];
  const rankBadge = RANK_BADGE[accent];

  return (
    <div className="md:hidden rounded-2xl overflow-hidden border border-white/8 bg-slate-900/60 shadow-xl">
      <div className={`grid grid-cols-[48px_1fr_56px] gap-2 px-4 py-3 border-b ${c.headerBg} ${c.headerBorder}`}>
        <span className={`text-[11px] font-black uppercase tracking-widest text-center ${c.headerText}`}>#</span>
        <span className={`text-[11px] font-black uppercase tracking-widest ${c.headerText}`}>Nama</span>
        <span className={`text-[11px] font-black uppercase tracking-widest text-right ${c.headerText}`}>Points</span>
      </div>

      {players.map((player) => (
        <Link
          key={player.id}
          href={`/players/${player.id}`}
          className={`w-full grid grid-cols-[48px_1fr_56px] gap-2 items-center px-4 py-3.5 border-b border-white/5 last:border-0 transition-colors text-left ${c.hover}`}
        >
          <div className="flex justify-center">
            <span className={`min-w-7 h-7 px-1.5 rounded-full flex items-center justify-center text-xs font-black border shadow-sm ${rankBadge(player.rank)}`}>
              {player.rank}
            </span>
          </div>

          <div className="flex items-center gap-2.5 min-w-0">
            {player.imgUrl ? (
              <img
                src={player.imgUrl}
                alt={player.name}
                className={`w-9 h-9 rounded-full object-cover border-2 shrink-0 shadow-md ${c.avatarBorder}`}
              />
            ) : (
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 ${c.avatarBg}`}>
                <span className={`font-black text-sm ${c.avatarText}`}>{player.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-sm text-slate-100 capitalize leading-tight truncate line-clamp-1">{player.name}</p>
              {player.nickname && (
                <p className={`text-[11px] italic leading-none mt-0.5 truncate capitalize ${c.nickname}`}>{player.nickname}</p>
              )}
            </div>
          </div>

          <p className="text-right font-bold text-slate-300 text-sm tabular-nums">
            {(player.points * 133).toLocaleString("id-ID")}
          </p>
        </Link>
      ))}
    </div>
  );
}
