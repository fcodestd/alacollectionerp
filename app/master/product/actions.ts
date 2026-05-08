// app/master/product/actions.ts
"use server";

import { db } from "@/lib/db";
import { produk } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { produkSchema, ProdukType } from "./validation";

// Ambil semua data produk induk
export async function getProduk() {
  try {
    const data = await db
      .select()
      .from(produk)
      .orderBy(desc(produk.dibuatPada));

    return { success: true, data };
  } catch (error) {
    console.error("Gagal mengambil data produk:", error);
    return { success: false, message: "Gagal mengambil data produk" };
  }
}

// Simpan Produk (Create & Update)
export async function simpanProduk(values: ProdukType) {
  try {
    const parsed = produkSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, message: "Validasi gagal!" };
    }

    const { id, nama, hargaBorongan } = parsed.data;

    if (id) {
      // UPDATE
      await db
        .update(produk)
        .set({
          nama,
          hargaBorongan: hargaBorongan.toString(), // Konversi ke format numeric Postgres
        })
        .where(eq(produk.id, id));
      return { success: true, message: "Produk berhasil diperbarui" };
    } else {
      // INSERT
      await db.insert(produk).values({
        nama,
        hargaBorongan: hargaBorongan.toString(),
      });
      return { success: true, message: "Produk baru berhasil ditambahkan" };
    }
  } catch (error) {
    console.error("Gagal menyimpan produk:", error);
    return { success: false, message: "Terjadi kesalahan pada server" };
  }
}

// Hapus Produk
export async function hapusProduk(id: number) {
  try {
    await db.delete(produk).where(eq(produk.id, id));
    return { success: true, message: "Produk berhasil dihapus" };
  } catch (error: any) {
    console.error("Gagal menghapus produk:", error);

    // Cegah penghapusan jika produk sedang dipakai di tabel lain (Foreign Key constraint)
    if (error.code === "23503") {
      return {
        success: false,
        message:
          "Gagal! Produk ini tidak bisa dihapus karena sudah digunakan dalam transaksi / varian.",
      };
    }
    return { success: false, message: "Gagal menghapus produk" };
  }
}
