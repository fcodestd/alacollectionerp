"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, UserCheck, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKaryawanJahitReports } from "./actions";

export default function ReportsJahitPage() {
  const router = useRouter();
  const [listKaryawan, setListKaryawan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKaryawan = async () => {
      const res = await getKaryawanJahitReports();
      if (res.success && res.data) {
        setListKaryawan(res.data);
      } else {
        toast.error(res.message);
      }
      setIsLoading(false);
    };
    fetchKaryawan();
  }, []);

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button
          variant="ghost"
          onClick={() => router.push("/hris/payroll/jahit")}
          className="px-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Rekapan & Laporan Jahit
          </h2>
          <p className="text-muted-foreground text-sm">
            Pilih tenaga penjahit untuk melihat detail kinerja dan cetak slip
            gaji.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : listKaryawan.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
          Belum ada data tenaga penjahit.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listKaryawan.map((k) => (
            <Card
              key={k.id}
              className="hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary bg-primary/10 w-fit px-2 py-1 rounded-md mb-2">
                      <UserCheck className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {k.jenis}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{k.nama}</h3>
                  </div>
                </div>
                <Button
                  className="w-full mt-6 group"
                  variant="outline"
                  onClick={() =>
                    router.push(`/hris/payroll/jahit/reports/${k.id}`)
                  }
                >
                  Lihat Kinerja
                  <TrendingUp className="ml-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
