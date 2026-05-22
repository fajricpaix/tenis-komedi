import type { TeamKey } from "@components/home/tab";
import { useState, useMemo } from "react";

type Match = {
  id: number;
  player1: string;
  player2: string;
  winner: string;
  setScore: string;
};

type MatchTableProps = {
  matches: Match[];
  activeTab: TeamKey;
};

export default function MatchTable({ matches, activeTab }: MatchTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMatches = useMemo(() => {
    if (!searchTerm) {
      return matches;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return matches.filter(
      (match) =>
        match.player1.toLowerCase().includes(lowerCaseSearchTerm) ||
        match.player2.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [matches, searchTerm]);

  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-6 py-2 h-16 bg-white/3 border-b border-white/[0.07]">
        <h2 className="text-xl font-black text-slate-100">
          Riwayat Pertandingan {activeTab}
        </h2>
        <input
          type="text"
          placeholder="Cari pemain..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-emerald-500/[0.07]">
              {["Pertandingan", "Skor", "Pemenang"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-center text-[0.7rem] font-extrabold uppercase text-emerald-400 border-b border-emerald-500/20 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead> 
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-16 text-slate-500 text-base">
                  Belum ada riwayat pertandingan 🎾
                </td>
              </tr>
            ) : filteredMatches.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-16 text-slate-500 text-base">
                  Tidak ada pertandingan yang cocok dengan pencarian Anda.
                </td>
              </tr>
            ) : (
              [...filteredMatches].reverse().map((match) => (
                <tr
                  key={match.id}
                  className="border-b border-white/5 last:border-0 hover:bg-emerald-500/5 transition-colors duration-150"
                >
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <span className={`w-28 font-bold ${match.winner === match.player1 ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {match.player1}
                      </span>
                      <span className="text-slate-600 font-black italic text-xs">VS</span>
                      <span className={`w-28 font-bold ${match.winner === match.player2 ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {match.player2}
                      </span>
                    </div>
                  </td>
                  <td className="text-center px-5 py-4 font-black text-slate-100 text-lg tracking-tighter italic">
                    {match.setScore}
                  </td>
                  <td className="text-center px-5 py-4 justify-center flex">
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      {match.winner}
                    </span>
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