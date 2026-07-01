type SkillsPlayerDetailProps = {
  imgUrl: string;
  skillName?: string;
  value: number;
};

export default function SkillsPlayerDetail({ imgUrl, skillName, value }: SkillsPlayerDetailProps) {
  return (
    <div className="flex gap-x-3 items-center">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-purple-400/20 border border-purple-500">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgUrl} alt={skillName ?? "skill"} width={24} height={24} className="object-contain" />
      </div>
      <p className="w-16 shrink-0 font-semibold text-xs text-slate-200">{skillName}</p>
      <div className="flex-1 flex gap-0.75">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={`h-3 flex-1 rounded-xs ${i < value * 2 ? "bg-purple-500" : "bg-emerald-950"}`}
          />
        ))}
      </div>
      <span className="text-xs text-slate-300 font-bold w-7 text-right shrink-0">{value}/10</span>
    </div>
  );
}
