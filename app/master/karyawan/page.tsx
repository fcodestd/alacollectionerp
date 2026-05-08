// app/master/karyawan/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Import Komponen Confirm Dialog yang baru dibuat
import { ConfirmDialog } from "@/components/confirm-dialog";

import { karyawanSchema, KaryawanType } from "./validation";
import { getKaryawan, simpanKaryawan, hapusKaryawan } from "./actions";

export default function KaryawanPage() {
  const [dataKaryawan, setDataKaryawan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State untuk Confirm Dialog Delete
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<KaryawanType>({
    resolver: zodResolver(karyawanSchema),
    defaultValues: {
      nama: "",
      jenis: "borongan jahit",
    },
  });

  const loadData = async () => {
    setIsLoading(true);
    const res = await getKaryawan();
    if (res.success && res.data) {
      setDataKaryawan(res.data);
    } else {
      toast.error("Gagal memuat data karyawan");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: KaryawanType) => {
    setIsSaving(true);
    const res = await simpanKaryawan(values);

    if (res.success) {
      toast.success(res.message);
      setIsDialogOpen(false);
      loadData();
    } else {
      toast.error(res.message);
    }
    setIsSaving(false);
  };

  // Fungsi Eksekusi Hapus yang dipanggil oleh Confirm Dialog
  const executeDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    const res = await hapusKaryawan(deleteId);
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
    form.reset({ id: item.id, nama: item.nama, jenis: item.jenis as any });
    setIsDialogOpen(true);
  };

  const openAddModal = () => {
    form.reset({ id: undefined, nama: "", jenis: "borongan jahit" });
    setIsDialogOpen(true);
  };

  return (
    <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Master Karyawan</h2>
          <p className="text-muted-foreground">
            Kelola data tenaga kerja Ala Collection.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Karyawan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {form.getValues("id")
                  ? "Edit Karyawan"
                  : "Tambah Karyawan Baru"}
              </DialogTitle>
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
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukan Nama Lengkap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jenis"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Jenis Pekerjaan</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <RadioGroupItem value="borongan jahit" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full">
                              Borongan Jahit
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <RadioGroupItem value="borongan potong" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full">
                              Borongan Potong
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <RadioGroupItem value="harian" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full">
                              Harian
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <RadioGroupItem value="packing" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full">
                              Packing
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Simpan Data"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : dataKaryawan.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada data karyawan.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Karyawan</TableHead>
                    <TableHead>Jenis Pekerjaan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataKaryawan.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold capitalize bg-primary/10 text-primary">
                          {item.jenis}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(item)}
                        >
                          <Pencil className="h-4 w-4 text-amber-500" />
                        </Button>
                        {/* Pemicu Dialog Confirm Delete */}
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

      {/* Mounting Komponen Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="Hapus Karyawan?"
        description="Karyawan ini akan dihapus secara permanen dari sistem. Pastikan karyawan ini tidak terkait dengan data transaksi penggajian aktif."
        confirmText="Hapus"
        isLoading={isDeleting}
      />
    </main>
  );
}
