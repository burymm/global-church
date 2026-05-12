import { create } from 'zustand';

export const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

interface InstallState {
  showInstallPrompt: boolean;
  triggerInstall: () => void;
  dismissInstall: () => void;
}

export const useInstallStore = create<InstallState>((set) => ({
  showInstallPrompt: false,
  triggerInstall: () => set({ showInstallPrompt: true }),
  dismissInstall: () => set({ showInstallPrompt: false }),
}));
