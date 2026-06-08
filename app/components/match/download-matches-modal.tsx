"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef, useMemo } from "react";
import type { MatchForModal } from "@components/match/match-detail-modal";
import { parseSetScore } from "@utils/fetcher";

type Props = {
  matches: MatchForModal[];
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

function MatchResultCard({ match }: { match: MatchForModal }) {
  const [setA, setB] = parseSetScore(match.setScore);
  const totalSets = setA + setB;
  const scoresA = match.pointScoresA ?? [];
  const scoresB = match.pointScoresB ?? [];
  const isPlayer1Winner = match.winner === match.player1;

  return (
    <div className="p-4 rounded-xl relative overflow-hidden bg-slate-900 border border-white/10">
      {match.photoUrl && (
        <figure className="relative">
          <img
            src={match.photoUrl}
            alt={`${match.player1} vs ${match.player2}`}
            crossOrigin="anonymous"
            className="w-full object-cover aspect-square rounded-xl"
          />
        </figure>
      )}
      <div className={match.photoUrl ? "absolute bottom-8 inset-x-8 opacity-90" : ""}>
        <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-900">
          <div className="p-2 md:px-4 md:py-3 bg-white/3 border-b border-white/10 flex items-center justify-between gap-x-2">
            <div className="flex items-center gap-x-2">
              <img src="/logo.webp" alt="Logo" className="h-6 w-6 object-contain" />
              <span className="text-xs font-black tracking-widest uppercase text-emerald-400">
                TeKo Wimblegoon 2026
              </span>
            </div>
            {match.matchDate && (
              <span className="text-xs text-slate-500 font-semibold shrink-0">
                {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(match.matchDate))}
              </span>
            )}
          </div>
          <div className="overflow-x-auto p-2 md:px-4 md:py-3">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 text-xs font-black uppercase tracking-widest text-slate-500 w-40">Pemain</th>
                  <th className="p-2 text-center text-xs font-black uppercase tracking-widest text-slate-500 w-14">Poin</th>
                  {Array.from({ length: totalSets }, (_, i) => (
                    <th key={i} className="p-2 text-center text-xs font-black uppercase tracking-widest text-slate-500 w-14">
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/10">
                  <td className="p-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black shrink-0 ${isPlayer1Winner ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-slate-700/60 border-white/10 text-slate-400"}`}>
                        {match.player1.charAt(0).toUpperCase()}
                      </div>
                      <span className={`font-semibold capitalize text-xs ${isPlayer1Winner ? "text-emerald-400" : "text-slate-300"}`}>
                        {match.player1}
                      </span>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <span className={`inline-block min-w-8 p-1 rounded-lg text-xs font-black ${isPlayer1Winner ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-200"}`}>
                      {setA}
                    </span>
                  </td>
                  {Array.from({ length: totalSets }, (_, i) => {
                    const w = winnerOfSet(scoresA[i] ?? "", scoresB[i] ?? "");
                    return (
                      <td key={i} className="p-1 text-center">
                        <span className={`inline-block min-w-8 p-1 rounded-lg text-xs font-bold uppercase ${scoresA[i] ? w === "A" ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-100" : "text-slate-600"}`}>
                          {scoresA[i] ?? "-"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-t border-white/10">
                  <td className="p-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black shrink-0 ${!isPlayer1Winner ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-slate-700/60 border-white/10 text-slate-400"}`}>
                        {match.player2.charAt(0).toUpperCase()}
                      </div>
                      <span className={`font-semibold capitalize text-xs ${!isPlayer1Winner ? "text-emerald-400" : "text-slate-300"}`}>
                        {match.player2}
                      </span>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <span className={`inline-block min-w-8 p-1 rounded-lg text-xs font-black ${!isPlayer1Winner ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-200"}`}>
                      {setB}
                    </span>
                  </td>
                  {Array.from({ length: totalSets }, (_, i) => {
                    const w = winnerOfSet(scoresA[i] ?? "", scoresB[i] ?? "");
                    return (
                      <td key={i} className="p-1 text-center">
                        <span className={`inline-block min-w-8 p-1 rounded-lg text-xs font-bold uppercase ${scoresB[i] ? w === "B" ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-100" : "text-slate-600"}`}>
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
  );
}

type Phase = "selecting" | "rendering" | "zipping" | "done";

export default function DownloadMatchesModal({ matches, onClose }: Props) {
  const [selectedDate, setSelectedDate] = useState("");
  const [phase, setPhase] = useState<Phase>("selecting");
  const [currentIndex, setCurrentIndex] = useState(0);
  const capturedBlobsRef = useRef<{ name: string; blob: Blob }[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    matches.forEach((m) => { if (m.matchDate && m.photoUrl) dates.add(m.matchDate); });
    return Array.from(dates).sort().reverse();
  }, [matches]);

  const matchesToRender = useMemo(
    () => matches.filter((m) => m.matchDate === selectedDate && m.photoUrl),
    [matches, selectedDate]
  );

  // Render → capture loop
  useEffect(() => {
    if (phase !== "rendering") return;
    const match = matchesToRender[currentIndex];
    if (!match) return;

    const capture = async () => {
      // Beri waktu React untuk paint komponen ke DOM
      await new Promise((r) => setTimeout(r, 200));

      const el = cardRef.current;
      if (!el) return;

      const imgs = Array.from(el.querySelectorAll<HTMLImageElement>("img"));
      const originalSrcs = imgs.map((img) => img.src);

      // Konversi semua gambar ke base64 agar html-to-image bisa render lintas-origin
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
            await new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) { resolve(); return; }
              img.onload = () => resolve();
              img.onerror = () => resolve();
            });
          } catch { /* biarkan src asli */ }
        })
      );

      try {
        const { toPng } = await import("html-to-image");
        el.style.width = "640px";
        el.style.height = "auto";
        el.style.overflow = "visible";
        const naturalHeight = el.scrollHeight;

        const dataUrl = await toPng(el, {
          cacheBust: true,
          backgroundColor: "#0f172a",
          canvasWidth: 640,
          canvasHeight: naturalHeight,
        });

        const blob = await fetch(dataUrl).then((r) => r.blob());
        const safeName = `match_${match.id}_${match.player1}_vs_${match.player2}`
          .replace(/\s+/g, "_")
          .replace(/[^\w_]/g, "");
        capturedBlobsRef.current.push({ name: `${safeName}.png`, blob });
      } catch { /* skip match ini jika gagal */ }

      // Restore src asli
      imgs.forEach((img, i) => { img.src = originalSrcs[i]; });

      if (currentIndex + 1 >= matchesToRender.length) {
        setPhase("zipping");
      } else {
        setCurrentIndex((i) => i + 1);
      }
    };

    capture();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex]);

  // ZIP dan download
  useEffect(() => {
    if (phase !== "zipping") return;

    const doZip = async () => {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      capturedBlobsRef.current.forEach(({ name, blob }) => zip.file(name, blob));
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tenis-komedi_${selectedDate}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setPhase("done");
    };

    doZip();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleStartDownload = () => {
    if (!selectedDate || matchesToRender.length === 0) return;
    capturedBlobsRef.current = [];
    setCurrentIndex(0);
    setPhase("rendering");
  };

  const isProcessing = phase === "rendering" || phase === "zipping";

  return (
    <>
      {/* Hidden render area — off-screen, tidak terlihat user */}
      <div
        aria-hidden="true"
        style={{ position: "fixed", left: "-9999px", top: 0, zIndex: -1, pointerEvents: "none", width: "640px" }}
      >
        {phase === "rendering" && matchesToRender[currentIndex] && (
          <div ref={cardRef}>
            <MatchResultCard match={matchesToRender[currentIndex]} />
          </div>
        )}
      </div>

      {/* Modal UI */}
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">

          {phase === "done" ? (
            <>
              <h3 className="text-base font-bold text-emerald-400 mb-2">✓ Download Selesai</h3>
              <p className="text-xs text-slate-400 mb-5">
                {capturedBlobsRef.current.length} gambar berhasil didownload sebagai ZIP.
              </p>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 cursor-pointer rounded-lg bg-slate-800 border border-white/10 text-slate-100 font-semibold hover:bg-slate-700 transition-colors text-sm"
              >
                Tutup
              </button>
            </>
          ) : isProcessing ? (
            <>
              <h3 className="text-base font-bold text-slate-100 mb-3">
                {phase === "rendering" ? "Membuat gambar..." : "Membuat ZIP..."}
              </h3>
              {phase === "rendering" && (
                <>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2">
                    <div
                      className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / matchesToRender.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Pertandingan {currentIndex + 1} dari {matchesToRender.length}
                  </p>
                </>
              )}
              {phase === "zipping" && (
                <p className="text-xs text-amber-400 animate-pulse">Menyiapkan file ZIP...</p>
              )}
            </>
          ) : (
            <>
              <h3 className="text-base font-bold text-slate-100 mb-1">Download Hasil Pertandingan</h3>
              <p className="text-xs text-slate-500 mb-4">
                Pilih tanggal untuk mendownload semua gambar hasil pertandingan (format seperti "Buat jadi image").
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {availableDates.map((date) => {
                  const count = matches.filter((m) => m.matchDate === date && m.photoUrl).length;
                  const label = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        selectedDate === date
                          ? "bg-amber-500 border-amber-500 text-slate-900"
                          : "border-white/10 text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {label} <span className="opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>

              {selectedDate && matchesToRender.length > 0 && (
                <p className="text-xs text-emerald-400 mb-4">
                  {matchesToRender.length} gambar akan dirender lalu dikemas dalam ZIP
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 cursor-pointer rounded-lg bg-slate-800 border border-white/10 text-slate-100 font-semibold hover:bg-slate-700 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleStartDownload}
                  disabled={!selectedDate || matchesToRender.length === 0}
                  className="flex-1 px-4 py-2 cursor-pointer rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-400 font-semibold hover:bg-amber-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Download ZIP
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
