"use client";

import { parseSetScore } from "@utils/fetcher";

export type MatchForModal = {
  id: number;
  player1: string;
  player2: string;
  winner: string;
  setScore: string;
  pointScoresA?: string[];
  pointScoresB?: string[];
  photoUrl?: string;
};

type Props = {
  match: MatchForModal;
  onClose: () => void;
};

const POINT_ORDER: Record<string, number> = { "0": 0, "15": 1, "30": 2, "40": 3, "adv": 4 };

function winnerOfSet(a: string, b: string): "A" | "B" | null {
  const va = POINT_ORDER[a] ?? -1;
  const vb = POINT_ORDER[b] ?? -1;
  if (va > vb) return "A";
  if (vb > va) return "B";
  return null;
}

export default function MatchDetailModal({ match, onClose }: Props) {
  const [setA, setB] = parseSetScore(match.setScore);
  const totalSets = setA + setB;
  const scoresA = match.pointScoresA ?? [];
  const scoresB = match.pointScoresB ?? [];
  const isPlayer1Winner = match.winner === match.player1;

  const handleDownloadImage = async () => {
    const el = document.getElementById("MatchResult");
    if (!el) return;
    try {
      const { toPng } = await import("html-to-image");
      const prev = { width: el.style.width, height: el.style.height, overflow: el.style.overflow };
      el.style.width = "750px";
      el.style.height = "750px";
      el.style.overflow = "hidden";
      const dataUrl = await toPng(el, {
        cacheBust: true,
        backgroundColor: "#0f172a",
        canvasWidth: 750,
        canvasHeight: 750,
      });
      el.style.width = prev.width;
      el.style.height = prev.height;
      el.style.overflow = prev.overflow;
      const link = document.createElement("a");
      link.download = `match-${match.player1}-vs-${match.player2}.png`.replace(/\s+/g, "-").toLowerCase();
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal membuat gambar:", err);
      alert("Maaf, terjadi kesalahan saat membuat gambar.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="MatchResult" className="p-4 rounded-xl relative overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
          {/* Photo */}
          {match.photoUrl && (
            <figure className="relative">
              <img
                src={match.photoUrl}
                alt={`Pertandingan ${match.player1} vs ${match.player2}`}
                className="w-full object-cover aspect-square rounded-xl"
              />
            </figure>
          )}

          {/* Scoreboard */}
          <div className={match.photoUrl ? "absolute bottom-8 inset-x-8" : ""}>
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
              <div className="p-2 md:px-4 md:py-3 bg-white/3 border-b border-white/10 flex items-center gap-x-2">
                <img src="/logo.webp" alt="Logo" className="h-6 md:h-8 w-6 md:w-8 object-contain" />
                <span className="text-[10px] md:text-xs font-black tracking-widest uppercase text-emerald-400">
                  TeKo Wimblegoon 2026
                </span>
              </div>

              <div className="overflow-x-auto p-2 md:px-4 md:py-3">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 w-40">
                        Pemain
                      </th>
                      <th className="p-2 text-center text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 w-14">
                        Poin
                      </th>
                      {Array.from({ length: totalSets }, (_, i) => (
                        <th key={i} className="p-2 text-center text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 w-14">
                          {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Player 1 */}
                    <tr className="border-t border-white/10">
                      <td className="p-1.5 md:p-2 text-[10px] md:text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0 ${isPlayer1Winner ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-slate-700/60 border-white/10 text-slate-400"}`}>
                            {match.player1.charAt(0).toUpperCase()}
                          </div>
                          <span className={`font-semibold capitalize text-[10px] md:text-xs ${isPlayer1Winner ? "text-emerald-400" : "text-slate-300"}`}>
                            {match.player1}
                          </span>
                        </div>
                      </td>
                      <td className="p-1 md:p-2 text-center">
                        <span className={`inline-block min-w-8 p-1 rounded-lg text-xs font-black ${isPlayer1Winner ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-200"}`}>
                          {setA}
                        </span>
                      </td>
                      {Array.from({ length: totalSets }, (_, i) => {
                        const w = winnerOfSet(scoresA[i] ?? "", scoresB[i] ?? "");
                        return (
                          <td key={i} className="p-1 md:p-2 text-center">
                            <span className={`inline-block min-w-8 p-1 rounded-lg text-[10px] md:text-xs font-bold uppercase ${scoresA[i] ? w === "A" ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-100" : "text-slate-600"}`}>
                              {scoresA[i] ?? "-"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Player 2 */}
                    <tr className="border-t border-white/10">
                      <td className="p-1.5 md:p-2 text-[10px] md:text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0 ${!isPlayer1Winner ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-slate-700/60 border-white/10 text-slate-400"}`}>
                            {match.player2.charAt(0).toUpperCase()}
                          </div>
                          <span className={`font-semibold capitalize text-[10px] md:text-xs ${!isPlayer1Winner ? "text-emerald-400" : "text-slate-300"}`}>
                            {match.player2}
                          </span>
                        </div>
                      </td>
                      <td className="p-1 md:p-2 text-center">
                        <span className={`inline-block min-w-8 p-1 rounded-lg text-[10px] md:text-xs font-black ${!isPlayer1Winner ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-200"}`}>
                          {setB}
                        </span>
                      </td>
                      {Array.from({ length: totalSets }, (_, i) => {
                        const w = winnerOfSet(scoresA[i] ?? "", scoresB[i] ?? "");
                        return (
                          <td key={i} className="p-1 md:p-2 text-center">
                            <span className={`inline-block min-w-8 p-1 rounded-lg text-[10px] md:text-xs font-bold uppercase ${scoresB[i] ? w === "B" ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-100" : "text-slate-600"}`}>
                              {scoresB[i] ?? "-"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handleDownloadImage}
            className="flex-1 py-3 rounded-xl text-sm font-extrabold tracking-widest cursor-pointer uppercase transition-all duration-200 bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            Buat Jadi Image
          </button>
        </div>
      </div>
    </div>
  );
}
