import { type Player } from "@utils/fetcher";

type Props = {
  players: Player[];
};

function getDaysUntilBirthday(birthDate: string): number {
  if (!birthDate) return 999;

  const today = new Date();
  const birth = new Date(birthDate);
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());

  if (next < today) next.setFullYear(today.getFullYear() + 1);

  const diff = next.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatBirthDate(birthDate: string): string {
  if (!birthDate) return "-";
  const date = new Date(birthDate);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
}

function getBirthdayLabel(days: number): { label: string; className: string } {
  if (days === 0) return { label: "🎂 Hari ini!", className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" };
  if (days <= 7)  return { label: `${days} hari lagi`, className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" };
  if (days <= 30) return { label: `${days} hari lagi`, className: "text-blue-400 bg-blue-400/10 border-blue-400/20" };
  return { label: `${days} hari lagi`, className: "text-slate-400 bg-slate-400/10 border-slate-400/20" };
}

export default function BirthdayCards({ players }: Props) {
  const safePlayers = Array.isArray(players) ? players : [];

  const upcomingBirthdays = safePlayers
    .filter((p) => !!p.birthDate)
    .map((p) => ({ ...p, daysUntil: getDaysUntilBirthday(p.birthDate) }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 6);

  if (upcomingBirthdays.length === 0) return null;

  return (
    <div className="md:order-2 md:w-3/5">
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-lg md:text-3xl">🎂</span>
        <h2 className="font-bold text-slate-100 md:text-xl">Ulang Tahun Terdekat</h2>
      </div>

      <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:justify-center pb-2">
        {upcomingBirthdays.map((player, index) => {
          const { label, className } = getBirthdayLabel(player.daysUntil);
          return (
            <div
              key={player.id ?? index}
              className="shrink-0 w-44 md:w-full rounded-2xl border border-white/10 bg-slate-900/70 p-4 flex flex-col items-center gap-3 hover:border-white/20 transition-colors"
            >
              {/* Foto */}
              {player.imgUrl ? (
                <img
                  src={player.imgUrl}
                  alt={player.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-white/10 flex items-center justify-center text-xl font-bold text-slate-400">
                  {player.name?.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Nama */}
              <div className="text-center">
                <p className="font-semibold text-slate-100 text-sm leading-tight line-clamp-2 capitalize">
                  {player.name}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  {formatBirthDate(player.birthDate)}
                </p>
              </div>

              {/* Badge hari */}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${className}`}>
                {label}
              </span>

              {/* Umur */}
              <div className="text-center">
                <p className="text-xs">
                  Umurnya <span className="font-semibold text-sm text-fuchsia-400">{player.birthDate ? `${new Date().getFullYear() - new Date(player.birthDate).getFullYear() + 1} tahun` : "Umur tidak diketahui"}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}