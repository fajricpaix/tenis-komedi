"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import HomeTab, { type TeamKey } from "@components/home/tab";
import HomeTable from "@components/home/table";
import MatchTable from "@components/match/match-table";
import {
  getTekoData,
  parseSetScore,
  slugifyTournamentTitle,
  type Tournament,
  type Player,
  type Champion,
  type Match,
} from "@utils/fetcher";

type PlayerStats = {
  matchesPlayed: number;
  wins: number;
  losses: number;
  setWin: number;
  setLose: number;
  points: number;
};

const EMPTY_STATS: PlayerStats = { matchesPlayed: 0, wins: 0, losses: 0, setWin: 0, setLose: 0, points: 0 };

function buildPlayerStats(players: Player[], matches: Match[]): Map<string, PlayerStats> {
  const statsByName = new Map<string, PlayerStats>();
  players.forEach((p) => statsByName.set(p.name, { ...EMPTY_STATS }));

  matches.forEach((match) => {
    const [s1, s2] = parseSetScore(match.setScore);
    const isP1Winner = match.winner === match.player1;
    const winnerScore = isP1Winner ? s1 : s2;
    const loserScore = isP1Winner ? s2 : s1;
    const loserName = isP1Winner ? match.player2 : match.player1;
    const winnerStats = statsByName.get(match.winner);
    const loserStats = statsByName.get(loserName);

    if (winnerStats) {
      winnerStats.matchesPlayed += 1;
      winnerStats.wins += 1;
      winnerStats.setWin += winnerScore;
      winnerStats.setLose += loserScore;
      winnerStats.points += 6 - loserScore;
    }
    if (loserStats) {
      loserStats.matchesPlayed += 1;
      loserStats.losses += 1;
      loserStats.setWin += loserScore;
      loserStats.setLose += winnerScore;
      loserStats.points += loserScore + 1;
    }
  });

  return statsByName;
}

function PlayerChip({ name, player, category }: { name: string; player?: Player; category: "atp" | "wta" }) {
  const initial = name.trim().charAt(0).toUpperCase();
  const isAtp = category === "atp";
  const accent = isAtp ? "bg-sky-500/30 text-sky-300" : "bg-pink-500/30 text-pink-300";
  const wrapper = isAtp ? "bg-sky-500/10 border-sky-500/20" : "bg-pink-500/10 border-pink-500/20";

  return (
    <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border ${wrapper}`}>
      {player?.imgUrl ? (
        <img src={player.imgUrl} alt={name} className="w-8 h-8 rounded-full object-cover shrink-0" />
      ) : (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${accent}`}>
          {initial}
        </div>
      )}
      <span className="text-sm font-semibold text-slate-200 truncate capitalize">{name}</span>
    </div>
  );
}

function ChampionCard({
  champion, player, rank, category,
}: {
  champion?: Champion; player?: Player; rank: 1 | 2; category: "atp" | "wta";
}) {
  const isGold = rank === 1;
  const fallbackImg = category === "atp" ? "/pria.jpg" : "/wanita.jpg";

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${isGold ? "flex-[1.15]" : "flex-1"}`}
      style={
        isGold
          ? {
              background: "linear-gradient(160deg, rgba(250,204,21,0.18), rgba(120,53,15,0.08))",
              borderColor: "rgba(250,204,21,0.35)",
            }
          : {
              background: "linear-gradient(160deg, rgba(203,213,225,0.16), rgba(71,85,105,0.08))",
              borderColor: "rgba(203,213,225,0.3)",
            }
      }
    >
      <div className={`flex flex-col items-center text-center ${isGold ? "px-4 pt-5 pb-4" : "px-3 pt-4 pb-3"}`}>
        <span className={isGold ? "text-4xl mb-2" : "text-3xl mb-1.5"}>{isGold ? "🥇" : "🥈"}</span>
        <div
          className={`rounded-full overflow-hidden border-2 ${isGold ? "w-20 h-20 border-yellow-400/50" : "w-16 h-16 border-slate-300/50"}`}
        >
          <img
            src={player?.imgUrl || fallbackImg}
            alt={champion?.name || "Juara"}
            className="w-full h-full object-cover"
          />
        </div>
        <p className={`font-black mt-2 capitalize ${isGold ? "text-base text-yellow-200" : "text-sm text-slate-200"}`}>
          {champion?.name || "Belum ditentukan"}
        </p>
        <p className={`text-[10px] font-semibold uppercase tracking-wide ${isGold ? "text-yellow-400/80" : "text-slate-400"}`}>
          {player?.nickname || "Belum ditentukan"}
        </p>
      </div>
    </div>
  );
}

export default function TourDetailPage() {
  const params = useParams<{ slug: string }>();
  const [tournament, setTournament] = useState<Tournament | null | undefined>(undefined);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState<TeamKey>("Pria");

  const loadData = () => {
    getTekoData()
      .then(({ tournaments, players }) => {
        const found = tournaments.find((t) => slugifyTournamentTitle(t.title) === params.slug);
        setTournament(found ?? null);
        setPlayers(players);
      })
      .catch(() => setTournament(null));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  const category = activeTab === "Pria" ? "atp" : "wta";

  const playerByName = useMemo(
    () => new Map(players.map((p) => [p.name.toLowerCase().trim(), p])),
    [players]
  );

  const { filteredMatches, participantNames, champ1, champ2 } = useMemo(() => {
    if (!tournament) return { filteredMatches: [], participantNames: [] as string[], champ1: undefined, champ2: undefined };

    const genderNames = new Set(
      players.filter((p) => p.gender === activeTab).map((p) => p.name)
    );
    const matches = tournament.matches.filter(
      (m) => genderNames.has(m.player1) || genderNames.has(m.player2)
    );
    const participants = Array.from(new Set(matches.flatMap((m) => [m.player1, m.player2])))
      .filter((name) => genderNames.has(name))
      .sort((a, b) => a.localeCompare(b));
    const champions = (tournament.champion ?? []).filter((c) => c.category === category);

    return {
      filteredMatches: matches,
      participantNames: participants,
      champ1: champions.find((c) => c.position === 1),
      champ2: champions.find((c) => c.position === 2),
    };
  }, [tournament, players, activeTab, category]);

  const filteredParticipants = participantNames.length;

  const rankedPlayers = useMemo(() => {
    const genderPlayers = players.filter((p) => p.gender === activeTab);
    const statsByName = buildPlayerStats(genderPlayers, filteredMatches);
    return genderPlayers
      .map((p) => ({ ...p, ...(statsByName.get(p.name) ?? EMPTY_STATS) }))
      .sort((a, b) => b.points - a.points || b.wins - a.wins);
  }, [players, filteredMatches, activeTab]);

  if (tournament === undefined) {
    return <div className="py-24 text-center text-sm text-slate-500">Memuat...</div>;
  }

  if (tournament === null) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-2 py-24 px-4">
        <h1 className="text-xl font-black text-white">Tour tidak ditemukan</h1>
        <p className="text-sm text-slate-400">Tour ini mungkin sudah dihapus atau belum tersedia.</p>
      </div>
    );
  }

  const participantCount = new Set(
    tournament.matches.flatMap((m) => [m.player1, m.player2])
  ).size;

  return (
    <div className="px-4 py-4 md:py-8 container mx-auto max-w-6xl">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-9 md:h-11 rounded-full bg-linear-to-b from-emerald-400 to-purple-500 shrink-0" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-purple-400/80 mb-0.5">🏆 Tour</p>
          <h1 className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-purple-400 leading-tight">
            {tournament.title}
          </h1>
        </div>
      </div>

      {/* ── Overview stats ── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-2xl md:text-3xl font-black text-emerald-300">{participantCount}</p>
          <p className="text-xs font-semibold text-emerald-400/80">🙋 Pemain Ikut Serta</p>
        </div>
        <div className="rounded-2xl p-4 bg-purple-500/10 border border-purple-500/20">
          <p className="text-2xl md:text-3xl font-black text-purple-300">{tournament.matches.length}</p>
          <p className="text-xs font-semibold text-purple-400/80">🎾 Total Pertandingan</p>
        </div>
      </div>

      {/* ── Tab switch ── */}
      <div className="mb-5">
        <HomeTab activeTab={activeTab} onSelect={setActiveTab} />
      </div>

      {/* ── Category stats ── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className={`rounded-xl p-4 border ${
          category === "atp" ? "bg-sky-500/10 border-sky-500/20" : "bg-pink-500/10 border-pink-500/20"
        }`}>
          <p className={`text-2xl font-black ${category === "atp" ? "text-sky-300" : "text-pink-300"}`}>
            {filteredParticipants}
          </p>
          <p className={`text-xs font-semibold ${category === "atp" ? "text-sky-400/80" : "text-pink-400/80"}`}>
            Pemain {category.toUpperCase()}
          </p>
        </div>
        <div className={`rounded-xl p-4 border ${
          category === "atp" ? "bg-sky-500/10 border-sky-500/20" : "bg-pink-500/10 border-pink-500/20"
        }`}>
          <p className={`text-2xl font-black ${category === "atp" ? "text-sky-300" : "text-pink-300"}`}>
            {filteredMatches.length}
          </p>
          <p className={`text-xs font-semibold ${category === "atp" ? "text-sky-400/80" : "text-pink-400/80"}`}>
            Pertandingan {category.toUpperCase()}
          </p>
        </div>
      </div>

      {/* ── Highlights (champions + participants) & Data tables ── */}
      <div className="md:grid md:grid-cols-5 md:gap-6 flex flex-col gap-5">
        <div className="md:col-span-2 flex flex-col gap-5">
          {/* Wall of Champions */}
          <div className="rounded-2xl border border-purple-500/20 bg-linear-to-b from-purple-500/8 to-transparent p-4 md:p-5">
            <h2 className="text-sm font-black text-purple-300 mb-3 flex items-center gap-1.5">
              👑 Wall of Champions <span className="text-slate-500 font-bold">· {category.toUpperCase()}</span>
            </h2>
            {champ1 || champ2 ? (
              <div className="flex gap-3 items-end">
                <ChampionCard
                  champion={champ1}
                  player={champ1 ? playerByName.get(champ1.name.toLowerCase().trim()) : undefined}
                  rank={1}
                  category={category}
                />
                <ChampionCard
                  champion={champ2}
                  player={champ2 ? playerByName.get(champ2.name.toLowerCase().trim()) : undefined}
                  rank={2}
                  category={category}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Juara {category.toUpperCase()} belum ditentukan.</p>
            )}
          </div>

          {/* Peserta */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 md:p-5">
            <h2 className="text-sm font-black text-emerald-300 mb-3 flex items-center gap-1.5">
              🎾 Peserta <span className="text-slate-500 font-bold">· {category.toUpperCase()} ({participantNames.length})</span>
            </h2>
            {participantNames.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {participantNames.map((name) => (
                  <PlayerChip
                    key={name}
                    name={name}
                    player={playerByName.get(name.toLowerCase().trim())}
                    category={category}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Belum ada peserta {category.toUpperCase()}.</p>
            )}
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col gap-5">
          <HomeTable
            players={rankedPlayers}
            matches={filteredMatches}
            activeTab={activeTab}
            onPlayerDeleted={loadData}
          />
        </div>

        <div className="md:col-span-3 flex flex-col gap-5">
          <MatchTable
            matches={filteredMatches}
            players={players}
            activeTab={activeTab}
            onMatchDeleted={loadData}
            onMatchEdited={loadData}
          />

        </div>
      </div>
    </div>
  );
}
