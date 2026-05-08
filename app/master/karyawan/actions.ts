// app/master/karyawan/actions.ts
"use server";

import { db } from "@/lib/db";
import { karyawan } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { karyawanSchema, KaryawanType } from "./validation";

export async function getKaryawan() {
  try {
    const data = await db
      .select()
      .from(karyawan)
      .orderBy(desc(karyawan.dibuatPada));
    return { success: true, data };
  } catch (error) {
    console.error("Gagal mengambil data karyawan:", error);
    return { success: false, message: "Gagal mengambil data karyawan" };
  }
}

export async function simpanKaryawan(values: KaryawanType) {
  try {
    const parsed = karyawanSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, message: "Validasi gagal!" };
    }

    const { id, nama, jenis } = parsed.data;

    if (id) {
      await db.update(karyawan).set({ nama, jenis }).where(eq(karyawan.id, id));
      return { success: true, message: "Karyawan berhasil diperbarui" };
    } else {
      await db.insert(karyawan).values({ nama, jenis });
      return { success: true, message: "Karyawan berhasil ditambahkan" };
    }
  } catch (error) {
    console.error("Gagal menyimpan karyawan:", error);
    return { success: false, message: "Terjadi kesalahan pada server" };
  }
}

export async function hapusKaryawan(id: number) {
  try {
    await db.delete(karyawan).where(eq(karyawan.id, id));
    return { success: true, message: "Karyawan berhasil dihapus" };
  } catch (error) {
    console.error("Gagal menghapus karyawan:", error);
    return { success: false, message: "Gagal menghapus karyawan" };
  }
}
