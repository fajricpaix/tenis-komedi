"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useIsAdmin, logout } from "@utils/auth";

const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Event", href: "/events" },
  { label: "Pemain TeKo", href: "/players" },
];

export default function Header() {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.refresh();
    window.location.reload();
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-emerald-950 via-emerald-900 to-emerald-800 border-b-2 border-emerald-500">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo + Nama */}
          <Link href="/" className="flex items-center gap-3" onClick={closeSidebar}>
            <img
              src="/logo.webp"
              alt="Logo Tenis Komedi"
              className="h-10 w-10 object-contain select-none"
            />
            <div>
              <h1 className="text-base font-black text-white leading-none">
                Tenis Komedi
              </h1>
              <p className="text-[10px] tracking-wide text-emerald-300 font-semibold mt-0.5">
                Club Tenis Komedi
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
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
            ))}
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
            <img
              src="/logo.webp"
              alt="Logo"
              className="h-10 w-10 object-contain select-none"
            />
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
          {navItems.map((item) => (
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
          ))}
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
