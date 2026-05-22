
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
	imageSrc?: string; // Add this line for player-specific image source
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

export default function PlayerDetailPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [player, setPlayer] = useState<Player | null>(null);
	const [loading, setLoading] = useState(true);

	const id = Number(searchParams.get("id"));

	useEffect(() => {
		fetch("/json/teko.json")
			.then((res) => res.json())
			.then((data) => {
				const found = data.players.find((p: Player) => p.id === id);
				setPlayer(found ?? null);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [id]);

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
			<div className="relative rounded-2xl shadow-xl p-8 bg-white/10 border border-white/10">

        <figure className="absolute z-0 top-12 left-12">
          <Image
              src={'/logoHD.webp'} // Use player's image or a generic placeholder
              alt={player.name}
              width={320}
              height={320}
              className="object-cover opacity-10 grayscale"
            />
        </figure>

				<div className="flex gap-6 relative z-10">
          <div className="w-2/3">
            <h1 className="text-5xl font-black text-slate-100 leading-14">{player.name}</h1>
            <h3 className="text-xl font-semibold text-slate-100 italic"><small>A.K.A</small> <span className="text-emerald-400">{player.nickname}</span></h3>
            <div className="flex items-center mt-3 gap-x-2">
              <Image 
                src="/indonesia.png"
                alt="Indonesia Flag"
                width={28}
                height={28}
                className="object-contain"
              />
              <span className="font-semibold uppercase text-slate-200">{player.birthPlace}</span>
            </div>
          </div>
          <div className="w-1/3">
            <Image
              src={player.imageSrc || '/photo/federer.webp'} // Use player's image or a generic placeholder
              alt={player.name}
              width={200}
              height={200}
              className="rounded-lg border w-full border-white/10 shadow-lg shadow-emerald-900/30 object-cover"
            />
          </div>
        </div>

        <div className="relative z-10 mt-5 py-3 rounded-xl text-center bg-black/25 border border-white/10 shadow-lg shadow-emerald-900/30">
          <h3 className="font-semibold text-sm">Alasan Main Tenis :</h3>
          <p className="italic text-xs text-emerald-400">"{player.reason}"</p>
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
              imgUrl="/icons/forehand.webp"
              skillName="Forehand"
              value={player.skills.forehand}
            />
            <SkillsPlayerDetail 
              imgUrl="/icons/backhand.webp"
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
		</section>
	);
}
