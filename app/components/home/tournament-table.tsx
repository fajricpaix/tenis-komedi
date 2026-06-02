import { type Player } from "@utils/fetcher";
import { tournamentTabConfig, type TournamentTabKey } from "@components/home/tournament-tab";

type Props = {
  tournamentTab: TournamentTabKey;
  activeGender: "Pria" | "Wanita";
  players: Player[];
};

const categoryLabel: Record<string, string> = {
  single: "Single",
  double: "Double",
  mixDouble: "Mix Double",
};

export default function TournamentTable({ tournamentTab, activeGender, players }: Props) {
  const tournamentPlayers = players
  .filter((p) => {
    if (p?.gender !== activeGender) return false;

    if (tournamentTab === "notJoining") {
      return p?.tournament?.willing === false;
    }

    const willing = p?.tournament?.willing;
    const cats: string[] = p?.tournament?.categories ?? [];
    return willing && cats.includes(tournamentTab);
  });

  const currentTabConfig = tournamentTabConfig.find((t) => t.key === tournamentTab);

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
          <span className="text-lg">{currentTabConfig?.emoji}</span>
          <h2 className="font-bold text-slate-100">
            Peserta {currentTabConfig?.label}
          </h2>
          <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {tournamentPlayers.length} pemain
          </span>
        </div>

        {tournamentPlayers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Belum ada pemain {activeGender} yang mendaftar kategori ini
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-175 md:w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-white/10">
                  <th className="px-5 py-3 text-left font-semibold w-10">No</th>
                  <th className="px-5 py-3 text-left font-semibold">Nama</th>
                  <th className="px-5 py-3 text-left font-semibold">Panggilan</th>
                  <th className="px-5 py-3 text-left font-semibold">Alamat</th>
                  <th className="px-5 py-3 text-left font-semibold">Kategori Dipilih</th>
                </tr>
              </thead>
              <tbody>
                {tournamentPlayers.map((player, index) => {
                  const cats: string[] = player?.tournament?.categories ?? [];
                  return (
                    <tr
                      key={player.id ?? index}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-5 py-3 text-slate-500 font-mono text-xs">
                        {index + 1}
                      </td>
                      <td className="px-5 py-3 w-60">
                        <div className="flex items-center gap-3">
                          {player.imgUrl ? (
                            <img
                              src={player.imgUrl}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 shrink-0 flex items-center justify-center text-xs text-slate-400 font-bold">
                              {player.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold capitalize text-slate-100">{player.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 capitalize text-slate-400 w-36 md:w-auto">{player.nickname ?? "-"}</td>
                      <td className="px-5 py-3 text-slate-400 w-32 md:w-auto">
                        {player.houseBlock && player.houseNumber
                          ? `Blok ${player.houseBlock}/${player.houseNumber}`
                          : "-"}
                      </td>
                      <td className="px-5 py-3 w-60 md:w-auto">
                        <div className="flex flex-wrap gap-1.5">
                          {cats.map((cat) => (
                            <span
                              key={cat}
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full border
                                ${cat === "single"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : cat === "double"
                                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                  : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                                }`}
                            >
                              {categoryLabel[cat] ?? cat}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}