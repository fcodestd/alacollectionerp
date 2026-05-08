import { z } from "zod";

export const loginSchema = z.object({
  namaPengguna: z
    .string()
    .min(1, { message: "Nama pengguna wajib diisi." })
    .min(3, { message: "Nama pengguna minimal 3 karakter." }),
  kataSandi: z
    .string()
    .min(1, { message: "Kata sandi wajib diisi." })
    .min(6, { message: "Kata sandi minimal 6 karakter." }),
});
