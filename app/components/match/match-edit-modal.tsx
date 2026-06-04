"use client";

import { useState, useRef, useEffect } from "react";
import type { MatchForModal } from "@components/match/match-detail-modal";

type Player = {
  id: number;
  name: string;
  gender: "Pria" | "Wanita";
};

type MatchEditModalProps = {
  match: MatchForModal;
  players: Player[];
  onClose: () => void;
  onSaved: () => void;
};

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

function AutocompleteInput({
  players, value, onChange, placeholder, exclude,
}: {
  players: Player[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  exclude?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = players
    .filter((p) => p.name !== exclude)
    .filter((p) => p.name.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleSelect = (name: string) => { onChange(name); setOpen(false); setHighlight(-1); };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) { if (e.key === "ArrowDown") setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (highlight >= 0) handleSelect(filtered[highlight].name); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <input value={value} placeholder={placeholder}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlight(-1); }}
        onFocus={() => setOpen(true)} onKeyDown={onKeyDown}
        className="w-full rounded-xl capitalize border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20" />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-white/10 bg-slate-900 shadow-lg">
          {filtered.map((p, i) => (
            <div key={p.id} onMouseDown={() => handleSelect(p.name)}
              className={`px-4 py-2 cursor-pointer capitalize ${i === highlight ? "bg-emerald-500/20" : "hover:bg-white/5"}`}>
              {p.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MatchEditModal({ match, players, onClose, onSaved }: MatchEditModalProps) {
  const [player1, setPlayer1] = useState(match.player1);
  const [player2, setPlayer2] = useState(match.player2);
  const [score, setScore] = useState(match.setScore);
  const [winner, setWinner] = useState(match.winner);
  const [pointScoresA, setPointScoresA] = useState<string[]>(match.pointScoresA ?? []);
  const [pointScoresB, setPointScoresB] = useState<string[]>(match.pointScoresB ?? []);
  const [photoPreview, setPhotoPreview] = useState<string | null>(match.photoUrl ?? null);
  const [newPhotoBase64, setNewPhotoBase64] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalPoints = (() => {
    const [a, b] = score.split("-").map((v) => Number(v.trim()));
    return Number.isFinite(a) && Number.isFinite(b) && a >= 0 && b >= 0 ? a + b : 0;
  })();

  useEffect(() => {
    if (totalPoints === 0) { setPointScoresA([]); setPointScoresB([]); return; }
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
    if (!file) return;
    if (!file.type.startsWith("image/")) { setPhotoError("File harus berupa gambar."); return; }
    if (file.size > 5 * 1024 * 1024) { setPhotoError("Ukuran gambar maksimal 5MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      setNewPhotoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1 || !player2 || !score || !winner) return alert("Semua field pertandingan harus diisi");
    if (player1 === player2) return alert("Pemain 1 dan Pemain 2 tidak boleh sama");
    if (!photoPreview) return alert("Foto pertandingan wajib ada");
    if (photoError) return alert(photoError);

    setLoading(true);
    try {
      const response = await fetch("/api/matches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: match.id,
          matchData: { player1, player2, winner, setScore: score, pointScoresA, pointScoresB },
          newPhotoBase64: newPhotoBase64 ?? undefined,
          oldPhotoUrl: newPhotoBase64 ? (match.photoUrl ?? undefined) : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        onSaved();
      } else {
        alert("Gagal menyimpan: " + data.message);
      }
    } catch {
      alert("Terjadi kesalahan koneksi saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md max-h-[90vh] bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-auto">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

        <h2 className="text-2xl font-black text-slate-100 mb-1 relative">Edit Pertandingan</h2>
        <p className="text-xs text-slate-500 mb-5">ID: {match.id}</p>

        <form onSubmit={handleSubmit} className="space-y-5 relative">

          <div className="space-y-2 capitalize">
            <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Pemain 1</label>
            <AutocompleteInput players={players} value={player1}
              onChange={(v) => setPlayer1(v)} placeholder="Pemain 1" exclude={player2} />
          </div>

          <div className="space-y-2 capitalize">
            <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Pemain 2</label>
            <AutocompleteInput players={players} value={player2}
              onChange={(v) => setPlayer2(v)} placeholder="Pemain 2" exclude={player1} />
          </div>

          {player1 && player2 && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Skor (Misal: 4-2)</label>
                <input type="text" placeholder="0-0" value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
                  required />
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
                        <td className="px-4 py-3 align-middle font-bold capitalize text-slate-200">{player1}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3 overflow-x-auto pb-1 pt-1">
                            {pointScoresA.map((value, index) => (
                              <PointStepper key={`a-${index}`} value={value}
                                onChange={(v) => { const n = [...pointScoresA]; n[index] = v; setPointScoresA(n); }} />
                            ))}
                          </div>
                        </td>
                      </tr>
                      <tr className="border-t border-white/10">
                        <td className="px-4 py-3 align-middle font-bold capitalize text-slate-200">{player2}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3 overflow-x-auto pb-1 pt-1">
                            {pointScoresB.map((value, index) => (
                              <PointStepper key={`b-${index}`} value={value}
                                onChange={(v) => { const n = [...pointScoresB]; n[index] = v; setPointScoresB(n); }} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Pemenang</label>
                {winner ? (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
                    <span className="text-emerald-400 font-black capitalize">{winner}</span>
                    <span className="text-xs text-slate-500">— otomatis dari skor</span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-500 text-sm">
                    Masukkan skor yang valid untuk menentukan pemenang
                  </div>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest text-slate-500 uppercase">
              Ganti Foto <span className="text-slate-600 normal-case tracking-normal font-normal">— kosongkan jika tidak ingin mengganti</span>
            </label>
            <input type="file" accept="image/*" onChange={handlePhotoChange}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-slate-100 outline-none file:cursor-pointer file:border-0 file:bg-emerald-500/10 file:px-3 file:py-2 file:text-slate-100 file:rounded-xl" />
            {photoError && <p className="text-xs text-rose-400">{photoError}</p>}
            {photoPreview && (
              <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900 p-3">
                <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">
                  {newPhotoBase64 ? "Foto Baru" : "Foto Saat Ini"}
                </p>
                <img src={photoPreview} alt="Preview pertandingan" className="h-40 w-full rounded-2xl object-cover" />
                {newPhotoBase64 && <p className="text-xs text-emerald-400 mt-2">Foto lama akan dihapus dan diganti.</p>}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 rounded-xl border border-white/10 px-4 py-3 font-bold text-slate-400 hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-xl bg-blue-500 px-4 py-3 font-bold text-white hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Menyimpan...</>
              ) : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
