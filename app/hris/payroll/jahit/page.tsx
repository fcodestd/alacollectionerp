"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  FileEdit,
  History,
  FileSpreadsheet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function PayrollJahitEntryPage() {
  const router = useRouter();

  const subMenus = [
    {
      title: "Input Data Jahit",
      description: "Catat hasil jahitan karyawan per produk untuk hari ini.",
      icon: FileEdit,
      href: "/hris/payroll/jahit/input",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Riwayat Transaksi",
      description:
        "Lihat riwayat pencatatan gaji borongan jahitan sebelumnya.",
      icon: History,
      href: "/hris/payroll/jahit/history",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Rekapan Gaji",
      description:
        "Cetak slip gaji borongan dan lihat akumulasi hasil per periode.",
      icon: FileSpreadsheet,
      href: "/hris/payroll/jahit/reports",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Tombol Kembali & Header */}
      <div className="flex flex-col items-start gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/hris")}
          className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Dashboard HRIS
        </Button>

        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Gaji Borongan Jahit
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
            Pusat pengelolaan upah borongan untuk divisi penjahitan. Pilih menu
            di bawah untuk melanjutkan proses.
          </p>
        </div>
      </div>

      {/* Grid Sub Menu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {subMenus.map((menu) => (
          <Link
            key={menu.title}
            href={menu.href}
            className="group outline-none"
          >
            <Card className="h-full relative overflow-hidden transition-all duration-300 hover:border-foreground/30 hover:shadow-md dark:hover:border-foreground/40 bg-background/50 backdrop-blur-sm">
              {/* Vercel-style hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="space-y-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${menu.bg}`}
                >
                  <menu.icon className={`h-6 w-6 ${menu.color}`} />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-xl flex items-center justify-between group-hover:text-primary transition-colors">
                    {menu.title}
                    <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {menu.description}
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
