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
};

export type TekoData = {
	players: Player[];
	matches: Match[];
};

export function parseSetScore(value: string): [number, number] {
	const [s1, s2] = value.split("-").map((v) => Number(v.trim()));
	return Number.isFinite(s1) && Number.isFinite(s2) ? [s1, s2] : [0, 0];
}

export async function getTekoData(): Promise<TekoData> {
	try {
		const dbRef = ref(db, 'tenis-komedi');
		const snapshot = await get(dbRef);
		
		if (snapshot.exists()) {
			const data = snapshot.val();
			
			const rawPlayers = data["0"]?.players;
			const rawMatches = data["1"]?.matches;

			// Firebase RTD sering mengubah array dengan numeric keys/holes menjadi object.
			// Kita harus memastikan data dikembalikan sebagai array asli.
			return {
				players: Array.isArray(rawPlayers) ? rawPlayers.filter(Boolean) : (rawPlayers ? Object.values(rawPlayers) : []),
				matches: Array.isArray(rawMatches) ? rawMatches.filter(Boolean) : (rawMatches ? Object.values(rawMatches) : []),
			};
		}
		return { players: [], matches: [] };
	} catch (error) {
		console.error("Error fetching data from Firebase:", error);
		return { players: [], matches: [] };
	}
}