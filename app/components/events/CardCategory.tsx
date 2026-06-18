import type { Champion } from "@utils/fetcher";

type CategoryCardProps = {
  label: "ATP" | "WTA";
  groupName: string;
  color: "sky" | "pink";
  totalMatches: number;
  totalPlayers: number;
  champ1?: Champion;
  champ2?: Champion;
  spirited: { name: string; wins: number; losses: number }[];
  playerImgMap: Map<string, string>;
};

export function CategoryCard({ label, groupName, color, totalMatches, totalPlayers, champ1, champ2, spirited, playerImgMap }: CategoryCardProps) {
  const c = color === "sky"
    ? { border: "border-sky-500/20", bg: "bg-sky-500/5", hdr: "bg-sky-500/10", badge: "bg-sky-500", text: "text-sky-400", divider: "border-sky-500/10" }
    : { border: "border-pink-500/20", bg: "bg-pink-500/5", hdr: "bg-pink-500/10", badge: "bg-pink-500", text: "text-pink-400", divider: "border-pink-500/10" };

  return (
    <div className={`rounded-2xl border overflow-hidden ${c.border} ${c.bg}`}>
      {/* Header */}
      <div className={`px-5 py-3.5 ${c.hdr} border-b ${c.divider} flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <span className={`text-xs md:text-sm font-black ${c.badge} text-white px-2 py-0.5 rounded`}>{label}</span>
          <span className="text-sm font-bold text-slate-200">{groupName}</span>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-xs md:text-sm text-slate-500 leading-none">Pertandingan</p>
            <p className={`text-sm font-black ${c.text}`}>{totalMatches}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-slate-500 leading-none">Pemain</p>
            <p className={`text-sm font-black ${c.text}`}>{totalPlayers}</p>
          </div>
        </div>
      </div>

      {/* Champions */}
      <div className={`border-b ${c.divider}`}>
        {[{ pos: 1 as const, champ: champ1, icon: "🥇" }, { pos: 2 as const, champ: champ2, icon: "🥈" }].map(({ pos, champ, icon }) => (
          <div key={pos} className={`flex items-center gap-3 px-5 py-3 ${pos === 2 ? `border-t ${c.divider}` : ""}`}>
            <span className="text-xl shrink-0">{icon}</span>
            <div>
              <p className="text-xs md:text-sm uppercase tracking-widest text-slate-600 leading-none mb-0.5">Juara {pos}</p>
              <p className={`text-sm font-black capitalize ${champ?.name ? "text-slate-100" : "text-slate-600 italic"}`}>
                {champ?.name || "Belum ditentukan"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Paling Semangat */}
      {spirited.length > 0 && (
        <div className="px-5 py-4">
          <p className={`text-xs font-semibold ${c.text} mb-3`}>Pemain yang siap berlatih dan menjadi penantang utama untuk Wimblegoon tahun depan</p>
          <div className="grid grid-cols-3 gap-3">
            {spirited.map((p, i) => {
              const imgUrl = playerImgMap.get(p.name.toLowerCase().trim());
              return (
                <div key={i}>
                  <div className={`relative aspect-square rounded-xl overflow-hidden bg-slate-800 border ${c.border}`}>
                    <img
                      src={imgUrl || (color === "sky" ? "/pria.jpg" : "/wanita.jpg")}
                      alt={p.name}
                      className="w-full aspect-square rounded-lg object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
                    <p className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-white px-2 leading-tight">
                      {p.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
