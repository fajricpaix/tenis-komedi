"use client";

import { useMemo, useState } from "react";
import type { TeamKey } from "@components/home/tab";
import Link from "next/link";
import { useIsAdmin } from "@utils/auth";
import PlayerDetailModal from "@components/players/players-detail-modal";

type Player = {
  id: number;
  name: string;
  nickname?: string;
  gender: "Pria" | "Wanita";
  imgUrl?: string;
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
  rankChange?: number;
};

type DeleteConfirmData = {
  playerId: number | string;
  name: string;
  imgUrl?: string;
} | null;

type HomeTableProps = {
  players: PlayerWithStats[];
  matches: Match[];
  activeTab: TeamKey;
  onPlayerDeleted?: () => void;
};

const PAGE_SIZE = 10;

export default function HomeTable({ players, activeTab, onPlayerDeleted }: HomeTableProps) {
  const isAdmin = useIsAdmin();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmData>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailPlayerId, setDetailPlayerId] = useState<number | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const handleRenderTable = async () => {
    const newTab = window.open("", "_blank");
    if (!newTab) { alert("Popup diblokir. Izinkan popup di browser ini."); return; }

    const el = document.getElementById("playerTableContainer");
    if (!el) { newTab.close(); return; }

    setIsRendering(true);

    // Sembunyikan kolom Aksi, search, tombol render, dan pagination
    const actionCells = Array.from(el.querySelectorAll<HTMLElement>("th:last-child, td:last-child"));
    const hideEls = Array.from(el.querySelectorAll<HTMLElement>("[data-render-hide]"));
    actionCells.forEach((cell) => { cell.style.display = "none"; });
    hideEls.forEach((el) => { el.style.display = "none"; });

    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>("img"));
    const originalSrcs = imgs.map((img) => img.src);

    try {
      await Promise.all(
        imgs.map(async (img) => {
          try {
            const res = await fetch(img.src, { mode: "cors", cache: "force-cache" });
            const blob = await res.blob();
            img.src = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch { /* biarkan src asli */ }
        })
      );

      const { toPng } = await import("html-to-image");
      const prev = { w: el.style.width, h: el.style.height, o: el.style.overflow };
      el.style.width = "800px";
      el.style.height = "auto";
      el.style.overflow = "visible";
      const naturalHeight = el.scrollHeight;

      const dataUrl = await toPng(el, {
        cacheBust: true,
        backgroundColor: "#030712",
        canvasWidth: 800,
        canvasHeight: naturalHeight,
      });

      el.style.width = prev.w;
      el.style.height = prev.h;
      el.style.overflow = prev.o;

      const blob = await fetch(dataUrl).then((r) => r.blob());
      newTab.location.href = URL.createObjectURL(blob);
    } catch {
      newTab.close();
      alert("Gagal membuat gambar tabel.");
    } finally {
      imgs.forEach((img, i) => { img.src = originalSrcs[i]; });
      actionCells.forEach((cell) => { cell.style.display = ""; });
      hideEls.forEach((el) => { el.style.display = ""; });
      setIsRendering(false);
    }
  };

  const handleDeleteClick = (player: PlayerWithStats) => {
    setDeleteConfirm({ playerId: player.id, name: player.name, imgUrl: player.imgUrl });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      const response = await fetch("/api/players", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: deleteConfirm.playerId, imgUrl: deleteConfirm.imgUrl }),
      });
      const data = await response.json();
      if (data.success) {
        setDeleteConfirm(null);
        onPlayerDeleted?.();
      } else {
        alert("Gagal menghapus pemain: " + data.message);
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus pemain.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPlayers = useMemo(() => {
    setPage(1);
    return players.filter((player) =>
      player.name.toLowerCase().includes(search.trim().toLowerCase()),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, search]);

  const totalPages = Math.ceil(filteredPlayers.length / PAGE_SIZE);
  const pagedPlayers = filteredPlayers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
    <div 
      id="playerTableContainer"
      className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between gap-4 px-6 py-2 h-16 bg-white/3 border-b border-white/[0.07]">
        <h2 className="text-sm md:text-base font-black leading-5 text-emerald-400">
          {activeTab === "Pria" ? "Ranking ATP" : "Ranking WTA"} 
          <small className="text-xs font-semibold ml-1.5 -mt-2 text-slate-100">{activeTab === "Pria" ? "Aku Teko Pria" : "Wanita Teko Aku"}</small>
        </h2>
        <div className="flex items-center gap-2" data-render-hide>
          <input
            type="text"
            placeholder="Cari pemain..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="px-4 py-1 w-32 md:w-auto md:py-2 rounded-xl bg-slate-800 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
          {isAdmin && (
            <button 
              onClick={handleRenderTable}
              disabled={isRendering}
              title="Buat jadi image"
              className="p-3 h-8 w-8 flex items-center justify-center rounded-lg text-sm transition-all duration-200 bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:scale-[1.02] enabled:active:scale-[0.98]">
                {isRendering ? "⏳" : "🖼️"}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto" id="playerTableContainer">
        <table className="w-180 md:w-full text-sm">
          <thead>
            <tr className="bg-emerald-500/[0.07]">
              {[
                "#",
                "Nama Pemain",
                "Set",
                "Menang - Kalah",
                "Point",
                "Aksi",
              ].map((h) => (
                <th
                  key={h}
                  className={`p-3 ${h === "Nama Pemain" ? "text-left" : "text-center"} text-xs font-extrabold capitalize text-emerald-400 border-b border-emerald-500/20 whitespace-nowrap`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-500 text-base">
                  {players.length === 0
                    ? "Tidak ada data pemain 🏜️"
                    : "Tidak ditemukan pemain dengan nama tersebut."}
                </td>
              </tr>
            ) : (
              pagedPlayers.map((player, index) => (
                <tr
                  key={player.id}
                  className="border-b border-white/5 last:border-0 hover:bg-emerald-500/5 transition-colors duration-150"
                >
                  <td className="p-3 font-extrabold text-slate-500 text-center">
                    {(page - 1) * PAGE_SIZE + index + 1}.
                  </td>
                  <td className="p-3 w-60">
                    <div className="flex items-center gap-3 font-bold text-slate-100 capitalize">
                      <div>
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
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex gap-x-2 items-center">
                          {player.name}
                          {player.rankChange !== undefined && player.matchesPlayed > 0 && (
                            player.rankChange > 0 ? (
                              <span className="text-[9px] font-black text-emerald-400 leading-none">
                                ▲{player.rankChange}
                              </span>
                            ) : player.rankChange < 0 ? (
                              <span className="text-[9px] font-black text-red-400 leading-none">
                                ▼{Math.abs(player.rankChange)}
                              </span>
                            ) : (
                              <span className="text-[9px] font-black text-slate-600 leading-none">—</span>
                            )
                          )}
                        </div>
                        {player.nickname && (
                          <span className="text-[10px] font-semibold text-slate-500 italic normal-case leading-none">
                            {player.nickname}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-center p-3 font-bold text-slate-200">
                    <span className="inline-block mb-2 text-xs">{player.setWin + player.setLose} Total Set</span>
                    <br />
                    <span className="px-2 py-1 bg-emerald-400/60 rounded">{player.setWin}</span> - <span className="px-2 py-1 bg-red-500/60 rounded">{player.setLose}</span>
                  </td>
                  <td className="text-center p-3 font-bold text-slate-200">
                    <span className="inline-block mb-2 text-xs">{player.matchesPlayed} Pertandingan</span>
                    <br />
                    <span className="px-2 py-1 bg-emerald-400/60 rounded">{player.wins}</span> - <span className="px-2 py-1 bg-red-500/60 rounded">{player.losses}</span>
                  </td>
                  <td className="text-center p-3 font-bold">
                    {player.points}
                  </td>
                  <td className="text-center p-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        title="Lihat Detail Pemain"
                        onClick={() => setDetailPlayerId(player.id)}
                        className="px-2 py-1 rounded-lg items-center cursor-pointer font-bold text-xs border bg-green-500/10 border-green-500/25 hover:bg-green-500/20 hover:border-green-400/50 hover:-translate-y-0.5 transition-all duration-150"
                      >
                        📖
                      </button>
                      {isAdmin && (
                        <>
                          <Link 
                            href={`/players/edit?id=${player.id}`} 
                            title="Edit Pemain" 
                            className="px-2 py-1 rounded-lg cursor-pointer font-bold text-xs uppercase border bg-blue-500/10 border-blue-500/25 hover:bg-blue-500/20 hover:-translate-y-0.5 transition-all duration-150">
                            ✏️
                          </Link>
                          <button
                            title="Delete Pemain"
                            onClick={() => handleDeleteClick(player)}
                            className="px-2 py-1 rounded-lg cursor-pointer font-bold text-xs uppercase border bg-red-500/10 border-red-500/25 hover:bg-red-500/20 hover:-translate-y-0.5 transition-all duration-150">
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

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-2">Hapus Pemain?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Apakah Anda yakin ingin menghapus pemain{" "}
              <span className="font-semibold text-slate-200">{deleteConfirm.name}</span>?
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

      {totalPages > 1 && (
        <div className="flex items-center justify-end md:justify-between px-5 py-3 border-t border-white/[0.07]" data-render-hide>
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
    </div>

    {detailPlayerId !== null && (
      <PlayerDetailModal
        playerId={detailPlayerId}
        onClose={() => setDetailPlayerId(null)}
      />
    )}
    </>
  );
}
