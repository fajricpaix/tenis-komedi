type BoxPlayerDetailProps = {
  title: string;
  subTitle?: string;
  desc: string;
  icon?: string;
};

export default function BoxPlayerDetail({ title, subTitle, desc, icon }: BoxPlayerDetailProps) {
  return (
    <div className="w-1/2 rounded-xl p-0.5 md:p-1 bg-linear-to-r from-[#FFE094] via-[#C59B27] to-[#8A640F]">
      <div className="flex flex-col justify-between gap-1 bg-emerald-900 p-3 rounded-xl h-full">
        <div>
          <div className="flex items-start justify-between">
            <p className="capitalize font-semibold text-sm md:text-base">{title}</p>
            {icon && <span className="text-slate-400 text-2xl leading-none">{icon}</span>}
          </div>
          <p className="text-xs font-semibold italic -mt-1 text-emerald-400">{subTitle}</p>
        </div>
        <p className="text-lg md:text-2xl text-right font-bold text-slate-100 capitalize leading-tight mt-2 md:mt-4">{desc}</p>
      </div>
    </div>
  );
}
