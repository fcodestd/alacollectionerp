"use server";

import { db } from "@/lib/db";
import { karyawan } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function getKaryawanJahitReports() {
  try {
    const data = await db
      .select({
        id: karyawan.id,
        nama: karyawan.nama,
        jenis: karyawan.jenis,
      })
      .from(karyawan)
      .where(eq(karyawan.jenis, "borongan jahit"))
      .orderBy(desc(karyawan.dibuatPada));

    return { success: true, data };
  } catch (error) {
    console.error("Gagal memuat karyawan:", error);
    return { success: false, message: "Gagal memuat daftar karyawan." };
  }
}
