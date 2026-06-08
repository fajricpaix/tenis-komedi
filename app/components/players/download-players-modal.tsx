"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef } from "react";
import BoxPlayerDetail from "@components/players/box";
import SkillsPlayerDetail from "@components/players/skills";

type PlayerSkills = {
  forehand: number;
  backhand: number;
  service: number;
  volley: number;
  slice: number;
  loop: number;
};

export type PlayerForCard = {
  id: number | string;
  name: string;
  nickname?: string;
  gender: "Pria" | "Wanita";
  imgUrl?: string;
  birthDate?: string;
  birthPlace?: string;
  startYear?: string;
  reason?: string;
  skills?: PlayerSkills;
};

type Props = {
  players: PlayerForCard[];
  onClose: () => void;
};

function calculateAge(dateStr: string): string {
  const today = new Date();
  const d = new Date(dateStr);
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return `${age}`;
}

function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function PlayerCardContent({ player, rank }: { player: PlayerForCard; rank: number }) {
  const defaultImg = player.gender === "Pria" ? "/pria.jpg" : "/wanita.jpg";

  return (
    <div className="relative rounded-2xl overflow-hidden p-1 bg-linear-to-r from-[#FFE094] via-[#C59B27] to-[#8A640F]">
      <div className="p-4 rounded-2xl bg-linear-to-tr from-[#0E6F39] to-[#3d0a89]">
        {/* Dot pattern */}
        <>
          <div
            className="absolute top-3 right-4 w-56 h-60 opacity-20 pointer-events-none rounded-bl-full"
            style={{
              backgroundImage: "radial-gradient(circle, #00e5a0 2px, transparent 2px)",
              backgroundSize: "10px 10px",
            }}
          />
          <div
            className="absolute bottom-3 left-3 right-3 h-96 opacity-20 pointer-events-none rounded-tr-full"
            style={{
              backgroundImage: "radial-gradient(circle, #3d0a89 2px, transparent 2px)",
              backgroundSize: "10px 10px",
            }}
          />
        </>

        {/* Watermark */}
        <figure className="absolute z-0 top-10 left-0 pointer-events-none">
          <img
            src="/logoHD.webp"
            alt={player.name}
            width={440}
            height={440}
            className="object-cover opacity-[0.08] grayscale"
          />
        </figure>

        {/* Header */}
        <div className="flex gap-4 relative z-10">
          <div className="w-3/5">
            <p className="mb-2 italic font-black text-emerald-400 tracking-wide">
              Peringkat #{rank} {player.gender === "Pria" ? "Pria" : "Wanita"}
            </p>
            <h2 className="text-xl font-black text-slate-100 leading-tight mb-1 capitalize overflow-hidden max-h-24 flex items-center">
              {player.name}
            </h2>
            <p className="text-xs font-semibold text-slate-300 italic">
              <small>A.K.A</small>{" "}
              <span className="capitalize text-emerald-400 font-black">{player.nickname}</span>
            </p>
            <div className="flex items-center mt-3 gap-x-2">
              <img src="/indonesia.png" alt="Indonesia Flag" className="h-6 w-auto object-contain" />
              <span className="font-semibold capitalize text-slate-200">{player.birthPlace}</span>
            </div>
          </div>
          <div className="shrink-0 w-2/5">
            <figure className="rounded-xl overflow-hidden border-2 border-[#C59B27]">
              <img
                src={player.imgUrl || defaultImg}
                alt={player.name}
                crossOrigin="anonymous"
                className="w-full aspect-square object-cover"
              />
            </figure>
          </div>
        </div>

        {/* Reason */}
        <div className="relative text-sm z-10 mt-6 px-4 py-3 rounded-xl text-center bg-black/30 border-2 border-[#C59B27]">
          <h3 className="font-semibold">Alasan Main Tenis :</h3>
          <p className="italic capitalize font-semibold text-[#FFE094] mt-1">"{player.reason}"</p>
        </div>

        {/* Stats */}
        {player.birthDate && player.startYear && (
          <div className="relative z-10 flex gap-6 mt-6">
            <BoxPlayerDetail
              title="Umur"
              icon="📅"
              subTitle={formatShortDate(player.birthDate)}
              desc={`${calculateAge(player.birthDate)} Tahun`}
            />
            <BoxPlayerDetail
              title="Main Sejak"
              icon="🎾"
              subTitle={`${player.startYear}+`}
              desc={`± ${calculateAge(player.startYear)} Tahun`}
            />
          </div>
        )}

        {/* Skills */}
        {player.skills && (
          <div className="mt-6 relative z-10">
            <h3 className="mb-3 font-black text-lg text-slate-100 tracking-wide">Skill Pemain</h3>
            <div className="p-4 rounded-xl space-y-3 bg-black/30 border-2 border-[#C59B27]">
              <SkillsPlayerDetail imgUrl="/icons/fore.webp"    skillName="Forehand" value={player.skills.forehand} />
              <SkillsPlayerDetail imgUrl="/icons/back.webp"    skillName="Backhand" value={player.skills.backhand} />
              <SkillsPlayerDetail imgUrl="/icons/service.webp" skillName="Service"  value={player.skills.service} />
              <SkillsPlayerDetail imgUrl="/icons/volley.webp"  skillName="Volley"   value={player.skills.volley} />
              <SkillsPlayerDetail imgUrl="/icons/slice.webp"   skillName="Slice"    value={player.skills.slice} />
              <SkillsPlayerDetail imgUrl="/icons/fore.webp"    skillName="Loop"     value={player.skills.loop} />
            </div>
          </div>
        )}

        <p className="relative z-10 mt-5 text-center text-[10px] text-slate-600 tracking-widest uppercase">
          Next.js Powered
        </p>
      </div>
    </div>
  );
}

type Phase = "idle" | "rendering" | "zipping" | "done";

export default function DownloadPlayersModal({ players, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const capturedBlobsRef = useRef<{ name: string; blob: Blob }[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  // Render → capture loop
  useEffect(() => {
    if (phase !== "rendering") return;
    const player = players[currentIndex];
    if (!player) return;

    const capture = async () => {
      // Beri waktu React untuk paint komponen ke DOM
      await new Promise((r) => setTimeout(r, 300));

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
        el.style.width = "576px";
        el.style.height = "auto";
        el.style.overflow = "visible";
        const naturalHeight = el.scrollHeight;

        const dataUrl = await toPng(el, {
          cacheBust: true,
          backgroundColor: "#071c12",
          canvasWidth: 560,
          canvasHeight: naturalHeight,
        });

        // Composite ke canvas 1:1 dengan background hitam
        const cardImg = new Image();
        cardImg.src = dataUrl;
        await new Promise<void>((resolve) => { cardImg.onload = () => resolve(); });

        const size = 1080;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, size, size);
        const scale = Math.min(size / cardImg.width, size / cardImg.height);
        const w = cardImg.width * scale;
        const h = cardImg.height * scale;
        ctx.drawImage(cardImg, (size - w) / 2, (size - h) / 2, w, h);

        const squareBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/png");
        });

        const safeName = `player_${String(player.id).padStart(2, "0")}_${player.name}`
          .replace(/\s+/g, "_")
          .replace(/[^\w_]/g, "");
        capturedBlobsRef.current.push({ name: `${safeName}.png`, blob: squareBlob });
      } catch { /* skip pemain ini jika gagal */ }

      // Restore src asli
      imgs.forEach((img, i) => { img.src = originalSrcs[i]; });

      if (currentIndex + 1 >= players.length) {
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
      a.download = "player-cards.zip";
      a.click();
      URL.revokeObjectURL(url);
      setPhase("done");
    };

    doZip();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleStart = () => {
    capturedBlobsRef.current = [];
    setCurrentIndex(0);
    setPhase("rendering");
  };

  const isProcessing = phase === "rendering" || phase === "zipping";
  const currentPlayer = players[currentIndex];

  return (
    <>
      {/* Hidden render area — off-screen */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          zIndex: -1,
          pointerEvents: "none",
          width: "576px",
        }}
      >
        {phase === "rendering" && currentPlayer && (
          <div ref={cardRef}>
            <PlayerCardContent player={currentPlayer} rank={currentIndex + 1} />
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
                {capturedBlobsRef.current.length} kartu pemain berhasil didownload sebagai ZIP.
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
                {phase === "rendering" ? "Membuat kartu pemain..." : "Membuat ZIP..."}
              </h3>
              {phase === "rendering" && (
                <>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2">
                    <div
                      className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / players.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Pemain {currentIndex + 1} dari {players.length}
                    {currentPlayer ? ` — ${currentPlayer.name}` : ""}
                  </p>
                </>
              )}
              {phase === "zipping" && (
                <p className="text-xs text-emerald-400 animate-pulse">Menyiapkan file ZIP...</p>
              )}
            </>
          ) : (
            <>
              <h3 className="text-base font-bold text-slate-100 mb-1">Download Semua Kartu Pemain</h3>
              <p className="text-xs text-slate-500 mb-4">
                Render {players.length} kartu pemain sebagai gambar 1:1 background hitam, lalu kemas dalam ZIP.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 cursor-pointer rounded-lg bg-slate-800 border border-white/10 text-slate-100 font-semibold hover:bg-slate-700 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleStart}
                  disabled={players.length === 0}
                  className="flex-1 px-4 py-2 cursor-pointer rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-semibold hover:bg-emerald-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
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
