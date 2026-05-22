type BoxPlayerDetailProps = {
  title: string;
  subTitle?: string;
  desc: string;
};

export default function BoxPlayerDetail({ title, subTitle, desc }: BoxPlayerDetailProps) {
  return (
    <div className="w-1/3 rounded-xl p-4 flex flex-col justify-between bg-black/25 border border-white/10 shadow-lg shadow-emerald-900/30">
      <h3 className="uppercase text-xs font-black">{title}</h3>
      <p className="italic text-[10px] text-emerald-400">{subTitle}</p>
      <p className="text-xl text-right font-semibold mt-4 capitalize">{desc}</p>
    </div>
  );
}
