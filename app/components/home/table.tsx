import type { TeamKey } from "@components/home/tab";

type Player = {
  id: number;
  name: string;
  gender: "Pria" | "Wanita";
};

type Match = {
  id: number;
  player1: string;
  player2: string;
  winner: string;
  setScore: string;
};

type PlayerWithStats = Player & {
  matchesPlayed: number;
  wins: number;
  losses: number;
  setWin: number;
  setLose: number;
  points: number;
};

type HomeTableProps = {
  players: PlayerWithStats[];
  matches: Match[];
  activeTab: TeamKey;
  onEdit: (id: number) => void;
};

export default function HomeTable({ players, activeTab, onEdit }: HomeTableProps) {
  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 bg-white/3 border-b border-white/[0.07]">
        <h2 className="text-xl font-black tracking-widest text-slate-100">
          Tenis Komedi {activeTab}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-emerald-500/[0.07]">
              {[
                "Rangking",
                "Nama Pemain",
                "Jumlah Pertandingan",
                "Set",
                "Menang - Kalah",
                "Point",
                "Detail",
              ].map((h) => (
                <th
                  key={h}
                  className={`px-5 py-3.5 ${h === "Nama Pemain" ? "text-left" : "text-center"} text-[0.7rem] font-extrabold tracking-[0.2em] uppercase text-emerald-400 border-b border-emerald-500/20 whitespace-nowrap`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-500 text-base">
                  Tidak ada data pemain 🏜️
                </td>
              </tr>
            ) : (
              players.map((player, index) => (
                <tr
                  key={player.id}
                  className="border-b border-white/5 last:border-0 hover:bg-emerald-500/5 transition-colors duration-150"
                >
                  <td className="px-5 py-4 font-extrabold text-slate-500 w-12 text-center">
                    {index+1}.
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 font-bold text-slate-100">
                      {player.name}
                    </div>
                  </td>
                  <td className="text-center px-5 py-4 font-bold text-slate-400">
                    {player.matchesPlayed} Pertandingan
                  </td>
                  <td className="text-center px-5 py-4 font-bold text-slate-200">
                    <span className="px-2 py-1 bg-green-500/60 rounded">{player.setWin}</span> - <span className="px-2 py-1 bg-red-500/60 rounded">{player.setLose}</span>
                  </td>
                  <td className="text-center px-5 py-4 font-bold text-slate-200">
                    <span className="px-2 py-1 bg-green-500/60 rounded">{player.wins}</span> - <span className="px-2 py-1 bg-red-500/60 rounded">{player.losses}</span>
                  </td>
                  <td className="text-center px-5 py-4 font-bold text-slate-400">
                    {player.points}
                  </td>
                  <td className="text-center justify-center flex px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onEdit(player.id)}
                      className="flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-green-300 text-xs font-bold tracking-wide hover:bg-green-500/20 hover:border-green-400/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-900/30 transition-all duration-150"
                    >
                      Detail →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
