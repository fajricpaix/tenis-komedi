"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";

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
};



export default function AddPlayerPage() {
  const [form, setForm] = useState<NewPlayerForm>(initialForm);
  const [submitted, setSubmitted] = useState<NewPlayerForm | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof NewPlayerForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillChange = (field: keyof NewPlayerForm["skills"], value: number) => {
    setForm((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [field]: value,
      },
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('File harus berupa gambar.');
      setPhotoPreview(null);
      setForm((prev) => ({ ...prev, photoUrl: undefined }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Ukuran gambar maksimal 2MB.');
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
    setSubmitted(form);
    setForm(initialForm);
    setPhotoPreview(null);
    setPhotoError(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  return (
    <main className="px-6 py-10 mx-auto max-w-6xl">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">Tambah Pemain</h1>
          <p className="mt-3 text-slate-400 max-w-2xl">
            Lengkapi semua informasi pemain baru untuk ditambahkan ke database.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-300 hover:bg-emerald-500/20"
        >
          Kembali
        </Link>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/70 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-slate-950/30">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300" htmlFor="nama">
              Nama Pemain
            </label>
            <input
              id="nama"
              type="text"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300" htmlFor="panggilanGokil">
              Panggilan/Gokil (selain nama)
            </label>
            <input
              id="panggilanGokil"
              type="text"
              value={form.nickname}
              onChange={(event) => handleChange("nickname", event.target.value)}
              placeholder="Contoh: Si Unyil, Kojak, dll"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm fonrt-semibold text-slate-300" htmlFor="tempatLahir">
                Tempat Lahir
              </label>
              <input
                id="tempatLahir"
                type="text"
                value={form.birthPlace}
                onChange={(event) => handleChange("birthPlace", event.target.value)}
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
                onChange={(event) => handleChange("birthDate", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Gender</label>
              <div className="flex gap-4">
                {(["Pria", "Wanita"] as const).map((value) => (
                  <label key={value} className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 transition hover:border-emerald-400">
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

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300" htmlFor="blokRumah">
                Blok Rumah
              </label>
              <input
                id="blokRumah"
                type="text"
                value={form.houseBlock}
                onChange={(event) => handleChange("houseBlock", event.target.value)}
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
                onChange={(event) => handleChange("houseNumber", event.target.value)}
                placeholder="Contoh: 12"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Main Tenis Sejak</label>
            <div className="flex gap-4">
              <select
                id="mainTenisMonth"
                value={form.startMonth}
                onChange={(e) => handleChange("startMonth", e.target.value)}
                required
                className="w-2/3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Bulan</option>
                <option value="Januari">Januari</option>
                <option value="Februari">Februari</option>
                <option value="Maret">Maret</option>
                <option value="April">April</option>
                <option value="Mei">Mei</option>
                <option value="Juni">Juni</option>
                <option value="Juli">Juli</option>
                <option value="Agustus">Agustus</option>
                <option value="September">September</option>
                <option value="Oktober">Oktober</option>
                <option value="November">November</option>
                <option value="Desember">Desember</option>
              </select>

              <input
                id="mainTenisYear"
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300" htmlFor="kenapa">
              Kenapa Main Tenis?
            </label>
            <textarea
              id="kenapa"
              value={form.reason}
              onChange={(event) => handleChange("reason", event.target.value)}
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
                  style={{ width: 120, height: 120, aspectRatio: '1/1' }}
                />
              </div>
            )}
          </div>

          {/* Input skill tenis */}
          <div className="space-y-4 mt-8">
            <label className="text-sm font-semibold text-slate-300 block mb-2">Skill (1-10, menurut rasa sendiri)</label>
            {[
              { key: "forehand", label: "Forehand" },
              { key: "backhand", label: "Backhand" },
              { key: "service", label: "Service" },
              { key: "volley", label: "Volley" },
              { key: "slice", label: "Slice" },
              { key: "loop", label: "Loop" },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-4">
                <label htmlFor={item.key} className="w-24 text-slate-200">{item.label}</label>
                <input
                  id={item.key}
                  type="range"
                  min={1}
                  max={10}
                  value={form.skills[item.key as keyof NewPlayerForm["skills"]]}
                  onChange={(e) => handleSkillChange(item.key as keyof NewPlayerForm["skills"], Number(e.target.value))}
                  className="flex-1 accent-emerald-500 h-2 rounded-lg appearance-none cursor-pointer bg-slate-700"
                />
                <span className="w-8 text-center text-slate-100 font-bold">{form.skills[item.key as keyof NewPlayerForm["skills"]]}</span>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-400"
          >
            Simpan Pemain
          </button>
        </form>

        <aside className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Preview Data</h2>
            <p className="mt-2 text-slate-400 text-sm">Data pemain yang akan disimpan ke JSON.</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3 flex items-center gap-4">
              <div>
                <p className="text-xs text-slate-400">Foto</p>
                {form.photoUrl ? (
                  <img
                    src={form.photoUrl}
                    alt="Foto Preview"
                    className="rounded-xl object-cover border border-white/10 mt-1"
                    style={{ width: 60, height: 60, aspectRatio: '1/1' }}
                  />
                ) : (
                  <span className="text-slate-500">-</span>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
              <p className="text-xs text-slate-400">Nama</p>
              <p className="mt-1 font-semibold text-slate-100">{form.name || "-"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
              <p className="text-xs text-slate-400">Panggilan Gokil</p>
              <p className="mt-1 font-semibold text-slate-100">{form.nickname || "-"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
              <p className="text-xs text-slate-400">Tempat / Tanggal Lahir</p>
              <p className="mt-1 font-semibold text-slate-100">
                {(form.birthPlace || "-") + (form.birthDate ? (", " + form.birthDate) : "")}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
              <p className="text-xs text-slate-400">Gender</p>
              <p className="mt-1 font-semibold text-slate-100">{form.gender}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
              <p className="text-xs text-slate-400">Alamat</p>
              <p className="mt-1 font-semibold text-slate-100">Blok {form.houseBlock || "-"} / No. {form.houseNumber || "-"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                <p className="text-xs text-slate-400">Main Tenis Sejak</p>
                <p className="mt-1 font-semibold text-slate-100">{form.startMonth || "-"} {form.startYear || "-"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
              <p className="text-xs text-slate-400">Alasan Main Tenis</p>
              <p className="mt-1 font-semibold text-slate-100">{form.reason || "-"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
              <p className="text-xs text-slate-400">Skill (1-10)</p>
              <ul className="mt-1 font-semibold text-slate-100 space-y-1">
                <li>Forehand: {form.skills.forehand}</li>
                <li>Backhand: {form.skills.backhand}</li>
                <li>Service: {form.skills.service}</li>
                <li>Volley: {form.skills.volley}</li>
                <li>Slice: {form.skills.slice}</li>
                <li>Loop: {form.skills.loop}</li>
              </ul>
            </div>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-100">
              <p className="font-bold text-sm">Data disimpan:</p>
              <pre className="mt-2 overflow-x-auto text-xs text-slate-200 bg-slate-950/80 rounded p-2">{JSON.stringify(submitted, null, 2)}</pre>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Isi form dan tekan simpan untuk melihat JSON yang akan dikirim.</p>
          )}
        </aside>
      </section>
    </main>
  );
}
