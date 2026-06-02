"use client";

import { useState, useRef, useEffect } from "react";

type Player = {
  id: number;
  name: string;
  gender: "Pria" | "Wanita";
};

type Match = {
  id: number;
  player1: string;
  player2: string;
  winner: string;
  setScore: string;
};

type MatchModalProps = {
  players: Player[];
  onClose: () => void;
  onSave: (match: Omit<Match, "id">) => Promise<void>;
  // ✅ hapus nextId — ID dibuat di server/parent
};

function AutocompleteInput({
  players,
  value,
  onChange,
  placeholder,
  exclude,
}: {
  players: Player[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  exclude?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const filtered = players
    .filter((p) => (exclude ? p.name !== exclude : true))
    .filter((p) => p.name.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function handleSelect(name: string) {
    onChange(name);
    setOpen(false);
    setHighlight(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && highlight < filtered.length) handleSelect(filtered[highlight].name);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlight(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full rounded-xl capitalize border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
      />

      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-white/10 bg-slate-900 shadow-lg">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              onMouseDown={() => handleSelect(p.name)}
              className={`px-4 py-2 cursor-pointer ${i === highlight ? "bg-emerald-500/20" : "hover:bg-white/5"}`}
            >
              {p.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MatchModal({ players, onClose, onSave }: MatchModalProps) {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [score, setScore] = useState("");
  const [winner, setWinner] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1 || !player2 || !score || !winner) return;

    if (player1 === player2) {
      // sederhana: beri tahu user dan batalkan
      alert("Pemain 1 dan Pemain 2 tidak boleh sama");
      return;
    }

    setLoading(true);
    try {
      await onSave({ player1, player2, winner, setScore: score });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

        <h2 className="text-2xl font-black text-slate-100 mb-6 relative">
          Catat Pertandingan
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          {/* Pemain 1 (autocomplete) */}
          <div className="space-y-2 capitalize">
            <label className="text-xs font-black tracking-widest text-slate-500 uppercase">
              Pemain 1
            </label>
            <AutocompleteInput
              players={players}
              value={player1}
              onChange={(v) => { setPlayer1(v); setWinner(""); }}
              placeholder="Pilih Pemain 1"
            />
          </div>

          {/* Pemain 2 (autocomplete) */}
          <div className="space-y-2 capitalize">
            <label className="text-xs font-black tracking-widest text-slate-500 uppercase">
              Pemain 2
            </label>
            <AutocompleteInput
              players={players}
              value={player2}
              onChange={(v) => { setPlayer2(v); setWinner(""); }}
              placeholder="Pilih Pemain 2"
              exclude={player1}
            />
          </div>

          {/* Skor */}
          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest text-slate-500 uppercase">
              Skor (Misal: 4-2)
            </label>
            <input
              type="text"
              placeholder="0-0"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
              required
            />
          </div>

          {/* Pemenang */}
          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest text-slate-500 uppercase">
              Pemenang
            </label>
            <select
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
              className="w-full rounded-xl capitalize border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
              required
            >
              <option value="">Pilih Pemenang</option>
              {player1 && <option key={player1} value={player1}>{player1}</option>}
              {player2 && <option key={player2} value={player2}>{player2}</option>}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-white/10 px-4 py-3 font-bold text-slate-400 hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}