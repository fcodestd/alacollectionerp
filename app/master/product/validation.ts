// app/master/product/validation.ts
import { z } from "zod";

export const produkSchema = z.object({
  id: z.number().optional(),
  nama: z.string().min(3, { message: "Nama produk minimal 3 karakter." }),
  hargaBorongan: z.coerce
    .number({
      required_error: "Harga borongan wajib diisi.",
      invalid_type_error: "Harga harus berupa angka.",
    })
    .min(0, { message: "Harga tidak boleh negatif." }),
});

export type ProdukType = z.infer<typeof produkSchema>;
