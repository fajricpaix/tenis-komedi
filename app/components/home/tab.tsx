import Link from "next/link";

export type TeamKey = "Pria" | "Wanita";

type HomeTabProps = {
  activeTab: TeamKey;
  onSelect: (tab: TeamKey) => void;
};

const tabs: TeamKey[] = ["Pria", "Wanita"];

export default function HomeTab({ activeTab, onSelect }: HomeTabProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1.5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onSelect(tab)}
            className={`flex items-center gap-2 px-2 md:px-7 py-2 md:py-2.5 rounded-xl text-sm font-extrabold tracking-widest cursor-pointer uppercase transition-all duration-200 ${activeTab === tab
                ? "bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
          >
            <span>{tab === "Pria" ? "👨" : "👩"}</span>
            {`TeKo ${tab}`}
          </button>
        ))}
        
      </div>

      <Link
        href="/players/add"
        className="ml-auto rounded-full border border-emerald-300 bg-emerald-500/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-emerald-100 transition hover:bg-emerald-500/30 hover:text-white"
      >
        Tambah Pemain
      </Link>
    </div>
  );
}
