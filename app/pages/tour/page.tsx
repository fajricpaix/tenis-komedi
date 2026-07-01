"use client";

export default function TourPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-24 px-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
        <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="8 21 12 17 16 21" />
          <line x1="12" y1="17" x2="12" y2="11" />
          <path d="M7 4H17l-1 7H8L7 4z" />
          <path d="M5 4H3c0 3 2 5 4 6" />
          <path d="M19 4h2c0 3-2 5-4 6" />
        </svg>
      </div>
      <h1 className="text-2xl font-black text-white">Tour</h1>
      <p className="text-sm text-slate-400 max-w-xs">
        Halaman Tour sedang disiapkan. Nantikan info jadwal dan hasil tour di sini.
      </p>
    </div>
  );
}
