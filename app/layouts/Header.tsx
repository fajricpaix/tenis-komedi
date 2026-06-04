"use client";

import Link from "next/link";
import { useIsAdmin, logout } from "@utils/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const isAdmin = useIsAdmin();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.refresh();
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-emerald-950 via-emerald-900 to-emerald-800 border-b-2 border-emerald-500">
      <div className="container mx-auto relative p-4 overflow-hidden flex flex-col md:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 md:gap-5">
          <Link href="/">
            <img
              src="/logo.webp"
              alt="Logo Tenis Komedi"
              className="h-12 md:h-14 w-12 md:w-14 select-none object-contain"
            />
          </Link>
          <div>
            <h1 className="text-lg md:text-2xl font-black tracking-widest text-white leading-none">
              Tenis Komedi
            </h1>
            <p className="text-xs tracking-wide md:tracking-wider text-emerald-300 mt-1 md:mt-2 font-semibold">
              Ranking &amp; Data Pemain Resmi
            </p>
          </div>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 lg:static lg:translate-y-0">
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/30 text-emerald-300 hover:bg-red-500/10 hover:border-red-400/40 hover:text-red-400 transition-colors cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
