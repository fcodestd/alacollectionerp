// app/hris/payroll/jahit/input/page.tsx
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Search, Trash2, Save, UserCheck, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/confirm-dialog";

import { useAuthStore } from "@/lib/store/use-auth-store";
import { useJahitStore } from "@/lib/store/use-jahit-store";
import { getKaryawanJahit, cariProduk, simpanPayrollJahit } from "./actions";

export default function InputJahitPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const { karyawanId, karyawanNama, items, setKaryawan, addItem, updateQty, removeItem, clearForm } = useJahitStore();

  // State Karyawan
  const [listKaryawan, setListKaryawan] = useState<any[]>([]);
  const [searchKaryawan, setSearchKaryawan] = useState("");
  const [showKaryawanDropdown, setShowKaryawanDropdown] = useState(false);

  // State Produk
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingProduk, setIsSearchingProduk] = useState(false);
  const [showProdukDropdown, setShowProdukDropdown] = useState(false);

  const [isFinalizing, setIsFinalizing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Load Karyawan saat halaman dirender
  useEffect(() => {
    const fetchKaryawan = async () => {
      const res = await getKaryawanJahit();
      if (res.success && res.data) setListKaryawan(res.data);
    };
    fetchKaryawan();
    
    // Set input pencarian sesuai dengan data di Store
    if (karyawanNama) {
      setSearchKaryawan(karyawanNama);
    }
  }, [karyawanNama]);

  // Efek Live Search Produk (Server Side)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearchingProduk(true);
        const res = await cariProduk(searchQuery);
        if (res.success && res.data) setSearchResults(res.data);
        setIsSearchingProduk(false);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Kalkulasi Total
  const grandTotal = useMemo(() => {
    return items.reduce((total, item) => total + item.subtotal, 0);
  }, [items]);

  // Filter Karyawan (Client Side)
  const filteredKaryawan = useMemo(() => {
    if (!searchKaryawan) return listKaryawan;
    return listKaryawan.filter((k) => 
      k.nama.toLowerCase().includes(searchKaryawan.toLowerCase())
    );
  }, [searchKaryawan, listKaryawan]);

  const handleSelectKaryawan = (k: any) => {
    setKaryawan(k.id.toString(), k.nama);
    setSearchKaryawan(k.nama);
    setShowKaryawanDropdown(false);
  };

  const handleResetKaryawan = () => {
    setKaryawan("", "");
    setSearchKaryawan("");
    setShowKaryawanDropdown(true);
  };

  const handleSelectProduk = (produk: any) => {
    addItem({
      produkId: produk.id,
      namaProduk: produk.nama,
      harga: Number(produk.hargaBorongan),
      qty: 1,
      subtotal: Number(produk.hargaBorongan),
    });
    setSearchQuery("");
    setSearchResults([]);
    setShowProdukDropdown(false);
  };

  const executeFinalisasi = async () => {
    setIsFinalizing(true);
    
    const payload = {
      karyawanId: Number(karyawanId),
      operatorId: user!.id,
      totalKeseluruhan: grandTotal,
      items: items.map(item => ({
        produkId: item.produkId,
        harga: item.harga,
        kuantitas: item.qty,
        subtotal: item.subtotal
      }))
    };

    const res = await simpanPayrollJahit(payload);
    
    if (res.success) {
      toast.success(res.message);
      clearForm(); 
      setSearchKaryawan("");
      setConfirmOpen(false);
      router.push("/hris/payroll/jahit"); 
    } else {
      toast.error(res.message);
    }
    
    setIsFinalizing(false);
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="px-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Input Data Jahit</h2>
          <p className="text-muted-foreground text-sm">Catat hasil produksi jahitan per karyawan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri: Pilih Karyawan & Pencarian Produk */}
        {/* z-10 pada grid column mencegah bentrok layer dengan elemen kanan */}
        <div className="lg:col-span-1 flex flex-col gap-4 relative z-10">
          
          <Card className="overflow-visible z-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Tenaga Penjahit</CardTitle>
              <CardDescription>Cari dan pilih karyawan.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {karyawanId ? (
                  // State saat Karyawan sudah dipilih
                  <div className="flex items-center justify-between border rounded-md p-3 bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-primary">{karyawanNama}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={handleResetKaryawan}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  // State saat mencari karyawan
                  <>
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Cari nama karyawan..." 
                      className="pl-9 h-10"
                      value={searchKaryawan}
                      onChange={(e) => setSearchKaryawan(e.target.value)}
                      onFocus={() => setShowKaryawanDropdown(true)}
                      onBlur={() => setTimeout(() => setShowKaryawanDropdown(false), 200)}
                    />
                    {showKaryawanDropdown && (
                      <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-background border rounded-md shadow-xl max-h-48 overflow-auto">
                        {filteredKaryawan.length > 0 ? (
                          filteredKaryawan.map((k) => (
                            <div 
                              key={k.id}
                              className="px-4 py-2.5 hover:bg-muted cursor-pointer text-sm border-b last:border-0 transition-colors"
                              onClick={() => handleSelectKaryawan(k)}
                            >
                              {k.nama}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">Karyawan tidak ditemukan.</div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-visible z-40">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Cari Produk</CardTitle>
              <CardDescription>Pilih produk yang diselesaikan.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Ketik nama produk..." 
                  className="pl-9 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowProdukDropdown(true)}
                  onBlur={() => setTimeout(() => setShowProdukDropdown(false), 200)}
                />
                {isSearchingProduk && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
                
                {/* Dropdown Produk */}
                {showProdukDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-background border rounded-md shadow-xl max-h-60 overflow-auto">
                    {searchResults.map((produk) => (
                      <div 
                        key={produk.id}
                        className="px-4 py-3 hover:bg-muted cursor-pointer flex flex-col text-sm border-b last:border-0 transition-colors"
                        onClick={() => handleSelectProduk(produk)}
                      >
                        <span className="font-medium leading-none mb-1">{produk.nama}</span>
                        <span className="text-primary font-semibold text-xs">{formatRupiah(Number(produk.hargaBorongan))} / pcs</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Tabel Keranjang & Kalkulasi */}
        {/* z-0 agar tidak menutupi dropdown dari kolom kiri saat layar kecil */}
        <div className="lg:col-span-2 space-y-4 relative z-0">
          <Card className="h-full flex flex-col border-muted/60 shadow-sm">
            <CardHeader className="pb-2 border-b mb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                Daftar Pengerjaan
                <Button variant="ghost" size="sm" onClick={clearForm} className="text-destructive hover:bg-destructive/10 h-8">
                  Kosongkan Tabel
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 sm:p-6 sm:pt-0">
              <div className="rounded-md border flex-1 overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                    <TableRow>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Tarif (Rp)</TableHead>
                      <TableHead className="w-[100px] text-center">Qty</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                          Belum ada produk yang dimasukkan. Cari dan pilih produk di samping kiri.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.produkId}>
                          <TableCell className="font-medium">
                            {item.namaProduk}
                            <span className="block sm:hidden text-xs text-muted-foreground mt-1">
                              @ {formatRupiah(item.harga)} / Pcs
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground hidden sm:table-cell">
                            {formatRupiah(item.harga)}
                          </TableCell>
                          <TableCell className="p-2">
                            <Input 
                              type="number" 
                              min="1" 
                              className="w-full text-center h-9 bg-muted/50"
                              value={item.qty || ""}
                              onChange={(e) => updateQty(item.produkId, Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            {formatRupiah(item.subtotal)}
                          </TableCell>
                          <TableCell className="text-center p-2 pr-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => removeItem(item.produkId)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Ringkasan & Submit */}
              <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4 bg-background">
                <div className="w-full sm:w-auto text-center sm:text-left">
                  <p className="text-sm text-muted-foreground mb-1">Total Keseluruhan</p>
                  <p className="text-3xl font-black text-primary">{formatRupiah(grandTotal)}</p>
                </div>
                <Button 
                  size="lg" 
                  onClick={() => {
                    if (!karyawanId) return toast.error("Silakan pilih karyawan terlebih dahulu!");
                    if (items.length === 0) return toast.error("Belum ada produk yang diinput!");
                    setConfirmOpen(true);
                  }} 
                  disabled={items.length === 0 || !karyawanId} 
                  className="w-full sm:w-auto h-12 text-md px-8 shadow-md"
                >
                  <Save className="mr-2 h-5 w-5" />
                  Finalisasi & Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeFinalisasi}
        title="Konfirmasi Finalisasi"
        description={`Data gaji jahit untuk ${karyawanNama} dengan total upah ${formatRupiah(grandTotal)} akan disimpan. Kuantitas ini tidak dapat diubah setelah masuk ke laporan keuangan. Anda yakin?`}
        confirmText="Ya, Simpan Transaksi"
        cancelText="Batal"
        isLoading={isFinalizing}
        isDestructive={false}
      />
    </main>
  );
}