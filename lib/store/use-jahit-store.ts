// lib/store/use-jahit-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface JahitItem {
  produkId: number;
  namaProduk: string;
  harga: number;
  qty: number;
  subtotal: number;
}

interface JahitState {
  karyawanId: string;
  karyawanNama: string; // BARU: Simpan nama agar tampil di input live search saat refresh
  items: JahitItem[];
  setKaryawan: (id: string, nama: string) => void;
  addItem: (item: JahitItem) => void;
  updateQty: (produkId: number, qty: number) => void;
  removeItem: (produkId: number) => void;
  clearForm: () => void;
}

export const useJahitStore = create<JahitState>()(
  persist(
    (set) => ({
      karyawanId: "",
      karyawanNama: "",
      items: [],
      setKaryawan: (id, nama) => set({ karyawanId: id, karyawanNama: nama }),
      addItem: (newItem) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.produkId === newItem.produkId,
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.produkId === newItem.produkId
                  ? {
                      ...item,
                      qty: item.qty + 1,
                      subtotal: (item.qty + 1) * item.harga,
                    }
                  : item,
              ),
            };
          }
          return { items: [...state.items, newItem] };
        }),
      updateQty: (produkId, qty) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.produkId === produkId
              ? { ...item, qty: qty, subtotal: qty * item.harga }
              : item,
          ),
        })),
      removeItem: (produkId) =>
        set((state) => ({
          items: state.items.filter((item) => item.produkId !== produkId),
        })),
      clearForm: () => set({ karyawanId: "", karyawanNama: "", items: [] }),
    }),
    {
      name: "draft-payroll-jahit",
    },
  ),
);
