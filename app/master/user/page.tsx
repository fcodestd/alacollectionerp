// app/master/user/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Pencil, Trash2, ShieldAlert } from "lucide-react";
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
  FormDescription,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ConfirmDialog } from "@/components/confirm-dialog";

import { userSchema, UserType } from "./validation";
import { getUsers, simpanUser, hapusUser } from "./actions";

export default function UserPage() {
  const [dataUser, setDataUser] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State untuk Delete Dialog
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<UserType>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      namaPengguna: "",
      namaLengkap: "",
      kataSandi: "",
      peran: "HR",
    },
  });

  const isEditMode = !!form.watch("id");

  const loadData = async () => {
    setIsLoading(true);
    const res = await getUsers();
    if (res.success && res.data) {
      setDataUser(res.data);
    } else {
      toast.error("Gagal memuat data pengguna");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: UserType) => {
    setIsSaving(true);
    const res = await simpanUser(values);

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

    const res = await hapusUser(deleteId);
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
      namaPengguna: item.namaPengguna,
      namaLengkap: item.namaLengkap,
      kataSandi: "", // Kosongkan password saat edit
      peran: item.peran as any,
    });
    setIsDialogOpen(true);
  };

  const openAddModal = () => {
    form.reset({
      id: undefined,
      namaPengguna: "",
      namaLengkap: "",
      kataSandi: "",
      peran: "HR",
    });
    setIsDialogOpen(true);
  };

  return (
    <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen User</h2>
          <p className="text-muted-foreground">
            Kelola akun dan akses staf ke sistem ERP.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" /> Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Data User" : "Tambah User Baru"}
              </DialogTitle>
              <DialogDescription>
                Tentukan kredensial dan hak akses untuk pengguna ini.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 mt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="namaLengkap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Contoh: Budi Santoso"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="namaPengguna"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Contoh: budi.prod"
                            {...field}
                            disabled={isEditMode}
                          />
                        </FormControl>
                        {isEditMode && (
                          <FormDescription>
                            Username tidak bisa diubah.
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="kataSandi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Kata Sandi {isEditMode && "(Opsional)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {isEditMode
                          ? "Kosongkan jika tidak ingin mengubah kata sandi."
                          : "Gunakan minimal 6 karakter untuk keamanan."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="peran"
                  render={({ field }) => (
                    <FormItem className="space-y-3 pt-2 border-t">
                      <FormLabel className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-primary" />
                        Hak Akses (Role)
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                            <FormControl>
                              <RadioGroupItem value="HR" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full">
                              HR
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                            <FormControl>
                              <RadioGroupItem value="inventaris" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full">
                              Inventaris
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                            <FormControl>
                              <RadioGroupItem value="mandor produksi" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full">
                              Mandor Produksi
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3 bg-destructive/5 text-destructive cursor-pointer hover:bg-destructive/10 transition-colors">
                            <FormControl>
                              <RadioGroupItem value="superadmin" />
                            </FormControl>
                            <FormLabel className="font-semibold cursor-pointer w-full text-destructive">
                              Superadmin
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
                    "Simpan Pengguna"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : dataUser.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada data pengguna.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Peran</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataUser.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.namaLengkap}
                      </TableCell>
                      <TableCell>{item.namaPengguna}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.peran === "superadmin"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : item.peran === "mandor produksi"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : item.peran === "inventaris"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          }`}
                        >
                          {item.peran}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(item.id)}
                          disabled={item.namaPengguna === "superadmin"} // Mencegah superadmin bawaan dihapus
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
        title="Cabut Akses Pengguna?"
        description="Akun ini akan dihapus secara permanen dan pengguna tidak akan bisa lagi login ke dalam sistem ERP."
        confirmText="Hapus Akun"
        isLoading={isDeleting}
      />
    </main>
  );
}
