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
  pointScoresA?: string[];
  pointScoresB?: string[];
  photoUrl?: string;
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
  exclude?: string | string[];
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const excludedSet = new Set<string>(Array.isArray(exclude) ? exclude.filter(Boolean) : (exclude ? [exclude] : []));

  const filtered = players
    .filter((p) => !excludedSet.has(p.name))
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
  const [matchType, setMatchType] = useState<"" | "single" | "doubleMen" | "doubleWomen" | "mixDouble">("");

  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  // doubles
  const [p1a, setP1a] = useState("");
  const [p1b, setP1b] = useState("");
  const [p2a, setP2a] = useState("");
  const [p2b, setP2b] = useState("");

  const [score, setScore] = useState("");
  const [pointScoresA, setPointScoresA] = useState<string[]>([]);
  const [pointScoresB, setPointScoresB] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [winner, setWinner] = useState("");
  const [loading, setLoading] = useState(false);

  const totalPoints = (() => {
    const [a, b] = score.split("-").map((value) => Number(value.trim()));
    return Number.isFinite(a) && Number.isFinite(b) && a >= 0 && b >= 0 ? a + b : 0;
  })();

  useEffect(() => {
    if (totalPoints === 0) {
      setPointScoresA([]);
      setPointScoresB([]);
      return;
    }

    setPointScoresA((prev) => Array.from({ length: totalPoints }, (_, i) => prev[i] ?? "0"));
    setPointScoresB((prev) => Array.from({ length: totalPoints }, (_, i) => prev[i] ?? "0"));
  }, [totalPoints]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError(null);
    if (!file) {
      setPhotoPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhotoError("File harus berupa gambar.");
      setPhotoPreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Ukuran gambar maksimal 5MB.");
      setPhotoPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!matchType) return alert("Pilih jenis pertandingan terlebih dahulu");
    if (!photoPreview) return alert("Upload foto pertandingan wajib diisi");
    if (photoError) return alert(photoError);

    let payload: Omit<Match, "id"> | null = null;

    if (matchType === "single") {
      if (!player1 || !player2 || !score || !winner) return alert("Semua field pertandingan harus diisi");
      if (player1 === player2) return alert("Pemain 1 dan Pemain 2 tidak boleh sama");
      payload = {
        player1,
        player2,
        winner,
        setScore: score,
        pointScoresA,
        pointScoresB,
        photoUrl: photoPreview,
      };
    } else {
      // doubles
      if (!p1a || !p1b || !p2a || !p2b || !score || !winner) return alert("Semua field pertandingan harus diisi");
      // check duplicates
      const all = [p1a, p1b, p2a, p2b];
      const set = new Set(all);
      if (set.size !== all.length) return alert("Nama pemain tidak boleh berulang dalam satu pertandingan");

      // For mixDouble, ensure each team has one Pria and one Wanita
      if (matchType === "mixDouble") {
        const findPlayer = (name: string) => players.find((p) => p.name === name);
        const p1aObj = findPlayer(p1a);
        const p1bObj = findPlayer(p1b);
        const p2aObj = findPlayer(p2a);
        const p2bObj = findPlayer(p2b);
        if (!p1aObj || !p1bObj || !p2aObj || !p2bObj) return alert("Semua pemain harus terdaftar");

        const teamAGenders = new Set([p1aObj.gender, p1bObj.gender]);
        const teamBGenders = new Set([p2aObj.gender, p2bObj.gender]);

        if (teamAGenders.size !== 2 || !teamAGenders.has("Pria") || !teamAGenders.has("Wanita")) {
          return alert("Tim A harus berisi 1 Pria dan 1 Wanita untuk Mix Double");
        }
        if (teamBGenders.size !== 2 || !teamBGenders.has("Pria") || !teamBGenders.has("Wanita")) {
          return alert("Tim B harus berisi 1 Pria dan 1 Wanita untuk Mix Double");
        }
      }

      const teamA = `${p1a} & ${p1b}`;
      const teamB = `${p2a} & ${p2b}`;
      payload = {
        player1: teamA,
        player2: teamB,
        winner,
        setScore: score,
        pointScoresA,
        pointScoresB,
        photoUrl: photoPreview,
      };
    }

    if (!payload) return;

    setLoading(true);
    try {
      await onSave(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md max-h-[90vh] bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-auto">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

        <h2 className="text-2xl font-black text-slate-100 mb-4 relative">
          Catat Pertandingan
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          {/* Match type selector */}
          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest mb-2 block text-slate-500 uppercase">
              Jenis Pertandingan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={matchType === "single"}
                onClick={() => {
                  setMatchType("single");
                  setPlayer1(""); setPlayer2(""); setP1a(""); setP1b(""); setP2a(""); setP2b(""); setWinner(""); setScore("");
                }}
                className={`cursor-pointer flex-1 rounded-xl px-3 py-2 font-bold transition ${matchType === "single" ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-200 border border-white/10"}`}
              >
                Single
              </button>

              <button
                type="button"
                aria-pressed={matchType === "doubleMen"}
                onClick={() => {
                  setMatchType("doubleMen");
                  setPlayer1(""); setPlayer2(""); setP1a(""); setP1b(""); setP2a(""); setP2b(""); setWinner(""); setScore("");
                }}
                className={`cursor-pointer flex-1 rounded-xl px-3 py-2 font-bold transition ${matchType === "doubleMen" ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-200 border border-white/10"}`}
              >
                Double (Men)
              </button>

              <button
                type="button"
                aria-pressed={matchType === "doubleWomen"}
                onClick={() => {
                  setMatchType("doubleWomen");
                  setPlayer1(""); setPlayer2(""); setP1a(""); setP1b(""); setP2a(""); setP2b(""); setWinner(""); setScore("");
                }}
                className={`cursor-pointer flex-1 rounded-xl px-3 py-2 font-bold transition ${matchType === "doubleWomen" ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-200 border border-white/10"}`}
              >
                Double (Women)
              </button>

              <button
                type="button"
                aria-pressed={matchType === "mixDouble"}
                onClick={() => {
                  setMatchType("mixDouble");
                  setPlayer1(""); setPlayer2(""); setP1a(""); setP1b(""); setP2a(""); setP2b(""); setWinner(""); setScore("");
                }}
                className={`cursor-pointer flex-1 rounded-xl px-3 py-2 font-bold transition ${matchType === "mixDouble" ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-200 border border-white/10"}`}
              >
                Mix Double
              </button>
            </div>
          </div>

          {/* Show rest of form after match type chosen */}
          {matchType && (
            <>
              {matchType === "single" ? (
                <>
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
                </>
              ) : (
                <>
                  {/* Doubles: Team A */}
                  <div className="space-y-2">
                    <label className="text-xs font-black tracking-widest text-slate-500 uppercase">
                      Tim A (Pemain 1)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <AutocompleteInput players={players.filter(p => matchType === 'doubleMen' ? p.gender === 'Pria' : matchType === 'doubleWomen' ? p.gender === 'Wanita' : true)} value={p1a} onChange={(v) => { setP1a(v); setWinner(""); }} placeholder="Pemain A1" />
                      <AutocompleteInput players={players.filter(p => matchType === 'doubleMen' ? p.gender === 'Pria' : matchType === 'doubleWomen' ? p.gender === 'Wanita' : true)} value={p1b} onChange={(v) => { setP1b(v); setWinner(""); }} placeholder="Pemain A2" exclude={p1a ? [p1a] : undefined} />
                    </div>
                  </div>

                  {/* Doubles: Team B */}
                  <div className="space-y-2">
                    <label className="text-xs font-black tracking-widest text-slate-500 uppercase">
                      Tim B (Pemain 2)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <AutocompleteInput players={players.filter(p => matchType === 'doubleMen' ? p.gender === 'Pria' : matchType === 'doubleWomen' ? p.gender === 'Wanita' : true)} value={p2a} onChange={(v) => { setP2a(v); setWinner(""); }} placeholder="Pemain B1" exclude={[...(p1a ? [p1a] : []), ...(p1b ? [p1b] : [])]} />
                      <AutocompleteInput players={players.filter(p => matchType === 'doubleMen' ? p.gender === 'Pria' : matchType === 'doubleWomen' ? p.gender === 'Wanita' : true)} value={p2b} onChange={(v) => { setP2b(v); setWinner(""); }} placeholder="Pemain B2" exclude={p2a ? [p2a, ...(p1a ? [p1a] : []), ...(p1b ? [p1b] : [])] : [...(p1a ? [p1a] : []), ...(p1b ? [p1b] : [])]} />
                    </div>
                  </div>
                </>
              )}

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

              {totalPoints > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70 p-2">
                  <table className="min-w-full table-auto text-left">
                    <thead>
                      <tr className="text-xs uppercase text-slate-400">
                        <th className="px-4 py-3 font-semibold text-slate-200">Nama Pemain</th>
                        <th className="px-4 py-3 font-semibold text-slate-200">Skor dari jumlah point yang di dapat</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-100">
                      <tr className="border-t border-white/10">
                        <td className="px-4 py-3 align-top font-bold capitalize text-slate-200">
                          {matchType === "single" ? (player1 || "Pemain A") : (p1a && p1b ? `${p1a} & ${p1b}` : "Tim A")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {pointScoresA.map((value, index) => (
                              <select
                                key={`a-${index}`}
                                value={value}
                                onChange={(e) => {
                                  const next = [...pointScoresA];
                                  next[index] = e.target.value;
                                  setPointScoresA(next);
                                }}
                                className="min-w-14 text-xs rounded-xl border border-white/10 bg-slate-900 px-2 py-2 text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
                              >
                                <option value="0">0</option>
                                <option value="15">15</option>
                                <option value="30">30</option>
                                <option value="40">40</option>
                                <option value="adv">adv</option>
                              </select>
                            ))}
                          </div>
                        </td>
                      </tr>
                      <tr className="border-t border-white/10">
                        <td className="px-4 py-3 align-top font-bold capitalize text-slate-200">
                          {matchType === "single" ? (player2 || "Pemain B") : (p2a && p2b ? `${p2a} & ${p2b}` : "Tim B")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {pointScoresB.map((value, index) => (
                              <select
                                key={`b-${index}`}
                                value={value}
                                onChange={(e) => {
                                  const next = [...pointScoresB];
                                  next[index] = e.target.value;
                                  setPointScoresB(next);
                                }}
                                className="min-w-14 text-xs rounded-xl border border-white/10 bg-slate-900 px-2 py-2 text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
                              >
                                <option value="0">0</option>
                                <option value="15">15</option>
                                <option value="30">30</option>
                                <option value="40">40</option>
                                <option value="adv">adv</option>
                              </select>
                            ))}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

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
                  {matchType === "single" ? (
                    <>
                      {player1 && <option key={player1} value={player1}>{player1}</option>}
                      {player2 && <option key={player2} value={player2}>{player2}</option>}
                    </>
                  ) : (
                    <>
                      {p1a && p1b && <option value={`${p1a} & ${p1b}`}>{`${p1a} & ${p1b}`}</option>}
                      {p2a && p2b && <option value={`${p2a} & ${p2b}`}>{`${p2a} & ${p2b}`}</option>}
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black tracking-widest text-slate-500 uppercase">
                  Upload Foto Pertandingan
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-slate-100 outline-none file:cursor-pointer file:border-0 file:bg-emerald-500/10 file:px-3 file:py-2 file:text-slate-100 file:rounded-xl"
                />
                {photoError && (
                  <p className="text-xs text-rose-400">{photoError}</p>
                )}
                {photoPreview && (
                  <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900 p-3">
                    <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Preview Foto</p>
                    <img src={photoPreview} alt="Preview pertandingan" className="h-40 w-full rounded-2xl object-cover" />
                  </div>
                )}
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
            </>
          )}
        </form>
      </div>
    </div>
  );
}