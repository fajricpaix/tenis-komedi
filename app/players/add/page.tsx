"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type NewPlayerForm = {
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
  skills: {
    forehand: number;
    backhand: number;
    service: number;
    volley: number;
    slice: number;
    loop: number;
  };
  photoUrl?: string;
  tournament: {
    willing: boolean;
    categories: ("single" | "double" | "mixDouble")[];
  };
};

const initialForm: NewPlayerForm = {
  name: "",
  nickname: "",
  birthPlace: "",
  birthDate: "",
  gender: "Pria",
  houseBlock: "",
  houseNumber: "",
  startMonth: "",
  startYear: "",
  reason: "",
  skills: {
    forehand: 1,
    backhand: 1,
    service: 1,
    volley: 1,
    slice: 1,
    loop: 1,
  },
  photoUrl: undefined,
  tournament: {
    willing: false,
    categories: [],
  },
};

type Toast = {
  message: string;
  type: "success" | "error";
};

export default function AddPlayerPage() {
  const router = useRouter();
  const [form, setForm] = useState<NewPlayerForm>(initialForm);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    if (type === "error") {
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleChange = (field: keyof NewPlayerForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillChange = (field: keyof NewPlayerForm["skills"], value: number) => {
    setForm((prev) => ({
      ...prev,
      skills: { ...prev.skills, [field]: value },
    }));
  };

  const handleTournamentWilling = (willing: boolean) => {
    setForm((prev) => ({
      ...prev,
      tournament: {
        willing,
        categories: willing ? prev.tournament.categories : [],
      },
    }));
  };

  const handleTournamentCategory = (category: "single" | "double" | "mixDouble") => {
    setForm((prev) => {
      const cats = prev.tournament.categories;
      const updated = cats.includes(category)
        ? cats.filter((c) => c !== category)
        : [...cats, category];
      return { ...prev, tournament: { ...prev.tournament, categories: updated } };
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("File harus berupa gambar.");
      setPhotoPreview(null);
      setForm((prev) => ({ ...prev, photoUrl: undefined }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Ukuran gambar maksimal 2MB.");
      setPhotoPreview(null);
      setForm((prev) => ({ ...prev, photoUrl: undefined }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
      setForm((prev) => ({ ...prev, photoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.tournament.willing && form.tournament.categories.length === 0) {
      showToast("Isi minimal satu kategori jika ingin ikut turnamen.", "error");
      return;
    }

    setIsPreviewOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (result.success) {
        setIsPreviewOpen(false);
        setForm(initialForm);
        setPhotoPreview(null);
        setPhotoError(null);
        if (photoInputRef.current) photoInputRef.current.value = "";

        showToast("Horee! Pemain baru berhasil ditambahkan.", "success");
        setTimeout(() => router.push("/"), 1500);
      } else {
        setIsPreviewOpen(false);
        showToast("Gagal menyimpan: " + result.message, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      setIsPreviewOpen(false);
      showToast("Terjadi kesalahan koneksi saat menyimpan data.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    single: "🎾 Single",
    double: "👥 Double",
    mixDouble: "💑 Mix Double",
  };

  return (
    <main className="px-6 py-10 mx-auto max-w-6xl">

      {/* Sticky Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-100 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-sm font-semibold transition-all duration-300
            ${toast.type === "success"
              ? "bg-emerald-500 text-slate-950 shadow-emerald-500/30"
              : "bg-red-500 text-white shadow-red-500/30"
            }`}
        >
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.message}
          {toast.type === "error" && (
            <button
              onClick={() => setToast(null)}
              className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className="max-w-2xl mx-auto mb-10">
        <Link
          href="/"
          className="inline-flex items-center mb-3 font-semibold text-white transition hover:text-emerald-400"
        >
          ← Kembali
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">Tambah Pemain</h1>
          <p className="mt-3 text-slate-400 max-w-2xl">
            Lengkapi informasi pemain baru untuk ditambahkan ke database.
          </p>
        </div>
      </div>

      <section className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/70 border border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl shadow-slate-950/30 mb-10">

          {/* Nama */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300" htmlFor="nama">
              Nama Pemain
            </label>
            <input
              id="nama"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          {/* Panggilan */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300" htmlFor="panggilanGokil">
              Panggilan/Gokil (selain nama)
            </label>
            <input
              id="panggilanGokil"
              type="text"
              value={form.nickname}
              onChange={(e) => handleChange("nickname", e.target.value)}
              placeholder="Contoh: Si Unyil, Kojak, dll"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          {/* Tempat & Tanggal Lahir */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300" htmlFor="tempatLahir">
                Tempat Lahir
              </label>
              <input
                id="tempatLahir"
                type="text"
                value={form.birthPlace}
                onChange={(e) => handleChange("birthPlace", e.target.value)}
                placeholder="Contoh: Jakarta"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300" htmlFor="tanggalLahir">
                Tanggal Lahir
              </label>
              <input
                id="tanggalLahir"
                type="date"
                value={form.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Gender</label>
              <div className="flex gap-4">
                {(["Pria", "Wanita"] as const).map((value) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 transition hover:border-emerald-400"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={value}
                      checked={form.gender === value}
                      onChange={() => handleChange("gender", value)}
                      className="h-4 w-4 text-emerald-500 accent-emerald-400"
                    />
                    {value}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Blok & Nomor Rumah */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300" htmlFor="blokRumah">
                Blok Rumah
              </label>
              <input
                id="blokRumah"
                type="text"
                value={form.houseBlock}
                onChange={(e) => handleChange("houseBlock", e.target.value)}
                placeholder="Contoh: A1"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300" htmlFor="nomorRumah">
                Nomor Rumah
              </label>
              <input
                id="nomorRumah"
                type="text"
                value={form.houseNumber}
                onChange={(e) => handleChange("houseNumber", e.target.value)}
                placeholder="Contoh: 12"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          {/* Main Tenis Sejak */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Main Tenis Sejak</label>
            <div className="flex gap-4">
              <select
                value={form.startMonth}
                onChange={(e) => handleChange("startMonth", e.target.value)}
                required
                className="w-2/3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Bulan</option>
                {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <input
                type="number"
                value={form.startYear}
                onChange={(e) => handleChange("startYear", e.target.value)}
                placeholder="2022"
                min={1900}
                max={new Date().getFullYear()}
                required
                className="w-1/3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 no-spin"
              />
            </div>
          </div>

          {/* Alasan */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300" htmlFor="kenapa">
              Kenapa Main Tenis?
            </label>
            <textarea
              id="kenapa"
              value={form.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              placeholder="Jelaskan motivasi atau alasan Anda bermain tenis..."
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 resize-none"
              required
            />
          </div>

          {/* Upload Foto */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300" htmlFor="photo">
              Upload Foto (1:1, max 2MB)
            </label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              ref={photoInputRef}
              onChange={handlePhotoChange}
              className="block w-full text-sm text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            {photoError && <p className="text-red-500 text-xs mt-1">{photoError}</p>}
            {photoPreview && (
              <div className="mt-2">
                <img
                  src={photoPreview}
                  alt="Preview Foto"
                  className="rounded-xl object-cover border border-white/10"
                  style={{ width: 120, height: 120, aspectRatio: "1/1" }}
                />
              </div>
            )}
          </div>

          {/* Skill */}
          <div className="space-y-4 mt-8">
            <label className="text-sm font-semibold text-slate-300 block mb-2">
              Skill (1-10, menurut rasa sendiri)
            </label>
            {[
              { key: "forehand", label: "Forehand" },
              { key: "backhand", label: "Backhand" },
              { key: "service", label: "Service" },
              { key: "volley", label: "Volley" },
              { key: "slice", label: "Slice" },
              { key: "loop", label: "Loop" },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-4">
                <label htmlFor={item.key} className="w-24 text-slate-200">
                  {item.label}
                </label>
                <input
                  id={item.key}
                  type="range"
                  min={1}
                  max={10}
                  value={form.skills[item.key as keyof NewPlayerForm["skills"]]}
                  onChange={(e) =>
                    handleSkillChange(item.key as keyof NewPlayerForm["skills"], Number(e.target.value))
                  }
                  className="flex-1 accent-emerald-500 h-2 rounded-lg appearance-none cursor-pointer bg-slate-700"
                />
                <span className="w-8 text-center text-slate-100 font-bold">
                  {form.skills[item.key as keyof NewPlayerForm["skills"]]}
                </span>
              </div>
            ))}
          </div>

          {/* Turnamen */}
          <div className="space-y-4 mt-8 pt-6 border-t border-white/10">
            <div>
              <label className="text-sm font-semibold text-slate-300 block">
                Turnamen Internal Tenis Komedi
              </label>
              <p className="text-xs text-slate-400 mt-1">
                Apakah kamu bersedia ikut turnamen internal Tenis Komedi?
              </p>
            </div>

            <div className="flex gap-4">
              {[
                { label: "Ya, siap ikut! 🏆", value: true },
                { label: "Tidak, nonton aja 😅", value: false },
              ].map(({ label, value }) => (
                <label
                  key={String(value)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold cursor-pointer transition
                    ${form.tournament?.willing === value && value === true
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-400"
                      : form.tournament?.willing === value && value === false
                      ? "border-red-400/60 bg-red-500/10 text-red-400"
                      : "border-white/10 bg-slate-950/80 text-slate-400 hover:border-white/30"
                    }`}
                >
                  <input
                    type="radio"
                    name="tournament_willing"
                    value={String(value)}
                    checked={form.tournament?.willing === value}
                    onChange={() => handleTournamentWilling(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>

            {form.tournament?.willing && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Pilih kategori yang diminati (boleh lebih dari satu):
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { key: "single" as const, label: "🎾 Single", desc: "1 vs 1" },
                    { key: "double" as const, label: "👥 Double", desc: "2 vs 2, pasangan sesama gender" },
                    { key: "mixDouble" as const, label: "💑 Mix Double", desc: "2 vs 2, pasangan campur" },
                  ].map(({ key, label, desc }) => {
                    const checked = form.tournament?.categories?.includes(key) ?? false;
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-4 rounded-2xl border px-4 py-3 cursor-pointer transition
                          ${checked
                            ? "border-emerald-400 bg-emerald-500/10"
                            : "border-white/10 bg-slate-950/80 hover:border-white/30"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleTournamentCategory(key)}
                          className="h-4 w-4 rounded accent-emerald-400"
                        />
                        <div>
                          <span className={`font-semibold text-sm ${checked ? "text-emerald-400" : "text-slate-200"}`}>
                            {label}
                          </span>
                          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {form.tournament.categories.length === 0 && (
                  <p className="text-sm text-yellow-400">
                    Pilih minimal satu kategori untuk ikut turnamen.
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-400"
          >
            Simpan Pemain
          </button>
        </form>
      </section>

      {/* Modal Preview */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>

            <h2 className="text-2xl font-black text-slate-100 mb-6 relative">
              Konfirmasi Data Pemain
            </h2>

            <div className="space-y-3 text-sm relative z-10 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                <p className="text-xs text-slate-400">Foto</p>
                {form.photoUrl ? (
                  <img
                    src={form.photoUrl}
                    alt="Foto Preview"
                    className="rounded-xl object-cover border border-white/10 mt-1"
                    style={{ width: 60, height: 60, aspectRatio: "1/1" }}
                  />
                ) : (
                  <span className="text-slate-500">-</span>
                )}
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                <p className="text-xs text-slate-400">Nama / Panggilan</p>
                <p className="mt-1 font-semibold text-slate-100">
                  {form.name} ({form.nickname})
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                <p className="text-xs text-slate-400">Tempat / Tanggal Lahir / Gender</p>
                <p className="mt-1 font-semibold text-slate-100">
                  {form.birthPlace}, {form.birthDate} ({form.gender})
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                <p className="text-xs text-slate-400">Alamat</p>
                <p className="mt-1 font-semibold text-slate-100">
                  Blok {form.houseBlock} / No. {form.houseNumber}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                <p className="text-xs text-slate-400">Main Tenis Sejak</p>
                <p className="mt-1 font-semibold text-slate-100">
                  {form.startMonth} {form.startYear}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                <p className="text-xs text-slate-400">Alasan Main Tenis</p>
                <p className="mt-1 font-semibold text-slate-100 italic">
                  "{form.reason}"
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                <p className="text-xs text-slate-400">Skill (1-10)</p>
                <div className="grid grid-cols-2 mt-1 font-semibold text-slate-100 gap-1">
                  <span>Forehand: {form.skills.forehand}</span>
                  <span>Backhand: {form.skills.backhand}</span>
                  <span>Service: {form.skills.service}</span>
                  <span>Volley: {form.skills.volley}</span>
                  <span>Slice: {form.skills.slice}</span>
                  <span>Loop: {form.skills.loop}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                <p className="text-xs text-slate-400">Turnamen Internal</p>
                <p className="mt-1 font-semibold text-slate-100">
                  {form.tournament?.willing ? "Bersedia ikut" : "Tidak bersedia"}
                </p>
                {form.tournament.willing && form.tournament.categories.length > 0 && (
                  <p className="text-xs text-emerald-400 mt-1">
                    Kategori: {form.tournament?.categories.map((c) => categoryLabels[c]).join(", ")}
                  </p>
                )}
                {form.tournament?.willing && form.tournament.categories.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-1">Belum memilih kategori</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-6 relative z-10">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 font-bold text-slate-400 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                disabled={isSaving}
                onClick={handleConfirmSave}
                className={`flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer ${
                  isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-400"
                }`}
              >
                {isSaving ? "Menyimpan..." : "OK, Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}