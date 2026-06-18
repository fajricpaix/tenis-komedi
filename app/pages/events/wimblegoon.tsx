"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RulesModal from "@components/home/rule-of-wimblegoon";
import { getTekoData, type Match, type Champion, type Player, type Tournament } from "@utils/fetcher";

import { CategoryCard } from "@components/events/CardCategory";
import { SpectatorCarousel } from "@components/events/SpectatorCarousel";
import { FeaturedMatchGroup } from "@components/events/FeaturedMatchGroup";

type Tab = "detail" | "hasil";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function topWinRatio(catMatches: Match[], minGames = 3) {
  const stats = new Map<string, { wins: number; losses: number }>();
  for (const m of catMatches) {
    const loser = m.winner === m.player1 ? m.player2 : m.player1;
    const w = stats.get(m.winner) ?? { wins: 0, losses: 0 };
    const l = stats.get(loser) ?? { wins: 0, losses: 0 };
    stats.set(m.winner, { ...w, wins: w.wins + 1 });
    stats.set(loser, { ...l, losses: l.losses + 1 });
  }
  let best = { name: "", ratio: 0, wins: 0, total: 0 };
  for (const [name, s] of stats) {
    const total = s.wins + s.losses;
    if (total < minGames) continue;
    const ratio = s.wins / total;
    if (ratio > best.ratio || (ratio === best.ratio && total > best.total))
      best = { name, ratio, wins: s.wins, total };
  }
  return best;
}

function mostSpirited(catMatches: Match[], count = 3) {
  const stats = new Map<string, { wins: number; losses: number }>();
  for (const m of catMatches) {
    const loser = m.winner === m.player1 ? m.player2 : m.player1;
    const w = stats.get(m.winner) ?? { wins: 0, losses: 0 };
    const l = stats.get(loser) ?? { wins: 0, losses: 0 };
    stats.set(m.winner, { ...w, wins: w.wins + 1 });
    stats.set(loser, { ...l, losses: l.losses + 1 });
  }
  return Array.from(stats.entries())
    .filter(([, s]) => s.losses > 0)
    .sort(([, a], [, b]) => b.losses - a.losses || (b.wins + b.losses) - (a.wins + a.losses))
    .slice(0, count)
    .map(([name, s]) => ({ name, ...s }));
}

function uniquePlayerCount(catMatches: Match[]): number {
  const s = new Set<string>();
  catMatches.forEach(m => { s.add(m.player1.toLowerCase()); s.add(m.player2.toLowerCase()); });
  return s.size;
}

export default function WimblegoonEvent() {
  const [tab, setTab]           = useState<Tab>("detail");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [matches, setMatches]   = useState<Match[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [players, setPlayers]   = useState<Player[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    getTekoData().then(({ matches, players, tournaments }) => {
      setMatches(Array.isArray(matches) ? matches : []);
      setPlayers(Array.isArray(players) ? players : []);
      setChampions(tournaments[0]?.champion ?? []);
      setTournament(tournaments[0] ?? null);
    });
  }, []);

  const genderMap = useMemo(() => {
    const m = new Map<string, "Pria" | "Wanita">();
    players.forEach(p => m.set(p.name.toLowerCase().trim(), p.gender));
    return m;
  }, [players]);

  const playerImgMap = useMemo(() => {
    const m = new Map<string, string>();
    players.forEach(p => { if (p.imgUrl) m.set(p.name.toLowerCase().trim(), p.imgUrl); });
    return m;
  }, [players]);

  const { atpMatches, wtaMatches } = useMemo(() => {
    const atp: Match[] = [], wta: Match[] = [];
    for (const m of matches) {
      const g1 = genderMap.get(m.player1.toLowerCase().trim());
      const g2 = genderMap.get(m.player2.toLowerCase().trim());
      if (g1 === "Pria" && g2 === "Pria") atp.push(m);
      else if (g1 === "Wanita" && g2 === "Wanita") wta.push(m);
    }
    return { atpMatches: atp, wtaMatches: wta };
  }, [matches, genderMap]);

  const dateRange = useMemo(() => {
    const dates = matches.map(m => m.matchDate).filter(Boolean).sort() as string[];
    return dates.length ? { start: dates[0], end: dates[dates.length - 1] } : null;
  }, [matches]);

  const atpWinRatio  = useMemo(() => topWinRatio(atpMatches), [atpMatches]);
  const wtaWinRatio  = useMemo(() => topWinRatio(wtaMatches), [wtaMatches]);
  const atpSpirited  = useMemo(() => mostSpirited(atpMatches), [atpMatches]);
  const wtaSpirited  = useMemo(() => mostSpirited(wtaMatches), [wtaMatches]);

  const featuredAtp = useMemo(() =>
    (tournament?.featuredMatches?.atp ?? []).map(id => matches.find(m => m.id === id)).filter(Boolean) as Match[],
    [tournament, matches]
  );
  const featuredWta = useMemo(() =>
    (tournament?.featuredMatches?.wta ?? []).map(id => matches.find(m => m.id === id)).filter(Boolean) as Match[],
    [tournament, matches]
  );

  const champFor = (cat: "atp" | "wta", pos: 1 | 2) =>
    champions.find(c => c.category === cat && c.position === pos);

  const spectators = tournament?.spectators ?? [];

  return (
    <div className="min-h-screen pb-16">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative w-full aspect-video md:aspect-21/8 overflow-hidden bg-slate-900">
        <Image
          src="https://fjmioptzuenhifplfiii.supabase.co/storage/v1/object/public/events/wimblegoon.jpg"
          alt="TeKo Wimblegoon 2026"
          fill sizes="100vw"
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 md:px-10 md:pb-10">
          <span className="inline-block text-xs md:text-sm font-black tracking-widest uppercase bg-emerald-500 text-slate-950 px-3 py-1 rounded-full mb-3">
            Event Aktif
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">
            🎾 TeKo Wimblegoon 2026
          </h1>
          <p className="text-slate-300 mt-2 text-sm md:text-base italic">
            Sedikit Kompetisi, Banyakin Haha Hihi
          </p>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-5 md:px-6 mt-8 space-y-6">

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors">
          ← Kembali
        </Link>

        {/* ── Tab ─────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 rounded-2xl bg-slate-900/80 border border-white/8">
          {(["detail", "hasil"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                tab === t ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30" : "text-slate-500 hover:text-slate-300"
              }`}>
              {t === "detail" ? "Detail" : "Ringkasan Event"}
            </button>
          ))}
        </div>

        {/* ══ TAB: DETAIL ══════════════════════════════════════ */}
        {tab === "detail" && (
          <div className="space-y-8">
            <div className="grid grid-cols-3 divide-x divide-white/8 rounded-2xl overflow-hidden border border-white/8 bg-slate-900/60">
              <div className="text-center px-3 py-4">
                <p className="text-xs md:text-sm uppercase tracking-widest text-slate-500 mb-1.5">Penyisihan</p>
                <p className="text-xs md:text-sm font-bold text-slate-200 leading-snug">4 – 24<br />Juni 2026</p>
              </div>
              <div className="text-center px-3 py-4">
                <p className="text-xs md:text-sm uppercase tracking-widest text-slate-500 mb-1.5">Semifinal</p>
                <p className="text-xs md:text-sm font-bold text-slate-200 leading-snug">26<br />Juni 2026</p>
              </div>
              <div className="text-center px-3 py-4">
                <p className="text-xs md:text-sm uppercase tracking-widest text-slate-500 mb-1.5">Final</p>
                <p className="text-xs md:text-sm font-bold text-emerald-400 leading-snug">27<br />Juni 2026 🏆</p>
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">Tentang Event</h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Siapkan raket terbaikmu dan bergabung di turnamen tenis paling seru tahun ini!
                Bukan cuma soal menang dan kalah, tapi juga soal kebersamaan, sportivitas,
                dan tentunya banyak tawa di lapangan. 😆
              </p>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Final turnamen digelar bersamaan dengan{" "}
                <span className="font-bold text-emerald-300">Ulang Tahun & Launching Jersey Tenis Komedi</span>{" "}
                — jadi bukan cuma pertandingan, tapi juga perayaan besar-besaran! 🎉
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">📅 Jadwal Lengkap</h2>
              <div className="rounded-2xl overflow-hidden border border-white/8 divide-y divide-white/5">
                {[
                  { icon: "🎾", label: "Penyisihan & Pengumpulan Poin", date: "4 – 24 Juni 2026",  accent: false },
                  { icon: "🎾", label: "Semifinal",                     date: "26 Juni 2026",       accent: false },
                  { icon: "🏆", label: "Final",                         date: "27 Juni 2026",       accent: true  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between bg-slate-900/60 px-5 py-3.5 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-base shrink-0">{row.icon}</span>
                      <span className="text-sm text-slate-300">{row.label}</span>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${row.accent ? "text-emerald-400" : "text-slate-200"}`}>{row.date}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">👥 Kategori</h2>
              <div className="flex flex-wrap gap-2">
                {["Single Bapak-Bapak", "Single Ibu-Ibu"].map((cat) => (
                  <span key={cat} className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm font-bold">
                    {cat}
                  </span>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">🔥 Format Liga</h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Kumpulkan poin sebanyak-banyaknya selama fase penyisihan untuk mengamankan tempat di babak semifinal!
              </p>
              <ul className="space-y-2.5">
                {["Main serius boleh", "Ngakak lebih boleh", "Persahabatan nomor satu"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex flex-col items-center gap-3 pt-2 border-t border-white/5">
              <button onClick={() => setRulesOpen(true)}
                className="w-full px-6 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-colors cursor-pointer">
                ℹ️ Lihat Aturan Main Wimblegoon
              </button>
              <p className="text-xs text-slate-500 italic">🎾😄 Siap Raket, Siap Ketawa!</p>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed text-center">
              #TeKoWimblegoon2026 #TenisKomedi #SedikitKompetisiBanyakinHahaHihi #GameSetHaha
              #SingleBapakBapak #SingleIbuIbu #TenisLagoon #FunTournament #TennisCommunity #TenisIndonesia
            </p>
          </div>
        )}

        {/* ══ TAB: RINGKASAN EVENT ══════════════════════════════ */}
        {tab === "hasil" && (
          <div className="space-y-6">

            {/* ── Info Turnamen ─────────────────────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
              <div className="px-5 py-3.5 bg-emerald-500/8 border-b border-emerald-500/15">
                <p className="text-xs md:text-sm font-black uppercase tracking-widest text-emerald-400">📊 Info Turnamen</p>
              </div>

              <div className="divide-y divide-white/5">
                {[
                  { label: "Nama Turnamen", value: tournament?.title ?? "—" },
                  { label: "Total Pertandingan", value: String(matches.length) },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between px-5 py-3 gap-4">
                    <span className="text-xs text-slate-500 shrink-0">{row.label}</span>
                    <span className="text-xs font-bold text-slate-200 text-right">{row.value}</span>
                  </div>
                ))}

                {/* ATP Win Ratio */}
                {atpWinRatio.name && (
                  <div className="flex items-center justify-between px-5 py-3 gap-4">
                    <div>
                      <span className="text-xs md:text-sm font-black bg-sky-500 text-white px-1.5 py-0.5 rounded">ATP</span>
                      <span className="text-xs md:text-sm block text-slate-500">Rasio Kemenangan Tertinggi</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 capitalize">{atpWinRatio.name}</span>
                      <span className="text-xs md:text-sm block text-right font-black text-sky-400 whitespace-nowrap">
                        {Math.round(atpWinRatio.ratio * 100)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* WTA Win Ratio */}
                {wtaWinRatio.name && (
                  <div className="flex items-center justify-between px-5 py-3 gap-4">
                    <div>
                      <span className="text-xs md:text-sm font-black bg-pink-500 text-white px-1.5 py-0.5 rounded">WTA</span>
                      <span className="text-xs md:text-sm block text-slate-500">Rasio Kemenangan Tertinggi</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 capitalize">{wtaWinRatio.name}</span>
                      <span className="text-xs md:text-sm block text-right font-black text-pink-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {Math.round(wtaWinRatio.ratio * 100)}% ({wtaWinRatio.wins}/{wtaWinRatio.total})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {spectators.length > 0 && (
                <SpectatorCarousel spectators={spectators} tournamentTitle={tournament?.title} />
              )}
            </div>

            {/* ── ATP Category ──────────────────────────────────── */}
            <CategoryCard
              label="ATP" groupName="Aku Teko Pria"
              color="sky"
              totalMatches={atpMatches.length}
              totalPlayers={uniquePlayerCount(atpMatches)}
              champ1={champFor("atp", 1)}
              champ2={champFor("atp", 2)}
              spirited={atpSpirited}
              playerImgMap={playerImgMap}
            />

            {/* ── WTA Category ──────────────────────────────────── */}
            <CategoryCard
              label="WTA" groupName="Wanita Teko Aku"
              color="pink"
              totalMatches={wtaMatches.length}
              totalPlayers={uniquePlayerCount(wtaMatches)}
              champ1={champFor("wta", 1)}
              champ2={champFor("wta", 2)}
              spirited={wtaSpirited}
              playerImgMap={playerImgMap}
            />

            {/* ── Pertandingan Paling Menarik ───────────────────── */}
            {(featuredAtp.length > 0 || featuredWta.length > 0) && (
              <section className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">🎯 Pertandingan Paling Menarik</h2>

                {featuredAtp.length > 0 && (
                  <FeaturedMatchGroup label="ATP" groupName="Aku Teko Pria" color="sky" featuredMatches={featuredAtp} />
                )}
                {featuredWta.length > 0 && (
                  <FeaturedMatchGroup label="WTA" groupName="Wanita Teko Aku" color="pink" featuredMatches={featuredWta} />
                )}
              </section>
            )}
          </div>
        )}

      </div>

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
    </div>
  );
}

