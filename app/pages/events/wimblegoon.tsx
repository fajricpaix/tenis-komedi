"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RulesModal from "@components/home/rule-of-wimblegoon";

export default function WimblegoonEvent() {
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="min-h-screen pb-16">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative w-full aspect-video md:aspect-21/8 overflow-hidden bg-slate-900">
        <Image
          src="https://fjmioptzuenhifplfiii.supabase.co/storage/v1/object/public/events/wimblegoon.jpg"
          alt="TeKo Wimblegoon 2026"
          fill
          sizes="100vw"
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 md:px-10 md:pb-10">
          <span className="inline-block text-[10px] font-black tracking-widest uppercase bg-emerald-500 text-slate-950 px-3 py-1 rounded-full mb-3">
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
      <div className="max-w-2xl mx-auto px-5 md:px-6 mt-8 space-y-10">

        {/* Tombol kembali */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          ← Kembali
        </Link>

        {/* Jadwal ringkas */}
        <div className="grid grid-cols-3 divide-x divide-white/8 rounded-2xl overflow-hidden border border-white/8 bg-slate-900/60">
          <div className="text-center px-3 py-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Penyisihan</p>
            <p className="text-xs md:text-sm font-bold text-slate-200 leading-snug">4 – 24<br />Juni 2026</p>
          </div>
          <div className="text-center px-3 py-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Semifinal</p>
            <p className="text-xs md:text-sm font-bold text-slate-200 leading-snug">26<br />Juni 2026</p>
          </div>
          <div className="text-center px-3 py-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Final</p>
            <p className="text-xs md:text-sm font-bold text-emerald-400 leading-snug">27<br />Juni 2026 🏆</p>
          </div>
        </div>

        {/* Tentang */}
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

        {/* Jadwal lengkap */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">📅 Jadwal Lengkap</h2>
          <div className="rounded-2xl overflow-hidden border border-white/8 divide-y divide-white/5">
            {[
              { icon: "🎾", label: "Pengumpulan Poin", date: "4 – 24 Juni 2026",  accent: false },
              { icon: "🎾", label: "Semifinal",                     date: "26 Juni 2026",       accent: false },
              { icon: "🏆", label: "Final",                         date: "27 Juni 2026",       accent: true  },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between bg-slate-900/60 px-5 py-3.5 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base shrink-0">{row.icon}</span>
                  <span className="text-sm text-slate-300">{row.label}</span>
                </div>
                <span className={`text-sm font-bold shrink-0 ${row.accent ? "text-emerald-400" : "text-slate-200"}`}>
                  {row.date}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 italic px-1">
            Final bersamaan dengan acara Ulang Tahun & Launching Jersey Tenis Komedi.
          </p>
        </section>

        {/* Kategori */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">👥 Kategori</h2>
          <div className="flex flex-wrap gap-2">
            {["Single Bapak-Bapak", "Single Ibu-Ibu"].map((cat) => (
              <span
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-bold border ${cat === "Single Bapak-Bapak" ? ' bg-sky-500/15 text-sky-300 border border-sky-500/25' : 'bg-pink-500/15 text-pink-400 border border-pink-500/25' }`}
              >
                {cat}
              </span>
            ))}
          </div>
        </section>

        {/* Format */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">🔥 Format Liga</h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Kumpulkan poin sebanyak-banyaknya selama fase penyisihan untuk mengamankan
            tempat di babak semifinal!
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

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 pt-2 border-t border-white/5">
          <button
            onClick={() => setRulesOpen(true)}
            className="w-full px-6 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-colors cursor-pointer"
          >
            ℹ️ Lihat Aturan Main Wimblegoon
          </button>
          <p className="text-xs text-slate-500 italic">🎾😄 Siap Raket, Siap Ketawa!</p>
        </div>

        {/* Hashtag */}
        <p className="text-[11px] text-slate-600 leading-relaxed text-center">
          #TeKoWimblegoon2026 #TenisKomedi #SedikitKompetisiBanyakinHahaHihi #GameSetHaha
          #SingleBapakBapak #SingleIbuIbu #TenisLagoon #FunTournament #TennisCommunity #TenisIndonesia
        </p>

      </div>

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
    </div>
  );
}
