"use client";

import HomeTab, { TeamKey } from "@components/home/tab";
import MatchModal from "@components/match/match-modal";
import MatchTable from "@components/match/match-table";
import { useEffect, useMemo, useState } from "react";
import { getTekoData, type Player, type Match } from "@utils/fetcher";

type Toast = {
  message: string;
  type: "success" | "error";
};

export default function HomeContent() {
  const [activeTab, setActiveTab] = useState<TeamKey>("Pria");
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    getTekoData()
      .then(({ players, matches }) => {
        setPlayers(Array.isArray(players) ? players : []);
        setMatches(Array.isArray(matches) ? matches : []);
      })
      .catch((error) => {
        console.error("Gagal memuat data pemain:", error);
      });
  }, []);

  const currentMatches = useMemo(
    () => {
      const safePlayers = Array.isArray(players) ? players : [];
      const safeMatches = Array.isArray(matches) ? matches : [];

      // Ambil nama pemain yang gender-nya sesuai tab aktif
      const playerNamesInTab = new Set(
        safePlayers.filter((p) => p.gender === activeTab).map((p) => p.name)
      );

      return [...safeMatches]
        .filter(
          (m) => playerNamesInTab.has(m.player1) || playerNamesInTab.has(m.player2)
        )
        .reverse()
        .slice(0, 20);
    }, [matches, players, activeTab]
  );

  const handleSaveMatch = async (newMatch: Omit<Match, "id">) => {
  // ✅ ID dihitung di sini, bukan di modal
  const id = matches.length > 0 ? Math.max(...matches.map((m) => m.id)) + 1 : 1;
  const matchWithId: Match = { id, ...newMatch };

  try {
    const response = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(matchWithId),
    });

    if (!response.ok) throw new Error("Gagal menyimpan");

    // ✅ Update state lokal setelah berhasil disimpan
    setMatches((prev) => [...prev, matchWithId]);
    setIsModalOpen(false);
    showToast("Pertandingan berhasil ditambahkan.", "success");
  } catch (error) {
    console.error("Gagal menyimpan pertandingan:", error);
    showToast("Gagal menyimpan pertandingan. Coba lagi.", "error");
  }
};

  const handleMatchDeleted = async () => {
    // Refetch data setelah pertandingan dihapus
    try {
      const { players, matches } = await getTekoData();
      setPlayers(Array.isArray(players) ? players : []);
      setMatches(Array.isArray(matches) ? matches : []);
      showToast("Pertandingan berhasil dihapus.", "success");
    } catch (error) {
      console.error("Gagal memuat ulang data:", error);
      showToast("Gagal memuat ulang data.", "error");
    }
  };

  return (
    <section className="px-6 py-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <HomeTab activeTab={activeTab} onSelect={setActiveTab} />
        {/* <button 
          onClick={() => setIsModalOpen(true)}
          className="font-black px-2 md:px-7 py-2 md:py-2.5 cursor-pointer rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white"
        >
          <span className="text-xl">+</span> Pertandingan
        </button> */}
      </div>
      {/* Tabs */}


      {toast && (
        <div
          className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-6 py-4 text-sm font-semibold shadow-2xl transition-all duration-300 ${toast.type === "success"
            ? "bg-emerald-500 text-slate-950 shadow-emerald-500/30"
            : "bg-red-500 text-white shadow-red-500/30"
          }`}
        >
          <span className="mr-2">{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.message}
        </div>
      )}

      {/* Match Table */}
      <MatchTable 
        matches={currentMatches} 
        activeTab={activeTab} 
        fullWidth
        onMatchDeleted={handleMatchDeleted}
      />

      {isModalOpen && (
        <MatchModal 
          players={players}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveMatch}
        />
      )}

    </section>
  );
}