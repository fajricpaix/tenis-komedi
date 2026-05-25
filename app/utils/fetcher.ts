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
	const res = await fetch("/json/teko.json");
	if (!res.ok) return { players: [], matches: [] };
	const rawData = await res.json();

	return {
		players: rawData["tenis-komedi"]?.["0"]?.players || [],
		matches: rawData["tenis-komedi"]?.["1"]?.matches || [],
	};
}