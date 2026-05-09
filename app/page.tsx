"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock, User, Scissors } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

import { processLogin } from "./auth-actions";
import { loginSchema } from "./auth-validation";
import { useAuthStore } from "@/lib/store/use-auth-store";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const loginAction = useAuthStore((state) => state.login);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      namaPengguna: "",
      kataSandi: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);

    const response = await processLogin(values);

    if (response.success && response.data) {
      toast.success(`Selamat datang kembali, ${response.data.namaLengkap}!`);
      loginAction(response.data);

      // Routing berdasarkan peran spesifik
      switch (response.data.peran) {
        case "superadmin":
          router.push("/master");
          break;
        case "mandor produksi":
          router.push("/manufacture");
          break;
        case "inventaris":
          router.push("/inventory");
          break;
        case "HR":
          router.push("/hris");
          break;
        default:
          router.push("/"); 
      }
    } else {
      toast.error(
        response.message || "Gagal masuk. Periksa kembali kredensial Anda.",
      );
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Sisi Kiri - Branding Ala Collection */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 flex-col justify-between p-12 text-zinc-50 relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent"></div>

        <div className="relative z-10 flex items-center gap-3">
          {/* <div className="p-2 bg-primary rounded-lg shadow-lg">
            <Scissors className="h-6 w-6 text-primary-foreground" />
          </div> */}
          <span className="text-2xl font-bold tracking-wider">
            ALA COLLECTION
          </span>
        </div>

        <div className="relative z-10 space-y-5 max-w-lg">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-tight">
            Pusat Kendali <br /> Operasional Terpadu
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Platform ERP untuk mengendalikan seluruh siklus bisnis. Mulai dari
            manajemen manufaktur, inventaris & penjualan, perhitungan gaji
            borongan dan harian, hingga pelaporan keuangan.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-1 text-sm text-zinc-500">
          <span className="font-medium text-zinc-400">
            Enterprise Resource Planning v1.0
          </span>
          <span>
            &copy; {new Date().getFullYear()} Ala Collection. All rights
            reserved.
          </span>
        </div>
      </div>

      {/* Sisi Kanan - Form Login */}
      <div className="w-full lg:w-1/2 flex flex-col relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight">
                Selamat Datang
              </h2>
              <p className="text-muted-foreground">
                Silakan masukkan kredensial Anda untuk mengakses aplikasi.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="namaPengguna"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Pengguna</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Ketik nama pengguna..."
                            className="pl-10 h-12 bg-muted/50"
                            autoComplete="username"
                            disabled={isLoading}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kataSandi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kata Sandi</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 h-12 bg-muted/50"
                            autoComplete="current-password"
                            disabled={isLoading}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-md font-semibold mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    "Masuk ke Dashboard"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
