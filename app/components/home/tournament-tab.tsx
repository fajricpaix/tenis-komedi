export type TournamentTabKey = "ranking" | "single" | "double" | "mixDouble" | "notJoining";

export const tournamentTabConfig: { key: TournamentTabKey; label: string; emoji: string }[] = [
  { key: "ranking",   label: "Ranking",    emoji: "🏆" },
  { key: "single",    label: "Single",     emoji: "🎾" },
  { key: "double",    label: "Double",     emoji: "👥" },
  { key: "mixDouble", label: "Mix Double", emoji: "💑" },
  { key: "notJoining", label: "Nonton Aja", emoji: "😅" },
];

export type { TournamentTab };

type Props = {
  activeTab: TournamentTabKey;
  onSelect: (tab: TournamentTabKey) => void;
};

export default function TournamentTab({ activeTab, onSelect }: Props) {
  return (
    <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
      {tournamentTabConfig.map(({ key, label, emoji }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer
            ${activeTab === key
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "bg-white/5 border border-white/10 text-slate-400 hover:text-slate-100 hover:border-white/20"
            }`}
        >
          <span>{emoji}</span>
          {label}
        </button>
      ))}
    </div>
  );
}