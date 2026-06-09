"use client";

import type { TeamKey } from "@components/home/tab";
import { useState, useMemo } from "react";
import MatchDetailModal, { type MatchForModal } from "@components/match/match-detail-modal";
import MatchEditModal from "@components/match/match-edit-modal";
import DownloadMatchesModal from "@components/match/download-matches-modal";
import { useIsAdmin } from "@utils/auth";

type Match = MatchForModal;

type Player = {
  id: number;
  name: string;
  gender: "Pria" | "Wanita";
};

type MatchTableProps = {
  matches: Match[];
  players?: Player[];
  activeTab: TeamKey;
  onMatchDeleted?: () => void;
  onMatchEdited?: () => void;
};

type DeleteConfirmData = {
  matchId: number;
  player1: string;
  player2: string;
  photoUrl?: string;
} | null;

const PAGE_SIZE = 15;

export default function MatchTable({ matches, players = [], activeTab, onMatchDeleted, onMatchEdited }: MatchTableProps) {
  const isAdmin = useIsAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmData>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const hasDownloadableDates = useMemo(
    () => matches.some((m) => m.matchDate && m.photoUrl),
    [matches]
  );

  const filteredMatches = useMemo(() => {
    setPage(1);
    const sorted = [...matches].sort((a, b) => {
      const da = a.matchDate ?? "";
      const db = b.matchDate ?? "";
      if (db !== da) return db < da ? -1 : 1;
      return b.id - a.id;
    });
    if (!searchTerm) return sorted;
    const lower = searchTerm.toLowerCase();
    return sorted.filter(
      (m) => m.player1.toLowerCase().includes(lower) || m.player2.toLowerCase().includes(lower)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, searchTerm]);

  const totalPages = Math.ceil(filteredMatches.length / PAGE_SIZE);
  const pagedMatches = filteredMatches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari pemain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-1 w-32 md:w-auto md:py-2 rounded-xl bg-slate-800 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
            {(hasDownloadableDates && isAdmin) && (
              <button
                onClick={() => setIsDownloadOpen(true)}
                title="Download foto pertandingan harian"
                className="p-2 h-8 w-8 flex items-center justify-center rounded-lg text-sm transition-all duration-200 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 hover:-translate-y-0.5 cursor-pointer"
              >
                📥
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-180 text-xs">
            <thead>
              <tr className="bg-emerald-500/[0.07]">
                {["Pertandingan", "Skor", "Pemenang", "Aksi"].map((h) => (
                  <th key={h} className={`p-3 text-center text-xs font-extrabold capitalize text-emerald-400 border-b border-emerald-500/20 whitespace-nowrap`}>
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
                pagedMatches.map((match) => (
                  <tr key={match.id} className={`border-b border-white/5 last:border-0 ${activeTab === "Pria" ? 'hover:bg-sky-950' : 'hover:bg-pink-950' } transition-colors duration-150`}>
                    <td className="p-3 w-80 md:w-56">
                      <div className="flex items-center justify-center gap-x-4">
                        <span className={`w-32 capitalize font-semibold text-right ${match.winner === match.player1 ? "text-emerald-400" : "text-slate-300"}`}>
                          {match.player1}
                        </span>
                        <span className="text-slate-600 font-black italic text-xs">VS</span>
                        <span className={`w-32 capitalize font-semibold ${match.winner === match.player2 ? "text-emerald-400" : "text-slate-300"}`}>
                          {match.player2}
                        </span>
                      </div>
                      {match.matchDate && (
                        <p className="text-center text-[10px] text-slate-600 mt-1">
                          {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(match.matchDate))}
                        </p>
                      )}
                    </td>
                    <td className="text-center p-3 font-black text-slate-100 text-lg tracking-tighter italic">
                      {match.setScore}
                    </td>
                    <td className="p-3 items-center justify-center flex">
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-xs capitalize text-center">
                        {match.winner}
                      </span>
                    </td>
                    <td className="text-center p-3 w-40">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedMatch(match)}
                          className="px-2 py-1 rounded-lg cursor-pointer font-bold text-xs border bg-green-500/10 border-green-500/25 hover:bg-green-500/20 hover:border-green-400/50 hover:-translate-y-0.5 transition-all duration-150"
                        >
                          📖
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              title="Edit Match"
                              onClick={() => setEditMatch(match)}
                              className="px-2 py-1 rounded-lg cursor-pointer font-bold text-xs uppercase border bg-blue-500/10 border-blue-500/25 hover:bg-blue-500/20 hover:-translate-y-0.5 transition-all duration-150">
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteClick(match)}
                              className="px-2 py-1 rounded-lg cursor-pointer font-bold text-xs border bg-red-500/10 border-red-500/25 hover:bg-red-500/20 hover:-translate-y-0.5 transition-all duration-150"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>          
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end md:justify-between px-5 py-3 border-t border-white/[0.07]">
            <span className="hidden md:block text-xs text-slate-500">
              Halaman {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    p === page
                      ? "bg-emerald-500 border-emerald-500 text-slate-900"
                      : "border-white/10 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}

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

      {/* Match Edit Modal */}
      {editMatch && (
        <MatchEditModal
          match={editMatch}
          players={players}
          onClose={() => setEditMatch(null)}
          onSaved={() => { setEditMatch(null); onMatchEdited?.(); }}
        />
      )}

      {/* Download Hasil Pertandingan Modal */}
      {isDownloadOpen && (
        <DownloadMatchesModal
          matches={matches}
          onClose={() => setIsDownloadOpen(false)}
        />
      )}
    </>
  );
}
