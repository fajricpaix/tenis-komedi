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

export type Tournament = {
	title: string;
	matches: Match[];
	champion?: Champion[];
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

			const rawTournaments = toArray<{ title: string; matches: unknown }>(data["1"]?.tournaments);
			const tournaments: Tournament[] = rawTournaments.map((t) => ({
				title: t.title,
				matches: toArray<Match>(t.matches),
				champion: toArray<Champion>((t as Record<string, unknown>).champion),
			}));

			const matches = tournaments.flatMap((t) => t.matches);

			return { players, matches, tournaments };
		}
		return { players: [], matches: [], tournaments: [] };
	} catch (error) {
		console.error("Error fetching data from Firebase:", error);
		return { players: [], matches: [], tournaments: [] };
	}
}