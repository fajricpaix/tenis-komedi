import { parseSetScore, type Player, type Match } from "@utils/fetcher";

export function calculateAge(dateStr: string): number {
  const today = new Date();
  const d = new Date(dateStr);
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export type PlayerWithRank = Player & {
  rank: number;
  points: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  setWin: number;
  setLose: number;
};

export function buildRankedPlayers(
  players: Player[],
  matches: Match[],
  gender: "Pria" | "Wanita"
): PlayerWithRank[] {
  const genderPlayers = players.filter((p) => p.gender === gender);
  const statsMap = new Map<string, Omit<PlayerWithRank, keyof Player | "rank">>();

  genderPlayers.forEach((p) => {
    statsMap.set(p.name, { wins: 0, losses: 0, setWin: 0, setLose: 0, points: 0, matchesPlayed: 0 });
  });

  matches.forEach((match) => {
    const [s1, s2] = parseSetScore(match.setScore);
    const isP1Win = match.winner === match.player1;
    const winnerScore = isP1Win ? s1 : s2;
    const loserScore = isP1Win ? s2 : s1;
    const loserName = isP1Win ? match.player2 : match.player1;

    const ws = statsMap.get(match.winner);
    const ls = statsMap.get(loserName);
    if (ws) { ws.matchesPlayed++; ws.wins++; ws.setWin += winnerScore; ws.setLose += loserScore; ws.points += 6 - loserScore; }
    if (ls) { ls.matchesPlayed++; ls.losses++; ls.setWin += loserScore; ls.setLose += winnerScore; ls.points += loserScore + 1; }
  });

  return genderPlayers
    .map((p) => ({ ...p, rank: 0, ...(statsMap.get(p.name) ?? { wins: 0, losses: 0, setWin: 0, setLose: 0, points: 0, matchesPlayed: 0 }) }))
    .sort((a, b) => b.points - a.points || b.wins - a.wins)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}
