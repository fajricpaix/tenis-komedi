"use client";

import { useState } from "react";
import { type Player } from "@utils/fetcher";
import PlayerDetailModal from "@components/players/players-detail-modal";

type Props = {
  players: Player[];
};

function getDaysUntilBirthday(birthDate: string): number {
  if (!birthDate) return 999;
  const today = new Date();
  const birth = new Date(birthDate);
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatBirthDate(birthDate: string): string {
  if (!birthDate) return "-";
  return new Date(birthDate).toLocaleDateString("id-ID", { day: "numeric", month: "long" });
}

function getBirthdayLabel(days: number): { label: string; className: string } {
  if (days === 0) return { label: "🎂 Hari ini!", className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" };
  if (days <= 7)  return { label: `${days} hari lagi`, className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" };
  if (days <= 30) return { label: `${days} hari lagi`, className: "text-blue-400 bg-blue-400/10 border-blue-400/20" };
  return { label: `${days} hari lagi`, className: "text-slate-400 bg-slate-400/10 border-slate-400/20" };
}

export default function BirthdayCards({ players }: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const safePlayers = Array.isArray(players) ? players : [];
  const upcomingBirthdays = safePlayers
    .filter((p) => !!p.birthDate)
    .map((p) => ({ ...p, daysUntil: getDaysUntilBirthday(p.birthDate) }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 6);

  if (upcomingBirthdays.length === 0) return null;

  return (
    <>
      <div className="md:order-2 md:w-3/5">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-lg md:text-3xl">🎂</span>
          <h2 className="font-bold text-slate-100 md:text-xl">Ulang Tahun Terdekat</h2>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:justify-center pb-2">
          {upcomingBirthdays.map((player, index) => {
            const { label, className } = getBirthdayLabel(player.daysUntil);
            return (
              <button
                key={player.id ?? index}
                onClick={() => setSelectedPlayerId(player.id)}
                className="shrink-0 w-44 md:w-full rounded-2xl border border-white/10 bg-slate-900/70 p-4 flex flex-col items-center gap-3 hover:border-blue-400 hover:bg-blue-950 transition-colors cursor-pointer text-left"
              >
                <img
                  src={player.imgUrl || (player.gender === "Pria" ? "/pria.jpg" : "/wanita.jpg")}
                  alt={player.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                />
                <div className="text-center">
                  <p className="font-semibold text-slate-100 text-sm leading-tight line-clamp-2 capitalize">{player.name}</p>
                  <p className="text-slate-500 text-xs mt-1">{formatBirthDate(player.birthDate)}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${className}`}>{label}</span>
                <div className="text-center">
                  <p className="text-xs">
                    Umurnya{" "}
                    <span className="font-semibold text-sm text-fuchsia-400">
                      {player.birthDate ? `${new Date().getFullYear() - new Date(player.birthDate).getFullYear()} tahun` : "Umur tidak diketahui"}
                    </span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedPlayerId !== null && (
        <PlayerDetailModal
          playerId={selectedPlayerId}
          onClose={() => setSelectedPlayerId(null)}
        />
      )}
    </>
  );
}
