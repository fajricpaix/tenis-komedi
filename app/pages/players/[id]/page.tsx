"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SkillsPlayerDetail from "@components/players/skills";
import PlayerDetailModal from "@components/players/players-detail-modal";
import { getTekoData, parseSetScore, type Player, type Match } from "@utils/fetcher";

function calculateAge(dateStr: string): number {
  if (!dateStr) return 0;
  const today = new Date();
  const d = new Date(dateStr);
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr));
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  const vis = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = Array.from(vis).sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("…");
    result.push(p);
  });
  return result;
}

type RankInfo = { rank: number; total: number; points: number; wins: number; losses: number };

export default function PlayerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [player, setPlayer] = useState<Player | null | undefined>(undefined);
  const [rankInfo, setRankInfo] = useState<RankInfo>({ rank: 0, total: 0, points: 0, wins: 0, losses: 0 });
  const [playerMatches, setPlayerMatches] = useState<Match[]>([]);
  const [matchPage, setMatchPage] = useState(1);
  const [matchesPageSize, setMatchesPageSize] = useState(6);
  const [mounted, setMounted] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const bgRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getTekoData()
      .then(({ players, matches }) => {
        const found = players.find((p) => String(p.id) === String(params.id));
        if (!found) { setPlayer(null); return; }
        setPlayer(found);

        const sameGender = players.filter((p) => p.gender === found.gender);
        const statsMap = new Map<string, { wins: number; losses: number; points: number }>();
        sameGender.forEach((p) => statsMap.set(p.name, { wins: 0, losses: 0, points: 0 }));

        matches.forEach((match) => {
          const [s1, s2] = parseSetScore(match.setScore);
          const isP1Win = match.winner === match.player1;
          const loserScore = isP1Win ? s2 : s1;
          const loserName = isP1Win ? match.player2 : match.player1;
          const ws = statsMap.get(match.winner);
          const ls = statsMap.get(loserName);
          if (ws) { ws.wins += 1; ws.points += 6 - loserScore; }
          if (ls) { ls.losses += 1; ls.points += loserScore + 1; }
        });

        const ranked = sameGender
          .map((p) => ({ id: p.id, ...(statsMap.get(p.name) ?? { wins: 0, losses: 0, points: 0 }) }))
          .sort((a, b) => b.points - a.points || b.wins - a.wins);

        const idx = ranked.findIndex((p) => String(p.id) === String(found.id));
        setRankInfo({
          rank: idx + 1,
          total: sameGender.length,
          points: ranked[idx]?.points ?? 0,
          wins: ranked[idx]?.wins ?? 0,
          losses: ranked[idx]?.losses ?? 0,
        });

        const ownMatches = matches
          .filter((m) => m.player1 === found.name || m.player2 === found.name)
          .sort((a, b) => {
            const da = a.matchDate ?? "";
            const db = b.matchDate ?? "";
            if (db !== da) return db < da ? -1 : 1;
            return b.id - a.id;
          });
        setPlayerMatches(ownMatches);
        setMatchPage(1);
      })
      .catch(() => setPlayer(null));
  }, [params.id]);

  // Trigger entrance animation once player data is ready
  useEffect(() => {
    if (!player) return;
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, [player]);

  // Show more matches per page on desktop (md breakpoint = 768px)
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => {
      setMatchesPageSize(mql.matches ? 10 : 6);
      setMatchPage(1);
    };
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Parallax background (desktop / non-touch only)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    if (prefersReducedMotion || isTouch) return;

    const handleScroll = () => {
      if (bgRef.current) bgRef.current.style.transform = `translateY(${window.scrollY * 0.35}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3D tilt on pointer move (desktop / non-touch only)
  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    if (isTouch) return;
    const el = tiltRef.current;
    if (!el) return;

    const handleMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * 16}deg) rotateX(${-py * 16}deg) scale3d(1.02,1.02,1.02)`;
    };
    const reset = () => {
      el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
    };

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", reset);
    };
  }, [player]);

  if (player === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
        <p className="text-slate-500 text-sm">Memuat data pemain...</p>
      </div>
    );
  }

  if (player === null) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-3 py-24 px-4">
        <h1 className="text-xl font-black text-white">Pemain tidak ditemukan</h1>
        <button
          onClick={() => router.back()}
          className="mt-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
        >
          ← Kembali
        </button>
      </div>
    );
  }

  const isAtp = player.gender === "Pria";
  const accent = isAtp
    ? { text: "text-sky-300", soft: "text-sky-400/70", bg: "bg-sky-500/10", border: "border-sky-500/25", ring: "border-sky-400/40", grad: "from-sky-500/25 via-sky-500/5 to-transparent", activePage: "bg-sky-500 border-sky-500 text-slate-900" }
    : { text: "text-pink-300", soft: "text-pink-400/70", bg: "bg-pink-500/10", border: "border-pink-500/25", ring: "border-pink-400/40", grad: "from-pink-500/25 via-pink-500/5 to-transparent", activePage: "bg-pink-500 border-pink-500 text-slate-900" };

  const totalMatchPages = Math.ceil(playerMatches.length / matchesPageSize);
  const pagedMatches = playerMatches.slice((matchPage - 1) * matchesPageSize, matchPage * matchesPageSize);

  return (
    <div className="relative overflow-hidden">
      {/* ── Parallax ambient background ── */}
      <div ref={bgRef} className="absolute inset-x-0 top-0 h-125 pointer-events-none" style={{ willChange: "transform" }}>
        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full blur-3xl bg-linear-to-b ${accent.grad}`} />
      </div>

      <div className="relative px-4 md:px-8 py-6 md:py-10 container mx-auto">
        {/* Back button + shareable card CTA */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span className="text-lg leading-none">←</span> Kembali
          </button>

          <button
            onClick={() => setShowCard(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 shadow-sm shadow-emerald-900/30 hover:bg-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            🎴 Kartu Pemain
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8">
          <div>
            {/* ── Hero: photo + identity ── */}
            <div
              className={`transition-all duration-700 ease-out ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="flex flex-col items-center text-center gap-4 md:flex-row md:items-center md:text-left md:gap-8">
                {/* 3D tilt photo card */}
                <div
                  ref={tiltRef}
                  className="shrink-0 transition-transform duration-300 ease-out"
                  style={{ transform: "perspective(900px) rotateY(0deg) rotateX(0deg)", transformStyle: "preserve-3d" }}
                >
                  <div className={`relative w-40 h-40 md:w-52 md:h-52 rounded-3xl overflow-hidden border-2 shadow-2xl ${accent.ring}`}>
                    <img
                      src={player.imgUrl || (isAtp ? "/pria.jpg" : "/wanita.jpg")}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                    {rankInfo.rank > 0 && (
                      <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-black backdrop-blur-sm border ${accent.bg} ${accent.border} ${accent.text}`}>
                        #{rankInfo.rank}
                      </div>
                    )}
                  </div>
                </div>

                {/* Identity */}
                <div className="min-w-0">
                  <p className={`text-xs font-black uppercase tracking-widest mb-1 ${accent.text}`}>
                    {isAtp ? "👨🏻‍💼 ATP" : "🧕🏻 WTA"} · Peringkat #{rankInfo.rank || "-"} / {rankInfo.total}
                  </p>
                  <h1 className="text-2xl md:text-4xl font-black text-white capitalize leading-tight">
                    {player.name}
                  </h1>
                  {player.nickname && (
                    <p className="text-sm md:text-base font-semibold text-slate-400 italic mt-0.5">
                      <span className="not-italic text-slate-600">A.K.A</span> <span className={`capitalize font-black ${accent.text}`}>{player.nickname}</span>
                    </p>
                  )}
                  <div className="flex items-center justify-center md:justify-start gap-1.5 mt-2.5">
                    <span className="text-base">🇮🇩</span>
                    <span className="text-sm text-slate-400 capitalize">{player.birthPlace}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Stat chips ── */}
            <div
              className={`grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 transition-all duration-700 ease-out delay-100 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              {[
                { icon: "📅", label: "Umur", value: player.birthDate ? `${calculateAge(player.birthDate)} Tahun` : "-", sub: formatShortDate(player.birthDate) },
                { icon: "🎾", label: "Main Sejak", value: player.startYear ? `${player.startYear}` : "-", sub: player.startMonth || "" },
                { icon: "🏆", label: "Poin", value: (rankInfo.points * 100).toLocaleString("id-ID"), sub: "Total poin" },
                { icon: "📊", label: "Pertandingan", value: `${rankInfo.wins} - ${rankInfo.losses}`, sub: "Menang - Kalah" },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl p-3.5 md:p-4 border ${accent.bg} ${accent.border}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{s.label}</span>
                    <span className="text-base leading-none">{s.icon}</span>
                  </div>
                  <p className="text-lg md:text-xl font-black text-white leading-tight">{s.value}</p>
                  {s.sub && <p className="text-[11px] text-slate-500 mt-0.5">{s.sub}</p>}
                </div>
              ))}
            </div>

            {/* ── Reason ── */}
            {player.reason && (
              <div
                className={`mt-6 px-5 py-4 rounded-2xl text-center border ${accent.border} bg-black/30 transition-all duration-700 ease-out delay-150 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              >
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Alasan Main Tenis</h3>
                <p className={`italic capitalize font-semibold ${accent.text}`}>&quot;{player.reason}&quot;</p>
              </div>
            )}
          </div>

          {/* ── Skills ── */}
          <div
            className={`mt-6 transition-all duration-700 ease-out delay-200 col-span-2 md:col-span-1 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-300 mb-3">Skill Pemain</h2>
            <div className={`rounded-2xl p-4 md:p-5 space-y-3 border bg-black/30 ${accent.border}`}>
              <SkillsPlayerDetail imgUrl="/icons/fore.webp"    skillName="Forehand" value={player.skills.forehand} />
              <SkillsPlayerDetail imgUrl="/icons/back.webp"    skillName="Backhand" value={player.skills.backhand} />
              <SkillsPlayerDetail imgUrl="/icons/service.webp" skillName="Service"  value={player.skills.service} />
              <SkillsPlayerDetail imgUrl="/icons/volley.webp"  skillName="Volley"   value={player.skills.volley} />
              <SkillsPlayerDetail imgUrl="/icons/slice.webp"   skillName="Slice"    value={player.skills.slice} />
              <SkillsPlayerDetail imgUrl="/icons/fore.webp"    skillName="Loop"     value={player.skills.loop} />
            </div>
          </div>

          {/* ── Match history ── */}
          <div
            className={`mt-6 transition-all duration-700 ease-out delay-300 col-span-2 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-300 mb-3">
              Riwayat Pertandingan <span className="text-slate-600 normal-case font-semibold">({playerMatches.length})</span>
            </h2>

            {playerMatches.length > 0 ? (
              <div className="space-y-2 md:grid md:grid-cols-2 md:gap-y-2 md:gap-x-8">
                {pagedMatches.map((m) => {
                  const [s1, s2] = parseSetScore(m.setScore);
                  const isP1Win = m.winner === m.player1;
                  return (
                    <div
                      key={m.id}
                      className={`rounded-xl px-4 py-3 relative border bg-black/30 ${accent.border}`}
                    >
                      <div className="flex items-center gap-1 w-90 md:w-140">
                        <span className={`font-bold text-xs md:text-sm capitalize truncate max-w-70 md: ${isP1Win ? accent.text : "text-slate-400"}`}>
                          {m.player1}
                        </span>
                        <span className="text-slate-600 font-black italic text-[10px] md:text-xs shrink-0">VS</span>
                        <span className={`font-bold text-xs md:text-sm capitalize truncate max-w-70 md: ${!isP1Win ? accent.text : "text-slate-400"}`}>
                          {m.player2}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 opacity-70 italic">
                        <p className="flex text-center text-3xl font-black tracking-tighter gap-0.5">
                          <span className={isP1Win ? accent.text : "text-slate-100"}>{s1}</span>
                          <span className="text-slate-100">-</span>
                          <span className={!isP1Win ? accent.text : "text-slate-100"}>{s2}</span>
                        </p>
                      </div>
                      {m.matchDate && (
                        <p className="text-[10px] md:text-xs text-slate-600">{formatShortDate(m.matchDate)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Belum ada riwayat pertandingan.</p>
            )}

            {totalMatchPages > 1 && (
              <div className="flex justify-center items-center gap-1 mt-4">
                <button
                  onClick={() => setMatchPage(1)}
                  disabled={matchPage === 1}
                  className="px-2 py-1.5 rounded-lg text-xs font-bold border border-white/10 text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  «
                </button>
                <button
                  onClick={() => setMatchPage((p) => p - 1)}
                  disabled={matchPage === 1}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-white/10 text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  ‹
                </button>

                {getPageNumbers(matchPage, totalMatchPages).map((p, i) =>
                  p === "…" ? (
                    <span key={`e${i}`} className="px-1.5 text-xs text-slate-600 select-none">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setMatchPage(p)}
                      className={`min-w-8 px-2 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        p === matchPage ? accent.activePage : "border-white/10 text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => setMatchPage((p) => p + 1)}
                  disabled={matchPage === totalMatchPages}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-white/10 text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  ›
                </button>
                <button
                  onClick={() => setMatchPage(totalMatchPages)}
                  disabled={matchPage === totalMatchPages}
                  className="px-2 py-1.5 rounded-lg text-xs font-bold border border-white/10 text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  »
                </button>
              </div>
            )}
          </div>
        </div>
        
      </div>

      {showCard && (
        <PlayerDetailModal playerId={player.id} onClose={() => setShowCard(false)} />
      )}
    </div>
  );
}
