"use client";

import { useState } from "react";
import Image from "next/image";
import RulesModal from "@components/home/rule-of-wimblegoon";

export default function EventCard() {
  const [expanded, setExpanded] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="md:order-1 md:w-2/5 mt-6 md:mt-0">
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-lg md:text-3xl">📅</span>
        <h2 className="font-bold text-slate-100 md:text-xl">Event Tenis Komedi</h2>
      </div>

      <div className="mb-6 rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl shadow-emerald-900/20 bg-slate-900">
        {/* Hero Photo */}
        <div className="relative w-full aspect-video">
          <Image
            src="/events/wimblegoon.jpg"
            alt="TeKo Wimblegoon 2026"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-xs font-black tracking-widest uppercase text-emerald-400 mb-1">Event Aktif</p>
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
              🎾 TeKo Wimblegoon 2026
            </h2>
            <p className="text-sm text-slate-300 mt-1 italic">Sedikit Kompetisi, Banyakin Haha Hihi</p>
          </div>
        </div>

        {/* Info Singkat */}
        <div className="px-5 py-4 grid grid-cols-3 gap-3 border-b border-white/[0.07]">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Penyisihan</p>
            <p className="text-xs font-bold text-slate-200">4 - 24 Juni 2026</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Semifinal</p>
            <p className="text-xs font-bold text-slate-200">26 Juni 2026</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Final</p>
            <p className="text-xs font-bold text-emerald-400">27 Juni 2026 🏆</p>
          </div>

          <button
            onClick={() => setRulesOpen(true)}
            className="col-span-3 mt-2 text-xs text-center text-emerald-400 hover:text-emerald-300 transition-colors capitalize flex gap-x-1 justify-center cursor-pointer"
          >
            ℹ️ <span className="underline">Aturan main wimblegoon</span>
          </button>
        </div>

        {/* Toggle Detail */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full px-5 py-3 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 cursor-pointer capitalize"
        >
          {expanded ? "Sembunyikan detail ▲" : "Lihat detail event ▼"}
        </button>

        {expanded && (
          <div className="px-5 pb-5 space-y-4 text-sm text-slate-300">
            <p>
              Siapkan raket terbaikmu dan bergabung di turnamen tenis paling seru tahun ini!
              Bukan cuma soal menang dan kalah, tapi juga soal kebersamaan, sportivitas, dan tentunya banyak tawa di lapangan. 😆
            </p>

            <div className="rounded-xl bg-white/3 border border-white/10 p-4 space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">📅 Jadwal Turnamen</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex gap-3">
                  <span className="text-slate-500 shrink-0">🎾 Penyisihan & Poin</span>
                  <span className="font-bold text-slate-200">4 – 24 Juni 2026</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-slate-500 shrink-0">🎾 Semifinal</span>
                  <span className="font-bold text-slate-200">26 Juni 2026</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-slate-500 shrink-0">🏆 Final</span>
                  <span className="font-bold text-emerald-400">27 Juni 2026</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic pt-1">
                Final bersamaan dengan acara Ulang Tahun & Launching Jersey Tenis Komedi
              </p>
            </div>

            <div className="rounded-xl bg-white/3 border border-white/10 p-4 space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">👥 Kategori</p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold">Single Bapak-Bapak</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold">Single Ibu-Ibu</span>
              </div>
            </div>

            <div className="rounded-xl bg-white/3 border border-white/10 p-4 space-y-1.5 text-xs">
              <p className="font-black uppercase tracking-widest text-emerald-400 mb-2">🔥 Format Liga</p>
              <p>Kumpulkan poin sebanyak-banyaknya untuk mengamankan tempat di babak semifinal!</p>
              <div className="pt-2 space-y-1 text-slate-300">
                <p>✅ Main serius boleh</p>
                <p>✅ Ngakak lebih boleh</p>
                <p>✅ Persahabatan nomor satu</p>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 italic">
              🎾😄 Siap Raket, Siap Ketawa!
            </p>

            <p className="text-[10px] text-slate-600 leading-relaxed">
              #TeKoWimblegoon2026 #TenisKomedi #SedikitKompetisiBanyakinHahaHihi #GameSetHaha #SingleBapakBapak #SingleIbuIbu #TenisLagoon #FunTournament #TennisCommunity #TenisIndonesia
            </p>
          </div>
        )}
      </div>

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
    </div>
  );
}
