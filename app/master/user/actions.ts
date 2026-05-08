// app/master/user/actions.ts
"use server";

import { db } from "@/lib/db";
import { pengguna } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { userSchema, UserType } from "./validation";

// Ambil semua data pengguna
export async function getUsers() {
  try {
    const data = await db
      .select({
        id: pengguna.id,
        namaPengguna: pengguna.namaPengguna,
        namaLengkap: pengguna.namaLengkap,
        peran: pengguna.peran,
        dibuatPada: pengguna.dibuatPada,
      })
      .from(pengguna)
      .orderBy(desc(pengguna.dibuatPada));

    return { success: true, data };
  } catch (error) {
    console.error("Gagal mengambil data user:", error);
    return { success: false, message: "Gagal mengambil data user" };
  }
}

// Simpan User (Create & Update)
export async function simpanUser(values: UserType) {
  try {
    const parsed = userSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, message: "Validasi gagal!" };
    }

    const { id, namaPengguna, namaLengkap, kataSandi, peran } = parsed.data;

    if (id) {
      // PROSES UPDATE
      const updateData: any = { namaPengguna, namaLengkap, peran };

      // Jika kata sandi diisi saat update, hash dan masukkan ke data update
      if (kataSandi && kataSandi.length >= 6) {
        updateData.kataSandi = await bcrypt.hash(kataSandi, 10);
      }

      await db.update(pengguna).set(updateData).where(eq(pengguna.id, id));
      return { success: true, message: "Data pengguna berhasil diperbarui" };
    } else {
      // PROSES INSERT
      // Pastikan kata sandi ada untuk user baru (sudah divalidasi oleh Zod)
      const hashedPassword = await bcrypt.hash(kataSandi!, 10);

      await db.insert(pengguna).values({
        namaPengguna,
        namaLengkap,
        kataSandi: hashedPassword,
        peran,
      });
      return { success: true, message: "Pengguna baru berhasil ditambahkan" };
    }
  } catch (error: any) {
    console.error("Gagal menyimpan user:", error);
    // Cek jika username duplikat (Error code dari Postgres)
    if (error.code === "23505") {
      return {
        success: false,
        message: "Nama pengguna sudah digunakan. Pilih yang lain.",
      };
    }
    return { success: false, message: "Terjadi kesalahan pada server" };
  }
}

// Hapus User
export async function hapusUser(id: number) {
  try {
    await db.delete(pengguna).where(eq(pengguna.id, id));
    return { success: true, message: "Pengguna berhasil dihapus" };
  } catch (error) {
    console.error("Gagal menghapus user:", error);
    return { success: false, message: "Gagal menghapus pengguna" };
  }
}
