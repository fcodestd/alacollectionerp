// lib/schema.ts
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  numeric,
  integer,
  date,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Fungsi utilitas untuk Waktu Jakarta (WIB)
const getWaktuJakarta = () => {
  const dateStr = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  });
  return new Date(dateStr);
};

// ==========================================
// 1. PENGGUNA & KARYAWAN (AUTH & HR CORE)
// ==========================================
export const pengguna = pgTable("pengguna", {
  id: serial("id").primaryKey(),
  namaPengguna: varchar("nama_pengguna", { length: 50 }).notNull().unique(), // Unique otomatis di-index
  namaLengkap: varchar("nama_lengkap", { length: 100 }).notNull(),
  kataSandi: varchar("kata_sandi", { length: 255 }).notNull(),
  peran: varchar("peran", { length: 20 }).default("karyawan"),
  dibuatPada: timestamp("dibuat_pada").$defaultFn(getWaktuJakarta),
});

export const karyawan = pgTable(
  "karyawan",
  {
    id: serial("id").primaryKey(),
    nama: varchar("nama", { length: 100 }).notNull(),
    jenis: varchar("jenis", { length: 20 }).default("borongan"),
    penggunaId: integer("pengguna_id").references(() => pengguna.id, {
      onDelete: "set null",
    }),
    dibuatPada: timestamp("dibuat_pada").$defaultFn(getWaktuJakarta),
  },
  (table) => {
    return {
      penggunaIdIdx: index("karyawan_pengguna_id_idx").on(table.penggunaId),
    };
  },
);

// ==========================================
// 2. MASTER ATRIBUT & PENGATURAN
// ==========================================
export const satuan = pgTable("satuan", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 50 }).notNull(),
});

export const warna = pgTable("warna", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 50 }).notNull(),
});

export const ukuran = pgTable("ukuran", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 20 }).notNull(),
});

export const marketplace = pgTable("marketplace", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 100 }).notNull(),
  persentaseFee: numeric("persentase_fee", { precision: 5, scale: 2 })
    .notNull()
    .default("0.00"),
});

// ==========================================
// 3. MASTER PRODUK & VARIAN (BARANG JADI)
// ==========================================
export const produk = pgTable("produk", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 100 }).notNull(),
  hargaBorongan: numeric("harga_borongan", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  dibuatPada: timestamp("dibuat_pada").$defaultFn(getWaktuJakarta),
});

export const varianProduk = pgTable(
  "varian_produk",
  {
    id: serial("id").primaryKey(),
    barcode: varchar("barcode", { length: 100 }).notNull().unique(), // Unique otomatis di-index
    produkId: integer("produk_id")
      .notNull()
      .references(() => produk.id, { onDelete: "cascade" }),
    warnaId: integer("warna_id")
      .notNull()
      .references(() => warna.id, { onDelete: "restrict" }),
    ukuranId: integer("ukuran_id")
      .notNull()
      .references(() => ukuran.id, { onDelete: "restrict" }),
    stok: integer("stok").notNull().default(0),
    hpp: numeric("hpp", { precision: 12, scale: 2 }).notNull().default("0.00"),
    hargaJual: numeric("harga_jual", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    dibuatPada: timestamp("dibuat_pada").$defaultFn(getWaktuJakarta),
  },
  (table) => {
    return {
      produkIdIdx: index("varian_produk_id_idx").on(table.produkId),
    };
  },
);

// ==========================================
// 4. MASTER BAHAN BAKU & INVENTARIS MATERIAL
// ==========================================
export const bahanBaku = pgTable("bahan_baku", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 100 }).notNull(),
  tipe: varchar("tipe", { length: 50 }).notNull(),
  satuanDasarId: integer("satuan_dasar_id")
    .notNull()
    .references(() => satuan.id, { onDelete: "restrict" }),
  warnaId: integer("warna_id").references(() => warna.id, {
    onDelete: "set null",
  }),
  harga: numeric("harga", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
});

export const inventarisBahanBaku = pgTable(
  "inventaris_bahan_baku",
  {
    id: serial("id").primaryKey(),
    bahanBakuId: integer("bahan_baku_id")
      .notNull()
      .references(() => bahanBaku.id, { onDelete: "cascade" }),
    satuanId: integer("satuan_id")
      .notNull()
      .references(() => satuan.id, { onDelete: "restrict" }),
    stok: numeric("stok", { precision: 12, scale: 4 })
      .notNull()
      .default("0.0000"),
  },
  (table) => {
    return {
      bahanBakuIdIdx: index("inv_bahan_baku_id_idx").on(table.bahanBakuId),
    };
  },
);

// ==========================================
// 5. BILL OF MATERIALS (BOM)
// ==========================================
export const bom = pgTable(
  "bom",
  {
    id: serial("id").primaryKey(),
    varianId: integer("varian_id")
      .notNull()
      .references(() => varianProduk.id, { onDelete: "cascade" }),
    totalBiaya: numeric("total_biaya", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    dibuatPada: timestamp("dibuat_pada").$defaultFn(getWaktuJakarta),
  },
  (table) => {
    return {
      varianIdIdx: index("bom_varian_id_idx").on(table.varianId),
    };
  },
);

export const itemBom = pgTable(
  "item_bom",
  {
    id: serial("id").primaryKey(),
    bomId: integer("bom_id")
      .notNull()
      .references(() => bom.id, { onDelete: "cascade" }),
    bahanBakuId: integer("bahan_baku_id")
      .notNull()
      .references(() => bahanBaku.id, { onDelete: "restrict" }),
    satuanId: integer("satuan_id")
      .notNull()
      .references(() => satuan.id, { onDelete: "restrict" }),
    kuantitas: numeric("kuantitas", { precision: 10, scale: 4 }).notNull(),
    harga: numeric("harga", { precision: 12, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => {
    return {
      bomIdIdx: index("item_bom_bom_id_idx").on(table.bomId),
      bahanBakuIdIdx: index("item_bom_bahan_baku_id_idx").on(table.bahanBakuId),
    };
  },
);

// ==========================================
// 6. SIKLUS PEMBELIAN (PO & TERIMA BAHAN)
// ==========================================
export const pesananPembelian = pgTable("pesanan_pembelian", {
  id: serial("id").primaryKey(),
  kode: varchar("kode", { length: 50 }).notNull().unique(),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => pengguna.id, { onDelete: "restrict" }),
  totalBiaya: numeric("total_biaya", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  dibuatPada: timestamp("dibuat_pada").$defaultFn(getWaktuJakarta),
});

export const itemPesananPembelian = pgTable(
  "item_pesanan_pembelian",
  {
    id: serial("id").primaryKey(),
    headerId: integer("header_id")
      .notNull()
      .references(() => pesananPembelian.id, { onDelete: "cascade" }),
    bahanBakuId: integer("bahan_baku_id")
      .notNull()
      .references(() => bahanBaku.id, { onDelete: "restrict" }),
    satuanId: integer("satuan_id")
      .notNull()
      .references(() => satuan.id, { onDelete: "restrict" }),
    kuantitas: numeric("kuantitas", { precision: 10, scale: 4 }).notNull(),
    harga: numeric("harga", { precision: 12, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => {
    return {
      headerIdIdx: index("item_po_header_id_idx").on(table.headerId),
      bahanBakuIdIdx: index("item_po_bahan_baku_id_idx").on(table.bahanBakuId),
    };
  },
);

export const terimaBahan = pgTable(
  "terima_bahan",
  {
    id: serial("id").primaryKey(),
    kode: varchar("kode", { length: 50 }).notNull().unique(),
    pesananPembelianId: integer("pesanan_pembelian_id")
      .notNull()
      .references(() => pesananPembelian.id, { onDelete: "restrict" }),
    operatorId: integer("operator_id")
      .notNull()
      .references(() => pengguna.id, { onDelete: "restrict" }),
    dibuatPada: timestamp("dibuat_pada").$defaultFn(getWaktuJakarta),
  },
  (table) => {
    return {
      pesananPembelianIdIdx: index("terima_bahan_po_id_idx").on(
        table.pesananPembelianId,
      ),
    };
  },
);

export const itemTerimaBahan = pgTable(
  "item_terima_bahan",
  {
    id: serial("id").primaryKey(),
    headerId: integer("header_id")
      .notNull()
      .references(() => terimaBahan.id, { onDelete: "cascade" }),
    bahanBakuId: integer("bahan_baku_id")
      .notNull()
      .references(() => bahanBaku.id, { onDelete: "restrict" }),
    satuanId: integer("satuan_id")
      .notNull()
      .references(() => satuan.id, { onDelete: "restrict" }),
    kuantitasHarapan: numeric("kuantitas_harapan", {
      precision: 10,
      scale: 4,
    }).notNull(),
    kuantitasAktual: numeric("kuantitas_aktual", {
      precision: 10,
      scale: 4,
    }).notNull(),
  },
  (table) => {
    return {
      headerIdIdx: index("item_terima_bahan_header_id_idx").on(table.headerId),
      bahanBakuIdIdx: index("item_terima_bahan_bahan_id_idx").on(
        table.bahanBakuId,
      ),
    };
  },
);

// ==========================================
// 7. SIKLUS MANUFAKTUR (MO & PRODUKSI MASUK)
// ==========================================
export const pesananManufaktur = pgTable("pesanan_manufaktur", {
  id: serial("id").primaryKey(),
  kode: varchar("kode", { length: 50 }).notNull().unique(),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => pengguna.id, { onDelete: "restrict" }),
  status: varchar("status", { length: 20 }).notNull().default("diproses"),
  totalBiayaHpp: numeric("total_biaya_hpp", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  dibuatPada: timestamp("dibuat_pada").$defaultFn(getWaktuJakarta),
});

export const itemPesananManufaktur = pgTable(
  "item_pesanan_manufaktur",
  {
    id: serial("id").primaryKey(),
    moId: integer("mo_id")
      .notNull()
      .references(() => pesananManufaktur.id, { onDelete: "cascade" }),
    varianId: integer("varian_id")
      .notNull()
      .references(() => varianProduk.id, { onDelete: "restrict" }),
    kuantitas: integer("kuantitas").notNull(),
    subtotalHpp: numeric("subtotal_hpp", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
  },
  (table) => {
    return {
      moIdIdx: index("item_mo_mo_id_idx").on(table.moId),
      varianIdIdx: index("item_mo_varian_id_idx").on(table.varianId),
    };
  },
);

export const bahanPesananManufaktur = pgTable(
  "bahan_pesanan_manufaktur",
  {
    id: serial("id").primaryKey(),
    moItemId: integer("mo_item_id")
      .notNull()
      .references(() => itemPesananManufaktur.id, { onDelete: "cascade" }),
    bahanBakuId: integer("bahan_baku_id")
      .notNull()
      .references(() => bahanBaku.id, { onDelete: "restrict" }),
    satuanId: integer("satuan_id")
      .notNull()
      .references(() => satuan.id, { onDelete: "restrict" }),
    kuantitas: numeric("kuantitas", { precision: 10, scale: 4 }).notNull(),
    hargaPerSatuan: numeric("harga_per_satuan", {
      precision: 12,
      scale: 2,
    }).notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => {
    return {
      moItemIdIdx: index("bahan_mo_item_id_idx").on(table.moItemId),
      bahanBakuIdIdx: index("bahan_mo_bahan_baku_id_idx").on(table.bahanBakuId),
    };
  },
);

export const produksiMasuk = pgTable(
  "produksi_masuk",
  {
    id: serial("id").primaryKey(),
    kode: varchar("kode", { length: 50 }).notNull().unique(),
    pesananManufakturId: integer("pesanan_manufaktur_id")
      .notNull()
      .references(() => pesananManufaktur.id, { onDelete: "restrict" }),
    operatorId: integer("operator_id")
      .notNull()
      .references(() => pengguna.id, { onDelete: "restrict" }),
    totalKuantitas: integer("total_kuantitas").notNull().default(0),
    totalBiaya: numeric("total_biaya", { precision: 12, scale: 2 }) // REVISI: diubah jadi totalBiaya
      .notNull()
      .default("0.00"),
    dibuatPada: timestamp("dibuat_pada").$defaultFn(getWaktuJakarta),
  },
  (table) => {
    return {
      pesananManufakturIdIdx: index("prod_masuk_mo_id_idx").on(
        table.pesananManufakturId,
      ),
    };
  },
);

export const itemProduksiMasuk = pgTable(
  "item_produksi_masuk",
  {
    id: serial("id").primaryKey(),
    headerId: integer("header_id")
      .notNull()
      .references(() => produksiMasuk.id, { onDelete: "cascade" }),
    varianId: integer("varian_id")
      .notNull()
      .references(() => varianProduk.id, { onDelete: "restrict" }),
    kuantitasHarapan: integer("kuantitas_harapan").notNull().default(0),
    kuantitasAktual: integer("kuantitas_aktual").notNull().default(0),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
  },
  (table) => {
    return {
      headerIdIdx: index("item_prod_masuk_header_id_idx").on(table.headerId),
      varianIdIdx: index("item_prod_masuk_varian_id_idx").on(table.varianId),
    };
  },
);

// ==========================================
// 8. HR TRANSACTIONS (GAJI BORONGAN JAHIT, DLL)
// ==========================================
export const gajiBoronganJahit = pgTable("gaji_borongan_jahit", {
  id: serial("id").primaryKey(),
  kode: varchar("kode", { length: 20 }),
  karyawanId: integer("karyawan_id").references(() => karyawan.id, {
    onDelete: "restrict",
  }),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => pengguna.id, { onDelete: "restrict" }),
  totalKeseluruhan: numeric("total_keseluruhan", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  dibuatPada: timestamp("dibuat_pada").$defaultFn(getWaktuJakarta),
});

export const itemGajiBoronganJahit = pgTable(
  "item_gaji_borongan_jahit",
  {
    id: serial("id").primaryKey(),
    headerId: integer("header_id")
      .notNull()
      .references(() => gajiBoronganJahit.id, { onDelete: "cascade" }),
    produkId: integer("produk_id")
      .notNull()
      .references(() => produk.id, { onDelete: "restrict" }),
    harga: numeric("harga", { precision: 10, scale: 2 }).notNull(),
    kuantitas: integer("kuantitas").notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => {
    return {
      headerIdIdx: index("item_gaji_header_id_idx").on(table.headerId),
      produkIdIdx: index("item_gaji_produk_id_idx").on(table.produkId),
    };
  },
);

export const batchPotong = pgTable("batch_potong", {
  id: serial("id").primaryKey(),
  kodeBatch: varchar("kode_batch", { length: 50 }).notNull().unique(),
  tanggal: date("tanggal").notNull(),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => pengguna.id, { onDelete: "restrict" }),
  totalKeseluruhan: numeric("total_keseluruhan", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
});

export const itemBatchPotong = pgTable(
  "item_batch_potong",
  {
    id: serial("id").primaryKey(),
    batchId: integer("batch_id")
      .notNull()
      .references(() => batchPotong.id, { onDelete: "cascade" }),
    karyawanId: integer("karyawan_id")
      .notNull()
      .references(() => karyawan.id, { onDelete: "restrict" }),
    kuantitas: numeric("kuantitas", { precision: 10, scale: 2 }).notNull(),
    satuanId: integer("satuan_id")
      .notNull()
      .references(() => satuan.id, { onDelete: "restrict" }),
    harga: numeric("harga", { precision: 10, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => {
    return {
      batchIdIdx: index("item_batch_potong_batch_id_idx").on(table.batchId),
      karyawanIdIdx: index("item_batch_potong_karyawan_id_idx").on(
        table.karyawanId,
      ),
    };
  },
);

export const batchHarian = pgTable("batch_harian", {
  id: serial("id").primaryKey(),
  kodeBatch: varchar("kode_batch", { length: 50 }).notNull().unique(),
  tanggal: date("tanggal").notNull(),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => pengguna.id, { onDelete: "restrict" }),
  totalKeseluruhan: numeric("total_keseluruhan", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
});

export const itemBatchHarian = pgTable(
  "item_batch_harian",
  {
    id: serial("id").primaryKey(),
    batchId: integer("batch_id")
      .notNull()
      .references(() => batchHarian.id, { onDelete: "cascade" }),
    karyawanId: integer("karyawan_id")
      .notNull()
      .references(() => karyawan.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 20 }).notNull().default("hadir"),
    gajiPokok: numeric("gaji_pokok", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    potongan: numeric("potongan", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    bonus: numeric("bonus", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    alasanPotongan: varchar("alasan_potongan", { length: 255 }),
    alasanBonus: varchar("alasan_bonus", { length: 255 }),
  },
  (table) => {
    return {
      batchIdIdx: index("item_batch_harian_batch_id_idx").on(table.batchId),
      karyawanIdIdx: index("item_batch_harian_karyawan_id_idx").on(
        table.karyawanId,
      ),
    };
  },
);

// ==========================================
// 9. TRANSAKSI GUDANG KELUAR (PENJUALAN & RETUR)
// ==========================================
export const penjualan = pgTable(
  "penjualan",
  {
    id: serial("id").primaryKey(),
    kode: varchar("kode", { length: 50 }).notNull().unique(),
    operatorId: integer("operator_id")
      .notNull()
      .references(() => pengguna.id, { onDelete: "restrict" }),
    marketplaceId: integer("marketplace_id").references(() => marketplace.id, {
      onDelete: "restrict",
    }),
    totalPaket: integer("total_paket").notNull().default(0),
    totalKuantitas: integer("total_kuantitas").notNull().default(0),
    totalBiayaLayanan: numeric("total_biaya_layanan", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0.00"),
    totalKeseluruhan: numeric("total_keseluruhan", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    totalHpp: numeric("total_hpp", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    dibuatPada: timestamp("dibuat_pada").$defaultFn(getWaktuJakarta),
  },
  (table) => {
    return {
      marketplaceIdIdx: index("penjualan_marketplace_id_idx").on(
        table.marketplaceId,
      ),
    };
  },
);

export const itemPenjualan = pgTable(
  "item_penjualan",
  {
    id: serial("id").primaryKey(),
    headerId: integer("header_id")
      .notNull()
      .references(() => penjualan.id, { onDelete: "cascade" }),
    varianId: integer("varian_id")
      .notNull()
      .references(() => varianProduk.id, { onDelete: "restrict" }),
    nomorResi: varchar("nomor_resi", { length: 100 }),
    jenisEkspedisi: varchar("jenis_ekspedisi", { length: 100 }),
    kuantitas: integer("kuantitas").notNull(),
    harga: numeric("harga", { precision: 12, scale: 2 }).notNull(),
    biayaLayanan: numeric("biaya_layanan", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    subtotalBiayaLayanan: numeric("subtotal_biaya_layanan", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0.00"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    subtotalHpp: numeric("subtotal_hpp", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
  },
  (table) => {
    return {
      headerIdIdx: index("item_penjualan_header_id_idx").on(table.headerId),
      varianIdIdx: index("item_penjualan_varian_id_idx").on(table.varianId),
      nomorResiIdx: index("nomor_resi_keluar_idx").on(table.nomorResi), // Index pencarian resi
    };
  },
);

export const retur = pgTable("retur", {
  id: serial("id").primaryKey(),
  kode: varchar("kode", { length: 50 }).notNull().unique(),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => pengguna.id, { onDelete: "restrict" }),
  catatan: varchar("catatan", { length: 255 }),
  totalPaket: integer("total_paket").notNull().default(0),
  totalKuantitas: integer("total_kuantitas").notNull().default(0),
  totalBiayaLayanan: numeric("total_biaya_layanan", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  totalKeseluruhan: numeric("total_keseluruhan", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  totalHpp: numeric("total_hpp", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  dibuatPada: timestamp("dibuat_pada").$defaultFn(getWaktuJakarta),
});

export const itemRetur = pgTable(
  "item_retur",
  {
    id: serial("id").primaryKey(),
    headerId: integer("header_id")
      .notNull()
      .references(() => retur.id, { onDelete: "cascade" }),
    itemPenjualanId: integer("item_penjualan_id")
      .notNull()
      .references(() => itemPenjualan.id, { onDelete: "restrict" }), // Relasi langsung ke Barang Keluar
    varianId: integer("varian_id")
      .notNull()
      .references(() => varianProduk.id, { onDelete: "restrict" }),
    kuantitasHarapan: integer("kuantitas_harapan").notNull().default(0),
    kuantitasAktual: integer("kuantitas_aktual").notNull().default(0),
    harga: numeric("harga", { precision: 12, scale: 2 }).notNull(),
    biayaLayanan: numeric("biaya_layanan", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    subtotalBiayaLayanan: numeric("subtotal_biaya_layanan", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0.00"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    subtotalHpp: numeric("subtotal_hpp", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
  },
  (table) => {
    return {
      headerIdIdx: index("item_retur_header_id_idx").on(table.headerId),
      itemPenjualanIdIdx: index("item_retur_item_penjualan_id_idx").on(
        table.itemPenjualanId,
      ),
      varianIdIdx: index("item_retur_varian_id_idx").on(table.varianId),
    };
  },
);

export const penyesuaianStok = pgTable("penyesuaian_stok", {
  id: serial("id").primaryKey(),
  kode: varchar("kode", { length: 50 }).notNull().unique(),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => pengguna.id, { onDelete: "restrict" }),
  totalKuantitas: integer("total_kuantitas").notNull().default(0),
  totalKeseluruhan: numeric("total_keseluruhan", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  catatan: varchar("catatan", { length: 255 }),
  dibuatPada: timestamp("dibuat_pada").$defaultFn(getWaktuJakarta),
});

export const itemPenyesuaianStok = pgTable(
  "item_penyesuaian_stok",
  {
    id: serial("id").primaryKey(),
    headerId: integer("header_id")
      .notNull()
      .references(() => penyesuaianStok.id, { onDelete: "cascade" }),
    varianId: integer("varian_id")
      .notNull()
      .references(() => varianProduk.id, { onDelete: "restrict" }),
    kuantitas: integer("kuantitas").notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
  },
  (table) => {
    return {
      headerIdIdx: index("item_adj_header_id_idx").on(table.headerId),
      varianIdIdx: index("item_adj_varian_id_idx").on(table.varianId),
    };
  },
);

export const pergerakanStok = pgTable(
  "pergerakan_stok",
  {
    id: serial("id").primaryKey(),
    varianId: integer("varian_id")
      .notNull()
      .references(() => varianProduk.id, { onDelete: "cascade" }),
    jenis: varchar("jenis", { length: 50 }).notNull(), // "MASUK", "KELUAR", "OPNAME"
    kuantitas: integer("kuantitas").notNull(),
    nomorReferensi: varchar("nomor_referensi", { length: 50 }),
    namaOperator: varchar("nama_operator", { length: 100 }),
    nilaiArusKas: numeric("nilai_arus_kas", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    dibuatPada: timestamp("dibuat_pada").defaultNow(),
  },
  (table) => {
    return {
      varianIdIdx: index("pergerakan_stok_varian_id_idx").on(table.varianId),
    };
  },
);

// ==========================================
// DRIZZLE RELATIONS (TERJEMAHAN)
// ==========================================

export const relasiBahanBaku = relations(bahanBaku, ({ one, many }) => ({
  satuan: one(satuan, {
    fields: [bahanBaku.satuanDasarId],
    references: [satuan.id],
  }),
  warna: one(warna, {
    fields: [bahanBaku.warnaId],
    references: [warna.id],
  }),
  inventaris: many(inventarisBahanBaku),
}));

export const relasiProduk = relations(produk, ({ many }) => ({
  varian: many(varianProduk),
}));

export const relasiVarianProduk = relations(varianProduk, ({ one, many }) => ({
  produk: one(produk, {
    fields: [varianProduk.produkId],
    references: [produk.id],
  }),
  warna: one(warna, {
    fields: [varianProduk.warnaId],
    references: [warna.id],
  }),
  ukuran: one(ukuran, {
    fields: [varianProduk.ukuranId],
    references: [ukuran.id],
  }),
  bom: one(bom, {
    fields: [varianProduk.id],
    references: [bom.varianId],
  }),
  pergerakanStok: many(pergerakanStok),
}));

export const relasiBom = relations(bom, ({ one, many }) => ({
  varian: one(varianProduk, {
    fields: [bom.varianId],
    references: [varianProduk.id],
  }),
  itemBom: many(itemBom),
}));

export const relasiItemBom = relations(itemBom, ({ one }) => ({
  bom: one(bom, {
    fields: [itemBom.bomId],
    references: [bom.id],
  }),
  bahanBaku: one(bahanBaku, {
    fields: [itemBom.bahanBakuId],
    references: [bahanBaku.id],
  }),
  satuan: one(satuan, {
    fields: [itemBom.satuanId],
    references: [satuan.id],
  }),
}));

export const relasiPesananManufaktur = relations(
  pesananManufaktur,
  ({ one, many }) => ({
    operator: one(pengguna, {
      fields: [pesananManufaktur.operatorId],
      references: [pengguna.id],
    }),
    item: many(itemPesananManufaktur),
  }),
);

export const relasiItemPesananManufaktur = relations(
  itemPesananManufaktur,
  ({ one, many }) => ({
    header: one(pesananManufaktur, {
      fields: [itemPesananManufaktur.moId],
      references: [pesananManufaktur.id],
    }),
    varian: one(varianProduk, {
      fields: [itemPesananManufaktur.varianId],
      references: [varianProduk.id],
    }),
    bahan: many(bahanPesananManufaktur),
  }),
);

export const relasiBahanPesananManufaktur = relations(
  bahanPesananManufaktur,
  ({ one }) => ({
    itemMo: one(itemPesananManufaktur, {
      fields: [bahanPesananManufaktur.moItemId],
      references: [itemPesananManufaktur.id],
    }),
    bahanBaku: one(bahanBaku, {
      fields: [bahanPesananManufaktur.bahanBakuId],
      references: [bahanBaku.id],
    }),
  }),
);

export const relasiProduksiMasuk = relations(
  produksiMasuk,
  ({ one, many }) => ({
    pesananManufaktur: one(pesananManufaktur, {
      fields: [produksiMasuk.pesananManufakturId],
      references: [pesananManufaktur.id],
    }),
    operator: one(pengguna, {
      fields: [produksiMasuk.operatorId],
      references: [pengguna.id],
    }),
    item: many(itemProduksiMasuk),
  }),
);

export const relasiTerimaBahan = relations(terimaBahan, ({ one, many }) => ({
  pesananPembelian: one(pesananPembelian, {
    fields: [terimaBahan.pesananPembelianId],
    references: [pesananPembelian.id],
  }),
  operator: one(pengguna, {
    fields: [terimaBahan.operatorId],
    references: [pengguna.id],
  }),
  item: many(itemTerimaBahan),
}));

export const relasiGajiBoronganJahit = relations(
  gajiBoronganJahit,
  ({ one, many }) => ({
    operator: one(pengguna, {
      fields: [gajiBoronganJahit.operatorId],
      references: [pengguna.id],
    }),
    karyawan: one(karyawan, {
      fields: [gajiBoronganJahit.karyawanId],
      references: [karyawan.id],
    }),
    item: many(itemGajiBoronganJahit),
  }),
);

export const relasiItemGajiBoronganJahit = relations(
  itemGajiBoronganJahit,
  ({ one }) => ({
    header: one(gajiBoronganJahit, {
      fields: [itemGajiBoronganJahit.headerId],
      references: [gajiBoronganJahit.id],
    }),
    produk: one(produk, {
      fields: [itemGajiBoronganJahit.produkId],
      references: [produk.id],
    }),
  }),
);

export const relasiRetur = relations(retur, ({ one, many }) => ({
  operator: one(pengguna, {
    fields: [retur.operatorId],
    references: [pengguna.id],
  }),
  item: many(itemRetur),
}));

export const relasiItemRetur = relations(itemRetur, ({ one }) => ({
  header: one(retur, {
    fields: [itemRetur.headerId],
    references: [retur.id],
  }),
  varian: one(varianProduk, {
    fields: [itemRetur.varianId],
    references: [varianProduk.id],
  }),
  itemPenjualanAsli: one(itemPenjualan, {
    fields: [itemRetur.itemPenjualanId],
    references: [itemPenjualan.id],
  }),
}));
   