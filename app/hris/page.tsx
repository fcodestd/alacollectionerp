"use client";

import Link from "next/link";
import { ArrowRight, Scissors, Layers, CalendarDays } from "lucide-react";
import { useAuthStore } from "@/lib/store/use-auth-store";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function HrisDashboard() {
  const { user } = useAuthStore();

  const quickLinks = [
    {
      title: "Gaji Borongan Jahit",
      description: "Hitung dan kelola pembayaran hasil jahitan per produk.",
      icon: Scissors,
      href: "/hris/payroll/jahit",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Gaji Borongan Potong",
      description:
        "Kelola batch potong kain berdasarkan roll dan hasil potong.",
      icon: Layers,
      href: "/hris/payroll/potong",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Gaji Harian & Packing",
      description: "Absensi harian, perhitungan gaji pokok, lembur, dan bonus.",
      icon: CalendarDays,
      href: "/hris/payroll/harian",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="space-y-2 mt-4 md:mt-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Halo, {user?.namaLengkap || "Tim Personalia"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Pilih modul penggajian di bawah ini untuk mulai mencatat transaksi
          harian, mengelola absensi, atau menghitung tarif borongan.
        </p>
      </div>

      {/* Quick Links Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-4">
        {quickLinks.map((link) => (
          <Link
            key={link.title}
            href={link.href}
            className="group outline-none"
          >
            <Card className="h-full relative overflow-hidden transition-all duration-300 hover:border-foreground/30 hover:shadow-md dark:hover:border-foreground/40 bg-background/50 backdrop-blur-sm">
              {/* Vercel-style subtle gradient hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="space-y-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${link.bg}`}
                >
                  <link.icon className={`h-6 w-6 ${link.color}`} />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-xl flex items-center justify-between group-hover:text-primary transition-colors">
                    {link.title}
                    <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {link.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
