// app/master/product/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ConfirmDialog } from "@/components/confirm-dialog";

import { produkSchema, ProdukType } from "./validation";
import { getProduk, simpanProduk, hapusProduk } from "./actions";

export default function ProductPage() {
  const [dataProduk, setDataProduk] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ProdukType>({
    resolver: zodResolver(produkSchema),
    defaultValues: {
      nama: "",
      hargaBorongan: 0,
    },
  });

  const isEditMode = !!form.watch("id");

  const loadData = async () => {
    setIsLoading(true);
    const res = await getProduk();
    if (res.success && res.data) {
      setDataProduk(res.data);
    } else {
      toast.error("Gagal memuat data produk");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: ProdukType) => {
    setIsSaving(true);
    const res = await simpanProduk(values);

    if (res.success) {
      toast.success(res.message);
      setIsDialogOpen(false);
      loadData();
    } else {
      toast.error(res.message);
    }
    setIsSaving(false);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    const res = await hapusProduk(deleteId);
    if (res.success) {
      toast.success(res.message);
      loadData();
    } else {
      toast.error(res.message);
    }

    setIsDeleting(false);
    setDeleteId(null);
  };

  const openEditModal = (item: any) => {
    form.reset({
      id: item.id,
      nama: item.nama,
      hargaBorongan: Number(item.hargaBorongan),
    });
    setIsDialogOpen(true);
  };

  const openAddModal = () => {
    form.reset({ id: undefined, nama: "", hargaBorongan: 0 });
    setIsDialogOpen(true);
  };

  // Format Rupiah
  const formatRupiah = (angka: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(angka));
  };

  return (
    <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Master Produk</h2>
          <p className="text-muted-foreground">
            Kelola nama produk induk dan tarif borongan jahit per Pcs.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Data Produk" : "Tambah Produk Induk"}
              </DialogTitle>
              <DialogDescription>
                Data ini akan menjadi induk dasar sebelum dibuat varian (warna &
                ukuran).
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 mt-4"
              >
                <FormField
                  control={form.control}
                  name="nama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Produk</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukan Nama Produk"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hargaBorongan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarif Borongan Jahit (per Pcs)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-sm font-medium text-muted-foreground">
                            Rp
                          </span>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Simpan Produk"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk Induk</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : dataProduk.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada data produk induk.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead className="text-right">
                      Harga Borongan Jahit
                    </TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataProduk.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {item.nama}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(item.hargaBorongan)}/ Pcs
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(item)}
                        >
                          <Pencil className="h-4 w-4 text-amber-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="Hapus Produk Induk?"
        description="Produk ini akan dihapus permanen. Pastikan produk tidak terikat dengan data varian, BOM, atau laporan penggajian borongan."
        confirmText="Hapus Produk"
        isLoading={isDeleting}
      />
    </main>
  );
}
