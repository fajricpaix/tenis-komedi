"use client";

import { useState } from "react";
import Image from "next/image";
import RulesModal from "@components/home/rule-of-wimblegoon";
import Link from "next/link";

export default function EventCard() {

  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="md:order-1 md:w-2/5 mt-6 md:mt-0">
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-lg md:text-3xl">📅</span>
        <h2 className="font-bold text-slate-100 md:text-xl">Event Tenis Komedi</h2>
      </div>

      <div className="mb-6 md:mb-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-900/20 bg-slate-900">
        {/* Hero Photo */}
        <div className="relative w-full aspect-video md:aspect-video">
          <Image
            src="https://fjmioptzuenhifplfiii.supabase.co/storage/v1/object/public/events/wimblegoon.jpg"
            alt="TeKo Wimblegoon 2026"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-top object-cover"
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

        </div>

        {/* Link Detail */}
        <Link
          href="/events/wimblegoon"
          className="w-full px-5 py-3 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 cursor-pointer capitalize"
        >
          Lihat detail event
        </Link>
      </div>

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
    </div>
  );
}
