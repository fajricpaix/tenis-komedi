"use client";

import { useEffect, useMemo, useState } from "react";
import { getTekoData, type Player, type Match } from "@utils/fetcher";
import { buildRankedPlayers } from "@components/players/ranking-utils";
import PointsInfo from "@components/players/points-info";
import RaceToChampions from "@components/players/race-to-champions";
import RankingMobileList from "@components/players/ranking-mobile-list";
import { WtaDesktopGrid } from "@components/players/ranking-desktop-grid";

export default function WtaRankingPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTekoData()
      .then(({ players, matches }) => {
        setPlayers(Array.isArray(players) ? players : []);
        setMatches(Array.isArray(matches) ? matches : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const rankedPlayers = useMemo(() => buildRankedPlayers(players, matches, "Wanita"), [players, matches]);

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">

      {/* Page Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-1 h-9 rounded-full bg-linear-to-b from-pink-400 to-fuchsia-600" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-pink-400 tracking-wide">WTA Ranking</h1>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{rankedPlayers.length} pemain terdaftar</p>
            </div>
          </div>
        </div>
      </div>

      <PointsInfo accent="pink" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-pink-400/30 border-t-pink-400 animate-spin" />
          <p className="text-slate-500 text-sm">Memuat data pemain...</p>
        </div>
      ) : rankedPlayers.length === 0 ? (
        <div className="text-center py-20 text-slate-500">Belum ada data pemain wanita 🏜️</div>
      ) : (
        <>
          <RaceToChampions players={rankedPlayers} accent="pink" />
          <RankingMobileList players={rankedPlayers} accent="pink" />
          <WtaDesktopGrid players={rankedPlayers} />
        </>
      )}
    </div>
  );
}
