type BoxPlayerDetailProps = {
  title: string;
  subTitle?: string;
  desc: string;
  icon?: string;
};

export default function BoxPlayerDetail({ title, subTitle, desc, icon }: BoxPlayerDetailProps) {
  return (
    <div className="w-1/3 rounded-xl p-1 bg-linear-to-r from-[#FFE094] via-[#C59B27] to-[#8A640F] shadow-lg shadow-[#C59B27]/40">
      <div className="flex flex-col gap-1 bg-emerald-900 p-3 rounded-xl">
        <div className="flex items-start justify-between">
          <h3 className="uppercase text-xs font-semibold">{title}</h3>
          {icon && <span className="text-slate-400 text-lg leading-none">{icon}</span>}
        </div>
        <p className="text-[10px] text-emerald-400 italic -mt-1.5">{subTitle}</p>
        <p className="text-xl text-right font-bold text-slate-100 mt-4 capitalize leading-tight">{desc}</p>
      </div>
    </div>
  );
}
