import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed z-50 inset-x-0 bg-linear-to-r from-emerald-950 via-emerald-900 to-emerald-800 border-b-2 border-emerald-500 px-8 py-6 overflow-hidden">
      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <Link href="/">
            <img
              src="/logo.webp"
              alt="Logo Tenis Komedi"
              className="h-10 md:h-14 w-10 md:w-14 select-none object-contain"
            />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-widest text-white leading-none">
              Tenis Komedi
            </h1>
            <p className="text-xs tracking-wide md:tracking-wider text-emerald-300 mt-2 font-semibold">
              Ranking &amp; Data Pemain Resmi
            </p>
          </div>
        </div>
        <nav>
          <ul className="flex items-center gap-6 text-sm">
            <li>
              <Link
                href="/players"
                className={`text-emerald-300 hover:text-white transition-colors duration-150 font-bold uppercase tracking-wide`}
              >
                List Pemain
              </Link>
            </li>
            <li>
              <Link
                href="/matches"
                className="text-emerald-300 hover:text-white transition-colors duration-150 font-bold uppercase tracking-wide"
              >
                Pertandingan
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}