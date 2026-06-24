"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@utils/auth";

export default function AuthPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("teko_admin_session") === "1") {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      const ok = login(username.trim(), password);
      if (ok) {
        router.replace("/");
      } else {
        setError("Username atau password salah.");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <main className="min-h-[88vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 mb-4">
            <span className="text-2xl">🎾</span>
          </div>
          <h1 className="text-2xl font-black text-slate-100">TeKo Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Masuk untuk akses fitur admin</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-400 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-400 transition-colors text-sm"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
              ✕ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-black text-sm tracking-wide bg-emerald-500 hover:bg-emerald-400 text-slate-900 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          Tenis Komedi Wimblegoon 2026
        </p>
      </div>
    </main>
  );
}
