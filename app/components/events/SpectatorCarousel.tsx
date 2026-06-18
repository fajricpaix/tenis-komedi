"use client";

import { useEffect, useState } from "react";
import type { Spectator } from "@utils/fetcher";

export function SpectatorCarousel({ spectators, tournamentTitle }: { spectators: Spectator[]; tournamentTitle?: string }) {
  const n = spectators.length;
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(true);

  // Append first 2 items at end for seamless infinite loop
  const items = n >= 3 ? [...spectators, spectators[0], spectators[1]] : spectators;

  useEffect(() => {
    if (n <= 2) return;
    const id = setInterval(() => {
      setAnimating(true);
      setOffset(prev => prev + 1);
    }, 5000);
    return () => clearInterval(id);
  }, [n]);

  // When offset reaches n, the visual content equals offset=0 — snap silently
  useEffect(() => {
    if (offset < n) return;
    const id = setTimeout(() => {
      setAnimating(false);
      setOffset(0);
    }, 520);
    return () => clearTimeout(id);
  }, [offset, n]);

  return (
    <div className="px-5 py-4 border-t border-white/8">
      <p className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-500 mb-3">
        Penonton Terbaik {tournamentTitle}
      </p>

      <div className="overflow-hidden rounded-xl">
        <div
          className="flex"
          style={{
            transform: `translateX(-${offset * 50}%)`,
            transition: animating ? "transform 0.5s ease-in-out" : "none",
          }}
        >
          {items.map((s, i) => (
            <div key={i} className="shrink-0 px-1" style={{ width: "50%" }}>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 border border-white/10">
                <img
                  src={s.imgUrl || "/wanita.jpg"}
                  alt={s.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
                <p className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-white px-2 leading-tight">
                  {s.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {n > 2 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {spectators.map((_, i) => (
            <button
              key={i}
              onClick={() => { setAnimating(true); setOffset(i); }}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                (offset % n) === i ? "w-5 bg-emerald-400" : "w-1.5 bg-slate-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
