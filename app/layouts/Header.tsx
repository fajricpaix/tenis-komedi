import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-linear-to-r from-emerald-950 via-emerald-900 to-emerald-800 border-b-2 border-emerald-500 p-4 md:px-8 md:py-6 overflow-hidden">
      <div className="relative z-10 flex flex-col md:gap-4 lg:flex-row lg:items-center lg:justify-between">
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
      </div>
    </header>
  );
}