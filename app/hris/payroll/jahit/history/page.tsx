"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Eye,
  Loader2,
  CalendarDays,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { getRiwayatJahit, getDetailRiwayat } from "./actions";

export default function RiwayatJahitPage() {
  const router = useRouter();

  // Ambil default bulan ini untuk jaga-jaga kalau input type="month" muncul
  const getDefaultMonth = () => {
    const nowWib = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
    );
    const yyyy = nowWib.getFullYear();
    const mm = String(nowWib.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  };

  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchKode, setSearchKode] = useState("");
  const [filterType, setFilterType] = useState("minggu_ini"); // Cuma 2 value: "minggu_ini" atau "pilih_bulan"
  const [customMonth, setCustomMonth] = useState(getDefaultMonth()); // Nilai dari input date

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState<any>(null);
  const [detailItems, setDetailItems] = useState<any[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Load Data Header
  useEffect(() => {
    const fetchRiwayat = async () => {
      setIsLoading(true);

      // Tentukan payload ke server
      let activePeriode = filterType;

      if (filterType === "pilih_bulan") {
        if (!customMonth) {
          setIsLoading(false);
          return; // Jangan fetch kalau input bulannya belum diisi
        }
        activePeriode = customMonth; // Kirim YYYY-MM
      }

      const res = await getRiwayatJahit(activePeriode, searchKode);
      if (res.success && res.data) {
        setRiwayat(res.data);
      } else {
        toast.error("Gagal memuat riwayat transaksi");
      }
      setIsLoading(false);
    };

    const delayDebounce = setTimeout(() => {
      fetchRiwayat();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchKode, filterType, customMonth]);

  const openDetailModal = async (header: any) => {
    setSelectedHeader(header);
    setIsModalOpen(true);
    setIsLoadingDetail(true);

    const res = await getDetailRiwayat(header.id);
    if (res.success && res.data) {
      setDetailItems(res.data);
    } else {
      toast.error("Gagal memuat item produk");
    }

    setIsLoadingDetail(false);
  };

  const formatRupiah = (angka: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(angka));
  };

  const formatTanggal = (dateStr: string) => {
    return (
      new Date(dateStr)
        .toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(/\./g, ":") + " WIB"
    );
  };

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" onClick={() => router.back()} className="px-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Riwayat Jahit</h2>
          <p className="text-muted-foreground text-sm">
            Cari dan pantau data hasil jahitan harian.
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan No. Referensi (JHT-xxx)..."
              className="pl-9 h-10 w-full"
              value={searchKode}
              onChange={(e) => setSearchKode(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* DROPDOWN UTAMA */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-10 w-full sm:w-[160px]">
                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minggu_ini">Minggu Ini</SelectItem>
                <SelectItem value="pilih_bulan">Pilih Bulan...</SelectItem>
              </SelectContent>
            </Select>

            {/* MUNCUL HANYA JIKA "PILIH BULAN" DIKLIK */}
            {filterType === "pilih_bulan" && (
              <Input
                type="month"
                className="h-10 w-full sm:w-[180px]"
                value={customMonth}
                onChange={(e) => setCustomMonth(e.target.value)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* DATA DISPLAY */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : riwayat.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
          Tidak ada data transaksi yang ditemukan.
        </div>
      ) : (
        <>
          {/* MOBILE VIEW */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {riwayat.map((row) => (
              <Card key={row.id} className="overflow-hidden">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <p className="font-bold text-sm text-primary">
                        {row.kode}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatTanggal(row.tanggal)}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openDetailModal(row)}
                      className="h-8 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" /> Detail
                    </Button>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-muted-foreground">Karyawan</p>
                      <p className="font-medium text-sm">{row.karyawanNama}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Total Keseluruhan
                      </p>
                      <p className="font-bold text-base">
                        {formatRupiah(row.totalKeseluruhan)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* DESKTOP VIEW */}
          <Card className="hidden md:block">
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Tanggal Waktu</TableHead>
                    <TableHead>No. Referensi</TableHead>
                    <TableHead>Nama Penjahit</TableHead>
                    <TableHead className="text-right">Total (Rp)</TableHead>
                    <TableHead className="text-center w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riwayat.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatTanggal(row.tanggal)}
                      </TableCell>
                      <TableCell className="font-medium text-primary whitespace-nowrap">
                        {row.kode}
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.karyawanNama}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatRupiah(row.totalKeseluruhan)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetailModal(row)}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}

      {/* MODAL DETAIL ITEMS */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-2 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Receipt className="h-5 w-5 text-primary" /> Detail Transaksi
              </DialogTitle>
              <DialogDescription>
                Rincian produk untuk referensi{" "}
                <span className="font-bold text-foreground">
                  {selectedHeader?.kode}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 mt-4 bg-muted/30 p-3 rounded-lg border">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Penjahit
                </p>
                <p className="font-medium text-sm mt-0.5">
                  {selectedHeader?.karyawanNama}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Waktu Input
                </p>
                <p className="font-medium text-sm mt-0.5">
                  {selectedHeader && formatTanggal(selectedHeader.tanggal)}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 flex-1 overflow-y-auto">
            {isLoadingDetail ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {detailItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {index + 1}. {item.namaProduk}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {item.kuantitas} Pcs &times; {formatRupiah(item.harga)}
                      </span>
                    </div>
                    <div className="font-bold text-sm">
                      {formatRupiah(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t bg-muted/10 flex justify-between items-center">
            <span className="text-sm font-semibold text-muted-foreground">
              Total Upah:
            </span>
            <span className="text-lg font-black text-primary">
              {selectedHeader && formatRupiah(selectedHeader.totalKeseluruhan)}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
