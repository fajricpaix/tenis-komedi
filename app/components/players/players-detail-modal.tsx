"use client";

import { useEffect, useState } from "react";
/* eslint-disable @next/next/no-img-element */
import BoxPlayerDetail from "@components/players/box";
import SkillsPlayerDetail from "@components/players/skills";
import { getTekoData, parseSetScore, type Player } from "@utils/fetcher";

type Props = {
  playerId: string | number;
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
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr));
}

export default function PlayerDetailModal({ playerId, onClose }: Props) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [rank, setRank] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imagesReady, setImagesReady] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    getTekoData()
      .then(({ players, matches }) => {
        const found = players.find((p) => String(p.id) === String(playerId));
        if (found) {
          setPlayer(found);

          const sameGender = players.filter((p) => p.gender === found.gender);
          const statsMap = new Map<string, { wins: number; losses: number; setWin: number }>();
          sameGender.forEach((p) => statsMap.set(p.name, { wins: 0, losses: 0, setWin: 0 }));

          matches.forEach((match) => {
            const [s1, s2] = parseSetScore(match.setScore);
            const p1 = statsMap.get(match.player1);
            const p2 = statsMap.get(match.player2);
            if (p1 && p2) {
              const isP1Win = match.winner === match.player1;
              p1[isP1Win ? "wins" : "losses"]++;
              p1.setWin += s1;
              p2[!isP1Win ? "wins" : "losses"]++;
              p2.setWin += s2;
            }
          });

          const ranked = sameGender
            .map((p) => {
              const s = statsMap.get(p.name)!;
              return { id: p.id, points: s.wins * 100 + s.losses * 30 + s.setWin * 10 };
            })
            .sort((a, b) => b.points - a.points);

          setRank(ranked.findIndex((p) => String(p.id) === String(playerId)) + 1);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [playerId]);

  useEffect(() => {
    if (!player) return;
    setImagesReady(false);
    const urls = [
      "/logoHD.webp",
      "/indonesia.png",
      player.imgUrl || (player.gender === "Pria" ? "/pria.jpg" : "/wanita.jpg"),
      "/icons/fore.webp",
      "/icons/back.webp",
      "/icons/service.webp",
      "/icons/volley.webp",
      "/icons/slice.webp",
    ];
    Promise.all(
      urls.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          })
      )
    ).then(() => setImagesReady(true));
  }, [player]);

  const handleDownloadImage = async () => {
    // Buka tab kosong sinkron (iOS Safari hanya izinkan window.open dari gesture langsung)
    const newTab = window.open("", "_blank");
    if (!newTab) { alert("Popup diblokir. Izinkan popup di browser ini."); return; }

    const card = document.getElementById("cardPlayerModal");
    if (!card) { newTab.close(); return; }

    setIsRendering(true);
    try {
      const { toPng } = await import("html-to-image");
      const orig = { w: card.style.width, h: card.style.height, o: card.style.overflow };
      card.style.width = "576px";
      card.style.height = "auto";
      card.style.overflow = "visible";
      const naturalHeight = card.scrollHeight;
      const dataUrl = await toPng(card, { cacheBust: true, backgroundColor: "#071c12", canvasWidth: 560, canvasHeight: naturalHeight });
      card.style.width = orig.w;
      card.style.height = orig.h;
      card.style.overflow = orig.o;

      const blob = await fetch(dataUrl).then((r) => r.blob());
      const blobUrl = URL.createObjectURL(blob);
      newTab.location.href = blobUrl;
    } catch {
      newTab.close();
      alert("Maaf, terjadi kesalahan saat mencoba membuat gambar.");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-70 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-6 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl">
        {/* Close button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {loading && (
          <div className="text-center py-20 text-slate-400">Memuat data pemain...</div>
        )}

        {!loading && !player && (
          <div className="text-center py-20 text-red-400">Pemain tidak ditemukan.</div>
        )}

        {!loading && player && (
          <>
            <div
              id="cardPlayerModal"
              className="relative rounded-2xl overflow-hidden p-1 md:p-2 bg-linear-to-r from-[#FFE094] via-[#C59B27] to-[#8A640F]"
            >
              <div className="p-4 md:p-6 rounded-2xl bg-linear-to-tr from-[#0E6F39] to-[#3d0a89]">
                {/* Dot pattern */}
                <>
                  <div
                    className="absolute top-3 right-4 w-56 h-60 md:w-96 md:h-80 opacity-20 pointer-events-none rounded-bl-full"
                    style={{ backgroundImage: "radial-gradient(circle, #00e5a0 2px, transparent 2px)", backgroundSize: "10px 10px" }}
                  />
                  <div
                    className="absolute bottom-3 left-3 right-3 h-96 md:h-80 opacity-20 pointer-events-none rounded-tr-full"
                    style={{ backgroundImage: "radial-gradient(circle, #3d0a89 2px, transparent 2px)", backgroundSize: "10px 10px" }}
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
                <div className="flex gap-4 md:gap-8 relative z-10">
                  <div className="w-3/5">
                    <p className="mb-2 italic font-black text-emerald-400 tracking-wide">
                      Peringkat #{rank} {player.gender === "Pria" ? "Pria" : "Wanita"}
                    </p>
                    <h2 className="text-4xl font-black text-slate-100 leading-tight mb-1 capitalize overflow-hidden max-h-24 flex items-center">
                      {player.name}
                    </h2>
                    <h3 className="text-sm font-semibold text-slate-300 italic">
                      A.K.A <span className="capitalize text-emerald-400 font-black text-lg">{player.nickname}</span>
                    </h3>
                    <div className="flex items-center mt-3 gap-x-2">
                      <img
                        src="/indonesia.png"
                        alt="Indonesia Flag"
                        className="h-6 w-auto object-contain"
                      />
                      <span className="font-semibold capitalize text-slate-200">{player.birthPlace}</span>
                    </div>
                  </div>
                  <div className="shrink-0 w-2/5">
                    <figure className="rounded-xl overflow-hidden border-2 md:border-4 border-[#C59B27]">
                      <img
                        src={player.imgUrl || (player.gender === "Pria" ? "/pria.jpg" : "/wanita.jpg")}
                        alt={player.name}
                        crossOrigin="anonymous"
                        className="w-full aspect-square object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = player.gender === "Pria" ? "/pria.jpg" : "/wanita.jpg"; }}
                      />
                    </figure>
                  </div>
                </div>

                {/* Reason */}
                <div className="relative text-sm z-10 mt-6 px-4 py-3 rounded-xl text-center bg-black/30 border-2 md:border-4 border-[#C59B27]">
                  <h3 className="font-semibold">Alasan Main Tenis :</h3>
                  <p className="italic capitalize font-semibold text-[#FFE094] mt-1">"{player.reason}"</p>
                </div>

                {/* Stats */}
                <div className="relative z-10 flex gap-6 mt-6">
                  <BoxPlayerDetail 
                    title="Umur"         
                    icon="📅" 
                    subTitle={formatShortDate(player.birthDate)}        
                    desc={`${calculateAge(player.birthDate)} Tahun`} />
                  <BoxPlayerDetail 
                    title="Main Sejak"   
                    icon="🎾" 
                    subTitle={`${player.startYear}+`}                   
                    desc={`± ${calculateAge(player.startYear)} Tahun`} />
                  {/* <BoxPlayerDetail 
                    title="Alamat Rumah" 
                    icon="🏠" 
                    subTitle="Serpong Lagoon"                           
                    desc={`${player.houseBlock} No.${player.houseNumber}`} /> */}
                </div>

                {/* Skills */}
                <div className="mt-6 relative z-10">
                  <h3 className="mb-3 font-black text-lg text-slate-100 tracking-wide">Skill Pemain</h3>
                  <div className="p-4 rounded-xl space-y-3 bg-black/30 border-2 md:border-4 border-[#C59B27]">
                    <SkillsPlayerDetail imgUrl="/icons/fore.webp"    skillName="Forehand" value={player.skills.forehand} />
                    <SkillsPlayerDetail imgUrl="/icons/back.webp"    skillName="Backhand" value={player.skills.backhand} />
                    <SkillsPlayerDetail imgUrl="/icons/service.webp" skillName="Service"  value={player.skills.service} />
                    <SkillsPlayerDetail imgUrl="/icons/volley.webp"  skillName="Volley"   value={player.skills.volley} />
                    <SkillsPlayerDetail imgUrl="/icons/slice.webp"   skillName="Slice"    value={player.skills.slice} />
                    <SkillsPlayerDetail imgUrl="/icons/fore.webp"    skillName="Loop"     value={player.skills.loop} />
                  </div>
                </div>

                <p className="relative z-10 mt-5 text-center text-[10px] text-slate-600 tracking-widest uppercase">Next.js Powered</p>
              </div>
            </div>


            <button
              onClick={handleDownloadImage}
              disabled={!imagesReady || isRendering}
              className="w-full mt-4 py-4 rounded-xl text-sm font-extrabold tracking-widest uppercase transition-all duration-200 bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:scale-[1.02] enabled:active:scale-[0.98]"
            >
              {isRendering ? "Membuat gambar..." : imagesReady ? "Buat jadi image" : "Memuat gambar..."}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
