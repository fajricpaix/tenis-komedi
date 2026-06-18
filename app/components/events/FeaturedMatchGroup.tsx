import { parseSetScore, type Match } from "@utils/fetcher";

type FeaturedMatchGroupProps = {
  label: "ATP" | "WTA";
  groupName: string;
  color: "sky" | "pink";
  featuredMatches: Match[];
};

export function FeaturedMatchGroup({ label, groupName, color, featuredMatches }: FeaturedMatchGroupProps) {
  const c = color === "sky"
    ? { badge: "bg-sky-500", border: "border-white/8", divider: "divide-white/5" }
    : { badge: "bg-pink-500", border: "border-white/8", divider: "divide-white/5" };

  return (
    <div className={`rounded-2xl border overflow-hidden ${c.border} bg-slate-900/60`}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/8">
        <span className={`text-xs md:text-sm font-black ${c.badge} text-white px-1.5 py-0.5 rounded`}>{label}</span>
        <span className="text-xs font-bold text-slate-400">{groupName}</span>
      </div>
      <div className={`divide-y ${c.divider}`}>
        {featuredMatches.map((m, i) => {
          const [a, b] = parseSetScore(m.setScore);
          const p1Win = m.winner === m.player1;
          return (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xs md:text-sm text-slate-600 shrink-0 w-14">Pilihan {i + 1}</span>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-bold capitalize ${p1Win ? "text-slate-100" : "text-slate-400"}`}>{m.player1}</span>
                <span className="text-slate-600 text-xs mx-1.5">vs</span>
                <span className={`text-sm font-bold capitalize ${!p1Win ? "text-slate-100" : "text-slate-400"}`}>{m.player2}</span>
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg shrink-0">
                {a}-{b}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
