import { create } from 'zustand';

interface ProfileState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
