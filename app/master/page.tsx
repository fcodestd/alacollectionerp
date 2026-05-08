"use client";

import { useAuthStore } from "@/lib/store/use-auth-store";

export default function MasterDashboard() {
  const { user } = useAuthStore();

  return (
    <main className="p-6 md:p-12 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Selamat Datang,{" "}
          <span className="text-primary">
            {user?.namaLengkap || "Superadmin"}
          </span>
          !
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ini adalah panel kendali utama ERP Ala Collection. Silakan gunakan
          menu <strong className="text-foreground">Master</strong> di navigasi
          atas untuk mengelola Data User, Karyawan, dan Produk.
        </p>
      </div>
    </main>
  );
}
