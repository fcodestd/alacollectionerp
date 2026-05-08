// app/auth-actions.ts
"use server";

import { db } from "@/lib/db";
import { pengguna } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { loginSchema } from "./auth-validation";

export async function processLogin(values: unknown) {
  try {
    // 1. Validasi input dengan Zod di Server
    const validatedFields = loginSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validasi gagal. Periksa kembali input Anda.",
      };
    }

    const { namaPengguna, kataSandi } = validatedFields.data;

    // 2. Cek User di Database
    const userResult = await db
      .select()
      .from(pengguna)
      .where(eq(pengguna.namaPengguna, namaPengguna))
      .limit(1);

    if (userResult.length === 0) {
      return {
        success: false,
        message: "Nama pengguna atau kata sandi salah!",
      };
    }

    const user = userResult[0];

    // 3. Verifikasi Password
    const isMatch = await bcrypt.compare(kataSandi, user.kataSandi);
    if (!isMatch) {
      return {
        success: false,
        message: "Nama pengguna atau kata sandi salah!",
      };
    }

    // 4. Sukses Login
    return {
      success: true,
      data: {
        id: user.id,
        namaPengguna: user.namaPengguna,
        namaLengkap: user.namaLengkap,
        peran: user.peran,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Terjadi kesalahan pada server." };
  }
}
