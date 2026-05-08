"use server";

import { db } from "@/lib/db";
import {
  gajiBoronganJahit,
  itemGajiBoronganJahit,
  karyawan,
  produk,
} from "@/lib/schema";
import { eq, and, gte, lte } from "drizzle-orm";

// Helper mendapatkan Date objek murni Asia/Jakarta (WIB)
const getNowWib = () =>
  new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

const createWibBoundaries = (dateObj: Date, isEnd = false) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  const time = isEnd ? "23:59:59" : "00:00:00";
  // Format ISO dengan offset +07:00 (WIB)
  return new Date(`${y}-${m}-${d}T${time}+07:00`);
};

export async function getInfoKaryawan(id: number) {
  const data = await db
    .select()
    .from(karyawan)
    .where(eq(karyawan.id, id))
    .limit(1);
  return data[0];
}

// Ambil Kinerja Harian (Digunakan untuk List di Page)
export async function getKinerjaHarian(
  karyawanId: number,
  filterType: string,
  customMonth: string,
) {
  try {
    const nowWib = getNowWib();
    let startDate: Date;
    let endDate: Date;

    if (filterType === "7_hari") {
      // Hitung 6 hari sebelum hari ini (Total 7 hari termasuk hari ini)
      const startWib = new Date(nowWib);
      startWib.setDate(nowWib.getDate() - 6);

      startDate = createWibBoundaries(startWib);
      endDate = createWibBoundaries(nowWib, true);
    } else {
      // Filter Pilih Bulan (YYYY-MM)
      const [y, m] = customMonth.split("-").map(Number);
      startDate = createWibBoundaries(new Date(y, m - 1, 1));

      const lastDay = new Date(y, m, 0).getDate();
      endDate = createWibBoundaries(new Date(y, m - 1, lastDay), true);
    }

    const rawData = await db
      .select()
      .from(gajiBoronganJahit)
      .where(
        and(
          eq(gajiBoronganJahit.karyawanId, karyawanId),
          gte(gajiBoronganJahit.dibuatPada, startDate),
          lte(gajiBoronganJahit.dibuatPada, endDate),
        ),
      );

    const grouped: Record<string, any> = {};
    rawData.forEach((row) => {
      // Pastikan konversi ke key tanggal menggunakan WIB
      const d = new Date(
        row.dibuatPada.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
      );
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      if (!grouped[key]) {
        grouped[key] = {
          tanggal: key,
          totalUpah: 0,
          totalTransaksi: 0,
          headerIds: [],
        };
      }
      grouped[key].totalUpah += Number(row.totalKeseluruhan);
      grouped[key].totalTransaksi += 1;
      grouped[key].headerIds.push(row.id);
    });

    return {
      success: true,
      data: Object.values(grouped).sort((a, b) =>
        b.tanggal.localeCompare(a.tanggal),
      ),
    };
  } catch (error) {
    console.error("Gagal memuat kinerja:", error);
    return { success: false, message: "Gagal memuat data kinerja harian." };
  }
}

export async function getDetailItemHarian(headerIds: number[]) {
  try {
    const results = await Promise.all(
      headerIds.map((hId) =>
        db
          .select({
            namaProduk: produk.nama,
            harga: itemGajiBoronganJahit.harga,
            kuantitas: itemGajiBoronganJahit.kuantitas,
            subtotal: itemGajiBoronganJahit.subtotal,
          })
          .from(itemGajiBoronganJahit)
          .innerJoin(produk, eq(itemGajiBoronganJahit.produkId, produk.id))
          .where(eq(itemGajiBoronganJahit.headerId, hId)),
      ),
    );

    const flatItems = results.flat();
    const merged: Record<string, any> = {};
    flatItems.forEach((item) => {
      if (!merged[item.namaProduk])
        merged[item.namaProduk] = { ...item, kuantitas: 0, subtotal: 0 };
      merged[item.namaProduk].kuantitas += item.kuantitas;
      merged[item.namaProduk].subtotal += Number(item.subtotal);
    });

    return { success: true, data: Object.values(merged) };
  } catch (error) {
    return { success: false, message: "Gagal memuat detail item." };
  }
}

// KHUSUS UNTUK SLIP: Senin - Minggu WIB
export async function getSlipGajiMingguIni(karyawanId: number) {
  try {
    const nowWib = getNowWib();
    const day = nowWib.getDay() || 7;

    const startWib = new Date(nowWib);
    startWib.setDate(nowWib.getDate() - day + 1);
    const startDate = createWibBoundaries(startWib);

    const endWib = new Date(startWib);
    endWib.setDate(startWib.getDate() + 6);
    const endDate = createWibBoundaries(endWib, true);

    const rawItems = await db
      .select({
        tanggal: gajiBoronganJahit.dibuatPada,
        namaProduk: produk.nama,
        harga: itemGajiBoronganJahit.harga,
        kuantitas: itemGajiBoronganJahit.kuantitas,
        subtotal: itemGajiBoronganJahit.subtotal,
      })
      .from(itemGajiBoronganJahit)
      .innerJoin(
        gajiBoronganJahit,
        eq(itemGajiBoronganJahit.headerId, gajiBoronganJahit.id),
      )
      .innerJoin(produk, eq(itemGajiBoronganJahit.produkId, produk.id))
      .where(
        and(
          eq(gajiBoronganJahit.karyawanId, karyawanId),
          gte(gajiBoronganJahit.dibuatPada, startDate),
          lte(gajiBoronganJahit.dibuatPada, endDate),
        ),
      );

    let grandTotal = 0;
    const groupedByDate: Record<string, any> = {};

    rawItems.forEach((item) => {
      const d = new Date(
        item.tanggal.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
      );
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          tanggal: dateKey,
          subtotalHarian: 0,
          items: {},
        };
      }

      if (!groupedByDate[dateKey].items[item.namaProduk]) {
        groupedByDate[dateKey].items[item.namaProduk] = {
          namaProduk: item.namaProduk,
          harga: Number(item.harga),
          kuantitas: 0,
          subtotal: 0,
        };
      }

      groupedByDate[dateKey].items[item.namaProduk].kuantitas += item.kuantitas;
      groupedByDate[dateKey].items[item.namaProduk].subtotal += Number(
        item.subtotal,
      );
      groupedByDate[dateKey].subtotalHarian += Number(item.subtotal);
      grandTotal += Number(item.subtotal);
    });

    const riwayatHarian = Object.values(groupedByDate)
      .map((day: any) => ({
        ...day,
        items: Object.values(day.items),
      }))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    return {
      success: true,
      data: {
        tanggalMulai: startDate.toISOString(),
        tanggalAkhir: endDate.toISOString(),
        riwayatHarian,
        grandTotal,
      },
    };
  } catch (error) {
    return { success: false, message: "Gagal memuat slip gaji." };
  }
}
