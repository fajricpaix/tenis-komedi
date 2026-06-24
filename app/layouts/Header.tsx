"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useIsAdmin, logout } from "@utils/auth";

// ── Inline SVG Icons ───────────────────────────────────────────────────────────

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconTrophy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21" />
      <line x1="12" y1="17" x2="12" y2="11" />
      <path d="M7 4H17l-1 7H8L7 4z" />
      <path d="M5 4H3c0 3 2 5 4 6" />
      <path d="M19 4h2c0 3-2 5-4 6" />
    </svg>
  );
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconLogout({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ── Dropdown item ──────────────────────────────────────────────────────────────

function DropdownLink({
  href, label, active, activeClass, hoverClass,
}: {
  href: string; label: string; active: boolean;
  activeClass: string; hoverClass: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
        active ? activeClass : `text-slate-400 ${hoverClass}`
      }`}
    >
      {label}
    </Link>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Header() {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  const isPlayersActive = pathname.startsWith("/players");
  const isEventActive   = pathname.startsWith("/events");

  const handleLogout = () => {
    logout();
    router.refresh();
    window.location.reload();
  };

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => { setOpenDropdown(null); }, [pathname]);

  return (
    <>
      {/* ══════════════════════════════════════════
          DESKTOP — floating pill nav (top-center)
          ══════════════════════════════════════════ */}
      <div ref={pillRef} className="hidden md:block fixed top-3 left-1/2 -translate-x-1/2 z-50">
        <nav
          className="flex items-center gap-0.5 px-2 py-1.5"
          style={{
            background: "rgba(9, 15, 28, 0.88)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "18px",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.03), 0 8px 40px rgba(0,0,0,0.65), 0 0 80px rgba(16,185,129,0.06)",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <img src="/logo.webp" alt="TeKo" className="h-6 w-6 object-contain select-none" />
            <span className="text-sm font-black text-white tracking-tight">TeKo</span>
          </Link>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Beranda */}
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
              pathname === "/"
                ? "bg-emerald-500/15 text-emerald-300"
                : "text-slate-400 hover:text-white hover:bg-white/6"
            }`}
          >
            Beranda
          </Link>

          {/* Pemain dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown((v) => (v === "pemain" ? null : "pemain"))}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                isPlayersActive || openDropdown === "pemain"
                  ? "bg-sky-500/15 text-sky-300"
                  : "text-slate-400 hover:text-white hover:bg-white/6"
              }`}
            >
              Pemain
              <IconChevron
                className={`w-3 h-3 transition-transform duration-200 ${
                  openDropdown === "pemain" ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 rounded-xl p-1.5 transition-all duration-200 origin-top ${
                openDropdown === "pemain"
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
              style={{
                background: "rgba(9,15,28,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                backdropFilter: "blur(24px)",
              }}
            >
              <DropdownLink href="/players/list/atp" label="ATP Ranking"
                active={pathname === "/players/list/atp"}
                activeClass="bg-sky-500/15 text-sky-300"
                hoverClass="hover:bg-sky-500/8 hover:text-sky-300"
              />
              <DropdownLink href="/players/list/wta" label="WTA Ranking"
                active={pathname === "/players/list/wta"}
                activeClass="bg-pink-500/15 text-pink-300"
                hoverClass="hover:bg-pink-500/8 hover:text-pink-300"
              />
            </div>
          </div>

          {/* Event dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown((v) => (v === "event" ? null : "event"))}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                isEventActive || openDropdown === "event"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-slate-400 hover:text-white hover:bg-white/6"
              }`}
            >
              Event
              <IconChevron
                className={`w-3 h-3 transition-transform duration-200 ${
                  openDropdown === "event" ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 rounded-xl p-1.5 transition-all duration-200 origin-top ${
                openDropdown === "event"
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
              style={{
                background: "rgba(9,15,28,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                backdropFilter: "blur(24px)",
              }}
            >
              <DropdownLink href="/events/wimblegoon" label="🎾 Wimblegoon"
                active={pathname === "/events/wimblegoon"}
                activeClass="bg-emerald-500/15 text-emerald-300"
                hoverClass="hover:bg-emerald-500/8 hover:text-emerald-300"
              />
            </div>
          </div>

          {/* Admin logout */}
          {isAdmin && (
            <>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <button
                onClick={handleLogout}
                title="Log Out"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <IconLogout className="w-3.5 h-3.5" />
                Log Out
              </button>
            </>
          )}
        </nav>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE — fixed bottom tab bar
          ══════════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(9,15,28,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
        }}
      >
        <div className="flex items-center justify-around h-16 px-4">

          {/* Beranda */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${
              pathname === "/" ? "text-emerald-400" : "text-slate-600"
            }`}
          >
            {pathname === "/" && (
              <span className="absolute w-1 h-1 rounded-full bg-emerald-400 -mt-3 mb-0.5 opacity-80" />
            )}
            <IconHome className="w-[22px] h-[22px]" />
            <span
              className={`text-[10px] font-bold tracking-wide transition-all ${
                pathname === "/" ? "text-emerald-400" : "text-slate-600"
              }`}
            >
              Beranda
            </span>
          </Link>

          {/* Pemain */}
          <Link
            href="/players/list/atp"
            className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${
              isPlayersActive ? "text-sky-400" : "text-slate-600"
            }`}
          >
            <IconUsers className="w-[22px] h-[22px]" />
            <span
              className={`text-[10px] font-bold tracking-wide transition-all ${
                isPlayersActive ? "text-sky-400" : "text-slate-600"
              }`}
            >
              Pemain
            </span>
          </Link>

          {/* Event */}
          <Link
            href="/events/wimblegoon"
            className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${
              isEventActive ? "text-emerald-400" : "text-slate-600"
            }`}
          >
            <IconTrophy className="w-[22px] h-[22px]" />
            <span
              className={`text-[10px] font-bold tracking-wide transition-all ${
                isEventActive ? "text-emerald-400" : "text-slate-600"
              }`}
            >
              Event
            </span>
          </Link>

          {/* Logout — admin only */}
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all text-red-500 hover:text-red-400 cursor-pointer"
            >
              <IconLogout className="w-5.5 h-5.5" />
              <span className="text-[10px] font-bold tracking-wide">Log Out</span>
            </button>
          )}

        </div>
      </nav>
    </>
  );
}
