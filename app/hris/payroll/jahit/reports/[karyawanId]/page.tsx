"use client";

import { useEffect, useState, use, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  CalendarDays,
  Eye,
  Printer,
  Receipt,
  Coffee,
} from "lucide-react";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { SlipGaji } from "./slip-gaji";
import {
  getInfoKaryawan,
  getKinerjaHarian,
  getDetailItemHarian,
  getSlipGajiMingguIni,
} from "./actions";

export default function DetailKinerjaPage({
  params,
}: {
  params: Promise<{ karyawanId: string }>;
}) {
  const router = useRouter();
  const { karyawanId } = use(params);

  const [karyawan, setKaryawan] = useState<any>(null);
  const [kinerja, setKinerja] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter UI
  const [filterType, setFilterType] = useState("7_hari"); // Default Page: 7 Hari Terakhir
  const [customMonth, setCustomMonth] = useState(() => {
    const d = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
    );
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Generate daftar tanggal lengkap (WIB)
  const dateList = useMemo(() => {
    const dates = [];
    const nowWib = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
    );

    if (filterType === "7_hari") {
      // Loop 7 hari: i=0 adalah hari ini, i=6 adalah 6 hari yang lalu
      for (let i = 0; i < 7; i++) {
        const d = new Date(nowWib);
        d.setDate(nowWib.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        dates.push(`${y}-${m}-${day}`);
      }
    } else {
      const [y, m] = customMonth.split("-").map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      for (let i = lastDay; i >= 1; i--) {
        dates.push(
          `${y}-${String(m).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
        );
      }
    }
    return dates; // List sudah descending (terbaru di atas)
  }, [filterType, customMonth]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTanggal, setSelectedTanggal] = useState("");
  const [detailHasil, setDetailHasil] = useState<any[]>([]);
  const [isLoadingHasil, setIsLoadingHasil] = useState(false);

  // Print Logic
  const printRef = useRef<HTMLDivElement>(null);
  const [dataSlip, setDataSlip] = useState<any>(null);
  const [isPreparingSlip, setIsPreparingSlip] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Slip_Gaji_${karyawan?.nama}`,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const info = await getInfoKaryawan(Number(karyawanId));
      setKaryawan(info);

      const res = await getKinerjaHarian(
        Number(karyawanId),
        filterType,
        customMonth,
      );
      if (res.success) setKinerja(res.data);
      setIsLoading(false);
    };
    fetchData();
  }, [karyawanId, filterType, customMonth]);

  const bukaDetail = async (row: any) => {
    setSelectedTanggal(row.tanggal);
    setIsModalOpen(true);
    setIsLoadingHasil(true);
    const res = await getDetailItemHarian(row.headerIds);
    if (res.success) setDetailHasil(res.data);
    setIsLoadingHasil(false);
  };

  const cetakSlip = async () => {
    setIsPreparingSlip(true);
    const res = await getSlipGajiMingguIni(Number(karyawanId));
    if (res.success && res.data) {
      setDataSlip(res.data);
      setTimeout(() => {
        handlePrint();
        setIsPreparingSlip(false);
      }, 500);
    } else {
      toast.error("Gagal menyiapkan data cetak.");
      setIsPreparingSlip(false);
    }
  };

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const renderTanggalCantik = (dateStr: string) => {
    // Pakai T00:00:00 agar tidak bergeser tanggalnya saat parsing string YYYY-MM-DD
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (!karyawan) return null;

  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="px-2"
          >
            <ArrowLeft />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Riwayat: {karyawan?.nama}
            </h2>
            <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">
              Borongan Jahit
            </p>
          </div>
        </div>

        <Button
          onClick={cetakSlip}
          disabled={isPreparingSlip}
          className="bg-primary shadow-lg hover:shadow-xl transition-all"
        >
          {isPreparingSlip ? (
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
          ) : (
            <Printer className="mr-2 h-4 w-4" />
          )}
          Cetak Slip Gaji (Minggu Ini)
        </Button>
      </div>

      <Card className="bg-muted/30 border-dashed p-4 flex flex-col sm:flex-row items-center gap-4">
        <span className="text-sm font-bold">Filter Tampilan:</span>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[220px] bg-background">
            <SelectValue placeholder="Pilih Periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7_hari">
              7 Hari Terakhir 
            </SelectItem>
            <SelectItem value="pilih_bulan">Pilih Bulan...</SelectItem>
          </SelectContent>
        </Select>

        {filterType === "pilih_bulan" && (
          <Input
            type="month"
            className="w-full sm:w-[200px] bg-background"
            value={customMonth}
            onChange={(e) => setCustomMonth(e.target.value)}
          />
        )}
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          dateList.map((dateStr) => {
            const row = kinerja.find((k) => k.tanggal === dateStr);
            const isToday =
              dateStr ===
              new Date()
                .toLocaleString("en-CA", { timeZone: "Asia/Jakarta" })
                .split(",")[0];

            return (
              <Card
                key={dateStr}
                className={
                  !row
                    ? "opacity-50 border-dashed bg-muted/20"
                    : "hover:border-primary/50 transition-all shadow-sm"
                }
              >
                <div className="p-4 sm:p-6 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg flex items-center gap-2">
                      {renderTanggalCantik(dateStr)}
                      {isToday && (
                        <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase font-black">
                          Hari Ini
                        </span>
                      )}
                    </p>
                    {!row ? (
                      <div className="flex items-center gap-2 text-xs italic mt-1 text-muted-foreground">
                        <Coffee size={12} /> Libur / Tidak ada pengerjaan
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground font-medium">
                        {row.totalTransaksi} Sesi Input
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter mb-0.5">
                        Total Upah
                      </p>
                      <p className="font-black text-xl text-primary">
                        {formatRupiah(row?.totalUpah || 0)}
                      </p>
                    </div>
                    {row && (
                      <Button
                        variant="secondary"
                        onClick={() => bukaDetail(row)}
                        className="h-10"
                      >
                        <Eye size={16} className="mr-2" /> Lihat Hasil
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="text-primary h-5 w-5" /> Rincian Pekerjaan
            </DialogTitle>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              {selectedTanggal && renderTanggalCantik(selectedTanggal)}
            </p>
          </DialogHeader>
          <div className="space-y-3 mt-4 max-h-[50vh] overflow-auto pr-2">
            {isLoadingHasil ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              detailHasil.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-muted-foreground/10"
                >
                  <div>
                    <p className="font-bold text-sm">{item.namaProduk}</p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {item.kuantitas} Pcs x {formatRupiah(item.harga)}
                    </p>
                  </div>
                  <div className="font-black text-primary text-sm">
                    {formatRupiah(item.subtotal)}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* RENDER INVISIBLE UNTUK PRINT */}
      <div className="hidden">
        {dataSlip && (
          <SlipGaji
            ref={printRef}
            karyawanNama={karyawan?.nama}
            dataSlip={dataSlip}
          />
        )}
      </div>
    </main>
  );
}
