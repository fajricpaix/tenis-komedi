import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed inset-x-0 bg-linear-to-r from-emerald-950 via-emerald-900 to-emerald-800 border-b-2 border-emerald-500 px-8 py-6 overflow-hidden">
      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <img
            src="/logo.webp"
            alt="Logo Tenis Komedi"
            className="h-12 md:h-16 w-12 md:w-16 select-none object-contain"
          />
          <div>
            <h1 className="text-xl md:text-4xl font-black tracking-widest text-white leading-none">
              Tenis Komedi
            </h1>
            <p className="text-xs tracking-wide md:tracking-[0.3em] text-emerald-300 mt-2 font-semibold">
              Ranking &amp; Data Pemain Resmi
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}