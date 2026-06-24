"use client";

import { useState } from "react";
import { type Player } from "@utils/fetcher";
import PlayerDetailModal from "@components/players/players-detail-modal";

type Props = {
  players: Player[];
};

function getDaysUntilBirthday(birthDate: string): number {
  if (!birthDate) return 999;
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const birth = new Date(birthDate);
  const next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < todayMidnight) next.setFullYear(now.getFullYear() + 1);
  return Math.round((next.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
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

const SKILL_CONFIG: { key: keyof Player["skills"]; label: string; color: string }[] = [
  { key: "forehand", label: "Forehand",  color: "bg-blue-400"   },
  { key: "backhand", label: "Backhand",  color: "bg-violet-400" },
  { key: "service",  label: "Service",   color: "bg-emerald-400"},
  { key: "volley",   label: "Volley",    color: "bg-orange-400" },
  { key: "slice",    label: "Slice",     color: "bg-cyan-400"   },
  { key: "loop",     label: "Loop",      color: "bg-rose-400"   },
];

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

        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto overflow-y-hidden md:overflow-visible md:justify-center pb-2 md:pb-0">
          {upcomingBirthdays.map((player, index) => {
            const { label, className } = getBirthdayLabel(player.daysUntil);
            const isToday = player.daysUntil === 0;
            const skills = player.skills ?? {} as Player["skills"];

            const cardBorder = isToday
              ? "border-yellow-400/60 bg-yellow-500/10 shadow-lg shadow-yellow-500/10"
              : player.gender === "Pria"
                ? "border-white/10 bg-slate-900/70"
                : "border-white/10 bg-slate-900/70";

            const backBorder = isToday
              ? "border-yellow-400/40"
              : player.gender === "Pria"
                ? "border-blue-500/30"
                : "border-pink-500/30";

            return (
              /* Flip card wrapper — perspective needed on the outer container */
              <div
                key={player.id ?? index}
                className="shrink-0 w-44 md:w-full group cursor-pointer"
                style={{ perspective: "900px" }}
                onClick={() => setSelectedPlayerId(player.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelectedPlayerId(player.id)}
              >
                {/* Inner flipper — rotates on hover (desktop only) */}
                <div
                  className="relative w-full transition-transform duration-500 md:group-hover:transform-[rotateY(180deg)]"
                  style={{ transformStyle: "preserve-3d" }}
                >

                  {/* ── FRONT FACE ── */}
                  <div
                    className={`w-full min-h-56 rounded-2xl border p-4 flex flex-col items-center gap-3 transition-colors text-left relative overflow-hidden ${cardBorder}`}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {isToday && (
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-yellow-400 to-transparent" />
                    )}
                    <img
                      src={player.imgUrl || (player.gender === "Pria" ? "/pria.jpg" : "/wanita.jpg")}
                      alt={player.name}
                      className={`w-16 h-16 rounded-full object-cover border-2 ${isToday ? "border-yellow-400/60 ring-2 ring-yellow-400/30" : "border-white/10"}`}
                    />
                    <div className="text-center">
                      <p className="font-semibold text-slate-100 text-sm leading-tight line-clamp-1 capitalize">{player.name}</p>
                      <p className="text-slate-500 text-xs mt-1">{formatBirthDate(player.birthDate)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${className}`}>{label}</span>
                    <div className="text-center">
                      <p className="text-xs">
                        Umurnya{" "}
                        <span className="font-semibold text-sm text-fuchsia-400">
                          {player.birthDate
                            ? `${new Date().getFullYear() - new Date(player.birthDate).getFullYear()} tahun`
                            : "Umur tidak diketahui"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* ── BACK FACE (skill stats) ── */}
                  <div
                    className={`absolute inset-0 rounded-2xl border p-4 flex flex-col bg-slate-900/95 ${backBorder}`}
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    {/* Top: avatar + name */}
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={player.imgUrl || (player.gender === "Pria" ? "/pria.jpg" : "/wanita.jpg")}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                      />
                      <p className="text-sm font-bold text-slate-100 leading-tight capitalize line-clamp-2">{player.name}</p>
                    </div>

                    {/* Skill bars — semua kecuali skill terendah */}
                    <div className="flex flex-col gap-2 flex-1">
                      {(() => {
                        const lowestKey = SKILL_CONFIG.reduce((min, s) =>
                          (skills[s.key] ?? 0) < (skills[min.key] ?? 0) ? s : min
                        ).key;
                        return SKILL_CONFIG.filter((s) => s.key !== lowestKey);
                      })().map(({ key, label, color }) => {
                        const val = skills[key] ?? 0;
                        const pct = Math.max((val / 10) * 100, val > 0 ? 4 : 0);
                        return (
                          <div key={key}>
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-[10px] text-slate-400">{label}</span>
                              <span className="text-[10px] font-semibold text-slate-300">{val}</span>
                            </div>
                            <div className="h-1 rounded-full bg-slate-700/80 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${color} transition-all duration-700`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-center text-[9px] text-slate-600 mt-2 pt-1 border-t border-white/5">
                      klik untuk lihat detail
                    </p>
                  </div>

                </div>
              </div>
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
