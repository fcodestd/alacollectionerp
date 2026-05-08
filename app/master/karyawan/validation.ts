// lib/validations/karyawan.ts
import { z } from "zod";

export const karyawanSchema = z.object({
  id: z.number().optional(),
  nama: z.string().min(3, { message: "Nama karyawan minimal 3 karakter." }),
  // UPDATE: Memisahkan harian dan packing menjadi 4 jenis spesifik
  jenis: z.enum(["borongan jahit", "borongan potong", "harian", "packing"], {
    required_error: "Silakan pilih jenis karyawan.",
  }),
});

export type KaryawanType = z.infer<typeof karyawanSchema>;
