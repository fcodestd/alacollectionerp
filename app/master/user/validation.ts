// app/master/user/validation.ts
import { z } from "zod";

export const userSchema = z
  .object({
    id: z.number().optional(),
    namaPengguna: z
      .string()
      .min(3, { message: "Nama pengguna minimal 3 karakter." }),
    namaLengkap: z
      .string()
      .min(3, { message: "Nama lengkap minimal 3 karakter." }),
    kataSandi: z.string().optional(),
    peran: z.enum(
      ["superadmin", "mandor produksi", "inventaris", "HR"],
      {
        required_error: "Silakan pilih peran pengguna.",
      },
    ),
  })
  .refine(
    (data) => {
      // Jika membuat user baru (tidak ada id), kata sandi wajib diisi minimal 6 karakter
      if (!data.id && (!data.kataSandi || data.kataSandi.length < 6)) {
        return false;
      }
      return true;
    },
    {
      message: "Kata sandi wajib diisi minimal 6 karakter untuk pengguna baru.",
      path: ["kataSandi"], // Error akan diarahkan ke field kataSandi
    },
  );

export type UserType = z.infer<typeof userSchema>;
