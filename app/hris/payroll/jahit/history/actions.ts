"use server";

import { db } from "@/lib/db";
import {
  gajiBoronganJahit,
  itemGajiBoronganJahit,
  karyawan,
  produk,
} from "@/lib/schema";
import { eq, desc, ilike, and, gte, lte } from "drizzle-orm";

export async function getRiwayatJahit(periode: string, searchKode: string) {
  try {
    const conditions = [];

    // 1. Filter by Kode
    if (searchKode && searchKode.trim() !== "") {
      conditions.push(ilike(gajiBoronganJahit.kode, `%${searchKode}%`));
    }

    // 2. Filter by Periode (WIB)
    const nowWib = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
    );

    const createWibDate = (y: number, m: number, d: number, isEnd = false) => {
      const yyyy = y;
      const mm = String(m + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      const time = isEnd ? "23:59:59" : "00:00:00";
      return new Date(`${yyyy}-${mm}-${dd}T${time}+07:00`);
    };

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (periode === "minggu_ini") {
      const day = nowWib.getDay() || 7;
      const startWib = new Date(nowWib);
      startWib.setDate(nowWib.getDate() - day + 1); // Senin
      startDate = createWibDate(
        startWib.getFullYear(),
        startWib.getMonth(),
        startWib.getDate(),
      );

      const endWib = new Date(startWib);
      endWib.setDate(startWib.getDate() + 6); // Minggu
      endDate = createWibDate(
        endWib.getFullYear(),
        endWib.getMonth(),
        endWib.getDate(),
        true,
      );
    } else if (periode.includes("-")) {
      // Jika yang masuk adalah format YYYY-MM dari input type="month"
      const parts = periode.split("-");
      if (parts.length === 2) {
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]) - 1;

        startDate = createWibDate(y, m, 1);
        const lastDay = new Date(y, m + 1, 0).getDate();
        endDate = createWibDate(y, m, lastDay, true);
      }
    }

    if (startDate && endDate) {
      conditions.push(gte(gajiBoronganJahit.dibuatPada, startDate));
      conditions.push(lte(gajiBoronganJahit.dibuatPada, endDate));
    }

    // Eksekusi Query
    let query = db
      .select({
        id: gajiBoronganJahit.id,
        kode: gajiBoronganJahit.kode,
        tanggal: gajiBoronganJahit.dibuatPada,
        totalKeseluruhan: gajiBoronganJahit.totalKeseluruhan,
        karyawanNama: karyawan.nama,
      })
      .from(gajiBoronganJahit)
      .innerJoin(karyawan, eq(gajiBoronganJahit.karyawanId, karyawan.id))
      .orderBy(desc(gajiBoronganJahit.dibuatPada));

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const data = await query;
    return { success: true, data };
  } catch (error) {
    console.error("Gagal mengambil riwayat:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data.",
    };
  }
}

export async function getDetailRiwayat(headerId: number) {
  try {
    const data = await db
      .select({
        id: itemGajiBoronganJahit.id,
        namaProduk: produk.nama,
        harga: itemGajiBoronganJahit.harga,
        kuantitas: itemGajiBoronganJahit.kuantitas,
        subtotal: itemGajiBoronganJahit.subtotal,
      })
      .from(itemGajiBoronganJahit)
      .innerJoin(produk, eq(itemGajiBoronganJahit.produkId, produk.id))
      .where(eq(itemGajiBoronganJahit.headerId, headerId));

    return { success: true, data };
  } catch (error) {
    console.error("Gagal mengambil detail:", error);
    return { success: false, message: "Gagal memuat detail produk." };
  }
}
