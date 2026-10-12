import { create } from 'zustand';
export const useInputStore = create<{
  shotCharge: number | null;
  setShotCharge: (charge: number | null) => void;
}>((set) => ({
  shotCharge: null,
  setShotCharge: (shotCharge) => set({ shotCharge }),
}));

