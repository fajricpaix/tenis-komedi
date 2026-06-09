"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useIsAdmin, logout } from "@utils/auth";

type SubItem = { label: string; href: string; badge?: string; color: "sky" | "pink" };
type NavItem =
  | { label: string; href: string; children?: never }
  | { label: string; href?: never; children: SubItem[] };

const navItems: NavItem[] = [
  { label: "Beranda", href: "/" },
  {
    label: "Daftar Pemain",
    children: [
      { label: "ATP Ranking", href: "/players/list/atp", badge: "Pria",   color: "sky"  },
      { label: "WTA Ranking", href: "/players/list/wta", badge: "Wanita", color: "pink" },
    ],
  },
  { label: "Event", href: "/events" },
];

const subActiveClass: Record<SubItem["color"], string> = {
  sky:  "bg-sky-500/15 text-sky-300 border border-sky-500/25",
  pink: "bg-pink-500/15 text-pink-400 border border-pink-500/25",
};
const subHoverClass: Record<SubItem["color"], string> = {
  sky:  "hover:bg-sky-500/8 hover:text-sky-300",
  pink: "hover:bg-pink-500/8 hover:text-pink-400",
};
const subBadgeClass: Record<SubItem["color"], string> = {
  sky:  "bg-sky-500/15 border-sky-500/25 text-sky-400",
  pink: "bg-pink-500/15 border-pink-500/25 text-pink-400",
};

export default function Header() {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarSubOpen, setSidebarSubOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.refresh();
    window.location.reload();
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSidebarSubOpen(false);
  };

  // Tutup dropdown desktop saat klik di luar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Tutup dropdown saat pindah halaman
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  const isPlayersActive = pathname.startsWith("/players");
  const activeSubColor = pathname === "/players/list/wta" ? "pink" : "sky";
  const parentActiveClass = isPlayersActive
    ? activeSubColor === "pink"
      ? "bg-pink-500/15 text-pink-300 border border-pink-500/25"
      : "bg-sky-500/15 text-sky-300 border border-sky-500/25"
    : "";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-emerald-950 via-emerald-900 to-emerald-800 border-b-2 border-emerald-500">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo + Nama */}
          <Link href="/" className="flex items-center gap-3" onClick={closeSidebar}>
            <img src="/logo.webp" alt="Logo Tenis Komedi" className="h-10 w-10 object-contain select-none" />
            <div>
              <h1 className="text-base font-black text-white leading-none">Tenis Komedi</h1>
              <p className="text-[10px] tracking-wide text-emerald-300 font-semibold mt-0.5">Club Tenis Komedi</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key={item.label} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen((v) => !v)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                        isPlayersActive || dropdownOpen
                          ? parentActiveClass
                          : "text-slate-300 hover:text-emerald-300 hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown panel */}
                    <div className={`absolute top-full right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden transition-all duration-200 origin-top ${
                      dropdownOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
                    }`}>
                      <div className="p-1.5">
                        {item.children.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                              pathname === sub.href
                                ? subActiveClass[sub.color]
                                : `text-slate-300 hover:bg-white/5 ${subHoverClass[sub.color]}`
                            }`}
                          >
                            {sub.label}
                            {sub.badge && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-black ${subBadgeClass[sub.color]}`}>
                                {sub.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                    pathname === item.href
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-300 hover:text-emerald-300 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {isAdmin && (
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/30 text-emerald-300 hover:bg-red-500/10 hover:border-red-400/40 hover:text-red-400 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            )}
          </nav>

          {/* Burger Button - Mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer"
            aria-label="Buka menu"
          >
            <span className="w-5 h-0.5 bg-white rounded-full" />
            <span className="w-5 h-0.5 bg-white rounded-full" />
            <span className="w-5 h-0.5 bg-white rounded-full" />
          </button>

        </div>
      </header>

      {/* Overlay backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-60 md:hidden backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar - slide dari kanan */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 z-70 md:hidden flex flex-col bg-slate-950 border-l border-emerald-500/30 shadow-2xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-4 bg-linear-to-r from-emerald-950 to-slate-950 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="Logo" className="h-10 w-10 object-contain select-none" />
            <div>
              <p className="text-base font-black text-white leading-none">Tenis Komedi</p>
              <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Club Tenis Komedi</p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.children) {
              return (
                <div key={item.label}>
                  {/* Parent toggle */}
                  <button
                    onClick={() => setSidebarSubOpen((v) => !v)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                      isPlayersActive
                        ? parentActiveClass
                        : "text-slate-300 hover:text-emerald-300 hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${sidebarSubOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Sub-items accordion */}
                  <div className={`overflow-hidden transition-all duration-300 ${sidebarSubOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="ml-4 mt-1 pl-4 border-l-2 border-emerald-500/30 flex flex-col gap-1 pb-1">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={closeSidebar}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                            pathname === sub.href
                              ? subActiveClass[sub.color]
                              : `text-slate-400 hover:bg-white/5 ${subHoverClass[sub.color]}`
                          }`}
                        >
                          {sub.label}
                          {sub.badge && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-black ${subBadgeClass[sub.color]}`}>
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-bold transition-colors ${
                  pathname === item.href
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300 hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout paling bawah */}
        {isAdmin && (
          <div className="px-4 pb-8 pt-4 border-t border-white/5">
            <button
              onClick={() => { closeSidebar(); handleLogout(); }}
              className="w-full px-4 py-3 rounded-xl text-sm font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
