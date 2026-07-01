type Accent = "sky" | "pink";

type Props = { accent: Accent };

const ACCENT: Record<Accent, {
  text: string; textSoft: string; border: string; bg: string;
  tableBorder: string; tableBg: string; rowBorder: string; icon: string;
}> = {
  sky: {
    text: "text-sky-400", textSoft: "text-sky-300",
    border: "border-sky-500/20", bg: "bg-sky-500/5",
    tableBorder: "border-sky-500/15", tableBg: "bg-sky-500/10", rowBorder: "border-sky-500/10",
    icon: "text-sky-400/60",
  },
  pink: {
    text: "text-pink-400", textSoft: "text-pink-300",
    border: "border-pink-500/20", bg: "bg-pink-500/5",
    tableBorder: "border-pink-500/15", tableBg: "bg-pink-500/10", rowBorder: "border-pink-500/10",
    icon: "text-pink-400/60",
  },
};

export default function PointsInfo({ accent }: Props) {
  const c = ACCENT[accent];

  return (
    <details className={`mb-6 group rounded-2xl border overflow-hidden ${c.border} ${c.bg}`}>
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none list-none">
        <div className="flex items-center gap-2">
          <span className={`text-sm ${c.text}`}>ℹ️</span>
          <span className={`text-xs font-black uppercase tracking-widest ${c.text}`}>Cara Perhitungan Poin</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 group-open:rotate-180 ${c.icon}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>

      <div className="px-4 pb-4 space-y-3">
        <p className="text-xs text-slate-400 leading-relaxed">
          Poin diperoleh dari hasil setiap pertandingan dalam turnamen, kemudian dikalikan <span className={`font-bold ${c.textSoft}`}>× 133</span>.
        </p>

        <div className={`rounded-xl overflow-hidden border ${c.tableBorder}`}>
          <div className={`grid grid-cols-3 px-4 py-2 ${c.tableBg}`}>
            <span className={`text-[10px] font-black uppercase tracking-widest ${c.text}`}>Hasil Set</span>
            <span className={`text-[10px] font-black uppercase tracking-widest text-center ${c.text}`}>Poin Menang</span>
            <span className={`text-[10px] font-black uppercase tracking-widest text-right ${c.text}`}>Poin Kalah</span>
          </div>
          {[
            { set: "3 – 0", win: 600, lose: 100 },
            { set: "3 – 1", win: 500, lose: 200 },
            { set: "3 – 2", win: 400, lose: 300 },
          ].map((row) => (
            <div key={row.set} className={`grid grid-cols-3 px-4 py-2.5 border-t bg-slate-900/40 ${c.rowBorder}`}>
              <span className="text-xs font-bold text-slate-300">{row.set}</span>
              <span className={`text-xs font-black text-center ${c.text}`}>+{row.win}</span>
              <span className="text-xs font-bold text-slate-500 text-right">+{row.lose}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-600 italic">
          Semakin besar selisih set, semakin banyak poin yang didapat pemenang.
        </p>
      </div>
    </details>
  );
}
