"use server";

import { db } from "@/lib/db";
import {
  karyawan,
  produk,
  gajiBoronganJahit,
  itemGajiBoronganJahit,
} from "@/lib/schema";
import { eq, ilike } from "drizzle-orm";
import { payrollJahitSchema, PayrollJahitType } from "./validation";

// 1. Get Karyawan Jahit
export async function getKaryawanJahit() {
  try {
    const data = await db
      .select()
      .from(karyawan)
      .where(eq(karyawan.jenis, "borongan jahit"));
    return { success: true, data };
  } catch (error) {
    return { success: false, message: "Gagal mengambil data karyawan." };
  }
}

// 2. Live Search Produk
export async function cariProduk(query: string) {
  try {
    if (!query) return { success: true, data: [] };

    const data = await db
      .select()
      .from(produk)
      .where(ilike(produk.nama, `%${query}%`))
      .limit(5);

    return { success: true, data };
  } catch (error) {
    return { success: false, message: "Gagal mencari produk." };
  }
}

// 3. Finalisasi Simpan ke DB dengan db.transaction
export async function simpanPayrollJahit(values: PayrollJahitType) {
  try {
    const parsed = payrollJahitSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, message: "Validasi data gagal." };
    }

    const { karyawanId, operatorId, totalKeseluruhan, items } = parsed.data;

    // Dapatkan waktu saat ini dengan patokan Asia/Jakarta (WIB)
    const wibOptions = { timeZone: "Asia/Jakarta" };
    const nowWib = new Date(new Date().toLocaleString("en-US", wibOptions));

    const yy = nowWib.getFullYear().toString().slice(-2);
    const mm = String(nowWib.getMonth() + 1).padStart(2, "0");
    const dd = String(nowWib.getDate()).padStart(2, "0");

    // Format: JHT-YYMMDD-XXXX
    const dateCode = `${yy}${mm}${dd}`;
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const kodePayroll = `JHT-${dateCode}-${randomCode}`;

    // Jalankan Transaction Database
    await db.transaction(async (tx) => {
      // Insert Header
      const headerResult = await tx
        .insert(gajiBoronganJahit)
        .values({
          kode: kodePayroll,
          karyawanId,
          operatorId,
          totalKeseluruhan: totalKeseluruhan.toString(),
        })
        .returning({ id: gajiBoronganJahit.id });

      const headerId = headerResult[0].id;

      // Siapkan array data items
      const itemsToInsert = items.map((item) => ({
        headerId,
        produkId: item.produkId,
        harga: item.harga.toString(),
        kuantitas: item.kuantitas,
        subtotal: item.subtotal.toString(),
      }));

      // Insert Items
      await tx.insert(itemGajiBoronganJahit).values(itemsToInsert);
    });

    return { success: true, message: "Data penggajian berhasil disimpan!" };
  } catch (error) {
    console.error("Gagal simpan payroll dengan transaksi:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memproses transaksi database.",
    };
  }
}
