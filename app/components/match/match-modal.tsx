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

const POINT_STEPS = ["0", "15", "30", "40", "adv"];

function PointStepper({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const idx = POINT_STEPS.indexOf(value);
  const dec = () => onChange(POINT_STEPS[(idx - 1 + POINT_STEPS.length) % POINT_STEPS.length]);
  const inc = () => onChange(POINT_STEPS[(idx + 1) % POINT_STEPS.length]);
  return (
    <div className="flex flex-col items-center gap-1">
      <button type="button" onClick={inc} className="w-7 h-7 rounded-md bg-emerald-500 hover:bg-emerald-500/30 text-slate-300 text-2xl font-black leading-none cursor-pointer transition-colors">+</button>
      <span className="w-9 py-0.5 text-center font-black text-slate-100 tabular-nums uppercase">{value}</span>
      <button type="button" onClick={dec} className="w-7 h-7 rounded-md bg-red-500 hover:bg-red-500/30 text-slate-300 text-2xl font-black leading-none cursor-pointer transition-colors">-</button>
    </div>
  );
}

export default function MatchModal({ players, onClose, onSave }: MatchModalProps) {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
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

  useEffect(() => {
    const [a, b] = score.split("-").map((v) => Number(v.trim()));
    if (Number.isFinite(a) && Number.isFinite(b) && a !== b && player1 && player2) {
      setWinner(a > b ? player1 : player2);
    } else {
      setWinner("");
    }
  }, [score, player1, player2]);

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

    if (!player1 || !player2 || !score || !winner) return alert("Semua field pertandingan harus diisi");
    if (player1 === player2) return alert("Pemain 1 dan Pemain 2 tidak boleh sama");
    if (!photoPreview) return alert("Upload foto pertandingan wajib diisi");
    if (photoError) return alert(photoError);

    const payload: Omit<Match, "id"> = {
      player1,
      player2,
      winner,
      setScore: score,
      pointScoresA,
      pointScoresB,
      photoUrl: photoPreview,
    };

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
          {/* Pemain 1 */}
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

          {/* Pemain 2 */}
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

          {player1 && player2 && (
            <>
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
                        <th className="px-4 py-3 font-semibold">Pemain</th>
                        <th className="px-4 py-3 font-semibold">Skor Kecil</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-100">
                      <tr className="border-t border-white/10">
                        <td className="px-4 py-3 align-middle font-bold capitalize text-slate-200">
                          {player1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3 overflow-x-auto pb-1 pt-1">
                            {pointScoresA.map((value, index) => (
                              <PointStepper
                                key={`a-${index}`}
                                value={value}
                                onChange={(v) => {
                                  const next = [...pointScoresA];
                                  next[index] = v;
                                  setPointScoresA(next);
                                }}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                      <tr className="border-t border-white/10">
                        <td className="px-4 py-3 align-middle font-bold capitalize text-slate-200">
                          {player2}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3 overflow-x-auto pb-1 pt-1">
                            {pointScoresB.map((value, index) => (
                              <PointStepper
                                key={`b-${index}`}
                                value={value}
                                onChange={(v) => {
                                  const next = [...pointScoresB];
                                  next[index] = v;
                                  setPointScoresB(next);
                                }}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pemenang — otomatis dari skor */}
              <div className="space-y-2">
                <label className="text-xs font-black tracking-widest text-slate-500 uppercase">
                  Pemenang
                </label>
                {winner ? (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
                    <span className="text-emerald-400 font-black capitalize">{winner}</span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-500 text-sm">
                    Masukkan skor yang valid untuk menentukan pemenang
                  </div>
                )}
              </div>
            </>
          )}

          {totalPoints > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-black tracking-widest text-slate-500 uppercase">
                Upload Foto Pertandingan{" "}
                <span className="text-rose-400">*</span>
              </label>
              <p className="text-xs text-slate-500">
                Wajib diisi sebagai bukti pertandingan. Maks. 5MB.
              </p>
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
          )}

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
