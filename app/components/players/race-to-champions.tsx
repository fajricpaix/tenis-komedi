/* eslint-disable @next/next/no-img-element */

import type { PlayerWithRank } from "@components/players/ranking-utils";

type Accent = "sky" | "pink";

type Props = { players: PlayerWithRank[]; accent: Accent };

const ACCENT: Record<Accent, {
  text: string; border: string; bg: string; headerBorder: string;
  avatarBorder: string; avatarBg: string; avatarBgBorder: string; badgeBg: string;
}> = {
  sky: {
    text: "text-sky-400", border: "border-sky-500/20", bg: "bg-sky-500/20", headerBorder: "border-sky-500/10",
    avatarBorder: "border-sky-500/40", avatarBg: "bg-sky-500/10", avatarBgBorder: "border-sky-500/30", badgeBg: "bg-sky-500",
  },
  pink: {
    text: "text-pink-400", border: "border-pink-500/20", bg: "bg-pink-500/20", headerBorder: "border-pink-500/10",
    avatarBorder: "border-pink-500/40", avatarBg: "bg-pink-500/10", avatarBgBorder: "border-pink-500/30", badgeBg: "bg-pink-500",
  },
};

export default function RaceToChampions({ players, accent }: Props) {
  const c = ACCENT[accent];
  const year = new Date().getFullYear();

  return (
    <div className={`mb-7 rounded-2xl border overflow-hidden ${c.border} ${c.bg}`}>
      <div className={`px-5 pt-4 pb-3 flex items-start justify-between gap-3 border-b ${c.headerBorder}`}>
        <div>
          <p className={`text-[10px] md:text-base font-black uppercase tracking-widest mb-0.5 ${c.text}`}>
            🏁 Race to Champions {year}
          </p>
          <p className="text-xs md:text-sm text-slate-400">
            8 besar mungkin akan diadu kekuatan memperebutkan gelar di akhir tahun {year}
          </p>
        </div>
        <span className="shrink-0 text-xs md:text-base font-black text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full whitespace-nowrap">
          🏆 PALING KOMEDI
        </span>
      </div>

      <div className="p-4 grid grid-cols-4 gap-x-2 gap-y-4">
        {players.slice(0, 8).map((player) => (
          <div key={player.id} className="flex flex-col items-center gap-1">
            <div className="relative">
              {player.imgUrl ? (
                <img
                  src={player.imgUrl}
                  alt={player.name}
                  className={`w-12 md:w-24 h-12 md:h-24 rounded-full object-cover border-2 shadow-md ${c.avatarBorder}`}
                />
              ) : (
                <div className={`w-12 md:w-24 h-12 md:h-24 rounded-full border-2 flex items-center justify-center ${c.avatarBg} ${c.avatarBgBorder}`}>
                  <span className={`font-black text-base md:text-4xl ${c.text}`}>{player.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <span className={`absolute -bottom-1 -right-1 w-5 md:w-8 h-5 md:h-8 rounded-full text-[10px] md:text-base font-black flex items-center justify-center border-2 border-slate-950 text-white ${c.badgeBg}`}>
                {player.rank}
              </span>
            </div>
            <p className="text-[10px] md:text-sm font-bold text-slate-300 capitalize text-center truncate w-full leading-tight px-1">
              {player.name}
            </p>
            <p className={`text-[10px] md:text-sm font-black tabular-nums ${c.text}`}>
              {(player.points * 133).toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
