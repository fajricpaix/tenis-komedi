import type { TeamKey } from "@components/home/tab";
import { useState, useMemo } from "react";
import MatchDetailModal, { type MatchForModal } from "@components/match/match-detail-modal";

type Match = MatchForModal;

type MatchTableProps = {
  matches: Match[];
  activeTab: TeamKey;
  fullWidth?: boolean;
  onMatchDeleted?: () => void;
};

type DeleteConfirmData = {
  matchId: number;
  player1: string;
  player2: string;
  photoUrl?: string;
} | null;

export default function MatchTable({ matches, activeTab, fullWidth, onMatchDeleted }: MatchTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmData>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const filteredMatches = useMemo(() => {
    if (!searchTerm) return matches;
    const lower = searchTerm.toLowerCase();
    return matches.filter(
      (m) => m.player1.toLowerCase().includes(lower) || m.player2.toLowerCase().includes(lower)
    );
  }, [matches, searchTerm]);

  const handleDeleteClick = (match: Match) => {
    setDeleteConfirm({
      matchId: match.id,
      player1: match.player1,
      player2: match.player2,
      photoUrl: match.photoUrl,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      const response = await fetch("/api/matches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: deleteConfirm.matchId, photoUrl: deleteConfirm.photoUrl }),
      });
      const data = await response.json();
      if (data.success) {
        setDeleteConfirm(null);
        onMatchDeleted?.();
      } else {
        alert("Gagal menghapus pertandingan: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting match:", error);
      alert("Terjadi kesalahan saat menghapus pertandingan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between gap-4 px-6 py-2 h-16 bg-white/3 border-b border-white/[0.07]">
          <h2 className="text-sm md:text-xl font-black text-slate-100">
            Pertandingan {activeTab}
          </h2>
          <input
            type="text"
            placeholder="Cari pemain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-1 w-32 md:w-auto md:py-2 rounded-xl bg-slate-800 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-180 md:w-full text-xs">
            <thead>
              <tr className="bg-emerald-500/[0.07]">
                {["Pertandingan", "Skor", "Pemenang", "Aksi"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-center text-xs font-extrabold uppercase text-emerald-400 border-b border-emerald-500/20 whitespace-nowrap">
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
                  <tr key={match.id} className="border-b border-white/5 last:border-0 hover:bg-emerald-500/5 transition-colors duration-150">
                    <td className="p-4 text-center w-100">
                      <div className="flex items-center justify-center gap-4">
                        <span className={`${fullWidth ? "w-36" : "w-28"} capitalize font-bold ${match.winner === match.player1 ? "text-emerald-400" : "text-slate-300"}`}>
                          {match.player1}
                        </span>
                        <span className="text-slate-600 font-black italic text-xs">VS</span>
                        <span className={`${fullWidth ? "w-36" : "w-28"} capitalize font-bold ${match.winner === match.player2 ? "text-emerald-400" : "text-slate-300"}`}>
                          {match.player2}
                        </span>
                      </div>
                    </td>
                    <td className="text-center px-5 py-4 font-black text-slate-100 text-lg tracking-tighter italic">
                      {match.setScore}
                    </td>
                    <td className="text-center px-5 py-4 justify-center items-center flex">
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-xs capitalize tracking-wider">
                        {match.winner}
                      </span>
                    </td>
                    <td className="text-center px-5 py-4 w-40">
                      <div className="flex items-center justify-center gap-2">
                        {/* <button
                          onClick={() => handleDeleteClick(match)}
                          className="px-3 py-1 rounded-lg cursor-pointer bg-red-500/10 border border-red-500/25 text-red-400 font-bold text-xs uppercase tracking-wider hover:bg-red-500/20 transition-colors"
                        >
                          🗑️
                        </button> */}
                        <button
                          onClick={() => setSelectedMatch(match)}
                          className="flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-green-300 text-xs font-bold tracking-wide hover:bg-green-500/20 hover:border-green-400/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-900/30 transition-all duration-150"
                        >
                          📖
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-100 mb-2">Hapus Pertandingan?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Apakah Anda yakin ingin menghapus pertandingan antara{" "}
                <span className="font-semibold text-slate-200">{deleteConfirm.player1}</span> vs{" "}
                <span className="font-semibold text-slate-200">{deleteConfirm.player2}</span>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 cursor-pointer rounded-lg bg-slate-800 border border-white/10 text-slate-100 font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 cursor-pointer rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </>
  );
}
