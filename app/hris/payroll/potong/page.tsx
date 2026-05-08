"use client";

import { useRouter } from "next/navigation";
import { Wrench, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComingSoonPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center animate-in fade-in zoom-in-95 duration-500">
      {/* Ikon dengan efek glow/background halus */}
      <div className="relative flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-primary/10">
        <div className="absolute inset-0 rounded-full animate-ping bg-primary/20 opacity-50 duration-3000" />
        <Wrench className="w-10 h-10 text-primary" />
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
        Segera Hadir
      </h1>

      <p className="text-muted-foreground max-w-md mb-8 text-lg">
        Modul ini masih dalam tahap perakitan dan pengembangan. Nantikan pembaruannya dalam waktu dekat!
      </p>

      <Button
        variant="outline"
        size="lg"
        onClick={() => router.back()}
        className="group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Kembali ke Halaman Sebelumnya
      </Button>
    </div>
  );
}
