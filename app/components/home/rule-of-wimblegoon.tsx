"use client";

type Props = {
  onClose: () => void;
};

export default function RulesModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-slate-900 border border-white/10 rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-emerald-400">Petunjuk Teknis</p>
            <h2 className="text-lg font-black text-slate-100">Teko Wimblegoon 2026</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 text-sm text-slate-300">

          {/* A */}
          <section>
            <h3 className="font-black text-slate-100 mb-2">A. Pendahuluan</h3>
            <p>
              Tenis Komedi – Wimbledon-nya Lagoon 2026 adalah liga tenis internal yang diselenggarakan khusus untuk warga tenis komedi Serpong Lagoon. Acara ini bertujuan untuk mendorong gaya hidup sehat, mempererat kebersamaan, dan membangun sportivitas melalui kegiatan olahraga tenis.
            </p>
          </section>

          {/* B */}
          <section>
            <h3 className="font-black text-slate-100 mb-2">B. Tujuan Kegiatan</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Mendorong gaya hidup sehat dan aktif</li>
              <li>Mempererat kebersamaan antarwarga tenis komedi Serpong Lagoon</li>
              <li>Menjadi wadah kompetisi tenis yang sportif dan menyenangkan</li>
            </ol>
          </section>

          {/* C */}
          <section className="space-y-4">
            <h3 className="font-black text-slate-100">C. Jadwal, Waktu dan Tempat Acara</h3>

            <div className="rounded-xl bg-white/3 border border-white/10 p-4 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Jadwal Pertandingan</p>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="font-bold text-slate-200">a. Penyisihan & Pengumpulan Poin — 4–24 Juni 2026</p>
                  <p className="text-slate-400 mt-0.5">Setiap pemain bebas menentukan waktu tandingnya selama dalam periode penyisihan (sesuai kesepakatan 2 pihak peserta).</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200">b. Semifinal — 26 Juni 2026</p>
                  <p className="text-slate-400 mt-0.5">4 pemain dengan nilai tertinggi akan melanjutkan ke Semifinal.</p>
                </div>
                <div>
                  <p className="font-bold text-emerald-400">c. Final — 27 Juni 2026</p>
                  <p className="text-slate-400 mt-0.5">Bersamaan dengan acara ultah & launching jersey Tenis Komedi.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/3 border border-white/10 p-4 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Tempat Pertandingan</p>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="font-bold text-slate-200">a. Penyisihan — 4–24 Juni 2026</p>
                  <p className="text-slate-400 mt-0.5">Bebas, sesuai kesepakatan 2 pihak peserta.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200">b. Semifinal — 26 Juni 2026</p>
                  <p className="text-slate-400 mt-0.5">Lapangan Tenis Sport Club Serpong Lagoon</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200">c. Final — 27 Juni 2026</p>
                  <p className="text-slate-400 mt-0.5">Venue acara ultah & launching jersey Tenis Komedi (to be informed soon).</p>
                </div>
              </div>
            </div>
          </section>

          {/* D */}
          <section>
            <h3 className="font-black text-slate-100 mb-2">D. Peserta dan Kategori</h3>
            <p className="mb-2"><span className="font-bold text-slate-200">Peserta:</span> Liga ini terbuka khusus bagi warga tenis komedi Serpong Lagoon.</p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold">Men Single</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold">Women Single</span>
            </div>
          </section>

          {/* E */}
          <section className="space-y-4">
            <h3 className="font-black text-slate-100">E. Sistem Pertandingan</h3>

            <div className="rounded-xl bg-white/3 border border-white/10 p-4 space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Ketentuan Umum</p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs">
                <li>Sistem pertandingan terbagi menjadi 3 babak: penyisihan, semifinal, dan final.</li>
                <li>Penentuan service pertama menggunakan flip coin / rock paper scissor.</li>
                <li>Pergantian sisi lapangan setiap 2 game.</li>
                <li>Sistem Ad dan sudden death (deuce 40-40 dilanjutkan 1 Ad, lalu sudden death).</li>
                <li>Wajib upload foto bersama + skor ke website TeKo Wimblegoon dan informasikan ke group chat. Lawan memberikan approval dengan emoji jempol 👍.</li>
                <li>Pertandingan menggunakan player call. Ketidaksepakatan diselesaikan dengan cara ngopi bareng ☕.</li>
              </ol>
            </div>

            <div className="rounded-xl bg-white/3 border border-white/10 p-4 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Ketentuan Penyisihan & Pengumpulan Poin</p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs">
                <li>Pemain bebas bermain sebanyak mungkin, namun tidak boleh melawan pemain yang sama.</li>
                <li>Pemenang adalah peserta yang memenangkan 3 game terlebih dahulu.</li>
                <li>Poin ditentukan berdasarkan jumlah game yang dimenangkan:</li>
              </ol>
              <div className="overflow-x-auto rounded-xl border border-white/10 mt-2">
                <table className="w-full text-xs text-center">
                  <thead>
                    <tr className="bg-emerald-500/10 text-emerald-400 font-black uppercase tracking-wider">
                      <th className="px-4 py-2">Skor</th>
                      <th className="px-4 py-2">Pemenang</th>
                      <th className="px-4 py-2">Kalah</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200 font-bold">
                    <tr className="border-t border-white/10">
                      <td className="px-4 py-2">3 – 0</td>
                      <td className="px-4 py-2 text-emerald-400">6 poin</td>
                      <td className="px-4 py-2 text-slate-400">1 poin</td>
                    </tr>
                    <tr className="border-t border-white/10">
                      <td className="px-4 py-2">3 – 1</td>
                      <td className="px-4 py-2 text-emerald-400">5 poin</td>
                      <td className="px-4 py-2 text-slate-400">2 poin</td>
                    </tr>
                    <tr className="border-t border-white/10">
                      <td className="px-4 py-2">3 – 2</td>
                      <td className="px-4 py-2 text-emerald-400">4 poin</td>
                      <td className="px-4 py-2 text-slate-400">3 poin</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400">Per 24 Juni pukul 23:59, 4 pemain dengan poin tertinggi melanjutkan ke Semifinal.</p>
            </div>

            <div className="rounded-xl bg-white/3 border border-white/10 p-4 space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Ketentuan Semifinal</p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs">
                <li>Posisi 1 vs Posisi 4, Posisi 2 vs Posisi 3.</li>
                <li>Pemenang adalah peserta yang memenangkan 4 game terlebih dahulu.</li>
              </ol>
            </div>

            <div className="rounded-xl bg-white/3 border border-white/10 p-4 space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Ketentuan Final</p>
              <p className="text-xs">Pemenang adalah peserta yang memenangkan 4 game terlebih dahulu.</p>
            </div>
          </section>

          {/* F */}
          <section>
            <h3 className="font-black text-slate-100 mb-2">F. Penutup</h3>
            <p>Tenis Komedi Internal League 2026 diharapkan menjadi agenda tahunan yang memperkuat kebersamaan warga tenis komedi Serpong Lagoon.</p>
          </section>

          {/* G */}
          <section className="pb-2">
            <h3 className="font-black text-slate-100 mb-2">G. Susunan Panitia</h3>
            <p className="text-slate-400 italic mb-2">Tidak ada yang mau menjadi ketua, jadi semua orang punya hak dan kewajiban yang sama.</p>
            <p>Acara ini diarrange oleh: <span className="font-bold text-slate-200">Sugi, Fajar, Fajri, Julio, Adrian, Lucky dan Ryci</span></p>
          </section>

        </div>

        <div className="sticky bottom-0 px-6 py-4 border-t border-white/10 bg-slate-900/95 backdrop-blur-sm rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
