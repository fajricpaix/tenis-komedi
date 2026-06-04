"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

  const handleDownloadImage = async () => {
    const card = document.getElementById("cardPlayerModal");
    if (!card) return;
    try {
      const { toPng } = await import("html-to-image");
      const orig = { w: card.style.width, h: card.style.height, o: card.style.overflow };
      card.style.width = "560px";
      card.style.height = "950px";
      card.style.overflow = "hidden";
      const dataUrl = await toPng(card, { cacheBust: true, backgroundColor: "#071c12", canvasWidth: 560, canvasHeight: 950 });
      card.style.width = orig.w;
      card.style.height = orig.h;
      card.style.overflow = orig.o;
      const link = document.createElement("a");
      link.download = `${player?.name.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("Maaf, terjadi kesalahan saat mencoba membuat gambar.");
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
              className="relative rounded-2xl overflow-hidden p-2 bg-linear-to-r from-[#FFE094] via-[#C59B27] to-[#8A640F]"
            >
              <div className="p-4 rounded-2xl bg-linear-to-tr from-[#0E6F39] to-[#3d0a89]">
                {/* Dot pattern */}
                <>
                  <div
                    className="absolute top-0 right-0 w-96 h-80 opacity-20 pointer-events-none rounded-bl-full"
                    style={{ backgroundImage: "radial-gradient(circle, #00e5a0 1px, transparent 1px)", backgroundSize: "10px 10px" }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-100 h-60 opacity-30 pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(circle, #00e5a0 1px, transparent 1px)", backgroundSize: "10px 10px" }}
                  />
                </>

                {/* Watermark */}
                <figure className="absolute z-0 top-10 left-0 pointer-events-none">
                  <Image 
                    src="/logoHD.webp" 
                    alt={player.name} 
                    loading="eager" 
                    width={440} 
                    height={440} 
                    className="object-cover opacity-[0.08] grayscale" />
                </figure>

                {/* Header */}
                <div className="flex gap-4 relative z-10">
                  <div className="flex-1 min-w-0">
                    <p className="mb-2 italic font-black text-emerald-400 tracking-wide">
                      Peringkat #{rank} {player.gender === "Pria" ? "Pria" : "Wanita"}
                    </p>
                    <h2 className="text-4xl font-black text-slate-100 leading-tight mb-1 capitalize overflow-hidden h-24 flex items-center">
                      {player.name}
                    </h2>
                    <h3 className="text-sm font-semibold text-slate-300 italic">
                      A.K.A <span className="capitalize text-emerald-400 font-black text-lg">{player.nickname}</span>
                    </h3>
                    <div className="flex items-center mt-3 gap-x-2">
                      <Image src="/indonesia.png" alt="Indonesia Flag" width={32} height={32} className="w-auto object-contain" />
                      <span className="font-semibold capitalize text-slate-200">{player.birthPlace}</span>
                    </div>
                  </div>
                  <div className="shrink-0 w-56">
                    <figure
                      className="rounded-xl overflow-hidden border-4 border-[#C59B27] shadow-lg shadow-[#C59B27]/40"
                    >
                      <Image
                        src={player.imgUrl || (player.gender === "Pria" ? "/pria.jpg" : "/wanita.jpg")}
                        alt={player.name}
                        width={200}
                        height={200}
                        className="w-full aspect-square object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = player.gender === "Pria" ? "/pria.jpg" : "/wanita.jpg"; }}
                      />
                    </figure>
                  </div>
                </div>

                {/* Reason */}
                <div className="relative text-sm z-10 mt-5 px-4 py-3 rounded-xl text-center bg-white/35 border-4 border-[#C59B27]">
                  <h3 className="font-semibold text-black">Alasan Main Tenis :</h3>
                  <p className="italic capitalize font-semibold text-[#FFE094] mt-1">"{player.reason}"</p>
                </div>

                {/* Stats */}
                <div className="relative z-10 flex gap-3 mt-4">
                  <BoxPlayerDetail 
                    title="Umur"         
                    icon="📅" 
                    subTitle={formatShortDate(player.birthDate)}        
                    desc={`${calculateAge(player.birthDate)} Tahun`} />
                  <BoxPlayerDetail 
                    title="Main Sejak"   
                    icon="🎾" 
                    subTitle={`${player.startYear}+`}                   
                    desc={`${calculateAge(player.startYear)}+ Tahun`} />
                  <BoxPlayerDetail 
                    title="Alamat Rumah" 
                    icon="🏠" 
                    subTitle="Serpong Lagoon"                           
                    desc={`${player.houseBlock} No.${player.houseNumber}`} />
                </div>

                {/* Skills */}
                <div className="mt-4 relative z-10">
                  <h3 className="mb-3 font-black text-lg text-slate-100 tracking-wide">Skill Pemain</h3>
                  <div className="p-4 rounded-xl bg-black/30 border border-emerald-900/40 space-y-3">
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
              className="w-full mt-4 py-4 rounded-xl text-sm font-extrabold tracking-widest cursor-pointer uppercase transition-all duration-200 bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              Download Kartu Pemain
            </button>
          </>
        )}
      </div>
    </div>
  );
}
