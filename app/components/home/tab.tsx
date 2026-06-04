export type TeamKey = "Pria" | "Wanita";

type HomeTabProps = {
  activeTab: TeamKey;
  onSelect: (tab: TeamKey) => void;
};

const tabs: TeamKey[] = ["Pria", "Wanita"];

export default function HomeTab({ activeTab, onSelect }: HomeTabProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1.5 w-full md:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onSelect(tab)}
            className={`cursor-pointer w-full md:w-44 flex flex-col items-center gap-2 px-2 md:px-7 py-2 md:py-2.5 rounded-xl text-sm font-extrabold tracking-widest uppercase transition-all duration-200 ${activeTab === tab
                ? "bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
          >
            
            <span>{tab === "Pria" ? "👨🏻‍💼 ATP" : "🧕🏻 WTA"}</span>
            <span className="text-xs capitalize tracking-normal font-semibold">{tab === "Pria" ? "Aku Teko Pria" : "Wanita Teko Aku"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
