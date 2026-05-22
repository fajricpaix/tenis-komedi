
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import BoxPlayerDetail from "@components/players/box";
import SkillsPlayerDetail from "@components/players/skills";

type Player = {
	id: number;
	name: string;
	nickname: string;
	birthPlace: string;
	birthDate: string;
	gender: "Pria" | "Wanita";
	houseBlock: string;
	houseNumber: string;
	startMonth: string;
	startYear: string;
	reason: string;
	imgUrl?: string; // Add this line for player-specific image source
	skills: { // Keep existing skills property
		forehand: number;
		backhand: number;
		service: number;
		volley: number;
		slice: number;
		loop: number;
	};
};

function calculateAge(birthDate: string): string {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return `${age}`;
}

function formatIndonesianDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function parseSetScore(value: string): [number, number] {
  const [s1, s2] = value.split("-").map((v) => Number(v.trim()));
  return [s1 || 0, s2 || 0];
}

export default function PlayerDetailPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [player, setPlayer] = useState<Player | null>(null);
	const [rank, setRank] = useState<number>(0);
	const [loading, setLoading] = useState(true);

	const id = Number(searchParams.get("id"));

	useEffect(() => {
		fetch("/json/teko.json")
			.then((res) => res.json())
			.then((data: { players: Player[]; matches: any[] }) => {
				const found = data.players.find((p) => p.id === id);
				if (found) {
					setPlayer(found);

					// Hitung statistik untuk semua pemain dengan gender yang sama
					const sameGenderPlayers = data.players.filter(p => p.gender === found.gender);
					const statsMap = new Map<string, { wins: number; losses: number; setWin: number; points: number }>();

					sameGenderPlayers.forEach(p => {
						statsMap.set(p.name, { wins: 0, losses: 0, setWin: 0, points: 0 });
					});

					data.matches.forEach(match => {
						const [s1, s2] = parseSetScore(match.setScore);
						const p1Stats = statsMap.get(match.player1);
						const p2Stats = statsMap.get(match.player2);

						if (p1Stats && p2Stats) {
							const isP1Winner = match.winner === match.player1;
							p1Stats[isP1Winner ? 'wins' : 'losses'] += 1;
							p1Stats.setWin += s1;
							p2Stats[!isP1Winner ? 'wins' : 'losses'] += 1;
							p2Stats.setWin += s2;
						}
					});

					const rankedList = sameGenderPlayers.map(p => {
						const s = statsMap.get(p.name)!;
						const points = (s.wins * 100) + (s.losses * 30) + (s.setWin * 10);
						return { id: p.id, points };
					}).sort((a, b) => b.points - a.points);

					const currentRank = rankedList.findIndex(p => p.id === id) + 1;
					setRank(currentRank);
				}
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [id]);

	const handleDownloadImage = async () => {
		const cardElement = document.getElementById("cardPlayer");
		if (!cardElement) return;

		try {
			// Mengimpor library secara dinamis saat tombol diklik
			const { toPng } = await import("html-to-image");
			
			const dataUrl = await toPng(cardElement, { 
				cacheBust: true,
				// Memberikan background solid agar transparansi tidak bermasalah saat disimpan
				backgroundColor: '#0f172a', 
			});
			
			const link = document.createElement("a");
			link.download = `${player?.name.replace(/\s+/g, '-').toLowerCase()}.png`;
			link.href = dataUrl;
			link.click();
		} catch (err) {
			console.error("Gagal membuat gambar:", err);
			alert("Maaf, terjadi kesalahan saat mencoba membuat gambar.");
		}
	};

	if (loading) {
		return <div className="p-10 text-center text-lg text-slate-400">Memuat data pemain...</div>;
	}

	if (!player) {
		return (
			<div className="p-10 text-center text-red-500">
				Pemain tidak ditemukan.<br />
				<button className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg" onClick={() => router.back()}>
					Kembali
				</button>
			</div>
		);
	}

	return (
		<section className="max-w-xl mx-auto px-4 py-10">
			<div id="cardPlayer" className="relative rounded-2xl shadow-xl p-8 bg-white/10 border border-white/10">

        <figure className="absolute z-0 top-12 left-12">
          <Image
              src={'/logoHD.webp'} // Use player's image or a generic placeholder
              alt={player.name}
              loading="eager"
              width={320}
              height={320}
              className="object-cover opacity-10 grayscale"
            />
        </figure>

				<div className="flex gap-6 relative z-10">
          <div className="w-3/5">
            <p className="text-sm mb-2 italic font-black text-emerald-400">Peringkat #{rank} {player.gender === 'Pria' ? 'Pria' : 'Wanita'}</p>
            <h2 className="text-4xl font-black text-slate-100 leading-10 mb-1 capitalize">{player.name}</h2>
            <h3 className="text-xl font-semibold text-slate-100 italic"><small>A.K.A</small> <span className="capitalize text-emerald-400">{player.nickname}</span></h3>
            <div className="flex items-center mt-3 gap-x-2">
              <Image 
                src="/indonesia.png"
                alt="Indonesia Flag"
                width={28}
                height={'28'}
                className="w-auto object-contain"
              />
              <span className="font-semibold capitalize text-slate-200">{player.birthPlace}</span>
            </div>
          </div>
          <div className="w-2/5">
            <figure className="rounded-xl overflow-hidden p-2 border border-emerald-400 shadow-lg shadow-emerald-900/30">
              <Image
                src={player.imgUrl || '/photo/federer.webp'} // Use player's image or a generic placeholder
                alt={player.name}
                width={200}
                height={200}
                className="w-full aspect-square object-cover rounded-lg"
              />
            </figure>
          </div>
        </div>

        <div className="relative z-10 mt-5 px-4 py-3 rounded-xl text-center bg-black/25 border border-white/10 shadow-lg shadow-emerald-900/30">
          <h3 className="font-semibold">Alasan Main Tenis :</h3>
          <p className="italic capitalize text-sm text-emerald-400">"{player.reason}"</p>
        </div>

        <div className="relative z-10 flex gap-4 mt-5">
          <BoxPlayerDetail 
            title="Umur" 
            subTitle={formatIndonesianDate(player.birthDate)}
            desc={`${calculateAge(player.birthDate)} Tahun`}
          />
          <BoxPlayerDetail 
            title="Main Sejak"
            subTitle={`${player.startMonth} ${player.startYear}`}
            desc={`${calculateAge(player.startYear)}+ Tahun`}
          />
          <BoxPlayerDetail 
            title="Alamat Rumah"
            subTitle="Serpong Lagoon"
            desc={`${player.houseBlock} No.${player.houseNumber}`}
          />
        </div>
        
        <div className="mt-5 relative z-10">
          <h3 className="mb-2 font-bold text-xl">Skill Pemain</h3>
          <div className="p-4 rounded-xl bg-black/25 border border-white/10 shadow-lg shadow-emerald-900/30">
            <SkillsPlayerDetail 
              imgUrl="/icons/fore.webp"
              skillName="Forehand"
              value={player.skills.forehand}
            />
            <SkillsPlayerDetail 
              imgUrl="/icons/back.webp"
              skillName="Backhand"
              value={player.skills.backhand}
            />
            <SkillsPlayerDetail 
              imgUrl="/icons/service.webp"
              skillName="Service"
              value={player.skills.service}
            />
            <SkillsPlayerDetail 
              imgUrl="/icons/volley.webp"
              skillName="Volley"
              value={player.skills.volley}
            />
            <SkillsPlayerDetail 
              imgUrl="/icons/slice.webp"
              skillName="Slice"
              value={player.skills.slice}
            />
            <SkillsPlayerDetail 
              imgUrl="/icons/forehand.webp"
              skillName="Loop"
              value={player.skills.loop}
            />
          </div>
        </div>

			</div>

      <button 
        onClick={handleDownloadImage}
        className="w-full mt-4 py-4 rounded-xl text-sm font-extrabold tracking-widest cursor-pointer uppercase transition-all duration-200 bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/50 hover:scale-[1.02] active:scale-[0.98]">
        Buat jadi image
      </button>
		</section>
	);
}
