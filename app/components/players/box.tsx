type BoxPlayerDetailProps = {
  title: string;
  subTitle?: string;
  desc: string;
  icon?: string;
};

export default function BoxPlayerDetail({ title, subTitle, desc, icon }: BoxPlayerDetailProps) {
  return (
    <div className="w-1/2 rounded-xl p-1 bg-linear-to-r from-[#FFE094] via-[#C59B27] to-[#8A640F] shadow-lg shadow-[#C59B27]/40">
      <div className="flex flex-col gap-1 bg-emerald-900 p-4 rounded-xl">
        <div className="flex items-start justify-between">
          <h3 className="uppercase font-semibold">{title}</h3>
          {icon && <span className="text-slate-400 text-2xl leading-none">{icon}</span>}
        </div>
        <p className="text-xs font-semibold italic -mt-1 text-emerald-400">{subTitle}</p>
        <p className="text-2xl text-right font-bold text-slate-100 mt-4 capitalize leading-tight">{desc}</p>
      </div>
    </div>
  );
}
