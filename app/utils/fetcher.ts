import { app } from "@utils/firebase";
import { getDatabase, ref, get } from "firebase/database";
const db = getDatabase(app);

export type Player = {
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
			return {
				players: data["0"]?.players || [],
				matches: data["1"]?.matches || [],
			};
		}
		return { players: [], matches: [] };
	} catch (error) {
		console.error("Error fetching data from Firebase:", error);
		return { players: [], matches: [] };
	}
}