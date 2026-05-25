import Image from "next/image";

type SkillsPlayerDetailProps = {
    imgUrl: string;
    skillName?: string;
    value: number;
};

export default function SkillsPlayerDetail({ imgUrl, skillName, value }: SkillsPlayerDetailProps) {
    return (
        <div className="flex gap-x-3 items-center">
            <Image
                src={imgUrl} // Use player's image or a generic placeholder
                alt={'Skill Icon'}
                width={200}
                height={200}
                className="rounded-lg w-10 p-1.5 object-cover bg-black/25 border border-white/10 shadow-lg shadow-emerald-900/30"
            />
            <p className="w-18 font-semibold text-sm">{skillName}</p>
            <div className="flex-1 h-2 bg-emerald-900/30 rounded">
            <div className="h-2 rounded bg-emerald-400" style={{ width: `${value * 10}%` }} />
            </div>
            <span className="text-xs text-slate-300 font-bold">{value}/10</span>
            
        </div>
    );
}
