import { create } from "zustand";

export const usePrice = create<{
  price: number;
  setPrice: (price: number) => void;
}>((set) => ({
  price: 0,
  setPrice: (price) => set({ price }),
}));
