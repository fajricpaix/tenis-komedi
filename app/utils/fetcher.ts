import { app } from "@utils/firebase";
import { getDatabase, ref, get } from "firebase/database";
const db = getDatabase(app);

export type Player = {
  tournament: any;
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
	imgUrl?: string;
	skills: {
		forehand: number;
		backhand: number;
		service: number;
		volley: number;
		slice: number;
		loop: number;
	};
};

export type Match = {
	id: number;
	player1: string;
	player2: string;
	winner: string;
	setScore: string;
	pointScoresA?: string[];
	pointScoresB?: string[];
	photoUrl?: string;
	matchDate?: string;
};

export type Champion = {
	category: "atp" | "wta";
	position: 1 | 2;
	idPlayer: string;
	name: string;
};

export type Spectator = { name: string; imgUrl?: string };

export type Tournament = {
	title: string;
	matches: Match[];
	champion?: Champion[];
	spectators?: Spectator[];
	featuredMatches?: { atp: number[]; wta: number[] };
};

export type TekoData = {
	players: Player[];
	matches: Match[];
	tournaments: Tournament[];
};

export function parseSetScore(value: string): [number, number] {
	const [s1, s2] = value.split("-").map((v) => Number(v.trim()));
	return Number.isFinite(s1) && Number.isFinite(s2) ? [s1, s2] : [0, 0];
}

export function slugifyTournamentTitle(title: string): string {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-+|-+$)/g, "");
}

function toArray<T>(raw: unknown): T[] {
	if (!raw) return [];
	if (Array.isArray(raw)) return (raw as T[]).filter(Boolean);
	return (Object.values(raw) as T[]).filter(Boolean);
}

export async function getTekoData(): Promise<TekoData> {
	try {
		const dbRef = ref(db, 'tenis-komedi');
		const snapshot = await get(dbRef);

		if (snapshot.exists()) {
			const data = snapshot.val();

			const players = toArray<Player>(data["0"]?.players);

			const rawTournaments = toArray<Record<string, unknown>>(data["1"]?.tournaments);
			const tournaments: Tournament[] = rawTournaments.map((t) => {
				const rawChampions = toArray<Record<string, unknown>>(t.champion);
				const champion: Champion[] = rawChampions.flatMap((c) => {
					const cat = c.category as "atp" | "wta";
					const entries: Champion[] = [];
					if (c.first && typeof c.first === "object") {
						const f = c.first as Record<string, string>;
						entries.push({ category: cat, position: 1, idPlayer: f.idPlayer ?? "", name: f.name ?? "" });
					}
					if (c.second && typeof c.second === "object") {
						const s = c.second as Record<string, string>;
						entries.push({ category: cat, position: 2, idPlayer: s.idPlayer ?? "", name: s.name ?? "" });
					}
					if (typeof c.position === "number") {
						entries.push({ category: cat, position: c.position as 1 | 2, idPlayer: String(c.idPlayer ?? ""), name: String(c.name ?? "") });
					}
					return entries;
				});
				return {
					title: String(t.title ?? ""),
					matches: toArray<Match>(t.matches),
					champion,
					spectators: toArray<Spectator>(t.spectators),
					featuredMatches: t.featuredMatches as { atp: number[]; wta: number[] } | undefined,
				};
			});

			const matches = tournaments.flatMap((t) => t.matches);

			return { players, matches, tournaments };
		}
		return { players: [], matches: [], tournaments: [] };
	} catch (error) {
		console.error("Error fetching data from Firebase:", error);
		return { players: [], matches: [], tournaments: [] };
	}
}