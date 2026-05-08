"use client";

import { forwardRef } from "react";

interface SlipGajiProps {
  karyawanNama: string;
  dataSlip: any;
}

export const SlipGaji = forwardRef<HTMLDivElement, SlipGajiProps>(
  ({ karyawanNama, dataSlip }, ref) => {
    // Format angka tanpa 'Rp' (untuk list di dalam tabel agar rapi)
    const formatNumber = (angka: number) => {
      return new Intl.NumberFormat("id-ID").format(angka);
    };

    // Format angka dengan 'Rp' (khusus Grand Total)
    const formatRupiah = (angka: number) => {
      return (
        "Rp " +
        new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(
          angka,
        )
      );
    };

    const formatDateComplete = (dateStr: string) => {
      if (!dateStr) return "-";
      const d = new Date(dateStr);
      return new Date(
        d.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const generateWeekDays = () => {
      if (!dataSlip?.tanggalMulai) return [];

      const start = new Date(dataSlip.tanggalMulai);
      const days = [];

      for (let i = 0; i < 7; i++) {
        const current = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);

        const parts = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Jakarta",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).formatToParts(current);
        const y = parts.find((p) => p.type === "year")?.value;
        const m = parts.find((p) => p.type === "month")?.value;
        const d = parts.find((p) => p.type === "day")?.value;
        const dateKey = `${y}-${m}-${d}`;

        const dayName = new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          weekday: "long",
        })
          .format(current)
          .toUpperCase();
        const dateLabel = new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(current);

        days.push({ dateKey, dayName, dateLabel });
      }
      return days;
    };

    if (!dataSlip) return null;

    const weekDays = generateWeekDays();

    return (
      <div ref={ref} className="bg-white p-6 font-sans w-full text-black">
        {/* INSTRUKS KEPADA PRINTER - 100% HITAM PUTIH */}
        <style type="text/css" media="print">
          {`
            @page { size: landscape; margin: 10mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            * { color: black !important; background-color: transparent !important; }
          `}
        </style>

        {/* HEADER LAPORAN */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest">
              ALA COLLECTION
            </h1>
            <p className="text-sm font-semibold mt-1">
              Konveksi & Pakaian Anak dan Wanita
            </p>
            <p className="text-xs">
              Jl Panca Tengah Kec. Batujajar Kab. Bandung Barat 40561
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold uppercase tracking-widest">
              SLIP GAJI JAHIT
            </h2>
            <p className="text-xs mt-1">
              Dicetak pada: {formatDateComplete(new Date().toISOString())}
            </p>
          </div>
        </div>

        {/* INFORMASI KARYAWAN & PERIODE */}
        <div className="flex justify-between items-start mb-6 text-sm">
          <table className="w-[350px]">
            <tbody>
              <tr>
                <td className="w-[120px] font-semibold pb-1">Nama Karyawan</td>
                <td className="w-4 pb-1">:</td>
                <td className="font-bold uppercase pb-1">{karyawanNama}</td>
              </tr>
              <tr>
                <td className="font-semibold">Jabatan/Tugas</td>
                <td>:</td>
                <td className="uppercase">Borongan Jahit</td>
              </tr>
            </tbody>
          </table>

          <table className="w-[300px]">
            <tbody>
              <tr>
                <td className="w-[120px] font-semibold pb-1">Periode Kerja</td>
                <td className="w-4 pb-1">:</td>
                <td className="pb-1">Minggu Ini</td>
              </tr>
              <tr>
                <td className="font-semibold pb-1">Tanggal Awal</td>
                <td className="pb-1">:</td>
                <td className="pb-1">
                  {formatDateComplete(dataSlip.tanggalMulai)}
                </td>
              </tr>
              <tr>
                <td className="font-semibold">Tanggal Akhir</td>
                <td>:</td>
                <td>{formatDateComplete(dataSlip.tanggalAkhir)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* KONTEN UTAMA: 7 KOLOM HARIAN (HITAM PUTIH MURNI) */}
        <div className="grid grid-cols-7 border-2 border-black min-h-[300px] mb-8">
          {weekDays.map((day, idx) => {
            const dayData = dataSlip.riwayatHarian.find(
              (r: any) => r.tanggal === day.dateKey,
            );
            // Border kanan untuk pemisah hari
            const borderRight = idx !== 6 ? "border-r-2 border-black" : "";

            return (
              <div key={day.dateKey} className={`flex flex-col ${borderRight}`}>
                {/* HEADER KOLOM (HARI & TANGGAL) */}
                <div className="border-b-2 border-black text-center p-2">
                  <p className="font-bold text-sm tracking-wider uppercase">
                    {day.dayName}
                  </p>
                  <p className="text-xs mt-0.5">{day.dateLabel}</p>
                </div>

                {/* BODY KOLOM (LIST ITEM) */}
                <div className="flex-1 p-2 flex flex-col justify-between">
                  <div className="space-y-4">
                    {!dayData || dayData.items.length === 0 ? (
                      <div className="h-full mt-10 flex items-center justify-center opacity-0">
                        {/* Area dibiarkan kosong bersih jika libur, sesuai gambar referensi */}
                      </div>
                    ) : (
                      dayData.items.map((item: any, i: number) => (
                        <div key={i} className="text-[11px]">
                          <p className="font-bold leading-tight">
                            {item.namaProduk}
                          </p>
                          <p className="mt-0.5">
                            {item.kuantitas} Pcs x {formatNumber(item.harga)}
                          </p>
                          {/* Garis putus-putus presisi */}
                          <div className="border-b-[1.5px] border-black border-dotted my-1 w-full"></div>
                          <p className="font-bold">
                            {formatNumber(item.subtotal)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* TAMBAHAN LABEL SUBTOTAL HARIAN AGAR TIDAK SALAH BACA LAGI */}
                  {dayData && dayData.items.length > 0 && (
                    <div className="mt-6 pt-2 border-t border-black border-dashed text-right">
                      <p className="text-[10px] font-bold">
                        Total: {formatNumber(dayData.subtotalHarian)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* BAGIAN FOOTER: GRAND TOTAL */}
        <div className="flex justify-end">
          <div className="text-right">
            <p className="font-bold text-base tracking-widest uppercase mb-1">
              TOTAL GAJI DITERIMA
            </p>
            <p className="font-black text-4xl border-b-2 border-black pb-1">
              {formatRupiah(dataSlip.grandTotal)}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

SlipGaji.displayName = "SlipGaji";
