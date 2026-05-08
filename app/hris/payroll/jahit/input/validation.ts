import { z } from "zod";

export const itemJahitSchema = z.object({
  produkId: z.number(),
  harga: z.number(),
  kuantitas: z.number().min(1, "Kuantitas minimal 1"),
  subtotal: z.number(),
});

export const payrollJahitSchema = z.object({
  karyawanId: z.number({ required_error: "Karyawan belum dipilih." }),
  operatorId: z.number(),
  totalKeseluruhan: z.number(),
  items: z
    .array(itemJahitSchema)
    .min(1, "Minimal pilih 1 produk untuk diproses."),
});

export type PayrollJahitType = z.infer<typeof payrollJahitSchema>;
